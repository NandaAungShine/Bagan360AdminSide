import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/* ============================================================
   CANONICAL SHOP TYPES
   (key → the item names used in bookingMenuItems / orderMenuItems)
   ============================================================ */
const CANONICAL_SHOP_TYPES = {
  hotels:         { main: 'Hotels',         order: 'Hotels Order' },
  restaurants:    { main: 'Restaurants',    order: 'Restaurants Order' },
  destinations:   { main: 'Destinations',   order: 'Destinations Order' },
  cars:           { main: 'Cars',           order: 'Cars Order' },
  ebikes:         { main: 'E-Bikes',        order: 'E-Bikes Order' },
  tricycles:      { main: 'Tricycles',      order: 'Tricycles Order' },
  hotairballoons: { main: 'Air Balloons',   order: 'Air Balloons Order' },
  horsecarts:     { main: 'Horse Carts',    order: 'Horse Carts Order' },
  others:         { main: 'Others',         order: 'Others Order' },
};

/* ============================================================
   ALIAS MAP — any raw localStorage value → canonical key
   Handles: underscore, hyphen, spaces, casing, synonyms
   ============================================================ */
const SHOP_TYPE_ALIASES = {
  // Hotels
  hotel: 'hotels',
  hotels: 'hotels',
  // Restaurants
  restaurant: 'restaurants',
  restaurants: 'restaurants',
  // Destinations
  destination: 'destinations',
  destinations: 'destinations',
  // Cars
  car: 'cars',
  cars: 'cars',
  // E-Bikes
  ebike: 'ebikes',
  ebikes: 'ebikes',
  electricbike: 'ebikes',
  electricbikes: 'ebikes',
  // Tricycles / ThoneBane
  tricycle: 'tricycles',
  tricycles: 'tricycles',
  trishaw: 'tricycles',
  trishaws: 'tricycles',
  thonebane: 'tricycles',
  thonebain: 'tricycles',
  thone: 'tricycles',
  // Air Balloons — ALL variants map here
  airballoon: 'hotairballoons',
  airballoons: 'hotairballoons',
  hotairballoon: 'hotairballoons',
  hotairballoons: 'hotairballoons',
  balloon: 'hotairballoons',
  balloons: 'hotairballoons',
  // Others
  other: 'others',
  others: 'others',
  misc: 'others',
  miscellaneous: 'others',
  // Horse Carts
  horsecart: 'horsecarts',
  horsecarts: 'horsecarts',
};

/* ============================================================
   Normalize any raw value → canonical key (or null)
   ============================================================ */
const normalizeShopType = (rawType) => {
  if (!rawType) return null;
  // strip spaces, underscores, hyphens → compare lowercase
  const cleaned = String(rawType).toLowerCase().replace(/[\s_-]+/g, '');
  if (SHOP_TYPE_ALIASES[cleaned]) return SHOP_TYPE_ALIASES[cleaned];
  // substring fallback (e.g. "airballoon_shop")
  for (const [alias, target] of Object.entries(SHOP_TYPE_ALIASES)) {
    if (cleaned.includes(alias)) return target;
  }
  return cleaned; // unknown
};

/* ============================================================
   SIDEBAR COMPONENT
   ============================================================ */
