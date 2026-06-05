import { useQuery } from '@tanstack/react-query'
import { fetchTeams } from '@/services/ticketService'
import { supabase } from '@/integrations/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

async function fetchTeamsWithCounts() {
  const [teams, tickets] = await Promise.all([
    fetchTeams(),
    supabase.from('tickets').select('team_id, status'),
  ])
  const t = tickets.data ?? []
  return teams.map(team => ({
    ...team,
    total: t.filter(tk => tk.team_id === team.id).length,
    open: t.filter(tk => tk.team_id === team.id && !['CLOSED','CANCELLED','REJECTED','RELEASED'].includes(tk.status)).length,
  }))
}

export default function TeamsPage() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams-detail'],
    queryFn: fetchTeamsWithCounts,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Týmy</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams?.map(team => (
            <div key={team.id} className="bg-white border rounded-lg p-5 space-y-3">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{team.name}</h2>
                {team.description && <p className="text-sm text-slate-500 mt-1">{team.description}</p>}
              </div>
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">{team.open}</div>
                  <div className="text-xs text-slate-400">otevřených</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-600">{team.total}</div>
                  <div className="text-xs text-slate-400">celkem</div>
                </div>
              </div>
            </div>
          ))}
          {!teams?.length && (
            <div className="col-span-3 text-center py-12 text-slate-400">Žádné týmy nenalezeny</div>
          )}
        </div>
      )}
    </div>
  )
}
