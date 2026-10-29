import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { campaignsForUser } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import ConsentForm from '../components/ConsentForm.jsx'
import DuplicateDialog from '../components/DuplicateDialog.jsx'
import { formFromRecord, visibleTo, canEdit } from '../lib/rules.js'
import { useTitle } from '../lib/useTitle.js'

export default function EditConsent() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { consents, updateConsent } = useData()
  const record = consents.find(function (item) { return item.id === id })
  const [matches, setMatches] = useState(null)
  const [pending, setPending] = useState(null)
  const [formError, setFormError] = useState('')
  useTitle(record ? 'Edit ' + record.subject.fullName : 'Edit consent')

  if (!record || !visibleTo(user, record)) {
    return <div className="page"><h1>Record not available</h1><Link to="/register">Back to the register</Link></div>
  }
  if (!canEdit(user, record)) {
    return <div className="page"><h1>You cannot edit this record</h1><Link to={'/consents/' + record.id}>View the record</Link></div>
  }

  const campaigns = campaignsForUser(user)

  function payload(values, extra) {
    return Object.assign(
      {
        fullName: values.fullName,
        email: values.email,
        mobile: values.mobile,
        nationalId: values.nationalId,
        dob: values.dob,
        campaignId: values.campaignId,
        mode: values.mode,
        purposes: values.purposes,
        channels: values.channels,
        evidence: values.evidence,
        notes: values.notes,
        actor: user.name,
        origin: 'Staff portal',
        keepEvidence: values.mode !== 'paper',
      },
      extra || {}
    )
  }

  function onSubmit(values) {
    setFormError('')
    const result = updateConsent(record.id, payload(values, { detail: 'Consent updated from the register.' }))
    if (result.status === 'duplicate') {
      setPending(values)
      setMatches(result.matches)
      return
    }
    if (result.status === 'error') {
      setFormError(result.error)
      return
    }
    navigate('/consents/' + record.id)
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Edit {record.subject.fullName}</h1>
        <p className="lede">Saving writes a new effective consent and keeps the previous values in the audit history.</p>
        {record.status === 'withdrawn' ? (
          <p className="notice warn">This consent is withdrawn. Saving will make the new selection active again.</p>
        ) : null}
      </header>
      {formError ? <p className="notice bad">{formError}</p> : null}
      <ConsentForm
        key={record.id}
        campaigns={campaigns}
        initial={formFromRecord(record)}
        captureMode={record.source === 'paper' ? 'paper' : 'digital'}
        submitLabel="Update consent"
        onSubmit={onSubmit}
      />
      {matches ? (
        <DuplicateDialog
          matches={matches}
          allowUpdate={false}
          allowSeparate={user.role === 'operations'}
          labelFor={function (match) { return match.subject.fullName + ' · ' + match.subject.email }}
          onUpdate={function () {}}
          onSeparate={function (reason) {
            const result = updateConsent(record.id, payload(pending, {
              overrideReason: reason,
              detail: 'Updated even though an identifier matches another record. Reason: ' + reason,
              identityNote: 'Saved against this record with a duplicate override. ' + reason,
            }))
            if (result.status === 'updated') navigate('/consents/' + record.id)
            else setFormError(result.error || 'The update was not saved.')
          }}
          onClose={function () { setMatches(null) }}
        />
      ) : null}
    </div>
  )
}
