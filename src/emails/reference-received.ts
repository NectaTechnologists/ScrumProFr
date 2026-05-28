import { emailBase, emailHeader, emailBox, emailBtn, emailP } from './base'

export interface ReferenceReceivedData {
  playerName: string
  coachName: string
  coachOrg?: string | null
  referenceSnippet: string  // first ~120 chars of the reference text
}

export function referenceReceived({ playerName, coachName, coachOrg, referenceSnippet }: ReferenceReceivedData): string {
  const snippet = referenceSnippet.length > 120
    ? referenceSnippet.slice(0, 120).trimEnd() + '…'
    : referenceSnippet

  return emailBase(`
    ${emailHeader('New Reference', `${coachName} wrote you a reference`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${playerName},`)}
      ${emailP(`Good news — <strong style="color:white;">${coachName}</strong>${coachOrg ? ` from <strong style="color:white;">${coachOrg}</strong>` : ''} has submitted a reference for your Gainline Player Card.`)}

      <div style="background:#1C2338;border-left:3px solid #3DBE72;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;font-style:italic;">"${snippet}"</p>
      </div>

      ${emailBox([
        { label: 'Written by', value: coachName },
        ...(coachOrg ? [{ label: 'Organisation', value: coachOrg }] : []),
      ])}

      ${emailP('Log in to review the full reference and approve or decline it. Only approved references appear on your public card.')}
      ${emailBtn('Review reference', 'https://gainline.pro/dashboard')}
    </div>
  `)
}
