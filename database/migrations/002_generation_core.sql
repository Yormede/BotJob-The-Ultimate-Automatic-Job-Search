CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('cv', 'cover_letter')),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  html_content TEXT,
  css_content TEXT,
  is_ats_one_column BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS templates_one_default_uq
  ON templates (user_id, kind)
  WHERE is_default = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS templates_user_kind_idx
  ON templates (user_id, kind, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS generation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  include_cv BOOLEAN NOT NULL DEFAULT true,
  include_cover_letter BOOLEAN NOT NULL DEFAULT true,
  include_approach_message BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (include_cv OR include_cover_letter OR include_approach_message),
  CHECK (finished_at IS NULL OR started_at IS NULL OR finished_at >= started_at)
);

CREATE INDEX IF NOT EXISTS generation_runs_application_idx
  ON generation_runs (application_id, created_at DESC);

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  generation_run_id UUID REFERENCES generation_runs(id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('cv', 'cover_letter', 'approach_message')),
  version INTEGER NOT NULL CHECK (version > 0),
  title TEXT NOT NULL,
  content_text TEXT NOT NULL,
  html_content TEXT,
  css_content TEXT,
  is_ats_one_column BOOLEAN NOT NULL DEFAULT true,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id, kind, version)
);

CREATE INDEX IF NOT EXISTS generated_documents_application_idx
  ON generated_documents (application_id, kind, version DESC);
