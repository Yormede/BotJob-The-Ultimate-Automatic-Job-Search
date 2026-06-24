CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT,
  email_verified_at TIMESTAMPTZ,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_country_code TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_email_verification'
    CHECK (status IN ('pending_email_verification', 'active', 'disabled', 'deletion_requested')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_username_lower_uq ON users (lower(username));
CREATE UNIQUE INDEX users_email_lower_uq ON users (lower(email));

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  CHECK (expires_at > created_at)
);

CREATE INDEX user_sessions_active_idx
  ON user_sessions (user_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE ai_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_instructions TEXT NOT NULL DEFAULT '',
  life_trace JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(sections) = 'object'),
  CHECK (jsonb_typeof(life_trace) = 'array')
);

CREATE TABLE job_axes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  contract_types TEXT[] NOT NULL DEFAULT '{}',
  locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority SMALLINT NOT NULL DEFAULT 0 CHECK (priority >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(locations) = 'array')
);

CREATE UNIQUE INDEX job_axes_user_title_lower_uq ON job_axes (user_id, lower(title));

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_axis_id UUID REFERENCES job_axes(id) ON DELETE SET NULL,
  company TEXT NOT NULL,
  job_title TEXT NOT NULL,
  offer_url TEXT,
  full_offer_text TEXT NOT NULL,
  location_label TEXT,
  contract_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'follow_up', 'interview', 'accepted', 'rejected', 'archived')),
  applied_at TIMESTAMPTZ,
  search_text TEXT NOT NULL DEFAULT '',
  search_vector TSVECTOR
    GENERATED ALWAYS AS (to_tsvector('french', search_text)) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_applications_user_applied ON applications(user_id, applied_at DESC);
CREATE INDEX idx_applications_search ON applications USING GIN(search_vector);

CREATE TABLE application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('last_action', 'next_action', 'follow_up', 'interview', 'note', 'status_change')),
  label TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'active',
  author TEXT NOT NULL DEFAULT 'user'
    CHECK (author IN ('user', 'assistant', 'system')),
  event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_events_application_created
  ON application_events(application_id, created_at DESC);
