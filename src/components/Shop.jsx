// components/Shop.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

const API_BASE = 'http://130.94.21.185:8000';

// Sample data (fallback) - updated to match API structure
const SAMPLE_REQUESTS = [
  {
    id: 6,
    user_id: 43,
    type: 'thonebane',
    shop_name: 'Thar Sis',
    shop_address: '163758/B',
    shop_phone: '09763341727',
    nrc: '12 / ဒဂတ (N) 099020',
    image: null,
    status: 'approved'
  },
  {
    id: 5,
    user_id: 36,
    type: 'restaurant',
    shop_name: 'Royal Bagan',
    shop_address: 'Old Bagan, 12 streets',
    shop_phone: '09123456789',
    nrc: '1/TaTaNa(N)123456',
    image: null,
    status: 'approved'
  },
  {
    id: 4,
    user_id: 32,
    type: 'restaurant',
    shop_name: 'let eat ',
    shop_address: 'yangon',
    shop_phone: '09769361178',
    nrc: '4 / ပလဝ (N) 177155',
    image: null,
    status: 'approved'
  },
  {
    id: 3,
    user_id: 31,
    type: 'restaurant',
    shop_name: 'Moe May Moe May',
    shop_address: '157954/B',
    shop_phone: '09763341727',
    nrc: '12 / ဒဂတ (N) 099020',
    image: null,
    status: 'approved'
  },
  {
    id: 2,
    user_id: 15,
    type: 'hotel',
    shop_name: 'Bagan Hotel',
    shop_address: 'Old Bagan, Nyaung U',
    shop_phone: '09988888888',
    nrc: '12/lakana(N)308086',
    image: null,
    status: 'approved'
  },
  {
    id: 1,
    user_id: 14,
    type: 'restaurant',
    shop_name: 'Bagan Hotel',
    shop_address: 'Old Bagan, Nyaung U',
    shop_phone: '09988888888',
    nrc: '12/lakana(N)308086',
    image: null,
    status: 'approved'
  }
];

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

  // ===== 7. FETCH REQUESTS =====
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
      if (result.success && Array.isArray(result.data)) {
        shopData = result.data;
      } else if (Array.isArray(result)) {
        shopData = result;
      } else {
        throw new Error('Unexpected API response format');
      }

      // Map fields to component structure
      const mapped = shopData.map(item => ({
        id: item.id,
        user_id: item.user_id,
        shop_name: item.shop_name || 'N/A',
        type: item.type || 'N/A',
        shop_address: item.shop_address || 'N/A',
        shop_phone: item.shop_phone || 'N/A',
        nrc: item.nrc || 'N/A',
        image: item.image || null,
        status: item.status || 'pending',
        // Fallback fields for compatibility
        owner_name: 'N/A',
        email: 'N/A',
        description: '',
        created_at: null
      }));

      setRequests(mapped);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      showToast('error', 'Failed to fetch shop data. Using sample data.');
      setRequests(SAMPLE_REQUESTS.map(item => ({
        ...item,
        owner_name: 'N/A',
        email: 'N/A',
        description: '',
        created_at: null
      })));
    } finally {
      setLoading(false);
    }
  };

  // ===== 8. UPDATE STATUS (Approve / Reject) =====
  const performStatusUpdate = async (requestId, newStatus) => {
    const action = newStatus === 'approved' ? 'Approve' : 'Reject';
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      // API endpoint - adjust if your backend uses different path
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

  // ===== 9. DELETE =====
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

  // ===== 10. EDIT =====
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

  // ===== 11. FILTER & SORT =====
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
      req.shop_name.toLowerCase().includes(search) ||
      req.shop_address.toLowerCase().includes(search) ||
      req.type.toLowerCase().includes(search) ||
      req.shop_phone.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchType = filterType === 'all' || req.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const finalSortedRequests = getSortedRequests(filteredRequests);

  // ===== 12. STATS =====
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected' || r.status === 'cancelled').length,
  };

  // ===== 13. HELPERS =====
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
    const map = {
      hotel: { color: '#0d6efd', bg: '#cfe2ff' },
      restaurant: { color: '#d63384', bg: '#f5d4e1' },
      thonebane: { color: '#17a2b8', bg: '#cff4fc' },
      car: { color: '#fd7e14', bg: '#ffe5d0' },
      ebike: { color: '#198754', bg: '#d1e7dd' },
      balloon: { color: '#dc3545', bg: '#f8d7da' },
      horsecart: { color: '#6f42c1', bg: '#e2d9f3' },
    };
    const s = map[type?.toLowerCase()] || { color: '#6c757d', bg: '#e9ecef' };
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
        {type}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const map = {
      hotel: 'bi-building',
      restaurant: 'bi-egg-fried',
      thonebane: 'bi-shop',
      car: 'bi-car-front',
      ebike: 'bi-bicycle',
      balloon: 'bi-balloon',
      horsecart: 'bi-truck',
    };
    return map[type?.toLowerCase()] || 'bi-shop';
  };

  // ===== 14. NOT LOGGED IN =====
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

  // ===== 15. MAIN RENDER =====
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
          backgroundColor: toast.type === 'success' ? (isDarkMode ? '#1e3a2e' : '#d4edda') : '#f8d7da',
          color: toast.type === 'success' ? (isDarkMode ? '#b7eb8f' : '#155724') : '#721c24',
          borderLeft: `5px solid ${toast.type === 'success' ? (isDarkMode ? '#52c41a' : '#28a745') : '#dc3545'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
            <button onClick={() => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); setToast({ ...toast, visible: false }); }} style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
            <div style={{ fontSize: '28px' }}>{toast.type === 'success' ? <i className="bi bi-check-circle-fill"></i> : <i className="bi bi-x-circle-fill"></i>}</div>
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
          <input type="text" placeholder="Search by shop name, address, type..." className="search-input-full" style={{ width: '100%', padding: '8px 15px 8px 35px', borderRadius: '40px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '0.9rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
          <option value="ebike">E-Bike</option>
          <option value="balloon">Balloon</option>
          <option value="horsecart">Horse Cart</option>
        </select>
        <select className="filter-select" style={{ padding: '8px 12px', borderRadius: '40px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '0.9rem', minWidth: '130px' }} value={sortById} onChange={(e) => setSortById(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={{ overflowX: 'auto', background: 'var(--card-bg)', borderRadius: '16px', padding: '0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--header-bg)', color: 'var(--text-color)', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid var(--border-color)' }}>#</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--header-bg)', color: 'var(--text-color)', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid var(--border-color)' }}>Shop</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--header-bg)', color: 'var(--text-color)', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid var(--border-color)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--header-bg)', color: 'var(--text-color)', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid var(--border-color)' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--header-bg)', color: 'var(--text-color)', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid var(--border-color)' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--header-bg)', color: 'var(--text-color)', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid var(--border-color)' }}>Address</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--header-bg)', color: 'var(--text-color)', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid var(--border-color)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finalSortedRequests.length > 0 ? (
              finalSortedRequests.map((req, index) => (
                <tr key={req.id}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '14px' }}>{index + 1}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--icon-bg)', color: 'var(--icon-color)', fontSize: '16px', flexShrink: 0 }}>
                        <i className={getTypeIcon(req.type)}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{req.shop_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {req.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '14px' }}>{getTypeBadge(req.type)}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '14px' }}>{req.shop_phone}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '14px' }}>{getStatusBadge(req.status)}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '14px' }}>{req.shop_address}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-color)', fontSize: '14px', textAlign: 'center' }}>
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
                      {(userRole === 'admin') && (
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
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
          <div className="modal-content" style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '0', maxWidth: '35%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 10001 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}><i className="bi bi-shop"></i> Shop Details</h2>
              <button className="close-btn" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-color)' }} onClick={() => setShowDetailModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><strong>Shop Name:</strong> {selectedRequest.shop_name}</div>
                <div><strong>Type:</strong> {getTypeBadge(selectedRequest.type)}</div>
                <div><strong>Phone:</strong> {selectedRequest.shop_phone}</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</div>
                <div style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {selectedRequest.shop_address}</div>
                <div><strong>NRC:</strong> {selectedRequest.nrc}</div>
                <div><strong>User ID:</strong> {selectedRequest.user_id}</div>
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
          <div className="modal-content" style={{ background: 'var(--card-bg)', borderRadius: '24px', padding: '0', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 10001 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}><i className="bi bi-pencil-square"></i> Edit Shop</h2>
              <button className="close-btn" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-color)' }} onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
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
                  <option value="ebike">E-Bike</option>
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