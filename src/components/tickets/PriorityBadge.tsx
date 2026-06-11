import { TicketPriority } from '@/types'
import { cn } from '@/lib/utils'

const config: Record<TicketPriority, { label: string; className: string }> = {
  CRITICAL: { label: 'Kritická', className: 'bg-red-100 text-red-800' },
  HIGH: { label: 'Vysoká', className: 'bg-orange-100 text-orange-800' },
  MEDIUM: { label: 'Střední', className: 'bg-yellow-100 text-yellow-800' },
  LOW: { label: 'Nízká', className: 'bg-green-100 text-green-800' },
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const c = config[priority] ?? { label: priority, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', c.className)}>
      {c.label}
    </span>
  )
}
