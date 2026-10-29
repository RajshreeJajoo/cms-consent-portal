import { adviserById, campaignById } from '../data/seed.js'
import { formatBytes, formatDay, formatWhen } from '../lib/format.js'
import { channelLabels, maskMobile, maskNationalId, purposeLabels } from '../lib/rules.js'

export function statusClass(status) {
  if (status === 'active') return 'good'
  if (status === 'withdrawn') return 'bad'
  if (status === 'archived') return 'neutral'
  return 'warn'
}

export function StatusBadge({ status }) {
  const label = status === 'active' ? 'Active' : status === 'withdrawn' ? 'Withdrawn' : status === 'archived' ? 'Archived' : status
  return <span className={'badge ' + statusClass(status)}>{label}</span>
}

export default function RecordSummary({ record, maskSensitive, maskIdOnly, showEvidence }) {
  const campaign = campaignById(record.campaignId)
  const adviser = adviserById(record.adviserId)
  const hideId = Boolean(maskSensitive || maskIdOnly)
  const nationalId = hideId ? maskNationalId(record.subject.nationalId) : record.subject.nationalId || '—'
  const mobile = maskSensitive ? maskMobile(record.subject.mobile) : record.subject.mobile || '—'

  return (
    <div className="summary-grid">
      <section className="card">
        <h2>Campaign</h2>
        {campaign ? (
          <dl className="kv">
            <div><dt>Name</dt><dd>{campaign.name}</dd></div>
            <div><dt>Event</dt><dd>{campaign.eventName}</dd></div>
            <div><dt>Location</dt><dd>{campaign.location}</dd></div>
            <div><dt>Dates</dt><dd>{formatDay(campaign.startDate)} – {formatDay(campaign.endDate)}</dd></div>
            <div><dt>Code</dt><dd>{campaign.code}</dd></div>
            <div><dt>Wording</dt><dd>{campaign.wordingVersion}</dd></div>
            <div><dt>Adviser</dt><dd>{adviser ? adviser.name + ' · ' + adviser.code : '—'}</dd></div>
            <div><dt>Agency</dt><dd>{adviser ? adviser.agency : '—'}</dd></div>
          </dl>
        ) : (
          <p>Campaign details are no longer available.</p>
        )}
        {campaign ? <p>{campaign.summary}</p> : null}
      </section>
      <section className="card">
        <h2>Submitted consent</h2>
        <p><StatusBadge status={record.status} /></p>
        <dl className="kv">
          <div><dt>Name</dt><dd>{record.subject.fullName}</dd></div>
          <div><dt>Email</dt><dd>{record.subject.email}</dd></div>
          <div><dt>Mobile</dt><dd>{mobile || '—'}</dd></div>
          <div><dt>National ID</dt><dd>{nationalId}</dd></div>
          <div><dt>Date of birth</dt><dd>{record.subject.dob ? formatDay(record.subject.dob) : '—'}</dd></div>
          <div><dt>Source</dt><dd>{record.source === 'paper' ? 'Scanned form' : 'Entered on screen'}</dd></div>
          <div><dt>Purposes</dt><dd>{purposeLabels(record.purposes).join(', ') || '—'}</dd></div>
          <div><dt>Channels</dt><dd>{channelLabels(record.channels).join(', ') || '—'}</dd></div>
          <div><dt>Submitted</dt><dd>{formatWhen(record.createdAt)}</dd></div>
          <div><dt>Last change</dt><dd>{formatWhen(record.updatedAt)}</dd></div>
          <div><dt>Captured by</dt><dd>{record.createdBy}</dd></div>
        </dl>
        {record.status === 'withdrawn' ? (
          <p className="notice warn">This consent is withdrawn. The purposes and channels above are the last selection and are not currently effective.</p>
        ) : null}
        {record.notes ? <p><strong>Notes. </strong>{record.notes}</p> : null}
        {record.identityNote ? <p className="notice">{record.identityNote}</p> : null}
        {showEvidence !== false && record.evidence ? (
          <div className="file-row">
            <strong>Evidence file. </strong>
            {record.evidence.fileName} ({formatBytes(record.evidence.size)})
            {record.evidence.dataUrl ? (
              <a className="btn ghost small" href={record.evidence.dataUrl} download={record.evidence.fileName}>
                Download
              </a>
            ) : (
              <span className="muted"> Sample record. The file name is stored, the scan itself is not.</span>
            )}
            {record.evidence.dataUrl && record.evidence.mimeType.indexOf('image/') === 0 ? (
              <img className="evidence-preview" src={record.evidence.dataUrl} alt="Uploaded consent form" />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
