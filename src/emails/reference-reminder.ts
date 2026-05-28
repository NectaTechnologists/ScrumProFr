import { emailBase, emailHeader, emailBox, emailBtn, emailP } from './base'

export interface ReferenceReminderData {
  refereeName: string
  playerName: string
  submitUrl: string
  daysSinceRequest: number
}

export function referenceReminder({ refereeName, playerName, submitUrl, daysSinceRequest }: ReferenceReminderData): string {
  return emailBase(`
    ${emailHeader('Friendly Reminder', `${playerName} is still waiting on your reference`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${refereeName},`)}
      ${emailP(`Just a quick nudge — <strong style="color:white;">${playerName}</strong> requested a reference from you ${daysSinceRequest} days ago and it hasn't been submitted yet.`)}
      ${emailBox([{ label: 'Player', value: playerName }])}
      ${emailP('It only takes two minutes. No login required — click below and write directly on their card.')}
      ${emailBtn('Write reference now', submitUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.6;">
        If you don't wish to write a reference, you can simply ignore this email. This is the only reminder you'll receive.
      </p>
    </div>
  `)
}
