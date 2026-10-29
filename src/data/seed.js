export const ADVISERS = [
  { id: 'adv_sarah', name: 'Sarah Lim', code: 'ADV-0142', agency: 'KL Central' },
  { id: 'adv_ahmad', name: 'Ahmad Rahman', code: 'ADV-0208', agency: 'Petaling Jaya' },
  { id: 'adv_nurul', name: 'Nurul Idris', code: 'ADV-0315', agency: 'Penang' },
  { id: 'adv_hafiz', name: 'Hafiz Abdullah', code: 'ADV-0440', agency: 'Johor Bahru' },
  { id: 'adv_lina', name: 'Lina Gomez', code: 'ADV-0522', agency: 'Shah Alam' },
]

export function initialDirectory() {
  return [
    {
      id: 'usr_sarah',
      name: 'Sarah Lim',
      email: 'sarah.lim@cms.demo',
      password: 'Sarah#0142',
      status: 'approved',
      role: 'adviser',
      adviserId: 'adv_sarah',
      campaignIds: ['cmp_kl'],
      requestedAt: '2026-10-01T02:00:00.000Z',
    },
    {
      id: 'usr_ops',
      name: 'Priya Nair',
      email: 'operations@cms.demo',
      password: 'Priya#0208',
      status: 'approved',
      role: 'operations',
      adviserId: null,
      requestedAt: '2026-10-01T02:00:00.000Z',
    },
    {
      id: 'usr_comp',
      name: 'David Chen',
      email: 'compliance@cms.demo',
      password: 'David#1104',
      status: 'approved',
      role: 'compliance',
      adviserId: null,
      requestedAt: '2026-10-01T02:00:00.000Z',
    },
    {
      id: 'usr_admin',
      name: 'ML CMS Admin',
      email: 'admin@cms.demo',
      password: 'Admin#1001',
      status: 'approved',
      role: 'admin',
      adviserId: null,
      requestedAt: '2026-10-01T02:00:00.000Z',
    },
    {
      id: 'usr_amir',
      name: 'Amir Hassan',
      email: 'amir.hassan@cms.demo',
      password: 'Amir#7781',
      status: 'pending',
      role: null,
      adviserId: null,
      requestedAt: '2026-10-28T09:00:00.000Z',
    },
  ]
}

export const CAMPAIGNS = [
  {
    id: 'cmp_kl',
    code: 'RS-KL-2026',
    name: 'KL Roadshow 2026',
    eventName: 'Customer roadshow',
    location: 'Kuala Lumpur Convention Centre',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    adviserId: 'adv_sarah',
    wordingVersion: 'CMS-W-2026.1',
    summary:
      'Weekend roadshow for protection and savings leads. Consent captured here is attributed to the hosting adviser.',
  },
  {
    id: 'cmp_pj',
    code: 'OD-PJ-2026',
    name: 'PJ Agency Open Day',
    eventName: 'Agency open day',
    location: 'Petaling Jaya',
    startDate: '2026-11-08',
    endDate: '2026-11-08',
    adviserId: 'adv_ahmad',
    wordingVersion: 'CMS-W-2026.1',
    summary:
      'Branch open day. A prospect can scan the adviser QR and complete consent on their own phone.',
  },
  {
    id: 'cmp_penang',
    code: 'RS-PG-2026',
    name: 'Penang Weekend Booth',
    eventName: 'Weekend booth',
    location: 'Gurney Plaza, Penang',
    startDate: '2026-11-15',
    endDate: '2026-11-16',
    adviserId: 'adv_nurul',
    wordingVersion: 'CMS-W-2026.1',
    summary: 'Mall booth for new leads. Consent captured here stays with the Penang hosting adviser.',
  },
  {
    id: 'cmp_jb',
    code: 'MK-JB-2026',
    name: 'Johor Bahru Mall Kiosk',
    eventName: 'Mall kiosk',
    location: 'Mid Valley Southkey, Johor Bahru',
    startDate: '2026-11-22',
    endDate: '2026-11-22',
    adviserId: 'adv_hafiz',
    wordingVersion: 'CMS-W-2026.1',
    summary: 'One-day kiosk. Prospects can scan the adviser QR and enter marketing consent on their phone.',
  },
  {
    id: 'cmp_shah',
    code: 'EV-SA-2026',
    name: 'Shah Alam Branch Evening',
    eventName: 'Branch evening',
    location: 'Shah Alam',
    startDate: '2026-12-03',
    endDate: '2026-12-03',
    adviserId: 'adv_lina',
    wordingVersion: 'CMS-W-2026.1',
    summary: 'Evening session at the Shah Alam branch. Paper forms and QR consent are both attributed to this adviser.',
  },
]

