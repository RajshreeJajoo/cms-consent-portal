import { assignedCampaignId } from '../data/seed.js'

export const PURPOSES = [
  { id: 'marketing', label: 'Marketing communications' },
  { id: 'offers', label: 'Product and service offers' },
  { id: 'research', label: 'Market research' },
]

export const CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'phone', label: 'Phone' },
  { id: 'post', label: 'Post' },
]

export const CONSENT_WORDING =
  'I agree that the organisation may use my contact details to contact me for the purposes and channels I select. I understand that I can withdraw this consent at any time. A withdrawal, or a Do Not Contact listing, takes priority over an earlier opt-in. Wording version CMS-W-2026.1.'

export function normEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export function normMobile(value) {
  return String(value || '').replace(/\D/g, '')
}

export function normId(value) {
  return String(value || '').replace(/[\s-]/g, '').toUpperCase()
}

export function emptySelections() {
  return {
    purposes: { marketing: false, offers: false, research: false },
    channels: { email: false, sms: false, phone: false, post: false },
  }
}

export function emptyForm(campaignId) {
  const selections = emptySelections()
  return {
    fullName: '',
    email: '',
    mobile: '',
    nationalId: '',
    dob: '',
    campaignId: campaignId || '',
    purposes: selections.purposes,
    channels: selections.channels,
    acknowledgement: false,
    mode: 'digital',
    evidence: null,
    notes: '',
  }
}

export function formFromRecord(record) {
  return {
    fullName: record.subject.fullName,
    email: record.subject.email,
    mobile: record.subject.mobile,
    nationalId: record.subject.nationalId,
    dob: record.subject.dob,
    campaignId: record.campaignId,
    purposes: Object.assign({}, record.purposes),
    channels: Object.assign({}, record.channels),
    acknowledgement: true,
    mode: record.source === 'paper' ? 'paper' : 'digital',
    evidence: record.evidence,
    notes: record.notes || '',
  }
}

function selected(map, catalog) {
  return catalog.filter((item) => map && map[item.id]).map((item) => item.label)
}

export function purposeLabels(map) {
  return selected(map, PURPOSES)
}

export function channelLabels(map) {
  return selected(map, CHANNELS)
}

export function validateConsent(values) {
  const errors = {}
  if (!String(values.fullName || '').trim()) errors.fullName = 'Enter the full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || '').trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (normMobile(values.mobile).length < 8) errors.mobile = 'Enter a valid mobile number.'
  if (!values.campaignId) errors.campaignId = 'Select a campaign.'
  if (!values.acknowledgement) {
    errors.acknowledgement = 'The consent wording must be acknowledged.'
  }
  if (purposeLabels(values.purposes).length === 0) {
    errors.purposes = 'Select at least one purpose.'
  }
  if (channelLabels(values.channels).length === 0) {
    errors.channels = 'Select at least one channel.'
  }
  if (String(values.notes || '').length > 500) errors.notes = 'Keep notes to 500 characters.'
  return errors
}

function identifierHits(subject, other) {
  const hits = []
  const email = normEmail(subject.email)
  const mobile = normMobile(subject.mobile)
  const nationalId = normId(subject.nationalId)
  if (email && email.indexOf('@') > 0 && normEmail(other.email) === email) hits.push('email')
  if (mobile.length >= 8 && normMobile(other.mobile) === mobile) hits.push('mobile')
  if (nationalId.length >= 6 && normId(other.nationalId) === nationalId) hits.push('national ID')
  return hits
}

export function findDuplicates(consents, subject, excludeId) {
  const matches = []
  consents.forEach((record) => {
    if (record.status === 'archived') return
    if (excludeId && record.id === excludeId) return
    const fields = identifierHits(subject, record.subject)
    if (fields.length) matches.push({ record: record, fields: fields })
  })
  return matches
}

export function sharedIdentifierIds(consents) {
  const active = consents.filter((record) => record.status !== 'archived')
  const ids = {}
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      if (identifierHits(active[i].subject, active[j].subject).length) {
        ids[active[i].id] = true
        ids[active[j].id] = true
      }
    }
  }
  return ids
}

export function maskNationalId(value) {
  const raw = String(value || '').trim()
  if (!raw) return '—'
  if (raw.length <= 4) return '••••'
  return '••••' + raw.slice(-4)
}

export function maskMobile(value) {
  const digits = normMobile(value)
  if (digits.length < 6) return '—'
  return digits.slice(0, 3) + '••••' + digits.slice(-2)
}

