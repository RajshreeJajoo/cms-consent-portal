import { Link, useParams } from 'react-router-dom'
import { campaignById } from '../data/seed.js'
import { useData } from '../context/DataContext.jsx'
import PublicFrame from '../components/PublicFrame.jsx'
import { useTitle } from '../lib/useTitle.js'

export default function Thanks() {
  const { token } = useParams()
  const { findToken } = useData()
  const record = findToken(token)
  const campaign = record ? campaignById(record.campaignId) : null
  useTitle('Consent stored')

  if (!record) {
    return (
      <PublicFrame>
        <h1>This confirmation is no longer available</h1>
        <p>The demo data may have been reset in this browser.</p>
      </PublicFrame>
    )
  }

  return (
    <PublicFrame>
      <header className="page-head">
        <p className="eyebrow">Consent received</p>
        <h1>Thank you, {record.subject.fullName.split(' ')[0]}.</h1>
        <p className="lede">
          Your details and marketing consent {campaign ? 'for ' + campaign.name + ' ' : ''}are now stored in CMS. The QR you scanned was only the way into this form. It does not open this submission again.
        </p>
      </header>
      <Link className="btn ghost" to="/login">Staff sign in</Link>
    </PublicFrame>
  )
}
