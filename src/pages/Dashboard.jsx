import { useState } from 'react'
import { Link } from 'react-router-dom'
import { adviserById, campaignById, campaignsForUser } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import Modal from '../components/Modal.jsx'
import { formatWhen } from '../lib/format.js'
import { visibleTo } from '../lib/rules.js'
import { useTitle } from '../lib/useTitle.js'

export default function Dashboard() {
  const { user, directory } = useAuth()
  const waiting = directory.filter(function (account) { return account.status === 'pending' }).length
  const { consents } = useData()
  useTitle('Home')

  const mine = consents.filter(function (record) { return visibleTo(user, record) && record.status !== 'archived' })
  const active = mine.filter(function (record) { return record.status === 'active' }).length
  const withdrawn = mine.filter(function (record) { return record.status === 'withdrawn' }).length
  const paper = mine.filter(function (record) { return record.source === 'paper' }).length
  const typed = mine.filter(function (record) { return record.source !== 'paper' }).length
  const activity = mine
    .reduce(function (list, record) {
      return list.concat(
        (record.history || []).map(function (event) {
          return Object.assign({}, event, { name: record.subject.fullName, consentId: record.id })
        })
      )
    }, [])
    .sort(function (a, b) { return String(b.at).localeCompare(String(a.at)) })
    .slice(0, 6)

  const campaigns = campaignsForUser(user)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Good day, {user.name.split(' ')[0]}.</h1>
        <p className="lede">
          {user.role === 'admin'
            ? 'Approve a first login and assign the role. Password reset stays with ML IT.'
            : user.role === 'adviser'
              ? 'Your register shows consent for your campaigns. Upload paper scans here, and give prospects your campaign QR so they can enter consent on their own phone.'
              : user.role === 'compliance'
                ? 'You can review consent, history, and contact decisions. Changes are made by operations or the owning adviser.'
                : 'You can upload paper consent, resolve duplicates, and load the Do Not Contact file.'}
        </p>
      </header>
      {user.role === 'admin' ? (
        <Link to="/access" className={waiting ? 'notice warn admin-wait' : 'notice admin-wait'}>
          <strong>{waiting}</strong>
          <span>
            {waiting === 1
              ? 'access request is waiting for your approval.'
              : 'access requests are waiting for your approval.'}
          </span>
        </Link>
      ) : (
        <div className="stat-groups">
          <section className="stat-group">
            <h2>Consent status</h2>
            <p className="muted">Active and withdrawn together are the records on the register.</p>
            <div className="stats">
              <article className="stat"><strong>{active}</strong><span>Active consent</span></article>
              <article className="stat"><strong>{withdrawn}</strong><span>Withdrawn</span></article>
            </div>
          </section>
          <section className="stat-group">
            <h2>How the form arrived</h2>
            <p className="muted">Scanned and entered on screen are those same records, split by source.</p>
            <div className="stats">
              <article className="stat"><strong>{paper}</strong><span>Scanned forms</span></article>
              <article className="stat"><strong>{typed}</strong><span>Entered on screen</span></article>
            </div>
          </section>
        </div>
      )}
      <div className="split-2 align-start">
        <section className="card">
          <h2>Recent activity</h2>
          {activity.length === 0 ? <p>No consent activity yet.</p> : (
            <ul className="activity">
              {activity.map(function (event) {
                return (
                  <li key={event.id}>
                    <Link to={'/consents/' + event.consentId}>{event.name}</Link>
                    <span>{event.action} · {formatWhen(event.at)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
        <section className="card">
          <h2>Open a journey</h2>
          <div className="link-list">
            {user.role === 'admin' ? <Link to="/access">Review access requests</Link> : null}
            {user.role === 'adviser' || user.role === 'operations' ? <Link to="/intake">Enter a new consent</Link> : null}
            {user.role !== 'admin' ? <Link to="/register">Search the consent register</Link> : null}
            {user.role !== 'admin' ? <Link to="/campaigns">Open a campaign QR</Link> : null}
            {user.role !== 'admin' ? <Link to="/eligibility">Check if contact is allowed</Link> : null}
          </div>
          <h3>Campaigns in view</h3>
          <ul className="activity">
            {campaigns.map(function (campaign) {
              const adviser = adviserById(campaign.adviserId)
              return (
                <li key={campaign.id}>
                  <span>{campaign.name}</span>
                  <span>{adviser ? adviser.name : ''} · {campaign.code}</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
     
    </div>
  )
}
