import { createSeed } from '../data/seed.js'
import { applyCreate, applyUpdate, applyWithdraw } from './consentState.js'
import { decideEligibility, findDuplicates, validateConsent, emptyForm } from './rules.js'

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL: ' + message)
    process.exitCode = 1
  } else {
    console.log('ok: ' + message)
  }
}

const seed = createSeed()

const mei = { fullName: 'Someone', email: 'mei.tan@example.com', mobile: '60111111111', nationalId: '' }
const matches = findDuplicates(seed.consents, mei)
assert(matches.length === 1 && matches[0].fields.indexOf('email') >= 0, 'email duplicate matches Mei Tan')

const conflictSubject = {
  fullName: 'Mix',
  email: 'mei.tan@example.com',
  mobile: '60199887766',
  nationalId: '',
}
const conflict = findDuplicates(seed.consents, conflictSubject)
assert(conflict.length === 2, 'email and mobile that belong to different people are a conflict')

const blocked = applyCreate(seed, {
  fullName: 'Mei Tan',
  email: 'Mei.Tan@example.com',
  mobile: '60123456001',
  nationalId: '',
  campaignId: 'cmp_kl',
  adviserId: 'adv_sarah',
  mode: 'digital',
  purposes: { marketing: true, offers: false, research: false },
  channels: { email: true, sms: false, phone: false, post: false },
  actor: 'Sarah Lim',
})
assert(blocked.result.status === 'duplicate', 'create stops on a duplicate identifier')

const created = applyCreate(seed, Object.assign({}, blocked.result && {}, {
  fullName: 'New Prospect',
  email: 'new.prospect@example.com',
  mobile: '60120001111',
  nationalId: '010101-14-0001',
  dob: '',
  campaignId: 'cmp_kl',
  adviserId: 'adv_sarah',
  mode: 'digital',
  purposes: { marketing: true, offers: false, research: false },
  channels: { email: true, sms: false, phone: false, post: false },
  notes: '',
  evidence: null,
  actor: 'Sarah Lim',
  origin: 'Staff portal',
}))
assert(created.result.status === 'created', 'a new identifier creates one record')
assert(created.state.consents.length === seed.consents.length + 1, 'register grows by one')

const allowed = decideEligibility({
  consents: seed.consents,
  dncEntries: seed.dncEntries,
  identifier: 'mei.tan@example.com',
  purpose: 'marketing',
  channel: 'email',
})
assert(allowed.allowed === true && allowed.reasonCode === 'ALLOWED', 'Mei Tan email marketing is allowed')

const dnc = decideEligibility({
  consents: seed.consents,
  dncEntries: seed.dncEntries,
  identifier: '60199887766',
  purpose: 'marketing',
  channel: 'sms',
})
assert(dnc.allowed === false && dnc.reasonCode === 'DNC', 'DNC overrides an active opt-in')

const withdrawn = decideEligibility({
  consents: seed.consents,
  dncEntries: seed.dncEntries,
  identifier: 'john.pereira@example.com',
  purpose: 'marketing',
  channel: 'email',
})
assert(withdrawn.allowed === false && withdrawn.reasonCode === 'WITHDRAWN', 'withdrawal blocks contact')

const channel = decideEligibility({
  consents: seed.consents,
  dncEntries: seed.dncEntries,
  identifier: 'mei.tan@example.com',
  purpose: 'marketing',
  channel: 'phone',
})
assert(channel.reasonCode === 'CHANNEL_NOT_GRANTED', 'a channel that was not granted is refused')

const form = emptyForm('cmp_kl')
const errors = validateConsent(form)
assert(errors.fullName && errors.email && errors.acknowledgement, 'an empty form reports the required fields')

const withdrawnState = applyWithdraw(seed, 'cns_mei', { actor: 'Priya Nair', detail: 'Customer called to withdraw.' })
assert(withdrawnState.result.record.status === 'withdrawn', 'withdraw changes the effective status')
assert(withdrawnState.result.record.history[0].action === 'Withdrawn', 'withdraw writes an audit event')

const updated = applyUpdate(seed, 'cns_mei', {
  fullName: 'Mei Tan',
  email: 'mei.tan@example.com',
  mobile: '60123456001',
  nationalId: '900101-14-2210',
  dob: '1990-01-01',
  campaignId: 'cmp_kl',
  mode: 'digital',
  purposes: { marketing: true, offers: false, research: true },
  channels: { email: true, sms: true, phone: false, post: false },
  acknowledgement: true,
  evidence: null,
  notes: 'Added research.',
  actor: 'Sarah Lim',
})
assert(updated.result.status === 'updated', 'edit of the same person succeeds')
assert(updated.result.record.purposes.research === true, 'edit stores the new purpose')

if (process.exitCode) {
  console.error('Rule checks failed')
} else {
  console.log('All rule checks passed')
}
