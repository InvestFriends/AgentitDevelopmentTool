import { TicketStatus } from '@/types'
import { cn } from '@/lib/utils'

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  NEW: { label: 'Nový', className: 'bg-slate-100 text-slate-700' },
  TRIAGE: { label: 'Triage', className: 'bg-purple-100 text-purple-700' },
  BUSINESS_ANALYSIS: { label: 'Business analýza', className: 'bg-blue-100 text-blue-700' },
  TECHNICAL_ANALYSIS: { label: 'Tech. analýza', className: 'bg-blue-100 text-blue-800' },
  SECURITY_REVIEW: { label: 'Security review', className: 'bg-orange-100 text-orange-700' },
  SOLUTION_DESIGN: { label: 'Solution design', className: 'bg-indigo-100 text-indigo-700' },
  DEVELOPMENT: { label: 'Vývoj', className: 'bg-cyan-100 text-cyan-700' },
  CODE_REVIEW: { label: 'Code review', className: 'bg-teal-100 text-teal-700' },
  TESTING: { label: 'Testování', className: 'bg-yellow-100 text-yellow-700' },
  UAT: { label: 'UAT', className: 'bg-yellow-100 text-yellow-800' },
  READY_FOR_RELEASE: { label: 'Připraven', className: 'bg-lime-100 text-lime-700' },
  RELEASED: { label: 'Vydán', className: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Uzavřen', className: 'bg-green-100 text-green-800' },
  BLOCKED: { label: 'Blokován', className: 'bg-red-100 text-red-700' },
  REJECTED: { label: 'Zamítnut', className: 'bg-red-100 text-red-800' },
  ON_HOLD: { label: 'Pozastaveno', className: 'bg-amber-100 text-amber-700' },
  REOPENED: { label: 'Znovu otevřen', className: 'bg-pink-100 text-pink-700' },
  CANCELLED: { label: 'Zrušen', className: 'bg-slate-100 text-slate-500' },
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}
