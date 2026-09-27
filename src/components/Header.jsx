import React, { useState, useEffect } from 'react';

function Header({ title, onThemeChange }) {
  // ---------- Theme state ----------
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ---------- User data ----------
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

  // ---------- Fetch profile based on role ----------
  useEffect(() => {
    const fetchProfile = async () => {
      // Get current user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch {
        return;
      }

      const role = (parsedUser?.role || '').toLowerCase();
      const token = localStorage.getItem('token');

      // ✅ Shop အတွက် → /auth/shop/profile API မှ fetch
      if (role === 'shop') {
        try {
          const res = await fetch('http://130.94.21.185:8000/auth/shop/profile', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (res.ok) {
            const data = await res.json();
            // API response က { user: {...} } (သို့) { data: {...} } (သို့) direct object ဖြစ်နိုင်
            const profile = data?.user || data?.data || data;

            const mergedUser = {
              ...parsedUser,
              name: profile?.name || profile?.shopName || parsedUser?.name || 'Shop',
              role: profile?.role || parsedUser?.role || 'shop',
              image: profile?.image || profile?.logo || parsedUser?.image || '',
            };

            setUserData(mergedUser);
            localStorage.setItem('user', JSON.stringify(mergedUser));
          } else {
            console.warn('⚠️ Shop profile fetch failed with status:', res.status);
            // Fail ဖြစ်ရင် localStorage data ကိုပဲ ဆက်သုံး
            setUserData(parsedUser);
          }
        } catch (err) {
          console.error('❌ Shop profile fetch error:', err);
          setUserData(parsedUser);
        }
      }
      // ✅ Admin အတွက် → /auth/login ကနေ ရလာတဲ့ data ကို localStorage ကနေ သုံး
      else if (role === 'admin') {
        setUserData(parsedUser);
      }
      // အခြား role များ
      else {
        setUserData(parsedUser);
      }
    };

    fetchProfile();
  }, []);

  // ---------- Listen for storage changes (multi-tab sync) ----------
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
  const displayName = userData?.name || userData?.shopName || 'Guest';
  const displayRole = userData?.role
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
    : 'User';
  const avatarSrc =
    userData?.image ||
    userData?.logo ||
    'https://via.placeholder.com/40';

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
          {/* ❌ Message icon ဖြုတ်လိုက်ပါပြီ */}
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