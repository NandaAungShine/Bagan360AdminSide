// components/RestaurantsOrder.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

// Parse date string like "15-09-2026" (DD-MM-YYYY) to Date object
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return null;
};

function RestaurantsOrder() {
  // ===== User Role Check =====
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();

  // ===== 1. THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== 2. UI STATES =====
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
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

  const API_BASE_BOOKING = '/api/admin/restaurant/booking';

  // ===== 5. FETCH ORDERS =====
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_BOOKING}/list`, {
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

      const rawOrders = Array.isArray(result.booking) ? result.booking : [];

      const mappedOrders = rawOrders.map((item) => ({
        id: item.booking_id,
        userId: item.user_id,
        shopId: item.shop_id,
        status: (item.status || 'pending').toLowerCase(),
        bookingDate: item.booking_date || '',
        bookingTime: item.booking_time || '',
        passengerCount: item.passenger_count || 0,
        note: item.note || '',
        customerName: item.customer_name || 'Guest',
        customerPhone: item.customer_phone || '',
        shopName: item.shop_name || 'Shop',
        items: Array.isArray(item.items) ? item.items : [],
        startDate: parseDate(item.booking_date),
      }));

      console.log('📦 Mapped Orders:', mappedOrders);
      setOrders(mappedOrders);
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

  // ===== 6. THEME HANDLER =====
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

  // ===== 7. UPDATE STATUS =====
  const updateOrderStatus = async (orderId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;
    setLoading(true);
    try {
      const endpoint = action === 'approved' ? 'approved' : 'cancelled';
      const response = await fetch(`${API_BASE_BOOKING}/${endpoint}/${orderId}`, {
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

  // ===== 8. FILTER LOGIC =====
  const filteredOrders = orders.filter((order) => {
    const searchStr = `${order.id} ${order.shopName || ''} ${order.customerName || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    let matchesTime = true;
    if (timeFilter !== 'all') {
      const date = order.startDate;
      if (!date || isNaN(date.getTime())) {
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

    return matchesSearch && matchesStatus && matchesTime;
  });

  // ===== 9. SUMMARY DATA (based on filtered orders) =====
  const totalOrders = filteredOrders.length;
  const pendingCount = filteredOrders.filter(o => o.status === 'pending').length;
  const approvedCount = filteredOrders.filter(o =>
    ['approved', 'confirmed', 'completed'].includes(o.status)
  ).length;
  const cancelledCount = filteredOrders.filter(o => o.status === 'cancelled').length;
  const shopCount = new Set(filteredOrders.map(o => o.shopId)).size;

  const summaryData = [
    { label: 'Total Bookings', count: totalOrders, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: pendingCount, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: approvedCount, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: cancelledCount, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'Shops', count: shopCount || 0, icon: 'bi-shop', color: '#6f42c1' },
  ];

  // ===== 10. STATUS BADGE =====
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      approved: { label: 'Approved', color: '#0d6efd', bg: '#cfe2ff' },
      confirmed: { label: 'Confirmed', color: '#0d6efd', bg: '#cfe2ff' },
      completed: { label: 'Completed', color: '#198754', bg: '#d1e7dd' },
      cancelled: { label: 'Cancelled', color: '#dc3545', bg: '#f8d7da' },
    };
    const info = statusMap[s] || { label: status || 'Unknown', color: '#6c757d', bg: '#e9ecef' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: info.color,
          backgroundColor: info.bg,
        }}
      >
        {info.label}
      </span>
    );
  };

  // ===== 11. CARD ACTIONS =====
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

    const isApproved = ['approved', 'confirmed', 'completed'].includes(order.status);
    const isCancelled = order.status === 'cancelled';
    const isPending = order.status === 'pending';

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="edit-btn" onClick={handleViewDetails}>
            <i className="bi bi-eye"></i> View Details
          </button>
          {isPending && (
            <button className="edit-btn" onClick={handleApprove}>
              <i className="bi bi-check-circle"></i> Approve
            </button>
          )}
          {!isApproved && !isCancelled && (
            <button className="delete-btn" onClick={handleCancel}>
              <i className="bi bi-x-circle"></i> Cancel
            </button>
          )}
        </div>
      </div>
    );
  };

  // ===== 12. DETAIL MODAL =====
  const DetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Booking #{order.id}</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Shop:</strong> {order.shopName || 'N/A'}</div>
              <div><strong>Shop ID:</strong> {order.shopId || 'N/A'}</div>
              <div><strong>Customer:</strong> {order.customerName || 'N/A'}</div>
              <div><strong>Phone:</strong> {order.customerPhone || 'N/A'}</div>
              <div><strong>Booking Date:</strong> {order.bookingDate || 'N/A'}</div>
              <div><strong>Booking Time:</strong> {order.bookingTime || 'N/A'}</div>
              <div><strong>Passengers:</strong> {order.passengerCount || 0}</div>
              <div><strong>User ID:</strong> {order.userId || 'N/A'}</div>
              <div><strong>Status:</strong> {getStatusBadge(order.status)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Note:</strong> {order.note || 'None'}
              </div>
              {order.items && order.items.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Items:</strong>
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    {order.items.map((it, idx) => (
                      <li key={idx}>
                        {typeof it === 'string' ? it : (it.name || JSON.stringify(it))}
                      </li>
                    ))}
                  </ul>
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
    const shopName = order.shopName || 'Shop';
    const customerName = order.customerName || 'Guest';

    return (
      <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
        <div className="hotel-card-image" style={{ height: '200px' }}>
          <div
            className="image-slider"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #ff8a00, #e52e71)',
              width: '100%',
              height: '100%',
            }}
          >
            <i className="bi bi-shop" style={{ fontSize: '60px', color: '#fff' }}></i>
          </div>
          <CardActions order={order} />
        </div>
        <div className="hotel-card-info">
          <h3 className="hotel-name">{shopName}</h3>
          <p className="hotel-location">
            <i className="bi bi-person"></i> {customerName}
          </p>
          <p className="hotel-location" style={{ fontSize: '13px' }}>
            <i className="bi bi-telephone"></i> {order.customerPhone || 'N/A'}
          </p>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            <span><i className="bi bi-people"></i> {order.passengerCount || 0} passengers</span>
            <span style={{ marginLeft: '8px' }}>
              <i className="bi bi-clock"></i> {order.bookingTime || ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {getStatusBadge(order.status)}
            <span style={{ fontSize: '12px', color: '#999' }}>
              <i className="bi bi-calendar3"></i> {order.bookingDate || 'N/A'}
            </span>
          </div>
          {order.note && (
            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              <i className="bi bi-chat-left-text"></i> {order.note}
            </p>
          )}
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
          <button
            className="btn btn-primary"
            onClick={() => { setError(null); fetchOrders(); }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ===== 15. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Restaurant Bookings" onThemeChange={handleThemeChange} />

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
            <button
              onClick={() => setToast({ ...toast, visible: false })}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Summary Boxes */}
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

      {/* Search + Filters */}
      <div className="search-actions-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="search-bar-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by ID, shop or customer..."
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
                background: timeFilter === period ? '#0d6efd' : 'transparent',
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

      {/* Orders Grid */}
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