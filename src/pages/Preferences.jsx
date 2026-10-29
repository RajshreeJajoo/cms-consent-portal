import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import PublicFrame from '../components/PublicFrame.jsx'
import { StatusBadge } from '../components/RecordSummary.jsx'
import { CHANNELS, PURPOSES } from '../lib/rules.js'
import { useTitle } from '../lib/useTitle.js'

export default function Preferences() {
  const { token } = useParams()
  return <PreferenceEditor key={token} />
}

function PreferenceEditor() {
  const { token } = useParams()
  const { findToken, updateConsent, withdrawConsent } = useData()
  const record = findToken(token)
  const [purposes, setPurposes] = useState(record ? Object.assign({}, record.purposes) : {})
  const [channels, setChannels] = useState(record ? Object.assign({}, record.channels) : {})
  const [saved, setSaved] = useState('')
  useTitle('Preferences')

  if (!record || record.status === 'archived') {
    return (
      <PublicFrame>
        <h1>Preferences are not available</h1>
        <p>This link does not match an active consent.</p>
        <Link to="/login">Staff sign in</Link>
      </PublicFrame>
    )
  }

  function toggle(group, id, setGroup) {
    setSaved('')
    setGroup(function (current) {
      const next = Object.assign({}, current)
      next[id] = !next[id]
      return next
    })
  }

  function save(event) {
    event.preventDefault()
    const anyPurpose = PURPOSES.some(function (item) { return purposes[item.id] })
    const anyChannel = CHANNELS.some(function (item) { return channels[item.id] })
    if (!anyPurpose || !anyChannel) {
      withdrawConsent(record.id, {
        actor: record.subject.fullName,
        origin: 'Preference centre',
        detail: 'Customer cleared purposes or channels, so the consent was withdrawn.',
      })
      setSaved('withdrawn')
      return
    }
    updateConsent(record.id, {
      fullName: record.subject.fullName,
      email: record.subject.email,
      mobile: record.subject.mobile,
      nationalId: record.subject.nationalId,
      dob: record.subject.dob,
      campaignId: record.campaignId,
      mode: record.source === 'paper' ? 'paper' : 'digital',
      purposes: purposes,
      channels: channels,
      evidence: record.evidence,
      notes: record.notes,
      actor: record.subject.fullName,
      origin: 'Preference centre',
      detail: 'Customer updated marketing preferences.',
      keepEvidence: true,
    })
    setSaved('updated')
  }

  const current = findToken(token) || record

  return (
    <PublicFrame>
      <header className="page-head">
        <p className="eyebrow">Preference centre</p>
        <h1>{record.subject.fullName}</h1>
        <p className="lede">Review the purposes and channels currently on file, then save a change. You will see a confirmation here.</p>
        <StatusBadge status={current.status} />
      </header>
      {saved === 'updated' ? <p className="notice good">Your preferences have been updated.</p> : null}
      {saved === 'withdrawn' ? <p className="notice good">Your preferences were cleared and this marketing consent has been withdrawn.</p> : null}
      <form className="card form-card" onSubmit={save}>
        <fieldset>
          <legend>Purposes</legend>
          <div className="choices">
            {PURPOSES.map(function (item) {
              return (
                <label key={item.id} className="choice">
                  <input type="checkbox" checked={Boolean(purposes[item.id])} onChange={function () { toggle('purposes', item.id, setPurposes) }} />
                  {item.label}
                </label>
              )
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend>Channels</legend>
          <div className="choices">
            {CHANNELS.map(function (item) {
              return (
                <label key={item.id} className="choice">
                  <input type="checkbox" checked={Boolean(channels[item.id])} onChange={function () { toggle('channels', item.id, setChannels) }} />
                  {item.label}
                </label>
              )
            })}
          </div>
        </fieldset>
        <button className="btn primary" type="submit">Save preferences</button>
      </form>
      <Link to={'/unsubscribe/' + record.publicToken}>Unsubscribe in one step</Link>
    </PublicFrame>
  )
}
