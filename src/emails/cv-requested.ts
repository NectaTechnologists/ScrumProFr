import { emailBase, emailHeader, emailBox, emailBtn, emailP } from './base'

export interface CvRequestedData {
  playerName: string
  coachName: string
  coachOrg?: string | null
}

export function cvRequested({ playerName, coachName, coachOrg }: CvRequestedData): string {
  return emailBase(`
    ${emailHeader('Player Card Request', 'A coach wants to see your full Player Card')}
    <div style="padding:24px;">
      ${emailP(`Hi ${playerName},`)}
      ${emailP(`<strong style="color:white;">${coachName}</strong>${coachOrg ? ` from <strong style="color:white;">${coachOrg}</strong>` : ''} has requested access to your full Gainline Player Card.`)}
      ${emailBox([
        { label: 'Requested by', value: coachName },
        ...(coachOrg ? [{ label: 'Organisation', value: coachOrg }] : []),
      ])}
      ${emailP('Log in to your dashboard to review the request and share your Player Card with one tap.')}
      ${emailBtn('Review request', 'https://gainline.pro/dashboard')}
    </div>
  `)
}
