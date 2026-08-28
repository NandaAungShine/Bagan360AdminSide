// components/TricycleOrder.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

// ===== HELPER FUNCTIONS =====
// Parse date string like "12-08-2026" (DD-MM-YYYY) to Date object
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

// Map backend status to frontend status
const mapStatus = (backendStatus) => {
  if (backendStatus === 'available') return 'pending';
  return backendStatus;
};

function TricycleOrder() {
  // ===== 0. USER ROLE CHECK =====
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } 
    catch { return null; }
  })();
  const admin = user?.role === 'admin';
  const userId = user?.id;

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
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);
  
  // ===== 2a. USER TRICYCLE IDs =====
  const [userTricycleIds, setUserTricycleIds] = useState([]);

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
  const API_BASE = '/api/admin/thonebane';
  const TRICYCLE_API = '/api/admin/thonebane';

  // ===== 6. FETCH USER'S TRICYCLES (FIXED - using shop_id) =====
  const fetchUserTricycles = async () => {
    if (admin) {
      setUserTricycleIds([]);
      return;
    }
    try {
      const response = await fetch(`${TRICYCLE_API}/list`, {
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
      } else {
        tricycles = [];
      }
      
      const shopId = localStorage.getItem('shopId');
      console.log('🏪 Shop ID from localStorage:', shopId);
      
      // 🔑 Filter tricycles by shop_id (priority) or createdBy (fallback)
      const ids = tricycles
        .filter(t => {
          // Priority: match by shop_id
          if (shopId && t.shop_id) {
            return String(t.shop_id) === String(shopId);
          }
          // Fallback: match by createdBy
          if (t.createdBy) {
            return t.createdBy === userId;
          }
          return false;
        })
        .map(t => t.id);
      
      setUserTricycleIds(ids);
      console.log('🔑 User Tricycle IDs:', ids);
      console.log('👤 User ID:', userId);
      console.log('📊 Admin:', admin);
    } catch (err) {
      console.error('❌ Fetch User Tricycles Error:', err);
      showToast('error', 'Failed to load your tricycles.');
    }
  };

  // ===== 7. FETCH BOOKINGS =====
  const fetchBookings = async () => {
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
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      const result = await response.json();
      console.log('✅ Bookings response:', result);

      // ---- 1. Extract array ----
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

      // ---- 2. Map to component shape ----
      const mappedBookings = rawBookings.map((item) => ({
        id: item.booking_id || item.id,
        customerName: item.customer_name || 'Guest',
        customerPhone: item.customer_phone || '',
        customerEmail: '',
        tricycleName: item.thonebane_name || 'Tricycle',
        tricycleId: item.thonebane_id,
        tricycle: {
          id: item.thonebane_id,
          name: item.thonebane_name || 'Tricycle',
        },
        status: mapStatus(item.status),
        startDate: parseDate(item.booking_date || item.start_date),
        endDate: item.end_date ? parseDate(item.end_date) : null,
        totalPrice: item.price || 0,
        notes: item.note || '',
        shopName: item.shop_name || '',
        location: item.location || '',
        image: item.image || '',
        passengerCount: item.passenger_count || 0,
        _raw: item,
      }));

      console.log('📦 Mapped Bookings:', mappedBookings);
      console.log('📊 Tricycle IDs in bookings:', mappedBookings.map(b => b.tricycleId));

      setBookings(mappedBookings);
    } catch (err) {
      setError(err.message);
      console.error('❌ Fetch Bookings Error:', err);
      showToast('error', 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  // ===== 8. INITIAL DATA LOAD =====
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      showToast('error', 'Please login first');
      return;
    }
    
    const loadData = async () => {
      // First get user's tricycle IDs (if not admin)
      await fetchUserTricycles();
      // Then fetch all bookings
      await fetchBookings();
    };
    
    loadData();
  }, []);

  // ===== 9. THEME HANDLER =====
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

  // ===== 10. UPDATE STATUS =====
  const updateBookingStatus = async (bookingId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;
    setLoading(true);
    try {
      const endpoint = action === 'approved' ? 'approved' : 'cancelled';
      const response = await fetch(`${API_BASE}/booking/${endpoint}/${bookingId}`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      await fetchBookings();
      showToast('success', `Booking ${action} successfully!`);
    } catch (err) {
      console.error(`❌ ${action} Error:`, err);
      showToast('error', `Failed to ${action} booking.`);
    } finally {
      setLoading(false);
    }
  };

  // ===== 11. FILTER LOGIC (FIXED) =====
  // Step 1: Filter by user role (admin sees all, shop sees only their tricycle bookings)
  const roleFilteredBookings = admin 
    ? bookings 
    : bookings.filter(booking => {
        const tricycleId = String(booking.tricycleId || '');
        // Check if this tricycle is in the user's allowed list
        const isAllowed = userTricycleIds.some(id => String(id) === tricycleId);
        if (!isAllowed && tricycleId) {
          console.log('❌ Booking filtered out:', booking.id, 'Tricycle ID:', tricycleId, 'My IDs:', userTricycleIds);
        }
        return isAllowed;
      });

  console.log('📊 Role Filtered Bookings Count:', roleFilteredBookings.length);

  // Step 2: Apply search, status & time filters
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

  console.log('🔍 Final Filtered Bookings Count:', filteredBookings.length);
  console.log('📊 User Tricycle IDs:', userTricycleIds);
  console.log('📊 Total Bookings:', bookings.length);

  // ===== 12. SUMMARY DATA (based on filtered bookings) =====
  const totalBookings = filteredBookings.length;
  const pendingCount = filteredBookings.filter(b => 
    (b.status || '').toLowerCase() === 'pending' || (b.status || '').toLowerCase() === 'available'
  ).length;
  const approvedCount = filteredBookings.filter(b => 
    ['approved', 'confirmed', 'completed'].includes((b.status || '').toLowerCase())
  ).length;
  const cancelledCount = filteredBookings.filter(b => 
    (b.status || '').toLowerCase() === 'cancelled'
  ).length;
  const tricycleCount = new Set(filteredBookings.map(b => b.tricycle?.id || b.tricycleId)).size;

  const summaryData = [
    { label: 'Total Bookings', count: totalBookings, icon: 'bi-box-seam', color: '#0d6efd' },
    { label: 'Pending', count: pendingCount, icon: 'bi-clock-history', color: '#ffc107' },
    { label: 'Approved', count: approvedCount, icon: 'bi-check-circle', color: '#198754' },
    { label: 'Cancelled', count: cancelledCount, icon: 'bi-x-circle', color: '#dc3545' },
    { label: 'Tricycles', count: tricycleCount, icon: 'bi-bicycle', color: '#6f42c1' },
  ];

  // ===== 13. STATUS BADGE =====
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

  // ===== 14. CARD ACTIONS =====
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

    const isApproved = ['approved', 'confirmed', 'completed'].includes(booking.status?.toLowerCase());
    const isCancelled = booking.status?.toLowerCase() === 'cancelled';

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

  // ===== 15. DETAIL MODAL =====
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Customer:</strong> {booking.customerName || 'N/A'}</div>
              <div><strong>Phone:</strong> {booking.customerPhone || 'N/A'}</div>
              <div><strong>Tricycle:</strong> {booking.tricycleName || 'N/A'}</div>
              <div><strong>Status:</strong> {getStatusBadge(booking.status)}</div>
              <div><strong>Start Date:</strong> {formatDate(booking.startDate)}</div>
              <div><strong>End Date:</strong> {booking.endDate ? formatDate(booking.endDate) : 'N/A'}</div>
              <div><strong>Total Price:</strong> MMK {booking.totalPrice || 0}</div>
              <div><strong>Passengers:</strong> {booking.passengerCount || 1}</div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong>Special Requests / Notes:</strong><br />
                <span style={{ fontSize: '14px' }}>{booking.notes || 'None'}</span>
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

  // ===== 16. BOOKING CARD =====
  const BookingCard = ({ booking }) => {
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
        <div className="hotel-card-image" style={{ height : '200px'}}>
          <div className="image-slider" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
            <i className="bi bi-calendar-check" style={{ fontSize: '48px', color: '#888' }}></i>
          </div>
          <CardActions booking={booking} />
        </div>
        <div className="hotel-card-info">
          <h3 className="hotel-name">{customerName}</h3>
          <p className="hotel-location">
            <i className="bi bi-bicycle"></i> {tricycleName}
          </p>
          <p className="hotel-price">
            Total: <span>MMK {booking.totalPrice || 0}</span>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {getStatusBadge(booking.status)}
            <span style={{ fontSize: '12px', color: '#999' }}>
              <i className="bi bi-calendar3"></i> {formatDateDisplay(booking.startDate)}
            </span>
          </div>
          {booking.endDate && (
            <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              <i className="bi bi-clock"></i> {formatDateDisplay(booking.endDate)}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ===== 17. LOADING / ERROR =====
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

  if (error) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Tricycle Bookings" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px', color: '#dc3545' }}>
          <i className="bi bi-exclamation-triangle" style={{ fontSize: '48px' }}></i>
          <p>Error: {error}</p>
          <button className="btn btn-primary" onClick={() => { setError(null); fetchBookings(); }}>Retry</button>
        </div>
      </div>
    );
  }

  // ===== 18. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Tricycle Bookings" onThemeChange={handleThemeChange} />

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

      {/* ===== SUMMARY BOXES (based on filtered bookings) ===== */}
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

      {/* ===== BOOKING CARDS (3 per row) ===== */}
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
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Total Bookings: {bookings.length} | Your Tricycle IDs: {JSON.stringify(userTricycleIds)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && (
        <DetailModal
          booking={selectedBooking}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

export default TricycleOrder;