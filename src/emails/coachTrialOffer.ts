import { emailBase, emailHeader, emailBtn, emailP } from './base'

interface CoachTrialOfferProps {
  firstName: string
  organisationName?: string | null
  ctaUrl: string
}

export function coachTrialOfferEmail({
  firstName,
  organisationName,
  ctaUrl,
}: CoachTrialOfferProps): string {
  const orgPhrase = organisationName ? `, ${organisationName} included` : ''

  return emailBase(`
    ${emailHeader('Coach Trial', `24 months free on Gainline`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${firstName},`)}

      ${emailP(`Quick one — I've got an idea I'd like to run past you.`)}

      ${emailP(
        `I want to try something with a small group of coaches${orgPhrase}, before opening it up more widely.`
      )}

      ${emailP(
        `The idea: when you post your player needs on social media — "looking for a tighthead prop for pre-season" type posts — you mention that enquiries go via Gainline instead of fielding DMs one by one. Every reply lands in one place, with a proper Player Card attached, rather than scattered across WhatsApp and Instagram comments.`
      )}

      <div style="background:#1C2338;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:white;">The idea is simple:</p>
        <p style="margin:0 0 12px;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;">
          • When you're looking for players, you post it on your club or personal social media — same as you'd do anyway — and mention that enquiries go via Gainline.<br/>
          • That's it. No exclusivity, no change to how you already scout or sign players.
        </p>
        <p style="margin:0;font-size:14px;font-weight:600;color:white;">
          In return: <span style="color:#3DBE72;">24 months of Gainline completely free</span> — full access, no platform cost, for the length of the trial.
        </p>
      </div>

      ${emailP(
        `If that sounds like something you'd want to do, let me know and we'll get on a quick call to talk through it.`
      )}

      ${emailBtn("I'm interested — tell me more", ctaUrl)}

      <div style="height:16px;"></div>
      ${emailP(`Talk soon,<br/>Bruce`)}
    </div>
  `)
}
