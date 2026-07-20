import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const subMenuItems = [
    { name: 'History Of Pagodas', icon: 'bi-building', path: '/historyofpagodas' },
    { name: 'Hotels', icon: 'bi-building', path: '/hotels' },
    { name: 'Destinations', icon: 'bi-geo-alt', path: '/destinations' },
    { name: 'Restaurants', icon: 'bi-egg-fried', path: '/restaurants' },
    { name: 'Cars', icon: 'bi-car-front', path: '/cars' },
    { name: 'E-Bikes', icon: 'bi-bicycle', path: '/ebikes' },
    { name: 'Hot Air Balloons', icon: 'bi-balloon', path: '/hotairballoons' },
    { name: 'Tricycles', icon: 'bi-truck', path: '/tricycles' },
    { name: 'Horse Carts', icon: 'bi-truck', path: '/horsecarts' },
    // New Banner item added here
    { name: 'Banner', icon: 'bi-image', path: '/banner' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
      alert('You have been logged out successfully!');
    }
  };

  return (
    <div className="sidebar-container">
      {/* Logo Section with Image - No Background */}
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

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <ul className="nav-list">
          {/* Dashboard */}
          <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">
              <div className="flex-items">
                <i className="bi bi-grid-1x2-fill icon"></i>
                <span>Dashboard</span>
              </div>
            </Link>
          </li>

          {/* Users Link */}
          <li className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
            <Link to="/users" className="nav-link">
              <div className="flex-items">
                <i className="bi bi-person-badge-fill icon"></i>
                <span>Users</span>
              </div>
            </Link>
          </li>

          {/* Add Dropdown */}
          <li className="nav-item">
            <div className="nav-link justify-between" onClick={() => setIsAddOpen(!isAddOpen)}>
              <div className="flex-items">
                <i className="bi bi-plus-square-fill icon"></i>
                <span>Add</span>
              </div>
              <i className={`bi bi-chevron-down arrow-icon ${isAddOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {/* Sub Menu Items */}
            <ul className={`submenu ${isAddOpen ? 'submenu-open' : 'submenu-closed'}`}>
              {subMenuItems.map((item, index) => (
                <li key={index} className={`submenu-item ${isActive(item.path) ? 'active' : ''}`}>
                  <Link to={item.path} className="submenu-link">
                    <i className={`${item.icon} submenu-icon`}></i>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Reviews Link */}
          <li className={`nav-item ${isActive('/reviews') ? 'active' : ''}`}>
            <Link to="/reviews" className="nav-link">
              <div className="flex-items">
                <i className="bi bi-chat-left-text-fill icon"></i>
                <span>Reviews</span>
              </div>
            </Link>
          </li>

          {/* Reports Link */}
          <li className={`nav-item ${isActive('/reports') ? 'active' : ''}`}>
            <Link to="/reports" className="nav-link">
              <div className="flex-items">
                <i className="bi bi-file-earmark-bar-graph-fill icon"></i>
                <span>Reports</span>
              </div>
            </Link>
          </li>

          {/* Settings Link */}
          <li className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Link to="/settings" className="nav-link">
              <div className="flex-items">
                <i className="bi bi-gear-fill icon"></i>
                <span>Settings</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Log Out Button */}
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