import { useState } from 'react'
import { campaignById } from '../data/seed.js'
import { useData } from '../context/DataContext.jsx'
import ConsentForm from './ConsentForm.jsx'
import DuplicateDialog from './DuplicateDialog.jsx'

export default function ConsentJourney({
  actor,
  origin,
  detail,
  campaigns,
  lockedCampaign,
  adviserForCampaign,
  allowSeparate,
  canUpdateMatch,
  onDone,
  heading,
  lede,
  captureMode,
  submitLabel,
}) {
  const { createConsent, updateConsent } = useData()
  const [matches, setMatches] = useState(null)
  const [pending, setPending] = useState(null)
  const [formError, setFormError] = useState('')

  function inputFrom(values, extra) {
    const campaign = lockedCampaign || campaignById(values.campaignId)
    return Object.assign(
      {
        fullName: values.fullName,
        email: values.email,
        mobile: values.mobile,
        nationalId: values.nationalId,
        dob: values.dob,
        campaignId: campaign.id,
        adviserId: adviserForCampaign(campaign),
        mode: values.mode,
        purposes: values.purposes,
        channels: values.channels,
        evidence: values.evidence,
        notes: values.notes,
        actor: actor,
        origin: origin,
        detail: detail,
      },
      extra || {}
    )
  }

  function finish(result) {
    if (result.status === 'error') {
      setFormError(result.error)
      return
    }
    if (result.record) onDone(result.record)
  }

  function onSubmit(values) {
    setFormError('')
    const result = createConsent(inputFrom(values))
    if (result.status === 'duplicate') {
      setPending(values)
      setMatches(result.matches)
      return
    }
    finish(result)
  }

  function onUpdate(record) {
    const fields = matches[0].fields.join(', ')
    const result = updateConsent(
      record.id,
      inputFrom(pending, {
        action: 'Updated',
        detail: 'Existing person reused because ' + fields + ' matched.',
        identityNote: 'Updated an existing person instead of creating a duplicate.',
        keepEvidence: pending.mode !== 'paper',
      })
    )
    if (result.status === 'duplicate') {
      setMatches(result.matches)
      return
    }
    setMatches(null)
    setPending(null)
    finish(result)
  }

  function onSeparate(reason) {
    const result = createConsent(inputFrom(pending, { overrideReason: reason }))
    setMatches(null)
    setPending(null)
    if (result.status === 'duplicate') {
      setPending(pending)
      setMatches(result.matches)
      return
    }
    finish(result)
  }

  const singleOwned = matches && matches.length === 1 && canUpdateMatch(matches[0].record)

  return (
    <div>
      <header className="page-head">
        <h1>{heading}</h1>
        <p className="lede">{lede}</p>
      </header>
      {formError ? <p className="notice bad">{formError}</p> : null}
      <ConsentForm
        campaigns={campaigns}
        lockedCampaign={lockedCampaign}
        initial={pending}
        captureMode={captureMode}
        submitLabel={submitLabel || 'Submit consent'}
        onSubmit={onSubmit}
      />
      {matches ? (
        <DuplicateDialog
          matches={matches}
          allowUpdate={singleOwned}
          allowSeparate={allowSeparate && matches.length >= 1}
          labelFor={function (record) {
            return record.subject.fullName + ' · ' + record.subject.email
          }}
          onUpdate={onUpdate}
          onSeparate={onSeparate}
          onClose={function () {
            setMatches(null)
          }}
        />
      ) : null}
    </div>
  )
}
