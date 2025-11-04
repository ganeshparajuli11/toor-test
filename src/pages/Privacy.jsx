import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './InfoPage.css';

const Privacy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy | TOOR"
        description="Learn how TOOR collects, uses, and protects your personal information."
        keywords="privacy policy, data protection, personal information"
        canonical="/privacy"
      />

      <div className="info-page">
        <Header />

        <div className="info-hero">
          <div className="container">
            <h1 className="info-hero-title">Privacy Policy</h1>
            <p className="info-hero-subtitle">
              Your privacy is important to us
            </p>
          </div>
        </div>

        <div className="info-content">
          <div className="info-container">
            <div className="info-card">
              <div className="info-section">
                <h2 className="info-section-title">1. Information We Collect</h2>
                <div className="info-section-content">
                  <p>
                    We collect information you provide directly to us, including:
                  </p>
                  <ul>
                    <li><strong>Personal Information:</strong> Name, email address, phone number, postal address</li>
                    <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through our payment partners)</li>
                    <li><strong>Travel Information:</strong> Passport details, travel preferences, special requirements</li>
                    <li><strong>Account Information:</strong> Username, password, profile preferences</li>
                  </ul>
                  <p>
                    We also automatically collect certain information when you use our platform:
                  </p>
                  <ul>
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, search queries)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">2. How We Use Your Information</h2>
                <div className="info-section-content">
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Process and manage your bookings</li>
                    <li>Communicate with you about your reservations</li>
                    <li>Send you confirmations, updates, and customer support messages</li>
                    <li>Personalize your experience on our platform</li>
                    <li>Improve our services and develop new features</li>
                    <li>Detect and prevent fraud and abuse</li>
                    <li>Comply with legal obligations</li>
                    <li>Send you marketing communications (with your consent)</li>
                  </ul>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">3. Information Sharing</h2>
                <div className="info-section-content">
                  <p>We may share your information with:</p>
                  <ul>
                    <li><strong>Service Providers:</strong> Hotels, airlines, car rental companies, and other travel service providers to complete your bookings</li>
                    <li><strong>Payment Processors:</strong> Secure third-party payment processors to handle transactions</li>
                    <li><strong>Business Partners:</strong> Trusted partners who help us operate and improve our services</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  </ul>
                  <p>
                    We do not sell your personal information to third parties for their marketing purposes.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">4. Data Security</h2>
                <div className="info-section-content">
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <ul>
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Secure server infrastructure</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Employee training on data protection</li>
                  </ul>
                  <p>
                    However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">5. Your Rights and Choices</h2>
                <div className="info-section-content">
                  <p>You have the right to:</p>
                  <ul>
                    <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                    <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                    <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
                    <li><strong>Object:</strong> Object to certain processing of your information</li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us at privacy@toor.com.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">6. Cookies and Tracking</h2>
                <div className="info-section-content">
                  <p>
                    We use cookies and similar tracking technologies to:
                  </p>
                  <ul>
                    <li>Remember your preferences and settings</li>
                    <li>Understand how you use our platform</li>
                    <li>Improve our services</li>
                    <li>Deliver personalized content and advertisements</li>
                  </ul>
                  <p>
                    You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our platform.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">7. Children's Privacy</h2>
                <div className="info-section-content">
                  <p>
                    Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">8. International Data Transfers</h2>
                <div className="info-section-content">
                  <p>
                    Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">9. Changes to This Policy</h2>
                <div className="info-section-content">
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">10. Contact Us</h2>
                <div className="info-section-content">
                  <p>
                    If you have questions about this Privacy Policy or our privacy practices, please contact us:
                  </p>
                  <p>
                    Email: privacy@toor.com<br />
                    Phone: +1 (555) 123-4567<br />
                    Address: 123 Travel Street, New York, NY 10001, USA
                  </p>
                </div>
              </div>

              <div className="info-last-updated">
                Last updated: January 1, 2024
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Privacy;
