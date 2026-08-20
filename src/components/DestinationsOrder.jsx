// components/DestinationsOrder.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';

function DestinationsOrder() {
  // ===== 1. THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  

  // ===== 2. UI STATES =====
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ===== 3. SAMPLE DATA (Destinations) =====
  const sampleOrders = [
    {
      id: 1,
      destination: {
        name: 'Bagan Ancient City',
        image: '/images/destination1.jpg',
        description: 'Thousands of pagodas and temples spread across the plains.',
      },
      user: { name: 'John Doe', email: 'john@example.com' },
      total_price: 120000,
      status: 'pending',
      check_in_date: '2026-08-01',
      check_out_date: '2026-08-03',
      special_requests: 'Guide service needed',
      created_at: '2026-07-28T10:30:00Z',
    },
    {
      id: 2,
      destination: {
        name: 'Inle Lake',
        image: '/images/destination2.jpg',
        description: 'Floating gardens, stilt houses, and unique leg-rowing fishermen.',
      },
      user: { name: 'Jane Smith', email: 'jane@example.com' },
      total_price: 180000,
      status: 'confirmed',
      check_in_date: '2026-08-05',
      check_out_date: '2026-08-07',
      special_requests: '',
      created_at: '2026-07-27T14:20:00Z',
    },
    {
      id: 3,
      destination: {
        name: 'Golden Rock',
        image: '/images/destination3.jpg',
        description: 'Famous pagoda perched on a boulder covered in gold leaf.',
      },
      user: { name: 'Mike Johnson', email: 'mike@example.com' },
      total_price: 95000,
      status: 'completed',
      check_in_date: '2026-07-20',
      check_out_date: '2026-07-22',
      special_requests: 'Transport from Yangon',
      created_at: '2026-07-19T09:15:00Z',
    },
    {
      id: 4,
      destination: {
        name: 'Mandalay Palace',
        image: '/images/destination4.jpg',
        description: 'Royal palace with stunning views from the watchtower.',
      },
      user: { name: 'Sarah Lee', email: 'sarah@example.com' },
      total_price: 65000,
      status: 'cancelled',
      check_in_date: '2026-08-10',
      check_out_date: '2026-08-12',
      special_requests: '',
      created_at: '2026-07-25T16:45:00Z',
    },
    {
      id: 5,
      destination: {
        name: 'Ngapali Beach',
        image: '/images/destination5.jpg',
        description: 'Beautiful white-sand beach with crystal clear water.',
      },
      user: { name: 'David Kim', email: 'david@example.com' },
      total_price: 210000,
      status: 'pending',
      check_in_date: '2026-08-15',
      check_out_date: '2026-08-18',
      special_requests: 'Seafront room',
      created_at: '2026-07-29T08:10:00Z',
    },
  ];

  // ===== 4. THEME HANDLER =====
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // ===== 5. FETCH (Simulate) =====
  const fetchOrders = () => {
    setLoading(true);
    setTimeout(() => {
      setOrders(sampleOrders);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ===== 6. UPDATE STATUS (Simulate) =====
  const updateOrderStatus = (orderId, newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;
    setLoading(true);
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setLoading(false);
      alert(`Order status updated to ${newStatus}`);
    }, 400);
  };

  // ===== 7. FILTER =====
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchTerm) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.destination.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // ===== 8. STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      confirmed: { label: 'Confirmed', color: '#0d6efd', bg: '#cfe2ff' },
      completed: { label: 'Completed', color: '#198754', bg: '#d1e7dd' },
      cancelled: { label: 'Cancelled', color: '#dc3545', bg: '#f8d7da' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status, color: '#6c757d', bg: '#e9ecef' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: s.color,
          backgroundColor: s.bg,
        }}
      >
        {s.label}
      </span>
    );
  };

  // ===== 9. CARD ACTIONS =====
  const CardActions = ({ order }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleViewDetails = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      setSelectedOrder(order);
      setShowDetailModal(true);
    };

    const handleStatusChange = (e, status) => {
      e.stopPropagation();
      setIsOpen(false);
      updateOrderStatus(order.id, status);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="edit-btn" onClick={handleViewDetails}>
            <i className="bi bi-eye"></i> View Details
          </button>
          <button className="edit-btn" onClick={(e) => handleStatusChange(e, 'confirmed')}>
            <i className="bi bi-check-circle"></i> Confirm
          </button>
          <button className="edit-btn" onClick={(e) => handleStatusChange(e, 'completed')}>
            <i className="bi bi-check2-circle"></i> Complete
          </button>
          <button className="delete-btn" onClick={(e) => handleStatusChange(e, 'cancelled')}>
            <i className="bi bi-x-circle"></i> Cancel
          </button>
        </div>
      </div>
    );
  };

  // ===== 10. DETAIL MODAL =====
  const DetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Order Details #{order.id}</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Destination:</strong> {order.destination.name}</div>
              <div><strong>Guest:</strong> {order.user.name} ({order.user.email})</div>
              <div><strong>Check-in:</strong> {order.check_in_date?.slice(0, 10)}</div>
              <div><strong>Check-out:</strong> {order.check_out_date?.slice(0, 10)}</div>
              <div><strong>Total Price:</strong> MMK {order.total_price}</div>
              <div><strong>Status:</strong> {getStatusBadge(order.status)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Special Requests:</strong> {order.special_requests || 'None'}
              </div>
              {order.destination.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Description:</strong><br />
                  <span style={{ fontSize: '14px' }}>{order.destination.description}</span>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="discard-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== 11. ORDER CARD =====
  const OrderCard = ({ order }) => (
    <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
      <div className="hotel-card-image" style={{ height : '200px'}}>
        <div className="image-slider">
          <img
            src={order.destination.image || '/default-destination.jpg'}
            alt={order.destination.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-destination.jpg';
            }}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
        <CardActions order={order} />
      </div>
      <div className="hotel-card-info">
        <h3 className="hotel-name">{order.destination.name}</h3>
        <p className="hotel-location">
          <i className="bi bi-person"></i> {order.user.name}
        </p>
        <p className="hotel-price">
          Total: <span>MMK {order.total_price}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {getStatusBadge(order.status)}
          <span style={{ fontSize: '12px', color: '#999' }}>
            <i className="bi bi-calendar3"></i> {order.created_at?.slice(0, 10) || 'N/A'}
          </span>
        </div>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          <i className="bi bi-clock"></i> Check-in: {order.check_in_date?.slice(0, 10) || 'N/A'} &nbsp;|&nbsp;
          Check-out: {order.check_out_date?.slice(0, 10) || 'N/A'}
        </p>
      </div>
    </div>
  );

  // ===== 12. LOADING =====
  if (loading && orders.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Destination Orders" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // ===== 13. SUMMARY DATA =====
  const summaryData = [
    { label: 'Total Orders', count: orders.length, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Completed', count: orders.filter(o => o.status === 'completed').length, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'Destinations', count: orders.length, icon: 'bi-geo-alt-fill', color: '#6f42c1' },
  ];

  // ===== 14. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Destination Orders" onThemeChange={handleThemeChange} />

      {/* ===== SUMMARY BOXES (5 Cards with Fixed Dark Background) ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        {summaryData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#2d2d2d', // Fixed dark background for both modes
              padding: '15px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: isDarkMode
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.15)',
              border: isDarkMode ? '1px solid #444' : '1px solid #555', // Lighter border for light mode
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              <i className={item.icon}></i>
            </div>
            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#bbb', // Light gray text for label (visible on dark bg)
                  fontWeight: '500',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ffffff', // White text for count
                }}
              >
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== SEARCH + FILTER ===== */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by order ID, user or destination..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Status:</label>
          <select
            className="search-input-full"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ===== ORDER CARDS (3 per row) ===== */}
      <div className="hotels-two-columns">
        <div className="hotels-cards-column" style={{ gridColumn: '1 / -1' }}>
          <div className="hotels-scroll-area">
            <div
              className="hotels-grid-3cols"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
              }}
            >
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '50px',
                    color: '#999',
                  }}
                >
                  <i
                    className="bi bi-inbox"
                    style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}
                  ></i>
                  <p>No orders found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && (
        <DetailModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

export default DestinationsOrder;