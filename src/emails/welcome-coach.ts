import { emailBase, emailHeader, emailBtn, emailP } from './base'

export interface WelcomeCoachData {
  firstName: string
  organisation?: string | null
}

export function welcomeCoach({ firstName, organisation }: WelcomeCoachData): string {
  const dashboardUrl = 'https://gainline.pro/dashboard/coach'

  return emailBase(`
    ${emailHeader('Welcome to Gainline', `Your coach portal is ready, ${firstName}`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${firstName}, your Gainline coach profile has been saved${organisation ? ` for ${organisation}` : ''}. You can now browse players and make contact requests.`)}

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        ${[
          { title: 'Browse the player directory', sub: 'Filter by position, nationality, and availability' },
          { title: 'Request a player\'s full card', sub: 'The player is notified and can share their card with you' },
          { title: 'Post a vacancy', sub: 'Matched players receive an alert automatically' },
        ].map(({ title, sub }) => `
          <div style="padding:12px 14px;background:#1C2338;border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0 0 3px;font-size:13px;font-weight:700;color:white;">${title}</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);">${sub}</p>
          </div>`).join('')}
      </div>

      ${emailBtn('Go to coach portal', dashboardUrl)}
    </div>
  `)
}
