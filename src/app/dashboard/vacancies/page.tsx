import { redirect } from 'next/navigation'

export default function OldVacanciesRedirect() {
  redirect('/dashboard/coach/vacancies')
}
