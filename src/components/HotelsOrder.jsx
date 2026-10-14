// components/HotelsOrder.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';

// ============================================================
//  BASE API URL
// ============================================================
const BACKEND_URL = 'http://130.94.21.185:8000';
const API_BASE = `${BACKEND_URL}/api`;

// ============================================================
//  CUSTOM DIALOG VARIANTS
// ============================================================
const DIALOG_VARIANTS = {
  warning:  { color: '#f0ad4e', icon: 'bi-exclamation-triangle-fill', bg: '#fff6e3' },
  danger:   { color: '#dc3545', icon: 'bi-x-octagon-fill',            bg: '#fdecec' },
  info:     { color: '#0d6efd', icon: 'bi-info-circle-fill',          bg: '#e7f1ff' },
  success:  { color: '#198754', icon: 'bi-check-circle-fill',         bg: '#e7f7ee' },
  question: { color: '#6f42c1', icon: 'bi-question-circle-fill',      bg: '#f1ebff' },
  error:    { color: '#dc3545', icon: 'bi-exclamation-octagon-fill',  bg: '#fdecec' },
};

const DialogShell = ({ children, onBackdropClick }) => (
  <div
    onMouseDown={(e) => { if (e.target === e.currentTarget && onBackdropClick) onBackdropClick(); }}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(3px)',
      WebkitBackdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      animation: 'hotelDialogFade 0.18s ease-out',
    }}
  >
    {children}
  </div>
);

const ConfirmDialog = ({
  open, title, message,
  confirmText = 'Confirm', cancelText = 'Cancel',
  variant = 'warning', onConfirm, onCancel,
}) => {
  if (!open) return null;
  const v = DIALOG_VARIANTS[variant] || DIALOG_VARIANTS.warning;

  return (
    <DialogShell onBackdropClick={onCancel}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'hotelDialogPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ padding: '26px 26px 6px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: v.bg, color: v.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', flexShrink: 0,
            }}
          >
            <i className={`bi ${v.icon}`}></i>
          </div>
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: '#1f2937' }}>
              {title}
            </h3>
            <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6 }}>
              {message}
            </div>
          </div>
        </div>
        <div style={{ padding: '18px 26px 22px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 22px', borderRadius: '10px',
              border: '1px solid #d1d5db', background: '#ffffff',
              color: '#374151', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '10px 22px', borderRadius: '10px',
              border: 'none', background: v.color, color: '#ffffff',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: `0 4px 12px ${v.color}55`, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${v.color}77`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${v.color}55`;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </DialogShell>
  );
};

const AlertDialog = ({
  open, title, message,
  variant = 'info', buttonText = 'OK', onClose,
}) => {
  if (!open) return null;
  const v = DIALOG_VARIANTS[variant] || DIALOG_VARIANTS.info;

  return (
    <DialogShell onBackdropClick={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'hotelDialogPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div style={{ padding: '28px 26px 8px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: v.bg, color: v.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px', margin: '0 auto 14px',
            }}
          >
            <i className={`bi ${v.icon}`}></i>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
            {title}
          </h3>
          <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {message}
          </div>
        </div>
        <div style={{ padding: '18px 26px 24px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 36px', borderRadius: '10px', border: 'none',
              background: v.color, color: '#ffffff', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
              boxShadow: `0 4px 12px ${v.color}55`, transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${v.color}77`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${v.color}55`;
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </DialogShell>
  );
};

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

  // ===== CUSTOM DIALOG STATES =====
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'warning',
    onConfirm: null,
  });

  const [alertDialog, setAlertDialog] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
    buttonText: 'OK',
  });

  const showAlert = (variant, title, message, buttonText = 'OK') => {
    setAlertDialog({ visible: true, title, message, variant, buttonText });
  };
  const closeAlert = () => setAlertDialog(prev => ({ ...prev, visible: false }));
  const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, visible: false, onConfirm: null }));

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
    showAlert(
      'warning',
      'Session Expired',
      'Your session has expired. Please login again.'
    );
    setTimeout(() => (window.location.href = '/login'), 1800);
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
  //  FETCH HOTELS
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
        setMyHotelIds(list.map((h) => h.id));
      } else {
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

      let raw = [];
      if (Array.isArray(result)) raw = result;
      else if (Array.isArray(result.booking)) raw = result.booking;
      else if (Array.isArray(result.data)) raw = result.data;
      else if (Array.isArray(result.orders)) raw = result.orders;

      const mapped = raw.map((item) => {
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
      showAlert('error', 'Unable to Load Orders', 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      showAlert('warning', 'Login Required', 'Please login first to view Hotel orders.');
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
  //  UPDATE ORDER STATUS (Custom Confirm + Alert — no window.confirm)
  // ============================================================
  const performUpdateStatus = async (orderId, newStatus) => {
    let endpoint = '';
    if (newStatus === 'confirmed') {
      endpoint = `${API_BASE}/mobile/hotel/booking/approvd/${orderId}`;
    } else if (newStatus === 'cancelled') {
      endpoint = `${API_BASE}/mobile/hotel/booking/cancelled/${orderId}`;
    } else {
      showAlert('error', 'Unsupported Action', `Unsupported status: ${newStatus}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: getHeaders(true),
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
        throw new Error(data.message || `Server error ${res.status}`);
      }

      showAlert(
        'success',
        'Status Updated',
        data.message ||
          `Order status updated to ${
            newStatus === 'confirmed' ? 'Approved' : 'Cancelled'
          }`
      );
      await fetchOrders();
    } catch (err) {
      console.error('❌ Update Status Error:', err);
      showAlert(
        'error',
        'Update Failed',
        `Failed to update status: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    if (!orderId) {
      showAlert('error', 'Invalid Order', 'Invalid order ID.');
      return;
    }

    // Handle completed locally
    if (newStatus === 'completed') {
      setConfirmDialog({
        visible: true,
        title: 'Mark as Completed?',
        message: 'This will mark the order as completed (local only — no server change).',
        confirmText: 'Yes, Complete',
        cancelText: 'Cancel',
        variant: 'success',
        onConfirm: () => {
          closeConfirm();
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId ? { ...o, status: 'completed' } : o
            )
          );
          showAlert(
            'success',
            'Order Completed',
            'Order marked as completed (local only).'
          );
        },
      });
      return;
    }

    // Handle confirmed / cancelled with API
    const isCancel = newStatus === 'cancelled';
    setConfirmDialog({
      visible: true,
      title: isCancel ? 'Cancel This Order?' : 'Approve This Order?',
      message: `Change status to "${isCancel ? 'Cancelled' : 'Approved'}"?`,
      confirmText: isCancel ? 'Yes, Cancel' : 'Yes, Approve',
      cancelText: 'No, Keep',
      variant: isCancel ? 'danger' : 'question',
      onConfirm: () => {
        closeConfirm();
        performUpdateStatus(orderId, newStatus);
      },
    });
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
      {/* Dialog animations */}
      <style>{`
        @keyframes hotelDialogFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hotelDialogPop {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);       opacity: 1; }
        }
      `}</style>

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

      {/* ===== CUSTOM CONFIRM DIALOG ===== */}
      <ConfirmDialog
        open={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        onConfirm={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); }}
        onCancel={closeConfirm}
      />

      {/* ===== CUSTOM ALERT DIALOG ===== */}
      <AlertDialog
        open={alertDialog.visible}
        title={alertDialog.title}
        message={alertDialog.message}
        variant={alertDialog.variant}
        buttonText={alertDialog.buttonText}
        onClose={closeAlert}
      />
    </div>
  );
}

export default HotelsOrder;