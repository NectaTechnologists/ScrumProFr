export default function PrivacyPolicy() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #161C2A; }

        .legal-nav {
          background: #0D1B2E;
          padding: 0 28px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .legal-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .legal-logo-text {
          color: white;
          font-weight: 900;
          font-size: 20px;
          letter-spacing: -1px;
          font-family: 'Arial Black', Arial, sans-serif;
        }

        .legal-wrap {
          max-width: 760px;
          margin: 0 auto;
          padding: 52px 28px 80px;
        }

        .legal-label {
          font-size: 11px;
          color: #1D9E75;
          letter-spacing: 0.14em;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .legal-title {
          font-size: 36px;
          font-weight: 900;
          color: #0D1B2E;
          font-family: 'Arial Black', Arial, sans-serif;
          letter-spacing: -1px;
          margin-bottom: 8px;
        }

        .legal-date {
          font-size: 13px;
          color: #888780;
          margin-bottom: 40px;
          padding-bottom: 40px;
          border-bottom: 1px solid #D3D1C7;
        }

        .legal-section {
          margin-bottom: 36px;
        }

        .legal-section h2 {
          font-size: 18px;
          font-weight: 900;
          color: #0D1B2E;
          font-family: 'Arial Black', Arial, sans-serif;
          margin-bottom: 12px;
          padding-top: 8px;
        }

        .legal-section p {
          font-size: 14px;
          color: #3D3C38;
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .legal-section ul {
          margin: 12px 0 12px 20px;
        }

        .legal-section ul li {
          font-size: 14px;
          color: #3D3C38;
          line-height: 1.8;
          margin-bottom: 6px;
        }

        .legal-highlight {
          background: white;
          border-left: 3px solid #1D9E75;
          border-radius: 0 8px 8px 0;
          padding: 16px 20px;
          margin: 16px 0;
          font-size: 14px;
          color: #0D1B2E;
          line-height: 1.7;
        }

        .legal-contact {
          background: #0D1B2E;
          border-radius: 12px;
          padding: 32px;
          margin-top: 48px;
        }

        .legal-contact h2 {
          font-size: 18px;
          font-weight: 900;
          color: white;
          font-family: 'Arial Black', Arial, sans-serif;
          margin-bottom: 12px;
        }

        .legal-contact p {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          margin-bottom: 8px;
        }

        .legal-contact a {
          color: #1D9E75;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .legal-nav { padding: 0 16px; height: 56px; }
          .legal-logo-text { font-size: 17px; }
          .legal-wrap { padding: 36px 16px 60px; }
          .legal-title { font-size: 28px; }
          .legal-section h2 { font-size: 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="legal-nav">
        <a href="/" className="legal-logo">
          <svg width="32" height="30" viewBox="0 0 32 30" style={{ display: 'block' }}>
            <line x1="2" y1="28" x2="9" y2="6" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.28"/>
            <line x1="13" y1="28" x2="20" y2="2" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.58"/>
            <line x1="24" y1="28" x2="31" y2="0" stroke="#1D9E75" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <span className="legal-logo-text">GAIN<span style={{ color: '#1D9E75' }}>LINE</span></span>
        </a>
        <a href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>← Back to home</a>
      </nav>

      <div className="legal-wrap">
        <p className="legal-label">LEGAL</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-date">Last updated: April 2026</p>

        <div className="legal-highlight">
          This Privacy Policy explains how Gainline (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) collects, uses, stores and protects your personal data when you use the Gainline platform at gainline.pro. By using Gainline, you agree to the practices described in this policy.
        </div>

        <div className="legal-section">
          <h2>1. Who we are</h2>
          <p>Gainline is a digital rugby player profile and management platform operated by NectaTechnologists. We provide tools that allow rugby players to create and share professional digital CVs, and allow agents and organisations to manage player books.</p>
          <p>If you have any questions about this policy or how we handle your data, please contact us at <strong>privacy@gainline.pro</strong>.</p>
        </div>

        <div className="legal-section">
          <h2>2. What data we collect</h2>
          <p>We collect different types of data depending on how you use Gainline:</p>
          <p><strong>Account data</strong> — when you register, we collect your email address and a password (stored securely and never in plain text).</p>
          <p><strong>Player profile data</strong> — if you create a player profile, we collect:</p>
          <ul>
            <li>Full name, date of birth, nationality</li>
            <li>Physical attributes — height and weight</li>
            <li>Rugby positions (primary and secondary)</li>
            <li>School or educational institution attended</li>
            <li>Personal biography and playing summary</li>
            <li>Playing history and statistics</li>
            <li>Accolades and achievements</li>
          </ul>
          <p><strong>Documents</strong> — if you upload documents to your profile (such as passports, national ID cards, medical certificates, or contracts), we store these securely on your behalf.</p>
          <p><strong>Media</strong> — if you upload photos or videos, these are stored and may be displayed as part of your public CV.</p>
          <p><strong>Usage data</strong> — we collect information about how you use the platform, including pages visited, features used, and when your profile is viewed or saved by others.</p>
          <p><strong>Technical data</strong> — we collect your IP address, browser type, and device information for security and platform performance purposes.</p>
        </div>

        <div className="legal-section">
          <h2>3. How we use your data</h2>
          <p>We use your personal data for the following purposes:</p>
          <ul>
            <li>To provide and operate the Gainline platform</li>
            <li>To create and display your shareable rugby CV</li>
            <li>To allow agents and organisations to view your profile (subject to your visibility settings)</li>
            <li>To send you service-related communications such as account confirmations and security alerts</li>
            <li>To improve the platform and understand how it is used</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p>We do not use your data for automated decision-making or profiling in ways that produce legal or similarly significant effects on you.</p>
        </div>

        <div className="legal-section">
          <h2>4. Legal basis for processing (GDPR)</h2>
          <p>If you are located in the European Economic Area (EEA) or United Kingdom, we process your personal data under the following legal bases:</p>
          <ul>
            <li><strong>Contract performance</strong> — processing necessary to provide the Gainline service you have signed up for</li>
            <li><strong>Legitimate interests</strong> — operating and improving the platform, detecting fraud, and ensuring security</li>
            <li><strong>Consent</strong> — where you have explicitly agreed to specific processing, such as making your profile publicly visible</li>
            <li><strong>Legal obligation</strong> — where we are required to process data to comply with applicable law</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. Profile visibility and sharing</h2>
          <p>Your player profile visibility is set to <strong>Public</strong> by default, meaning anyone with your CV link can view your profile information. You can control this through your profile settings.</p>
          <p>When you share your CV link — via email, WhatsApp, social media, or any other method — you are choosing to make that information available to the recipient. Gainline is not responsible for how recipients use or share information they have accessed through your public CV link.</p>
          <p>Agents and organisations using Gainline may view your profile as part of their player management activities. By creating a public profile, you consent to this visibility.</p>
        </div>

        <div className="legal-section">
          <h2>6. Sensitive data</h2>
          <p>Some data you may provide — such as medical certificates, nationality information, or physical attributes — may be considered sensitive under applicable data protection law. We collect this data only because you have chosen to include it in your rugby profile, and we treat it with the highest level of care.</p>
          <p>By uploading sensitive documents or information, you explicitly consent to us storing and displaying this data as part of your profile, subject to your visibility settings.</p>
        </div>

        <div className="legal-section">
          <h2>7. Data retention</h2>
          <p>We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.</p>
          <p>Profile view and activity logs are retained for up to 12 months.</p>
        </div>

        <div className="legal-section">
          <h2>8. Data sharing and third parties</h2>
          <p>We do not sell your personal data to third parties. We may share your data in the following limited circumstances:</p>
          <ul>
            <li><strong>Service providers</strong> — we use Supabase for database and authentication services, and Vercel for hosting. These providers process data on our behalf under appropriate data processing agreements.</li>
            <li><strong>Legal requirements</strong> — we may disclose your data if required by law, court order, or regulatory authority.</li>
            <li><strong>Business transfers</strong> — if Gainline is acquired or merges with another entity, your data may be transferred as part of that transaction. We will notify you in advance.</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>9. International data transfers</h2>
          <p>Gainline operates globally and your data may be processed in countries outside your own. Where data is transferred outside the EEA or UK, we ensure appropriate safeguards are in place, including standard contractual clauses approved by the European Commission.</p>
        </div>

        <div className="legal-section">
          <h2>10. Your rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access</strong> — the right to request a copy of the data we hold about you</li>
            <li><strong>Rectification</strong> — the right to correct inaccurate or incomplete data</li>
            <li><strong>Erasure</strong> — the right to request deletion of your personal data</li>
            <li><strong>Restriction</strong> — the right to request that we limit how we use your data</li>
            <li><strong>Portability</strong> — the right to receive your data in a structured, machine-readable format</li>
            <li><strong>Objection</strong> — the right to object to processing based on legitimate interests</li>
            <li><strong>Withdrawal of consent</strong> — where processing is based on consent, you may withdraw it at any time</li>
          </ul>
          <p>To exercise any of these rights, please contact us at <strong>privacy@gainline.pro</strong>. We will respond within 30 days.</p>
        </div>

        <div className="legal-section">
          <h2>11. Cookies</h2>
          <p>Gainline uses essential cookies to operate the platform — specifically for authentication and session management. We do not use advertising cookies or third-party tracking cookies.</p>
          <p>By using Gainline, you consent to the use of these essential cookies. You can disable cookies in your browser settings, but this will prevent you from logging in to the platform.</p>
        </div>

        <div className="legal-section">
          <h2>12. Children and age requirements</h2>
          <p>Gainline requires users to be at least 16 years of age to create an account. If you are between 13 and 16, you must have verifiable parental or guardian consent before using Gainline.</p>
          <p>If we become aware that a user under 13 has created an account without parental consent, we will delete the account and associated data immediately. If you believe a child has registered without consent, please contact us at <strong>privacy@gainline.pro</strong>.</p>
        </div>

        <div className="legal-section">
          <h2>13. Security</h2>
          <p>We take the security of your data seriously. We use industry-standard measures including encrypted data transmission (HTTPS), secure authentication via Supabase, row-level security policies on our database, and access controls that limit who can view your data.</p>
          <p>No system is completely secure. If you believe your account has been compromised, please contact us immediately at <strong>privacy@gainline.pro</strong>.</p>
        </div>

        <div className="legal-section">
          <h2>14. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by email or by displaying a notice on the platform. The date at the top of this page indicates when the policy was last updated.</p>
          <p>Continued use of Gainline after changes are posted constitutes your acceptance of the updated policy.</p>
        </div>

        <div className="legal-contact">
          <h2>Contact us</h2>
          <p>If you have questions about this Privacy Policy or how we handle your data, please get in touch:</p>
          <p>Email: <a href="mailto:privacy@gainline.pro">privacy@gainline.pro</a></p>
          <p>Website: <a href="https://gainline.pro">gainline.pro</a></p>
        </div>
      </div>
    </>
  )
}
