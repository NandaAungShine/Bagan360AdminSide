import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false); // 👈 Alert ပြရန်/ဖျောက်ရန်
  const location = useLocation();
  const navigate = useNavigate();

  // ---------- Get user data ----------
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const role = userData?.role || '';
  const shopTypeRaw = localStorage.getItem('shopType') || '';
  const shopType = shopTypeRaw.trim().toLowerCase();

  console.log('📦 User role:', role);
  console.log('🏪 Shop type from localStorage:', shopType);

  // ---------- Menu definitions ----------
  const addMenuItems = [
    { name: 'Travel To Do', icon: 'bi-list', path: '/traveltodos' },
    { name: 'History Of Pagodas', icon: 'bi-building', path: '/historyofpagodas' },
    { name: 'Hotels', icon: 'bi-building', path: '/hotels' },
    { name: 'Destinations', icon: 'bi-geo-alt', path: '/destinations' },
    { name: 'Package Plans', icon: 'bi-pin-map', path: '/PackagePlan' },
    { name: 'Restaurants', icon: 'bi-egg-fried', path: '/restaurants' },
    { name: 'Cars', icon: 'bi-car-front', path: '/cars' },
    { name: 'E-Bikes', icon: 'bi-bicycle', path: '/ebikes' },
    { name: 'Hot Air Balloons', icon: 'bi-balloon', path: '/hotairballoons' },
    { name: 'Tricycles', icon: 'bi-truck', path: '/tricycles' },
    { name: 'Horse Carts', icon: 'bi-truck', path: '/horsecarts' },
    { name: 'Banner', icon: 'bi-image', path: '/banner' },
  ];

  const orderMenuItems = [
    { name: 'Hotels Order', icon: 'bi-building', path: '/hotelsorder' },
    { name: 'Destinations Order', icon: 'bi-geo-alt', path: '/destinationsorder' },
    { name: 'Package Plans Order', icon: 'bi-pin-map', path: '/packageplansorder' },
    { name: 'Restaurants Order', icon: 'bi-egg-fried', path: '/restaurantsorder' },
    { name: 'Cars Order', icon: 'bi-car-front', path: '/carsorder' },
    { name: 'E-Bikes Order', icon: 'bi-bicycle', path: '/ebikesorder' },
    { name: 'Hot Air Balloons Order', icon: 'bi-balloon', path: '/hotairballoonsorder' },
    { name: 'Tricycles Order', icon: 'bi-truck', path: '/tricyclesorder' },
    { name: 'Horse Carts Order', icon: 'bi-truck', path: '/horsecartsorder' },
    { name: 'Banner Order', icon: 'bi-image', path: '/bannerorder' },
  ];

  // ---------- Helpers ----------
  const findMenuItem = (items, name) =>
    items.find(item => item.name.toLowerCase() === name.toLowerCase());

  const isActive = (path) => location.pathname === path;

  // ---------- Logout Handlers ----------
  const handleLogout = () => {
    setShowLogoutAlert(true); // 👈 Alert ပေါ်လာစေရန်
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('shopType');
    sessionStorage.clear();
    navigate('/login');
    setShowLogoutAlert(false);
  };

  const cancelLogout = () => {
    setShowLogoutAlert(false);
  };

  // ---------- Mapping: E-Bike အပါအဝင် အကုန်ထည့်ထားပါ ----------
  const shopTypeMap = {
    hotels: { main: 'Hotels', order: 'Hotels Order' },
    hotel: { main: 'Hotels', order: 'Hotels Order' },
    destinations: { main: 'Destinations', order: 'Destinations Order' },
    destination: { main: 'Destinations', order: 'Destinations Order' },
    restaurants: { main: 'Restaurants', order: 'Restaurants Order' },
    restaurant: { main: 'Restaurants', order: 'Restaurants Order' },
    cars: { main: 'Cars', order: 'Cars Order' },
    car: { main: 'Cars', order: 'Cars Order' },
    ebikes: { main: 'E-Bikes', order: 'E-Bikes Order' },
    'e-bikes': { main: 'E-Bikes', order: 'E-Bikes Order' },
    ebike: { main: 'E-Bikes', order: 'E-Bikes Order' },
    'e-bike': { main: 'E-Bikes', order: 'E-Bikes Order' },
    e_bike: { main: 'E-Bikes', order: 'E-Bikes Order' },
    'e bike': { main: 'E-Bikes', order: 'E-Bikes Order' },
    hotairballoons: { main: 'Hot Air Balloons', order: 'Hot Air Balloons Order' },
    hotairballoon: { main: 'Hot Air Balloons', order: 'Hot Air Balloons Order' },
    tricycles: { main: 'Tricycles', order: 'Tricycles Order' },
    tricycle: { main: 'Tricycles', order: 'Tricycles Order' },
    thonebane: { main: 'Tricycles', order: 'Tricycles Order' },
    horsecarts: { main: 'Horse Carts', order: 'Horse Carts Order' },
    horsecart: { main: 'Horse Carts', order: 'Horse Carts Order' },
  };

  const getMappedNames = (type) => {
    const mapped = shopTypeMap[type];
    if (mapped) return mapped;
    console.warn(`⚠️ Unknown shop type: "${type}". Using Hotels as fallback.`);
    return { main: 'Hotels', order: 'Hotels Order' };
  };

  // ---------- Admin Menu ----------
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
      <li className="nav-item" style={{ overflow: 'visible' }}>
        <div className="nav-link justify-between" onClick={() => setIsAddOpen(!isAddOpen)}>
          <div className="flex-items">
            <i className="bi bi-plus-square-fill icon"></i>
            <span>Add</span>
          </div>
          <i className={`bi bi-chevron-down arrow-icon ${isAddOpen ? 'rotate-180' : ''}`}></i>
        </div>
        <ul
          className={`submenu ${isAddOpen ? 'submenu-open' : 'submenu-closed'}`}
          style={{ overflow: 'visible', maxHeight: isAddOpen ? '2000px' : '0', transition: 'max-height 0.3s ease-in-out' }}
        >
          {addMenuItems.map((item, index) => (
            <li key={index} className={`submenu-item ${isActive(item.path) ? 'active' : ''}`}>
              <Link to={item.path} className="submenu-link">
                <i className={`${item.icon} submenu-icon`}></i>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </li>
      <li className="nav-item" style={{ overflow: 'visible' }}>
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
          {orderMenuItems.map((item, index) => (
            <li key={index} className={`submenu-item ${isActive(item.path) ? 'active' : ''}`}>
              <Link to={item.path} className="submenu-link">
                <i className={`${item.icon} submenu-icon`}></i>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </li>
      <li className={`nav-item ${isActive('/reviews') ? 'active' : ''}`}>
        <Link to="/reviews" className="nav-link">
          <div className="flex-items">
            <i className="bi bi-chat-left-text-fill icon"></i>
            <span>Reviews</span>
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

  // ---------- Shop Menu ----------
  const renderShopMenu = () => {
    const mapped = getMappedNames(shopType);
    const mainItem = findMenuItem(addMenuItems, mapped.main);
    const orderItem = findMenuItem(orderMenuItems, mapped.order);

    const main = mainItem || addMenuItems[2];
    const order = orderItem || orderMenuItems[0];

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

  // ---------- Decide ----------
  const renderMenu = () => {
    if (role === 'admin') {
      return renderAdminMenu();
    } else if (role === 'shop') {
      return renderShopMenu();
    } else {
      return (
        <li className="nav-item">
          <span className="nav-link" style={{ color: '#999' }}>
            No menu available
          </span>
        </li>
      );
    }
  };

  // ---------- Render ----------
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
        <ul className="nav-list">
          {renderMenu()}
        </ul>
      </nav>

      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Log Out</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 👇 CUSTOM ALERT - ဒီနေရာမှာပဲ ထည့်ထားတယ်၊ ဘာဖိုင်မှမဆောက်ဘူး */}
      {/* ============================================================ */}
      {showLogoutAlert && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box">
            <div className="custom-alert-icon">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h3 className="custom-alert-title">Are you sure you want to log out?</h3>
            <p className="custom-alert-message">Log Out Now</p>
            <div className="custom-alert-actions">
              <button className="alert-btn alert-btn-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="alert-btn alert-btn-confirm" onClick={confirmLogout}>
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ============================================================ */}

      {/* ============================================================ */}
      {/* 👇 CUSTOM ALERT STYLES - ဒီမှာပဲ CSS ထည့်ထားတယ် */}
      {/* ============================================================ */}
      <style>{`
        /* Overlay */
        .custom-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          animation: customFadeIn 0.3s ease;
        }

        /* Alert Box */
        .custom-alert-box {
          background: #ffffff;
          border-radius: 20px;
          padding: 40px 45px 35px;
          max-width: 420px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
          animation: customSlideUp 0.3s ease;
        }

        /* Icon */
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

        /* Title */
        .custom-alert-title {
          font-size: 22px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 8px;
          font-family: 'Segoe UI', sans-serif;
        }

        /* Message */
        .custom-alert-message {
          font-size: 16px;
          color: #4a5568;
          margin-bottom: 28px;
          line-height: 1.5;
        }

        /* Buttons */
        .custom-alert-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
        }
        .alert-btn {
          padding: 12px 30px;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          flex: 1;
          max-width: 140px;
        }
        .alert-btn-cancel {
          background: #edf2f7;
          color: #2d3748;
        }
        .alert-btn-cancel:hover {
          background: #e2e8f0;
          transform: scale(1.02);
        }
        .alert-btn-confirm {
          background: #e53e3e;
          color: #fff;
        }
        .alert-btn-confirm:hover {
          background: #c53030;
          transform: scale(1.02);
          box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
        }

        /* Animations */
        @keyframes customFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes customSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Mobile */
        @media (max-width: 480px) {
          .custom-alert-box {
            padding: 30px 20px 25px;
          }
          .custom-alert-icon {
            font-size: 40px;
          }
          .custom-alert-title {
            font-size: 19px;
          }
          .alert-btn {
            padding: 10px 20px;
            font-size: 14px;
          }
        }
      `}</style>
      {/* ============================================================ */}

    </div>
  );
}

export default Sidebar;