export type TicketType = 'BUG' | 'FEATURE' | 'CHANGE' | 'EPIC' | 'STORY' | 'TASK'
export type TicketStatus = 'NEW' | 'TRIAGE' | 'BUSINESS_ANALYSIS' | 'TECHNICAL_ANALYSIS' | 'SECURITY_REVIEW' | 'SOLUTION_DESIGN' | 'DEVELOPMENT' | 'CODE_REVIEW' | 'TESTING' | 'UAT' | 'READY_FOR_RELEASE' | 'RELEASED' | 'CLOSED' | 'BLOCKED' | 'REJECTED' | 'ON_HOLD' | 'REOPENED' | 'CANCELLED'
export type TicketPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type AgentType = 'PRODUCT_OWNER' | 'BUSINESS_ANALYST' | 'IT_ANALYST' | 'SECURITY_ANALYST' | 'SOLUTION_ARCHITECT' | 'DEVELOPER' | 'CODE_REVIEWER' | 'QA_TESTER' | 'DEVOPS' | 'RELEASE_MANAGER'
export type AgentStatus = 'ACTIVE' | 'IDLE' | 'BUSY' | 'OFFLINE'
export type ArtifactType = 'ANALYSIS' | 'SPEC' | 'CODE' | 'TEST_REPORT' | 'SECURITY_REPORT' | 'ARCHITECTURE' | 'DEPLOYMENT_PLAN'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RiskStatus = 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED'
export type TestCaseStatus = 'PENDING' | 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED'
export type ReleaseStatus = 'PLANNED' | 'IN_PROGRESS' | 'RELEASED' | 'FAILED' | 'CANCELLED'
export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'VIEWER'

export interface Workflow {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Agent {
  id: string
  name: string
  type: AgentType
  status: AgentStatus
  description: string | null
  queue_size: number
  total_processed: number
  success_count: number
  avg_processing_time_minutes: number
  last_active_at: string | null
}

export interface Team {
  id: string
  name: string
  description: string | null
  lead_user_id: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  team_id: string | null
  avatar_url: string | null
  created_at: string
  team?: Team
}

export interface WorkflowState {
  id: string
  workflow_id: string
  name: string
  state_key: TicketStatus
  is_initial: boolean
  is_terminal: boolean
  owner_agent_type: AgentType
  sla_hours: number
  allowed_next_states: string[]
  sort_order: number
}

export interface Ticket {
  id: string
  title: string
  description: string | null
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  workflow_id: string | null
  current_state_id: string | null
  assigned_agent_id: string | null
  reporter_id: string | null
  team_id: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  sla_deadline: string | null
  tags: string[]
  story_points: number | null
  agent?: Agent
  team?: Team
  reporter?: UserProfile
}

export interface Comment {
  id: string
  ticket_id: string
  author_user_id: string | null
  author_agent_id: string | null
  content: string
  is_internal: boolean
  created_at: string
  updated_at: string
  author?: UserProfile
  agent?: Agent
}

export interface Attachment {
  id: string
  ticket_id: string
  filename: string
  storage_path: string
  file_size: number
  mime_type: string
  uploaded_by_user_id: string | null
  uploaded_at: string
}

export interface Artifact {
  id: string
  ticket_id: string
  agent_id: string | null
  type: ArtifactType
  title: string
  content: string
  version: number
  created_at: string
  agent?: Agent
}

export interface Approval {
  id: string
  ticket_id: string
  requested_by_agent_id: string | null
  approver_user_id: string | null
  status: ApprovalStatus
  requested_at: string
  decided_at: string | null
  notes: string | null
}

export interface Decision {
  id: string
  ticket_id: string
  agent_id: string | null
  decision_type: string
  outcome: string
  rationale: string
  alternatives_considered: string | null
  created_at: string
  agent?: Agent
}

export interface Risk {
  id: string
  ticket_id: string
  identified_by_agent_id: string | null
  title: string
  description: string
  probability: RiskLevel
  impact: RiskLevel
  mitigation: string | null
  status: RiskStatus
  created_at: string
}

export interface TestCase {
  id: string
  ticket_id: string
  title: string
  description: string
  steps: string[]
  expected_result: string
  actual_result: string | null
  status: TestCaseStatus
  created_by_agent_id: string | null
  executed_at: string | null
  created_at: string
}

export interface Release {
  id: string
  version: string
  release_date: string | null
  description: string | null
  status: ReleaseStatus
  released_by_user_id: string | null
  ticket_ids: string[]
  created_at: string
}

export interface AuditLog {
  id: string
  ticket_id: string | null
  user_id: string | null
  agent_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  created_at: string
  agent?: Agent
  user?: UserProfile
}
