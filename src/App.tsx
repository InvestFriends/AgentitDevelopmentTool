import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Layout from '@/components/layout/Layout'
import Auth from '@/pages/Auth'
import TicketsPage from '@/pages/tickets/TicketsPage'
import NewTicketPage from '@/pages/tickets/NewTicketPage'
import TicketDetailPage from '@/pages/tickets/TicketDetailPage'
import AgentsPage from '@/pages/agents/AgentsPage'
import AgentDetailPage from '@/pages/agents/AgentDetailPage'
import WorkflowsPage from '@/pages/workflows/WorkflowsPage'
import TeamsPage from '@/pages/teams/TeamsPage'
import ReleasesPage from '@/pages/releases/ReleasesPage'
import ManagementDashboard from '@/pages/dashboards/ManagementDashboard'
import TeamDashboard from '@/pages/dashboards/TeamDashboard'
import AgentDashboard from '@/pages/dashboards/AgentDashboard'

function ProtectedLayout() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="text-slate-400">Načítám...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Layout />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard/management" replace />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/new" element={<NewTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:id" element={<AgentDetailPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/releases" element={<ReleasesPage />} />
        <Route path="/dashboard/management" element={<ManagementDashboard />} />
        <Route path="/dashboard/team" element={<TeamDashboard />} />
        <Route path="/dashboard/agent" element={<AgentDashboard />} />
      </Route>
    </Routes>
  )
}
