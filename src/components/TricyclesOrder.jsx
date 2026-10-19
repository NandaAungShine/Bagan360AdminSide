// components/TricycleOrder.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

// ===== HELPER FUNCTIONS =====
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

const mapStatus = (backendStatus) => {
  if (backendStatus === 'available') return 'pending';
  return backendStatus;
};

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
      animation: 'triDialogFade 0.18s ease-out',
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
          animation: 'triDialogPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
          animation: 'triDialogPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
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

// ===== MAIN COMPONENT =====
function TricycleOrder() {
  // ===== 0. USER ROLE =====
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();
  const admin = user?.role === 'admin';
  const userId = user?.id;
  const shopId = localStorage.getItem('shopId');

  // ===== 1. THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== 2. UI STATES =====
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // ⭐ NEW: track updating booking
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // ===== 3. USER TRICYCLE IDS + IMAGE MAP =====
  const [userTricycleIds, setUserTricycleIds] = useState([]);
  const tricycleImageMapRef = useRef({});

  // ===== 4. TOAST =====
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

  // ===== 5. CUSTOM DIALOG STATES =====
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

  // ===== 6. API HELPERS =====
  const BACKEND_URL = 'http://130.94.21.185:8000';
  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const handle401Error = () => {
    localStorage.removeItem('token');
    showAlert(
      'warning',
      'Session Expired',
      'Your session has expired. Please login again.'
    );
    setTimeout(() => window.location.href = '/login', 1800);
  };

  // ===== 7. IMAGE HELPERS =====
  const pickString = (obj, keys) => {
    if (!obj || typeof obj !== 'object') return null;
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return null;
  };

  const extractImage = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) {
      for (const v of value) {
        const got = extractImage(v);
        if (got) return got;
      }
      return null;
    }
    if (typeof value === 'string') {
      const s = value.trim();
      return s || null;
    }
    if (typeof value === 'object') {
      return pickString(value, [
        'url', 'path', 'src', 'image', 'image_url',
        'filename', 'file_name', 'file', 'image_path',
      ]);
    }
    return null;
  };

  const buildFullUrl = (raw) => {
    if (!raw) return null;
    const cleaned = String(raw).trim();
    if (!cleaned) return null;
    if (/^https?:\/\//i.test(cleaned)) return cleaned;
    if (cleaned.startsWith('data:')) return cleaned;
    return `${BACKEND_URL}/${cleaned.replace(/^\/+/, '')}`;
  };

  const resolveImageUrl = (item) => {
    if (!item || typeof item !== 'object') return null;

    const containers = [
      item,
      item.tricycle,
      item.thonebane,
      item.thonebane_info,
      item.tricycle_info,
      item.booking,
      item.details,
      item.meta,
    ].filter(Boolean);

    const imageKeys = [
      'image', 'image_url', 'imageUrl', 'img', 'photo',
      'thumbnail', 'thumbnail_url', 'cover', 'cover_image', 'coverImage',
      'tricycle_image', 'tricycleImage', 'tricycle_image_url',
      'thonebane_image', 'thonebaneImage', 'thonebane_image_url',
      'banner', 'banner_image', 'images', 'photos',
    ];

    for (const c of containers) {
      for (const k of imageKeys) {
        if (c[k] !== undefined && c[k] !== null) {
          const got = extractImage(c[k]);
          if (got) return buildFullUrl(got);
        }
      }
    }
    return null;
  };

  // ===== 8. API BASE =====
  const API_BASE = '/api/admin/thonebane';

  // ===== 9. FETCH USER'S TRICYCLES (builds image map) =====
  const fetchUserTricycles = async () => {
    try {
      const response = await fetch(`${API_BASE}/list`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      const result = await response.json();
      console.log('✅ User Tricycles:', result);

      let tricycles = [];
      if (result.data && Array.isArray(result.data)) {
        tricycles = result.data;
      } else if (Array.isArray(result)) {
        tricycles = result;
      } else if (Array.isArray(result.tricycles)) {
        tricycles = result.tricycles;
      }

      // Build image map
      const imgMap = {};
      tricycles.forEach((t) => {
        const id = t.id ?? t.thonebane_id;
        const img = resolveImageUrl(t);
        if (id != null && img) imgMap[String(id)] = img;
      });
      tricycleImageMapRef.current = imgMap;
      console.log('🖼️ Tricycle image map:', imgMap);

      if (admin) {
        setUserTricycleIds([]);
        return;
      }

      const ids = tricycles
        .filter(t => {
          if (shopId && t.shop_id) return String(t.shop_id) === String(shopId);
          if (t.createdBy) return t.createdBy === userId;
          return false;
        })
        .map(t => t.id);

      setUserTricycleIds(ids);
      console.log('🔑 User Tricycle IDs:', ids);
    } catch (err) {
      console.error('❌ Fetch User Tricycles Error:', err);
      showToast('error', 'Failed to load your tricycles.');
    }
  };

  // ===== 10. FETCH BOOKINGS (with SQL error detection, like EBikesOrder) =====
  const fetchBookings = async () => {
    await fetchUserTricycles();

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/booking/list/`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        // Try to parse JSON error body for cleaner message
        let cleanMsg = `Server error ${response.status}`;
        try {
          const parsed = JSON.parse(text);
          cleanMsg = parsed.message || parsed.error || cleanMsg;
        } catch {
          cleanMsg = text.substring(0, 200) || cleanMsg;
        }
        throw new Error(cleanMsg);
      }
      const result = await response.json();
      console.log('✅ Bookings response:', result);

      let rawBookings = [];
      if (Array.isArray(result.booking)) {
        rawBookings = result.booking;
      } else if (Array.isArray(result.data)) {
        rawBookings = result.data;
      } else if (Array.isArray(result)) {
        rawBookings = result;
      } else {
        const possibleKeys = ['bookings', 'items', 'results', 'list'];
        for (const key of possibleKeys) {
          if (Array.isArray(result[key])) {
            rawBookings = result[key];
            break;
          }
        }
      }

      console.log('📦 Raw Bookings Count:', rawBookings.length);
      if (rawBookings[0]) {
        console.log('🔎 First booking keys:', Object.keys(rawBookings[0]));
        console.log('🔎 First booking (full):', rawBookings[0]);
      }

      const imgMap = tricycleImageMapRef.current;

      const mappedBookings = rawBookings.map((item) => {
        const tricycleId = item.thonebane_id ?? item.tricycle_id;

        // Image priority:
        //  1) booking's own / nested image
        //  2) tricycle image from list (matched by id)
        let img = resolveImageUrl(item);
        if (!img && tricycleId != null && imgMap[String(tricycleId)]) {
          img = imgMap[String(tricycleId)];
        }

        return {
          id: item.booking_id || item.id,
          customerName: item.customer_name || 'Guest',
          customerPhone: item.customer_phone || '',
          customerEmail: item.customer_email || '',

          tricycleName: item.thonebane_name || 'Tricycle',
          tricycleId,
          tricycle: {
            id: tricycleId,
            name: item.thonebane_name || 'Tricycle',
            category: item.category_name || item.type || '',
            capacity: item.capacity || '',
            price: item.price || item.total_price || 0,
            price_per_day: item.price_per_day || 0,
            features: item.features || '',
            phone: item.phone || '',
            location: item.location || '',
            shop_name: item.shop_name || '',
          },

          status: mapStatus(item.status),
          startDate: parseDate(item.booking_date || item.start_date),
          endDate: item.end_date ? parseDate(item.end_date) : null,
          totalPrice: item.price || item.total_price || 0,
          notes: item.note || item.special_requests || '',
          shopName: item.shop_name || '',
          location: item.location || '',
          image: img,
          passengerCount: item.passenger_count || 0,

          shop: {
            id: item.shop_id,
            name: item.shop_name || '',
          },

          _raw: item,
        };
      });

      console.log('📦 Mapped Bookings:', mappedBookings);
      setBookings(mappedBookings);
    } catch (err) {
      setError(err.message);
      console.error('❌ Fetch Bookings Error:', err);

      // ⭐ SQL bug detection (same pattern as EBikesOrder)
      const msg = err.message || 'Failed to load bookings.';
      const isSqlBug =
        msg.toLowerCase().includes('unknown column') ||
        msg.toLowerCase().includes('field list');

      if (isSqlBug) {
        showAlert(
          'error',
          'Backend SQL Error',
          `ဒီ error က Frontend မဟုတ်ပါ။\n\n` +
          `Backend Server ရဲ့ SQL Query မှာ column မရှိတာ ဖြစ်ပါတယ်:\n${msg}\n\n` +
          `Backend Developer ကို ပြင်ခိုင်းပါ — booking list query ထဲက 'h.price' column ကို ဖျက်ပါ။`
        );
      } else {
        showAlert('error', 'Unable to Load Bookings', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== 11. INITIAL LOAD =====
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      showAlert('warning', 'Login Required', 'Please login first to view tricycle bookings.');
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 12. THEME =====
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

  // ===== 13. UPDATE STATUS (uses updatingId spinner + ConfirmDialog) =====
  const performUpdateStatus = async (bookingId, action) => {
    setUpdatingId(bookingId);
    try {
      const endpoint = action === 'approved' ? 'approved' : 'cancelled';
      const response = await fetch(`${API_BASE}/booking/${endpoint}/${bookingId}`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        let cleanMsg = `Server error ${response.status}`;
        try {
          const parsed = JSON.parse(text);
          cleanMsg = parsed.message || parsed.error || cleanMsg;
        } catch {
          cleanMsg = text.substring(0, 200) || cleanMsg;
        }
        throw new Error(cleanMsg);
      }
      await fetchBookings();
      showToast(
        'success',
        `Booking #${bookingId} ${action === 'approved' ? 'approved' : 'cancelled'} successfully!`
      );
    } catch (err) {
      console.error(`❌ ${action} Error:`, err);
      showAlert(
        'error',
        action === 'approved' ? 'Approval Failed' : 'Cancellation Failed',
        `Failed to ${action} booking #${bookingId}. ${err.message || ''}`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const updateBookingStatus = (bookingId, action) => {
    const isCancel = action === 'cancelled';
    setConfirmDialog({
      visible: true,
      title: isCancel ? 'Cancel This Booking?' : 'Approve This Booking?',
      message: isCancel
        ? `Booking #${bookingId} will be marked as cancelled. This action cannot be undone.`
        : `Booking #${bookingId} will be approved and confirmed. Do you want to continue?`,
      confirmText: isCancel ? 'Yes, Cancel' : 'Yes, Approve',
      cancelText: 'No, Keep',
      variant: isCancel ? 'danger' : 'question',
      onConfirm: () => {
        closeConfirm();
        performUpdateStatus(bookingId, action);
      },
    });
  };

  // ===== 14. FILTER LOGIC =====
  const roleFilteredBookings = admin
    ? bookings
    : bookings.filter(booking => {
        const tricycleId = String(booking.tricycleId || '');
        return userTricycleIds.some(id => String(id) === tricycleId);
      });

  const filteredBookings = roleFilteredBookings.filter((booking) => {
    const searchStr = `${booking.id} ${booking.customerName || ''} ${booking.tricycleName || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? booking.status === statusFilter : true;

    let matchesTime = true;
    if (timeFilter !== 'all') {
      const date = booking.startDate;
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

  // ===== 15. SUMMARY =====
  const summaryData = [
    { label: 'Total Bookings', count: filteredBookings.length, icon: 'bi-box-seam', color: '#0d6efd' },
    {
      label: 'Pending',
      count: filteredBookings.filter(b =>
        ['pending', 'available'].includes((b.status || '').toLowerCase())
      ).length,
      icon: 'bi-clock-history',
      color: '#ffc107',
    },
    {
      label: 'Approved',
      count: filteredBookings.filter(b =>
        ['approved', 'confirmed', 'completed'].includes((b.status || '').toLowerCase())
      ).length,
      icon: 'bi-check-circle',
      color: '#198754',
    },
    {
      label: 'Cancelled',
      count: filteredBookings.filter(b => (b.status || '').toLowerCase() === 'cancelled').length,
      icon: 'bi-x-circle',
      color: '#dc3545',
    },
    {
      label: 'Tricycles',
      count: new Set(filteredBookings.map(b => b.tricycle?.id || b.tricycleId)).size,
      icon: 'bi-bicycle',
      color: '#6f42c1',
    },
  ];

  // ===== 16. STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      available: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      approved: { label: 'Approved', color: '#0d6efd', bg: '#cfe2ff' },
      confirmed: { label: 'Confirmed', color: '#0d6efd', bg: '#cfe2ff' },
      completed: { label: 'Completed', color: '#198754', bg: '#d1e7dd' },
      cancelled: { label: 'Cancelled', color: '#dc3545', bg: '#f8d7da' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status || 'Unknown', color: '#6c757d', bg: '#e9ecef' };
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

  // ===== 17. CARD ACTIONS (same pattern as EBikesOrder) =====
  const CardActions = ({ booking }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleViewDetails = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      setSelectedBooking(booking);
      setShowDetailModal(true);
    };

    const handleApprove = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      updateBookingStatus(booking.id, 'approved');
    };

    const handleCancel = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      updateBookingStatus(booking.id, 'cancelled');
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

    const isUpdating = updatingId === booking.id;
    const isApproved = ['approved', 'confirmed', 'completed'].includes(booking.status?.toLowerCase());
    const isCancelled = booking.status?.toLowerCase() === 'cancelled';
    const isPending = ['pending', 'available'].includes(booking.status?.toLowerCase());

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle} disabled={isUpdating}>
          {isUpdating
            ? <i className="bi bi-arrow-repeat spin"></i>
            : <i className="bi bi-three-dots-vertical"></i>}
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

  // ===== 18. DETAIL MODAL (richer grid, like EBikesOrder) =====
  const DetailModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const formatDate = (date) => {
      if (!date) return 'N/A';
      if (typeof date === 'string') return new Date(date).toLocaleDateString();
      if (date instanceof Date) return date.toLocaleDateString();
      return 'N/A';
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Booking #{booking.id}</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {booking.image && (
              <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden' }}>
                <img
                  src={booking.image}
                  alt={booking.tricycleName}
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Tricycle:</strong> {booking.tricycle?.name || booking.tricycleName || 'N/A'}</div>
              <div><strong>Category:</strong> {booking.tricycle?.category || 'N/A'}</div>
              <div><strong>Capacity:</strong> {booking.tricycle?.capacity || 'N/A'}</div>
              <div><strong>Location:</strong> {booking.tricycle?.location || booking.location || 'N/A'}</div>
              <div><strong>Phone:</strong> {booking.tricycle?.phone || 'N/A'}</div>
              <div><strong>Passengers:</strong> {booking.passengerCount || 0}</div>
              <div><strong>Customer:</strong> {booking.customerName || 'Guest'}</div>
              <div><strong>Customer Phone:</strong> {booking.customerPhone || 'N/A'}</div>
              <div><strong>Booking Date:</strong> {formatDate(booking.startDate)}</div>
              <div><strong>End Date:</strong> {booking.endDate ? formatDate(booking.endDate) : 'N/A'}</div>
              <div><strong>Shop:</strong> {booking.shop?.name || booking.shopName || 'N/A'}</div>
              <div><strong>Status:</strong> {getStatusBadge(booking.status)}</div>
              <div><strong>Price:</strong> MMK {booking.tricycle?.price || 0}</div>
              <div><strong>Price / Day:</strong> MMK {booking.tricycle?.price_per_day || 0}</div>
              <div><strong>Total Price:</strong> MMK {booking.totalPrice || 0}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Features:</strong> {booking.tricycle?.features || 'None'}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Note / Special Requests:</strong> {booking.notes || 'None'}
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

  // ===== 19. BOOKING CARD (enriched, like EBikesOrder) =====
  const BookingCard = ({ booking }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const tricycleName = booking.tricycleName || 'Tricycle';
    const customerName = booking.customerName || 'Guest';

    const formatDateDisplay = (date) => {
      if (!date) return 'N/A';
      if (typeof date === 'string') return new Date(date).toLocaleDateString();
      if (date instanceof Date) return date.toLocaleDateString();
      return 'N/A';
    };

    return (
      <div className="hotel-card-vertical" style={{ cursor: 'default' }}>
        <div className="hotel-card-image" style={{ height: '200px', position: 'relative' }}>
          <div
            className="image-slider"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6f42c1 0%, #0d6efd 100%)',
            }}
          >
            {booking.image && !imgFailed ? (
              <img
                src={booking.image}
                alt={tricycleName}
                onError={() => setImgFailed(true)}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              <i className="bi bi-bicycle" style={{ fontSize: '60px', color: '#fff' }}></i>
            )}
          </div>
          <CardActions booking={booking} />
        </div>
        <div className="hotel-card-info">
          <h3 className="hotel-name">{customerName}</h3>
          <p className="hotel-location">
            <i className="bi bi-bicycle"></i> {tricycleName}
          </p>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            <span>
              <i className="bi bi-tag"></i> {booking.tricycle?.category || 'N/A'}
            </span>
            {booking.tricycle?.capacity && (
              <span style={{ marginLeft: '8px' }}>
                <i className="bi bi-people"></i> {booking.tricycle.capacity}
              </span>
            )}
          </div>
          <p className="hotel-price">
            Total: <span>MMK {booking.totalPrice || 0}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {getStatusBadge(booking.status)}
            <span style={{ fontSize: '12px', color: '#999' }}>
              <i className="bi bi-calendar3"></i> {formatDateDisplay(booking.startDate)}
            </span>
          </div>
          {booking.location && (
            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              <i className="bi bi-geo-alt"></i> {booking.location}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ===== 20. LOADING / ERROR =====
  if (loading && bookings.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Tricycle Bookings" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Tricycle Bookings" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '48px' }}></i>
          <p style={{ marginTop: '12px' }}>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => { setError(null); fetchBookings(); }}
          >
            Retry
          </button>
        </div>
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

  // ===== 21. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Dialog animations + spinner keyframes */}
      <style>{`
        @keyframes triDialogFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes triDialogPop {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);       opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>

      <Header title="Tricycle Bookings" onThemeChange={handleThemeChange} />

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
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
              <div style={{ fontSize: '12px', color: '#bbb', fontWeight: '500' }}>{item.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>{item.count}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="search-actions-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="search-bar-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by ID, customer or tricycle..."
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
            <option value="completed">Completed</option>
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

      <div className="hotels-two-columns">
        <div className="hotels-cards-column" style={{ gridColumn: '1 / -1' }}>
          <div className="hotels-scroll-area">
            <div
              className="hotels-grid-3cols"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}
            >
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
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
          booking={selectedBooking}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* CUSTOM CONFIRM DIALOG */}
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

      {/* CUSTOM ALERT DIALOG */}
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

export default TricycleOrder;