import React, { useState, useEffect } from 'react';
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

  // User registration data for chart
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

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'User',
    status: 'Active',
    password: '',
    confirmPassword: ''
  });

  const [users, setUsers] = useState([
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
  ]);

  // Statistics calculations
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddUser = () => {
    if (formData.fullName && formData.email && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match!');
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
        avatar: '👤'
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
      alert('User added successfully!');
    } else {
      alert('Please fill in all required fields');
    }
  };

  // Sorting Logic
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

  const handleBlockUser = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: user.status === 'Banned' ? 'Active' : 'Banned' } : user
    ));
    alert('User status updated');
  };

  // Filter logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Apply sorting to filtered users
  const sortedUsers = getSortedUsers(filteredUsers);

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Admin':
        return 'role-badge admin';
      case 'Manager':
        return 'role-badge manager';
      case 'Agency':
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

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Users Management" onThemeChange={handleThemeChange} />

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
                <th className="col-contact">Email / Phone</th>
                <th className="col-role">Role</th>
                <th className="col-status">Status</th>
                <th className="col-joined">Joined Date</th>
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
                    <div className="user-phone">{user.phone}</div>
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
                  <td className="col-actions">
                    {/* View Button */}
                    <button className="action-icon view" title="View">
                      <i className="bi bi-eye"></i>
                    </button>
                    
                    {/* Block/Unblock Button */}
                    <button 
                      className={`action-icon ${user.status === 'Banned' ? 'unblock' : 'block'}`} 
                      title={user.status === 'Banned' ? 'Unblock' : 'Block'}
                      onClick={() => handleBlockUser(user.id)}
                    >
                      <i className={`bi ${user.status === 'Banned' ? 'bi-unlock' : 'bi-lock'}`}></i>
                    </button>
                    
                    {/* Delete Button */}
                    <button 
                      className="action-icon delete" 
                      title="Delete"
                      onClick={() => {
                        if (window.confirm('Delete this user?')) {
                          setUsers(users.filter(u => u.id !== user.id));
                        }
                      }}
                    >
                      <i className="bi bi-trash"></i>
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