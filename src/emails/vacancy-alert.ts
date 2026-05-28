import { emailBase, emailHeader, emailBox, emailBtn, emailP } from './base'

export interface VacancyAlertData {
  playerName: string
  position: string
  clubName: string
  location?: string | null
  level?: string | null
  vacancyId: string
}

export function vacancyAlert({ playerName, position, clubName, location, level, vacancyId }: VacancyAlertData): string {
  const vacancyUrl = `https://gainline.pro/vacancies/${vacancyId}`
  const pos = position.replace(/_/g, ' ')

  return emailBase(`
    ${emailHeader('New Vacancy Match', `A ${pos} opportunity just posted`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${playerName},`)}
      ${emailP(`A new vacancy matching your position (<strong style="color:white;">${pos}</strong>) has been posted on Gainline.`)}
      ${emailBox([
        { label: 'Club / Organisation', value: clubName },
        { label: 'Position', value: pos },
        ...(level ? [{ label: 'Level', value: level }] : []),
        ...(location ? [{ label: 'Location', value: location }] : []),
      ])}
      ${emailP('Your Player Card has already been shared with clubs looking for your position — click below to see the full vacancy details.')}
      ${emailBtn('View vacancy', vacancyUrl)}
      <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.6;">
        You received this because your availability is set to <strong style="color:rgba(255,255,255,0.4);">Available</strong> and your position matches this vacancy.
        <a href="https://gainline.pro/dashboard" style="color:rgba(61,190,114,0.5);text-decoration:none;">Update availability →</a>
      </p>
    </div>
  `)
}
