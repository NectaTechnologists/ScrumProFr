// Test accounts to exclude from analytics, admin stats, and ad conversion events.
// Shared by the admin dashboard and the signup tracking code so there's one list.
export const TEST_EMAILS = [
  'brucekay@outlook.com',
  'bruce@necta.co.za',
  'bruce+1@necta.co.za',
  'brucekay+1@outlook.com',
  'brucekay+3@outlook.com',
]

export function isTestEmail(email: string | null | undefined) {
  return !!email && TEST_EMAILS.includes(email)
}
