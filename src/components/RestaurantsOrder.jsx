// components/RestaurantsOrder.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function RestaurantsOrder() {
  // ===== 1. THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== 2. UI STATES =====
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'daily', 'weekly', 'monthly', 'yearly'
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // ===== 3. TOAST =====
  const [toast, setToast] = useState({
    visible: false,
    type: 'success',
    message: '',
  });
  const toastTimeoutRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ===== 4. API HELPERS =====
  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => window.location.href = '/login', 1500);
  };

  // ===== 5. API BASE =====
  const API_BASE = '/api/admin/restaurant/booking';

  // ===== 6. FETCH ORDERS =====
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/list/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      const result = await response.json();
      console.log('✅ Restaurant Bookings response:', result);

      // Safely extract the array
      let ordersArray = [];
      if (Array.isArray(result.data)) {
        ordersArray = result.data;
      } else if (Array.isArray(result)) {
        ordersArray = result;
      } else {
        const possibleKeys = ['orders', 'bookings', 'items', 'results', 'list'];
        for (const key of possibleKeys) {
          if (Array.isArray(result[key])) {
            ordersArray = result[key];
            break;
          }
        }
      }
      setOrders(ordersArray);
    } catch (err) {
      setError(err.message);
      console.error('❌ Fetch Restaurant Orders Error:', err);
      showToast('error', 'Failed to load restaurant bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      showToast('error', 'Please login first');
      return;
    }
    fetchOrders();
  }, []);

  // ===== 7. THEME HANDLER =====
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

  // ===== 8. UPDATE STATUS (Approve / Cancel) =====
  const updateOrderStatus = async (orderId, action) => {
    // action: 'approved' or 'cancelled'
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;
    setLoading(true);
    try {
      const endpoint = action === 'approved' ? 'approved' : 'cancelled';
      const response = await fetch(`${API_BASE}/${endpoint}/${orderId}`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      await fetchOrders();
      showToast('success', `Booking ${action} successfully!`);
    } catch (err) {
      console.error(`❌ ${action} Error:`, err);
      showToast('error', `Failed to ${action} booking.`);
    } finally {
      setLoading(false);
    }
  };

  // ===== 9. FILTER LOGIC (with Daily/Weekly/Monthly/Yearly) =====
  const filteredOrders = orders.filter((order) => {
    // 9a. Search filter
    const restaurantName = order.restaurant?.name || order.restaurantName || '';
    const userName = order.user?.name || order.customerName || order.userName || '';
    const orderIdStr = order.id?.toString() || '';

    const matchesSearch =
      orderIdStr.includes(searchTerm) ||
      restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());

    // 9b. Status filter
    const status = order.status || '';
    const matchesStatus = statusFilter ? status === statusFilter : true;

    // 9c. Time filter (Daily / Weekly / Monthly / Yearly)
    let matchesTime = true;
    if (timeFilter !== 'all') {
      // Try to get a date: prefer check_in_date, fallback to created_at
      const dateStr = order.check_in_date || order.checkInDate || order.created_at || order.createdAt;
      if (!dateStr) {
        matchesTime = false;
      } else {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          matchesTime = false;
        } else {
          const today = new Date();
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          const todayYear = today.getFullYear();
          const todayMonth = today.getMonth();
          const todayDay = today.getDate();

          switch (timeFilter) {
            case 'daily':
              matchesTime = (year === todayYear && month === todayMonth && day === todayDay);
              break;
            case 'weekly': {
              // Start of week (Monday)
              const startOfWeek = new Date(today);
              const dayOfWeek = today.getDay();
              const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              startOfWeek.setDate(today.getDate() - diff);
              startOfWeek.setHours(0, 0, 0, 0);
              const endOfWeek = new Date(startOfWeek);
              endOfWeek.setDate(startOfWeek.getDate() + 6);
              endOfWeek.setHours(23, 59, 59, 999);
              matchesTime = (date >= startOfWeek && date <= endOfWeek);
              break;
            }
            case 'monthly':
              matchesTime = (year === todayYear && month === todayMonth);
              break;
            case 'yearly':
              matchesTime = (year === todayYear);
              break;
            default:
              matchesTime = true;
          }
        }
      }
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  // ===== 10. STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      approved: { label: 'Approved', color: '#0d6efd', bg: '#cfe2ff' },
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

  // ===== 11. CARD ACTIONS (Approve / Cancel / View) =====
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

    const handleApprove = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      updateOrderStatus(order.id, 'approved');
    };

    const handleCancel = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      updateOrderStatus(order.id, 'cancelled');
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

    const isApproved = order.status?.toLowerCase() === 'approved';
    const isCancelled = order.status?.toLowerCase() === 'cancelled';

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="edit-btn" onClick={handleViewDetails}>
            <i className="bi bi-eye"></i> View Details
          </button>
          <button className="edit-btn" onClick={handleApprove} disabled={isApproved || isCancelled}>
            <i className="bi bi-check-circle"></i> Approve
          </button>
          <button className="delete-btn" onClick={handleCancel} disabled={isApproved || isCancelled}>
            <i className="bi bi-x-circle"></i> Cancel
          </button>
        </div>
      </div>
    );
  };

  // ===== 12. DETAIL MODAL =====
  const DetailModal = ({ order, onClose }) => {
    if (!order) return null;

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString();
    };

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
              <div><strong>Restaurant:</strong> {order.restaurant?.name || order.restaurantName || 'N/A'}</div>
              <div><strong>Guest:</strong> {order.user?.name || order.customerName || 'N/A'}</div>
              <div><strong>Email:</strong> {order.user?.email || order.customerEmail || 'N/A'}</div>
              <div><strong>Check‑in:</strong> {formatDate(order.check_in_date || order.checkInDate)}</div>
              <div><strong>Check‑out:</strong> {formatDate(order.check_out_date || order.checkOutDate)}</div>
              <div><strong>Total Price:</strong> MMK {order.total_price || order.totalPrice || 0}</div>
              <div><strong>Status:</strong> {getStatusBadge(order.status)}</div>
              <div><strong>Booked On:</strong> {formatDate(order.created_at || order.createdAt)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Special Requests / Notes:</strong><br />
                <span style={{ fontSize: '14px' }}>
                  {order.special_requests || order.notes || 'None'}
                </span>
              </div>
              {order.restaurant?.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Description:</strong><br />
                  <span style={{ fontSize: '14px' }}>{order.restaurant.description}</span>
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

  // ===== 13. ORDER CARD =====
  const OrderCard = ({ order }) => {
    const restaurantName = order.restaurant?.name || order.restaurantName || 'Restaurant';
    const userName = order.user?.name || order.customerName || 'Guest';
    const imageUrl = order.restaurant?.image || order.image || '/default-restaurant.jpg';

    return (
      <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
        <div className="hotel-card-image">
          <div className="image-slider">
            <img
              src={imageUrl}
              alt={restaurantName}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-restaurant.jpg';
              }}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <CardActions order={order} />
        </div>
        <div className="hotel-card-info">
          <h3 className="hotel-name">{restaurantName}</h3>
          <p className="hotel-location">
            <i className="bi bi-person"></i> {userName}
          </p>
          <p className="hotel-price">
            Total: <span>MMK {order.total_price || order.totalPrice || 0}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {getStatusBadge(order.status)}
            <span style={{ fontSize: '12px', color: '#999' }}>
              <i className="bi bi-calendar3"></i> {order.check_in_date || order.checkInDate ? new Date(order.check_in_date || order.checkInDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            <i className="bi bi-clock"></i> {order.check_out_date || order.checkOutDate ? new Date(order.check_out_date || order.checkOutDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
    );
  };

  // ===== 14. LOADING / ERROR =====
  if (loading && orders.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Restaurant Bookings" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Restaurant Bookings" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '48px' }}></i>
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={() => { setError(null); fetchOrders(); }}>Retry</button>
        </div>
      </div>
    );
  }

  // ===== 15. SUMMARY DATA =====
  const summaryData = [
    { label: 'Total Bookings', count: orders.length, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: orders.filter(o => (o.status || '').toLowerCase() === 'pending').length, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: orders.filter(o => (o.status || '').toLowerCase() === 'approved').length, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: orders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'Restaurants', count: new Set(orders.map(o => o.restaurant?.id || o.restaurantId)).size || orders.length, icon: 'bi-egg-fried', color: '#6f42c1' },
  ];

  // ===== 16. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Restaurant Bookings" onThemeChange={handleThemeChange} />

      {/* Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '8px',
          backgroundColor: toast.type === 'success' ? '#d4edda' : '#f8d7da',
          color: toast.type === 'success' ? '#155724' : '#721c24',
          border: '1px solid ' + (toast.type === 'success' ? '#c3e6cb' : '#f5c6cb'),
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '400px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span>{toast.message}</span>
            <button onClick={() => setToast({ ...toast, visible: false })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* ===== SUMMARY BOXES (Dark Background Fixed) ===== */}
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
              backgroundColor: '#2d2d2d',
              padding: '15px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '1px solid #444',
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
              <div style={{ fontSize: '12px', color: '#bbb', fontWeight: '500' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== SEARCH + STATUS + TIME FILTERS ===== */}
      <div className="search-actions-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="search-bar-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by ID, restaurant or guest..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Status:</label>
          <select
            className="search-input-full"
            style={{ width: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* ===== TIME FILTER BUTTONS ===== */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '4px' }}>Period:</label>
          {['all', 'daily', 'weekly', 'monthly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              style={{
                padding: '4px 14px',
                borderRadius: '20px',
                border: '1px solid #6c757d',
                background: timeFilter === period ? (isDarkMode ? '#0d6efd' : '#0d6efd') : 'transparent',
                color: timeFilter === period ? '#fff' : (isDarkMode ? '#eee' : '#333'),
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {period === 'all' ? 'All' : period}
            </button>
          ))}
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
                  <p>No bookings match the current filters.</p>
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

export default RestaurantsOrder;