function Sidebar() {
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const homeDropdownRef = useRef(null);
  const bookingDropdownRef = useRef(null);
  const orderDropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  /* ---------- User data ---------- */
  const userData = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const role = userData?.role || '';
  const shopTypeRaw = localStorage.getItem('shopType') || '';
  const shopType = useMemo(() => normalizeShopType(shopTypeRaw), [shopTypeRaw]);

  useEffect(() => {
    console.log('📦 User role:', role);
    console.log('🏪 Raw shopType:', shopTypeRaw, '→ normalized:', shopType);
  }, [role, shopTypeRaw, shopType]);

  /* ---------- Click outside ---------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (homeDropdownRef.current && !homeDropdownRef.current.contains(event.target)) setIsHomeOpen(false);
      if (bookingDropdownRef.current && !bookingDropdownRef.current.contains(event.target)) setIsBookingOpen(false);
      if (orderDropdownRef.current && !orderDropdownRef.current.contains(event.target)) setIsOrderOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------- Menu definitions ---------- */
  const homeMenuItems = [
    { name: 'History Of Pagodas', icon: 'bi-building', path: '/historyofpagodas' },
    { name: 'Package Plans', icon: 'bi-pin-map', path: '/PackagePlan' },
    { name: 'Package Plans Order', icon: 'bi-pin-map', path: '/packageplansorder' },
    { name: 'Banner', icon: 'bi-image', path: '/banner' },
  ];

  const bookingMenuItems = [
    { name: 'Hotels', icon: 'bi-building', path: '/hotels' },
    { name: 'Restaurants', icon: 'bi-egg-fried', path: '/restaurants' },
    { name: 'E-Bikes', icon: 'bi-bicycle', path: '/ebikes' },
    { name: 'Tricycles', icon: 'bi-truck', path: '/tricycles' },
    { name: 'Air Balloons', icon: 'bi-balloon', path: '/hotairballoons' },
    { name: 'Others', icon: 'bi-three-dots', path: '/others' },
    { name: 'Destinations', icon: 'bi-geo-alt', path: '/destinations', disabled: true },
    { name: 'Cars', icon: 'bi-car-front', path: '/cars', disabled: true },
    { name: 'Horse Carts', icon: 'bi-truck', path: '/horsecarts', disabled: true },
  ];

  const orderMenuItems = [
    { name: 'Hotels Order', icon: 'bi-building', path: '/hotelsorder' },
    { name: 'Restaurants Order', icon: 'bi-egg-fried', path: '/restaurantsorder' },
    { name: 'E-Bikes Order', icon: 'bi-bicycle', path: '/ebikesorder' },
    { name: 'Tricycles Order', icon: 'bi-truck', path: '/tricyclesorder' },
    { name: 'Air Balloons Order', icon: 'bi-balloon', path: '/hotairballoonsorder' },
    { name: 'Others Order', icon: 'bi-three-dots', path: '/othersorder' },
    { name: 'Destinations Order', icon: 'bi-geo-alt', path: '/destinationsorder', disabled: true },
    { name: 'Cars Order', icon: 'bi-car-front', path: '/carsorder', disabled: true },
    { name: 'Horse Carts Order', icon: 'bi-truck', path: '/horsecartsorder', disabled: true },
  ];

  /* ---------- Helpers ---------- */
  const findMenuItem = (items, name) =>
    items.find(item => item.name.toLowerCase() === String(name || '').toLowerCase());

  const isActive = (path) => location.pathname === path;

  /* ---------- Logout ---------- */
  const handleLogout = () => setShowLogoutAlert(true);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('shopType');
    sessionStorage.clear();
    navigate('/login');
    setShowLogoutAlert(false);
  };
  const cancelLogout = () => setShowLogoutAlert(false);

  /* ---------- Map normalized type → { main, order } ---------- */
  const getMappedNames = (normalizedType) => {
    if (!normalizedType) return null;
    return CANONICAL_SHOP_TYPES[normalizedType] || null;
  };

  /* ---------- Sub menu item renderer ---------- */
  const renderSubMenuItem = (item, index) => {
    if (item.disabled) {
      return (
        <li key={index} className="submenu-item submenu-item-disabled">
          <span className="submenu-link submenu-link-disabled">
            <i className={`${item.icon} submenu-icon`}></i>
            <span>{item.name}</span>
          </span>
        </li>
      );
    }
    return (
      <li key={index} className={`submenu-item ${isActive(item.path) ? 'active' : ''}`}>
        <Link to={item.path} className="submenu-link">
          <i className={`${item.icon} submenu-icon`}></i>
          <span>{item.name}</span>
        </Link>
      </li>
    );
  };

  /* ---------- Admin menu ---------- */
  const renderAdminMenu = () => (
    <>
      <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <Link to="/" className="nav-link">
          <div className="flex-items">
            <i className="bi bi-grid-1x2-fill icon"></i>
            <span>Dashboard</span>
          </div>
        </Link>
      </li>
      <li className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
        <Link to="/users" className="nav-link">
          <div className="flex-items">
            <i className="bi bi-person-badge-fill icon"></i>
            <span>Users</span>
          </div>
        </Link>
      </li>
      <li className={`nav-item ${isActive('/shop') ? 'active' : ''}`}>
        <Link to="/shop" className="nav-link">
          <div className="flex-items">
            <i className="bi bi-shop icon"></i>
            <span>Shop</span>
          </div>
        </Link>
      </li>

      {/* Home Dropdown */}
      <li className="nav-item" style={{ overflow: 'visible' }} ref={homeDropdownRef}>
        <div className="nav-link justify-between" onClick={() => setIsHomeOpen(!isHomeOpen)}>
          <div className="flex-items">
            <i className="bi bi-house-door-fill icon"></i>
            <span>Home</span>
          </div>
          <i className={`bi bi-chevron-down arrow-icon ${isHomeOpen ? 'rotate-180' : ''}`}></i>
        </div>
        <ul
          className={`submenu ${isHomeOpen ? 'submenu-open' : 'submenu-closed'}`}
          style={{ overflow: 'visible', maxHeight: isHomeOpen ? '2000px' : '0', transition: 'max-height 0.3s ease-in-out' }}
        >
          {homeMenuItems.map((item, index) => renderSubMenuItem(item, index))}
        </ul>
      </li>

      {/* Booking Dropdown */}
      <li className="nav-item" style={{ overflow: 'visible' }} ref={bookingDropdownRef}>
        <div className="nav-link justify-between" onClick={() => setIsBookingOpen(!isBookingOpen)}>
          <div className="flex-items">
            <i className="bi bi-plus-square-fill icon"></i>
            <span>Booking</span>
          </div>
          <i className={`bi bi-chevron-down arrow-icon ${isBookingOpen ? 'rotate-180' : ''}`}></i>
        </div>
        <ul
          className={`submenu ${isBookingOpen ? 'submenu-open' : 'submenu-closed'}`}
          style={{ overflow: 'visible', maxHeight: isBookingOpen ? '2000px' : '0', transition: 'max-height 0.3s ease-in-out' }}
        >
          {bookingMenuItems.map((item, index) => renderSubMenuItem(item, index))}
        </ul>
      </li>

      {/* Order Dropdown */}
      <li className="nav-item" style={{ overflow: 'visible' }} ref={orderDropdownRef}>
        <div className="nav-link justify-between" onClick={() => setIsOrderOpen(!isOrderOpen)}>
          <div className="flex-items">
            <i className="bi bi-box-seam icon"></i>
            <span>Order</span>
          </div>
          <i className={`bi bi-chevron-down arrow-icon ${isOrderOpen ? 'rotate-180' : ''}`}></i>
        </div>
        <ul
          className={`submenu ${isOrderOpen ? 'submenu-open' : 'submenu-closed'}`}
          style={{ overflow: 'visible', maxHeight: isOrderOpen ? '2000px' : '0', transition: 'max-height 0.3s ease-in-out' }}
        >
          {orderMenuItems.map((item, index) => renderSubMenuItem(item, index))}
        </ul>
      </li>

      {/* Finance */}
      <li className={`nav-item ${isActive('/finance') ? 'active' : ''}`}>
        <Link to="/finance" className="nav-link">
          <div className="flex-items">
            <i className="bi bi-cash-coin icon"></i>
            <span>Finances</span>
          </div>
        </Link>
      </li>

      <li className={`nav-item ${isActive('/reports') ? 'active' : ''}`}>
        <Link to="/reports" className="nav-link">
          <div className="flex-items">
            <i className="bi bi-file-earmark-bar-graph-fill icon"></i>
            <span>Reports</span>
          </div>
        </Link>
      </li>
      <li className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
        <Link to="/settings" className="nav-link">
          <div className="flex-items">
            <i className="bi bi-gear-fill icon"></i>
            <span>Settings</span>
          </div>
        </Link>
      </li>
    </>
  );

  /* ---------- Shop menu ---------- */
  const renderShopMenu = () => {
    const mapped = getMappedNames(shopType);

    // If we cannot resolve shop type → show informative menu
    if (!mapped) {
      return (
        <>
          <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">
              <div className="flex-items">
                <i className="bi bi-grid-1x2-fill icon"></i>
                <span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li className="nav-item">
            <div
              className="nav-link"
              style={{
                background: 'rgba(245,158,11,0.12)',
                color: '#f59e0b',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 12,
                lineHeight: 1.5,
                cursor: 'default',
              }}
            >
              <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 6 }}></i>
              Shop type <strong>"{shopTypeRaw || '(empty)'}"</strong> not recognized.
              <br />
              <span style={{ opacity: 0.8 }}>Please contact admin.</span>
            </div>
          </li>
          <li className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Link to="/settings" className="nav-link">
              <div className="flex-items">
                <i className="bi bi-gear-fill icon"></i>
                <span>Settings</span>
              </div>
            </Link>
          </li>
        </>
      );
    }

    const mainItem = findMenuItem(bookingMenuItems, mapped.main);
    const orderItem = findMenuItem(orderMenuItems, mapped.order);

    const main = mainItem || { name: mapped.main, icon: 'bi-building', path: '/hotels' };
    const order = orderItem || { name: mapped.order, icon: 'bi-building', path: '/hotelsorder' };

    return (
      <>
        <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            <div className="flex-items">
              <i className="bi bi-grid-1x2-fill icon"></i>
              <span>Dashboard</span>
            </div>
          </Link>
        </li>
        <li className={`nav-item ${isActive(main.path) ? 'active' : ''}`}>
          <Link to={main.path} className="nav-link">
            <div className="flex-items">
              <i className={`${main.icon} icon`}></i>
              <span>{main.name}</span>
            </div>
          </Link>
        </li>
        <li className={`nav-item ${isActive(order.path) ? 'active' : ''}`}>
          <Link to={order.path} className="nav-link">
            <div className="flex-items">
              <i className={`${order.icon} icon`}></i>
              <span>{order.name}</span>
            </div>
          </Link>
        </li>
        <li className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <Link to="/settings" className="nav-link">
            <div className="flex-items">
              <i className="bi bi-gear-fill icon"></i>
              <span>Settings</span>
            </div>
          </Link>
        </li>
      </>
    );
  };

  /* ---------- Decide menu ---------- */
  const renderMenu = () => {
    if (role === 'admin') return renderAdminMenu();
    if (role === 'shop') return renderShopMenu();
    return (
      <li className="nav-item">
        <span className="nav-link" style={{ color: '#999' }}>No menu available</span>
      </li>
    );
  };

  /* ---------- Render ---------- */
  return (
    <div className="sidebar-container">
      <div className="logo-section">
        <Link to="/" className="logo-link">
          <img
            src="/images/1.jpg"
            alt="Bagan Logo"
            className="logo-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span className="logo-text-fallback" style={{ display: 'none' }}>BAGAN</span>
        </Link>
      </div>

      <nav className="nav-menu">
        <ul className="nav-list">{renderMenu()}</ul>
      </nav>

      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Log Out</span>
        </button>
      </div>

      {/* Logout confirm dialog */}
      {showLogoutAlert && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box">
            <div className="custom-alert-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h3 className="custom-alert-title">Are you sure you want to log out?</h3>
            <p className="custom-alert-message">Log Out Now</p>
            <div className="custom-alert-actions">
              <button className="alert-btn alert-btn-cancel" onClick={cancelLogout}>Cancel</button>
              <button className="alert-btn alert-btn-confirm" onClick={confirmLogout}>Ok</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Styles ---------- */}
      <style>{`
        .custom-alert-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex; justify-content: center; align-items: center;
          z-index: 99999;
          animation: customFadeIn 0.3s ease;
        }
        .custom-alert-box {
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 45px 35px;
          max-width: 420px; width: 90%;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
          animation: customSlideUp 0.3s ease;
        }
        .custom-alert-icon {
          font-size: 52px;
          color: #f39c12;
          margin-bottom: 12px;
        }
        .custom-alert-icon i {
          background: #fff3e0;
          padding: 15px;
          border-radius: 50%;
        }
        .custom-alert-title {
          font-size: 22px; font-weight: 700;
          color: #2d3748; margin-bottom: 8px;
          font-family: 'Segoe UI', sans-serif;
        }
        .custom-alert-message {
          font-size: 16px; color: #4a5568;
          margin-bottom: 28px; line-height: 1.5;
        }
        .custom-alert-actions {
          display: flex; gap: 14px; justify-content: center;
        }
        .alert-btn {
          padding: 12px 30px;
          border: none; border-radius: 50px;
          font-size: 15px; font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          flex: 1; max-width: 140px;
        }
        .alert-btn-cancel { background: #edf2f7; color: #2d3748; }
        .alert-btn-cancel:hover { background: #e2e8f0; transform: scale(1.02); }
        .alert-btn-confirm { background: #e53e3e; color: #fff; }
        .alert-btn-confirm:hover {
          background: #c53030; transform: scale(1.02);
          box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
        }
        .submenu-item-disabled { pointer-events: none; }
        .submenu-link-disabled {
          opacity: 0.4;
          cursor: not-allowed !important;
          filter: grayscale(0.6);
        }
        .submenu-link-disabled:hover {
          background: transparent !important;
          color: inherit !important;
        }
        @keyframes customFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes customSlideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 480px) {
          .custom-alert-box { padding: 30px 20px 25px; }
          .custom-alert-icon { font-size: 40px; }
          .custom-alert-title { font-size: 19px; }
          .alert-btn { padding: 10px 20px; font-size: 14px; }
        }
      `}</style>
    </div>
  );
}

export default Sidebar;