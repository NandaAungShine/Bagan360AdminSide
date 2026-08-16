import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Users() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // Sorting State
  const [sortBy, setSortBy] = useState('idDesc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ===== Toast & Confirm States =====
  const [toast, setToast] = useState({
    visible: false,
    type: 'success',
    message: '',
  });
  const toastTimeoutRef = useRef(null);

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    message: '',
    onConfirm: null,
  });

  // ===== View Detail Modal =====
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ===== 1. SAMPLE DATA (fallback) =====
  const sampleUsers = [
    {
      id: 1,
      fullName: 'Aung Ko Lin',
      email: 'aung.kol@example.com',
      phone: '09-123456789',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-03-24 10:30 AM',
      loginCount: 156,
      joinedDate: '2023-01-15',
      lastActiveDays: 0,
      avatar: '👤'
    },
    {
      id: 2,
      fullName: 'Su Su Hlaing',
      email: 'su.hlaing@example.com',
      phone: '09-987654321',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2024-03-23 04:15 PM',
      loginCount: 89,
      joinedDate: '2023-03-20',
      lastActiveDays: 1,
      avatar: '👩'
    },
    {
      id: 3,
      fullName: 'Min Thu Wun',
      email: 'min.thu@example.com',
      phone: '09-456789123',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-03-24 08:45 AM',
      loginCount: 234,
      joinedDate: '2023-06-01',
      lastActiveDays: 0,
      avatar: '🧑'
    },
    {
      id: 4,
      fullName: 'Thida Win',
      email: 'thida.win@example.com',
      phone: '09-234567890',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-03-22 07:20 PM',
      loginCount: 45,
      joinedDate: '2023-08-10',
      lastActiveDays: 2,
      avatar: '👧'
    },
    {
      id: 5,
      fullName: 'Kyaw Zaw',
      email: 'kyaw.zaw@example.com',
      phone: '09-345678901',
      role: 'Agency',
      status: 'Active',
      lastLogin: '2024-02-15 09:30 AM',
      loginCount: 128,
      joinedDate: '2023-02-28',
      lastActiveDays: 38,
      avatar: '👨'
    },
    {
      id: 6,
      fullName: 'Hla Hla Myint',
      email: 'hla.myint@example.com',
      phone: '09-567890123',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-03-23 02:50 PM',
      loginCount: 12,
      joinedDate: '2024-01-05',
      lastActiveDays: 1,
      avatar: '👩'
    },
    {
      id: 7,
      fullName: 'Zaw Min Oo',
      email: 'zaw.min@example.com',
      phone: '09-678901234',
      role: 'User',
      status: 'Banned',
      lastLogin: '2024-02-28 11:20 AM',
      loginCount: 8,
      joinedDate: '2023-11-20',
      lastActiveDays: 25,
      avatar: '👨'
    },
    {
      id: 8,
      fullName: 'May Thazin',
      email: 'may.thazin@example.com',
      phone: '09-789012345',
      role: 'Agency',
      status: 'Active',
      lastLogin: '2024-03-24 09:15 AM',
      loginCount: 95,
      joinedDate: '2024-02-10',
      lastActiveDays: 0,
      avatar: '👧'
    }
  ];

  // ===== 2. STATE =====
  const [users, setUsers] = useState(sampleUsers);

  // ===== 3. API CONFIGURATION =====
  const API_BASE = 'http://130.94.21.185:8000';
  const API_URL = `${API_BASE}/auth/user/list`;

  // ===== 4. FETCH USERS FROM API =====
  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token, keep sample data
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Users API Response:', data);

      // --- Adapt API response to our internal structure ---
      let userList = [];
      if (data.success && Array.isArray(data.data)) {
        userList = data.data;
      } else if (Array.isArray(data)) {
        userList = data;
      } else if (data.users && Array.isArray(data.users)) {
        userList = data.users;
      } else {
        throw new Error('Unexpected API response format');
      }

      // Map fields to match our component's expected structure
      const mappedUsers = userList.map((user) => ({
        id: user.id || user.userId || 0,
        fullName: user.username || user.fullName || user.name || 'Unknown',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        role: user.role || 'User',
        status: user.status || 'Active',
        lastLogin: user.lastLogin || user.lastLoginAt || user.updated_at || 'N/A',
        loginCount: user.loginCount || 0,
        joinedDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : user.joinedDate || new Date().toISOString().split('T')[0],
        lastActiveDays: user.lastActiveDays || 0,
        avatar: user.avatar || (user.image ? '🖼️' : '👤'),
        // Additional fields for detail view
        address: user.address || '',
        township: user.township || '',
        region: user.region || '',
        gender: user.gender || '',
        image: user.image || null,
        created_at: user.created_at || '',
        updated_at: user.updated_at || '',
        password: user.password || '',
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      showToast('error', 'Failed to load users from server. Showing sample data.');
      // Keep sample data (already set)
    }
  };

  // ===== 5. LOAD DATA ON MOUNT =====
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== 6. THEME =====
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

  // ===== 7. FORM HANDLERS (Add User) =====
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'User',
    status: 'Active',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddUser = () => {
    if (formData.fullName && formData.email && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        showToast('warning', 'Passwords do not match!');
        return;
      }

      const newUser = {
        id: users.length + 1,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || '',
        role: formData.role,
        status: 'Active',
        lastLogin: 'Just now',
        loginCount: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        lastActiveDays: 0,
        avatar: '👤',
        address: '',
        township: '',
        region: '',
        gender: '',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUsers([newUser, ...users]);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        role: 'User',
        status: 'Active',
        password: '',
        confirmPassword: ''
      });
      setShowAddUserModal(false);
      showToast('success', 'User added successfully!');
    } else {
      showToast('warning', 'Please fill in all required fields');
    }
  };

  // ===== 8. DELETE & BLOCK/UNBLOCK =====
  const performDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    showToast('success', 'User deleted successfully!');
  };

  const handleDeleteUser = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this user?',
      onConfirm: () => performDeleteUser(id)
    });
  };

  const handleBlockUser = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: user.status === 'Banned' ? 'Active' : 'Banned' } : user
    ));
    showToast('success', 'User status updated successfully!');
  };

  // ===== 9. SORTING & FILTERING =====
  const getSortedUsers = (usersList) => {
    const sorted = [...usersList];
    switch(sortBy) {
      case 'idAsc':
        return sorted.sort((a, b) => a.id - b.id);
      case 'idDesc':
        return sorted.sort((a, b) => b.id - a.id);
      case 'mostActive':
        return sorted.sort((a, b) => b.loginCount - a.loginCount);
      default:
        return sorted;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const sortedUsers = getSortedUsers(filteredUsers);

  // ===== 10. STATISTICS =====
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
  const bannedUsers = users.filter(u => u.status === 'Banned').length;
  const newUsersThisWeek = users.filter(u => {
    const joinDate = new Date(u.joinedDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return joinDate >= weekAgo;
  }).length;
  const onlineNow = users.filter(u => u.lastActiveDays === 0 && u.status === 'Active').length;

  // ===== 11. CHART DATA (static) =====
  const registrationData = [
    { month: 'Jan', registrations: 12, active: 45 },
    { month: 'Feb', registrations: 19, active: 52 },
    { month: 'Mar', registrations: 15, active: 48 },
    { month: 'Apr', registrations: 22, active: 61 },
    { month: 'May', registrations: 28, active: 73 },
    { month: 'Jun', registrations: 32, active: 85 },
    { month: 'Jul', registrations: 35, active: 94 },
    { month: 'Aug', registrations: 42, active: 108 },
    { month: 'Sep', registrations: 38, active: 112 },
    { month: 'Oct', registrations: 45, active: 125 },
    { month: 'Nov', registrations: 52, active: 142 },
    { month: 'Dec', registrations: 58, active: 158 }
  ];

  // ===== 12. BADGE HELPERS =====
  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Admin':
        return 'role-badge admin';
      case 'Manager':
        return 'role-badge manager';
      case 'Agency':
      case 'shop':
        return 'role-badge agency';
      default:
        return 'role-badge user';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active':
        return 'status-badge active';
      case 'Inactive':
        return 'status-badge inactive';
      case 'Banned':
        return 'status-badge banned';
      default:
        return 'status-badge';
    }
  };

  // ===== 13. VIEW DETAIL HANDLER =====
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // ===== 14. DETAIL MODAL =====
  const DetailModal = ({ user, onClose }) => {
    if (!user) return null;

    // Format date helper
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      try {
        return new Date(dateStr).toLocaleString();
      } catch {
        return dateStr;
      }
    };

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
          <div className="modal-header">
            <h2>User Details</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '64px' }}>
                {user.avatar || '👤'}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{user.fullName}</h3>
                <p style={{ margin: 0, color: '#6c757d' }}>{user.email}</p>
                <span className={getStatusBadgeClass(user.status)} style={{ display: 'inline-block', marginTop: '4px' }}>
                  {user.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Role:</strong> <span className={getRoleBadgeClass(user.role)}>{user.role}</span></div>
              <div><strong>Phone:</strong> {user.phone || 'N/A'}</div>
              <div><strong>Gender:</strong> {user.gender || 'N/A'}</div>
              <div><strong>Address:</strong> {user.address || 'N/A'}</div>
              <div><strong>Township:</strong> {user.township || 'N/A'}</div>
              <div><strong>Region:</strong> {user.region || 'N/A'}</div>
              <div><strong>Joined:</strong> {formatDate(user.created_at || user.joinedDate)}</div>
              <div><strong>Last Login:</strong> {user.lastLogin || 'N/A'}</div>
              <div><strong>Login Count:</strong> {user.loginCount || 0}</div>
              <div><strong>Last Active Days:</strong> {user.lastActiveDays || 0}</div>
              <div><strong>Image:</strong> {user.image ? '✅ Has image' : '❌ No image'}</div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="discard-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== 15. RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Users Management" onThemeChange={handleThemeChange} />

      {/* Toast Alert UI */}
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
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: toast.type === 'success' ? (isDarkMode ? '#1e3a2e' : '#d4edda') : toast.type === 'error' ? (isDarkMode ? '#3e1f1f' : '#f8d7da') : toast.type === 'warning' ? (isDarkMode ? '#3d3512' : '#fff3cd') : (isDarkMode ? '#112b3c' : '#d1ecf1'),
          color: toast.type === 'success' ? (isDarkMode ? '#b7eb8f' : '#155724') : toast.type === 'error' ? (isDarkMode ? '#ffa39e' : '#721c24') : toast.type === 'warning' ? (isDarkMode ? '#ffe58f' : '#856404') : (isDarkMode ? '#91d5ff' : '#0c5460'),
          borderLeft: `5px solid ${toast.type === 'success' ? (isDarkMode ? '#52c41a' : '#28a745') : toast.type === 'error' ? (isDarkMode ? '#ff4d4f' : '#dc3545') : toast.type === 'warning' ? (isDarkMode ? '#faad14' : '#ffc107') : (isDarkMode ? '#1890ff' : '#17a2b8')}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
            <button onClick={() => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); setToast({ ...toast, visible: false }); }} style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer', opacity: 0.7, padding: '0 4px' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
            <div style={{ fontSize: '28px' }}>
              {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
              {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
              {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{toast.message}</div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDialog.visible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDarkMode ? '#2d2d2d' : '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: '12px' }}>Confirm Delete</h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333' }}>Cancel</button>
              <button onClick={() => { if(confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, visible: false }); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showDetailModal && (
        <DetailModal
          user={selectedUser}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Statistics Cards Row */}
      <div className="stats-cards-row">
        <div className="stat-card-mini">
          <div className="stat-icon-mini total">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card-mini">
          <div className="stat-icon-mini active">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{activeUsers}</h3>
            <p>Active Users</p>
            <small>{onlineNow} online now</small>
          </div>
        </div>

        <div className="stat-card-mini">
          <div className="stat-icon-mini inactive">
            <i className="bi bi-x-circle-fill"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{inactiveUsers + bannedUsers}</h3>
            <p>Inactive/Banned</p>
          </div>
        </div>

        <div className="stat-card-mini">
          <div className="stat-icon-mini new">
            <i className="bi bi-person-plus-fill"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{newUsersThisWeek}</h3>
            <p>New This Week</p>
          </div>
        </div>

        <div className="stat-card-mini">
          <div className="stat-icon-mini returning">
            <i className="bi bi-star-fill"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{users.filter(u => u.loginCount > 10).length}</h3>
            <p>Returning Users</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-card-simple">
          <h3 className="chart-title-simple">
            <i className="bi bi-graph-up"></i> User Registration Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search user by name, email or phone..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group-simple">
          <select 
            className="filter-select-simple"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
          </select>

          <select 
            className="filter-select-simple"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="User">User</option>
            <option value="Agency">Agency/Shop</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="sort-dropdown-wrapper">
          <button className="sort-btn" onClick={() => setShowSortDropdown(!showSortDropdown)}>
            <i className="bi bi-arrow-down-up"></i> Sort <i className="bi bi-chevron-down"></i>
          </button>
          {showSortDropdown && (
            <div className="sort-dropdown-menu">
              <button onClick={() => { setSortBy('idDesc'); setShowSortDropdown(false); }}>
                <i className="bi bi-sort-down"></i> ID (Newest First)
              </button>
              <button onClick={() => { setSortBy('idAsc'); setShowSortDropdown(false); }}>
                <i className="bi bi-sort-up"></i> ID (Oldest First)
              </button>
              <button onClick={() => { setSortBy('mostActive'); setShowSortDropdown(false); }}>
                <i className="bi bi-star-fill"></i> Most Active
              </button>
            </div>
          )}
        </div>

        <button className="action-btn add-btn" onClick={() => setShowAddUserModal(true)}>
          <i className="bi bi-person-plus-fill"></i> Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <div className="users-table-wrapper">
          <table className="users-data-table">
            <thead>
              <tr>
                <th className="col-no">No.</th>
                <th className="col-profile">Profile</th>
                <th className="col-name">Name</th>
                <th className="col-contact">Email</th>
                <th className="col-role">Role</th>
                <th className="col-status">Status</th>
                <th className="col-joined">Joined</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className="col-no">{index + 1}</td>
                  <td className="col-profile">
                    <div className="avatar-simple">{user.avatar}</div>
                  </td>
                  <td className="col-name">
                    <div className="user-name">{user.fullName}</div>
                  </td>
                  <td className="col-contact">
                    <div className="user-email">{user.email}</div>
                  </td>
                  <td className="col-role">
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="col-status">
                    <span className={getStatusBadgeClass(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="col-joined">{user.joinedDate}</td>
                  <td className="col-actions" style={{ whiteSpace: 'nowrap', minWidth: '80px' }}>
                    <button 
                      className="action-icon view" 
                      title="View Details"
                      onClick={() => handleViewDetails(user)}
                      style={{ width: '32px', height: '32px', padding: 0, flexShrink: 0 }}
                    >
                      <i className="bi bi-eye" style={{ fontSize: '14px', lineHeight: '32px' }}></i>
                    </button>
                    
                    <button 
                      className={`action-icon ${user.status === 'Banned' ? 'unblock' : 'block'}`} 
                      title={user.status === 'Banned' ? 'Unblock' : 'Block'}
                      onClick={() => handleBlockUser(user.id)}
                      style={{ width: '32px', height: '32px', padding: 0, flexShrink: 0 }}
                    >
                      <i className={`bi ${user.status === 'Banned' ? 'bi-unlock' : 'bi-lock'}`} style={{ fontSize: '14px', lineHeight: '32px' }}></i>
                    </button>
                    
                    <button 
                      className="action-icon delete" 
                      title="Delete"
                      onClick={() => handleDeleteUser(user.id)}
                      style={{ width: '32px', height: '32px', padding: 0, flexShrink: 0 }}
                    >
                      <i className="bi bi-trash" style={{ fontSize: '14px', lineHeight: '32px' }}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedUsers.length === 0 && (
            <div className="empty-table-state">
              <i className="bi bi-people"></i>
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setShowAddUserModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Agency">Agency/Shop</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowAddUserModal(false)}>
                Cancel
              </button>
              <button className="add-item-btn" onClick={handleAddUser}>
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;