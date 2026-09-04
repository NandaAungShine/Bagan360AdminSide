// components/HotelsOrder.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';

// ============================================================
//  BASE API URL
// ============================================================
const API_BASE = 'http://130.94.21.185:8000/api';
const BACKEND_URL = 'http://130.94.21.185:8000';

function HotelsOrder() {
  // ===== User Role Check =====
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();
  const admin = user?.role === 'admin';
  const userId = user?.id;

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [myHotelIds, setMyHotelIds] = useState([]);

  // ===== API Helpers =====
  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const handle401Error = () => {
    localStorage.removeItem('token');
    alert('Session expired. Please login again.');
    setTimeout(() => window.location.href = '/login', 1500);
  };

  // ===== FETCH HOTELS (to determine ownership) =====
  const fetchHotels = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/hotel/list`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      const result = await response.json();
      console.log('✅ Hotels response:', result);

      const list = result.data || result.hotels || result || [];
      setHotels(list);

      if (!admin) {
        const myIds = list
          .filter(h => h.createdBy === userId)
          .map(h => h.id);
        setMyHotelIds(myIds);
        console.log('🔑 My hotel IDs:', myIds);
      } else {
        const allIds = list.map(h => h.id);
        setMyHotelIds(allIds);
      }
    } catch (err) {
      console.error('❌ Fetch Hotels Error:', err);
    }
  };

  // ===== FETCH ORDERS (ADAPTED TO ACTUAL API) =====
  const fetchOrders = async () => {
    await fetchHotels(); // needed for ownership filter

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/hotel/booking/list`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      const result = await response.json();
      console.log('✅ Orders response:', result);

      // The API returns { success, message, booking: [...] }
      let rawOrders = result.booking || [];
      if (!Array.isArray(rawOrders)) rawOrders = [];

      const mappedOrders = rawOrders.map((item) => ({
        id: item.booking_id,
        hotelId: item.shop_id,          // shop_id is the hotel id
        hotel: {
          id: item.shop_id,
          name: item.hotel_name || item.shop_name || 'Hotel',
          image: item.image ? `${BACKEND_URL}/${item.image}` : '/default-hotel.jpg',
          description: item.description || '',
          location: item.location || '',
          type: item.type || '',
          facilities: item.facilities || '',
        },
        user: {
          name: item.customer_name || 'Guest',
          phone: item.customer_phone || '',
          email: '',   // API doesn't provide email
        },
        total_price: item.price || 0,   // assuming price is total (or per night)
        status: item.status || 'pending',
        check_in_date: item.check_in_date || '',
        check_out_date: item.check_out_date || '',
        special_requests: item.customer_request || '',
        passenger: item.passenger || 1,
        created_at: null,               // API doesn't provide creation date
        _raw: item,
      }));

      setOrders(mappedOrders);
    } catch (err) {
      console.error('❌ Fetch Orders Error:', err);
      alert('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }
    fetchOrders();
  }, []);

  // ===== THEME =====
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

  // ===== UPDATE ORDER STATUS =====
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    let endpoint = '';
    let method = 'PUT';

    if (newStatus === 'confirmed') {
      endpoint = `${API_BASE}/mobile/hotel/booking/approvd/${orderId}`;
    } else if (newStatus === 'cancelled') {
      endpoint = `${API_BASE}/mobile/hotel/booking/cancelled/${orderId}`;
    } else if (newStatus === 'completed') {
      // No API for "completed" – update locally only
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'completed' } : order
        )
      );
      alert('Order marked as completed (local only – no API endpoint).');
      return;
    } else {
      alert(`Unsupported status: ${newStatus}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: getHeaders(),
        // Body may be required if your backend expects JSON; adjust accordingly
        // body: JSON.stringify({ status: newStatus }),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      // Refresh the order list to reflect the change
      await fetchOrders();
      alert(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error('❌ Update Status Error:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER (respects ownership + search + status) =====
  const filteredOrders = orders
    .filter((order) => {
      if (admin) return true;
      return myHotelIds.includes(order.hotelId);
    })
    .filter((order) => {
      const matchesSearch =
        order.id.toString().includes(searchTerm) ||
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.hotel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? order.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });

  // ===== STATUS BADGE (includes "approved" as confirmed) =====
  const getStatusBadge = (status) => {
    // Map API statuses to UI labels
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      approved: { label: 'Confirmed', color: '#0d6efd', bg: '#cfe2ff' },
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

  // ===== CARD ACTIONS =====
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

  // ===== DETAIL MODAL (shows phone instead of email) =====
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
              <div><strong>Hotel:</strong> {order.hotel.name}</div>
              <div><strong>Guest:</strong> {order.user.name} {order.user.phone && `(${order.user.phone})`}</div>
              <div><strong>Check-in:</strong> {order.check_in_date}</div>
              <div><strong>Check-out:</strong> {order.check_out_date}</div>
              <div><strong>Passengers:</strong> {order.passenger || 1}</div>
              <div><strong>Total Price:</strong> MMK {order.total_price}</div>
              <div><strong>Status:</strong> {getStatusBadge(order.status)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Special Requests:</strong> {order.special_requests || 'None'}
              </div>
              {order.hotel.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Hotel Description:</strong><br />
                  <span style={{ fontSize: '14px' }}>{order.hotel.description}</span>
                </div>
              )}
              {order.hotel.location && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Location:</strong> {order.hotel.location}
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

  // ===== ORDER CARD =====
  const OrderCard = ({ order }) => (
    <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
      <div className="hotel-card-image" style={{ height: '200px' }}>
        <div className="image-slider">
          <img
            src={order.hotel.image || '/default-hotel.jpg'}
            alt={order.hotel.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-hotel.jpg';
            }}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
        <CardActions order={order} />
      </div>
      <div className="hotel-card-info">
        <h3 className="hotel-name">{order.hotel.name}</h3>
        <p className="hotel-location">
          <i className="bi bi-person"></i> {order.user.name}
        </p>
        <p className="hotel-price">
          Total: <span>MMK {order.total_price}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {getStatusBadge(order.status)}
          {order.created_at && (
            <span style={{ fontSize: '12px', color: '#999' }}>
              <i className="bi bi-calendar3"></i> {order.created_at?.slice(0, 10) || 'N/A'}
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          <i className="bi bi-clock"></i> Check-in: {order.check_in_date || 'N/A'} &nbsp;|&nbsp;
          Check-out: {order.check_out_date || 'N/A'}
        </p>
      </div>
    </div>
  );

  // ===== LOADING =====
  if (loading && orders.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Hotel Orders" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // ===== SUMMARY =====
  const summaryData = [
    { label: 'Total Orders', count: orders.length, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: orders.filter(o => o.status === 'approved' || o.status === 'confirmed').length, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'Hotels', count: new Set(orders.map(o => o.hotelId)).size, icon: 'bi-building', color: '#6f42c1' },
  ];

  // ===== MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Hotel Orders" onThemeChange={handleThemeChange} />

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
              boxShadow: isDarkMode
                ? '0 2px 8px rgba(0,0,0,0.3)'
                : '0 2px 8px rgba(0,0,0,0.15)',
              border: isDarkMode
                ? '1px solid #555'
                : '1px solid #6c757d',
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
                  color: isDarkMode ? '#bbb' : '#e9ecef',
                  fontWeight: '500',
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by order ID, user or hotel..."
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
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Cards */}
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

export default HotelsOrder;