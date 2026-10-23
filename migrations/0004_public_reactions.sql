-- Separate, explicit public-aggregate consent. Never copy old private feedback.
CREATE TABLE IF NOT EXISTS participation_reactions (
  submission_id TEXT PRIMARY KEY NOT NULL,
  payload_hash TEXT NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('samsung_bonus','civil_pay_2027','samsung_company')),
  vote TEXT NOT NULL CHECK (vote IN ('helpful','confusing')),
  reason_code TEXT,
  contract_version TEXT NOT NULL CHECK (contract_version = 'public-reaction-v1'),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL CHECK (expires_at > created_at),
  CHECK (
    (vote = 'helpful' AND reason_code IS NULL) OR
    (vote = 'confusing' AND reason_code IS NOT NULL AND (
      (target = 'samsung_bonus' AND reason_code IN ('input_method','calculation_explanation','source_date','missing_information')) OR
      (target = 'civil_pay_2027' AND reason_code IN ('forecast_status','pay_components','source_date','missing_information')) OR
      (target = 'samsung_company' AND reason_code IN ('salary_basis','estimate_vs_disclosure','source_date','missing_information'))
    ))
  )
);
CREATE INDEX IF NOT EXISTS participation_reactions_expiry ON participation_reactions(expires_at);
CREATE INDEX IF NOT EXISTS participation_reactions_target_time ON participation_reactions(target, created_at);
CREATE TABLE IF NOT EXISTS participation_snapshots (
  target TEXT PRIMARY KEY NOT NULL CHECK (target IN ('samsung_bonus','civil_pay_2027','samsung_company')),
  contract_version TEXT NOT NULL CHECK (contract_version = 'public-reaction-v1'),
  generated_at INTEGER NOT NULL CHECK (generated_at > 0),
  window_days INTEGER NOT NULL CHECK (window_days = 28),
  total INTEGER NOT NULL CHECK (total >= 0),
  helpful INTEGER NOT NULL CHECK (helpful >= 0),
  confusing INTEGER NOT NULL CHECK (confusing >= 0),
  CHECK (total = helpful + confusing)
);
