// components/EBikesOrder.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';

// ============================================================
// 1. API CONFIGURATION (Token key ကို "token" လို့ သေချာပြင်ထားပါ)
// ============================================================
const API_BASE = 'http://130.94.21.185:8000/api/admin/e-bike';

// Login Response မှာ "token" ဆိုတဲ့ key နဲ့ လာတာမို့ "token" ကို ဆွဲပါ
const getAuthToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

// ============================================================
// 2. MAIN COMPONENT
// ============================================================
function EBikesOrder() {
  // ----- Theme -----
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ----- UI States -----
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // ဘယ် Order ကို ပြင်နေလဲ သိရန်
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ----- Theme Handler -----
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

  // ============================================================
  // 3. FETCH ORDERS (GET List)
  // ============================================================
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/booking/list`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      // API က data array ပြန်လား၊ ဒါမှမဟုတ် wrapper ပြန်လား စစ်ဆေးပါ
      const data = result.data || result;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch orders error:', error);
      alert(`Error loading orders: ${error.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ============================================================
  // 4. UPDATE STATUS (APPROVED / CANCELLED)
  // ============================================================
  const updateOrderStatus = async (orderId, newStatus, endpoint) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;
    setUpdatingId(orderId);
    try {
      const response = await fetch(`${API_BASE}/booking/${endpoint}/${orderId}`, {
        method: 'PUT',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update: ${response.status} ${errorText}`);
      }

      // အောင်မြင်ရင် စာရင်းအသစ် ပြန်ဆွဲပါ
      await fetchOrders();
      alert(`Order #${orderId} ${newStatus} successfully`);
    } catch (error) {
      console.error('Update status error:', error);
      alert(`Error updating status: ${error.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================================
  // 5. FILTER ORDERS
  // ============================================================
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().includes(searchTerm) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ebike?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ebike?.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // 6. STATUS BADGE
  // ============================================================
  const getStatusBadge = (status) => {
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

  // ============================================================
  // 7. CARD ACTIONS (Dropdown)
  // ============================================================
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
      updateOrderStatus(order.id, 'approved', 'approved');
    };

    const handleCancel = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      updateOrderStatus(order.id, 'cancelled', 'cancelled');
    };

    // Click outside နှိပ်ရင် dropdown ပိတ်ရန်
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    const isUpdating = updatingId === order.id;

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle} disabled={isUpdating}>
          {isUpdating ? <i className="bi bi-arrow-repeat spin"></i> : <i className="bi bi-three-dots-vertical"></i>}
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="edit-btn" onClick={handleViewDetails}>
            <i className="bi bi-eye"></i> View Details
          </button>

          {/* Pending ဖြစ်မှသာ Confirm ခလုတ်ပြမယ် */}
          {order.status === 'pending' && (
            <button className="edit-btn" onClick={handleApprove}>
              <i className="bi bi-check-circle"></i> Confirm
            </button>
          )}

          {/* Cancelled / Completed မဟုတ်ရင် Cancel ခလုတ်ပြမယ် */}
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <button className="delete-btn" onClick={handleCancel}>
              <i className="bi bi-x-circle"></i> Cancel
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // 8. DETAIL MODAL
  // ============================================================
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
              <div><strong>E-Bike:</strong> {order.ebike?.name}</div>
              <div><strong>Brand:</strong> {order.ebike?.brand}</div>
              <div><strong>Color:</strong> {order.ebike?.color}</div>
              <div><strong>Location:</strong> {order.ebike?.location}</div>
              <div><strong>Battery:</strong> {order.ebike?.battery_capacity}</div>
              <div><strong>Passengers:</strong> {order.ebike?.passenger_count}</div>
              <div><strong>Guest:</strong> {order.user?.name} ({order.user?.email})</div>
              <div><strong>Start Date:</strong> {order.start_date?.slice(0, 10)}</div>
              <div><strong>End Date:</strong> {order.end_date?.slice(0, 10)}</div>
              <div><strong>Total Price:</strong> MMK {order.total_price}</div>
              <div><strong>Status:</strong> {getStatusBadge(order.status)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Special Requests:</strong> {order.special_requests || 'None'}
              </div>
              {order.ebike?.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Description:</strong><br />
                  <span style={{ fontSize: '14px' }}>{order.ebike.description}</span>
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

  // ============================================================
  // 9. ORDER CARD
  // ============================================================
  const OrderCard = ({ order }) => (
    <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
      <div className="hotel-card-image">
        <div className="image-slider">
          <img
            src={order.ebike?.image || '/default-ebike.jpg'}
            alt={order.ebike?.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-ebike.jpg';
            }}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
        <CardActions order={order} />
      </div>
      <div className="hotel-card-info">
        <h3 className="hotel-name">{order.ebike?.name}</h3>
        <p className="hotel-location">
          <i className="bi bi-person"></i> {order.user?.name}
        </p>
        <div className="ebike-details" style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
          <span><i className="bi bi-tag"></i> {order.ebike?.brand} {order.ebike?.code ? `(${order.ebike.code})` : ''}</span>
          <span style={{ marginLeft: '8px' }}><i className="bi bi-palette"></i> {order.ebike?.color}</span>
        </div>
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
          <i className="bi bi-clock"></i> From: {order.start_date?.slice(0, 10) || 'N/A'} &nbsp;|&nbsp;
          To: {order.end_date?.slice(0, 10) || 'N/A'}
        </p>
      </div>
    </div>
  );

  // ============================================================
  // 10. LOADING (Initial)
  // ============================================================
  if (loading && orders.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="E-Bike Orders" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // 11. SUMMARY DATA
  // ============================================================
  const summaryData = [
    { label: 'Total Orders', count: orders.length, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: orders.filter(o => o.status === 'approved' || o.status === 'confirmed').length, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'E-Bikes', count: orders.length, icon: 'bi-bicycle', color: '#17a2b8' },
  ];

  // ============================================================
  // 12. MAIN RENDER
  // ============================================================
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="E-Bike Orders" onThemeChange={handleThemeChange} />

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
              <div
                style={{
                  fontSize: '12px',
                  color: '#bbb',
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
            placeholder="Search by order ID, user or e-bike..."
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

      {/* Orders Grid (3 Columns) */}
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

      {/* Detail Modal */}
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

export default EBikesOrder;