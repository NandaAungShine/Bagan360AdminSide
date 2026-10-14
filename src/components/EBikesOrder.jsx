// components/EBikesOrder.jsx
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

// ===== CUSTOM DIALOG STYLES =====
const DIALOG_VARIANTS = {
  warning:  { color: '#f0ad4e', icon: 'bi-exclamation-triangle-fill', bg: '#fff6e3' },
  danger:   { color: '#dc3545', icon: 'bi-x-octagon-fill',            bg: '#fdecec' },
  info:     { color: '#0d6efd', icon: 'bi-info-circle-fill',          bg: '#e7f1ff' },
  success:  { color: '#198754', icon: 'bi-check-circle-fill',         bg: '#e7f7ee' },
  question: { color: '#6f42c1', icon: 'bi-question-circle-fill',      bg: '#f1ebff' },
  error:    { color: '#dc3545', icon: 'bi-exclamation-octagon-fill',  bg: '#fdecec' },
};

// ===== DIALOG SHELL =====
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
      animation: 'ebikeDialogFade 0.18s ease-out',
    }}
  >
    {children}
  </div>
);

// ===== CONFIRM DIALOG =====
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
          animation: 'ebikeDialogPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
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

// ===== ALERT DIALOG =====
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
          animation: 'ebikeDialogPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
