-- Run against the selected FEEDBACK_DB D1 database, separately for preview/production.
CREATE TABLE IF NOT EXISTS contact_inquiries (
  submission_id TEXT PRIMARY KEY NOT NULL,
  payload_hash TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('calculation_error','explanation','data_correction','business','privacy','other')),
  page_path TEXT NOT NULL,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 500),
  reply_email TEXT,
  reply_consent INTEGER NOT NULL DEFAULT 0 CHECK (reply_consent IN (0,1)),
  consent_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','resolved','spam')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  resolved_at INTEGER,
  CHECK ((reply_email IS NULL AND reply_consent = 0) OR (reply_email IS NOT NULL AND reply_consent = 1)),
  CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS contact_inquiries_queue ON contact_inquiries(status, created_at);
CREATE INDEX IF NOT EXISTS contact_inquiries_expiry ON contact_inquiries(expires_at);

-- No raw IPs, inquiry body, email or receipt IDs in this short-lived abuse table.
-- Keys are HMAC(secret, scope + fixed 10-minute window + Cloudflare client IP).
-- expires_at is a cleanup deadline, not an automatic deletion mechanism.
CREATE TABLE IF NOT EXISTS feedback_rate_limits (
  bucket_key TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts BETWEEN 1 AND 5)
);
CREATE INDEX IF NOT EXISTS feedback_rate_limits_expiry ON feedback_rate_limits(expires_at);
