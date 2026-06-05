-- =============================================================
-- 001_enums.sql
-- All custom enum types for AgentitDevelopmentTool
-- Safe to re-run: uses DO $$ BEGIN ... EXCEPTION pattern
-- =============================================================

-- ticket_type
DO $$ BEGIN
  CREATE TYPE ticket_type AS ENUM (
    'BUG',
    'FEATURE',
    'CHANGE',
    'EPIC',
    'STORY',
    'TASK'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ticket_status
DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM (
    'NEW',
    'TRIAGE',
    'BUSINESS_ANALYSIS',
    'TECHNICAL_ANALYSIS',
    'SECURITY_REVIEW',
    'SOLUTION_DESIGN',
    'DEVELOPMENT',
    'CODE_REVIEW',
    'TESTING',
    'UAT',
    'READY_FOR_RELEASE',
    'RELEASED',
    'CLOSED',
    'BLOCKED',
    'REJECTED',
    'ON_HOLD',
    'REOPENED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ticket_priority
DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM (
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- agent_type
DO $$ BEGIN
  CREATE TYPE agent_type AS ENUM (
    'PRODUCT_OWNER',
    'BUSINESS_ANALYST',
    'IT_ANALYST',
    'SECURITY_ANALYST',
    'SOLUTION_ARCHITECT',
    'DEVELOPER',
    'CODE_REVIEWER',
    'QA_TESTER',
    'DEVOPS',
    'RELEASE_MANAGER'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- agent_status
DO $$ BEGIN
  CREATE TYPE agent_status AS ENUM (
    'ACTIVE',
    'IDLE',
    'BUSY',
    'OFFLINE'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- artifact_type
DO $$ BEGIN
  CREATE TYPE artifact_type AS ENUM (
    'ANALYSIS',
    'SPEC',
    'CODE',
    'TEST_REPORT',
    'SECURITY_REPORT',
    'ARCHITECTURE',
    'DEPLOYMENT_PLAN'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- approval_status
DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- risk_level
DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- risk_status
DO $$ BEGIN
  CREATE TYPE risk_status AS ENUM (
    'OPEN',
    'MITIGATED',
    'ACCEPTED',
    'CLOSED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- test_case_status
DO $$ BEGIN
  CREATE TYPE test_case_status AS ENUM (
    'PENDING',
    'PASS',
    'FAIL',
    'BLOCKED',
    'SKIPPED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- release_status
DO $$ BEGIN
  CREATE TYPE release_status AS ENUM (
    'PLANNED',
    'IN_PROGRESS',
    'RELEASED',
    'FAILED',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- user_role
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'MANAGER',
    'DEVELOPER',
    'VIEWER'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;
