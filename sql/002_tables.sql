-- =============================================================
-- 002_tables.sql
-- All tables for AgentitDevelopmentTool
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS
-- Depends on: 001_enums.sql
-- =============================================================

-- =============================================================
-- Trigger function: auto-update updated_at on row modification
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- workflows
-- =============================================================
CREATE TABLE IF NOT EXISTS workflows (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- agents
-- =============================================================
CREATE TABLE IF NOT EXISTS agents (
  id                          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                        TEXT        NOT NULL,
  type                        agent_type  NOT NULL,
  status                      agent_status NOT NULL DEFAULT 'IDLE',
  description                 TEXT,
  queue_size                  INT         NOT NULL DEFAULT 0,
  total_processed             INT         NOT NULL DEFAULT 0,
  success_count               INT         NOT NULL DEFAULT 0,
  avg_processing_time_minutes NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_active_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agents_type   ON agents (type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents (status);

-- =============================================================
-- teams  (lead_user_id deferred — users not yet created)
-- =============================================================
CREATE TABLE IF NOT EXISTS teams (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  description  TEXT,
  lead_user_id UUID,                  -- FK added after users table below
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- users
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT        NOT NULL UNIQUE,
  full_name  TEXT        NOT NULL,
  role       user_role   NOT NULL DEFAULT 'VIEWER',
  team_id    UUID        REFERENCES teams (id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_team_id ON users (team_id);
CREATE INDEX IF NOT EXISTS idx_users_role    ON users (role);

-- Now add the deferred FK on teams.lead_user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'teams_lead_user_id_fkey'
      AND table_name = 'teams'
  ) THEN
    ALTER TABLE teams
      ADD CONSTRAINT teams_lead_user_id_fkey
      FOREIGN KEY (lead_user_id) REFERENCES users (id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================================
-- workflow_states
-- =============================================================
CREATE TABLE IF NOT EXISTS workflow_states (
  id                  UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id         UUID          NOT NULL REFERENCES workflows (id) ON DELETE CASCADE,
  name                TEXT          NOT NULL,
  state_key           ticket_status NOT NULL,
  is_initial          BOOLEAN       NOT NULL DEFAULT false,
  is_terminal         BOOLEAN       NOT NULL DEFAULT false,
  owner_agent_type    agent_type,
  sla_hours           INT,
  allowed_next_states TEXT[]        NOT NULL DEFAULT '{}',
  sort_order          INT           NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_workflow_states_workflow_id ON workflow_states (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_state_key   ON workflow_states (state_key);

-- =============================================================
-- tickets
-- =============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id                UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT           NOT NULL,
  description       TEXT,
  type              ticket_type    NOT NULL,
  status            ticket_status  NOT NULL DEFAULT 'NEW',
  priority          ticket_priority NOT NULL DEFAULT 'MEDIUM',
  workflow_id       UUID           NOT NULL REFERENCES workflows (id),
  current_state_id  UUID           NOT NULL REFERENCES workflow_states (id),
  assigned_agent_id UUID           REFERENCES agents (id) ON DELETE SET NULL,
  reporter_id       UUID           NOT NULL REFERENCES users (id),
  team_id           UUID           REFERENCES teams (id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  closed_at         TIMESTAMPTZ,
  sla_deadline      TIMESTAMPTZ,
  tags              TEXT[]         NOT NULL DEFAULT '{}',
  story_points      INT
);

CREATE INDEX IF NOT EXISTS idx_tickets_status            ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_type              ON tickets (type);
CREATE INDEX IF NOT EXISTS idx_tickets_priority          ON tickets (priority);
CREATE INDEX IF NOT EXISTS idx_tickets_workflow_id       ON tickets (workflow_id);
CREATE INDEX IF NOT EXISTS idx_tickets_current_state_id  ON tickets (current_state_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_agent_id ON tickets (assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id       ON tickets (reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_team_id           ON tickets (team_id);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_deadline      ON tickets (sla_deadline);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at        ON tickets (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trg_tickets_updated_at'
  ) THEN
    CREATE TRIGGER trg_tickets_updated_at
      BEFORE UPDATE ON tickets
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =============================================================
-- comments
-- =============================================================
CREATE TABLE IF NOT EXISTS comments (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id       UUID        NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  author_user_id  UUID        REFERENCES users (id) ON DELETE SET NULL,
  author_agent_id UUID        REFERENCES agents (id) ON DELETE SET NULL,
  content         TEXT        NOT NULL,
  is_internal     BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comments_has_author CHECK (
    (author_user_id IS NOT NULL) OR (author_agent_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id       ON comments (ticket_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_user_id  ON comments (author_user_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_agent_id ON comments (author_agent_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'trg_comments_updated_at'
  ) THEN
    CREATE TRIGGER trg_comments_updated_at
      BEFORE UPDATE ON comments
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- =============================================================
-- attachments
-- =============================================================
CREATE TABLE IF NOT EXISTS attachments (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id            UUID        NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  filename             TEXT        NOT NULL,
  storage_path         TEXT        NOT NULL,
  file_size            BIGINT      NOT NULL,
  mime_type            TEXT        NOT NULL,
  uploaded_by_user_id  UUID        REFERENCES users (id) ON DELETE SET NULL,
  uploaded_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments (ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments (uploaded_by_user_id);

-- =============================================================
-- artifacts
-- =============================================================
CREATE TABLE IF NOT EXISTS artifacts (
  id         UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id  UUID          NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  agent_id   UUID          NOT NULL REFERENCES agents (id) ON DELETE RESTRICT,
  type       artifact_type NOT NULL,
  title      TEXT          NOT NULL,
  content    TEXT          NOT NULL,
  version    INT           NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_ticket_id ON artifacts (ticket_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_agent_id  ON artifacts (agent_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type      ON artifacts (type);

-- =============================================================
-- approvals
-- =============================================================
CREATE TABLE IF NOT EXISTS approvals (
  id                    UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id             UUID            NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  requested_by_agent_id UUID            NOT NULL REFERENCES agents (id) ON DELETE RESTRICT,
  approver_user_id      UUID            REFERENCES users (id) ON DELETE SET NULL,
  status                approval_status NOT NULL DEFAULT 'PENDING',
  requested_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
  decided_at            TIMESTAMPTZ,
  notes                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_approvals_ticket_id   ON approvals (ticket_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status      ON approvals (status);
CREATE INDEX IF NOT EXISTS idx_approvals_approver    ON approvals (approver_user_id);
CREATE INDEX IF NOT EXISTS idx_approvals_requested_by ON approvals (requested_by_agent_id);

-- =============================================================
-- decisions
-- =============================================================
CREATE TABLE IF NOT EXISTS decisions (
  id                     UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id              UUID        NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  agent_id               UUID        NOT NULL REFERENCES agents (id) ON DELETE RESTRICT,
  decision_type          TEXT        NOT NULL,
  outcome                TEXT        NOT NULL,
  rationale              TEXT,
  alternatives_considered TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_ticket_id ON decisions (ticket_id);
CREATE INDEX IF NOT EXISTS idx_decisions_agent_id  ON decisions (agent_id);

-- =============================================================
-- risks
-- =============================================================
CREATE TABLE IF NOT EXISTS risks (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id             UUID        NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  identified_by_agent_id UUID       NOT NULL REFERENCES agents (id) ON DELETE RESTRICT,
  title                 TEXT        NOT NULL,
  description           TEXT,
  probability           risk_level  NOT NULL,
  impact                risk_level  NOT NULL,
  mitigation            TEXT,
  status                risk_status NOT NULL DEFAULT 'OPEN',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risks_ticket_id ON risks (ticket_id);
CREATE INDEX IF NOT EXISTS idx_risks_status    ON risks (status);
CREATE INDEX IF NOT EXISTS idx_risks_identified_by ON risks (identified_by_agent_id);

-- =============================================================
-- test_cases
-- =============================================================
CREATE TABLE IF NOT EXISTS test_cases (
  id                   UUID             DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id            UUID             NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  title                TEXT             NOT NULL,
  description          TEXT,
  steps                TEXT[]           NOT NULL DEFAULT '{}',
  expected_result      TEXT             NOT NULL,
  actual_result        TEXT,
  status               test_case_status NOT NULL DEFAULT 'PENDING',
  created_by_agent_id  UUID             NOT NULL REFERENCES agents (id) ON DELETE RESTRICT,
  executed_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_cases_ticket_id ON test_cases (ticket_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_status    ON test_cases (status);
CREATE INDEX IF NOT EXISTS idx_test_cases_created_by ON test_cases (created_by_agent_id);

-- =============================================================
-- releases
-- =============================================================
CREATE TABLE IF NOT EXISTS releases (
  id                   UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  version              TEXT           NOT NULL UNIQUE,
  release_date         DATE,
  description          TEXT,
  status               release_status NOT NULL DEFAULT 'PLANNED',
  released_by_user_id  UUID           REFERENCES users (id) ON DELETE SET NULL,
  ticket_ids           UUID[]         NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_releases_status      ON releases (status);
CREATE INDEX IF NOT EXISTS idx_releases_released_by ON releases (released_by_user_id);
CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases (release_date);

-- =============================================================
-- audit_logs
-- =============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id   UUID        REFERENCES tickets (id) ON DELETE SET NULL,
  user_id     UUID        REFERENCES users (id) ON DELETE SET NULL,
  agent_id    UUID        REFERENCES agents (id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,
  entity_type TEXT        NOT NULL,
  entity_id   UUID        NOT NULL,
  old_value   JSONB,
  new_value   JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ticket_id   ON audit_logs (ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id     ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_agent_id    ON audit_logs (agent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id   ON audit_logs (entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs (created_at DESC);
