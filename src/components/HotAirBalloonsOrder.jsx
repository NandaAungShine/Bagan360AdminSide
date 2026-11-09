import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './Header';

/* ============================================================
   AXIOS INSTANCE
   ============================================================ */
const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : 'http://130.94.21.185:8000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ============================================================
   ENDPOINTS & CONSTANTS
   ============================================================ */
const BOOKING_API = '/admin/air_balloon/booking'; // GET /list , PUT /approved/:id , PUT /cancelled/:id
const BACKEND_URL = 'http://130.94.21.185:8000';

/* ============================================================
   HELPERS
   ============================================================ */
const fmt = (n) => Number(n || 0).toLocaleString();

const buildImageUrl = (img) => {
  if (!img || typeof img !== 'string') return null;
  if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('blob:')) return img;
  return `${BACKEND_URL}/${img.replace(/^\/+/, '')}`;
};

const extractList = (resp) => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.data)) return resp.data;
  if (Array.isArray(resp.list)) return resp.list;
  if (Array.isArray(resp.items)) return resp.items;
  if (Array.isArray(resp.bookings)) return resp.bookings;
  if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
  if (resp.data && Array.isArray(resp.data.list)) return resp.data.list;
  return [];
};

const normalizeBooking = (b) => {
  if (!b) return null;
  const user = b.customer || b.user || b.customer_info || b.customerInfo || {};
  const balloon = b.balloon || b.air_balloon || b.airBalloon || {};

  return {
    id: b.id ?? b.booking_id ?? b.bookingId,
    balloon_id: b.balloon_id ?? b.balloonId ?? balloon.id ?? null,
    // ယခင် Air Balloon မှာ name ကို duration ပြောင်းထားတဲ့အတွက် duration ကိုပါ ထည့်သွင်းတွက်ချက်ပေးထားပါတယ်
    balloon_name:
      b.balloon_name ?? b.balloonName ?? b.air_balloon_name ?? b.duration ??
      balloon.duration ?? balloon.name ?? balloon.title ?? 'Hot Air Balloon',
    pilot_name:
      b.pilot_name ?? b.pilotName ?? b.pilot ??
      balloon.pilot_name ?? balloon.pilotName ?? '',
    capacity:
      b.capacity ?? b.max_people ?? b.maxPeople ??
      balloon.capacity ?? balloon.max_people ?? balloon.maxPeople ?? '',
    color: b.color ?? balloon.color ?? '',
    customer_name:
      b.customer_name ?? b.customerName ?? b.user_name ?? b.userName ??
      user.name ?? user.username ?? user.full_name ?? user.fullName ?? '—',
    customer_phone:
      b.customer_phone ?? b.customerPhone ?? b.phone ?? b.phone_number ?? b.phoneNumber ??
      user.phone ?? user.phone_number ?? user.phoneNumber ?? user.mobile ?? '—',
    booking_date:
      b.booking_date ?? b.bookingDate ?? b.date ?? b.created_at ?? b.createdAt ?? '',
    status: (b.status || 'pending').toString().toLowerCase(),
    note: b.note ?? b.notes ?? b.remark ?? '',
    image: buildImageUrl(b.image ?? b.balloon_image ?? b.balloonImage ?? balloon.image),
    passenger: Number(b.passenger ?? b.passengers ?? b.people ?? b.pax ?? 0) || 0,
    selected_price:
      Number(b.selected_price ?? b.selectedPrice ?? b.total_price ?? b.totalPrice ?? b.price ?? b.total ?? 0) || 0,
    raw: b,
  };
};

/* ============================================================
   MODULE-LEVEL COMPONENTS
   ============================================================ */

const BookingImage = ({ src, alt }) => {
  const [error, setError] = useState(false);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #d97757 0%, #8a4a2a 100%)',
        color: 'white',
      }}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ fontSize: 60 }}>🎈</span>
      )}
    </div>
  );
};

