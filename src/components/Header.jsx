import React, { useState, useEffect } from 'react';

function Header({ title, onThemeChange }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Apply theme to body and save to localStorage
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    
    // Notify parent component about theme change
    if (onThemeChange) {
      onThemeChange(isDarkMode);
    }
  }, [isDarkMode, onThemeChange]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        {/* Dark/Light Mode Toggle */}
        <button className="theme-toggle" onClick={toggleDarkMode}>
          <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`} style={{ color: '#ff8a00' }}></i>
        </button>
        <div className="header-actions">
          <i className="bi bi-envelope-fill message-icon"></i>
          <div className="notification-wrapper">
            <i className="bi bi-bell-fill notification-icon"></i>
            <span className="notification-badge">3</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <img src="https://via.placeholder.com/40" alt="Profile" className="avatar-image" />
            </div>
            <div className="user-details">
              <span className="user-name">Aung Min</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;