import { useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '/dashboard/management': 'Management Dashboard',
  '/dashboard/team': 'Team Dashboard',
  '/dashboard/agent': 'Agent Dashboard',
  '/tickets': 'Tickety',
  '/tickets/new': 'Nový ticket',
  '/agents': 'Agenti',
  '/workflows': 'Workflow',
  '/teams': 'Týmy',
  '/releases': 'Releases',
}

export default function Header() {
  const { pathname } = useLocation()
  const { profile, signOut } = useAuth()

  const label = routeLabels[pathname] ?? 'AgentitDevelopmentTool'

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-slate-800">{label}</h1>
      <div className="flex items-center gap-3">
        {profile && (
          <span className="text-sm text-slate-600">{profile.full_name || profile.email}</span>
        )}
        <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-500">
          <LogOut className="w-4 h-4 mr-1" /> Odhlásit
        </Button>
      </div>
    </header>
  )
}
