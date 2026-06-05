-- =============================================================
-- 004_seed.sql
-- Reference / demo data for AgentitDevelopmentTool
-- Depends on: 001_enums.sql, 002_tables.sql
-- Safe to re-run: INSERT ... ON CONFLICT DO NOTHING
-- =============================================================

-- =============================================================
-- UUID reference legend
-- 11111111-0000-...  workflow
-- 22222222-0000-...  workflow_states  (01-13)
-- 33333333-0000-...  agents           (01-10)
-- 44444444-0000-...  teams            (01-03)
-- 55555555-0000-...  users            (01-05)
-- 66666666-0000-...  tickets          (01-05)
-- =============================================================

-- =============================================================
-- 1. Workflow
-- =============================================================
INSERT INTO workflows (id, name, description, is_active, created_at)
VALUES (
  '11111111-0000-0000-0000-000000000001',
  'Standard Software Development Lifecycle',
  'End-to-end workflow covering triage through release for all ticket types. Passes through analysis, design, development, review, testing, UAT, and controlled deployment.',
  true,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 2. Workflow States (13 active states + 5 terminal/side states)
--    sort_order follows the happy-path sequence; side-states come last
-- =============================================================
INSERT INTO workflow_states
  (id, workflow_id, name, state_key, is_initial, is_terminal, owner_agent_type, sla_hours, allowed_next_states, sort_order)
VALUES

-- NEW (initial)
(
  '22222222-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'New',
  'NEW', true, false, 'PRODUCT_OWNER', 4,
  ARRAY['TRIAGE'],
  1
),

-- TRIAGE
(
  '22222222-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000001',
  'Triage',
  'TRIAGE', false, false, 'PRODUCT_OWNER', 8,
  ARRAY['BUSINESS_ANALYSIS','REJECTED','CANCELLED'],
  2
),

-- BUSINESS_ANALYSIS
(
  '22222222-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000001',
  'Business Analysis',
  'BUSINESS_ANALYSIS', false, false, 'BUSINESS_ANALYST', 24,
  ARRAY['TECHNICAL_ANALYSIS','BLOCKED','ON_HOLD','REJECTED','CANCELLED'],
  3
),

-- TECHNICAL_ANALYSIS
(
  '22222222-0000-0000-0000-000000000004',
  '11111111-0000-0000-0000-000000000001',
  'Technical Analysis',
  'TECHNICAL_ANALYSIS', false, false, 'IT_ANALYST', 24,
  ARRAY['SECURITY_REVIEW','BLOCKED','ON_HOLD','REJECTED','CANCELLED'],
  4
),

-- SECURITY_REVIEW
(
  '22222222-0000-0000-0000-000000000005',
  '11111111-0000-0000-0000-000000000001',
  'Security Review',
  'SECURITY_REVIEW', false, false, 'SECURITY_ANALYST', 16,
  ARRAY['SOLUTION_DESIGN','BLOCKED','ON_HOLD','REJECTED','CANCELLED'],
  5
),

-- SOLUTION_DESIGN
(
  '22222222-0000-0000-0000-000000000006',
  '11111111-0000-0000-0000-000000000001',
  'Solution Design',
  'SOLUTION_DESIGN', false, false, 'SOLUTION_ARCHITECT', 24,
  ARRAY['DEVELOPMENT','BLOCKED','ON_HOLD','REJECTED','CANCELLED'],
  6
),

-- DEVELOPMENT
(
  '22222222-0000-0000-0000-000000000007',
  '11111111-0000-0000-0000-000000000001',
  'Development',
  'DEVELOPMENT', false, false, 'DEVELOPER', 72,
  ARRAY['CODE_REVIEW','BLOCKED','ON_HOLD','CANCELLED'],
  7
),

-- CODE_REVIEW
(
  '22222222-0000-0000-0000-000000000008',
  '11111111-0000-0000-0000-000000000001',
  'Code Review',
  'CODE_REVIEW', false, false, 'CODE_REVIEWER', 8,
  ARRAY['TESTING','DEVELOPMENT','BLOCKED','ON_HOLD','CANCELLED'],
  8
),

-- TESTING
(
  '22222222-0000-0000-0000-000000000009',
  '11111111-0000-0000-0000-000000000001',
  'Testing',
  'TESTING', false, false, 'QA_TESTER', 24,
  ARRAY['UAT','DEVELOPMENT','BLOCKED','ON_HOLD','CANCELLED'],
  9
),

-- UAT
(
  '22222222-0000-0000-0000-000000000010',
  '11111111-0000-0000-0000-000000000001',
  'User Acceptance Testing',
  'UAT', false, false, 'QA_TESTER', 48,
  ARRAY['READY_FOR_RELEASE','DEVELOPMENT','BLOCKED','ON_HOLD','CANCELLED'],
  10
),

-- READY_FOR_RELEASE
(
  '22222222-0000-0000-0000-000000000011',
  '11111111-0000-0000-0000-000000000001',
  'Ready for Release',
  'READY_FOR_RELEASE', false, false, 'DEVOPS', 16,
  ARRAY['RELEASED','BLOCKED','ON_HOLD','CANCELLED'],
  11
),

-- RELEASED
(
  '22222222-0000-0000-0000-000000000012',
  '11111111-0000-0000-0000-000000000001',
  'Released',
  'RELEASED', false, false, 'RELEASE_MANAGER', 8,
  ARRAY['CLOSED','REOPENED'],
  12
),

-- CLOSED (terminal)
(
  '22222222-0000-0000-0000-000000000013',
  '11111111-0000-0000-0000-000000000001',
  'Closed',
  'CLOSED', false, true, 'RELEASE_MANAGER', NULL,
  ARRAY['REOPENED'],
  13
)

ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 3. Agents  (one per agent_type, all IDLE)
-- =============================================================
INSERT INTO agents
  (id, name, type, status, description, queue_size, total_processed, success_count, avg_processing_time_minutes, last_active_at)
VALUES

(
  '33333333-0000-0000-0000-000000000001',
  'Aria – Product Owner',
  'PRODUCT_OWNER', 'IDLE',
  'Triages incoming tickets, validates business value, sets priority, and routes to Business Analysis.',
  0, 342, 318, 12.4,
  now() - interval '15 minutes'
),

(
  '33333333-0000-0000-0000-000000000002',
  'Blake – Business Analyst',
  'BUSINESS_ANALYST', 'IDLE',
  'Elaborates acceptance criteria, stakeholder requirements, and produces SPEC artifacts for feasibility sign-off.',
  0, 287, 271, 38.7,
  now() - interval '42 minutes'
),

(
  '33333333-0000-0000-0000-000000000003',
  'Casey – IT Analyst',
  'IT_ANALYST', 'IDLE',
  'Assesses technical feasibility, estimates effort, identifies dependencies, and flags integration risks.',
  0, 265, 249, 45.2,
  now() - interval '1 hour'
),

(
  '33333333-0000-0000-0000-000000000004',
  'Devon – Security Analyst',
  'SECURITY_ANALYST', 'IDLE',
  'Performs threat modelling, reviews data-flow diagrams, and issues SECURITY_REPORT artifacts.',
  0, 198, 191, 27.6,
  now() - interval '2 hours'
),

(
  '33333333-0000-0000-0000-000000000005',
  'Ellis – Solution Architect',
  'SOLUTION_ARCHITECT', 'IDLE',
  'Designs system architecture, selects patterns and technologies, and produces ARCHITECTURE artifacts.',
  0, 221, 214, 62.1,
  now() - interval '30 minutes'
),

(
  '33333333-0000-0000-0000-000000000006',
  'Finley – Developer',
  'DEVELOPER', 'IDLE',
  'Implements features and bug fixes, writes unit tests, and produces CODE artifacts ready for review.',
  0, 504, 476, 187.3,
  now() - interval '5 minutes'
),

(
  '33333333-0000-0000-0000-000000000007',
  'Gene – Code Reviewer',
  'CODE_REVIEWER', 'IDLE',
  'Reviews pull requests for correctness, style, security, and maintainability before merging.',
  0, 489, 441, 35.8,
  now() - interval '20 minutes'
),

(
  '33333333-0000-0000-0000-000000000008',
  'Harper – QA Tester',
  'QA_TESTER', 'IDLE',
  'Executes test cases, manages regression suites, conducts UAT coordination, and issues TEST_REPORT artifacts.',
  0, 398, 371, 54.9,
  now() - interval '10 minutes'
),

(
  '33333333-0000-0000-0000-000000000009',
  'Indigo – DevOps',
  'DEVOPS', 'IDLE',
  'Manages CI/CD pipelines, staging deployments, environment configurations, and DEPLOYMENT_PLAN artifacts.',
  0, 312, 305, 28.4,
  now() - interval '8 minutes'
),

(
  '33333333-0000-0000-0000-000000000010',
  'Jordan – Release Manager',
  'RELEASE_MANAGER', 'IDLE',
  'Coordinates production releases, manages release notes, monitors post-deploy health, and closes tickets.',
  0, 178, 175, 22.1,
  now() - interval '1 hour'
)

ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 4. Teams
-- =============================================================
INSERT INTO teams (id, name, description, lead_user_id, created_at)
VALUES
(
  '44444444-0000-0000-0000-000000000001',
  'Product Team',
  'Responsible for product strategy, roadmap prioritisation, and stakeholder communication.',
  NULL,  -- lead set after users insert
  now()
),
(
  '44444444-0000-0000-0000-000000000002',
  'Engineering Team',
  'Full-stack development, code review, architecture, and technical debt management.',
  NULL,
  now()
),
(
  '44444444-0000-0000-0000-000000000003',
  'Operations Team',
  'Infrastructure, CI/CD, security posture, release management, and on-call support.',
  NULL,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 5. Users  (5 sample users across the three teams)
-- =============================================================
INSERT INTO users (id, email, full_name, role, team_id, avatar_url, created_at)
VALUES

(
  '55555555-0000-0000-0000-000000000001',
  'alice.chen@example.com',
  'Alice Chen',
  'ADMIN',
  '44444444-0000-0000-0000-000000000001',
  NULL,
  now()
),

(
  '55555555-0000-0000-0000-000000000002',
  'bob.martinez@example.com',
  'Bob Martinez',
  'MANAGER',
  '44444444-0000-0000-0000-000000000002',
  NULL,
  now()
),

(
  '55555555-0000-0000-0000-000000000003',
  'carla.nguyen@example.com',
  'Carla Nguyen',
  'DEVELOPER',
  '44444444-0000-0000-0000-000000000002',
  NULL,
  now()
),

(
  '55555555-0000-0000-0000-000000000004',
  'dan.patel@example.com',
  'Dan Patel',
  'DEVELOPER',
  '44444444-0000-0000-0000-000000000003',
  NULL,
  now()
),

(
  '55555555-0000-0000-0000-000000000005',
  'eva.kim@example.com',
  'Eva Kim',
  'VIEWER',
  '44444444-0000-0000-0000-000000000001',
  NULL,
  now()
)

ON CONFLICT (id) DO NOTHING;

-- Assign team leads now that users exist
UPDATE teams SET lead_user_id = '55555555-0000-0000-0000-000000000001'
  WHERE id = '44444444-0000-0000-0000-000000000001'
    AND lead_user_id IS NULL;

UPDATE teams SET lead_user_id = '55555555-0000-0000-0000-000000000002'
  WHERE id = '44444444-0000-0000-0000-000000000002'
    AND lead_user_id IS NULL;

UPDATE teams SET lead_user_id = '55555555-0000-0000-0000-000000000004'
  WHERE id = '44444444-0000-0000-0000-000000000003'
    AND lead_user_id IS NULL;

-- =============================================================
-- 6. Tickets  (5 tickets, spread across workflow states)
-- =============================================================
INSERT INTO tickets
  (id, title, description, type, status, priority,
   workflow_id, current_state_id,
   assigned_agent_id, reporter_id, team_id,
   created_at, updated_at, closed_at, sla_deadline,
   tags, story_points)
VALUES

-- Ticket 1: New bug, sitting in TRIAGE
(
  '66666666-0000-0000-0000-000000000001',
  'Login page throws 500 on invalid email format',
  'When a user submits the login form with an email address that contains two consecutive "@" symbols (e.g. "user@@example.com"), the API returns HTTP 500 instead of a 422 validation error. Affects all browsers. Steps to reproduce: navigate to /login, enter "test@@domain.com", click Sign In.',
  'BUG', 'TRIAGE', 'HIGH',
  '11111111-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000002',
  '33333333-0000-0000-0000-000000000001',  -- Aria (Product Owner)
  '55555555-0000-0000-0000-000000000003',  -- Carla
  '44444444-0000-0000-0000-000000000002',
  now() - interval '2 hours',
  now() - interval '1 hour',
  NULL,
  now() + interval '6 hours',
  ARRAY['auth','backend','validation'],
  3
),

-- Ticket 2: Feature in TECHNICAL_ANALYSIS
(
  '66666666-0000-0000-0000-000000000002',
  'Add two-factor authentication via TOTP',
  'As a security-conscious user I want to enable TOTP-based two-factor authentication on my account so that a stolen password alone is not sufficient to access my data. Acceptance criteria: (1) User can enrol via QR code in account settings. (2) Login flow prompts for 6-digit code when 2FA is active. (3) Backup codes are generated and downloadable. (4) Admin can disable 2FA for any user.',
  'FEATURE', 'TECHNICAL_ANALYSIS', 'CRITICAL',
  '11111111-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000004',
  '33333333-0000-0000-0000-000000000003',  -- Casey (IT Analyst)
  '55555555-0000-0000-0000-000000000001',  -- Alice
  '44444444-0000-0000-0000-000000000002',
  now() - interval '5 days',
  now() - interval '3 hours',
  NULL,
  now() + interval '21 hours',
  ARRAY['auth','security','2fa'],
  13
),

-- Ticket 3: Story in DEVELOPMENT
(
  '66666666-0000-0000-0000-000000000003',
  'Ticket list: add column-level sorting and multi-filter support',
  'As a project manager I want to sort the ticket list by any column and apply multiple simultaneous filters (type + priority + status + assignee) so that I can focus on the most relevant subset of work. Acceptance criteria: (1) Column headers are clickable and cycle through asc/desc/none. (2) Filter drawer supports AND logic across fields. (3) Active filters are shown as dismissible chips. (4) URL state reflects current sort and filter so links are shareable.',
  'STORY', 'DEVELOPMENT', 'MEDIUM',
  '11111111-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000007',
  '33333333-0000-0000-0000-000000000006',  -- Finley (Developer)
  '55555555-0000-0000-0000-000000000002',  -- Bob
  '44444444-0000-0000-0000-000000000002',
  now() - interval '10 days',
  now() - interval '30 minutes',
  NULL,
  now() + interval '60 hours',
  ARRAY['frontend','ux','filtering'],
  8
),

-- Ticket 4: Change in TESTING
(
  '66666666-0000-0000-0000-000000000004',
  'Migrate email delivery from SendGrid to AWS SES',
  'The current SendGrid integration is being replaced with AWS SES to reduce cost and consolidate cloud vendor footprint. This change affects transactional email templates, bounce/complaint handling webhooks, and the monitoring dashboards. Zero customer-visible change to email content or timing is expected.',
  'CHANGE', 'TESTING', 'HIGH',
  '11111111-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000009',
  '33333333-0000-0000-0000-000000000008',  -- Harper (QA Tester)
  '55555555-0000-0000-0000-000000000004',  -- Dan
  '44444444-0000-0000-0000-000000000003',
  now() - interval '21 days',
  now() - interval '2 hours',
  NULL,
  now() + interval '22 hours',
  ARRAY['email','infrastructure','aws'],
  5
),

-- Ticket 5: Task, CLOSED
(
  '66666666-0000-0000-0000-000000000005',
  'Update Node.js runtime from v18 to v22 LTS',
  'Node.js 18 reaches end-of-life on 2025-04-30. All services must be upgraded to Node.js 22 LTS before that date. This task covers: (1) Dockerfile and CI pipeline updates. (2) Dependency compatibility audit. (3) Local dev environment documentation update. (4) Smoke-test all services post-upgrade in staging.',
  'TASK', 'CLOSED', 'MEDIUM',
  '11111111-0000-0000-0000-000000000001',
  '22222222-0000-0000-0000-000000000013',
  NULL,
  '55555555-0000-0000-0000-000000000004',  -- Dan
  '44444444-0000-0000-0000-000000000003',
  now() - interval '45 days',
  now() - interval '5 days',
  now() - interval '5 days',
  NULL,
  ARRAY['devops','node','upgrade'],
  3
)

ON CONFLICT (id) DO NOTHING;
