-- Additive only. Do not enable the API until runtime and scheduled cleanup are verified.
CREATE TABLE IF NOT EXISTS private_opinions (
  submission_id TEXT PRIMARY KEY NOT NULL,
  payload_hash TEXT NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('samsung_bonus','civil_pay_2027','samsung_company')),
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 200),
  contract_version TEXT NOT NULL CHECK (contract_version = 'private-opinion-v1'),
  policy_version TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS private_opinions_expiry ON private_opinions(expires_at);
-- No seeded healthy row. A successful cleanup transaction must establish this.
CREATE TABLE IF NOT EXISTS participation_health (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  last_cleanup_at INTEGER NOT NULL CHECK (last_cleanup_at > 0)
);
-- Accepted writes only; no private content, IP, receipt IDs or rejection rows.
CREATE TABLE IF NOT EXISTS participation_daily_usage (
  module TEXT NOT NULL CHECK (module IN ('opinion','reaction')),
  day_start INTEGER NOT NULL,
  accepted INTEGER NOT NULL CHECK (accepted > 0),
  PRIMARY KEY (module, day_start)
);
