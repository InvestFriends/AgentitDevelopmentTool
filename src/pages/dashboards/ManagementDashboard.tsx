import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchDashboardStats } from '@/services/agentService'
import { Skeleton } from '@/components/ui/skeleton'
import { TicketStatus, TicketPriority } from '@/types'

const STATUS_COLORS: Partial<Record<TicketStatus, string>> = {
  NEW: '#94a3b8',
  DEVELOPMENT: '#06b6d4',
  TESTING: '#eab308',
  RELEASED: '#22c55e',
  BLOCKED: '#ef4444',
  CLOSED: '#16a34a',
  CANCELLED: '#cbd5e1',
}

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
}

function KpiCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function ManagementDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  const tickets = data?.tickets ?? []
  const agents = data?.agents ?? []

  const total = tickets.length
  const open = tickets.filter(t => !['CLOSED', 'CANCELLED', 'REJECTED', 'RELEASED'].includes(t.status)).length
  const critical = tickets.filter(t => t.priority === 'CRITICAL' && !['CLOSED', 'CANCELLED', 'REJECTED', 'RELEASED'].includes(t.status)).length
  const activeAgents = agents.filter(a => a.is_active).length

  // Status distribution
  const statusMap: Record<string, number> = {}
  tickets.forEach(t => { statusMap[t.status] = (statusMap[t.status] ?? 0) + 1 })
  const statusData = Object.entries(statusMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([status, count]) => ({ status, count }))

  // Priority distribution
  const priorityMap: Record<string, number> = {}
  tickets.forEach(t => { priorityMap[t.priority] = (priorityMap[t.priority] ?? 0) + 1 })
  const priorityData = Object.entries(priorityMap).map(([priority, value]) => ({ priority, value }))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Management Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Celkem ticketů" value={total} />
        <KpiCard label="Otevřených" value={open} sub={`${total ? Math.round(open / total * 100) : 0}% z celku`} />
        <KpiCard label="Kritických (aktivní)" value={critical} />
        <KpiCard label="Aktivních agentů" value={`${activeAgents}/${agents.length}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-slate-700 mb-4">Tickety podle stavu</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} layout="vertical" margin={{ left: 16, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {statusData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={STATUS_COLORS[entry.status as TicketStatus] ?? '#6366f1'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-slate-700 mb-4">Tickety podle priority</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="priority"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ priority, percent }) => `${priority} ${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[entry.priority as TicketPriority] ?? '#94a3b8'} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
