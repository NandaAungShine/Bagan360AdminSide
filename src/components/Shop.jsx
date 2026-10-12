// components/Shop.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

const API_BASE = 'http://130.94.21.185:8000';

// ===== TYPE CONFIG (single source of truth) =====
// Normalize API variants (e_bike / ebike / e-bike) to a canonical key
const normalizeType = (type) => {
  if (!type) return '';
  const t = String(type).toLowerCase().replace(/[-\s]/g, '_');
  if (t === 'ebike' || t === 'e_bike' || t === 'e_bikes') return 'e_bike';
  if (t === 'horse_cart' || t === 'horsecart') return 'horsecart';
  return t;
};

const TYPE_CONFIG = {
  hotel:      { label: 'Hotel',      color: '#0d6efd', bg: '#cfe2ff', icon: 'bi-building' },
  restaurant: { label: 'Restaurant', color: '#d63384', bg: '#f5d4e1', icon: 'bi-egg-fried' },
  thonebane:  { label: 'Thonebane',  color: '#17a2b8', bg: '#cff4fc', icon: 'bi-shop' },
  car:        { label: 'Car',        color: '#fd7e14', bg: '#ffe5d0', icon: 'bi-car-front' },
  e_bike:     { label: 'E-Bike',     color: '#198754', bg: '#d1e7dd', icon: 'bi-bicycle' },
  balloon:    { label: 'Balloon',    color: '#dc3545', bg: '#f8d7da', icon: 'bi-balloon' },
  horsecart:  { label: 'Horse Cart', color: '#6f42c1', bg: '#e2d9f3', icon: 'bi-truck' },
};

