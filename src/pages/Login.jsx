import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { roleLabel } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useTitle } from '../lib/useTitle.js'

export default function Login() {
  const { user, directory, login, requestAccess } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [request, setRequest] = useState({ name: '', email: '', password: '' })
  const [requestError, setRequestError] = useState('')
  useTitle('Sign in')

  if (user && user.role === 'pending') return <Navigate to="/access-pending" replace />
  if (user) return <Navigate to="/" replace />

  function submit(event) {
    event.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(result.user.role === 'pending' ? '/access-pending' : '/')
  }

  function sendRequest(event) {
    event.preventDefault()
    const result = requestAccess(request)
    if (!result.ok) {
      setRequestError(result.error)
      return
    }
    navigate('/access-pending')
  }

  return (
    <div className="login-split">
      <section className="brand-panel">
        <p className="eyebrow">Consent Management System</p>
        <h1>Staff sign in for Manulife agents and employees.</h1>
        <ol>
          <li>Each person signs in with their own username and password.</li>
          <li>The first login waits for an admin to approve it and assign a role.</li>
          <li>Password reset stays with ML IT. This screen does not offer one.</li>
          <li>Agents upload paper scans. A prospect enters consent only after scanning the agent QR.</li>
        </ol>
      </section>
      <section className="login-card">
        <h2>Sign in</h2>
        {/* <p className="lede">
          Production will call the Manulife Authentication API and match the person by email. This demo keeps a local directory so the journey can be reviewed.
        </p> */}
        <form onSubmit={submit}>
          <label className="field">
            Username
            <input value={email} onChange={function (event) { setEmail(event.target.value) }} autoComplete="username" placeholder="name@manulife.com" />
          </label>
          <label className="field">
            Password
            <input type="password" value={password} onChange={function (event) { setPassword(event.target.value) }} autoComplete="current-password" />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn primary" type="submit">Sign in</button>
        </form>
        <p className="muted">Password reset is not available here. ML IT manages account passwords.</p>

        <h3>Demo directory</h3>
        {/* <p className="muted">Each row is a different person. The password is not shared.</p> */}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {directory.map(function (account) {
                const access = account.status === 'approved' ? roleLabel(account.role) : account.status === 'pending' ? 'Waiting for admin' : 'Not approved'
                return (
                  <tr key={account.id}>
                    <td>{account.email}</td>
                    <td>{account.password}</td>
                    <td>{access}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <h3>First-time access</h3>
        <p className="lede">Use this when the person can authenticate but has no CMS role yet. The request goes to an admin.</p>
        <form onSubmit={sendRequest}>
          <label className="field">
            Full name
            <input value={request.name} onChange={function (event) { setRequest(Object.assign({}, request, { name: event.target.value })) }} />
          </label>
          <label className="field">
            Username
            <input value={request.email} onChange={function (event) { setRequest(Object.assign({}, request, { email: event.target.value })) }} placeholder="name@manulife.com" />
          </label>
          <label className="field">
            Password
            <input type="password" value={request.password} onChange={function (event) { setRequest(Object.assign({}, request, { password: event.target.value })) }} />
          </label>
          {requestError ? <p className="error">{requestError}</p> : null}
          <button className="btn ghost" type="submit">Send access request</button>
        </form>
      </section>
    </div>
  )
}
