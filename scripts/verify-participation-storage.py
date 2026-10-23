"""Offline SQLite checks against the real participation schema and SQL.

Uses synthetic local data only. Does not read remote bindings or visitor data.
"""
import concurrent.futures
import pathlib
import re
import sqlite3
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCHEMA = "\n".join((ROOT / name).read_text(encoding="utf-8") for name in (
    "migrations/0001_private_contact.sql", "migrations/0002_fixed_feedback.sql",
    "migrations/0003_private_opinions.sql", "migrations/0004_public_reactions.sql"))


def statements(name):
    source = (ROOT / f"src/lib/server/{name}.ts").read_text(encoding="utf-8")
    sql = dict(re.findall(r"(\w+):\s*`([^`]+)`", source, re.S))
    constants = dict(re.findall(r'export const (\w+)\s*=\s*"([^"\r\n]+)";', source))
    for key, alias in re.findall(r"(\w+):\s*([A-Z][A-Z0-9_]+)\s*,", source):
        sql[key] = constants[alias]  # Explicit exports only; no JS evaluation.
    return sql


SQL = statements("opinionSql")
assert set(SQL) == {"reserveRate", "insertOpinion", "countAccepted", "receipt"}
NOW = 1800000000
DAY = NOW // 86400 * 86400
OPINION_RECEIPT = ("hash", "private-opinion-v1", NOW + 90 * 86400)
REACTION_RECEIPT = ("hash", "public-reaction-v1", NOW + 90 * 86400)


def submit(db, receipt, bucket="opaque-hmac", daily=100, payload="hash"):
    try:
        db.execute("BEGIN IMMEDIATE")
        reserved = db.execute(SQL["reserveRate"], (
            bucket, NOW + 600, receipt, NOW - 26 * 3600, NOW, DAY, daily, 3)).rowcount
        inserted = db.execute(SQL["insertOpinion"], (
            receipt, payload, "samsung_bonus", "Synthetic private opinion", "private-opinion-v1",
            "ko-input-v1", NOW, NOW + 90 * 86400)).rowcount
        counted = db.execute(SQL["countAccepted"], (DAY,)).rowcount
        row = db.execute(SQL["receipt"], (receipt,)).fetchone()
        db.commit()
        return reserved, inserted, counted, row
    except Exception:
        db.rollback()
        raise


db = sqlite3.connect(":memory:")
db.executescript(SCHEMA)
# No synthetic "healthy" seed means uninitialized/stale/future cleanup blocks writes.
for cleanup in (None, NOW - 26 * 3600 - 1, NOW - 26 * 3600, NOW + 1):
    if cleanup is not None:
        db.execute("INSERT OR REPLACE INTO participation_health VALUES (1, ?)", (cleanup,))
        db.commit()
    assert submit(db, "closed") == (0, 0, 0, None)
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits").fetchone() == (0,)
db.execute("UPDATE participation_health SET last_cleanup_at=? WHERE id=1", (NOW - 26 * 3600 + 1,))
db.commit()
assert submit(db, "one") == (1, 1, 1, OPINION_RECEIPT)
assert submit(db, "one") == (0, 0, 0, OPINION_RECEIPT)
assert submit(db, "one", payload="conflict") == (0, 0, 0, OPINION_RECEIPT)
before_lookup = db.total_changes
assert db.execute(SQL["receipt"], ("one",)).fetchone() == OPINION_RECEIPT
assert db.total_changes == before_lookup
assert submit(db, "two")[1] == 1
assert submit(db, "three")[1] == 1
assert submit(db, "four") == (0, 0, 0, None)
assert db.execute("SELECT attempts FROM feedback_rate_limits").fetchone() == (3,)
assert db.execute("SELECT accepted FROM participation_daily_usage").fetchone() == (3,)
# The global daily cap also rejects new IP buckets without a rejection row.
assert submit(db, "daily-reject", bucket="new-hmac", daily=3) == (0, 0, 0, None)
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits").fetchone() == (1,)
# Failure in any later write rolls back rate reservation, private write and counter.
db.execute("CREATE TRIGGER fail_count BEFORE UPDATE ON participation_daily_usage BEGIN SELECT RAISE(ABORT, 'synthetic'); END")
try:
    submit(db, "failed", bucket="failed-hmac")
    raise AssertionError("Expected rollback")
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT COUNT(*) FROM private_opinions WHERE submission_id='failed'").fetchone() == (0,)
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits WHERE bucket_key='failed-hmac'").fetchone() == (0,)
db.execute("DROP TRIGGER fail_count")
# Expiry alone does nothing; successful cleanup must delete rows explicitly.
db.execute("DELETE FROM private_opinions WHERE expires_at <= ?", (NOW + 90 * 86400,))
assert db.execute("SELECT COUNT(*) FROM private_opinions").fetchone() == (0,)
db.close()

