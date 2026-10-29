import { adviserById, campaignsForUser } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import QrCard from '../components/QrCard.jsx'
import { formatDay } from '../lib/format.js'
import { useTitle } from '../lib/useTitle.js'

export default function Campaigns() {
  const { user } = useAuth()
  useTitle('Campaign QR')
  const campaigns = campaignsForUser(user)

  return (
    <div className="page">
      <header className="page-head">
        <h1>Campaign QR</h1>
        <p className="lede">
          This QR is the way a prospect's details and marketing consent enter CMS. The agent shows the code, the prospect scans it, and the form opens on their phone with this campaign and adviser attached. Scanning it does not open a consent that was already submitted.
        </p>
      </header>
      <div className="stack-lg">
        {campaigns.map(function (campaign) {
          const adviser = adviserById(campaign.adviserId)
          return (
            <section key={campaign.id} className="stack">
              <QrCard
                path={'/intake/' + campaign.code}
                title={campaign.name}
                text={campaign.eventName + ' · ' + campaign.location + ' · ' + formatDay(campaign.startDate) + ' · ' + (adviser ? adviser.name + ' (' + adviser.code + ')' : '')}
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}
