import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ---------- Get user data from localStorage ----------
  const rawData = JSON.parse(localStorage.getItem('user') || '{}');
  // Try to extract the user object (if the whole response was stored)
  const user = rawData.user || rawData;
  const shop = rawData.shop || user?.shop || null;

  const role = user?.role || rawData?.role;
  const shopTypeRaw = shop?.type || user?.type || rawData?.shopType || '';
  const shopType = shopTypeRaw.trim().toLowerCase(); // e.g., "hotel", "car", ...

  // ---------- Menu definitions ----------
  const addMenuItems = [
    { name: 'Travel To Do', icon: 'bi-list', path: '/traveltodos' },
    { name: 'History Of Pagodas', icon: 'bi-building', path: '/historyofpagodas' },
    { name: 'Hotels', icon: 'bi-building', path: '/hotels' },
    { name: 'Destinations', icon: 'bi-geo-alt', path: '/destinations' },
    { name: 'Package Plans', icon: 'bi-pin-map', path: '/destination-plans' },
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

  // ---------- Helper: case‑insensitive search ----------
  const findMenuItem = (items, name) => {
    return items.find(item => item.name.toLowerCase() === name.toLowerCase());
  };

  // ---------- Active path ----------
  const isActive = (path) => location.pathname === path;

  // ---------- Logout ----------
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
      alert('You have been logged out successfully!');
    }
  };

  // ---------- Shop type → menu names (lowercase keys) ----------
  const shopTypeMap = {
    hotel: { main: 'Hotels', order: 'Hotels Order' },
    car: { main: 'Cars', order: 'Cars Order' },
    destination: { main: 'Destinations', order: 'Destinations Order' },
    ebike: { main: 'E-Bikes', order: 'E-Bikes Order' },
    horsecart: { main: 'Horse Carts', order: 'Horse Carts Order' },
    hotairballoon: { main: 'Hot Air Balloons', order: 'Hot Air Balloons Order' },
    restaurant: { main: 'Restaurants', order: 'Restaurants Order' },
    tricycle: { main: 'Tricycles', order: 'Tricycles Order' },
  };

  // ---------- Fallback: if type is unknown, use Hotels ----------
  const getMappedNames = (type) => {
    const mapped = shopTypeMap[type];
    if (mapped) return mapped;
    // Default fallback – show Hotels & Hotels Order
    console.warn(`Unknown shop type: "${type}". Using Hotels as fallback.`);
    return { main: 'Hotels', order: 'Hotels Order' };
  };

  // ---------- Admin Menu (full) ----------
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
      {/* Add Dropdown */}
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
          style={{
            overflow: 'visible',
            maxHeight: isAddOpen ? '2000px' : '0',
            transition: 'max-height 0.3s ease-in-out',
          }}
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
      {/* Order Dropdown */}
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
          style={{
            overflow: 'visible',
            maxHeight: isOrderOpen ? '2000px' : '0',
            transition: 'max-height 0.3s ease-in-out',
          }}
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

  // ---------- Shop Menu (flat list) ----------
  const renderShopMenu = () => {
    // Get mapped names (with fallback)
    const mapped = getMappedNames(shopType);
    const mainItem = findMenuItem(addMenuItems, mapped.main);
    const orderItem = findMenuItem(orderMenuItems, mapped.order);

    // If for some reason they are still null, we fallback to first item in list?
    // But we have a fallback in getMappedNames, so they should exist.
    const main = mainItem || addMenuItems[2]; // Hotels
    const order = orderItem || orderMenuItems[0]; // Hotels Order

    return (
      <>
        {/* 1. Dashboard – always */}
        <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            <div className="flex-items">
              <i className="bi bi-grid-1x2-fill icon"></i>
              <span>Dashboard</span>
            </div>
          </Link>
        </li>

        {/* 2. Main entity */}
        <li className={`nav-item ${isActive(main.path) ? 'active' : ''}`}>
          <Link to={main.path} className="nav-link">
            <div className="flex-items">
              <i className={`${main.icon} icon`}></i>
              <span>{main.name}</span>
            </div>
          </Link>
        </li>

        {/* 3. Order entity */}
        <li className={`nav-item ${isActive(order.path) ? 'active' : ''}`}>
          <Link to={order.path} className="nav-link">
            <div className="flex-items">
              <i className={`${order.icon} icon`}></i>
              <span>{order.name}</span>
            </div>
          </Link>
        </li>

        {/* 4. Settings – always */}
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
    </div>
  );
}

export default Sidebar;