import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import PublicFrame from '../components/PublicFrame.jsx'
import { useTitle } from '../lib/useTitle.js'

export default function Unsubscribe() {
  const { token } = useParams()
  return <UnsubscribeEditor key={token} />
}

function UnsubscribeEditor() {
  const { token } = useParams()
  const { findToken, withdrawConsent } = useData()
  const record = findToken(token)
  const [message, setMessage] = useState('')
  useTitle('Unsubscribe')

  if (!record || record.status === 'archived') {
    return (
      <PublicFrame>
        <h1>This unsubscribe link is not active</h1>
        <p>The link may have expired in this demo because the sample data was reset.</p>
        <Link to="/login">Staff sign in</Link>
      </PublicFrame>
    )
  }

  const withdrawn = record.status === 'withdrawn' || message === 'done' || message === 'already'

  return (
    <PublicFrame>
      <header className="page-head">
        <p className="eyebrow">One-click unsubscribe</p>
        <h1>{withdrawn ? 'You are unsubscribed' : 'Withdraw marketing consent'}</h1>
        <p className="lede">
          {withdrawn
            ? 'Marketing contact for this consent has been withdrawn. The change is on the audit history, and the simulated downstream copies are marked synced.'
            : 'This withdraws marketing consent for ' + record.subject.email + '. It does not delete the historical record.'}
        </p>
      </header>
      {message === 'done' ? <p className="notice good">Your request has been processed. You will not be contacted for the marketing consent on this record.</p> : null}
      {withdrawn && message !== 'done' ? <p className="notice">This consent was already withdrawn.</p> : null}
      {record.status === 'active' && message !== 'done' ? (
        <button
          type="button"
          className="btn danger"
          onClick={function () {
            const result = withdrawConsent(record.id, {
              actor: record.subject.fullName,
              origin: 'One-click unsubscribe',
              detail: 'Customer used the unsubscribe link.',
            })
            setMessage(result.already ? 'already' : 'done')
          }}
        >
          Unsubscribe
        </button>
      ) : null}
      <p>
        <Link to={'/preferences/' + record.publicToken}>Review preferences instead</Link>
      </p>
    </PublicFrame>
  )
}
