'use client'
import Image from 'next/image'

import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }
        .terms-nav { background: #0D1B2E; padding: 0 28px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .terms-logo-text { color: white; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; font-family: 'Arial Black', Arial, sans-serif; }
        .terms-back { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 14px; font-family: Arial, sans-serif; }
        .terms-content { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
        .terms-content h1 { font-size: 28px; font-weight: 900; color: #0D1B2E; margin-bottom: 8px; font-family: 'Arial Black', Arial, sans-serif; }
        .terms-date { font-size: 13px; color: #888780; margin-bottom: 40px; }
        .terms-content h2 { font-size: 16px; font-weight: 700; color: #0D1B2E; margin: 32px 0 10px; }
        .terms-content p { font-size: 14px; color: #5F5E5A; line-height: 1.8; margin-bottom: 12px; }
        .terms-content ul { padding-left: 20px; margin-bottom: 12px; }
        .terms-content li { font-size: 14px; color: #5F5E5A; line-height: 1.8; }
      `}</style>

      <nav className="terms-nav">
        <div style={{ display: 'flex', alignItems: 'center' }}><Image src="/gainline-logo-final.svg" alt="Gainline" width={160} height={48} /></div>
        <button className="terms-back" onClick={() => window.close()}>← Close</button>
      </nav>

      <div className="terms-content">
        <h1>Terms & Conditions</h1>
        <p className="terms-date">Last updated: April 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By creating an account on Gainline, you agree to these Terms & Conditions. If you do not agree, please do not use the platform.</p>

        <h2>2. About Gainline</h2>
        <p>Gainline is a rugby player recruitment platform that connects players with coaches and clubs. Players create digital CVs; coaches and organisations browse and manage player profiles.</p>

        <h2>3. Account Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current information and to update it as necessary.</p>

        <h2>4. Player Data & Privacy</h2>
        <p>Player profiles may be visible to verified coaches and organisations on the platform. Documents uploaded to your profile are private and only accessible to verified coaches — they are never shown on your public CV link.</p>
        <p>We do not sell your personal data to third parties. Please see our Privacy Policy for full details.</p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Upload false, misleading, or fraudulent information</li>
          <li>Use the platform for any unlawful purpose</li>
          <li>Attempt to access other users' data without authorisation</li>
          <li>Upload content that infringes third-party intellectual property rights</li>
        </ul>

        <h2>6. Content Ownership</h2>
        <p>You retain ownership of the content you upload. By uploading content, you grant Gainline a limited licence to display and store that content for the purposes of operating the platform.</p>

        <h2>7. Termination</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us.</p>

        <h2>8. Limitation of Liability</h2>
        <p>Gainline is provided "as is". We make no guarantees regarding platform availability or the accuracy of user-submitted content. We are not liable for any recruitment outcomes.</p>

        <h2>9. Changes to These Terms</h2>
        <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>

        <h2>10. Contact</h2>
        <p>For any questions about these terms, please contact us at legal@gainline.pro.</p>
      </div>
    </>
  )
}