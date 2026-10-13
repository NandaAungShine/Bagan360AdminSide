// components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';

const NOTIF_STORAGE_KEY = 'b360_notifications';

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

  // ---------- Notifications state ----------
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

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
            setUserData(parsedUser);
          }
        } catch (err) {
          console.error('❌ Shop profile fetch error:', err);
          setUserData(parsedUser);
        }
      } else if (role === 'admin') {
        setUserData(parsedUser);
      } else {
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
      if (e.key === NOTIF_STORAGE_KEY) {
        loadNotifications();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ---------- Load notifications ----------
  const loadNotifications = () => {
    try {
      const all = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
      const role = (userData?.role || '').toLowerCase();
      const myUserId = userData?.id ?? userData?.user_id ?? userData?.userId;
      const myShopId = userData?.shop_id ?? userData?.shopId;

      let mine = all;

      if (role === 'shop') {
        // Shop role: match by user_id (or shop_id if available)
        mine = all.filter(n => {
          if (myUserId != null && String(n.user_id) === String(myUserId)) return true;
          if (myShopId != null && String(n.shop_id) === String(myShopId)) return true;
          return false;
        });
      }
      // Admin: show all

      setNotifications(mine);
    } catch (e) {
      console.warn('Load notifications failed:', e.message);
      setNotifications([]);
    }
  };

  // Reload notifications whenever userData changes
  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line
  }, [userData]);

  // Refresh on window focus (in case Finance tab wrote while we were away)
  useEffect(() => {
    const handler = () => loadNotifications();
    window.addEventListener('focus', handler);
    // Also poll every 10 seconds as backup
    const interval = setInterval(loadNotifications, 10000);
    return () => {
      window.removeEventListener('focus', handler);
      clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [userData]);

  // ---------- Outside click to close notif ----------
  useEffect(() => {
    const handler = (e) => {
      if (showNotifs && notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  // ---------- Notification actions ----------
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    try {
      const all = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
      const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
      loadNotifications();
    } catch (e) {}
  };

  const markAllAsRead = () => {
    try {
      const all = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
      const role = (userData?.role || '').toLowerCase();
      const myUserId = userData?.id ?? userData?.user_id ?? userData?.userId;
      const myShopId = userData?.shop_id ?? userData?.shopId;

      const updated = all.map(n => {
        if (role === 'shop') {
          const isMine =
            (myUserId != null && String(n.user_id) === String(myUserId)) ||
            (myShopId != null && String(n.shop_id) === String(myShopId));
          if (isMine) return { ...n, read: true };
        } else {
          return { ...n, read: true };
        }
        return n;
      });
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
      loadNotifications();
    } catch (e) {}
  };

  const clearAll = () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      const all = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY) || '[]');
      const role = (userData?.role || '').toLowerCase();
      const myUserId = userData?.id ?? userData?.user_id ?? userData?.userId;
      const myShopId = userData?.shop_id ?? userData?.shopId;

      let remaining;
      if (role === 'shop') {
        remaining = all.filter(n => {
          const isMine =
            (myUserId != null && String(n.user_id) === String(myUserId)) ||
            (myShopId != null && String(n.shop_id) === String(myShopId));
          return !isMine;
        });
      } else {
        remaining = [];
      }
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(remaining));
      loadNotifications();
    } catch (e) {}
  };

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

  // ---------- Format time ----------
  const formatTime = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.floor((now - d) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  // ---------- Get icon for notification type ----------
  const getNotifIcon = (type) => {
    switch (type) {
      case 'platform_fee': return { icon: 'bi-receipt', color: '#3b82f6' };
      case 'percentage':   return { icon: 'bi-percent', color: '#fd7e14' };
      case 'commission':   return { icon: 'bi-graph-up-arrow', color: '#f59e0b' };
      default:             return { icon: 'bi-bell-fill', color: '#0d6efd' };
    }
  };

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
          {/* ---------- Notification Bell ---------- */}
          <div className="notification-wrapper" ref={notifRef}>
            <button
              type="button"
              className="notif-bell-btn"
              onClick={() => setShowNotifs(v => !v)}
              title="Notifications"
            >
              <i className="bi bi-bell-fill notification-icon"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="notif-panel">
                <div className="notif-panel-head">
                  <div>
                    <div className="notif-panel-title">
                      <i className="bi bi-bell-fill" style={{ color: '#0d6efd', marginRight: 6 }}></i>
                      Notifications
                    </div>
                    <div className="notif-panel-sub">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up 🎉'}
                    </div>
                  </div>
                  <div className="notif-panel-actions">
                    {unreadCount > 0 && (
                      <button className="notif-action-btn" onClick={markAllAsRead} title="Mark all as read">
                        <i className="bi bi-check2-all"></i>
                      </button>
                    )}
                    <button className="notif-action-btn danger" onClick={clearAll} title="Clear all">
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>

                <div className="notif-panel-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <i className="bi bi-inbox"></i>
                      <div>No notifications yet</div>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const ic = getNotifIcon(n.type);
                      return (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div
                            className="notif-item-icon"
                            style={{
                              background: `${ic.color}22`,
                              color: ic.color,
                            }}
                          >
                            <i className={`bi ${ic.icon}`}></i>
                          </div>
                          <div className="notif-item-body">
                            <div className="notif-item-top">
                              <div className="notif-item-title">{n.title}</div>
                              {!n.read && <span className="notif-dot"></span>}
                            </div>
                            <div className="notif-item-msg">{n.message}</div>
                            {n.amount > 0 && (
                              <div className="notif-item-amount">
                                <i className="bi bi-cash-coin" style={{ marginRight: 4 }}></i>
                                {Number(n.amount).toLocaleString()} Ks
                              </div>
                            )}
                            <div className="notif-item-time">
                              <i className="bi bi-clock" style={{ marginRight: 4 }}></i>
                              {formatTime(n.created_at)}
                              {n.shop_name && <span style={{ marginLeft: 8 }}>• {n.shop_name}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ---------- User Info ---------- */}
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

      {/* ---------- Notification CSS ---------- */}
      <style>{`
        .notif-bell-btn {
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background .15s;
        }
        .notif-bell-btn:hover {
          background: rgba(13,110,253,0.1);
        }
        .notification-icon {
          font-size: 20px;
          color: #ff8a00;
        }
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 999px;
          background: #dc3545;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .notification-wrapper {
          position: relative;
        }

        .notif-panel {
          position: absolute;
          top: 42px;
          right: 0;
          width: 380px;
          max-width: 92vw;
          background: var(--card-bg, #2d2d2d);
          border: 1px solid var(--border-color, #555);
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          z-index: 9999;
          overflow: hidden;
        }
        .notif-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color, #444);
        }
        .notif-panel-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-color, #fff);
        }
        .notif-panel-sub {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }
        .notif-panel-actions {
          display: flex;
          gap: 6px;
        }
        .notif-action-btn {
          background: transparent;
          border: 1px solid var(--border-color, #555);
          color: var(--text-color, #cbd5e1);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          transition: all .15s;
        }
        .notif-action-btn:hover {
          border-color: #0d6efd;
          color: #0d6efd;
        }
        .notif-action-btn.danger:hover {
          border-color: #dc3545;
          color: #dc3545;
        }

        .notif-panel-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }
        .notif-empty {
          text-align: center;
          padding: 30px 10px;
          color: #9ca3af;
          font-size: 13px;
        }
        .notif-empty i {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
          opacity: .5;
        }

        .notif-item {
          display: flex;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid var(--border-color, #444);
          border-radius: 8px;
          margin-bottom: 6px;
          background: var(--input-bg, #252525);
          cursor: pointer;
          transition: all .15s;
        }
        .notif-item:hover {
          border-color: #0d6efd;
          transform: translateX(2px);
        }
        .notif-item.unread {
          background: rgba(13,110,253,0.08);
          border-color: rgba(13,110,253,0.4);
        }
        .notif-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .notif-item-body {
          flex: 1;
          min-width: 0;
        }
        .notif-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .notif-item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-color, #fff);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #0d6efd;
          flex-shrink: 0;
        }
        .notif-item-msg {
          font-size: 12px;
          color: #cbd5e1;
          margin-top: 4px;
          line-height: 1.4;
          word-break: break-word;
        }
        .notif-item-amount {
          font-size: 12px;
          color: #22c55e;
          font-weight: 600;
          margin-top: 4px;
        }
        .notif-item-time {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 6px;
        }
      `}</style>
    </header>
  );
}

export default Header;