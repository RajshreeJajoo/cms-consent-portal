import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTitle } from '../lib/useTitle.js'

export default function AccessPending() {
  const { user, logout } = useAuth()
  useTitle('Access pending')

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'pending') return <Navigate to="/" replace />

  return (
    <div className="login-split">
      <section className="brand-panel">
        <p className="eyebrow">First login</p>
        <h1>Your access request is with an admin.</h1>
        <p>You are signed in as {user.email}. CMS will open after an admin approves this request and assigns a role.</p>
      </section>
      <section className="login-card">
        <h2>{user.name}</h2>
        <p className="lede">No role is assigned yet, so the consent register, paper upload, and campaign QR stay closed.</p>
        <p>Password changes are handled by ML IT. This screen cannot reset a password.</p>
        <button type="button" className="btn ghost" onClick={logout}>Sign out</button>
      </section>
    </div>
  )
}
