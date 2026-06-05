import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '@/integrations/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { AgentType } from '@/types'

async function fetchAgentWorkload() {
  const [agentsRes, ticketsRes] = await Promise.all([
    supabase.from('agents').select('id, name, type, is_active'),
    supabase.from('tickets').select('agent_id, status').not('status', 'in', '("CLOSED","CANCELLED","REJECTED","RELEASED")'),
  ])
  if (agentsRes.error) throw agentsRes.error
  if (ticketsRes.error) throw ticketsRes.error
  return { agents: agentsRes.data ?? [], tickets: ticketsRes.data ?? [] }
}

const agentTypeLabels: Partial<Record<AgentType, string>> = {
  PRODUCT_OWNER: 'PO',
  BUSINESS_ANALYST: 'BA',
  IT_ANALYST: 'ITA',
  SECURITY_ANALYST: 'SEC',
  SOLUTION_ARCHITECT: 'SA',
  DEVELOPER: 'DEV',
  CODE_REVIEWER: 'CR',
  QA_TESTER: 'QA',
  DEVOPS: 'OPS',
  RELEASE_MANAGER: 'RM',
}

const COLORS = ['#6366f1','#06b6d4','#22c55e','#f59e0b','#ec4899','#8b5cf6','#f97316','#14b8a6','#a855f7','#ef4444']

export default function AgentDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['agent-workload'], queryFn: fetchAgentWorkload })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    )
  }

  const agents = data?.agents ?? []
  const tickets = data?.tickets ?? []

  const workload = agents.map((a, i) => ({
    name: agentTypeLabels[a.type as AgentType] ?? a.name,
    fullName: a.name,
    count: tickets.filter(t => t.agent_id === a.id).length,
    active: a.is_active,
    color: COLORS[i % COLORS.length],
  })).sort((a, b) => b.count - a.count)

  const totalAssigned = tickets.length
  const maxLoad = Math.max(...workload.map(w => w.count), 1)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Agent Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-slate-500">Přiřazených ticketů</div>
          <div className="text-3xl font-bold text-indigo-600 mt-1">{totalAssigned}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-slate-500">Aktivních agentů</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{agents.filter(a => a.is_active).length}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-slate-500">Nejvytíženější</div>
          <div className="text-lg font-bold text-slate-800 mt-1">{workload[0]?.fullName ?? '—'}</div>
          <div className="text-xs text-slate-400">{workload[0]?.count ?? 0} ticketů</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-xs text-slate-500">Nepřiřazených</div>
          <div className="text-3xl font-bold text-amber-500 mt-1">
            {tickets.filter(t => !t.agent_id).length}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-slate-700 mb-4">Vytížení agentů (aktivní tickety)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={workload} margin={{ left: 8, right: 16 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, _, props) => [v, props.payload?.fullName]} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {workload.map((entry, i) => <Cell key={i} fill={entry.active ? entry.color : '#cbd5e1'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {workload.map((w, i) => (
          <div key={i} className="bg-white border rounded-lg p-3">
            <div className="text-xs text-slate-500 truncate">{w.fullName}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: w.active ? w.color : '#94a3b8' }}>{w.count}</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${(w.count / maxLoad) * 100}%`, backgroundColor: w.active ? w.color : '#94a3b8' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
