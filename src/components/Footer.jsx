import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import Button from './Button';
import './Footer.css';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Hotels', path: '/hotels' },
    { name: 'Flights', path: '/flights' },
    { name: 'Cruise', path: '/cruise' },
    { name: 'Blog', path: '/blog' },
    { name: '404', path: '/404' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const instagramImages = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1500259571355-332da5cb07aa?w=200&h=200&fit=crop',
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Newsletter subscription logic will be handled via API
    const email = e.target.email.value;
    console.log('Newsletter subscription:', email);
    // TODO: Implement API call
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* About Us */}
          <div className="footer-section">
            <h3 className="footer-heading">About Us</h3>
            <p className="footer-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt.
            </p>
            <p className="footer-description">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry...
            </p>
            <div className="footer-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Youtube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Instagram */}
          <div className="footer-section">
            <h3 className="footer-heading">Instagram</h3>
            <div className="instagram-grid">
              {instagramImages.map((image, index) => (
                <a
                  key={index}
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram-item"
                >
                  <img
                    src={image}
                    alt={`Instagram post ${index + 1}`}
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h3 className="footer-heading">Newsletter</h3>
            <p className="footer-description">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email Id"
                required
                className="newsletter-input"
              />
              <Button type="submit" variant="secondary" className="newsletter-btn">
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="container">
          <p className="copyright">
            © 2025 Zanafly. All rights reserved. Built with React.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
