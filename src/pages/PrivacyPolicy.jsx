import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="container py-5 page-fade-in">
      <div className="glass-panel p-4 p-md-5" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 className="mb-2">Privacy Policy</h1>
        <p style={{ color: "var(--color-text-muted)" }}>Last updated: September 20, 2026</p>

        <p>
          This Privacy Policy explains what information ReadMe ("we," "us," "the Site") collects
          when you use this website, how we use it, and the choices you have. By using ReadMe,
          you agree to the practices described here.
        </p>

        <h4 className="mt-4">1. Information We Collect</h4>
        <p><strong>Account information you provide:</strong></p>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Password (stored only as a one-way cryptographic hash — we never store or can see your actual password)</li>
          <li>Favorite genre (optional)</li>
        </ul>
        <p><strong>Information collected automatically:</strong></p>
        <ul>
          <li>Your IP address, used only to apply rate limiting on login/registration and prevent abuse</li>
          <li>Basic technical data such as browser type, sent automatically by your browser to any website you visit</li>
        </ul>

        <h4 className="mt-4">2. Cookies and Local Storage</h4>
        <p>
          We use your browser's local storage (not traditional cookies) to keep you signed in.
          This includes a short-lived access token, a longer-lived refresh token, and your basic
          account details. These are used solely to operate the login system and are never sold
          or shared with advertisers.
        </p>
        <p>
          We also store a small flag in local storage to remember that you've accepted our Terms
          of Use, so you aren't asked again on every visit.
        </p>

        <h4 className="mt-4">3. Advertising and Third-Party Cookies</h4>
        <p>
          This Site may display advertisements served by Google AdSense. Google and its
          partners may use cookies to serve ads based on your prior visits to this or other
          websites. You can opt out of personalized advertising by visiting{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">
            Google's Ads Settings
          </a>
          , or generally at{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noreferrer">
            www.aboutads.info/choices
          </a>
          . Google's use of advertising cookies is governed by{" "}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
            Google's own Privacy & Terms
          </a>
          , which we encourage you to review.
        </p>

        <h4 className="mt-4">4. Third-Party Services We Use</h4>
        <p>We rely on the following infrastructure providers to run this Site, each with their own privacy practices:</p>
        <ul>
          <li><strong>Neon</strong> — hosts our database (account and book data)</li>
          <li><strong>Cloudinary</strong> — hosts book cover and page images</li>
          <li><strong>Upstash</strong> — hosts session/refresh-token data (Redis)</li>
          <li><strong>Google AdSense</strong> — serves advertisements (see Section 3)</li>
        </ul>
        <p>None of these providers receive your password, which never leaves our servers in readable form.</p>

        <h4 className="mt-4">5. How We Use Your Information</h4>
        <ul>
          <li>To create and secure your account</li>
          <li>To let you log in and stay logged in across visits</li>
          <li>To operate core site features (reading progress, admin functions for site operators)</li>
          <li>To detect and prevent abuse, such as automated login attempts</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>

        <h4 className="mt-4">6. Data Security</h4>
        <p>
          Passwords are hashed using industry-standard cryptographic hashing (bcrypt) and are never
          stored or logged in plain text. Access to the site's administrative functions is
          restricted by role-based permissions.
        </p>

        <h4 className="mt-4">7. Children's Privacy</h4>
        <p>
          This Site is not directed at children under 13, and we do not knowingly collect
          personal information from children under 13. If you believe a child has provided us
          personal information, please contact us so we can delete it.
        </p>

        <h4 className="mt-4">8. Your Rights</h4>
        <p>
          You may request access to, correction of, or deletion of your personal data at any time
          by contacting us at the email below. We will respond within a reasonable timeframe.
        </p>

        <h4 className="mt-4">9. Changes to This Policy</h4>
        <p>
          We may update this Privacy Policy from time to time. Continued use of the Site after
          changes are posted constitutes acceptance of the revised policy.
        </p>

        <h4 className="mt-4">10. Contact Us</h4>
        <p>Questions about this Privacy Policy can be sent to: <strong>abhishekkhursange139@gmail.com</strong></p>
      </div>
    </div>
  );
}