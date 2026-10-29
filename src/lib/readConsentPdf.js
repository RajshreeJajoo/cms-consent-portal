const MONTHS = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
}

function decodePdf(bytes) {
  let text = ''
  for (let i = 0; i < bytes.length; i += 1) text += String.fromCharCode(bytes[i])
  return text
}

function textParts(raw) {
  const pattern = /BT \/F\d+ [\d.]+ Tf ([\d.]+) ([\d.]+) Td \(([^)]*)\) Tj ET/g
  const parts = []
  let match = pattern.exec(raw)
  let previous = 0
  while (match) {
    parts.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
      text: match[3],
      between: raw.slice(previous, match.index),
    })
    previous = match.index + match[0].length
    match = pattern.exec(raw)
  }
  return parts
}

function valueBeside(parts, label) {
  const index = parts.findIndex(function (part) { return part.text === label && part.x < 60 })
  if (index < 0) return ''
  const labelY = parts[index].y
  const value = parts.slice(index + 1).find(function (part) {
    return part.x > 100 && Math.abs(part.y - labelY) < 4
  })
  return value ? value.text : ''
}

function ticked(parts, label) {
  const part = parts.find(function (item) { return item.text === label && item.x > 60 && item.x < 90 })
  return Boolean(part && /l S/.test(part.between))
}

function isoDate(value) {
  const match = String(value || '').match(/(\d{1,2}) ([A-Za-z]{3}) (\d{4})/)
  if (!match) return ''
  const month = MONTHS[match[2].toLowerCase()]
  if (!month) return ''
  const day = match[1].length === 1 ? '0' + match[1] : match[1]
  return match[3] + '-' + month + '-' + day
}

export function readConsentFromPdf(bytes, campaigns) {
  const raw = decodePdf(bytes)
  const parts = textParts(raw)
  const purposes = {
    marketing: ticked(parts, 'Marketing communications'),
    offers: ticked(parts, 'Product and service offers'),
    research: ticked(parts, 'Market research'),
  }
  const channels = {
    email: ticked(parts, 'Email'),
    sms: ticked(parts, 'SMS'),
    phone: ticked(parts, 'Phone'),
    post: ticked(parts, 'Post'),
  }
  const campaignLine = parts.find(function (part) { return part.text.indexOf('Name: ') === 0 })
  const campaignName = campaignLine ? campaignLine.text.replace('Name: ', '') : ''
  const campaign = (campaigns || []).find(function (item) {
    return campaignName && item.name.toLowerCase() === campaignName.toLowerCase()
  })
  const fullName = valueBeside(parts, 'Full name')
  const email = valueBeside(parts, 'Email')
  const result = {
    fullName: fullName,
    email: email,
    mobile: valueBeside(parts, 'Mobile'),
    nationalId: valueBeside(parts, 'National ID'),
    dob: isoDate(valueBeside(parts, 'Date of birth')),
    campaignId: campaign ? campaign.id : '',
    purposes: purposes,
    channels: channels,
    notes: valueBeside(parts, 'Notes'),
    acknowledgement: ticked(parts, 'The prospect has read and signed this wording.'),
    found: Boolean(fullName || email),
  }
  return result
}
