import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { CHANNELS, PURPOSES, decideEligibility } from '../lib/rules.js'
import { useTitle } from '../lib/useTitle.js'

export default function Eligibility() {
  const [params] = useSearchParams()
  const { consents, dncEntries } = useData()
  const [identifier, setIdentifier] = useState(params.get('identifier') || '')
  const [purpose, setPurpose] = useState('marketing')
  const [channel, setChannel] = useState('email')
  const [decision, setDecision] = useState(null)
  useTitle('Eligibility')

  function run(event) {
    event.preventDefault()
    if (!String(identifier).trim()) {
      setDecision({
        allowed: false,
        reasonCode: 'NO_RECORD',
        reason: 'Enter an email, mobile number, or national ID.',
      })
      return
    }
    setDecision(
      decideEligibility({
        consents: consents,
        dncEntries: dncEntries,
        identifier: identifier,
        purpose: purpose,
        channel: channel,
      })
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Eligibility</h1>
        <p className="lede">
          Ask whether this person may be contacted for one purpose and one channel. Do Not Contact is applied first, then withdrawal, then the granted purpose, then the granted channel.
        </p>
      </header>
      <form
        className="card form-card"
        onSubmit={run}
      >
        <label className="field">
          Email, mobile, or national ID
          <input value={identifier} onChange={function (event) { setIdentifier(event.target.value) }} />
        </label>
        <div className="split-2">
          <label className="field">
            Purpose
            <select value={purpose} onChange={function (event) { setPurpose(event.target.value) }}>
              {PURPOSES.map(function (item) {
                return <option key={item.id} value={item.id}>{item.label}</option>
              })}
            </select>
          </label>
          <label className="field">
            Channel
            <select value={channel} onChange={function (event) { setChannel(event.target.value) }}>
              {CHANNELS.map(function (item) {
                return <option key={item.id} value={item.id}>{item.label}</option>
              })}
            </select>
          </label>
        </div>
        <button className="btn primary" type="submit">Check contact decision</button>
      </form>
      {decision ? (
        <section className={decision.allowed ? 'notice good' : 'notice bad'}>
          <strong>{decision.allowed ? 'Contact allowed' : 'Contact not allowed'}</strong>
          <p>{decision.reason}</p>
          <p className="muted">Reason code: {decision.reasonCode}</p>
        </section>
      ) : null}
    </div>
  )
}
