import { Link, useNavigate, useParams } from 'react-router-dom'
import { campaignByCode } from '../data/seed.js'
import ConsentJourney from '../components/ConsentJourney.jsx'
import PublicFrame from '../components/PublicFrame.jsx'
import { useTitle } from '../lib/useTitle.js'

export default function PublicIntake() {
  const { code } = useParams()
  const navigate = useNavigate()
  const campaign = campaignByCode(code)
  useTitle(campaign ? campaign.name : 'Campaign form')

  if (!campaign) {
    return (
      <PublicFrame>
        <h1>This campaign code is not active</h1>
        <p>Check the code with the adviser and scan the campaign QR again.</p>
        <Link to="/login">Staff sign in</Link>
      </PublicFrame>
    )
  }

  return (
    <PublicFrame>
      <ConsentJourney
        key={campaign.id}
        heading={campaign.name}
        lede={campaign.summary + ' Enter your details and marketing consent. This page does not accept a file upload.'}
        captureMode="digital"
        submitLabel="Submit consent"
        actor="Prospect via QR"
        origin="Campaign QR"
        detail={'Completed from the campaign QR for ' + campaign.name + '.'}
        campaigns={[campaign]}
        lockedCampaign={campaign}
        adviserForCampaign={function () { return campaign.adviserId }}
        allowSeparate={false}
        canUpdateMatch={function () { return true }}
        onDone={function (record) { navigate('/thanks/' + record.publicToken) }}
      />
    </PublicFrame>
  )
}
