import { emailBase, emailHeader, emailBtn, emailP } from './base'

export interface ProfileNudgeData {
  playerName: string
  completionPct: number
  missingItems: string[]
}

export function profileNudge({ playerName, completionPct, missingItems }: ProfileNudgeData): string {
  return emailBase(`
    ${emailHeader('Profile Tip', 'Coaches are looking — your profile isn\'t ready yet')}
    <div style="padding:24px;">
      ${emailP(`Hi ${playerName},`)}
      ${emailP(`Your Gainline Player Card is <strong style="color:#D4A843;">${completionPct}% complete</strong>. Coaches filter by profile quality, so incomplete cards get far fewer views.`)}

      ${missingItems.length > 0 ? `
        <div style="margin-bottom:20px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">What's missing</p>
          ${missingItems.map(item => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#1C2338;border-radius:8px;border:1px solid rgba(255,255,255,0.06);margin-bottom:6px;">
              <div style="width:6px;height:6px;border-radius:50%;background:#D4A843;flex-shrink:0;"></div>
              <span style="font-size:13px;color:rgba(255,255,255,0.7);">${item}</span>
            </div>`).join('')}
        </div>` : ''}

      ${emailP('Complete profiles get 3× more coach views. It takes less than 5 minutes.')}
      ${emailBtn('Complete my profile', 'https://gainline.pro/dashboard/profile')}
    </div>
  `)
}
