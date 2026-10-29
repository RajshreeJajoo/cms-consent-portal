import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import Modal from '../components/Modal.jsx'
import RecordSummary from '../components/RecordSummary.jsx'
import { formatWhen } from '../lib/format.js'
import { canDelete, canEdit, visibleTo } from '../lib/rules.js'
import { useTitle } from '../lib/useTitle.js'

export default function ConsentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { consents, withdrawConsent, archiveConsent } = useData()
  const record = consents.find(function (item) { return item.id === id })
  const [pending, setPending] = useState(null)
  const [reason, setReason] = useState('')
  useTitle(record ? record.subject.fullName : 'Consent')

  if (!record || !visibleTo(user, record)) {
    return (
      <div className="page">
        <h1>Record not available</h1>
        <p>This consent is not in your view.</p>
        <Link to="/register">Back to the register</Link>
      </div>
    )
  }

  function closeDialog() {
    setPending(null)
    setReason('')
  }

  function confirm() {
    if (reason.trim().length < 8) return
    if (pending === 'withdraw') withdrawConsent(record.id, { actor: user.name, detail: reason.trim() })
    else archiveConsent(record.id, { actor: user.name, detail: reason.trim() })
    closeDialog()
  }

  return (
    <div className="page">
      <header className="page-head row-head">
        <div>
          <h1>{record.subject.fullName}</h1>
          <p className="lede">Current consent, evidence, and the history of changes.</p>
        </div>
        <div className="row-actions">
          {canEdit(user, record) ? <Link className="btn primary" to={'/consents/' + record.id + '/edit'}>Edit</Link> : null}
          {canEdit(user, record) && record.status === 'active' ? (
            <button type="button" className="btn ghost" onClick={function () { setPending('withdraw') }}>Withdraw</button>
          ) : null}
          {canDelete(user, record) ? (
            <button type="button" className="btn danger" onClick={function () { setPending('delete') }}>Delete</button>
          ) : null}
        </div>
      </header>
      <RecordSummary record={record} maskSensitive={user.role === 'compliance'} />
      <p>
        <Link to={'/eligibility?identifier=' + encodeURIComponent(record.subject.email)}>Check if marketing contact is allowed</Link>
      </p>
      <p className="muted">Downstream copy: {record.salesforceSync}. Customer system copy: {record.casSync}.</p>
      <section className="card">
        <h2>Audit history</h2>
        <ol className="timeline">
          {(record.history || []).map(function (event) {
            return (
              <li key={event.id}>
                <strong>{event.action}</strong>
                <span>{formatWhen(event.at)} · {event.actor} · {event.source}</span>
                <p>{event.detail}</p>
              </li>
            )
          })}
        </ol>
      </section>
      {pending ? (
        <Modal title={pending === 'delete' ? 'Delete this consent from the register?' : 'Withdraw this consent?'} onClose={closeDialog}>
          <label className="field">
            Reason
            <textarea rows={3} value={reason} onChange={function (event) { setReason(event.target.value) }} />
          </label>
          {reason.trim().length > 0 && reason.trim().length < 8 ? <p className="error">Enter at least 8 characters.</p> : null}
          <div className="dialog-actions">
            <button type="button" className={pending === 'delete' ? 'btn danger' : 'btn primary'} onClick={confirm}>
              {pending === 'delete' ? 'Delete record' : 'Withdraw consent'}
            </button>
            <button type="button" className="btn ghost" onClick={closeDialog}>Cancel</button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
