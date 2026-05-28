import { emailBase, emailHeader, emailBtn, emailP } from './base'

export interface WelcomePlayerData {
  firstName: string
  shareToken: string
}

export function welcomePlayer({ firstName, shareToken }: WelcomePlayerData): string {
  const shareUrl = `https://gainline.pro/cv/${shareToken}`
  const dashboardUrl = 'https://gainline.pro/dashboard'

  return emailBase(`
    ${emailHeader('Welcome to Gainline', `Your Player Card is live, ${firstName}`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${firstName}, your Gainline Player Card is now live and ready to share with coaches and clubs.`)}
      ${emailP('Here\'s how to make the most of it:')}

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        ${['Request a reference from a coach who knows your game', 'Upload your highlight video — agents watch this first', 'Add your playing stats so coaches can filter by position and performance'].map((step, i) => `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:#1C2338;border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
            <span style="width:22px;height:22px;border-radius:50%;background:#3DBE72;color:#0C0F16;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:22px;text-align:center;font-family:Arial,sans-serif;">${i + 1}</span>
            <span style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;">${step}</span>
          </div>`).join('')}
      </div>

      <div style="background:#1C2338;border:1px solid rgba(61,190,114,0.2);border-radius:10px;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5A564F;">Your public link</p>
        <p style="margin:0;font-size:13px;color:#3DBE72;font-family:monospace;word-break:break-all;">${shareUrl}</p>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        ${emailBtn('Go to dashboard', dashboardUrl)}
        <a href="${shareUrl}" style="display:inline-block;background:transparent;color:rgba(255,255,255,0.6);text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;border:1px solid rgba(255,255,255,0.2);">View my card</a>
      </div>
    </div>
  `)
}