function record(partial) {
  return Object.assign(
    {
      notes: '',
      evidence: null,
      salesforceSync: 'Simulated — synced',
      casSync: 'Simulated — synced',
      identityNote: '',
    },
    partial
  )
}

export function createSeed() {
  return {
    version: 1,
    consents: [
      record({
        id: 'cns_mei',
        publicToken: 'tok_mei_tan',
        subject: {
          fullName: 'Mei Tan',
          email: 'mei.tan@example.com',
          mobile: '60123456001',
          nationalId: '900101-14-2210',
          dob: '1990-01-01',
        },
        campaignId: 'cmp_kl',
        adviserId: 'adv_sarah',
        source: 'digital',
        purposes: { marketing: true, offers: true, research: false },
        channels: { email: true, sms: true, phone: false, post: false },
        status: 'active',
        acknowledgement: true,
        createdAt: '2026-10-27T03:10:00.000Z',
        updatedAt: '2026-10-27T03:10:00.000Z',
        createdBy: 'Sarah Lim',
        history: [
          {
            id: 'aud_mei_1',
            at: '2026-10-27T03:10:00.000Z',
            actor: 'Sarah Lim',
            action: 'Created',
            source: 'Staff portal',
            detail: 'Digital intake at KL Roadshow 2026.',
          },
        ],
      }),
      record({
        id: 'cns_siti',
        publicToken: 'tok_siti_aminah',
        subject: {
          fullName: 'Siti Aminah',
          email: 'siti.aminah@example.com',
          mobile: '60178765432',
          nationalId: '880512-10-4418',
          dob: '1988-05-12',
        },
        campaignId: 'cmp_pj',
        adviserId: 'adv_ahmad',
        source: 'paper',
        purposes: { marketing: true, offers: false, research: false },
        channels: { email: true, sms: false, phone: true, post: false },
        status: 'active',
        acknowledgement: true,
        evidence: {
          fileName: 'siti-aminah-consent.pdf',
          mimeType: 'application/pdf',
          size: 184320,
          dataUrl: null,
        },
        notes: 'Scanned at the open day reception desk.',
        createdAt: '2026-10-28T08:40:00.000Z',
        updatedAt: '2026-10-28T08:40:00.000Z',
        createdBy: 'Priya Nair',
        history: [
          {
            id: 'aud_siti_1',
            at: '2026-10-28T08:40:00.000Z',
            actor: 'Priya Nair',
            action: 'Created',
            source: 'Paper evidence',
            detail: 'Scanned form uploaded and consent details keyed in.',
          },
        ],
      }),
      record({
        id: 'cns_john',
        publicToken: 'tok_john_pereira',
        subject: {
          fullName: 'John Pereira',
          email: 'john.pereira@example.com',
          mobile: '60165550909',
          nationalId: '750318-08-1194',
          dob: '1975-03-18',
        },
        campaignId: 'cmp_kl',
        adviserId: 'adv_sarah',
        source: 'digital',
        purposes: { marketing: true, offers: false, research: false },
        channels: { email: true, sms: false, phone: false, post: false },
        status: 'withdrawn',
        acknowledgement: true,
        createdAt: '2026-10-20T02:00:00.000Z',
        updatedAt: '2026-10-28T04:15:00.000Z',
        createdBy: 'Sarah Lim',
        history: [
          {
            id: 'aud_john_2',
            at: '2026-10-28T04:15:00.000Z',
            actor: 'John Pereira',
            action: 'Withdrawn',
            source: 'One-click unsubscribe',
            detail: 'Customer withdrew marketing consent.',
          },
          {
            id: 'aud_john_1',
            at: '2026-10-20T02:00:00.000Z',
            actor: 'Sarah Lim',
            action: 'Created',
            source: 'Staff portal',
            detail: 'Digital intake at KL Roadshow 2026.',
          },
        ],
      }),
      record({
        id: 'cns_daniel',
        publicToken: 'tok_daniel_ong',
        subject: {
          fullName: 'Daniel Ong',
          email: 'daniel.ong@example.com',
          mobile: '60199887766',
          nationalId: '920707-14-6630',
          dob: '1992-07-07',
        },
        campaignId: 'cmp_kl',
        adviserId: 'adv_sarah',
        source: 'digital',
        purposes: { marketing: true, offers: true, research: true },
        channels: { email: true, sms: true, phone: true, post: false },
        status: 'active',
        acknowledgement: true,
        createdAt: '2026-10-28T09:05:00.000Z',
        updatedAt: '2026-10-28T09:05:00.000Z',
        createdBy: 'Prospect via QR',
        history: [
          {
            id: 'aud_daniel_1',
            at: '2026-10-28T09:05:00.000Z',
            actor: 'Prospect via QR',
            action: 'Created',
            source: 'Campaign QR',
            detail: 'Completed on the prospect device for KL Roadshow 2026.',
          },
        ],
      }),
    ],
    dncEntries: [
      {
        id: 'dnc_daniel_mobile',
        type: 'mobile',
        value: '60199887766',
        source: 'MLS file',
        active: true,
        loadedAt: '2026-10-28T01:00:00.000Z',
        loadedBy: 'Priya Nair',
      },
      {
        id: 'dnc_blocked_email',
        type: 'email',
        value: 'blocked.person@example.com',
        source: 'MLS file',
        active: true,
        loadedAt: '2026-10-28T01:00:00.000Z',
        loadedBy: 'Priya Nair',
      },
    ],
  }
}

