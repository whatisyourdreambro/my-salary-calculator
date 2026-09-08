-- Apply after 0001_private_contact.sql, separately to preview and production D1.
-- Adds fixed private feedback only; existing contact and rate tables stay intact.
CREATE TABLE IF NOT EXISTS helpfulness_feedback (
  submission_id TEXT PRIMARY KEY NOT NULL,
  payload_hash TEXT NOT NULL,
  target TEXT NOT NULL CHECK (target IN ('samsung_bonus','civil_pay_2027','samsung_company')),
  page_path TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('helpful','confusing')),
  reason_code TEXT,
  consent_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','resolved','spam')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  resolved_at INTEGER,
  CHECK (expires_at > created_at),
  CHECK (
    (target = 'samsung_bonus' AND page_path = '/calc/samsung-bonus') OR
    (target = 'civil_pay_2027' AND page_path = '/civil-servant-pay-2027') OR
    (target = 'samsung_company' AND page_path = '/salary-db/samsung-electronics')
  ),
  CHECK (
    (vote = 'helpful' AND reason_code IS NULL) OR
    (vote = 'confusing' AND reason_code IS NOT NULL AND (
      (target = 'samsung_bonus' AND reason_code IN ('input_method','calculation_explanation','source_date','missing_information')) OR
      (target = 'civil_pay_2027' AND reason_code IN ('forecast_status','pay_components','source_date','missing_information')) OR
      (target = 'samsung_company' AND reason_code IN ('salary_basis','estimate_vs_disclosure','source_date','missing_information'))
    ))
  )
);
CREATE INDEX IF NOT EXISTS helpfulness_feedback_queue ON helpfulness_feedback(status, created_at);
CREATE INDEX IF NOT EXISTS helpfulness_feedback_expiry ON helpfulness_feedback(expires_at);
CREATE INDEX IF NOT EXISTS helpfulness_feedback_target_time ON helpfulness_feedback(target, created_at);
