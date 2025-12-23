import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Hotel,
  CreditCard,
  Bell,
  Search,
  Car,
  Ship,
  Globe,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminLayout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, setLanguage, currency, setCurrency } = useLanguage();
  const languageDropdownRef = useRef(null);

  useEffect(() => {
    // Get admin user from localStorage
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }
  }, []);

  const isSuperAdmin = adminUser?.role === 'super_admin';

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('Dashboard'), exact: true },
    { path: '/admin/bookings', icon: Calendar, label: t('Bookings') },
    { path: '/admin/users', icon: Users, label: t('Users') },
    { path: '/admin/hotels', icon: Hotel, label: t('Hotels') },
    { path: '/admin/cars', icon: Car, label: t('Cars') },
    { path: '/admin/cruises', icon: Ship, label: t('Cruises') },
    { path: '/admin/payments', icon: CreditCard, label: t('Payments') },
    { path: '/admin/settings', icon: Settings, label: t('Admin Settings') },
    ...(isSuperAdmin ? [{ path: '/admin/admins', icon: ShieldCheck, label: t('Manage Admins') }] : []),
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // Call logout endpoint
        await axios.post(`${API_URL}/api/admin/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all admin data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
      toast.success('Logged out successfully');
      navigate('/admin/login');
    }
  };

  const handleLanguageChange = (lang, curr) => {
    setLanguage(lang);
    setCurrency(curr);
    setIsLanguageDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <img src={logo} alt="Zanafly Admin" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            {sidebarOpen && <span className="admin-logo-text">Zanafly Admin</span>}
          </div>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleLogout}
            className="admin-nav-item logout"
            title={!sidebarOpen ? t('Logout') : ''}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>{t('Logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <button
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="admin-header-search">
            <Search size={20} />
            <input
              type="text"
              placeholder={t('Search') + "..."}
              className="admin-search-input"
            />
          </div>

          <div className="admin-header-actions">

            {/* Admin Language Switcher */}
            <div className="language-dropdown" ref={languageDropdownRef} style={{ marginRight: '1rem' }}>
              <button
                className="nav-icon-button language-button"
                onClick={() =>
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
                }
                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
              >
                <Globe size={18} />
                <span className="language-text" style={{ fontSize: '14px', fontWeight: 500 }}>
                  {language}
                </span>
                <ChevronDown size={14} />
              </button>

              {isLanguageDropdownOpen && (
                <div className="language-dropdown-menu" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  minWidth: '150px'
                }}>
                  {['EN', 'ES', 'FR', 'DE'].map(lang => (
                    <button
                      key={lang}
                      className="language-dropdown-item"
                      onClick={() => handleLanguageChange(lang, currency)}
                      style={{
                        display: 'flex',
                        width: '100%',
                        padding: '8px 16px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>
                        {lang === 'EN' ? '🇺🇸' : lang === 'ES' ? '🇪🇸' : lang === 'FR' ? '🇫🇷' : '🇩🇪'}
                      </span>
                      <span>{lang === 'EN' ? 'English' : lang === 'ES' ? 'Español' : lang === 'FR' ? 'Français' : 'Deutsch'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="admin-notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            <div className="admin-user-menu">
              <div className="admin-avatar-initials">
                {adminUser ? `${adminUser.firstName?.[0] || ''}${adminUser.lastName?.[0] || ''}` : 'AD'}
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">
                  {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Admin User'}
                </span>
                <span className="admin-user-role">
                  {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Administrator'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
