const fs = require('fs')
const path = require('path')

function esc(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrap(text, max) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  words.forEach(function (word) {
    const next = line ? line + ' ' + word : word
    if (next.length > max) {
      if (line) lines.push(line)
      line = word
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  return lines
}

function buildPdf(lines) {
  const commands = []
  lines.forEach(function (item) {
    if (item.op === 'text') {
      commands.push('BT /F1 ' + item.size + ' Tf ' + item.x + ' ' + item.y + ' Td (' + esc(item.text) + ') Tj ET')
    } else if (item.op === 'bold') {
      commands.push('BT /F2 ' + item.size + ' Tf ' + item.x + ' ' + item.y + ' Td (' + esc(item.text) + ') Tj ET')
    } else if (item.op === 'line') {
      commands.push(item.x1 + ' ' + item.y1 + ' m ' + item.x2 + ' ' + item.y2 + ' l S')
    } else if (item.op === 'box') {
      commands.push(item.x + ' ' + item.y + ' ' + item.w + ' ' + item.h + ' re S')
      if (item.mark) {
        commands.push((item.x + 2) + ' ' + (item.y + 2) + ' m ' + (item.x + item.w - 2) + ' ' + (item.y + item.h - 2) + ' l S')
        commands.push((item.x + item.w - 2) + ' ' + (item.y + 2) + ' m ' + (item.x + 2) + ' ' + (item.y + item.h - 2) + ' l S')
      }
    }
  })
  const stream = commands.join('\n')
  const objects = []
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n')
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n')
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >> endobj\n')
  objects.push('4 0 obj << /Length ' + Buffer.byteLength(stream) + ' >> stream\n' + stream + '\nendstream endobj\n')
  objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n')
  objects.push('6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n')
  let body = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach(function (object) {
    offsets.push(Buffer.byteLength(body))
    body += object
  })
  const xrefAt = Buffer.byteLength(body)
  body += 'xref\n0 ' + (objects.length + 1) + '\n'
  body += '0000000000 65535 f \n'
  for (let i = 1; i < offsets.length; i += 1) {
    body += String(offsets[i]).padStart(10, '0') + ' 00000 n \n'
  }
  body += 'trailer << /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefAt + '\n%%EOF'
  return body
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function prettyDate(iso) {
  const parts = String(iso).split('-')
  return Number(parts[2]) + ' ' + MONTHS[Number(parts[1]) - 1] + ' ' + parts[0]
}

function dateRange(start, end) {
  if (start === end) return prettyDate(start)
  return prettyDate(start) + ' to ' + prettyDate(end)
}

function formPages(campaign, filled) {
  const v = filled || {
    name: '',
    email: '',
    mobile: '',
    nationalId: '',
    dob: '',
    purposes: {},
    channels: {},
    signed: '',
    date: '',
    agent: '',
    notes: '',
  }
  const items = []
  let y = 800
  items.push({ op: 'bold', size: 16, x: 48, y: y, text: 'Marketing consent form' })
  y -= 18
  items.push({ op: 'text', size: 10, x: 48, y: y, text: 'Paper copy for CMS. Upload this filled PDF on New consent and the boxes fill from the file.' })
  y -= 16
  items.push({ op: 'line', x1: 48, y1: y, x2: 547, y2: y })
  y -= 22
  items.push({ op: 'bold', size: 11, x: 48, y: y, text: 'Campaign' })
  y -= 16
  items.push({ op: 'text', size: 10, x: 48, y: y, text: 'Name: ' + campaign.name })
  y -= 14
  items.push({ op: 'text', size: 10, x: 48, y: y, text: 'Event: ' + campaign.eventName + ', ' + campaign.location })
  y -= 14
  items.push({ op: 'text', size: 10, x: 48, y: y, text: 'Dates: ' + dateRange(campaign.startDate, campaign.endDate) })
  y -= 14
  items.push({ op: 'text', size: 10, x: 48, y: y, text: 'Adviser: ' + campaign.adviser })
  y -= 14
  items.push({ op: 'text', size: 10, x: 48, y: y, text: 'Wording version: CMS-W-2026.1' })
  y -= 24
  items.push({ op: 'bold', size: 11, x: 48, y: y, text: 'Prospect details' })
  const fields = [
    ['Full name', v.name],
    ['Email', v.email],
    ['Mobile', v.mobile],
    ['National ID', v.nationalId],
    ['Date of birth', v.dob],
  ]
  fields.forEach(function (field) {
    y -= 20
    items.push({ op: 'text', size: 10, x: 48, y: y + 4, text: field[0] })
    items.push({ op: 'line', x1: 150, y1: y, x2: 400, y2: y })
    if (field[1]) items.push({ op: 'text', size: 11, x: 154, y: y + 3, text: field[1] })
  })
  y -= 28
  items.push({ op: 'bold', size: 11, x: 48, y: y, text: 'Purposes' })
  ;['Marketing communications', 'Product and service offers', 'Market research'].forEach(function (label) {
    y -= 18
    items.push({ op: 'box', x: 48, y: y - 2, w: 11, h: 11, mark: Boolean(v.purposes[label]) })
    items.push({ op: 'text', size: 10, x: 66, y: y, text: label })
  })
  y -= 26
  items.push({ op: 'bold', size: 11, x: 48, y: y, text: 'Channels' })
  ;['Email', 'SMS', 'Phone', 'Post'].forEach(function (label) {
    y -= 18
    items.push({ op: 'box', x: 48, y: y - 2, w: 11, h: 11, mark: Boolean(v.channels[label]) })
    items.push({ op: 'text', size: 10, x: 66, y: y, text: label })
  })
  y -= 24
  items.push({ op: 'bold', size: 11, x: 48, y: y, text: 'Consent wording' })
  wrap(
    'I agree that the organisation may use my contact details to contact me for the purposes and channels I select. I understand that I can withdraw this consent at any time. A withdrawal, or a Do Not Contact listing, takes priority over an earlier opt-in.',
    95
  ).forEach(function (line) {
    y -= 13
    items.push({ op: 'text', size: 9, x: 48, y: y, text: line })
  })
  y -= 22
  items.push({ op: 'box', x: 48, y: y - 2, w: 11, h: 11, mark: Boolean(v.signed) })
  items.push({ op: 'text', size: 10, x: 66, y: y, text: 'The prospect has read and signed this wording.' })
  y -= 24
  items.push({ op: 'text', size: 10, x: 48, y: y + 4, text: 'Signature' })
  items.push({ op: 'line', x1: 120, y1: y, x2: 320, y2: y })
  if (v.signed) items.push({ op: 'text', size: 11, x: 124, y: y + 3, text: v.signed })
  items.push({ op: 'text', size: 10, x: 340, y: y + 4, text: 'Date' })
  items.push({ op: 'line', x1: 375, y1: y, x2: 500, y2: y })
  if (v.date) items.push({ op: 'text', size: 11, x: 379, y: y + 3, text: v.date })
  y -= 24
  items.push({ op: 'text', size: 10, x: 48, y: y + 4, text: 'Agent' })
  items.push({ op: 'line', x1: 120, y1: y, x2: 320, y2: y })
  if (v.agent) items.push({ op: 'text', size: 11, x: 124, y: y + 3, text: v.agent })
  y -= 24
  items.push({ op: 'text', size: 10, x: 48, y: y + 4, text: 'Notes' })
  items.push({ op: 'line', x1: 120, y1: y, x2: 520, y2: y })
  if (v.notes) items.push({ op: 'text', size: 10, x: 124, y: y + 3, text: v.notes })
  items.push({ op: 'text', size: 8, x: 48, y: 36, text: 'Upload this filled PDF on New consent. A photo does not fill the boxes.' })
  return items
}

const campaigns = [
  {
    file: 'KL-Roadshow-Paper-Consent-FILLED.pdf',
    name: 'KL Roadshow 2026',
    eventName: 'Customer roadshow',
    location: 'Kuala Lumpur Convention Centre',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    adviser: 'Sarah Lim, ADV-0142, KL Central',
    person: {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      mobile: '60129876543',
      nationalId: '850303-14-7788',
      dob: '03 Mar 1985',
      purposes: { 'Marketing communications': true, 'Product and service offers': true },
      channels: { Email: true, SMS: true },
      signed: 'Rohan Mehta',
      date: '29 Oct 2026',
      agent: 'Sarah Lim',
      notes: 'Signed at the KL roadshow desk',
    },
  },
  {
    file: 'PJ-Agency-Open-Day-Paper-Consent-FILLED.pdf',
    name: 'PJ Agency Open Day',
    eventName: 'Agency open day',
    location: 'Petaling Jaya',
    startDate: '2026-11-08',
    endDate: '2026-11-08',
    adviser: 'Ahmad Rahman, ADV-0208, Petaling Jaya',
    person: {
      name: 'Aisha Rahman',
      email: 'aisha.rahman@example.com',
      mobile: '60137654321',
      nationalId: '900512-10-3344',
      dob: '12 May 1990',
      purposes: { 'Marketing communications': true },
      channels: { Email: true, Phone: true },
      signed: 'Aisha Rahman',
      date: '08 Nov 2026',
      agent: 'Ahmad Rahman',
      notes: 'Signed at the PJ open day',
    },
  },
  {
    file: 'Penang-Weekend-Booth-Paper-Consent-FILLED.pdf',
    name: 'Penang Weekend Booth',
    eventName: 'Weekend booth',
    location: 'Gurney Plaza, Penang',
    startDate: '2026-11-15',
    endDate: '2026-11-16',
    adviser: 'Nurul Idris, ADV-0315, Penang',
    person: {
      name: 'Wei Ling Tan',
      email: 'wei.ling@example.com',
      mobile: '60145551234',
      nationalId: '880721-07-2211',
      dob: '21 Jul 1988',
      purposes: { 'Marketing communications': true, 'Market research': true },
      channels: { Email: true, SMS: true },
      signed: 'Wei Ling Tan',
      date: '15 Nov 2026',
      agent: 'Nurul Idris',
      notes: 'Signed at the Gurney Plaza booth',
    },
  },
  {
    file: 'Johor-Bahru-Mall-Kiosk-Paper-Consent-FILLED.pdf',
    name: 'Johor Bahru Mall Kiosk',
    eventName: 'Mall kiosk',
    location: 'Mid Valley Southkey, Johor Bahru',
    startDate: '2026-11-22',
    endDate: '2026-11-22',
    adviser: 'Hafiz Abdullah, ADV-0440, Johor Bahru',
    person: {
      name: 'Farah Ismail',
      email: 'farah.ismail@example.com',
      mobile: '60167778899',
      nationalId: '920104-01-5566',
      dob: '04 Jan 1992',
      purposes: { 'Product and service offers': true },
      channels: { SMS: true, Phone: true },
      signed: 'Farah Ismail',
      date: '22 Nov 2026',
      agent: 'Hafiz Abdullah',
      notes: 'Signed at the Southkey kiosk',
    },
  },
  {
    file: 'Shah-Alam-Branch-Evening-Paper-Consent-FILLED.pdf',
    name: 'Shah Alam Branch Evening',
    eventName: 'Branch evening',
    location: 'Shah Alam',
    startDate: '2026-12-03',
    endDate: '2026-12-03',
    adviser: 'Lina Gomez, ADV-0522, Shah Alam',
    person: {
      name: 'Daniel Khoo',
      email: 'daniel.khoo@example.com',
      mobile: '60181234567',
      nationalId: '870909-08-9900',
      dob: '09 Sep 1987',
      purposes: { 'Marketing communications': true, 'Product and service offers': true },
      channels: { Email: true, Post: true },
      signed: 'Daniel Khoo',
      date: '03 Dec 2026',
      agent: 'Lina Gomez',
      notes: 'Signed at the Shah Alam evening',
    },
  },
]

const desktop = 'C:/Users/Rajshree.Jajoo/Desktop'
const folder = __dirname
const blankCampaign = campaigns[0]
campaigns.forEach(function (campaign) {
  const pdf = buildPdf(formPages(campaign, campaign.person))
  fs.writeFileSync(path.join(folder, campaign.file), pdf)
  fs.writeFileSync(path.join(desktop, campaign.file), pdf)
  console.log(campaign.file + ' — ' + campaign.person.name)
})
const blank = buildPdf(formPages(blankCampaign, null))
fs.writeFileSync(path.join(folder, 'KL-Roadshow-Paper-Consent-BLANK.pdf'), blank)
fs.writeFileSync(path.join(desktop, 'KL-Roadshow-Paper-Consent-BLANK.pdf'), blank)
console.log('wrote filled PDFs for each campaign, plus one blank KL form')
