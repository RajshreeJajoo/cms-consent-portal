import { useNavigate } from 'react-router-dom'
import { assignedCampaignId, campaignsForUser } from '../data/seed.js'
import { useAuth } from '../context/AuthContext.jsx'
import ConsentJourney from '../components/ConsentJourney.jsx'
import { useTitle } from '../lib/useTitle.js'

export default function IntakePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  useTitle('New consent')
  const campaigns = campaignsForUser(user)

  return (
    <div className="page">
      <ConsentJourney
        heading="New consent"
        lede="Fill the boxes yourself, or upload a filled PDF so the boxes fill from the file. Both are valid. A prospect does not use this page. They enter consent after scanning the campaign QR."
        actor={user.name}
        origin="Staff portal"
        detail="Consent entered by staff."
        captureMode="paper"
        submitLabel="Save consent"
        campaigns={campaigns}
        adviserForCampaign={function (campaign) {
          return campaign.adviserId
        }}
        allowSeparate={user.role === 'operations'}
        canUpdateMatch={function (record) {
          if (user.role === 'operations') return true
          return assignedCampaignId(user) === record.campaignId
        }}
        onDone={function (record) {
          navigate('/consents/' + record.id)
        }}
      />
    </div>
  )
}
