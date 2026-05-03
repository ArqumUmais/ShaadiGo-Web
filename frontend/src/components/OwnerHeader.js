import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../style/OwnerHeader.css';

// Nav icons as inline SVG components
function IconDashboard({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="9" rx="1.5" stroke={color} strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="5" rx="1.5" stroke={color} strokeWidth="1.8"/>
      <rect x="14" y="12" width="7" height="9" rx="1.5" stroke={color} strokeWidth="1.8"/>
      <rect x="3" y="16" width="7" height="5" rx="1.5" stroke={color} strokeWidth="1.8"/>
    </svg>
  );
}

function IconBuilding({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="9" y="14" width="6" height="7" rx="1" stroke={color} strokeWidth="1.6"/>
      <rect x="7" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
      <rect x="14" y="11" width="3" height="3" rx="0.5" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}

function IconChat({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16v13H14l-4 4v-4H4V4Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8 10h8M8 13h5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function IconLink({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconLogout({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRing({ size = 22, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="14" r="6" stroke={color} strokeWidth="1.8"/>
      <circle cx="12" cy="14" r="3" stroke={color} strokeWidth="1.4"/>
      <path d="M9 8l1.5-3h3L15 8" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8.5 9h7" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const navItems = [
  { label: 'Dashboard', path: '/owner/dashboard', Icon: IconDashboard },
  { label: 'My Venues', path: '/owner/venues',    Icon: IconBuilding  },
  { label: 'Chats',     path: '/owner/chats',     Icon: IconChat      },
];

function OwnerHeader() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem('shaadigo_user') || '{}');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('shaadigo_user');
    navigate('/');
  };

  return (
    <header className="owner-header">
      <div className="owner-header-inner">

        {/* Logo */}
        <div className="owner-logo" onClick={() => navigate('/owner/dashboard')}>
          <span className="logo-icon"><IconRing size={22} color="#fff" /></span>
          <span className="logo-text">ShaadiGo <span className="logo-badge">Owner</span></span>
        </div>

        {/* Nav */}
        <nav className="owner-nav">
          {navItems.map(({ label, path, Icon }) => (
            <button
              key={path}
              className={`owner-nav-btn ${location.pathname === path ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={16} color="currentColor" />
              {label}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="owner-header-right">
          <span className="owner-nav-login" onClick={() => navigate('/')}>
            Login / Sign Up
          </span>

<div className="owner-user-area">
            <div className="owner-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              <span>{user.username?.[0]?.toUpperCase() || 'O'}</span>
            </div>
            {menuOpen && (
              <div className="owner-dropdown">
                <div className="dropdown-name">@{user.username}</div>
                <div className="dropdown-role">Venue Owner</div>
                <hr />
                <button onClick={handleLogout}>
                  <IconLogout size={14} color="#4D0D0D" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}

export default OwnerHeader;