with tempfile.TemporaryDirectory(prefix="moneysalary-participation-test-") as directory:
    path = pathlib.Path(directory) / "participation.sqlite"
    connection = sqlite3.connect(path)
    connection.executescript(SCHEMA)
    connection.execute("INSERT INTO participation_health VALUES (1, ?)", (NOW,))
    connection.commit()
    connection.close()

    def submit_concurrent(number):
        connection = sqlite3.connect(path, timeout=10)
        try:
            return submit(connection, f"concurrent-{number}", bucket=f"bucket-{number}", daily=7)
        finally:
            connection.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        outcomes = list(pool.map(submit_concurrent, range(24)))
    assert sum(outcome[1] for outcome in outcomes) == 7
    connection = sqlite3.connect(path)
    assert connection.execute("SELECT COUNT(*) FROM private_opinions").fetchone() == (7,)
    assert connection.execute("SELECT COUNT(*) FROM feedback_rate_limits").fetchone() == (7,)
    assert connection.execute("SELECT accepted FROM participation_daily_usage").fetchone() == (7,)
    connection.close()

print("PASS: private opinions, replay, conflict, IP/global limits, health gate, atomic rollback, expiry, 24 concurrent writes capped at 7.")

REACTIONS = statements("reactionSql")
MAINTENANCE = statements("participationMaintenanceSql")


def react(db, receipt, bucket="reaction-hmac", limit=1000):
    try:
        db.execute("BEGIN IMMEDIATE")
        reserve = db.execute(REACTIONS["reserveRate"], (bucket, NOW + 600, receipt, NOW - 26 * 3600, NOW, DAY, limit, 5)).rowcount
        insert = db.execute(REACTIONS["insertReaction"], (receipt, "hash", "samsung_bonus", "helpful", None, "public-reaction-v1", NOW, NOW + 90 * 86400)).rowcount
        count = db.execute(REACTIONS["countAccepted"], (DAY,)).rowcount
        row = db.execute(REACTIONS["receipt"], (receipt,)).fetchone()
        db.commit()
        return reserve, insert, count, row
    except Exception:
        db.rollback()
        raise


def maintain(db):
    try:
        db.execute("BEGIN IMMEDIATE")
        for name in ("deleteContact", "deletePrivateFeedback", "deleteOpinions", "deleteReactions", "deleteRate"):
            db.execute(MAINTENANCE[name], (NOW,))
        db.execute(MAINTENANCE["deleteDailyUsage"], (DAY - 90 * 86400,))
        for target in ("samsung_bonus", "civil_pay_2027", "samsung_company"):
            db.execute(MAINTENANCE["snapshot"], (target, NOW, target, NOW - 28 * 86400, NOW, NOW))
        db.execute(MAINTENANCE["health"], (NOW,))
        db.commit()
    except Exception:
        db.rollback()
        raise


db = sqlite3.connect(":memory:")
db.executescript(SCHEMA)
for cleanup in (NOW - 26 * 3600, NOW - 26 * 3600 - 1, NOW + 1):
    db.execute("INSERT OR REPLACE INTO participation_health VALUES (1, ?)", (cleanup,))
    db.commit()
    assert react(db, "closed-reaction") == (0, 0, 0, None)
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits").fetchone() == (0,)
db.execute("DELETE FROM participation_health")
db.execute("INSERT INTO participation_health VALUES (1, ?)", (NOW - 100,))
db.commit()
for number in range(5):
    assert react(db, f"ip-{number}")[1] == 1
assert react(db, "ip-rejected") == (0, 0, 0, None)
assert react(db, "ip-0") == (0, 0, 0, REACTION_RECEIPT)
before_lookup = db.total_changes
assert db.execute(REACTIONS["receipt"], ("ip-0",)).fetchone() == REACTION_RECEIPT
assert db.total_changes == before_lookup
for number in range(5):
    assert react(db, f"other-{number}", bucket=f"other-{number}", limit=10)[1] == 1
