-- =============================================================
-- 003_rls.sql
-- Row Level Security policies for AgentitDevelopmentTool
-- Depends on: 002_tables.sql
-- =============================================================
-- Policy design:
--   authenticated  — any logged-in user (role-based guards live in the app layer)
--   service_role   — Supabase service key bypasses RLS automatically
-- =============================================================

-- =============================================================
-- workflows
-- =============================================================
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflows_select" ON workflows;
CREATE POLICY "workflows_select"
  ON workflows FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "workflows_insert" ON workflows;
CREATE POLICY "workflows_insert"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "workflows_update" ON workflows;
CREATE POLICY "workflows_update"
  ON workflows FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- agents
-- =============================================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agents_select" ON agents;
CREATE POLICY "agents_select"
  ON agents FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "agents_insert" ON agents;
CREATE POLICY "agents_insert"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "agents_update" ON agents;
CREATE POLICY "agents_update"
  ON agents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- teams
-- =============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teams_select" ON teams;
CREATE POLICY "teams_select"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "teams_insert" ON teams;
CREATE POLICY "teams_insert"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "teams_update" ON teams;
CREATE POLICY "teams_update"
  ON teams FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- users
-- =============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select"
  ON users FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "users_update" ON users;
CREATE POLICY "users_update"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- workflow_states
-- =============================================================
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_states_select" ON workflow_states;
CREATE POLICY "workflow_states_select"
  ON workflow_states FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "workflow_states_insert" ON workflow_states;
CREATE POLICY "workflow_states_insert"
  ON workflow_states FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "workflow_states_update" ON workflow_states;
CREATE POLICY "workflow_states_update"
  ON workflow_states FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- tickets
-- =============================================================
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select" ON tickets;
CREATE POLICY "tickets_select"
  ON tickets FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "tickets_insert" ON tickets;
CREATE POLICY "tickets_insert"
  ON tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "tickets_update" ON tickets;
CREATE POLICY "tickets_update"
  ON tickets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- comments
-- =============================================================
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select" ON comments;
CREATE POLICY "comments_select"
  ON comments FOR SELECT
  TO authenticated
  USING (
    -- external users cannot see internal comments; admins/managers/agents can
    is_internal = false
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'MANAGER')
    )
  );

DROP POLICY IF EXISTS "comments_insert" ON comments;
CREATE POLICY "comments_insert"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "comments_update" ON comments;
CREATE POLICY "comments_update"
  ON comments FOR UPDATE
  TO authenticated
  USING (
    author_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'MANAGER')
    )
  )
  WITH CHECK (true);

-- =============================================================
-- attachments
-- =============================================================
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attachments_select" ON attachments;
CREATE POLICY "attachments_select"
  ON attachments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "attachments_insert" ON attachments;
CREATE POLICY "attachments_insert"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "attachments_update" ON attachments;
CREATE POLICY "attachments_update"
  ON attachments FOR UPDATE
  TO authenticated
  USING (uploaded_by_user_id = auth.uid())
  WITH CHECK (true);

-- =============================================================
-- artifacts
-- =============================================================
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "artifacts_select" ON artifacts;
CREATE POLICY "artifacts_select"
  ON artifacts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "artifacts_insert" ON artifacts;
CREATE POLICY "artifacts_insert"
  ON artifacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "artifacts_update" ON artifacts;
CREATE POLICY "artifacts_update"
  ON artifacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- approvals
-- =============================================================
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "approvals_select" ON approvals;
CREATE POLICY "approvals_select"
  ON approvals FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "approvals_insert" ON approvals;
CREATE POLICY "approvals_insert"
  ON approvals FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "approvals_update" ON approvals;
CREATE POLICY "approvals_update"
  ON approvals FOR UPDATE
  TO authenticated
  USING (
    approver_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'MANAGER')
    )
  )
  WITH CHECK (true);

-- =============================================================
-- decisions
-- =============================================================
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "decisions_select" ON decisions;
CREATE POLICY "decisions_select"
  ON decisions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "decisions_insert" ON decisions;
CREATE POLICY "decisions_insert"
  ON decisions FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "decisions_update" ON decisions;
CREATE POLICY "decisions_update"
  ON decisions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- risks
-- =============================================================
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "risks_select" ON risks;
CREATE POLICY "risks_select"
  ON risks FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "risks_insert" ON risks;
CREATE POLICY "risks_insert"
  ON risks FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "risks_update" ON risks;
CREATE POLICY "risks_update"
  ON risks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- test_cases
-- =============================================================
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "test_cases_select" ON test_cases;
CREATE POLICY "test_cases_select"
  ON test_cases FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "test_cases_insert" ON test_cases;
CREATE POLICY "test_cases_insert"
  ON test_cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "test_cases_update" ON test_cases;
CREATE POLICY "test_cases_update"
  ON test_cases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================
-- releases
-- =============================================================
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "releases_select" ON releases;
CREATE POLICY "releases_select"
  ON releases FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "releases_insert" ON releases;
CREATE POLICY "releases_insert"
  ON releases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'MANAGER')
    )
  );

DROP POLICY IF EXISTS "releases_update" ON releases;
CREATE POLICY "releases_update"
  ON releases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
        AND u.role IN ('ADMIN', 'MANAGER')
    )
  )
  WITH CHECK (true);

-- =============================================================
-- audit_logs  (append-only: no UPDATE policy)
-- =============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
CREATE POLICY "audit_logs_select"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;
CREATE POLICY "audit_logs_insert"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