const CardActions = ({ booking, onView, onApprove, onCancel, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  return (
    <div className="card-actions-wrapper" ref={wrapRef} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
      <button
        className="card-actions-btn"
        onClick={(e) => { e.stopPropagation(); setIsOpen(v => !v); }}
        style={{
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: 'rgba(0,0,0,0.6)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(4px)',
        }}
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      <div
        className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}
        style={{
          position: 'absolute', top: 40, right: 0,
          background: isDarkMode ? '#2d2d2d' : '#fff',
          borderRadius: 8, boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: 170, padding: '4px 0',
          border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
          display: isOpen ? 'block' : 'none',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); onView(booking); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: 14 }}
        >
          <i className="bi bi-eye" style={{ color: '#0d6efd' }}></i> View Details
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); onApprove(booking); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: 14 }}
        >
          <i className="bi bi-check-circle" style={{ color: '#198754' }}></i> Approve
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(false); onCancel(booking); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: 14 }}
        >
          <i className="bi bi-x-circle" style={{ color: '#dc3545' }}></i> Cancel
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    pending:   { label: 'Pending',   color: '#ffc107', bg: '#fff3cd' },
    approved:  { label: 'Approved',  color: '#0d6efd', bg: '#cfe2ff' },
    cancelled: { label: 'Cancelled', color: '#dc3545', bg: '#f8d7da' },
    canceled:  { label: 'Cancelled', color: '#dc3545', bg: '#f8d7da' },
  };
  const s = map[(status || '').toLowerCase()] || { label: status || '—', color: '#6c757d', bg: '#e9ecef' };
  return (
    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, backgroundColor: s.bg }}>
      {s.label}
    </span>
  );
};

const BookingCard = ({ booking, isDarkMode, onView, onApprove, onCancel }) => (
  <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
    <div className="hotel-card-image" style={{ height: '200px', position: 'relative' }}>
      <div className="image-slider" style={{ height: '100%' }}>
        <BookingImage src={booking.image} alt={booking.balloon_name} />
      </div>
      <CardActions
        booking={booking}
        onView={onView}
        onApprove={onApprove}
        onCancel={onCancel}
        isDarkMode={isDarkMode}
      />
    </div>
    <div className="hotel-card-info">
      <h3 className="hotel-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="bi bi-clock" style={{ color: '#0d6efd', fontSize: 16 }}></i>
        {booking.balloon_name}
      </h3>
      <p className="hotel-location">
        <i className="bi bi-person"></i> {booking.customer_name} &nbsp;
        <span style={{ fontSize: 12, color: '#888' }}>
          <i className="bi bi-phone"></i> {booking.customer_phone}
        </span>
      </p>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
        {booking.pilot_name && <span><i className="bi bi-person-badge"></i> {booking.pilot_name}</span>}
        {booking.capacity && <span style={{ marginLeft: 8 }}><i className="bi bi-people"></i> {booking.capacity} seats</span>}
      </div>
      <p className="hotel-price">
        Total: <span>MMK {fmt(booking.selected_price)}</span>
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <StatusBadge status={booking.status} />
        <span style={{ fontSize: 12, color: '#999' }}>
          <i className="bi bi-calendar3"></i> {booking.booking_date || 'N/A'}
        </span>
      </div>
      <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
        <i className="bi bi-people"></i> {booking.passenger} passenger{booking.passenger !== 1 ? 's' : ''}
      </p>
    </div>
  </div>
);

