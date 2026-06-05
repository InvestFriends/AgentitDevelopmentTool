import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Ticket, Bot, GitBranch, Users, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard/management', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets', icon: Ticket, label: 'Tickety' },
  { to: '/agents', icon: Bot, label: 'Agenti' },
  { to: '/workflows', icon: GitBranch, label: 'Workflow' },
  { to: '/teams', icon: Users, label: 'Týmy' },
  { to: '/releases', icon: Package, label: 'Releases' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-4 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-sm">AgentitDev</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
