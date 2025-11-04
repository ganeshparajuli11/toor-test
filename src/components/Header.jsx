import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  User,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const profileDropdownRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'HOME', path: '/', hasDropdown: false },
    { name: 'HOTELS', path: '/hotels', hasDropdown: false },
    { name: 'FLIGHTS', path: '/flights', hasDropdown: false },
    { name: 'CRUISE', path: '/cruises', hasDropdown: false },
    { name: 'CARS', path: '/cars', hasDropdown: false },
    { name: 'BLOG', path: '/blog', hasDropdown: false },
    {
      name: 'PAGES',
      path: '#',
      hasDropdown: true,
      dropdownItems: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Terms & Conditions', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' }
      ]
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header-topbar">
        <div className="container">
          <div className="topbar-content">
            <div className="topbar-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={12} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter size={12} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={12} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube"
              >
                <Youtube size={12} />
              </a>
            </div>
            <div className="topbar-actions">
              {isAuthenticated ? (
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <button
                    className="profile-trigger"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    aria-label="Profile menu"
                  >
                    <div className="profile-avatar">
                      <User size={12} />
                    </div>
                    <span className="profile-name">{user?.name}</span>
                    <ChevronDown size={10} className={`profile-chevron ${isProfileDropdownOpen ? 'open' : ''}`} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown-menu">
                      <div className="profile-dropdown-header">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="profile-dropdown-avatar"
                        />
                        <div className="profile-dropdown-info">
                          <div className="profile-dropdown-name">{user?.name}</div>
                          <div className="profile-dropdown-email">{user?.email}</div>
                        </div>
                      </div>
                      <div className="profile-dropdown-divider"></div>
                      <Link
                        to="/profile"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/bookings"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Calendar size={16} />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <div className="profile-dropdown-divider"></div>
                      <button
                        className="profile-dropdown-item"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="topbar-link">
                    LOGIN
                  </Link>
                  <Link to="/signup" className="topbar-link">
                    SIGNUP
                  </Link>
                </>
              )}
              <select className="topbar-currency">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="header-nav">
        <div className="container">
          <div className="nav-content">
            {/* Logo */}
            <Link to="/" className="nav-logo">
              <div className="logo-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 10L20 16L12 22V10Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="logo-text">TOOR</span>
            </Link>

            {/* Desktop Menu */}
            <ul className="nav-menu">
              {menuItems.map((item) => (
                <li
                  key={item.name}
                  className="nav-item"
                  ref={item.hasDropdown ? dropdownRef : null}
                >
                  {item.hasDropdown ? (
                    <div className="nav-dropdown">
                      <button
                        className="nav-link nav-dropdown-trigger"
                        onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                      >
                        {item.name}
                        <ChevronDown size={16} />
                      </button>
                      {openDropdown === item.name && (
                        <div className="nav-dropdown-menu">
                          {item.dropdownItems.map((dropItem) => (
                            <Link
                              key={dropItem.name}
                              to={dropItem.path}
                              className="nav-dropdown-item"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {dropItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link to={item.path} className="nav-link">
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="container">
              <ul className="mobile-menu-list">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    {item.hasDropdown ? (
                      <>
                        <div className="mobile-menu-link">{item.name}</div>
                        <ul className="mobile-submenu">
                          {item.dropdownItems.map((dropItem) => (
                            <li key={dropItem.name}>
                              <Link
                                to={dropItem.path}
                                className="mobile-submenu-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {dropItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className="mobile-menu-link"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