function Shop() {
  // ===== 1. THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== 2. UI STATES =====
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortById, setSortById] = useState('newest');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestForEdit, setSelectedRequestForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ===== 3. TOAST & CONFIRM =====
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, message: '', onConfirm: null });

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ===== 4. THEME HANDLER =====
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
  }, [isDarkMode]);

  // ===== 5. AUTH HELPERS =====
  const getToken = () => localStorage.getItem('token') || localStorage.getItem('access_token');

  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');
      if (userStr) return JSON.parse(userStr);
    } catch (e) {}
    return null;
  };

  const handle401Error = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => window.location.href = '/login', 1500);
  };

  // ===== 6. INIT AUTH =====
  const initAuth = () => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      setIsLoggedIn(true);
      setUserRole(user.role || 'admin');
      fetchRequests();
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
    // eslint-disable-next-line
  }, []);

  // ===== 7. MAP API ITEM -> UI ITEM =====
  const mapApiItem = (item) => ({
    id: item.id,
    user_id: item.user_id,
    type: normalizeType(item.type),
    type_raw: item.type,
    shop_name: item.shop_name || 'N/A',
    shop_address: item.shop_address || 'N/A',
    location: item.location || 'N/A',
    shop_phone: item.shop_phone || 'N/A',
    nrc: item.nrc || 'N/A',
    status: item.status || 'pending',

    // ===== Email & owner info =====
    email: item.email || item.user_email || item.owner_email || 'N/A',
    owner_name: item.owner_name || item.username || item.fullName || 'N/A',

    // Extra compatibility fields
    image: item.image || null,
    description: '',
    created_at: item.created_at || null
  });

  // ===== 8. FETCH REQUESTS =====
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setIsLoggedIn(false);
        throw new Error('No token found');
      }

      const response = await fetch(`${API_BASE}/auth/shop/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handle401Error();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Shop API Response:', result);

      let shopData = [];
      if (result && result.success && Array.isArray(result.data)) {
        shopData = result.data;
      } else if (Array.isArray(result)) {
        shopData = result;
      } else if (result && Array.isArray(result.data)) {
        shopData = result.data;
      } else {
        throw new Error('Unexpected API response format');
      }

      const mapped = shopData.map(mapApiItem);

      // ===== Enrich emails from users list if missing =====
      const needEmails = mapped.some(s => !s.email || s.email === 'N/A');
      if (needEmails) {
        try {
          const uRes = await fetch(`${API_BASE}/auth/user/list`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (uRes.ok) {
            const uJson = await uRes.json();
            const userArr = Array.isArray(uJson)
              ? uJson
              : (uJson && Array.isArray(uJson.data))
                ? uJson.data
                : (uJson && Array.isArray(uJson.users))
                  ? uJson.users
                  : [];

            const emailMap = {};
            const nameMap = {};
            userArr.forEach(u => {
              const uid = u.id || u.userId;
              if (uid != null) {
                emailMap[uid] = u.email || 'N/A';
                nameMap[uid] = u.username || u.fullName || u.name || 'N/A';
              }
            });

            mapped.forEach(s => {
              if ((!s.email || s.email === 'N/A') && emailMap[s.user_id]) {
                s.email = emailMap[s.user_id];
              }
              if ((!s.owner_name || s.owner_name === 'N/A') && nameMap[s.user_id]) {
                s.owner_name = nameMap[s.user_id];
              }
            });
          }
        } catch (enrichErr) {
          console.warn('⚠️ Could not enrich emails:', enrichErr);
        }
      }

      setRequests(mapped);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      showToast('error', `Failed to fetch shop data: ${err.message}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== 9. UPDATE STATUS (Approve / Reject) =====
  const performStatusUpdate = async (requestId, newStatus) => {
    const action = newStatus === 'approved' ? 'Approve' : 'Reject';
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const endpoint = newStatus === 'approved'
        ? `${API_BASE}/auth/shop/account/approved/${requestId}`
        : `${API_BASE}/auth/shop/account/cancelled/${requestId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to ${action}: ${response.status} ${text}`);
      }

      const result = await response.json();
      if (result.success) {
        setRequests(prev => prev.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        ));
        showToast('success', `Shop ${action}d successfully!`);
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      console.error('❌ Status update error:', err);
      showToast('error', `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = (requestId, newStatus) => {
    const action = newStatus === 'approved' ? 'Approve' : 'Reject';
    setConfirmDialog({
      visible: true,
      message: `Are you sure you want to ${action} this shop?`,
      onConfirm: () => performStatusUpdate(requestId, newStatus)
    });
  };

  // ===== 10. DELETE =====
  const performDelete = async (id) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE}/auth/shop/account/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to delete: ${response.status} ${text}`);
      }

      const result = await response.json();
      if (result.success) {
        setRequests(prev => prev.filter(req => req.id !== id));
        showToast('success', 'Shop deleted successfully!');
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      showToast('error', `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this shop?',
      onConfirm: () => performDelete(id)
    });
  };

  // ===== 11. EDIT =====
  const handleEdit = (request) => {
    setSelectedRequestForEdit({ ...request });
    setShowEditModal(true);
  };

  const handleConfirmEdit = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_BASE}/auth/shop/account/${selectedRequestForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shop_name: selectedRequestForEdit.shop_name,
          shop_address: selectedRequestForEdit.shop_address,
          location: selectedRequestForEdit.location,
          shop_phone: selectedRequestForEdit.shop_phone,
          nrc: selectedRequestForEdit.nrc,
          type: selectedRequestForEdit.type
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update: ${response.status} ${text}`);
      }

      const result = await response.json();
      if (result.success) {
        setRequests(prev => prev.map(req =>
          req.id === selectedRequestForEdit.id ? { ...selectedRequestForEdit } : req
        ));
        showToast('success', 'Shop updated successfully!');
        setShowEditModal(false);
        setSelectedRequestForEdit(null);
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      console.error('❌ Edit error:', err);
      showToast('error', `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== 12. FILTER & SORT =====
  const getSortedRequests = (list) => {
    let result = [...list];
    if (sortById === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => a.id - b.id);
    }
    return result;
  };

  const filteredRequests = requests.filter(req => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      String(req.id).includes(searchTerm) ||
      String(req.user_id).includes(searchTerm) ||
      (req.shop_name || '').toLowerCase().includes(search) ||
      (req.shop_address || '').toLowerCase().includes(search) ||
      (req.location || '').toLowerCase().includes(search) ||
      (req.email || '').toLowerCase().includes(search) ||
      (req.type || '').toLowerCase().includes(search) ||
      String(req.shop_phone || '').includes(searchTerm);
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchType = filterType === 'all' || req.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const finalSortedRequests = getSortedRequests(filteredRequests);

  // ===== 13. STATS =====
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length,
  };

  // ===== 14. HELPERS =====
  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      approved: { label: 'Approved', color: '#198754', bg: '#d1e7dd' },
      rejected: { label: 'Rejected', color: '#dc3545', bg: '#f8d7da' },
      cancelled: { label: 'Cancelled', color: '#dc3545', bg: '#f8d7da' },
    };
    const s = map[status?.toLowerCase()] || { label: status, color: '#6c757d', bg: '#e9ecef' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: s.color,
        backgroundColor: s.bg,
        border: `1px solid ${s.color}`,
        minWidth: '70px',
        textAlign: 'center'
      }}>
        {s.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const key = normalizeType(type);
    const s = TYPE_CONFIG[key] || { label: type || 'N/A', color: '#6c757d', bg: '#e9ecef' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: s.color,
        backgroundColor: s.bg,
        border: `1px solid ${s.color}`,
        minWidth: '70px',
        textAlign: 'center'
      }}>
        {s.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const key = normalizeType(type);
    return (TYPE_CONFIG[key] && TYPE_CONFIG[key].icon) || 'bi-shop';
  };

  // Shared table cell styles
  const thStyle = {
    textAlign: 'left',
    padding: '12px 16px',
    background: 'var(--header-bg)',
    color: 'var(--text-color)',
    fontWeight: '600',
    fontSize: '13px',
    borderBottom: '2px solid var(--border-color)',
    whiteSpace: 'nowrap'
  };
  const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-color)',
    fontSize: '14px'
  };

  // ===== 15. NOT LOGGED IN =====
  if (!isLoggedIn) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Shop Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
          <i className="bi bi-lock" style={{ fontSize: '48px', color: '#dc3545' }}></i>
          <h2>Please Log In</h2>
          <p>You need to be logged in to manage shops.</p>
          <button
            className="btn btn-primary"
            style={{ padding: '10px 30px', borderRadius: '40px', border: 'none', background: '#0d6efd', color: '#fff' }}
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading && requests.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Shop Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
          <p>Loading shops...</p>
        </div>
      </div>
    );
  }

  // ===== 16. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Shop Management" onThemeChange={handleThemeChange} />

      {/* TOAST */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
          width: '420px',
          maxWidth: '90%',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: toast.type === 'success'
            ? (isDarkMode ? '#1e3a2e' : '#d4edda')
            : toast.type === 'warning'
              ? (isDarkMode ? '#3d3512' : '#fff3cd')
              : (isDarkMode ? '#3e1f1f' : '#f8d7da'),
          color: toast.type === 'success'
            ? (isDarkMode ? '#b7eb8f' : '#155724')
            : toast.type === 'warning'
              ? (isDarkMode ? '#ffe58f' : '#856404')
              : (isDarkMode ? '#ffa39e' : '#721c24'),
          borderLeft: `5px solid ${
            toast.type === 'success'
              ? (isDarkMode ? '#52c41a' : '#28a745')
              : toast.type === 'warning'
                ? (isDarkMode ? '#faad14' : '#ffc107')
                : (isDarkMode ? '#ff4d4f' : '#dc3545')
          }`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
            <button onClick={() => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); setToast({ ...toast, visible: false }); }} style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
            <div style={{ fontSize: '28px' }}>
              {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
              {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{toast.message}</div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG */}
      {confirmDialog.visible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDarkMode ? '#2d2d2d' : '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ color: isDarkMode ? '#eee' : '#333' }}>Confirm Action</h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333' }}>Cancel</button>
              <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, visible: false }); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: 1, minWidth: '120px', background: '#2d2d2d', borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #444' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0d6efd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}><i className="bi bi-box-seam"></i></div>
          <div><h4 style={{ color: '#fff', margin: 0 }}>{stats.total}</h4><p style={{ color: '#bbb', margin: 0, fontSize: '12px' }}>Total Shops</p></div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '120px', background: '#2d2d2d', borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #444' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ffc107', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}><i className="bi bi-clock-history"></i></div>
          <div><h4 style={{ color: '#fff', margin: 0 }}>{stats.pending}</h4><p style={{ color: '#bbb', margin: 0, fontSize: '12px' }}>Pending</p></div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '120px', background: '#2d2d2d', borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #444' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#198754', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}><i className="bi bi-check-circle"></i></div>
          <div><h4 style={{ color: '#fff', margin: 0 }}>{stats.approved}</h4><p style={{ color: '#bbb', margin: 0, fontSize: '12px' }}>Approved</p></div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '120px', background: '#2d2d2d', borderRadius: '12px', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #444' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}><i className="bi bi-x-circle"></i></div>
          <div><h4 style={{ color: '#fff', margin: 0 }}>{stats.rejected}</h4><p style={{ color: '#bbb', margin: 0, fontSize: '12px' }}>Rejected</p></div>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar-wrapper" style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <i className="bi bi-search search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}></i>
          <input
            type="text"
            placeholder="Search by shop name, email, address, location, type..."
            className="search-input-full"
            style={{ width: '100%', padding: '8px 15px 8px 35px', borderRadius: '40px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '0.9rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" style={{ padding: '8px 12px', borderRadius: '40px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '0.9rem', minWidth: '130px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="filter-select" style={{ padding: '8px 12px', borderRadius: '40px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '0.9rem', minWidth: '130px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="hotel">Hotel</option>
          <option value="restaurant">Restaurant</option>
          <option value="thonebane">Thonebane</option>
          <option value="car">Car</option>
          <option value="e_bike">E-Bike</option>
          <option value="balloon">Balloon</option>
          <option value="horsecart">Horse Cart</option>
        </select>
        <select className="filter-select" style={{ padding: '8px 12px', borderRadius: '40px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '0.9rem', minWidth: '130px' }} value={sortById} onChange={(e) => setSortById(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <button
          onClick={fetchRequests}
          className="action-btn"
          title="Refresh"
          style={{ padding: '8px 16px', borderRadius: '40px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          disabled={loading}
        >
          <i className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-arrow-clockwise'}`}></i>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '16px', padding: '0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr>
              <th style={thStyle}>No.</th>
              <th style={thStyle}>Shop</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Address</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finalSortedRequests.length > 0 ? (
              finalSortedRequests.map((req, index) => (
                <tr key={req.id}>
                  <td style={tdStyle}>{index + 1}</td>

                  {/* Shop name + icon */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--icon-bg)', color: 'var(--icon-color)',
                        fontSize: '16px', flexShrink: 0
                      }}>
                        <i className={getTypeIcon(req.type)}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{req.shop_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          User ID: {req.user_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email column */}
                  <td style={tdStyle}>
                    <div style={{ fontSize: '13px' }}>{req.email}</div>
                  </td>

                  <td style={tdStyle}>{getTypeBadge(req.type)}</td>
                  <td style={tdStyle}>{req.shop_phone}</td>
                  <td style={tdStyle}>{getStatusBadge(req.status)}</td>
                  <td style={tdStyle}>{req.shop_address}</td>

                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {req.status === 'pending' && userRole === 'admin' && (
                        <>
                          <button className="action-btn-icon approve" title="Approve" onClick={() => updateRequestStatus(req.id, 'approved')} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', color: '#198754', background: 'rgba(25, 135, 84, 0.1)' }}>
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="action-btn-icon reject" title="Reject" onClick={() => updateRequestStatus(req.id, 'rejected')} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', color: '#dc3545', background: 'rgba(220, 53, 69, 0.1)' }}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                      <button className="action-btn-icon view" title="View Details" onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', color: '#6f42c1', background: 'rgba(111, 66, 193, 0.1)' }}>
                        <i className="bi bi-eye"></i>
                      </button>
                      {userRole === 'admin' && (
                        <>
                          <button className="action-btn-icon edit" title="Edit" onClick={() => handleEdit(req)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', color: '#0d6efd', background: 'rgba(13, 110, 253, 0.1)' }}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="action-btn-icon delete" title="Delete" onClick={() => handleDelete(req.id)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', color: '#dc3545', background: 'rgba(220, 53, 69, 0.1)' }}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                  No shops found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedRequest && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '0', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 10001 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}><i className="bi bi-shop"></i> Shop Details</h2>
              <button className="close-btn" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-color)' }} onClick={() => setShowDetailModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {/* Header block with icon + name + email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--icon-bg)', color: 'var(--icon-color)', fontSize: '28px', flexShrink: 0 }}>
                  <i className={getTypeIcon(selectedRequest.type)}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedRequest.shop_name}</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{selectedRequest.email}</p>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {getStatusBadge(selectedRequest.status)}
                    {getTypeBadge(selectedRequest.type)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><strong>User ID:</strong> {selectedRequest.user_id}</div>
                <div><strong>Owner:</strong> {selectedRequest.owner_name}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Email:</strong> {selectedRequest.email}</div>
                <div><strong>Phone:</strong> {selectedRequest.shop_phone}</div>
                <div><strong>Location:</strong> {selectedRequest.location}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {selectedRequest.shop_address}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>NRC:</strong> {selectedRequest.nrc}</div>
                {selectedRequest.created_at && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}
                  </div>
                )}
                {selectedRequest.image && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Image:</strong><br />
                    <img src={selectedRequest.image} alt="Shop" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginTop: '5px' }} />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="discard-btn" style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer' }} onClick={() => setShowDetailModal(false)}>Close</button>
              {selectedRequest.status === 'pending' && userRole === 'admin' && (
                <>
                  <button className="add-item-btn" style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#198754', color: '#fff', cursor: 'pointer' }} onClick={() => { updateRequestStatus(selectedRequest.id, 'approved'); setShowDetailModal(false); }}>
                    <i className="bi bi-check-circle"></i> Approve
                  </button>
                  <button className="add-item-btn" style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }} onClick={() => { updateRequestStatus(selectedRequest.id, 'rejected'); setShowDetailModal(false); }}>
                    <i className="bi bi-x-circle"></i> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedRequestForEdit && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={() => setShowEditModal(false)}>
          <div className="modal-content" style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '0', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 10001 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}><i className="bi bi-pencil-square"></i> Edit Shop</h2>
              <button className="close-btn" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-color)' }} onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              {/* Read-only info */}
              <div style={{ marginBottom: '15px', padding: '12px', background: 'var(--icon-bg)', borderRadius: '8px', fontSize: '13px' }}>
                <div><strong>User ID:</strong> {selectedRequestForEdit.user_id}</div>
                <div><strong>Email:</strong> {selectedRequestForEdit.email}</div>
              </div>

              <div className="form-group mb-3" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Shop Name</label>
                <input type="text" className="form-control" value={selectedRequestForEdit.shop_name} onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, shop_name: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
              </div>
              <div className="form-group mb-3" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Type</label>
                <select className="form-control" value={selectedRequestForEdit.type} onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, type: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}>
                  <option value="hotel">Hotel</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="thonebane">Thonebane</option>
                  <option value="car">Car</option>
                  <option value="e_bike">E-Bike</option>
                  <option value="balloon">Balloon</option>
                  <option value="horsecart">Horse Cart</option>
                </select>
              </div>
              <div className="form-group mb-3" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Phone</label>
                <input type="text" className="form-control" value={selectedRequestForEdit.shop_phone} onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, shop_phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
              </div>
              <div className="form-group mb-3" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address</label>
                <input type="text" className="form-control" value={selectedRequestForEdit.shop_address} onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, shop_address: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
              </div>
              <div className="form-group mb-3" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Location</label>
                <input type="text" className="form-control" value={selectedRequestForEdit.location || ''} onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, location: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
              </div>
              <div className="form-group mb-3" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>NRC</label>
                <input type="text" className="form-control" value={selectedRequestForEdit.nrc} onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, nrc: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="discard-btn" style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="add-item-btn" style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#0d6efd', color: '#fff', cursor: 'pointer' }} onClick={handleConfirmEdit} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Shop;