function EBikesOrder() {
  // ===== User & Shop =====
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
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);

  // ===== 3. E-Bike Data for Filtering + Image Lookup =====
  const [eBikes, setEBikes] = useState([]);
  const [myEBikeIds, setMyEBikeIds] = useState([]);
  const ebikeImageMapRef = useRef({}); // id → image url

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

  // ===== 4b. CUSTOM DIALOG STATE =====
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

  // ===== 5. API HELPERS =====
  const BACKEND_URL = 'http://130.94.21.185:8000';
  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  });

  const handle401Error = () => {
    localStorage.removeItem('token');
    showAlert('warning', 'Session Expired', 'Your session has expired. Please login again.');
    setTimeout(() => window.location.href = '/login', 1500);
  };

  const API_BASE = '/api/admin/e-bike';

  // ===== 5b. IMAGE HELPERS =====
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
      item.ebike,
      item.e_bike,
      item.bike,
      item.ebike_info,
      item.booking,
      item.details,
      item.meta,
    ].filter(Boolean);

    const imageKeys = [
      'image',
      'image_url',
      'imageUrl',
      'img',
      'photo',
      'thumbnail',
      'thumbnail_url',
      'cover',
      'cover_image',
      'coverImage',
      'ebike_image',
      'ebikeImage',
      'ebike_image_url',
      'e_bike_image',
      'bike_image',
      'bikeImage',
      'images',
      'photos',
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

  // ===== 6. FETCH E-BIKES (builds image map too) =====
  const fetchEBikes = async () => {
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
      console.log('✅ E-Bikes response:', result);

      const list = result.data || result || [];
      setEBikes(list);

      // Build image map: id → resolved image url
      const imgMap = {};
      list.forEach((e) => {
        const id = e.id ?? e.e_bike_id;
        const img = resolveImageUrl(e);
        if (id != null && img) imgMap[String(id)] = img;
      });
      ebikeImageMapRef.current = imgMap;
      console.log('🖼️ E-Bike image map:', imgMap);

      // Filter e-bikes by userId OR shop_id
      if (!admin) {
        const myIds = list
          .filter(e => e.createdBy === userId || e.shop_id === parseInt(shopId))
          .map(e => e.id);
        setMyEBikeIds(myIds);
        console.log('🔑 My e-bike IDs:', myIds);
      } else {
        const allIds = list.map(e => e.id);
        setMyEBikeIds(allIds);
      }
    } catch (err) {
      console.error('❌ Fetch E-Bikes Error:', err);
      showToast('error', 'Failed to load e-bikes for filtering.');
    }
  };

  // ===== 7. FETCH ORDERS =====
  const fetchOrders = async () => {
    await fetchEBikes();

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/booking/list`, {
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
      console.log('✅ E-Bike Orders response:', result);

      let rawOrders = [];
      if (Array.isArray(result.booking)) {
        rawOrders = result.booking;
      } else if (Array.isArray(result.orders)) {
        rawOrders = result.orders;
      } else if (Array.isArray(result.data)) {
        rawOrders = result.data;
      } else if (Array.isArray(result)) {
        rawOrders = result;
      } else {
        const possibleKeys = ['bookings', 'items', 'results', 'list'];
        for (const key of possibleKeys) {
          if (Array.isArray(result[key])) {
            rawOrders = result[key];
            break;
          }
        }
      }

      if (rawOrders[0]) {
        console.log('🔎 First E-Bike booking keys:', Object.keys(rawOrders[0]));
        console.log('🔎 First E-Bike booking (full):', rawOrders[0]);
      }

      const imgMap = ebikeImageMapRef.current;

      const mappedOrders = rawOrders.map((item) => {
        const bikeId = item.e_bike_id ?? item.ebike_id ?? item.bike_id;

        // Image resolution priority:
        //  1) booking's own / nested image
        //  2) e-bike image from list (matched by id)
        let img = resolveImageUrl(item);
        if (!img && bikeId != null && imgMap[String(bikeId)]) {
          img = imgMap[String(bikeId)];
        }

        return {
          id: item.booking_id || item.id,
          status: item.status || 'pending',
          totalPrice: item.selected_price || item.total_price || item.price || 0,
          startDate: parseDate(item.booking_date || item.start_date),
          endDate: null,
          createdAt: parseDate(item.created_at || item.createdAt),
          specialRequests: item.note || item.special_requests || '',
          passenger_count: item.passenger_count || 0,
          shop_id: item.shop_id,

          user: {
            id: item.user_id,
            name: item.customer_name || 'Guest',
            email: item.customer_email || '',
            phone: item.customer_phone || '',
          },

          ebike: {
            id: bikeId,
            name: item.e_bike_name || 'E-Bike',
            brand: item.brand || '',
            color: item.color || '',
            location: item.location || '',
            battery_capacity: item.battery_capacity || '',
            battery_percentage: item.battery_percentage || 0,
            battery_voltage: item.battery_voltage || '',
            passenger_count: item.bike_passenger_count || 0,
            image: img, // resolved image URL (or null → fallback icon)
            code: item.code || '',
            bike_status: item.bike_status || '',
            helmet: item.helmet || '',
            phone_holder: item.phone_holder || '',
            type_name: item.type_name || '',
            distance: item.distance || '',
          },

          priceDetails: {
            price_id: item.price_id,
            selected_price_type: item.selected_price_type || '',
            start_time: item.start_time || '',
            end_time: item.end_time || '',
          },

          shop: {
            id: item.shop_id,
            name: item.shop_name || '',
          },

          _raw: item,
        };
      });

      console.log('📦 Mapped E-Bike Orders:', mappedOrders);
      setOrders(mappedOrders);
    } catch (err) {
      setError(err.message);
      console.error('❌ Fetch Orders Error:', err);

      // Show custom alert dialog with helpful message
      const msg = err.message || 'Failed to load orders.';
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
        showAlert('error', 'Unable to Load Orders', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      showAlert('warning', 'Login Required', 'Please login first to view E-Bike orders.');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 8. THEME =====
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

  // ===== 9. UPDATE STATUS (Custom ConfirmDialog — no window.confirm) =====
  const updateOrderStatus = (orderId, newStatus, endpoint) => {
    const isCancel = newStatus === 'cancelled';

    setConfirmDialog({
      visible: true,
      title: isCancel ? 'Cancel This Order?' : 'Approve This Order?',
      message: isCancel
        ? `Order #${orderId} will be marked as cancelled. This action cannot be undone.`
        : `Order #${orderId} will be approved and confirmed. Do you want to continue?`,
      confirmText: isCancel ? 'Yes, Cancel' : 'Yes, Approve',
      cancelText: 'No, Keep',
      variant: isCancel ? 'danger' : 'question',
      onConfirm: async () => {
        closeConfirm();
        setUpdatingId(orderId);
        try {
          const response = await fetch(`${API_BASE}/booking/${endpoint}/${orderId}`, {
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

          await fetchOrders();
          showToast('success', `Order #${orderId} ${newStatus} successfully!`);
        } catch (err) {
          console.error(`❌ ${newStatus} Error:`, err);
          showAlert(
            'error',
            isCancel ? 'Cancel Failed' : 'Approval Failed',
            err.message || `Failed to ${newStatus} order #${orderId}.`
          );
        } finally {
          setUpdatingId(null);
        }
      },
    });
  };

  // ===== 10. FILTER LOGIC =====
  const filteredOrders = orders
    .filter((order) => {
      if (admin) return true;
      return order.shop_id === parseInt(shopId) || myEBikeIds.includes(order.ebike?.id);
    })
    .filter((order) => {
      const searchStr = `${order.id} ${order.user?.name || ''} ${order.ebike?.name || ''} ${order.ebike?.brand || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? order.status === statusFilter : true;

      let matchesTime = true;
      if (timeFilter !== 'all') {
        const date = order.startDate || order.createdAt;
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

  // ===== 11. STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
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

  // ===== 12. CARD ACTIONS =====
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
    const isApproved = ['approved', 'confirmed', 'completed'].includes(order.status?.toLowerCase());
    const isCancelled = order.status?.toLowerCase() === 'cancelled';
    const isPending = order.status?.toLowerCase() === 'pending';

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle} disabled={isUpdating}>
          {isUpdating ? <i className="bi bi-arrow-repeat spin"></i> : <i className="bi bi-three-dots-vertical"></i>}
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

  // ===== 13. DETAIL MODAL =====
  const DetailModal = ({ order, onClose }) => {
    if (!order) return null;

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
            <h2>Order #{order.id}</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {order.ebike?.image && (
              <div style={{ marginBottom: '16px', borderRadius: '10px', overflow: 'hidden' }}>
                <img
                  src={order.ebike.image}
                  alt={order.ebike.name}
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>E-Bike:</strong> {order.ebike?.name || 'N/A'}</div>
              <div><strong>Brand:</strong> {order.ebike?.brand || 'N/A'}</div>
              <div><strong>Color:</strong> {order.ebike?.color || 'N/A'}</div>
              <div><strong>Location:</strong> {order.ebike?.location || 'N/A'}</div>
              <div><strong>Battery Capacity:</strong> {order.ebike?.battery_capacity || 'N/A'}</div>
              <div><strong>Battery %:</strong> {order.ebike?.battery_percentage || 'N/A'}</div>
              <div><strong>Helmet:</strong> {order.ebike?.helmet || 'N/A'}</div>
              <div><strong>Phone Holder:</strong> {order.ebike?.phone_holder || 'N/A'}</div>
              <div><strong>Type:</strong> {order.ebike?.type_name || 'N/A'}</div>
              <div><strong>Distance:</strong> {order.ebike?.distance || 'N/A'}</div>
              <div><strong>Customer:</strong> {order.user?.name || 'Guest'}</div>
              <div><strong>Phone:</strong> {order.user?.phone || 'N/A'}</div>
              <div><strong>Passengers:</strong> {order.passenger_count || 0}</div>
              <div><strong>Booking Date:</strong> {formatDate(order.startDate)}</div>
              <div><strong>Start Time:</strong> {order.priceDetails?.start_time || 'N/A'}</div>
              <div><strong>End Time:</strong> {order.priceDetails?.end_time || 'N/A'}</div>
              <div><strong>Price Type:</strong> {order.priceDetails?.selected_price_type || 'N/A'}</div>
              <div><strong>Total Price:</strong> MMK {order.totalPrice || 0}</div>
              <div><strong>Status:</strong> {getStatusBadge(order.status)}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Note / Special Requests:</strong> {order.specialRequests || 'None'}
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

  // ===== 14. ORDER CARD =====
  const OrderCard = ({ order }) => {
    const [imgFailed, setImgFailed] = useState(false);

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
              background: 'linear-gradient(135deg, #17a2b8 0%, #0d6efd 100%)',
            }}
          >
            {order.ebike?.image && !imgFailed ? (
              <img
                src={order.ebike.image}
                alt={order.ebike?.name || 'E-Bike'}
                onError={() => setImgFailed(true)}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              <i className="bi bi-bicycle" style={{ fontSize: '60px', color: '#fff' }}></i>
            )}
          </div>
          <CardActions order={order} />
        </div>
        <div className="hotel-card-info">
          <h3 className="hotel-name">{order.ebike?.name || 'E-Bike'}</h3>
          <p className="hotel-location">
            <i className="bi bi-person"></i> {order.user?.name || 'Guest'}
          </p>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            <span><i className="bi bi-tag"></i> {order.ebike?.brand || ''} {order.ebike?.code ? `(${order.ebike.code})` : ''}</span>
            <span style={{ marginLeft: '8px' }}><i className="bi bi-palette"></i> {order.ebike?.color || ''}</span>
          </div>
          <p className="hotel-price">
            Total: <span>MMK {order.totalPrice || 0}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {getStatusBadge(order.status)}
            <span style={{ fontSize: '12px', color: '#999' }}>
              <i className="bi bi-calendar3"></i> {formatDateDisplay(order.startDate)}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
            <i className="bi bi-clock"></i> {order.priceDetails?.start_time || ''} - {order.priceDetails?.end_time || ''}
          </p>
        </div>
      </div>
    );
  };

  // ===== 15. LOADING / ERROR =====
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

  if (error && orders.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="E-Bike Orders" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '48px' }}></i>
          <p style={{ marginTop: '12px' }}>{error}</p>
          <button className="btn btn-primary" onClick={() => { setError(null); fetchOrders(); }}>Retry</button>
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

  // ===== 16. SUMMARY DATA =====
  const summaryData = [
    { label: 'Total Orders', count: orders.length, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: orders.filter(o => ['approved', 'confirmed', 'completed'].includes(o.status)).length, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'E-Bikes', count: new Set(orders.map(o => o.ebike?.id || o.ebike?.name)).size || orders.length, icon: 'bi-bicycle', color: '#17a2b8' },
  ];

  // ===== 17. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Dialog animations keyframes */}
      <style>{`
        @keyframes ebikeDialogFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ebikeDialogPop {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to   { transform: scale(1) translateY(0);       opacity: 1; }
        }
      `}</style>

      <Header title="E-Bike Orders" onThemeChange={handleThemeChange} />

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

      <div className="search-actions-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div className="search-bar-wrapper" style={{ flex: 1, minWidth: '200px' }}>
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by ID, customer or e-bike..."
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
                  <p>No orders match the current filters.</p>
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

      {/* ===== CUSTOM CONFIRM DIALOG (replaces window.confirm) ===== */}
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

      {/* ===== CUSTOM ALERT DIALOG (replaces window.alert) ===== */}
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

export default EBikesOrder;