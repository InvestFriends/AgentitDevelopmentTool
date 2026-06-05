import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { fetchAgentById, fetchAgentQueue } from '@/services/agentService'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AgentType } from '@/types'

const agentTypeLabels: Record<AgentType, string> = {
  PRODUCT_OWNER: 'Product Owner',
  BUSINESS_ANALYST: 'Business Analyst',
  IT_ANALYST: 'IT Analyst',
  SECURITY_ANALYST: 'Security Analyst',
  SOLUTION_ARCHITECT: 'Solution Architect',
  DEVELOPER: 'Developer',
  CODE_REVIEWER: 'Code Reviewer',
  QA_TESTER: 'QA Tester',
  DEVOPS: 'DevOps',
  RELEASE_MANAGER: 'Release Manager',
}

const agentTypeIcons: Record<AgentType, string> = {
  PRODUCT_OWNER: '🎯',
  BUSINESS_ANALYST: '📊',
  IT_ANALYST: '🔍',
  SECURITY_ANALYST: '🔒',
  SOLUTION_ARCHITECT: '🏗️',
  DEVELOPER: '💻',
  CODE_REVIEWER: '👁️',
  QA_TESTER: '🧪',
  DEVOPS: '⚙️',
  RELEASE_MANAGER: '🚀',
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => fetchAgentById(id!),
    enabled: !!id,
  })

  const { data: queue, isLoading: queueLoading } = useQuery({
    queryKey: ['agent-queue', id],
    queryFn: () => fetchAgentQueue(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!agent) return <div className="text-slate-400">Agent nenalezen.</div>

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/agents')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-3xl">{agentTypeIcons[agent.type]}</span>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{agent.name}</h1>
          <div className="text-sm text-slate-500">{agentTypeLabels[agent.type]}</div>
        </div>
        <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${agent.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {agent.status === 'ACTIVE' ? 'Aktivní' : agent.status}
        </span>
      </div>

      <div className="bg-white rounded-lg border p-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1">Model</div>
          <div className="text-sm font-mono">{agent.model ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Typ</div>
          <div className="text-sm">{agentTypeLabels[agent.type]}</div>
        </div>
        {agent.description && (
          <div className="col-span-2">
            <div className="text-xs text-slate-500 mb-1">Popis</div>
            <p className="text-sm text-slate-700">{agent.description}</p>
          </div>
        )}
        {agent.system_prompt && (
          <div className="col-span-2">
            <div className="text-xs text-slate-500 mb-1">System prompt</div>
            <pre className="text-xs text-slate-600 bg-slate-50 p-3 rounded border overflow-auto max-h-40 whitespace-pre-wrap">
              {agent.system_prompt}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">Fronta ticketů</h2>
          <span className="text-sm text-slate-400">{queue?.length ?? 0} aktivních</span>
        </div>
        {queueLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : !queue?.length ? (
          <div className="text-center py-10 text-slate-400 text-sm">Fronta je prázdná</div>
        ) : (
          <div className="divide-y">
            {queue.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50"
              >
                <span className="font-mono text-xs text-slate-400 w-20 shrink-0">{ticket.id.slice(0, 8)}</span>
                <span className="flex-1 text-sm font-medium truncate">{ticket.title}</span>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <span className="text-xs text-slate-400 shrink-0">
                  {format(new Date(ticket.created_at), 'd.M.yyyy')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
