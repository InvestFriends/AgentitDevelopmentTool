import { supabase } from '@/integrations/supabase/client'
import { Agent, Ticket } from '@/types'

export async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('name')
  if (error) throw error
  return (data ?? []) as unknown as Agent[]
}

export async function fetchAgentById(id: string): Promise<Agent> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Agent
}

export async function fetchAgentQueue(agentId: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*, team:teams(*)')
    .eq('agent_id', agentId)
    .not('status', 'in', '("CLOSED","CANCELLED","REJECTED","RELEASED")')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Ticket[]
}

export async function fetchDashboardStats() {
  const [ticketsRes, agentsRes] = await Promise.all([
    supabase.from('tickets').select('status, priority, created_at'),
    supabase.from('agents').select('type, is_active'),
  ])
  if (ticketsRes.error) throw ticketsRes.error
  if (agentsRes.error) throw agentsRes.error
  return { tickets: ticketsRes.data ?? [], agents: agentsRes.data ?? [] }
}
