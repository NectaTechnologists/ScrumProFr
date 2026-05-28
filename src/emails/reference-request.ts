import { emailBase, emailHeader, emailBox, emailBtn, emailP } from './base'

export interface ReferenceRequestData {
  refereeName: string
  playerName: string
  submitUrl: string  // public CV URL where the referee writes the reference
}

export function referenceRequest({ refereeName, playerName, submitUrl }: ReferenceRequestData): string {
  return emailBase(`
    ${emailHeader('Reference Request', `${playerName} would like a reference from you`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${refereeName},`)}
      ${emailP(`<strong style="color:white;">${playerName}</strong> has listed you as a referee on Gainline, a rugby player scouting platform. They're asking you to write a short reference on their player profile.`)}
      ${emailBox([{ label: 'Player', value: playerName }])}
      ${emailP('This only takes a couple of minutes. No account needed — just click the button below and write your reference directly on their public card.')}
      ${emailBtn('Write reference', submitUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.6;">
        If you weren't expecting this or don't know this player, you can ignore this email.
      </p>
    </div>
  `)
}
