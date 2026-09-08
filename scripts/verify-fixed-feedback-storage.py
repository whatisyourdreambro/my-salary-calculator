"""Execute the actual feedback migration/SQL in isolated SQLite, never remote D1.

Run: python scripts/verify-fixed-feedback-storage.py
Uses only the standard library; does not read bindings, network or private rows.
"""
import concurrent.futures
import hashlib
import hmac
import pathlib
import re
import sqlite3
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTACT_SCHEMA = (ROOT / "migrations/0001_private_contact.sql").read_text(encoding="utf-8")
FEEDBACK_SCHEMA = (ROOT / "migrations/0002_fixed_feedback.sql").read_text(encoding="utf-8")


def statements(name):
    source = (ROOT / f"src/lib/server/{name}.ts").read_text(encoding="utf-8")
    return dict(re.findall(r"(\w+):\s*`([^`]+)`", source, re.S))


FEEDBACK_SQL = statements("fixedFeedbackSql")
CONTACT_SQL = statements("contactSql")
assert set(FEEDBACK_SQL) == {"reserveRate", "insertFeedback", "receipt"}
RETENTION = 90 * 86400


def bucket_key(scope, window=0):
    message = "\0".join((scope, str(window), "192.0.2.1"))
    return hmac.new(b"isolated-test-secret-not-production", message.encode(), hashlib.sha256).hexdigest()


def batch(db, receipt, payload="hash-a", scope="feedback", window=0, changes=None):
    sql = FEEDBACK_SQL if scope == "feedback" else CONTACT_SQL
    try:
        db.execute("BEGIN IMMEDIATE")
        reserved = db.execute(sql["reserveRate"], (bucket_key(scope, window), window + 600, receipt, 5)).rowcount
        if scope == "feedback":
            fields = [receipt, payload, "samsung_bonus", "/calc/samsung-bonus", "helpful", None, "fixed-feedback-v1", 60, 60 + RETENTION]
            for index, value in (changes or {}).items():
                fields[index] = value
            inserted = db.execute(sql["insertFeedback"], fields).rowcount
        else:
            inserted = db.execute(sql["insertInquiry"], (
                receipt, payload, "other", "/", "Synthetic private inquiry", None, 0, "contact-v1", 60, 60 + RETENTION,
            )).rowcount
        row = db.execute(sql["receipt"], (receipt,)).fetchone()
        db.commit()
        return reserved, inserted, row
    except Exception:
        db.rollback()
        raise


db = sqlite3.connect(":memory:")
db.executescript(CONTACT_SCHEMA)
assert batch(db, "receipt-1", scope="contact") == (1, 1, ("hash-a",))
original_schema = db.execute("SELECT name, sql FROM sqlite_master WHERE name IN ('contact_inquiries', 'feedback_rate_limits') ORDER BY name").fetchall()
original_row = db.execute("SELECT * FROM contact_inquiries").fetchall()
db.executescript(FEEDBACK_SCHEMA)
db.executescript(FEEDBACK_SCHEMA)  # repeat provisioning is harmless
assert db.execute("SELECT name, sql FROM sqlite_master WHERE name IN ('contact_inquiries', 'feedback_rate_limits') ORDER BY name").fetchall() == original_schema
assert db.execute("SELECT * FROM contact_inquiries").fetchall() == original_row
assert batch(db, "receipt-1") == (1, 1, ("hash-a",))  # same UUID belongs to separate API scope
assert batch(db, "receipt-1") == (0, 0, ("hash-a",))
assert batch(db, "receipt-1", "changed-hash") == (0, 0, ("hash-a",))
assert db.execute("SELECT status, resolved_at, vote, reason_code FROM helpfulness_feedback").fetchone() == ("new", None, "helpful", None)
for number in range(2, 6):
    assert batch(db, f"receipt-{number}", scope="contact") == (1, 1, ("hash-a",))
    assert batch(db, f"receipt-{number}") == (1, 1, ("hash-a",))
assert batch(db, "receipt-6", scope="contact") == (0, 0, None)
assert batch(db, "receipt-6") == (0, 0, None)
assert batch(db, "receipt-1") == (0, 0, ("hash-a",))
assert db.execute("SELECT attempts FROM feedback_rate_limits ORDER BY bucket_key").fetchall() == [(5,), (5,)]
assert batch(db, "new-window", window=600) == (1, 1, ("hash-a",))

