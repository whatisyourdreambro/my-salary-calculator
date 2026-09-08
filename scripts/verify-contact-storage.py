"""Exercise the actual D1 SQLite schema/statements locally without remote data.

Run: python scripts/verify-contact-storage.py
Uses only Python's standard library and isolated temporary test databases.
"""
import concurrent.futures
import pathlib
import re
import sqlite3
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCHEMA = (ROOT / "migrations/0001_private_contact.sql").read_text(encoding="utf-8")
SOURCE = (ROOT / "src/lib/server/contactSql.ts").read_text(encoding="utf-8")
SQL = dict(re.findall(r"(\w+):\s*`([^`]+)`", SOURCE, re.S))
assert set(SQL) == {"reserveRate", "insertInquiry", "receipt"}


def batch(db, receipt, payload="hash-a", bucket="hmac-bucket", limit=5):
    try:
        db.execute("BEGIN IMMEDIATE")
        reserved = db.execute(SQL["reserveRate"], (bucket, 600, receipt, limit)).rowcount
        inserted = db.execute(SQL["insertInquiry"], (
            receipt, payload, "other", "/", "Private synthetic question", None, 0, "contact-v1", 60, 60 + 90 * 86400,
        )).rowcount
        row = db.execute(SQL["receipt"], (receipt,)).fetchone()
        db.commit()
        return reserved, inserted, row
    except Exception:
        db.rollback()
        raise


db = sqlite3.connect(":memory:")
db.executescript(SCHEMA)
assert batch(db, "receipt-1") == (1, 1, ("hash-a",))
assert batch(db, "receipt-1") == (0, 0, ("hash-a",))
assert batch(db, "receipt-1", "different-hash") == (0, 0, ("hash-a",))
assert db.execute("SELECT attempts FROM feedback_rate_limits").fetchone() == (1,)
assert db.execute("SELECT status, resolved_at, reply_email FROM contact_inquiries").fetchone() == ("new", None, None)
for number in range(2, 6):
    assert batch(db, f"receipt-{number}") == (1, 1, ("hash-a",))
assert batch(db, "receipt-6") == (0, 0, None)
assert batch(db, "receipt-1") == (0, 0, ("hash-a",))
assert batch(db, "receipt-new-window", bucket="different-window-hmac") == (1, 1, ("hash-a",))
assert db.execute("SELECT COUNT(*) FROM contact_inquiries").fetchone() == (6,)

# A failed write rolls back the rate reservation, not just the question INSERT.
db.execute("CREATE TRIGGER simulated_failure BEFORE INSERT ON contact_inquiries BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END")
try:
    batch(db, "failed-receipt", bucket="failed-bucket")
    raise AssertionError("Failure trigger did not abort")
except sqlite3.IntegrityError:
    pass
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits WHERE bucket_key='failed-bucket'").fetchone() == (0,)
db.execute("DROP TRIGGER simulated_failure")

# Operator cleanup is actual deletion; expires_at alone does not delete anything.
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits WHERE expires_at <= 601").fetchone() == (2,)
db.execute("DELETE FROM feedback_rate_limits WHERE expires_at <= ?", (601,))
assert db.execute("SELECT COUNT(*) FROM feedback_rate_limits").fetchone() == (0,)
db.execute("DELETE FROM contact_inquiries WHERE expires_at <= ?", (60 + 90 * 86400,))
assert db.execute("SELECT COUNT(*) FROM contact_inquiries").fetchone() == (0,)
db.close()

# Concurrent writers must not turn the read/check/write limit into >5 accepted rows.
with tempfile.TemporaryDirectory(prefix="moneysalary-contact-test-") as directory:
    path = pathlib.Path(directory) / "contact-test.sqlite"
    connection = sqlite3.connect(path)
    connection.executescript(SCHEMA)
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
    assert connection.execute("SELECT COUNT(*) FROM contact_inquiries").fetchone() == (5,)
    connection.close()

print("PASS: real SQLite persistence, replay, conflict preservation, rate limit, rollback, cleanup, 20 concurrent submissions (5 accepted).")
