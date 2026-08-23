import React, { useState, useEffect } from 'react';

function Header({ title, onThemeChange }) {
  // ---------- Theme state ----------
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ---------- User data from localStorage ----------
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  // ---------- Update theme on change ----------
  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    if (onThemeChange) {
      onThemeChange(isDarkMode);
    }
  }, [isDarkMode, onThemeChange]);

  // ---------- Listen for storage changes (in case user logs in/out in another tab) ----------
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            setUserData(JSON.parse(storedUser));
          } catch {
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // ---------- Helper to get display name and role ----------
  const displayName = userData?.name || 'Guest';
  const displayRole = userData?.role
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
    : 'User';
  const avatarSrc = userData?.image || 'https://via.placeholder.com/40';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        {/* Dark/Light Mode Toggle */}
        <button className="theme-toggle" onClick={toggleDarkMode}>
          <i
            className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}
            style={{ color: '#ff8a00' }}
          ></i>
        </button>
        <div className="header-actions">
          <i className="bi bi-envelope-fill message-icon"></i>
          <div className="notification-wrapper">
            <i className="bi bi-bell-fill notification-icon"></i>
            <span className="notification-badge">3</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <img
                src={avatarSrc}
                alt="Profile"
                className="avatar-image"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.src = 'https://via.placeholder.com/40';
                }}
              />
            </div>
            <div className="user-details">
              <span className="user-name">{displayName}</span>
              <span className="user-role">{displayRole}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;