# DB constraints back up API target/path/reason pairing and null handling.
invalid = [
    {2: "another_page"}, {3: "/salary/60000000"}, {4: "public"},
    {5: "input_method"}, {4: "confusing", 5: None},
    {4: "confusing", 5: "salary_basis"}, {4: "confusing", 5: "free text"},
    {2: "civil_pay_2027", 3: "/civil-servant-pay-2027", 4: "confusing", 5: "input_method"},
    {2: "samsung_company", 3: "/salary-db/samsung-electronics", 4: "confusing", 5: "forecast_status"},
    {8: 60},
]
for number, change in enumerate(invalid):
    window = 1200 + number * 600
    try:
        batch(db, f"invalid-{number}", window=window, changes=change)
        raise AssertionError(f"Constraint accepted invalid case {number}")
    except sqlite3.IntegrityError:
        pass
    assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits WHERE bucket_key=?", (bucket_key("feedback", window),)).fetchone() == (0,)

targets = [
    ("samsung_bonus", "/calc/samsung-bonus", ["input_method", "calculation_explanation", "source_date", "missing_information"]),
    ("civil_pay_2027", "/civil-servant-pay-2027", ["forecast_status", "pay_components", "source_date", "missing_information"]),
    ("samsung_company", "/salary-db/samsung-electronics", ["salary_basis", "estimate_vs_disclosure", "source_date", "missing_information"]),
]
for index, (target, path, reasons) in enumerate(targets):
    for reason in reasons:
        assert batch(db, f"valid-{target}-{reason}", window=12000 + index * 600, changes={2: target, 3: path, 4: "confusing", 5: reason}) == (1, 1, ("hash-a",))

# A failed transaction must not burn a rate allowance.
db.execute("CREATE TRIGGER simulated_feedback_failure BEFORE INSERT ON helpfulness_feedback BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END")
try:
    batch(db, "failed", window=24000)
    raise AssertionError("Failure trigger did not abort")
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits WHERE bucket_key=?", (bucket_key("feedback", 24000),)).fetchone() == (0,)
db.execute("DROP TRIGGER simulated_feedback_failure")

# Private status changes and actual cleanup, without deleting contact data.
db.execute("UPDATE helpfulness_feedback SET status='resolved', resolved_at=100 WHERE submission_id='receipt-1'")
assert db.execute("SELECT status, resolved_at FROM helpfulness_feedback WHERE submission_id='receipt-1'").fetchone() == ("resolved", 100)
assert db.execute("SELECT COUNT(*) FROM helpfulness_feedback WHERE expires_at > ?", (60 + RETENTION,)).fetchone() == (0,)
assert db.execute("SELECT COUNT(*) FROM helpfulness_feedback").fetchone()[0] > 0
db.execute("DELETE FROM helpfulness_feedback WHERE expires_at <= ?", (60 + RETENTION,))
db.execute("DELETE FROM feedback_rate_limits WHERE expires_at <= ?", (60 + RETENTION,))
assert db.execute("SELECT COUNT(*) FROM helpfulness_feedback").fetchone() == (0,)
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits").fetchone() == (0,)
assert db.execute("SELECT COUNT(*) FROM contact_inquiries").fetchone() == (5,)
db.close()

# Actual SQLite writer serialization: 20 new submissions accept only five.
with tempfile.TemporaryDirectory(prefix="moneysalary-fixed-feedback-test-") as directory:
    path = pathlib.Path(directory) / "feedback.sqlite"
    connection = sqlite3.connect(path)
    connection.executescript(CONTACT_SCHEMA + FEEDBACK_SCHEMA)
    connection.close()

    def submit(number):
        connection = sqlite3.connect(path, timeout=10)
        try:
            return batch(connection, f"concurrent-{number}")
        finally:
            connection.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        outcomes = list(pool.map(submit, range(20)))
    assert sum(outcome[1] for outcome in outcomes) == 5
    assert sum(outcome[2] is None for outcome in outcomes) == 15
    connection = sqlite3.connect(path)
    assert connection.execute("SELECT attempts FROM feedback_rate_limits").fetchone() == (5,)
    assert connection.execute("SELECT COUNT(*) FROM helpfulness_feedback").fetchone() == (5,)
    assert connection.execute("SELECT COUNT(*) FROM contact_inquiries").fetchone() == (0,)
    connection.close()

print("PASS: actual migration/SQL, unchanged contact schema/rows, separate quotas, replay/conflict, 10 invalid and 12 valid reason cases, rollback, retention/status, 20 concurrent submissions (5 accepted).")
