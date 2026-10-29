import { useState } from 'react'
import { adviserById } from '../data/seed.js'
import { formatDay } from '../lib/format.js'
import { readConsentFromPdf } from '../lib/readConsentPdf.js'
import { CHANNELS, CONSENT_WORDING, PURPOSES, emptyForm, validateConsent } from '../lib/rules.js'

const FILE_LIMIT = 900 * 1024

function readEvidence(file) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      reject(new Error('Choose a file.'))
      return
    }
    if (file.size > FILE_LIMIT) {
      reject(new Error('Use a file under 900 KB. This demo keeps the scan in the browser.'))
      return
    }
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    const isImage = file.type === 'image/png' || file.type === 'image/jpeg' || /\.(png|jpe?g)$/i.test(file.name)
    if (!isPdf && !isImage) {
      reject(new Error('Upload a PDF, PNG, or JPG.'))
      return
    }
    const reader = new FileReader()
    reader.onload = function () {
      resolve({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl: reader.result,
      })
    }
    reader.onerror = function () {
      reject(new Error('That file could not be read.'))
    }
    reader.readAsDataURL(file)
  })
}

export default function ConsentForm({ campaigns, initial, lockedCampaign, submitLabel, onSubmit, captureMode }) {
  const [values, setValues] = useState(function () {
    const base = initial
      ? Object.assign({}, initial, {
          purposes: Object.assign({}, initial.purposes),
          channels: Object.assign({}, initial.channels),
        })
      : emptyForm((lockedCampaign && lockedCampaign.id) || (campaigns.length === 1 ? campaigns[0].id : ''))
    if (captureMode) base.mode = captureMode
    return base
  })
  const [errors, setErrors] = useState({})
  const [fileError, setFileError] = useState('')
  const [fileNote, setFileNote] = useState('')
  const [reading, setReading] = useState(false)

  function patch(partial) {
    setValues(function (current) {
      return Object.assign({}, current, partial)
    })
  }

  function toggle(group, id) {
    setValues(function (current) {
      const nextGroup = Object.assign({}, current[group])
      nextGroup[id] = !nextGroup[id]
      const next = Object.assign({}, current)
      next[group] = nextGroup
      return next
    })
  }

  async function onFile(file) {
    setFileError('')
    setFileNote('')
    setReading(true)
    try {
      const evidence = await readEvidence(file)
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
      if (!isPdf) {
        patch({ evidence: evidence, mode: 'paper' })
        setFileNote('This is a photo, so the boxes were not filled. Upload the filled PDF to fill them, or type the details.')
        return
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      const read = readConsentFromPdf(bytes, campaigns)
      if (!read.found) {
        patch({ evidence: evidence, mode: 'paper' })
        setFileNote('This PDF has no filled details. Type them in, or upload the filled consent PDF.')
        return
      }
      setValues(function (current) {
        return Object.assign({}, current, {
          evidence: evidence,
          mode: 'paper',
          fullName: read.fullName,
          email: read.email,
          mobile: read.mobile,
          nationalId: read.nationalId,
          dob: read.dob,
          campaignId: read.campaignId || current.campaignId,
          purposes: read.purposes,
          channels: read.channels,
          notes: read.notes,
          acknowledgement: read.acknowledgement,
        })
      })
      setFileNote('The PDF filled the boxes below. Check them, then save.')
    } catch (error) {
      setFileError(error.message)
    } finally {
      setReading(false)
    }
  }

  function submit(event) {
    event.preventDefault()
    const next = Object.assign({}, values)
    if (next.mode === 'paper' && !next.evidence) next.mode = 'digital'
    const nextErrors = validateConsent(next)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit(next)
  }

  const campaign = lockedCampaign || campaigns.find(function (item) { return item.id === values.campaignId })

  return (
    <form className="card form-card" onSubmit={submit} noValidate>
      <p className="mode-note">
        {values.mode === 'paper'
          ? 'Type the details yourself, or upload a filled PDF and the boxes fill from that file. The PDF is optional.'
          : 'This form opened from an agent QR code. Enter your details and marketing consent. There is no file upload on this page.'}
      </p>

      {values.mode === 'paper' ? (
        <div
          className="dropzone"
          onDragOver={function (event) { event.preventDefault() }}
          onDrop={function (event) {
            event.preventDefault()
            onFile(event.dataTransfer.files && event.dataTransfer.files[0])
          }}
        >
          <label>
            Filled PDF,
            <input
             style={{ marginLeft: '10px'  }}
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={function (event) { onFile(event.target.files && event.target.files[0]) }}
            />
          </label>
          {values.evidence ? <p className="file-pill">{values.evidence.fileName}</p> : <p> A filled PDF fills the boxes. A photo is stored only. Maximum 900 KB.</p>}
          {fileNote ? <p className="notice">{fileNote}</p> : null}
          {fileError ? <p className="error">{fileError}</p> : null}
          {errors.evidence ? <p className="error">{errors.evidence}</p> : null}
        </div>
      ) : null}

      <div className="split-2">
        <label className="field">
          Full name
          <input value={values.fullName} onChange={function (event) { patch({ fullName: event.target.value }) }} autoComplete="name" />
          {errors.fullName ? <span className="error">{errors.fullName}</span> : null}
        </label>
        <label className="field">
          Email
          <input value={values.email} onChange={function (event) { patch({ email: event.target.value }) }} autoComplete="email" inputMode="email" />
          {errors.email ? <span className="error">{errors.email}</span> : null}
        </label>
        <label className="field">
          Mobile
          <input value={values.mobile} onChange={function (event) { patch({ mobile: event.target.value }) }} autoComplete="tel" inputMode="tel" />
          {errors.mobile ? <span className="error">{errors.mobile}</span> : null}
        </label>
        <label className="field">
          National ID
          <input value={values.nationalId} onChange={function (event) { patch({ nationalId: event.target.value }) }} />
        </label>
        <label className="field">
          Date of birth
          <input type="date" value={values.dob} onChange={function (event) { patch({ dob: event.target.value }) }} />
        </label>
        {lockedCampaign ? (
          <div className="field">
            Campaign
            <div className="locked-campaign">
              <strong>{lockedCampaign.name}</strong>
              <span>{lockedCampaign.location}</span>
            </div>
          </div>
        ) : (
          <label className="field">
            Campaign
            <select value={values.campaignId} onChange={function (event) { patch({ campaignId: event.target.value }) }}>
              <option value="">Select a campaign</option>
              {campaigns.map(function (item) {
                return (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                )
              })}
            </select>
            {errors.campaignId ? <span className="error">{errors.campaignId}</span> : null}
          </label>
        )}
      </div>

      {campaign ? (
        <aside className="campaign-strip">
          <div>
            <strong>{campaign.eventName}</strong>
            <span>
              {campaign.location} · {formatDay(campaign.startDate)}
              {campaign.endDate !== campaign.startDate ? ' – ' + formatDay(campaign.endDate) : ''}
            </span>
          </div>
          <div>
            <strong>Adviser</strong>
            <span>{(adviserById(campaign.adviserId) || {}).name} · {(adviserById(campaign.adviserId) || {}).code}</span>
          </div>
        </aside>
      ) : null}

      <fieldset>
        <legend>Purposes</legend>
        <div className="choices">
          {PURPOSES.map(function (item) {
            return (
              <label key={item.id} className="choice">
                <input type="checkbox" checked={Boolean(values.purposes[item.id])} onChange={function () { toggle('purposes', item.id) }} />
                {item.label}
              </label>
            )
          })}
        </div>
        {errors.purposes ? <p className="error">{errors.purposes}</p> : null}
      </fieldset>

      <fieldset>
        <legend>Channels</legend>
        <div className="choices">
          {CHANNELS.map(function (item) {
            return (
              <label key={item.id} className="choice">
                <input type="checkbox" checked={Boolean(values.channels[item.id])} onChange={function () { toggle('channels', item.id) }} />
                {item.label}
              </label>
            )
          })}
        </div>
        {errors.channels ? <p className="error">{errors.channels}</p> : null}
      </fieldset>

      <blockquote className="wording">{CONSENT_WORDING}</blockquote>
      <label className="choice">
        <input
          type="checkbox"
          checked={values.acknowledgement}
          onChange={function (event) { patch({ acknowledgement: event.target.checked }) }}
        />
        The prospect has agreed to this wording.
      </label>
      {errors.acknowledgement ? <p className="error">{errors.acknowledgement}</p> : null}

      <label className="field">
        Notes
        <textarea rows={3} value={values.notes} onChange={function (event) { patch({ notes: event.target.value }) }} />
        {errors.notes ? <span className="error">{errors.notes}</span> : null}
      </label>

      <div className="form-actions">
        <button className="btn primary" type="submit" disabled={reading}>
          {reading ? 'Reading file…' : submitLabel || 'Submit consent'}
        </button>
      </div>
    </form>
  )
}
