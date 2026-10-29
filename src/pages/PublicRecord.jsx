import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import PublicFrame from '../components/PublicFrame.jsx'
import RecordSummary from '../components/RecordSummary.jsx'
import { useTitle } from '../lib/useTitle.js'

export default function PublicRecord() {
  const { token } = useParams()
  const { findToken } = useData()
  const record = findToken(token)
  useTitle(record ? record.subject.fullName : 'Consent record')

  if (!record || record.status === 'archived') {
    return (
      <PublicFrame>
        <h1>This consent link is not active</h1>
        <p>Ask the adviser for a new code if you still need a copy of the submission.</p>
        <Link to="/login">Staff sign in</Link>
      </PublicFrame>
    )
  }

  return (
    <PublicFrame>
      <header className="page-head">
        <p className="eyebrow">Scanned record</p>
        <h1>Campaign and consent</h1>
        <p className="lede">This page is what opens when the record QR is scanned. National ID is masked. The scanned file, when there is one, stays on the staff record.</p>
      </header>
      <RecordSummary record={record} maskIdOnly showEvidence={false} />
      {record.evidence ? <p className="notice">A scanned consent form is held with the staff record.</p> : null}
      <div className="link-list">
        <Link to={'/preferences/' + record.publicToken}>Update preferences</Link>
        <Link to={'/unsubscribe/' + record.publicToken}>Unsubscribe</Link>
      </div>
    </PublicFrame>
  )
}
