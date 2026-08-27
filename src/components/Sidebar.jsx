import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ---------- Get user & shop type from localStorage ----------
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const role = userData?.role || '';

  // ✅ Read shop type from a dedicated key (set after login)
  const shopTypeRaw = localStorage.getItem('shopType') || '';
  const shopType = shopTypeRaw.trim().toLowerCase();

  // If shopType is still empty, try to get it from userData (fallback)
  const finalShopType = shopType || userData?.shop?.type || userData?.type || '';

  console.log('📦 User role:', role);
  console.log('🏪 Shop type from localStorage:', finalShopType);

  // ---------- Menu definitions (unchanged) ----------
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

  // ---------- Helpers ----------
  const findMenuItem = (items, name) =>
    items.find(item => item.name.toLowerCase() === name.toLowerCase());

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('shopType'); // also clear shop type
      sessionStorage.clear();
      navigate('/login');
      alert('You have been logged out successfully!');
    }
  };

  // ---------- Mapping (plural and singular) ----------
  const shopTypeMap = {
    hotels: { main: 'Hotels', order: 'Hotels Order' },
    destinations: { main: 'Destinations', order: 'Destinations Order' },
    restaurants: { main: 'Restaurants', order: 'Restaurants Order' },
    cars: { main: 'Cars', order: 'Cars Order' },
    ebikes: { main: 'E-Bikes', order: 'E-Bikes Order' },
    hotairballoons: { main: 'Hot Air Balloons', order: 'Hot Air Balloons Order' },
    tricycles: { main: 'Tricycles', order: 'Tricycles Order' },
    horsecarts: { main: 'Horse Carts', order: 'Horse Carts Order' },
    hotel: { main: 'Hotels', order: 'Hotels Order' },
    destination: { main: 'Destinations', order: 'Destinations Order' },
    restaurant: { main: 'Restaurants', order: 'Restaurants Order' },
    car: { main: 'Cars', order: 'Cars Order' },
    ebike: { main: 'E-Bikes', order: 'E-Bikes Order' },
    hotairballoon: { main: 'Hot Air Balloons', order: 'Hot Air Balloons Order' },
    tricycle: { main: 'Tricycles', order: 'Tricycles Order' },
    horsecart: { main: 'Horse Carts', order: 'Horse Carts Order' },
  };

  const getMappedNames = (type) => {
    const mapped = shopTypeMap[type];
    if (mapped) return mapped;
    // If unknown, fallback to Hotels but show a warning
    console.warn(`⚠️ Unknown shop type: "${type}". Using Hotels as fallback.`);
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
    const mapped = getMappedNames(finalShopType);
    const mainItem = findMenuItem(addMenuItems, mapped.main);
    const orderItem = findMenuItem(orderMenuItems, mapped.order);

    const main = mainItem || addMenuItems[2]; // Hotels
    const order = orderItem || orderMenuItems[0]; // Hotels Order

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
    </div>
  );
}

export default Sidebar;