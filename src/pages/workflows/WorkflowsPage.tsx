import { TicketStatus } from '@/types'

const STATUS_GROUPS: { label: string; statuses: TicketStatus[]; color: string }[] = [
  { label: 'Příjem', statuses: ['NEW', 'TRIAGE'], color: 'bg-slate-100 border-slate-300' },
  { label: 'Analýza', statuses: ['BUSINESS_ANALYSIS', 'TECHNICAL_ANALYSIS', 'SECURITY_REVIEW'], color: 'bg-blue-50 border-blue-200' },
  { label: 'Design & Vývoj', statuses: ['SOLUTION_DESIGN', 'DEVELOPMENT', 'CODE_REVIEW'], color: 'bg-indigo-50 border-indigo-200' },
  { label: 'Testování', statuses: ['TESTING', 'UAT'], color: 'bg-yellow-50 border-yellow-200' },
  { label: 'Release', statuses: ['READY_FOR_RELEASE', 'RELEASED'], color: 'bg-green-50 border-green-200' },
  { label: 'Ukončeno', statuses: ['CLOSED', 'CANCELLED', 'REJECTED'], color: 'bg-slate-50 border-slate-200' },
  { label: 'Výjimky', statuses: ['BLOCKED', 'ON_HOLD', 'REOPENED'], color: 'bg-red-50 border-red-200' },
]

const STATUS_LABELS: Record<TicketStatus, string> = {
  NEW: 'Nový', TRIAGE: 'Triage', BUSINESS_ANALYSIS: 'Business analýza',
  TECHNICAL_ANALYSIS: 'Tech. analýza', SECURITY_REVIEW: 'Security review',
  SOLUTION_DESIGN: 'Solution design', DEVELOPMENT: 'Vývoj', CODE_REVIEW: 'Code review',
  TESTING: 'Testování', UAT: 'UAT', READY_FOR_RELEASE: 'Připraven',
  RELEASED: 'Vydán', CLOSED: 'Uzavřen', BLOCKED: 'Blokován',
  REJECTED: 'Zamítnut', ON_HOLD: 'Pozastaveno', REOPENED: 'Znovu otevřen', CANCELLED: 'Zrušen',
}

const AGENTS: Partial<Record<TicketStatus, string>> = {
  TRIAGE: 'Product Owner',
  BUSINESS_ANALYSIS: 'Business Analyst',
  TECHNICAL_ANALYSIS: 'IT Analyst',
  SECURITY_REVIEW: 'Security Analyst',
  SOLUTION_DESIGN: 'Solution Architect',
  DEVELOPMENT: 'Developer',
  CODE_REVIEW: 'Code Reviewer',
  TESTING: 'QA Tester',
  UAT: 'QA Tester',
  READY_FOR_RELEASE: 'Release Manager',
  RELEASED: 'Release Manager',
}

export default function WorkflowsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Workflow stavového stroje</h1>
      <p className="text-sm text-slate-500">Vizualizace přechodů ticketu přes 19 stavů a přiřazených AI agentů.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {STATUS_GROUPS.map(group => (
          <div key={group.label} className={`border rounded-lg p-4 ${group.color}`}>
            <h2 className="font-semibold text-slate-700 mb-3">{group.label}</h2>
            <div className="space-y-2">
              {group.statuses.map(s => (
                <div key={s} className="bg-white border rounded p-2.5 flex items-center justify-between shadow-sm">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{STATUS_LABELS[s]}</div>
                    <div className="text-xs text-slate-400 font-mono">{s}</div>
                  </div>
                  {AGENTS[s] && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {AGENTS[s]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-slate-700 mb-3">Hlavní tok</h2>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {(['NEW','TRIAGE','BUSINESS_ANALYSIS','TECHNICAL_ANALYSIS','SECURITY_REVIEW','SOLUTION_DESIGN','DEVELOPMENT','CODE_REVIEW','TESTING','UAT','READY_FOR_RELEASE','RELEASED','CLOSED'] as TicketStatus[]).map((s, i, arr) => (
            <span key={s} className="flex items-center gap-1">
              <span className="bg-slate-100 border rounded px-2 py-1 font-medium">{STATUS_LABELS[s]}</span>
              {i < arr.length - 1 && <span className="text-slate-400">→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