const DetailModal = ({ booking, onClose, isDarkMode }) => {
  if (!booking) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Booking Details #{booking.id}</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <strong>Duration / Balloon:</strong> 
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6 }}>
                <i className="bi bi-clock" style={{ color: '#0d6efd' }}></i> {booking.balloon_name}
              </span>
            </div>
            <div><strong>Pilot:</strong> {booking.pilot_name || '—'}</div>
            <div><strong>Capacity:</strong> {booking.capacity || '—'} persons</div>
            <div><strong>Color:</strong> {booking.color || '—'}</div>
            <div><strong>Customer:</strong> {booking.customer_name}</div>
            <div><strong>Phone:</strong> {booking.customer_phone}</div>
            <div><strong>Passengers:</strong> {booking.passenger}</div>
            <div><strong>Total Price:</strong> MMK {fmt(booking.selected_price)}</div>
            <div><strong>Status:</strong> <StatusBadge status={booking.status} /></div>
            <div><strong>Booking Date:</strong> {booking.booking_date || 'N/A'}</div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Note:</strong> {booking.note || 'None'}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="discard-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
function HotAirBalloonsOrder() {
  /* -------- THEME -------- */
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  /* -------- STATE -------- */
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actioningId, setActioningId] = useState(null); // per-row busy indicator

  /* -------- TOAST -------- */
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  /* -------- CONFIRM -------- */
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, message: '', onConfirm: null });

  /* ============================================================
     FETCH BOOKINGS
     ============================================================ */
  const fetchBookings = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await api.get(`${BOOKING_API}/list`);
      const list = extractList(data);
      setBookings(list.map(normalizeBooking).filter(Boolean));
    } catch (e) {
      showToast('error', e?.response?.data?.message || e.message || 'Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(); /* eslint-disable-next-line */ }, []);

  /* ============================================================
     UPDATE STATUS (Approve / Cancel)
     ============================================================ */
  const updateBookingStatus = async (bookingId, newStatus) => {
    const endpoint = newStatus === 'approved' ? 'approved' : 'cancelled';
    setActioningId(bookingId);
    try {
      const { data } = await api.put(`${BOOKING_API}/${endpoint}/${bookingId}`);
      if (data && data.success === false) {
        throw new Error(data.message || `Failed to ${newStatus === 'approved' ? 'approve' : 'cancel'}`);
      }
      // optimistic local update
      setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b)));
      showToast('success', data?.message || `Booking ${newStatus} successfully!`);
    } catch (e) {
      showToast('error', e?.response?.data?.message || e.message || 'Failed to update booking.');
      // refetch to sync with backend if failed
      fetchBookings(true);
    } finally {
      setActioningId(null);
    }
  };

  const askApprove = (booking) => {
    if (booking.status !== 'pending') {
      showToast('warning', 'Only pending bookings can be approved.');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to approve this booking?',
      onConfirm: () => updateBookingStatus(booking.id, 'approved'),
    });
  };

  const askCancel = (booking) => {
    if (booking.status !== 'pending') {
      showToast('warning', 'Only pending bookings can be cancelled.');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to cancel this booking?',
      onConfirm: () => updateBookingStatus(booking.id, 'cancelled'),
    });
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  /* ============================================================
     FILTER & SUMMARY
     ============================================================ */
  const filteredBookings = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (b.customer_name || '').toLowerCase().includes(q) ||
      (b.balloon_name || '').toLowerCase().includes(q) ||
      (b.customer_phone || '').toLowerCase().includes(q) ||
      (b.pilot_name || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled' || b.status === 'canceled').length;
  const uniqueBalloons = new Set(bookings.map(b => b.balloon_id).filter(Boolean)).size;

  const summaryData = [
    { label: 'Total Booking', count: totalBookings, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: pendingCount, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: approvedCount, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: cancelledCount, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'Air Balloons', count: uniqueBalloons, icon: 'bi-circle', color: '#6f42c1' },
  ];

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Hot Air Balloon Bookings" onThemeChange={handleThemeChange} />

      {(loading || refreshing) && (
        <div style={{ textAlign: 'center', padding: 8, background: isDarkMode ? '#333' : '#f0f0f0', color: isDarkMode ? '#eee' : '#333', fontSize: 13 }}>
          <i className="bi bi-arrow-repeat"></i>{' '}
          {loading ? 'Loading bookings…' : 'Refreshing…'}
        </div>
      )}

      {/* ==================== TOAST ==================== */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed', top: 20, right: 20, zIndex: 999999,
            padding: '12px 18px', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            backgroundColor:
              toast.type === 'success' ? (isDarkMode ? '#1e3a2e' : '#d4edda') :
              toast.type === 'error' ? (isDarkMode ? '#3e1f1f' : '#f8d7da') :
              (isDarkMode ? '#3d3512' : '#fff3cd'),
            color:
              toast.type === 'success' ? (isDarkMode ? '#b7eb8f' : '#155724') :
              toast.type === 'error' ? (isDarkMode ? '#ffa39e' : '#721c24') :
              (isDarkMode ? '#ffe58f' : '#856404'),
            borderLeft: `5px solid ${
              toast.type === 'success' ? '#52c41a' :
              toast.type === 'error' ? '#ff4d4f' : '#faad14'
            }`,
          }}
        >
          <i className={`bi ${
            toast.type === 'success' ? 'bi-check-circle-fill' :
            toast.type === 'error' ? 'bi-x-circle-fill' : 'bi-exclamation-triangle-fill'
          }`} style={{ fontSize: 18 }}></i>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(t => ({ ...t, visible: false }))}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* ==================== CONFIRM DIALOG ==================== */}
      {confirmDialog.visible && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: isDarkMode ? '#2d2d2d' : '#fff', padding: 24, borderRadius: 12,
            maxWidth: 420, width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: 12 }}>Confirm Action</h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setConfirmDialog({ visible: false, message: '', onConfirm: null })}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog({ visible: false, message: '', onConfirm: null });
                  if (fn) fn();
                }}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#0d6efd', color: '#fff', cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUMMARY BOXES ==================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 15, marginBottom: 20 }}>
        {summaryData.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#2d2d2d', padding: '15px 10px', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '1px solid #555',
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: '50%', backgroundColor: item.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, flexShrink: 0,
            }}>
              <i className={item.icon}></i>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#bbb', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff' }}>{item.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== SEARCH + FILTER ==================== */}
      <div className="search-actions-row" style={{ marginBottom: 20 }}>
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by customer, duration, pilot..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Status:</label>
          <select
            className="search-input-full"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          className="action-btn"
          onClick={() => fetchBookings(true)}
          title="Refresh"
          style={{
            background: isDarkMode ? '#2d2d2d' : '#fff',
            border: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
            color: isDarkMode ? '#eee' : '#333',
            padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
          }}
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      {/* ==================== BOOKING GRID ==================== */}
      <div className="hotels-two-columns">
        <div className="hotels-cards-column" style={{ gridColumn: '1 / -1' }}>
          <div className="hotels-scroll-area">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => (
                  <div key={booking.id} style={{ position: 'relative', opacity: actioningId === booking.id ? 0.5 : 1 }}>
                    <BookingCard
                      booking={booking}
                      isDarkMode={isDarkMode}
                      onView={openDetails}
                      onApprove={askApprove}
                      onCancel={askCancel}
                    />
                    {actioningId === booking.id && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)', borderRadius: 10,
                        color: '#fff', fontSize: 14, fontWeight: 600,
                        pointerEvents: 'none',
                      }}>
                        <i className="bi bi-arrow-repeat" style={{ marginRight: 6 }}></i> Processing…
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 50, color: '#999' }}>
                  <i className="bi bi-inbox" style={{ fontSize: 48, display: 'block', marginBottom: 10 }}></i>
                  <p>{loading ? 'Loading…' : 'No bookings found.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== DETAIL MODAL ==================== */}
      {showDetailModal && (
        <DetailModal
          booking={selectedBooking}
          isDarkMode={isDarkMode}
          onClose={() => { setShowDetailModal(false); setSelectedBooking(null); }}
        />
      )}
    </div>
  );
}

export default HotAirBalloonsOrder;