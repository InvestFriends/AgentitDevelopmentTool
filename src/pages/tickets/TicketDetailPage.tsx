import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ArrowLeft, Send } from 'lucide-react'
import {
  fetchTicketById, updateTicketStatus, fetchComments, addComment,
  fetchArtifacts, fetchAuditLog, fetchRisks, fetchTestCases,
} from '@/services/ticketService'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { TicketStatus } from '@/types'

const STATUSES: TicketStatus[] = [
  'NEW','TRIAGE','BUSINESS_ANALYSIS','TECHNICAL_ANALYSIS','SECURITY_REVIEW',
  'SOLUTION_DESIGN','DEVELOPMENT','CODE_REVIEW','TESTING','UAT',
  'READY_FOR_RELEASE','RELEASED','CLOSED','BLOCKED','REJECTED','ON_HOLD','REOPENED','CANCELLED',
]

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicketById(id!),
    enabled: !!id,
  })

  const { data: comments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id!),
    enabled: !!id,
  })

  const { data: artifacts } = useQuery({
    queryKey: ['artifacts', id],
    queryFn: () => fetchArtifacts(id!),
    enabled: !!id,
  })

  const { data: auditLog } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => fetchAuditLog(id!),
    enabled: !!id,
  })

  const { data: risks } = useQuery({
    queryKey: ['risks', id],
    queryFn: () => fetchRisks(id!),
    enabled: !!id,
  })

  const { data: testCases } = useQuery({
    queryKey: ['testcases', id],
    queryFn: () => fetchTestCases(id!),
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => updateTicketStatus(id!, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id] })
      qc.invalidateQueries({ queryKey: ['audit', id] })
      toast.success('Stav ticketu aktualizován')
    },
    onError: () => toast.error('Nepodařilo se změnit stav'),
  })

  const commentMutation = useMutation({
    mutationFn: () => addComment(id!, comment),
    onSuccess: () => {
      setComment('')
      qc.invalidateQueries({ queryKey: ['comments', id] })
    },
    onError: () => toast.error('Nepodařilo se přidat komentář'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!ticket) return <div className="text-slate-400">Ticket nenalezen.</div>

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="font-mono text-sm text-slate-400">{ticket.id.slice(0, 8)}</span>
        <h1 className="text-xl font-bold text-slate-800 flex-1 truncate">{ticket.title}</h1>
      </div>

      <div className="bg-white rounded-lg border p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1">Stav</div>
          <Select
            value={ticket.status}
            onValueChange={v => statusMutation.mutate(v as TicketStatus)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Priorita</div>
          <PriorityBadge priority={ticket.priority} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Agent</div>
          <div className="text-sm">{ticket.agent?.name ?? <span className="text-slate-400 italic">Nepřiřazen</span>}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Tým</div>
          <div className="text-sm">{ticket.team?.name ?? <span className="text-slate-400 italic">—</span>}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Typ</div>
          <div className="text-sm font-medium">{ticket.type}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Reporter</div>
          <div className="text-sm">{ticket.reporter?.full_name ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Vytvořen</div>
          <div className="text-sm">{format(new Date(ticket.created_at), 'd.M.yyyy HH:mm')}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Aktualizován</div>
          <div className="text-sm">{format(new Date(ticket.updated_at), 'd.M.yyyy HH:mm')}</div>
        </div>
      </div>

      {ticket.description && (
        <div className="bg-white rounded-lg border p-4">
          <div className="text-xs text-slate-500 mb-2">Popis</div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      )}

      <Tabs defaultValue="comments">
        <TabsList>
          <TabsTrigger value="comments">Komentáře ({comments?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="artifacts">Artefakty ({artifacts?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="risks">Rizika ({risks?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="testcases">Test cases ({testCases?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({auditLog?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-3 mt-3">
          {comments?.length === 0 && (
            <div className="text-slate-400 text-sm text-center py-8">Žádné komentáře</div>
          )}
          {comments?.map(c => (
            <div key={c.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {c.author?.full_name ?? c.agent?.name ?? 'Neznámý'}
                </span>
                {c.is_internal && <Badge variant="outline" className="text-xs">Interní</Badge>}
                <span className="text-xs text-slate-400 ml-auto">
                  {format(new Date(c.created_at), 'd.M.yyyy HH:mm')}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
          <div className="bg-white border rounded-lg p-3 space-y-2">
            <Textarea
              placeholder="Napište komentář..."
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={!comment.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate()}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {commentMutation.isPending ? 'Odesílám...' : 'Odeslat'}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="artifacts" className="mt-3">
          {artifacts?.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-8">Žádné artefakty</div>
          ) : (
            <div className="space-y-2">
              {artifacts?.map(a => (
                <div key={a.id} className="bg-white border rounded-lg p-3 flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{a.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.type} • {a.agent?.name} • v{a.version}</div>
                    {a.content && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.content}</p>}
                  </div>
                  <span className="text-xs text-slate-400">{format(new Date(a.created_at), 'd.M.yyyy')}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="risks" className="mt-3">
          {risks?.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-8">Žádná rizika</div>
          ) : (
            <div className="space-y-2">
              {risks?.map(r => (
                <div key={r.id} className="bg-white border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{r.title}</span>
                    <Badge variant="outline" className="text-xs">{r.severity}</Badge>
                    <Badge variant="outline" className="text-xs">{r.status}</Badge>
                  </div>
                  {r.description && <p className="text-xs text-slate-600">{r.description}</p>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="testcases" className="mt-3">
          {testCases?.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-8">Žádné test cases</div>
          ) : (
            <div className="space-y-2">
              {testCases?.map(tc => (
                <div key={tc.id} className="bg-white border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{tc.title}</span>
                    <Badge variant="outline" className="text-xs">{tc.status}</Badge>
                    <Badge variant="outline" className="text-xs">{tc.type}</Badge>
                  </div>
                  {tc.description && <p className="text-xs text-slate-600">{tc.description}</p>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-3">
          {auditLog?.length === 0 ? (
            <div className="text-slate-400 text-sm text-center py-8">Žádné záznamy</div>
          ) : (
            <div className="space-y-2">
              {auditLog?.map(log => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <span className="text-slate-400 text-xs w-32 shrink-0 pt-0.5">
                    {format(new Date(log.created_at), 'd.M.yyyy HH:mm')}
                  </span>
                  <div>
                    <span className="font-medium">{log.action}</span>
                    {log.user && <span className="text-slate-500"> • {log.user.full_name}</span>}
                    {log.agent && <span className="text-slate-500"> • {log.agent.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