export function adviserById(id) {
  return ADVISERS.find((adviser) => adviser.id === id) || null
}

export function campaignById(id) {
  return CAMPAIGNS.find((campaign) => campaign.id === id) || null
}

export function assignedCampaignId(user) {
  if (!user || user.role !== 'adviser') return ''
  if (user.campaignIds && user.campaignIds.length) return user.campaignIds[0]
  const owned = CAMPAIGNS.find(function (campaign) { return campaign.adviserId === user.adviserId })
  return owned ? owned.id : ''
}

export function campaignLabelForAccount(account) {
  if (!account) return '—'
  if (account.role === 'operations' || account.role === 'compliance') return 'All'
  if (account.role === 'admin') return 'None'
  if (account.role !== 'adviser') return '—'
  const campaign = campaignById(assignedCampaignId(account))
  return campaign ? campaign.name : '—'
}

export function campaignsForUser(user) {
  if (!user || user.role !== 'adviser') return CAMPAIGNS
  const only = assignedCampaignId(user)
  if (!only) return []
  return CAMPAIGNS.filter(function (campaign) { return campaign.id === only })
}

export function campaignByCode(code) {
  const wanted = String(code || '').toLowerCase()
  return CAMPAIGNS.find((campaign) => campaign.code.toLowerCase() === wanted) || null
}

export function roleLabel(role) {
  if (role === 'adviser') return 'Adviser'
  if (role === 'operations') return 'Operations'
  if (role === 'compliance') return 'Compliance'
  if (role === 'admin') return 'Admin'
  if (role === 'pending') return 'Pending approval'
  return 'Not assigned'
}
