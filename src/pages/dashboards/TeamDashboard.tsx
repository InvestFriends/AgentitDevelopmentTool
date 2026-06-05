import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { supabase } from '@/integrations/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'

async function fetchTeamStats() {
  const [teamsRes, ticketsRes] = await Promise.all([
    supabase.from('teams').select('id, name'),
    supabase.from('tickets').select('team_id, status, priority, title, id').not('status', 'in', '("CLOSED","CANCELLED","REJECTED","RELEASED")'),
  ])
  if (teamsRes.error) throw teamsRes.error
  if (ticketsRes.error) throw ticketsRes.error
  return { teams: teamsRes.data ?? [], tickets: ticketsRes.data ?? [] }
}

const COLORS = ['#6366f1','#06b6d4','#22c55e','#f59e0b','#ec4899','#8b5cf6']

export default function TeamDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['team-stats'], queryFn: fetchTeamStats })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  const teams = data?.teams ?? []
  const tickets = data?.tickets ?? []

  const teamData = teams.map((t, i) => ({
    name: t.name,
    count: tickets.filter(tk => tk.team_id === t.id).length,
    color: COLORS[i % COLORS.length],
  })).sort((a, b) => b.count - a.count)

  // Most recent open tickets across teams
  const recentTickets = tickets.slice(0, 10)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Team Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((t, i) => {
          const count = tickets.filter(tk => tk.team_id === t.id).length
          return (
            <div key={t.id} className="bg-white border rounded-lg p-4">
              <div className="text-xs text-slate-500">{t.name}</div>
              <div className="text-3xl font-bold mt-1" style={{ color: COLORS[i % COLORS.length] }}>{count}</div>
              <div className="text-xs text-slate-400 mt-1">otevřených ticketů</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-slate-700 mb-4">Tickety podle týmu</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={teamData} margin={{ left: 8, right: 16 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {teamData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-slate-700 mb-3">Otevřené tickety</h2>
          <div className="space-y-2 overflow-y-auto max-h-56">
            {recentTickets.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-8">Žádné otevřené tickety</div>
            ) : recentTickets.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-slate-700">{t.title}</span>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
