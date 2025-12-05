import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  User,
  Calendar,
  Settings,
  LogOut,
  Globe,
  Phone,
  MapPin,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "../context/LocationContext";
import "./Header.css";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const profileDropdownRef = useRef(null);
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { userLocation, setShowLocationModal } = useLocation();

  const isActive = (path) => {
    return routerLocation.pathname === path;
  };

  const menuItems = [
    { name: "HOME", path: "/", hasDropdown: false },
    { name: "HOTELS", path: "/hotels", hasDropdown: false },
    { name: "FLIGHTS", path: "/flights", hasDropdown: false },
    { name: "CRUISE", path: "/cruises", hasDropdown: false },
    { name: "CARS", path: "/cars", hasDropdown: false },
    { name: "BLOG", path: "/blog", hasDropdown: false },
    {
      name: "PAGES",
      path: "#",
      hasDropdown: true,
      dropdownItems: [
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "FAQ", path: "/faq" },
        { name: "Terms & Conditions", path: "/terms" },
        { name: "Privacy Policy", path: "/privacy" },
      ],
    },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate("/");
  };

  const handleLanguageChange = (lang, currency) => {
    setSelectedLanguage(lang);
    setSelectedCurrency(currency);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <header className="header">
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
                  <path d="M12 10L20 16L12 22V10Z" fill="currentColor" />
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
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === item.name ? null : item.name
                          )
                        }
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
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Action Buttons and Auth Section */}
            <div className="nav-actions">
              {/* Language & Currency Switcher */}
              <div className="language-dropdown" ref={languageDropdownRef}>
                <button
                  className="nav-icon-button language-button"
                  onClick={() =>
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                  }
                  aria-label="Language and Currency"
                >
                  <Globe size={18} />
                  <span className="language-text">
                    {selectedLanguage} | {selectedCurrency}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`language-chevron ${
                      isLanguageDropdownOpen ? "open" : ""
                    }`}
                  />
                </button>

                {isLanguageDropdownOpen && (
                  <div className="language-dropdown-menu">
                    <button
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange("EN", "USD")}
                    >
                      <span className="language-flag">🇺🇸</span>
                      <div className="language-info">
                        <span className="language-name">English</span>
                        <span className="language-currency">USD</span>
                      </div>
                    </button>
                    <button
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange("EN", "EUR")}
                    >
                      <span className="language-flag">🇪🇺</span>
                      <div className="language-info">
                        <span className="language-name">English</span>
                        <span className="language-currency">EUR</span>
                      </div>
                    </button>
                    <button
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange("EN", "GBP")}
                    >
                      <span className="language-flag">🇬🇧</span>
                      <div className="language-info">
                        <span className="language-name">English</span>
                        <span className="language-currency">GBP</span>
                      </div>
                    </button>
                    <button
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange("EN", "CHF")}
                    >
                      <span className="language-flag">🇨🇭</span>
                      <div className="language-info">
                        <span className="language-name">English</span>
                        <span className="language-currency">CHF</span>
                      </div>
                    </button>
                    <button
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange("DE", "EUR")}
                    >
                      <span className="language-flag">🇩🇪</span>
                      <div className="language-info">
                        <span className="language-name">Deutsch</span>
                        <span className="language-currency">EUR</span>
                      </div>
                    </button>
                    <button
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange("FR", "EUR")}
                    >
                      <span className="language-flag">🇫🇷</span>
                      <div className="language-info">
                        <span className="language-name">Français</span>
                        <span className="language-currency">EUR</span>
                      </div>
                    </button>
                    <button
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange("ES", "EUR")}
                    >
                      <span className="language-flag">🇪🇸</span>
                      <div className="language-info">
                        <span className="language-name">Español</span>
                        <span className="language-currency">EUR</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Location Button */}
              <button
                className="nav-location-button"
                onClick={() => setShowLocationModal(true)}
                aria-label="Change location"
              >
                <MapPin size={16} />
                <span className="location-text">
                  {userLocation?.city || 'Set Location'}
                </span>
              </button>

              {/* Contact Phone Button */}
              <Link
                to="/contact"
                className="nav-icon-button"
                aria-label="Contact"
              >
                <Phone size={18} />
              </Link>

              {/* Divider */}
              <div className="nav-divider"></div>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="profile-dropdown" ref={profileDropdownRef}>
                  <button
                    className="profile-trigger"
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    aria-label="Profile menu"
                  >
                    <div className="profile-avatar">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="profile-name">{user?.name}</span>
                    <ChevronDown
                      size={14}
                      className={`profile-chevron ${
                        isProfileDropdownOpen ? "open" : ""
                      }`}
                    />
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
                          <div className="profile-dropdown-name">
                            {user?.name}
                          </div>
                          <div className="profile-dropdown-email">
                            {user?.email}
                          </div>
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
                <div className="nav-auth-links">
                  <Link to="/login" className="nav-auth-link">
                    LOGIN
                  </Link>
                  <Link to="/signup" className="nav-auth-link">
                    SIGNUP
                  </Link>
                </div>
              )}
            </div>

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
