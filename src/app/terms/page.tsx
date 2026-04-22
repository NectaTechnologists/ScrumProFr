export default function TermsOfService() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #F1EFE8; }

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
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-date">Last updated: April 2026</p>

        <div className="legal-highlight">
          These Terms of Service govern your use of the Gainline platform at gainline.pro. By creating an account or using Gainline, you agree to these terms. Please read them carefully before using the platform.
        </div>

        <div className="legal-section">
          <h2>1. About Gainline</h2>
          <p>Gainline is a digital rugby player profile and management platform operated by NectaTechnologists. Gainline allows rugby players to create professional digital CVs and allows agents, coaches and organisations to discover and manage players.</p>
          <p>These Terms apply to all users of Gainline, including players, agents, coaches, and any other individuals or organisations accessing the platform.</p>
        </div>

        <div className="legal-section">
          <h2>2. Eligibility</h2>
          <p>To use Gainline you must be at least 16 years of age. If you are between 13 and 16, you must have verifiable parental or guardian consent. By creating an account, you confirm that you meet these age requirements.</p>
          <p>You must provide accurate and truthful information when creating your account and player profile. Gainline reserves the right to suspend or terminate accounts where false or misleading information is provided.</p>
        </div>

        <div className="legal-section">
          <h2>3. Player profiles and content</h2>
          <p>You are responsible for all content you upload to Gainline, including profile information, statistics, documents, photos and videos. By uploading content, you confirm that:</p>
          <ul>
            <li>You own the content or have the right to use it</li>
            <li>The content is accurate and not misleading</li>
            <li>The content does not infringe any third party's intellectual property rights</li>
            <li>The content does not contain offensive, illegal, or harmful material</li>
            <li>You have the consent of any individuals depicted in photos or videos</li>
          </ul>
          <p>By uploading content to Gainline, you grant us a non-exclusive, worldwide, royalty-free licence to store, display, and share that content as part of operating the platform.</p>
        </div>

        <div className="legal-section">
          <h2>4. Player profiles — free tier</h2>
          <p>Creating and maintaining a player profile on Gainline is free. This includes building your digital CV, generating a shareable link, and having your profile visible to agents and organisations.</p>
          <p>Gainline reserves the right to introduce limits on the free tier in the future. Where this occurs, existing free users will be given reasonable advance notice before any changes take effect.</p>
        </div>

        <div className="legal-section">
          <h2>5. Agent and organisation accounts</h2>
          <p>Agents and organisations using Gainline&apos;s professional tools agree to the following additional terms:</p>
          <ul>
            <li>You may only add players to your book with their knowledge and consent</li>
            <li>You must not use Gainline to contact players in a way that constitutes harassment or unsolicited commercial communication</li>
            <li>You are responsible for maintaining the accuracy of player data you manage on their behalf</li>
            <li>You must not share player data accessed through Gainline with unauthorised third parties</li>
            <li>Subscription fees are charged in advance and are non-refundable except where required by law</li>
          </ul>
          <p>Agent accounts that violate these terms may be suspended or terminated without refund.</p>
        </div>

        <div className="legal-section">
          <h2>6. Prohibited uses</h2>
          <p>You must not use Gainline to:</p>
          <ul>
            <li>Impersonate any person, player, agent, or organisation</li>
            <li>Upload false, misleading, or fabricated rugby statistics or achievements</li>
            <li>Scrape, copy, or systematically extract data from the platform</li>
            <li>Attempt to gain unauthorised access to other users&apos; accounts or data</li>
            <li>Use the platform for any unlawful purpose</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Use Gainline to facilitate the trafficking or exploitation of players</li>
            <li>Violate any applicable sports governing body regulations regarding player representation</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>7. Intellectual property</h2>
          <p>The Gainline name, logo, platform design, and all associated intellectual property are owned by NectaTechnologists. You may not use, copy, or reproduce any of our branding or platform design without our prior written consent.</p>
          <p>You retain ownership of the content you upload to your profile. We do not claim ownership of your personal data, statistics, photos, or documents.</p>
        </div>

        <div className="legal-section">
          <h2>8. Profile visibility and sharing</h2>
          <p>By setting your profile to Public (the default), you agree that anyone with your CV link can view your profile information. You can change your visibility settings at any time through your profile page.</p>
          <p>Gainline is not responsible for how your profile information is used by third parties who have accessed it through your shared CV link. Exercise care when sharing your CV link with people you do not know.</p>
        </div>

        <div className="legal-section">
          <h2>9. Disclaimer of warranties</h2>
          <p>Gainline is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee that the platform will be uninterrupted, error-free, or free from security vulnerabilities.</p>
          <p>We do not guarantee that using Gainline will result in player placement, contract offers, agent representation, or any other professional outcome. Gainline is a visibility and management tool — outcomes depend on many factors outside our control.</p>
        </div>

        <div className="legal-section">
          <h2>10. Limitation of liability</h2>
          <p>To the fullest extent permitted by law, NectaTechnologists shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of Gainline, including but not limited to loss of data, loss of business opportunity, or reputational damage.</p>
          <p>Our total liability to you for any claim arising from your use of Gainline shall not exceed the amount you have paid us in the 12 months preceding the claim, or €100, whichever is greater.</p>
        </div>

        <div className="legal-section">
          <h2>11. Account termination</h2>
          <p>You may delete your account at any time by contacting us at <strong>support@gainline.pro</strong>. Upon deletion, your profile will be removed from public view and your personal data will be deleted within 30 days.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms, without notice in cases of serious violation. Where we terminate an account without cause, we will provide a pro-rata refund of any prepaid subscription fees.</p>
        </div>

        <div className="legal-section">
          <h2>12. Changes to the platform and terms</h2>
          <p>We may update these Terms from time to time. When we make significant changes, we will notify you by email or by displaying a notice on the platform. Continued use of Gainline after changes are posted constitutes acceptance of the updated Terms.</p>
          <p>We may modify, suspend, or discontinue features of the platform at any time. Where we discontinue a feature that materially affects your use of the platform, we will provide reasonable advance notice.</p>
        </div>

        <div className="legal-section">
          <h2>13. Governing law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of South Africa, without regard to conflict of law principles. Users in the European Economic Area also benefit from the mandatory consumer protection laws of their country of residence.</p>
          <p>Any disputes arising from these Terms or your use of Gainline shall be subject to the exclusive jurisdiction of the courts of South Africa, unless mandatory local law requires otherwise.</p>
        </div>

        <div className="legal-section">
          <h2>14. Contact</h2>
          <p>If you have questions about these Terms or need to report a violation, please contact us at <strong>legal@gainline.pro</strong>.</p>
        </div>

        <div className="legal-contact">
          <h2>Get in touch</h2>
          <p>For legal enquiries: <a href="mailto:legal@gainline.pro">legal@gainline.pro</a></p>
          <p>For privacy matters: <a href="mailto:privacy@gainline.pro">privacy@gainline.pro</a></p>
          <p>For general support: <a href="mailto:support@gainline.pro">support@gainline.pro</a></p>
          <p>Website: <a href="https://gainline.pro">gainline.pro</a></p>
        </div>
      </div>
    </>
  )
}