export function findByIdentifier(consents, identifier) {
  const email = normEmail(identifier)
  const mobile = normMobile(identifier)
  const nationalId = normId(identifier)
  return consents.filter((record) => {
    if (record.status === 'archived') return false
    if (email.indexOf('@') > 0 && normEmail(record.subject.email) === email) return true
    if (mobile.length >= 8 && normMobile(record.subject.mobile) === mobile) return true
    if (nationalId.length >= 6 && normId(record.subject.nationalId) === nationalId) return true
    return false
  })
}

function dncMatch(dncEntries, subject, identifier) {
  const email = normEmail(subject && subject.email)
  const mobile = normMobile(subject && subject.mobile)
  const nationalId = normId(subject && subject.nationalId)
  const typedEmail = normEmail(identifier)
  const typedMobile = normMobile(identifier)
  const typedId = normId(identifier)
  return (dncEntries || []).find((entry) => {
    if (!entry.active) return false
    if (entry.type === 'email') {
      const value = normEmail(entry.value)
      return (email && value === email) || (typedEmail.indexOf('@') > 0 && value === typedEmail)
    }
    if (entry.type === 'mobile') {
      const value = normMobile(entry.value)
      return (mobile.length >= 8 && value === mobile) || (typedMobile.length >= 8 && value === typedMobile)
    }
    if (entry.type === 'nationalId') {
      const value = normId(entry.value)
      return (nationalId.length >= 6 && value === nationalId) || (typedId.length >= 6 && value === typedId)
    }
    return false
  })
}

export function decideEligibility({ consents, dncEntries, identifier, purpose, channel }) {
  const matches = findByIdentifier(consents, identifier)
  if (matches.length > 1) {
    return {
      allowed: false,
      reasonCode: 'AMBIGUOUS',
      reason: 'More than one active consent record matches this identifier. Operations needs to resolve the duplicate before a contact decision can be made.',
      record: null,
    }
  }
  const record = matches[0] || null
  const subject = record ? record.subject : null
  const dnc = dncMatch(dncEntries, subject, identifier)
  if (dnc) {
    return {
      allowed: false,
      reasonCode: 'DNC',
      reason: 'This person is on the Do Not Contact list, so marketing contact is not allowed on any channel.',
      record: record,
    }
  }
  if (!record) {
    return {
      allowed: false,
      reasonCode: 'NO_RECORD',
      reason: 'No consent record exists for this identifier.',
      record: null,
    }
  }
  if (record.status === 'withdrawn') {
    return {
      allowed: false,
      reasonCode: 'WITHDRAWN',
      reason: 'Consent has been withdrawn. Withdrawal takes priority over the earlier opt-in.',
      record: record,
    }
  }
  if (!record.purposes || !record.purposes[purpose]) {
    return {
      allowed: false,
      reasonCode: 'PURPOSE_NOT_GRANTED',
      reason: 'The current consent does not include this purpose.',
      record: record,
    }
  }
  if (!record.channels || !record.channels[channel]) {
    return {
      allowed: false,
      reasonCode: 'CHANNEL_NOT_GRANTED',
      reason: 'The current consent does not include this channel.',
      record: record,
    }
  }
  return {
    allowed: true,
    reasonCode: 'ALLOWED',
    reason: 'Current consent covers this purpose and channel, and no withdrawal or Do Not Contact block applies.',
    record: record,
  }
}

export function parseDncCsv(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const rows = []
  const errors = []
  lines.forEach((line, index) => {
    if (index === 0 && /type/i.test(line) && /value/i.test(line)) return
    const parts = line.split(',')
    const typeRaw = String(parts[0] || '').trim().toLowerCase()
    const value = String(parts.slice(1).join(',') || '').trim()
    const typeMap = {
      mobile: 'mobile',
      email: 'email',
      nationalid: 'nationalId',
      nric: 'nationalId',
      'national id': 'nationalId',
    }
    const type = typeMap[typeRaw]
    if (!type || !value) {
      errors.push('Line ' + (index + 1) + ' should look like mobile,60123456789')
      return
    }
    rows.push({ type: type, value: value })
  })
  return { rows: rows, errors: errors }
}

function adviserCanSee(user, record) {
  const campaignId = assignedCampaignId(user)
  return Boolean(campaignId) && record.campaignId === campaignId
}

export function canEdit(user, record) {
  if (!user || !record || record.status === 'archived') return false
  if (user.role === 'operations') return true
  if (user.role === 'adviser') return adviserCanSee(user, record)
  return false
}

export function canDelete(user, record) {
  return Boolean(user && user.role === 'operations' && record && record.status !== 'archived')
}

export function visibleTo(user, record) {
  if (!user) return false
  if (user.role === 'adviser') return adviserCanSee(user, record)
  return user.role === 'operations' || user.role === 'compliance'
}
