import { uid } from './ids.js'
import { findDuplicates, normEmail, normId, normMobile } from './rules.js'

function nowIso() {
  return new Date().toISOString()
}

function subjectFrom(values) {
  return {
    fullName: String(values.fullName || '').trim(),
    email: normEmail(values.email),
    mobile: String(values.mobile || '').trim(),
    nationalId: String(values.nationalId || '').trim().toUpperCase(),
    dob: values.dob || '',
  }
}

function snapshot(record) {
  return {
    status: record.status,
    source: record.source,
    campaignId: record.campaignId,
    purposes: Object.assign({}, record.purposes),
    channels: Object.assign({}, record.channels),
    email: record.subject.email,
    mobile: record.subject.mobile,
  }
}

function withHistory(record, event) {
  return Object.assign({}, record, {
    history: [event].concat(record.history || []),
  })
}

function syncPatch() {
  return {
    salesforceSync: 'Simulated — synced',
    casSync: 'Simulated — synced',
  }
}

export function applyCreate(state, input) {
  const subject = subjectFrom(input)
  const duplicates = findDuplicates(state.consents, subject)
  if (duplicates.length && !input.overrideReason && !input.updatingId) {
    return { state: state, result: { status: 'duplicate', matches: duplicates } }
  }
  const at = nowIso()
  const record = {
    id: uid('cns'),
    publicToken: uid('tok'),
    subject: subject,
    campaignId: input.campaignId,
    adviserId: input.adviserId,
    source: input.mode === 'paper' ? 'paper' : 'digital',
    purposes: Object.assign({}, input.purposes),
    channels: Object.assign({}, input.channels),
    status: 'active',
    acknowledgement: true,
    evidence: input.mode === 'paper' ? input.evidence : null,
    notes: String(input.notes || '').trim(),
    createdAt: at,
    updatedAt: at,
    createdBy: input.actor,
    identityNote: input.overrideReason ? 'Saved as a separate record. ' + input.overrideReason : '',
    salesforceSync: 'Simulated — synced',
    casSync: 'Simulated — synced',
    history: [
      {
        id: uid('aud'),
        at: at,
        actor: input.actor,
        action: 'Created',
        source: input.origin || 'Staff portal',
        detail: input.overrideReason
          ? 'Created even though an identifier matched an existing record. Reason: ' + input.overrideReason
          : input.detail || 'Consent captured.',
        after: null,
      },
    ],
  }
  record.history[0].after = snapshot(record)
  return {
    state: Object.assign({}, state, { consents: [record].concat(state.consents) }),
    result: { status: 'created', record: record },
  }
}

export function applyUpdate(state, id, input) {
  const current = state.consents.find((record) => record.id === id)
  if (!current) return { state: state, result: { status: 'missing' } }
  const subject = subjectFrom(input)
  const duplicates = findDuplicates(state.consents, subject, id)
  if (duplicates.length && !input.overrideReason) {
    return { state: state, result: { status: 'duplicate', matches: duplicates } }
  }
  const at = nowIso()
  const before = snapshot(current)
  const next = Object.assign({}, current, syncPatch(), {
    subject: subject,
    campaignId: input.campaignId,
    source: input.mode === 'paper' ? 'paper' : 'digital',
    purposes: Object.assign({}, input.purposes),
    channels: Object.assign({}, input.channels),
    status: 'active',
    acknowledgement: true,
    evidence: input.mode === 'paper' ? input.evidence : current.evidence,
    notes: String(input.notes || '').trim(),
    updatedAt: at,
    identityNote: input.identityNote != null ? input.identityNote : current.identityNote,
  })
  if (input.mode !== 'paper') {
    next.evidence = input.keepEvidence ? current.evidence : null
  }
  const updated = withHistory(next, {
    id: uid('aud'),
    at: at,
    actor: input.actor,
    action: input.action || 'Updated',
    source: input.origin || 'Staff portal',
    detail: input.detail || 'Consent details were updated.',
    before: before,
    after: snapshot(next),
  })
  return {
    state: Object.assign({}, state, {
      consents: state.consents.map((record) => (record.id === id ? updated : record)),
    }),
    result: { status: 'updated', record: updated },
  }
}

export function applyWithdraw(state, id, input) {
  const current = state.consents.find((record) => record.id === id)
  if (!current) return { state: state, result: { status: 'missing' } }
  if (current.status === 'withdrawn') {
    return { state: state, result: { status: 'updated', record: current, already: true } }
  }
  const at = nowIso()
  const before = snapshot(current)
  const next = Object.assign({}, current, syncPatch(), {
    status: 'withdrawn',
    updatedAt: at,
  })
  const updated = withHistory(next, {
    id: uid('aud'),
    at: at,
    actor: input.actor,
    action: 'Withdrawn',
    source: input.origin || 'Staff portal',
    detail: input.detail || 'Consent withdrawn.',
    before: before,
    after: snapshot(next),
  })
  return {
    state: Object.assign({}, state, {
      consents: state.consents.map((record) => (record.id === id ? updated : record)),
    }),
    result: { status: 'updated', record: updated },
  }
}

export function applyArchive(state, id, input) {
  const current = state.consents.find((record) => record.id === id)
  if (!current) return { state: state, result: { status: 'missing' } }
  const at = nowIso()
  const before = snapshot(current)
  const next = Object.assign({}, current, syncPatch(), {
    status: 'archived',
    updatedAt: at,
  })
  const updated = withHistory(next, {
    id: uid('aud'),
    at: at,
    actor: input.actor,
    action: 'Deleted',
    source: 'Staff portal',
    detail: input.detail || 'Removed from the active register. Audit history retained.',
    before: before,
    after: snapshot(next),
  })
  return {
    state: Object.assign({}, state, {
      consents: state.consents.map((record) => (record.id === id ? updated : record)),
    }),
    result: { status: 'updated', record: updated },
  }
}

function dncKey(type, value) {
  if (type === 'email') return type + '|' + normEmail(value)
  if (type === 'mobile') return type + '|' + normMobile(value)
  return type + '|' + normId(value)
}

export function applyDnc(state, rows, actor) {
  const at = nowIso()
  const existingKey = {}
  state.dncEntries.forEach((entry) => {
    existingKey[dncKey(entry.type, entry.value)] = true
  })
  const added = []
  rows.forEach((row) => {
    const key = dncKey(row.type, row.value)
    if (existingKey[key]) return
    existingKey[key] = true
    added.push({
      id: uid('dnc'),
      type: row.type,
      value: row.type === 'email' ? normEmail(row.value) : String(row.value).trim(),
      source: 'MLS file',
      active: true,
      loadedAt: at,
      loadedBy: actor,
    })
  })
  return {
    state: Object.assign({}, state, { dncEntries: added.concat(state.dncEntries) }),
    result: { status: 'loaded', added: added.length, skipped: rows.length - added.length },
  }
}

export function applyDncActive(state, id, active) {
  return Object.assign({}, state, {
    dncEntries: state.dncEntries.map((entry) => (entry.id === id ? Object.assign({}, entry, { active: active }) : entry)),
  })
}
