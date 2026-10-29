import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Shell from './components/Shell.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import IntakePage from './pages/IntakePage.jsx'
import Register from './pages/Register.jsx'
import ConsentDetail from './pages/ConsentDetail.jsx'
import EditConsent from './pages/EditConsent.jsx'
import Campaigns from './pages/Campaigns.jsx'
import PublicIntake from './pages/PublicIntake.jsx'
import PublicRecord from './pages/PublicRecord.jsx'
import Thanks from './pages/Thanks.jsx'
import Eligibility from './pages/Eligibility.jsx'
import DncPage from './pages/DncPage.jsx'
import Preferences from './pages/Preferences.jsx'
import Unsubscribe from './pages/Unsubscribe.jsx'
import AccessPending from './pages/AccessPending.jsx'
import AccessRequests from './pages/AccessRequests.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(function () { window.scrollTo(0, 0) }, [pathname])
  return null
}

function RequireAuth() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

function RoleGate({ allow, children }) {
  const { user } = useAuth()
  if (!user || allow.indexOf(user.role) < 0) return <Navigate to="/" replace />
  return children
}

function ApprovedOnly() {
  const { user } = useAuth()
  if (user && user.role === 'pending') return <Navigate to="/access-pending" replace />
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/intake/:code" element={<PublicIntake />} />
        <Route path="/record/:token" element={<PublicRecord />} />
        <Route path="/thanks/:token" element={<Thanks />} />
        <Route path="/preferences/:token" element={<Preferences />} />
        <Route path="/unsubscribe/:token" element={<Unsubscribe />} />
        <Route element={<RequireAuth />}>
          <Route path="/access-pending" element={<AccessPending />} />
          <Route element={<ApprovedOnly />}>
            <Route element={<Shell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/intake" element={<RoleGate allow={['adviser', 'operations']}><IntakePage /></RoleGate>} />
              <Route path="/register" element={<RoleGate allow={['adviser', 'operations', 'compliance']}><Register /></RoleGate>} />
              <Route path="/consents/:id" element={<ConsentDetail />} />
              <Route path="/consents/:id/edit" element={<RoleGate allow={['adviser', 'operations']}><EditConsent /></RoleGate>} />
              <Route path="/campaigns" element={<RoleGate allow={['adviser', 'operations', 'compliance']}><Campaigns /></RoleGate>} />
              <Route path="/eligibility" element={<RoleGate allow={['adviser', 'operations', 'compliance']}><Eligibility /></RoleGate>} />
              <Route path="/dnc" element={<RoleGate allow={['operations', 'compliance']}><DncPage /></RoleGate>} />
              <Route path="/access" element={<RoleGate allow={['admin']}><AccessRequests /></RoleGate>} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
