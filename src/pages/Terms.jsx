import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './InfoPage.css';

const Terms = () => {
  return (
    <>
      <SEO
        title="Terms & Conditions | Zanafly"
        description="Read our terms and conditions for using Zanafly travel booking platform."
        keywords="terms and conditions, terms of service, legal"
        canonical="/terms"
      />

      <div className="info-page">
        <Header />

        <div className="info-hero">
          <div className="container">
            <h1 className="info-hero-title">Terms & Conditions</h1>
            <p className="info-hero-subtitle">
              Please read these terms carefully before using our services
            </p>
          </div>
        </div>

        <div className="info-content">
          <div className="info-container">
            <div className="info-card">
              <div className="info-section">
                <h2 className="info-section-title">1. Acceptance of Terms</h2>
                <div className="info-section-content">
                  <p>
                    By accessing and using the Zanafly platform, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                  <p>
                    We reserve the right to modify these terms at any time. Your continued use of the platform following any changes indicates your acceptance of the new terms.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">2. Use of Service</h2>
                <div className="info-section-content">
                  <p>
                    Zanafly provides an online platform for booking travel services including hotels, flights, cruises, and car rentals. You agree to:
                  </p>
                  <ul>
                    <li>Provide accurate, current, and complete information during booking</li>
                    <li>Maintain the security of your account and password</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">3. Booking and Payment</h2>
                <div className="info-section-content">
                  <p>
                    <strong>Pricing:</strong> All prices displayed are subject to availability and may change without notice. Prices include applicable taxes unless otherwise stated.
                  </p>
                  <p>
                    <strong>Payment:</strong> Payment is processed at the time of booking or as specified by the service provider. We accept major credit cards, debit cards, and other payment methods as displayed.
                  </p>
                  <p>
                    <strong>Confirmation:</strong> A booking is only confirmed once you receive a confirmation email from us.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">4. Cancellation and Refunds</h2>
                <div className="info-section-content">
                  <p>
                    Cancellation policies vary by service provider. Specific cancellation terms will be provided during the booking process and in your confirmation email.
                  </p>
                  <p>
                    Refunds, where applicable, will be processed according to the provider's policy. Processing time typically ranges from 5-10 business days.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">5. User Conduct</h2>
                <div className="info-section-content">
                  <p>You agree not to:</p>
                  <ul>
                    <li>Use the service for any unlawful purpose</li>
                    <li>Attempt to gain unauthorized access to any portion of the platform</li>
                    <li>Interfere with or disrupt the service or servers</li>
                    <li>Impersonate any person or entity</li>
                    <li>Use automated systems to access the service without permission</li>
                  </ul>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">6. Intellectual Property</h2>
                <div className="info-section-content">
                  <p>
                    All content on the Zanafly platform, including text, graphics, logos, images, and software, is the property of Zanafly or its content suppliers and is protected by copyright and intellectual property laws.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">7. Limitation of Liability</h2>
                <div className="info-section-content">
                  <p>
                    Zanafly acts as an intermediary between users and service providers. We are not responsible for the acts, errors, omissions, representations, warranties, or defaults of service providers.
                  </p>
                  <p>
                    To the maximum extent permitted by law, Zanafly shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">8. Governing Law</h2>
                <div className="info-section-content">
                  <p>
                    These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Zanafly operates, without regard to conflict of law provisions.
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h2 className="info-section-title">9. Contact Information</h2>
                <div className="info-section-content">
                  <p>
                    For questions about these Terms & Conditions, please contact us at:
                  </p>
                  <p>
                    Email: legal@zanafly.com<br />
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

export default Terms;
