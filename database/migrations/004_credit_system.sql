CREATE TABLE IF NOT EXISTS credit_balances (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_credits NUMERIC(14, 4) NOT NULL DEFAULT 0 CHECK (balance_credits >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_model_prices (
  model_key TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  input_credits_per_token NUMERIC(14, 8) NOT NULL DEFAULT 0 CHECK (input_credits_per_token >= 0),
  output_credits_per_token NUMERIC(14, 8) NOT NULL DEFAULT 0 CHECK (output_credits_per_token >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model_key TEXT REFERENCES ai_model_prices(model_key) ON DELETE SET NULL,
  delta_credits NUMERIC(14, 4) NOT NULL,
  balance_after NUMERIC(14, 4) NOT NULL CHECK (balance_after >= 0),
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_ledger_user_created_idx
  ON credit_ledger (user_id, created_at DESC);

INSERT INTO ai_model_prices (model_key, display_name, input_credits_per_token, output_credits_per_token)
VALUES
  ('botjob-default', 'BotJob Default', 0.001, 0.002),
  ('gpt-4.1-mini', 'GPT 4.1 Mini', 0.001, 0.004)
ON CONFLICT (model_key) DO NOTHING;
