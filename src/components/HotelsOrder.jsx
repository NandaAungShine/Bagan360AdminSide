// components/HotelsOrder.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';

// ============================================================
//  BASE API URL
// ============================================================
const BACKEND_URL = 'http://130.94.21.185:8000';
const API_BASE = `${BACKEND_URL}/api`;

function HotelsOrder() {
  // ===== User Role =====
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();
  const admin = user?.role === 'admin';
  const userId = user?.id;
  const myShopId = localStorage.getItem('shopId') || user?.shop_id || null;

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [myHotelIds, setMyHotelIds] = useState([]);

  // ===== API Helpers =====
  const getToken = () =>
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    '';

  const getHeaders = (json = true) => {
    const h = {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  };

  const handle401Error = () => {
    localStorage.removeItem('token');
    alert('Session expired. Please login again.');
    setTimeout(() => (window.location.href = '/login'), 1500);
  };

  // ===== Image URL helper =====
  const getImageUrl = (path) => {
    if (!path) return null;
    const p = String(path).trim();
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    if (p.startsWith('/')) return `${BACKEND_URL}${p}`;
    return `${BACKEND_URL}/${p}`;
  };

  // ============================================================
  //  FETCH HOTELS (for ownership filter)
  //  → GET /api/admin/hotel/list
  //  Response: { success, count, data: [ { id, shop_id, shop_name,
  //              shop_address, shop_phone, name, price, facilities,
  //              description, image } ] }
  // ============================================================
  const fetchHotels = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/hotel/list`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (res.status === 401) {
        handle401Error();
        return;
      }
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }
      const result = await res.json();
      const list = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.hotels)
        ? result.hotels
        : [];

      if (admin) {
        // admin — all hotel ids
        setMyHotelIds(list.map((h) => h.id));
      } else {
        // shop — only my shop_id's hotels
        const myIds = list
          .filter(
            (h) =>
              (myShopId && String(h.shop_id) === String(myShopId)) ||
              (userId && String(h.created_by) === String(userId))
          )
          .map((h) => h.id);
        setMyHotelIds(myIds);
      }
    } catch (err) {
      console.error('❌ Fetch Hotels Error:', err);
      setMyHotelIds([]);
    }
  };

  // ============================================================
  //  FETCH ORDERS
  //  → GET /api/admin/hotel/booking/list
  // ============================================================
  const fetchOrders = async () => {
    await fetchHotels();

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/hotel/booking/list`, {
        method: 'GET',
        headers: getHeaders(false),
      });

      if (res.status === 401) {
        handle401Error();
        return;
      }
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const result = await res.json();

      // Response could be: { success, booking: [...] }
      //   or             : { success, data: [...] }
      //   or             : [ ... ]
      let raw = [];
      if (Array.isArray(result)) raw = result;
      else if (Array.isArray(result.booking)) raw = result.booking;
      else if (Array.isArray(result.data)) raw = result.data;
      else if (Array.isArray(result.orders)) raw = result.orders;

      const mapped = raw.map((item) => {
        // Booking items usually carry hotel info + customer info
        const hotelImg =
          item.image ||
          item.hotel_image ||
          item.shop_image ||
          null;

        return {
          id: item.booking_id ?? item.id,
          hotelId:
            item.hotel_id ??
            item.shop_id ??
            item.hotelId ??
            item.hotel?.id ??
            null,

          hotel: {
            id:
              item.hotel_id ??
              item.shop_id ??
              item.hotelId ??
              item.hotel?.id ??
              null,
            name:
              item.hotel_name ||
              item.shop_name ||
              item.hotel?.name ||
              'Hotel',
            image: getImageUrl(hotelImg),
            description:
              item.hotel_description ||
              item.description ||
              item.hotel?.description ||
              '',
            address:
              item.shop_address ||
              item.hotel_address ||
              item.address ||
              item.hotel?.shop_address ||
              '',
            phone:
              item.shop_phone ||
              item.hotel_phone ||
              item.hotel?.shop_phone ||
              '',
            facilities: Array.isArray(item.facilities)
              ? item.facilities
              : Array.isArray(item.hotel?.facilities)
              ? item.hotel.facilities
              : item.facilities
              ? String(item.facilities).split(',').map((s) => s.trim())
              : [],
            price: item.hotel_price ?? item.plan_price ?? item.hotel?.price ?? 0,
          },

          user: {
            name:
              item.customer_name ||
              item.user_name ||
              item.customer?.name ||
              'Guest',
            phone:
              item.customer_phone ||
              item.user_phone ||
              item.customer?.phone ||
              '',
            email: item.customer_email || item.user_email || '',
          },

          plan_name: item.plan_name || item.hotel_plan_name || '',

          total_price:
            item.total_price ??
            item.total_amount ??
            item.price ??
            0,

          status: item.status || 'pending',
          check_in_date:
            item.check_in_date || item.checkin_date || item.check_in || '',
          check_out_date:
            item.check_out_date || item.checkout_date || item.check_out || '',
          special_requests:
            item.customer_request ||
            item.special_request ||
            item.special_requests ||
            '',
          passenger: item.passenger ?? item.guest_count ?? 1,
          created_at: item.created_at || item.createdAt || null,

          _raw: item,
        };
      });

      setOrders(mapped);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Theme =====
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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

  // ============================================================
  //  UPDATE ORDER STATUS
  //  → PUT /api/mobile/hotel/booking/approvd/{id}    (Approve)
  //  → PUT /api/mobile/hotel/booking/cancelled/{id}  (Cancel)
  // ============================================================
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orderId) {
      alert('Invalid order ID.');
      return;
    }

    let endpoint = '';
    if (newStatus === 'confirmed') {
      endpoint = `${API_BASE}/mobile/hotel/booking/approvd/${orderId}`;
    } else if (newStatus === 'cancelled') {
      endpoint = `${API_BASE}/mobile/hotel/booking/cancelled/${orderId}`;
    } else if (newStatus === 'completed') {
      // No API endpoint – update locally only
      if (!window.confirm('Mark this order as completed (local only)?')) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'completed' } : o
        )
      );
      alert('Order marked as completed (local only).');
      return;
    } else {
      alert(`Unsupported status: ${newStatus}`);
      return;
    }

    if (
      !window.confirm(
        `Change status to "${newStatus === 'confirmed' ? 'Approved' : 'Cancelled'}"?`
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: getHeaders(true),
        // If backend requires a JSON body, uncomment:
        // body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401) {
        handle401Error();
        return;
      }

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || `Server error ${res.status}`
        );
      }

      alert(
        data.message ||
          `Order status updated to ${
            newStatus === 'confirmed' ? 'Approved' : 'Cancelled'
          }`
      );
      await fetchOrders();
    } catch (err) {
      console.error('❌ Update Status Error:', err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER =====
  const filteredOrders = orders
    .filter((order) => {
      if (admin) return true;
      if (!myHotelIds.length) return false;
      return myHotelIds.includes(order.hotelId);
    })
    .filter((order) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        String(order.id).toLowerCase().includes(term) ||
        (order.user.name || '').toLowerCase().includes(term) ||
        (order.hotel.name || '').toLowerCase().includes(term);
      const matchesStatus = statusFilter
        ? order.status === statusFilter
        : true;
      return matchesSearch && matchesStatus;
    });

  // ===== STATUS BADGE =====
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const map = {
      pending: { label: 'Pending', color: '#856404', bg: '#fff3cd' },
      approved: { label: 'Approved', color: '#0d6efd', bg: '#cfe2ff' },
      confirmed: { label: 'Confirmed', color: '#0d6efd', bg: '#cfe2ff' },
      completed: { label: 'Completed', color: '#0f5132', bg: '#d1e7dd' },
      cancelled: { label: 'Cancelled', color: '#842029', bg: '#f8d7da' },
      canceled: { label: 'Cancelled', color: '#842029', bg: '#f8d7da' },
    };
    const v = map[s] || {
      label: status || 'Unknown',
      color: '#6c757d',
      bg: '#e9ecef',
    };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: v.color,
          backgroundColor: v.bg,
        }}
      >
        {v.label}
      </span>
    );
  };

  // ===== CARD ACTIONS =====
  const CardActions = ({ order }) => {
    const [isOpen, setIsOpen] = useState(false);

    const close = () => setIsOpen(false);

    useEffect(() => {
      const handler = (e) => {
        if (isOpen && !e.target.closest('.card-actions-wrapper')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }, [isOpen]);

    return (
      <div className="card-actions-wrapper">
        <button
          className="card-actions-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              close();
              setSelectedOrder(order);
              setShowDetailModal(true);
            }}
          >
            <i className="bi bi-eye"></i> View Details
          </button>
          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              close();
              updateOrderStatus(order.id, 'confirmed');
            }}
          >
            <i className="bi bi-check-circle"></i> Approve
          </button>
          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              close();
              updateOrderStatus(order.id, 'completed');
            }}
          >
            <i className="bi bi-check2-circle"></i> Complete
          </button>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              close();
              updateOrderStatus(order.id, 'cancelled');
            }}
          >
            <i className="bi bi-x-circle"></i> Cancel
          </button>
        </div>
      </div>
    );
  };

  // ===== DETAIL MODAL =====
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
          <div
            className="modal-body"
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              <div>
                <strong>Hotel:</strong> {order.hotel.name}
              </div>
              <div>
                <strong>Plan:</strong> {order.plan_name || '—'}
              </div>
              <div>
                <strong>Guest:</strong> {order.user.name}{' '}
                {order.user.phone && `(${order.user.phone})`}
              </div>
              <div>
                <strong>Hotel Phone:</strong> {order.hotel.phone || '—'}
              </div>
              <div>
                <strong>Check-in:</strong> {order.check_in_date || '—'}
              </div>
              <div>
                <strong>Check-out:</strong> {order.check_out_date || '—'}
              </div>
              <div>
                <strong>Passengers:</strong> {order.passenger || 1}
              </div>
              <div>
                <strong>Total Price:</strong> MMK {order.total_price}
              </div>
              <div>
                <strong>Status:</strong> {getStatusBadge(order.status)}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Special Requests:</strong>{' '}
                {order.special_requests || 'None'}
              </div>
              {order.hotel.address && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Address:</strong> {order.hotel.address}
                </div>
              )}
              {order.hotel.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Description:</strong>
                  <br />
                  <span style={{ fontSize: '14px' }}>
                    {order.hotel.description}
                  </span>
                </div>
              )}
              {order.hotel.facilities?.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Facilities:</strong>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginTop: '6px',
                    }}
                  >
                    {order.hotel.facilities.map((f, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isDarkMode ? '#333' : '#eef',
                          color: isDarkMode ? '#ccc' : '#335',
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button className="discard-btn" onClick={onClose}>
              Close
            </button>
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
        {order.plan_name && (
          <p className="hotel-location">
            <i className="bi bi-house-door"></i> {order.plan_name}
          </p>
        )}
        <p className="hotel-location">
          <i className="bi bi-person"></i> {order.user.name}
          {order.user.phone && ` • ${order.user.phone}`}
        </p>
        <p className="hotel-price">
          Total: <span>MMK {order.total_price}</span>
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {getStatusBadge(order.status)}
          {order.created_at && (
            <span style={{ fontSize: '12px', color: '#999' }}>
              <i className="bi bi-calendar3"></i>{' '}
              {String(order.created_at).slice(0, 10)}
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          <i className="bi bi-clock"></i> In: {order.check_in_date || 'N/A'}{' '}
          &nbsp;|&nbsp; Out: {order.check_out_date || 'N/A'}
        </p>
      </div>
    </div>
  );

  // ===== LOADING =====
  if (loading && orders.length === 0) {
    return (
      <div
        className={`dashboard-container ${
          isDarkMode ? 'dark-theme' : 'light-theme'
        }`}
      >
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
    {
      label: 'Total Orders',
      count: orders.length,
      icon: 'bi-box-seam',
      color: '#0d6efd',
    },
    {
      label: 'Pending',
      count: orders.filter((o) => o.status === 'pending').length,
      icon: 'bi-clock-history',
      color: '#ffc107',
    },
    {
      label: 'Approved',
      count: orders.filter(
        (o) => o.status === 'approved' || o.status === 'confirmed'
      ).length,
      icon: 'bi-check-circle',
      color: '#198754',
    },
    {
      label: 'Cancelled',
      count: orders.filter(
        (o) => o.status === 'cancelled' || o.status === 'canceled'
      ).length,
      icon: 'bi-x-circle',
      color: '#dc3545',
    },
    {
      label: 'Hotels',
      count: new Set(orders.map((o) => o.hotelId).filter(Boolean)).size,
      icon: 'bi-building',
      color: '#6f42c1',
    },
  ];

  // ===== MAIN RENDER =====
  return (
    <div
      className={`dashboard-container ${
        isDarkMode ? 'dark-theme' : 'light-theme'
      }`}
    >
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
              border: isDarkMode ? '1px solid #555' : '1px solid #6c757d',
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
        <div
          style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          <label style={{ fontSize: '14px', fontWeight: '500' }}>
            Status:
          </label>
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
        <div
          className="hotels-cards-column"
          style={{ gridColumn: '1 / -1' }}
        >
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
                    style={{
                      fontSize: '48px',
                      display: 'block',
                      marginBottom: '10px',
                    }}
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