import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adviserById, campaignById } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import Modal from '../components/Modal.jsx'
import { StatusBadge } from '../components/RecordSummary.jsx'
import { formatWhen } from '../lib/format.js'
import { canDelete, canEdit, maskMobile, sharedIdentifierIds, visibleTo } from '../lib/rules.js'
import { useTitle } from '../lib/useTitle.js'

export default function Register() {
  const { user } = useAuth()
  const { consents, withdrawConsent, archiveConsent } = useData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('current')
  const [source, setSource] = useState('all')
  const [pending, setPending] = useState(null)
  const [reason, setReason] = useState('')
  useTitle('Consent register')

  const duplicates = useMemo(function () { return sharedIdentifierIds(consents) }, [consents])

  const rows = consents.filter(function (record) {
    if (!visibleTo(user, record)) return false
    if (status === 'current' && record.status === 'archived') return false
    if (status !== 'current' && status !== 'all' && record.status !== status) return false
    if (source !== 'all' && record.source !== source) return false
    const campaign = campaignById(record.campaignId)
    const adviser = adviserById(record.adviserId)
    const hay = [
      record.subject.fullName,
      record.subject.email,
      record.subject.mobile,
      record.subject.nationalId,
      campaign ? campaign.name : '',
      adviser ? adviser.name : '',
      record.status,
      record.source,
    ].join(' ').toLowerCase()
    return hay.indexOf(query.trim().toLowerCase()) >= 0
  })

  function closeDialog() {
    setPending(null)
    setReason('')
  }

  function confirm() {
    if (!pending) return
    if (reason.trim().length < 8) return
    if (pending.type === 'withdraw') {
      withdrawConsent(pending.record.id, { actor: user.name, detail: reason.trim(), origin: 'Staff portal' })
    } else {
      archiveConsent(pending.record.id, { actor: user.name, detail: reason.trim() })
    }
    closeDialog()
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Consent register</h1>
        <p className="lede">Search by name, email, mobile, national ID, or campaign. Open a row to view the audit history and the record QR.</p>
      </header>
      <div className="toolbar card">
        <label className="field grow">
          Search
          <input value={query} onChange={function (event) { setQuery(event.target.value) }} placeholder="Name, email, mobile, ID, campaign" />
        </label>
        <label className="field">
          Status
          <select value={status} onChange={function (event) { setStatus(event.target.value) }}>
            <option value="current">Active and withdrawn</option>
            <option value="active">Active</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="archived">Archived</option>
            <option value="all">All, including archived</option>
          </select>
        </label>
        <label className="field">
          Source
          <select value={source} onChange={function (event) { setSource(event.target.value) }}>
            <option value="all">All sources</option>
            <option value="digital">Entered on screen</option>
            <option value="paper">Scanned form</option>
          </select>
        </label>
      </div>
      <div className="table-wrap card">
        <table className="data">
          <thead>
            <tr>
              <th>Prospect</th>
              <th>Contact</th>
              <th>Campaign</th>
              <th>Consent</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>No consent records match this search.</td>
              </tr>
            ) : rows.map(function (record) {
              const campaign = campaignById(record.campaignId)
              return (
                <tr key={record.id}>
                  <td>
                    <strong>{record.subject.fullName}</strong>
                    <div className="muted">{record.source === 'paper' ? 'Scanned form' : 'Entered on screen'}</div>
                    {duplicates[record.id] ? <span className="badge warn">Shared identifier</span> : null}
                  </td>
                  <td>
                    {record.subject.email}
                    <div className="muted">{user.role === 'compliance' ? maskMobile(record.subject.mobile) : record.subject.mobile}</div>
                  </td>
                  <td>{campaign ? campaign.name : '—'}</td>
                  <td><StatusBadge status={record.status} /></td>
                  <td>{formatWhen(record.updatedAt)}</td>
                  <td className="row-actions">
                    <Link className="btn ghost small" to={'/consents/' + record.id}>View</Link>
                    {canEdit(user, record) ? <Link className="btn ghost small" to={'/consents/' + record.id + '/edit'}>Edit</Link> : null}
                    {canEdit(user, record) && record.status === 'active' ? (
                      <button type="button" className="btn ghost small" onClick={function () { setPending({ type: 'withdraw', record: record }) }}>
                        Withdraw
                      </button>
                    ) : null}
                    {canDelete(user, record) ? (
                      <button type="button" className="btn danger small" onClick={function () { setPending({ type: 'delete', record: record }) }}>
                        Delete
                      </button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {pending ? (
        <Modal
          title={pending.type === 'delete' ? 'Delete this consent from the register?' : 'Withdraw this consent?'}
          onClose={closeDialog}
        >
          <p>
            {pending.type === 'delete'
              ? pending.record.subject.fullName + ' will leave the active register. The audit history stays available when archived records are included in search.'
              : 'Marketing contact for ' + pending.record.subject.fullName + ' will be blocked. The previous choice stays in the audit history.'}
          </p>
          <label className="field">
            Reason
            <textarea rows={3} value={reason} onChange={function (event) { setReason(event.target.value) }} />
          </label>
          {reason.trim().length > 0 && reason.trim().length < 8 ? <p className="error">Enter at least 8 characters.</p> : null}
          <div className="dialog-actions">
            <button type="button" className={pending.type === 'delete' ? 'btn danger' : 'btn primary'} onClick={confirm}>
              {pending.type === 'delete' ? 'Delete record' : 'Withdraw consent'}
            </button>
            <button type="button" className="btn ghost" onClick={closeDialog}>Cancel</button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
