import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createTicket, fetchTeams } from '@/services/ticketService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { TicketPriority, TicketType } from '@/types'

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'CRITICAL', label: 'Kritická' },
  { value: 'HIGH', label: 'Vysoká' },
  { value: 'MEDIUM', label: 'Střední' },
  { value: 'LOW', label: 'Nízká' },
]

const TYPES: { value: TicketType; label: string }[] = [
  { value: 'BUG', label: 'Bug' },
  { value: 'FEATURE', label: 'Feature' },
  { value: 'CHANGE', label: 'Změna' },
  { value: 'EPIC', label: 'Epic' },
  { value: 'STORY', label: 'Story' },
  { value: 'TASK', label: 'Úkol' },
]

export default function NewTicketPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '' as TicketType | '',
    priority: 'MEDIUM' as TicketPriority,
    team_id: '',
  })

  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: fetchTeams })

  const mutation = useMutation({
    mutationFn: () => createTicket({
      title: form.title,
      description: form.description || undefined,
      type: form.type as TicketType,
      priority: form.priority,
      team_id: form.team_id || undefined,
    }),
    onSuccess: (ticket) => {
      toast.success('Ticket byl vytvořen')
      navigate(`/tickets/${ticket.id}`)
    },
    onError: () => toast.error('Nepodařilo se vytvořit ticket'),
  })

  const canSubmit = form.title.trim().length > 0 && form.type !== ''

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">Nový ticket</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Název *</Label>
          <Input
            id="title"
            placeholder="Stručný popis problému nebo požadavku"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Typ *</Label>
            <Select onValueChange={v => setForm(f => ({ ...f, type: v as TicketType }))}>
              <SelectTrigger><SelectValue placeholder="Vyberte typ" /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priorita</Label>
            <Select
              defaultValue="MEDIUM"
              onValueChange={v => setForm(f => ({ ...f, priority: v as TicketPriority }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Tým</Label>
          <Select onValueChange={v => setForm(f => ({ ...f, team_id: v === 'none' ? '' : v }))}>
            <SelectTrigger><SelectValue placeholder="Bez týmu" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Bez týmu</SelectItem>
              {teams?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Popis</Label>
          <Textarea
            id="description"
            placeholder="Podrobný popis, kroky k reprodukci, akceptační kritéria..."
            rows={6}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate('/tickets')}>Zrušit</Button>
          <Button
            disabled={!canSubmit || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Ukládám...' : 'Vytvořit ticket'}
          </Button>
        </div>
      </div>
    </div>
  )
}
