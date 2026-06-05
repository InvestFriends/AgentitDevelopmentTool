import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '@/integrations/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Release } from '@/types'

async function fetchReleases(): Promise<Release[]> {
  const { data, error } = await supabase
    .from('releases')
    .select('*, released_by:users!released_by_user_id(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Release[]
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RELEASED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

export default function ReleasesPage() {
  const { data: releases, isLoading } = useQuery({
    queryKey: ['releases'],
    queryFn: fetchReleases,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Releases</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !releases?.length ? (
        <div className="text-center py-16 text-slate-400">Žádné releases</div>
      ) : (
        <div className="space-y-3">
          {releases.map(r => (
            <div key={r.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-bold text-slate-800">{r.version}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {r.status}
                    </span>
                  </div>
                  {r.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  {r.release_date && (
                    <div className="text-sm text-slate-500">
                      {format(new Date(r.release_date), 'd.M.yyyy')}
                    </div>
                  )}
                  {(r as any).released_by && (
                    <div className="text-xs text-slate-400 mt-0.5">{(r as any).released_by.full_name}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
