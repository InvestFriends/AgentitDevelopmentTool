import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchAgents } from '@/services/agentService'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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

const agentTypeColors: Record<AgentType, string> = {
  PRODUCT_OWNER: 'bg-purple-100 text-purple-700',
  BUSINESS_ANALYST: 'bg-blue-100 text-blue-700',
  IT_ANALYST: 'bg-cyan-100 text-cyan-700',
  SECURITY_ANALYST: 'bg-red-100 text-red-700',
  SOLUTION_ARCHITECT: 'bg-indigo-100 text-indigo-700',
  DEVELOPER: 'bg-green-100 text-green-700',
  CODE_REVIEWER: 'bg-teal-100 text-teal-700',
  QA_TESTER: 'bg-yellow-100 text-yellow-700',
  DEVOPS: 'bg-orange-100 text-orange-700',
  RELEASE_MANAGER: 'bg-pink-100 text-pink-700',
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

export default function AgentsPage() {
  const navigate = useNavigate()

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Agenti</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents?.map(agent => (
            <div
              key={agent.id}
              onClick={() => navigate(`/agents/${agent.id}`)}
              className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{agentTypeIcons[agent.type]}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${agent.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {agent.is_active ? 'Aktivní' : 'Neaktivní'}
                </span>
              </div>
              <div>
                <div className="font-semibold text-slate-800">{agent.name}</div>
                <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${agentTypeColors[agent.type]}`}>
                  {agentTypeLabels[agent.type]}
                </div>
              </div>
              {agent.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{agent.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
