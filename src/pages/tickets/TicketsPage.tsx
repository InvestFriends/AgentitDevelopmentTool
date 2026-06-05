import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Plus, Search } from 'lucide-react'
import { fetchTickets, TicketFilters } from '@/services/ticketService'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TicketStatus, TicketPriority, TicketType } from '@/types'

const STATUSES: TicketStatus[] = ['NEW','TRIAGE','BUSINESS_ANALYSIS','TECHNICAL_ANALYSIS','SECURITY_REVIEW','SOLUTION_DESIGN','DEVELOPMENT','CODE_REVIEW','TESTING','UAT','READY_FOR_RELEASE','RELEASED','CLOSED','BLOCKED','REJECTED','ON_HOLD','REOPENED','CANCELLED']
const PRIORITIES: TicketPriority[] = ['CRITICAL','HIGH','MEDIUM','LOW']
const TYPES: TicketType[] = ['BUG','FEATURE','CHANGE','EPIC','STORY','TASK']

const typeLabels: Record<TicketType, string> = {
  BUG: 'Bug', FEATURE: 'Feature', CHANGE: 'Změna', EPIC: 'Epic', STORY: 'Story', TASK: 'Úkol',
}

export default function TicketsPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TicketFilters>({})
  const [search, setSearch] = useState('')

  const activeFilters: TicketFilters = { ...filters, search: search || undefined }

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', activeFilters],
    queryFn: () => fetchTickets(activeFilters),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Tickety</h1>
        <Button onClick={() => navigate('/tickets/new')}>
          <Plus className="w-4 h-4 mr-2" /> Nový ticket
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Hledat..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select onValueChange={v => setFilters(f => ({ ...f, status: v === 'all' ? undefined : v as TicketStatus }))}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Stav" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny stavy</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={v => setFilters(f => ({ ...f, priority: v === 'all' ? undefined : v as TicketPriority }))}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priorita" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny</SelectItem>
            {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={v => setFilters(f => ({ ...f, type: v === 'all' ? undefined : v as TicketType }))}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Typ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny typy</SelectItem>
            {TYPES.map(t => <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">#</TableHead>
              <TableHead>Název</TableHead>
              <TableHead className="w-24">Typ</TableHead>
              <TableHead className="w-44">Stav</TableHead>
              <TableHead className="w-32">Priorita</TableHead>
              <TableHead className="w-36">Agent</TableHead>
              <TableHead className="w-28">Vytvořen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : !tickets?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                  Žádné tickety nenalezeny
                </TableCell>
              </TableRow>
            ) : (
              tickets.map(ticket => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <TableCell className="font-mono text-xs text-slate-400">{ticket.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{ticket.title}</TableCell>
                  <TableCell>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {typeLabels[ticket.type]}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={ticket.status} /></TableCell>
                  <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {ticket.agent?.name ?? <span className="text-slate-400 italic">Nepřiřazen</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(ticket.created_at), 'd.M.yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
