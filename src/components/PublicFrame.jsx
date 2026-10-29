import { Link } from 'react-router-dom'

export default function PublicFrame({ children }) {
  return (
    <div className="public-page">
      <header className="public-bar">
        <Link to="/login" className="brand">
          CMS <span>Consent</span>
        </Link>
        <Link to="/login" className="btn ghost small">
          Staff sign in
        </Link>
      </header>
      <main className="page">{children}</main>
    </div>
  )
}
