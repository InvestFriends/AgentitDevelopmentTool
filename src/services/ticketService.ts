import { supabase } from '@/integrations/supabase/client'
import { Ticket, Comment, Artifact, AuditLog, Risk, TestCase, TicketStatus, TicketType, TicketPriority } from '@/types'

export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  type?: TicketType
  search?: string
  teamId?: string
}

export async function fetchTickets(filters: TicketFilters = {}): Promise<Ticket[]> {
  let query = supabase
    .from('tickets')
    .select('*, agent:agents(*), team:teams(*), reporter:users!reporter_id(*)')
    .order('created_at', { ascending: false })
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.teamId) query = query.eq('team_id', filters.teamId)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as Ticket[]
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, agent:agents(*), team:teams(*), reporter:users!reporter_id(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Ticket
}

export async function createTicket(input: Partial<Ticket>): Promise<Ticket> {
  const [{ data: { user } }, workflowRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('workflows')
      .select('id, workflow_states!workflow_states_workflow_id_fkey(id, state_key)')
      .eq('is_active', true)
      .limit(1)
      .single(),
  ])
  if (workflowRes.error) throw workflowRes.error
  if (!user) throw new Error('Uživatel není přihlášen')

  const wf = workflowRes.data as unknown as { id: string; workflow_states: { id: string; state_key: string }[] }
  const initialState = wf.workflow_states.find(s => s.state_key === 'NEW')
  if (!initialState) throw new Error('Výchozí stav workflow nenalezen')

  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      ...input,
      status: 'NEW',
      tags: input.tags ?? [],
      workflow_id: wf.id,
      current_state_id: initialState.id,
      reporter_id: user.id,
    }])
    .select()
    .single()
  if (error) throw error
  return data as unknown as Ticket
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<void> {
  // Fetch ticket's workflow_id to find matching workflow_state
  const { data: ticket } = await supabase
    .from('tickets')
    .select('workflow_id')
    .eq('id', id)
    .single()

  const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() }

  if (ticket?.workflow_id) {
    const { data: state } = await supabase
      .from('workflow_states')
      .select('id')
      .eq('workflow_id', ticket.workflow_id)
      .eq('state_key', status)
      .maybeSingle()
    if (state) updatePayload.current_state_id = state.id
  }

  const { error } = await supabase
    .from('tickets')
    .update(updatePayload)
    .eq('id', id)
  if (error) throw error

  await supabase.from('audit_logs').insert([{
    ticket_id: id,
    action: 'STATUS_CHANGED',
    entity_type: 'ticket',
    entity_id: id,
    new_value: { status },
  }])
}

export async function fetchComments(ticketId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author:users!author_user_id(*), agent:agents!author_agent_id(*)')
    .eq('ticket_id', ticketId)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as unknown as Comment[]
}

export async function addComment(ticketId: string, content: string, isInternal = false): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('comments')
    .insert([{ ticket_id: ticketId, content, is_internal: isInternal, author_user_id: user?.id }])
    .select('*, author:users!author_user_id(*), agent:agents!author_agent_id(*)')
    .single()
  if (error) throw error
  return data as unknown as Comment
}

export async function fetchArtifacts(ticketId: string): Promise<Artifact[]> {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*, agent:agents(*)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Artifact[]
}

export async function fetchAuditLog(ticketId: string): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, user:users(*), agent:agents(*)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as AuditLog[]
}

export async function fetchRisks(ticketId: string): Promise<Risk[]> {
  const { data, error } = await supabase
    .from('risks')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Risk[]
}

export async function fetchTestCases(ticketId: string): Promise<TestCase[]> {
  const { data, error } = await supabase
    .from('test_cases')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as unknown as TestCase[]
}

export async function fetchTeams() {
  const { data, error } = await supabase.from('teams').select('*').order('name')
  if (error) throw error
  return data ?? []
}
