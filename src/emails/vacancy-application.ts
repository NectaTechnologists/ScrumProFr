import { emailBase, emailHeader, emailBox, emailBtn, emailP } from './base'

export interface VacancyApplicationData {
  coachFirstName: string
  playerName: string
  playerPosition: string
  playerNationality?: string | null
  vacancyPosition: string
  clubName: string
  applicationsUrl: string
}

export function vacancyApplication({
  coachFirstName,
  playerName,
  playerPosition,
  playerNationality,
  vacancyPosition,
  clubName,
  applicationsUrl,
}: VacancyApplicationData): string {
  const pos = (s: string) => s.replace(/_/g, ' ')

  return emailBase(`
    ${emailHeader('New Application', `${playerName} applied for your ${pos(vacancyPosition)} vacancy`)}
    <div style="padding:24px;">
      ${emailP(`Hi ${coachFirstName},`)}
      ${emailP(`A player has submitted their Gainline Player Card for your <strong style="color:white;">${pos(vacancyPosition)}</strong> vacancy at <strong style="color:white;">${clubName}</strong>.`)}
      ${emailBox([
        { label: 'Player', value: playerName },
        { label: 'Position', value: pos(playerPosition) },
        ...(playerNationality ? [{ label: 'Nationality', value: playerNationality }] : []),
        { label: 'Vacancy', value: `${pos(vacancyPosition)} — ${clubName}` },
      ])}
      ${emailP('View their full Player Card and update the application status from your coach portal.')}
      ${emailBtn('Review application', applicationsUrl)}
    </div>
  `)
}
