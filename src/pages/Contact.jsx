import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: <Mail size={24} />,
      title: 'Email Us',
      details: ['support@toor.com', 'info@toor.com'],
      description: 'Send us an email anytime'
    },
    {
      icon: <Phone size={24} />,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      description: 'Mon-Fri from 8am to 6pm'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Visit Us',
      details: ['123 Travel Street', 'New York, NY 10001, USA'],
      description: 'Come visit our office'
    },
    {
      icon: <Clock size={24} />,
      title: 'Working Hours',
      details: ['Monday - Friday: 8am - 6pm', 'Saturday: 9am - 4pm', 'Sunday: Closed'],
      description: 'Our support team hours'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate form submission
    toast.success('Message sent successfully! We\'ll get back to you soon.');

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <>
      <SEO
        title="Contact Us | TOOR - Get in Touch"
        description="Have questions? Get in touch with our team. We're here to help with all your travel needs."
        keywords="contact TOOR, customer support, travel help, get in touch"
        canonical="/contact"
      />

      <div className="contact-page">
        <Header />

        {/* Hero Section */}
        <div className="contact-hero">
          <div className="container">
            <h1 className="contact-hero-title">Get in Touch</h1>
            <p className="contact-hero-subtitle">
              We're here to help and answer any questions you might have
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="contact-content">
          <div className="container">
            <div className="contact-layout">
              {/* Contact Form */}
              <div className="contact-form-section">
                <h2 className="contact-section-title">Send Us a Message</h2>
                <p className="contact-section-description">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject" className="form-label">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Select a subject</option>
                        <option value="booking">Booking Inquiry</option>
                        <option value="support">Customer Support</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message <span className="required">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Tell us how we can help you..."
                      rows="6"
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="contact-submit-btn">
                    <Send size={18} />
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="contact-info-section">
                <h2 className="contact-section-title">Contact Information</h2>
                <p className="contact-section-description">
                  Reach out to us through any of these channels
                </p>

                <div className="contact-info-cards">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="contact-info-card">
                      <div className="contact-info-icon">{info.icon}</div>
                      <div className="contact-info-content">
                        <h3 className="contact-info-title">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="contact-info-detail">{detail}</p>
                        ))}
                        <p className="contact-info-description">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="contact-map">
                  <iframe
                    title="Office Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976373946229!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="contact-faq">
          <div className="container">
            <h2 className="contact-section-title center">Frequently Asked Questions</h2>
            <p className="contact-section-description center">
              Quick answers to common questions
            </p>

            <div className="faq-grid">
              <div className="faq-item">
                <h3 className="faq-question">How quickly will I get a response?</h3>
                <p className="faq-answer">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Can I call outside business hours?</h3>
                <p className="faq-answer">
                  For urgent matters, we have a 24/7 emergency hotline available for existing bookings.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">Do you offer live chat support?</h3>
                <p className="faq-answer">
                  Yes! Our live chat is available Monday through Friday, 8am to 6pm EST.
                </p>
              </div>

              <div className="faq-item">
                <h3 className="faq-question">How can I provide feedback?</h3>
                <p className="faq-answer">
                  We love hearing from you! Use the contact form with "Feedback" as the subject.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
