import { NavLink, Outlet } from 'react-router-dom'
import { roleLabel } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'

const LINKS = [
  { to: '/', label: 'Home', end: true, roles: ['adviser', 'operations', 'compliance', 'admin'] },
  { to: '/intake', label: 'New consent', roles: ['adviser', 'operations'] },
  { to: '/register', label: 'Consent register', roles: ['adviser', 'operations', 'compliance'] },
  { to: '/campaigns', label: 'Campaign QR', roles: ['adviser', 'operations', 'compliance'] },
  { to: '/eligibility', label: 'Eligibility', roles: ['adviser', 'operations', 'compliance'] },
  { to: '/dnc', label: 'Do not contact', roles: ['operations', 'compliance'] },
  { to: '/access', label: 'Access requests', roles: ['admin'] },
]

export default function Shell() {
  const { user, logout, directory } = useAuth()
  const { storageError, clearStorageError } = useData()
  const waiting = directory.filter(function (account) { return account.status === 'pending' }).length

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <div className="brand">
            CMS <span>Consent</span>
          </div>
        </div>
        <div className="who">
          <div>
            <strong>{user.name}</strong>
            <span className="role-pill">{roleLabel(user.role)}</span>
          </div>
          <button type="button" className="btn ghost small" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <nav className="nav">
        {LINKS.filter(function (link) {
          return link.roles.indexOf(user.role) >= 0
        }).map(function (link) {
          return (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
              {link.to === '/access' ? <span className={waiting ? 'nav-count hot' : 'nav-count'}>{waiting}</span> : null}
            </NavLink>
          )
        })}
      </nav>
      {storageError ? (
        <div className="page">
          <div className="notice bad">
            {storageError}{' '}
            <button type="button" className="btn ghost small" onClick={clearStorageError}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <Outlet />
    </div>
  )
}
