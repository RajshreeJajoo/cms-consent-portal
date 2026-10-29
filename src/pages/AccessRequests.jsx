import { useState } from 'react'
import { CAMPAIGNS, campaignLabelForAccount, roleLabel } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatWhen } from '../lib/format.js'
import { useTitle } from '../lib/useTitle.js'

const ROLES = [
  { id: 'adviser', label: 'Adviser' },
  { id: 'operations', label: 'Operations' },
  { id: 'compliance', label: 'Compliance' },
]

export default function AccessRequests() {
  const { directory, approveAccess, rejectAccess } = useAuth()
  const [choices, setChoices] = useState({})
  const [error, setError] = useState('')
  useTitle('Access requests')

  const pending = directory.filter(function (account) { return account.status === 'pending' })
  const approved = directory.filter(function (account) { return account.status === 'approved' })

  function choiceFor(id) {
    return choices[id] || { role: 'adviser', campaignId: CAMPAIGNS[0].id }
  }

  function updateChoice(id, partial) {
    setChoices(function (current) {
      const next = Object.assign({}, current)
      next[id] = Object.assign({}, choiceFor(id), partial)
      return next
    })
  }

  function approve(account) {
    const choice = choiceFor(account.id)
    const result = approveAccess(account.id, choice.role, choice.role === 'adviser' ? [choice.campaignId] : [])
    if (!result.ok) setError(result.error)
    else setError('')
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Access requests</h1>
        <p className="lede">
          A first login creates a request. Approve it and assign one role. That role decides which consent records and actions the person can use. People are separated by their own email address.
        </p>
      </header>
      {error ? <p className="notice bad">{error}</p> : null}
      {pending.length === 0 ? <p className="card">No one is waiting for approval.</p> : pending.map(function (account) {
        const choice = choiceFor(account.id)
        return (
          <section key={account.id} className="card">
            <h2>{account.name}</h2>
            <p>{account.email}</p>
            <p className="muted">Requested {formatWhen(account.requestedAt)}</p>
            <div className="split-2">
              <label className="field">
                Role
                <select value={choice.role} onChange={function (event) { updateChoice(account.id, { role: event.target.value }) }}>
                  {ROLES.map(function (role) {
                    return <option key={role.id} value={role.id}>{role.label}</option>
                  })}
                </select>
              </label>
              {choice.role === 'adviser' ? (
                <label className="field">
                  Campaign
                  <select value={choice.campaignId} onChange={function (event) { updateChoice(account.id, { campaignId: event.target.value }) }}>
                    {CAMPAIGNS.map(function (campaign) {
                      return <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    })}
                  </select>
                </label>
              ) : null}
            </div>
            <div className="row-actions">
              <button type="button" className="btn primary" onClick={function () { approve(account) }}>Approve and assign role</button>
              <button type="button" className="btn danger" onClick={function () { rejectAccess(account.id) }}>Reject</button>
            </div>
          </section>
        )
      })}
      <section className="card">
        <h2>Approved users</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Campaigns</th>
              </tr>
            </thead>
            <tbody>
              {approved.map(function (account) {
                return (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{account.email}</td>
                    <td>{roleLabel(account.role)}</td>
                    <td>{campaignLabelForAccount(account)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