assert react(db, "daily-reject", bucket="daily-rejected-hmac", limit=10) == (0, 0, 0, None)
assert db.execute("SELECT accepted FROM participation_daily_usage WHERE module='reaction'").fetchone() == (10,)
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits WHERE bucket_key='daily-rejected-hmac'").fetchone() == (0,)
# Raw old private feedback remains unrelated to public snapshots.
db.execute("INSERT INTO helpfulness_feedback (submission_id,payload_hash,target,page_path,vote,reason_code,consent_version,created_at,expires_at) VALUES ('old-private','hash','samsung_bonus','/calc/samsung-bonus','helpful',NULL,'fixed-feedback-v1',?,?)", (NOW, NOW + 90 * 86400))
db.execute("INSERT INTO contact_inquiries (submission_id,payload_hash,inquiry_type,page_path,body,consent_version,created_at,expires_at) VALUES ('expired-contact','hash','privacy','/contact','Synthetic private request','contact-v1',?,?)", (NOW - 90 * 86400, NOW))
db.execute("INSERT INTO private_opinions VALUES ('expired-opinion','hash','samsung_bonus','Synthetic private opinion','private-opinion-v1','ko-input-v1',?,?)", (NOW - 90 * 86400, NOW))
db.execute("INSERT INTO participation_reactions VALUES ('expired-reaction','hash','samsung_bonus','helpful',NULL,'public-reaction-v1',?,?)", (NOW - 90 * 86400, NOW))
# Current rows beyond the snapshot window and future rows must not count.
for receipt, timestamp in (("window-boundary", NOW - 28 * 86400), ("future-row", NOW + 1)):
    db.execute("INSERT INTO participation_reactions VALUES (?, 'hash', 'samsung_bonus', 'helpful', NULL, 'public-reaction-v1', ?, ?)", (receipt, timestamp, NOW + 90 * 86400))
db.commit()
# A failed snapshot restores deleted rows and does not refresh health.
db.execute("CREATE TRIGGER fail_snapshot BEFORE INSERT ON participation_snapshots BEGIN SELECT RAISE(ABORT, 'synthetic'); END")
try:
    maintain(db)
    raise AssertionError("Expected atomic maintenance rollback")
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT COUNT(*) FROM contact_inquiries WHERE submission_id='expired-contact'").fetchone() == (1,)
assert db.execute("SELECT last_cleanup_at FROM participation_health").fetchone() == (NOW - 100,)
db.execute("DROP TRIGGER fail_snapshot")
maintain(db)
assert db.execute("SELECT total,helpful,confusing FROM participation_snapshots WHERE target='samsung_bonus'").fetchone() == (10, 10, 0)
assert db.execute("SELECT total FROM participation_snapshots WHERE target='civil_pay_2027'").fetchone() == (0,)
assert db.execute("SELECT COUNT(*) FROM helpfulness_feedback").fetchone() == (1,)
assert db.execute("SELECT COUNT(*) FROM contact_inquiries").fetchone() == (0,)
assert db.execute("SELECT COUNT(*) FROM private_opinions").fetchone() == (0,)
assert db.execute("SELECT COUNT(*) FROM participation_reactions WHERE submission_id='expired-reaction'").fetchone() == (0,)
assert db.execute("SELECT last_cleanup_at FROM participation_health").fetchone() == (NOW,)
db.close()
print("PASS: public reaction limits/replay, separate consent schema, 28-day boundaries, old-private exclusion, cleanup rollback, snapshots and health commit.")

with tempfile.TemporaryDirectory(prefix="moneysalary-reaction-test-") as directory:
    path = pathlib.Path(directory) / "reactions.sqlite"
    connection = sqlite3.connect(path)
    connection.executescript(SCHEMA)
    connection.execute("INSERT INTO participation_health VALUES (1, ?)", (NOW,))
    connection.commit()
    connection.close()

    def react_concurrent(number):
        connection = sqlite3.connect(path, timeout=10)
        try:
            return react(connection, f"concurrent-{number}", bucket=f"reaction-{number}", limit=7)
        finally:
            connection.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        outcomes = list(pool.map(react_concurrent, range(24)))
    assert sum(outcome[1] for outcome in outcomes) == 7
    connection = sqlite3.connect(path)
    assert connection.execute("SELECT accepted FROM participation_daily_usage WHERE module='reaction'").fetchone() == (7,)
    assert connection.execute("SELECT COUNT(*) FROM participation_reactions").fetchone() == (7,)
    connection.close()
print("PASS: 24 concurrent public reactions accept exactly 7 at the shared daily cap.")
