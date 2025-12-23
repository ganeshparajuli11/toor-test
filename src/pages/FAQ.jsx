import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './InfoPage.css';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState([]);

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'booking', name: 'Booking & Reservations' },
    { id: 'payment', name: 'Payment & Pricing' },
    { id: 'cancellation', name: 'Cancellations & Refunds' },
    { id: 'account', name: 'Account & Profile' },
    { id: 'travel', name: 'Travel Tips' }
  ];

  const faqs = [
    {
      category: 'booking',
      question: 'How do I make a booking?',
      answer: 'To make a booking, simply search for your destination, select your travel dates, choose your preferred accommodation or service, and follow the checkout process. You\'ll receive a confirmation email once your booking is complete.'
    },
    {
      category: 'booking',
      question: 'Can I modify my booking after confirmation?',
      answer: 'Yes, you can modify most bookings through your account dashboard. However, modification options depend on the provider\'s policies. Some changes may incur additional fees. Contact our support team for assistance.'
    },
    {
      category: 'booking',
      question: 'Do I need to print my booking confirmation?',
      answer: 'While it\'s not always necessary, we recommend having either a printed or digital copy of your confirmation available. Most providers accept digital confirmations shown on your mobile device.'
    },
    {
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and various digital payment methods depending on your location.'
    },
    {
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Absolutely. We use industry-standard encryption and security measures to protect your payment information. We are PCI DSS compliant and never store your full card details on our servers.'
    },
    {
      category: 'payment',
      question: 'When will I be charged for my booking?',
      answer: 'Most bookings are charged immediately upon confirmation. However, some hotels and services may charge at check-in. The payment schedule will be clearly displayed before you complete your booking.'
    },
    {
      category: 'cancellation',
      question: 'What is your cancellation policy?',
      answer: 'Cancellation policies vary by provider and booking type. Most bookings offer free cancellation up to a certain date, usually 24-48 hours before check-in. You can find the specific cancellation policy on your booking confirmation.'
    },
    {
      category: 'cancellation',
      question: 'How do I cancel my booking?',
      answer: 'You can cancel your booking through your account dashboard. Go to "My Bookings," select the reservation you want to cancel, and follow the cancellation process. Refund eligibility depends on the provider\'s policy.'
    },
    {
      category: 'cancellation',
      question: 'How long does it take to receive a refund?',
      answer: 'Refunds are typically processed within 5-10 business days after cancellation approval. The exact time depends on your payment method and banking institution.'
    },
    {
      category: 'account',
      question: 'Do I need an account to make a booking?',
      answer: 'While you can make a booking as a guest, creating an account offers many benefits including easier booking management, saved preferences, exclusive deals, and quicker checkout for future bookings.'
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you instructions to reset your password. Make sure to check your spam folder if you don\'t see the email.'
    },
    {
      category: 'account',
      question: 'Can I have multiple accounts?',
      answer: 'We recommend maintaining only one account per email address for easier management. However, if you need separate accounts for personal and business travel, you can create multiple accounts using different email addresses.'
    },
    {
      category: 'travel',
      question: 'Do I need travel insurance?',
      answer: 'While not mandatory, we highly recommend travel insurance to protect against unexpected events like trip cancellations, medical emergencies, lost luggage, and more. We offer various insurance options during checkout.'
    },
    {
      category: 'travel',
      question: 'What documents do I need for international travel?',
      answer: 'For international travel, you typically need a valid passport (valid for at least 6 months beyond your return date) and possibly a visa depending on your destination. Check with your destination country\'s embassy for specific requirements.'
    },
    {
      category: 'travel',
      question: 'Can I book for someone else?',
      answer: 'Yes, you can make a booking for another person. Simply enter their details during the booking process. Make sure all information matches their travel documents exactly.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (index) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <>
      <SEO
        title="FAQ | Zanafly - Frequently Asked Questions"
        description="Find answers to commonly asked questions about booking, payments, cancellations, and more."
        keywords="FAQ, help, questions, booking help, travel questions"
        canonical="/faq"
      />

      <div className="info-page">
        <Header />

        <div className="info-hero">
          <div className="container">
            <h1 className="info-hero-title">Frequently Asked Questions</h1>
            <p className="info-hero-subtitle">
              Find answers to common questions about our services
            </p>
          </div>
        </div>

        <div className="info-content">
          <div className="info-container">
            <div className="info-card">
              {/* Search */}
              <div className="faq-search">
                <div style={{ position: 'relative' }}>
                  <Search
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-secondary)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search for questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="faq-search-input"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="faq-categories">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`faq-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="faq-list">
                {filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-item ${openItems.includes(index) ? 'open' : ''}`}
                  >
                    <button
                      className="faq-question-btn"
                      onClick={() => toggleItem(index)}
                    >
                      <span className="faq-question">{faq.question}</span>
                      <ChevronDown size={20} className="faq-icon" />
                    </button>
                    {openItems.includes(index) && (
                      <div className="faq-answer">{faq.answer}</div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    No questions found matching your search.
                  </p>
                </div>
              )}

              <div className="info-last-updated">
                Last updated: January 2024
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default FAQ;
