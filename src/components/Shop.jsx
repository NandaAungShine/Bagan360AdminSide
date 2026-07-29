// components/Shop.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';

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

  // ===== 3. SHOP TYPES =====
  const shopTypes = [
    'Cars',
    'Destinations',
    'E-Bikes',
    'Horse Carts',
    'Hot Air Balloons',
    'Hotels',
    'Restaurants',
    'Tricycles',
  ];

  // ===== 4. SAMPLE DATA (Shop Requests) =====
  const sampleRequests = [
    {
      id: 1,
      shop_name: 'Bagan Golden Hotel',
      owner_name: 'U Kyaw Win',
      email: 'kyawwin@example.com',
      phone: '09-12345678',
      shop_type: 'Hotels',
      address: 'Old Bagan, Near Ananda Temple',
      description: 'Luxury hotel with 50 rooms, pool and spa.',
      status: 'pending',
      created_at: '2026-07-28T10:30:00Z',
      documents: ['business_license.png', 'tax_certificate.jpg', 'hotel_photo.webp'],
    },
    {
      id: 2,
      shop_name: 'Bagan E-Bike Rental',
      owner_name: 'Daw Mya Mya',
      email: 'myamya@example.com',
      phone: '09-87654321',
      shop_type: 'E-Bikes',
      address: 'Nyaung U Market',
      description: 'E-bike rental with 20 bikes, battery charging station.',
      status: 'pending',
      created_at: '2026-07-27T14:20:00Z',
      documents: ['business_license.png'],
    },
    {
      id: 3,
      shop_name: 'Golden Land Restaurant',
      owner_name: 'U Maung Maung',
      email: 'maung@example.com',
      phone: '09-11223344',
      shop_type: 'Restaurants',
      address: 'Main Road, Bagan',
      description: 'Traditional Myanmar cuisine with sunset view.',
      status: 'approved',
      created_at: '2026-07-25T09:15:00Z',
      documents: ['license.jpeg', 'health_certificate.webp'],
    },
    {
      id: 4,
      shop_name: 'Bagan Car Rentals',
      owner_name: 'U Aung Aung',
      email: 'aung@example.com',
      phone: '09-99887766',
      shop_type: 'Cars',
      address: 'Airport Road, Nyaung U',
      description: 'Car rental service with 10 vehicles including SUVs.',
      status: 'rejected',
      created_at: '2026-07-20T16:45:00Z',
      documents: ['license.png'],
    },
    {
      id: 5,
      shop_name: 'Sunrise Hot Air Balloon',
      owner_name: 'U Soe Soe',
      email: 'soe@example.com',
      phone: '09-55443322',
      shop_type: 'Hot Air Balloons',
      address: 'Old Bagan, Near Temple',
      description: 'Hot air balloon tours with sunrise flights.',
      status: 'pending',
      created_at: '2026-07-29T08:10:00Z',
      documents: ['license.png', 'safety_certificate.jpg'],
    },
    {
      id: 6,
      shop_name: 'Bagan Horse Cart Tours',
      owner_name: 'U Tun Tun',
      email: 'tun@example.com',
      phone: '09-66778899',
      shop_type: 'Horse Carts',
      address: 'Old Bagan, Archaeological Zone',
      description: 'Traditional horse cart tours around ancient temples.',
      status: 'approved',
      created_at: '2026-07-22T11:30:00Z',
      documents: ['license.png'],
    },
  ];

  // ===== 5. THEME HANDLER =====
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

  // ===== 6. FETCH (Simulate) =====
  const fetchRequests = () => {
    setLoading(true);
    setTimeout(() => {
      setRequests(sampleRequests);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ===== 7. UPDATE STATUS (Approve / Reject) =====
  const updateRequestStatus = (requestId, newStatus) => {
    const action = newStatus === 'approved' ? 'Approve' : 'Reject';
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

    setLoading(true);
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      setLoading(false);
      alert(`Request ${action}ed successfully!`);
    }, 400);
  };

  // ===== 8. DELETE =====
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this shop request?')) return;
    setLoading(true);
    setTimeout(() => {
      setRequests((prev) => prev.filter((req) => req.id !== id));
      setLoading(false);
      alert('Shop request deleted successfully!');
    }, 400);
  };

  // ===== 9. EDIT =====
  const handleEdit = (request) => {
    setSelectedRequestForEdit(request);
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    // Simulate edit
    setLoading(true);
    setTimeout(() => {
      setShowEditModal(false);
      setSelectedRequestForEdit(null);
      setLoading(false);
      alert('Shop request updated successfully!');
      fetchRequests();
    }, 400);
  };

  // ===== 10. FILTER & SORT =====
  const getSortedRequests = (list) => {
    let result = [...list];
    if (sortById === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortById === 'oldest') {
      result.sort((a, b) => a.id - b.id);
    }
    return result;
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesType = filterType === 'all' || req.shop_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const finalSortedRequests = getSortedRequests(filteredRequests);

  // ===== 11. STATUS BADGE =====
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pending', color: '#ffc107', bg: '#fff3cd' },
      approved: { label: 'Approved', color: '#198754', bg: '#d1e7dd' },
      rejected: { label: 'Rejected', color: '#dc3545', bg: '#f8d7da' },
    };
    const s = statusMap[status?.toLowerCase()] || { label: status, color: '#6c757d', bg: '#e9ecef' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: s.color,
          backgroundColor: s.bg,
          border: `1px solid ${s.color}`,
          minWidth: '70px',
          textAlign: 'center',
        }}
      >
        {s.label}
      </span>
    );
  };

  // ===== 12. TYPE BADGE =====
  const getTypeBadge = (type) => {
    const typeMap = {
      Cars: { color: '#0d6efd', bg: '#cfe2ff' },
      Destinations: { color: '#6f42c1', bg: '#e2d9f3' },
      'E-Bikes': { color: '#17a2b8', bg: '#cff4fc' },
      'Horse Carts': { color: '#fd7e14', bg: '#ffe5d0' },
      'Hot Air Balloons': { color: '#dc3545', bg: '#f8d7da' },
      Hotels: { color: '#198754', bg: '#d1e7dd' },
      Restaurants: { color: '#d63384', bg: '#f5d4e1' },
      Tricycles: { color: '#6c757d', bg: '#e9ecef' },
    };
    const s = typeMap[type] || { color: '#6c757d', bg: '#e9ecef' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: s.color,
          backgroundColor: s.bg,
          border: `1px solid ${s.color}`,
          minWidth: '70px',
          textAlign: 'center',
        }}
      >
        {type}
      </span>
    );
  };

  // ===== 13. GET TYPE ICON =====
  const getTypeIcon = (type) => {
    const iconMap = {
      Cars: 'bi-car-front',
      Destinations: 'bi-geo-alt',
      'E-Bikes': 'bi-bicycle',
      'Horse Carts': 'bi-truck',
      'Hot Air Balloons': 'bi-balloon',
      Hotels: 'bi-building',
      Restaurants: 'bi-egg-fried',
      Tricycles: 'bi-truck',
    };
    return iconMap[type] || 'bi-shop';
  };

  // ===== 14. STATS =====
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  // ===== 15. FORMAT DATE =====
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr.slice(0, 10);
  };

  // ===== 16. LOADING =====
  if (loading && requests.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Shop Requests Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading shop requests...</p>
        </div>
      </div>
    );
  }

  // ===== 17. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Shop Requests Management" onThemeChange={handleThemeChange} />

      {/* ===== STYLES ===== */}
      <style>{`
        /* Stat Cards */
        .stat-cards-row {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .stat-card {
          flex: 1;
          min-width: 120px;
          background: #2d2d2d;
          border-radius: 12px;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #444;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 18px;
          flex-shrink: 0;
        }
        .stat-info h4 {
          color: #fff;
          font-size: 18px;
          margin: 0;
          font-weight: bold;
        }
        .stat-info p {
          color: #bbb;
          font-size: 12px;
          margin: 0;
          font-weight: 500;
        }

        /* Search & Filter */
        .search-filter-row {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }
        .search-bar-wrapper {
          flex: 1;
          min-width: 200px;
          position: relative;
        }
        .search-input-full {
          width: 100%;
          padding: 8px 15px 8px 35px;
          border-radius: 40px;
          border: 1px solid var(--border-color);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 0.9rem;
        }
        .search-input-full:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13,110,253,0.25);
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }
        .filter-select {
          padding: 8px 12px;
          border-radius: 40px;
          border: 1px solid var(--border-color);
          background: var(--input-bg);
          color: var(--text-color);
          font-size: 0.9rem;
          min-width: 130px;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
          background: var(--card-bg);
          border-radius: 16px;
          padding: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .shop-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }
        .shop-table th {
          text-align: left;
          padding: 12px 16px;
          background: var(--header-bg);
          color: var(--text-color);
          font-weight: 600;
          font-size: 13px;
          border-bottom: 2px solid var(--border-color);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .shop-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-color);
          font-size: 14px;
          vertical-align: middle;
        }
        .shop-table tr:hover td {
          background: var(--hover-bg);
        }

        /* Shop Info Cell */
        .shop-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .shop-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--icon-bg);
          color: var(--icon-color);
          font-size: 16px;
          flex-shrink: 0;
        }
        .shop-name {
          font-weight: 600;
          font-size: 14px;
        }
        .shop-owner {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Contact Cell */
        .contact-email {
          font-size: 13px;
        }
        .contact-phone {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Actions */
        .actions-cell {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .action-btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }
        .action-btn-icon.approve {
          color: #198754;
          background: rgba(25, 135, 84, 0.1);
        }
        .action-btn-icon.approve:hover {
          background: #198754;
          color: #fff;
        }
        .action-btn-icon.reject {
          color: #dc3545;
          background: rgba(220, 53, 69, 0.1);
        }
        .action-btn-icon.reject:hover {
          background: #dc3545;
          color: #fff;
        }
        .action-btn-icon.view {
          color: #6f42c1;
          background: rgba(111, 66, 193, 0.1);
        }
        .action-btn-icon.view:hover {
          background: #6f42c1;
          color: #fff;
        }
        .action-btn-icon.edit {
          color: #0d6efd;
          background: rgba(13, 110, 253, 0.1);
        }
        .action-btn-icon.edit:hover {
          background: #0d6efd;
          color: #fff;
        }
        .action-btn-icon.delete {
          color: #dc3545;
          background: rgba(220, 53, 69, 0.1);
        }
        .action-btn-icon.delete:hover {
          background: #dc3545;
          color: #fff;
        }

        /* Dark Theme Overrides */
        .dark-theme .stat-card {
          background: #2d2d2d;
          border-color: #444;
        }
        .dark-theme .shop-table th {
          background: #1a1a1a;
          border-color: #333;
        }
        .dark-theme .shop-table td {
          border-color: #333;
        }
        .dark-theme .shop-table tr:hover td {
          background: #2a2a2a;
        }
        .dark-theme .shop-icon {
          background: #3d3d3d;
          color: #ddd;
        }
        .dark-theme .stat-card {
          background: #2d2d2d;
          border-color: #444;
        }
        .dark-theme .stat-info h4 {
          color: #fff;
        }
        .dark-theme .stat-info p {
          color: #bbb;
        }

        /* Light Theme Overrides */
        .light-theme .stat-card {
          background: #ffffff;
          border-color: #e9ecef;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .light-theme .stat-info h4 {
          color: #212529;
        }
        .light-theme .stat-info p {
          color: #6c757d;
        }
        .light-theme .shop-table th {
          background: #f8f9fa;
          border-color: #dee2e6;
        }
        .light-theme .shop-table td {
          border-color: #f0f0f0;
        }
        .light-theme .shop-table tr:hover td {
          background: #f8f9fa;
        }
        .light-theme .shop-icon {
          background: #e9ecef;
          color: #495057;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .modal-content {
          background: var(--card-bg);
          border-radius: 24px;
          padding: 0;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          z-index: 10001;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-color);
        }
        .modal-body {
          padding: 24px;
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .discard-btn {
          padding: 8px 20px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-color);
          cursor: pointer;
        }
        .add-item-btn {
          padding: 8px 24px;
          border-radius: 8px;
          border: none;
          background: #0d6efd;
          color: #fff;
          cursor: pointer;
        }
        .add-item-btn:hover {
          background: #0b5ed7;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .detail-grid .full-width {
          grid-column: 1 / -1;
        }
        .detail-grid strong {
          display: inline-block;
          min-width: 120px;
          font-weight: 600;
        }
        .doc-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }
        .doc-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          background: var(--icon-bg);
          color: var(--text-color);
          font-size: 13px;
          border: 1px solid var(--border-color);
        }
        .doc-item i {
          font-size: 16px;
        }
        .doc-item .file-icon-image {
          color: #198754;
        }
        .doc-item .file-icon-pdf {
          color: #dc3545;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .stat-card {
            min-width: 80px;
            padding: 10px 14px;
          }
          .filter-select {
            min-width: 100px;
          }
        }
      `}</style>

      {/* ===== STAT CARDS ===== */}
      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#0d6efd' }}>
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-info">
            <h4>{stats.total}</h4>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ffc107' }}>
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="stat-info">
            <h4>{stats.pending}</h4>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#198754' }}>
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-info">
            <h4>{stats.approved}</h4>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dc3545' }}>
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="stat-info">
            <h4>{stats.rejected}</h4>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* ===== SEARCH & FILTER ===== */}
      <div className="search-filter-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by shop name, owner or email..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {shopTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select className="filter-select" value={sortById} onChange={(e) => setSortById(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      <div className="table-wrapper">
        <table className="shop-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Shop</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {finalSortedRequests.length > 0 ? (
              finalSortedRequests.map((req, index) => (
                <tr key={req.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="shop-cell">
                      <div className="shop-icon">
                        <i className={getTypeIcon(req.shop_type)}></i>
                      </div>
                      <div>
                        <div className="shop-name">{req.shop_name}</div>
                        <div className="shop-owner">{req.owner_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-email">{req.email}</div>
                    <div className="contact-phone">{req.phone}</div>
                  </td>
                  <td>{getTypeBadge(req.shop_type)}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {formatDate(req.created_at)}
                  </td>
                  <td className="actions-cell">
                    {req.status === 'pending' && (
                      <>
                        <button
                          className="action-btn-icon approve"
                          title="Approve"
                          onClick={() => updateRequestStatus(req.id, 'approved')}
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button
                          className="action-btn-icon reject"
                          title="Reject"
                          onClick={() => updateRequestStatus(req.id, 'rejected')}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </>
                    )}
                    <button
                      className="action-btn-icon view"
                      title="View Details"
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowDetailModal(true);
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      className="action-btn-icon edit"
                      title="Edit"
                      onClick={() => handleEdit(req)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <button
                      className="action-btn-icon delete"
                      title="Delete"
                      onClick={() => handleDelete(req.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                  No shop requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2><i className="bi bi-shop"></i> Shop Details</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><strong>Shop Name:</strong> {selectedRequest.shop_name}</div>
                <div><strong>Owner:</strong> {selectedRequest.owner_name}</div>
                <div><strong>Email:</strong> {selectedRequest.email}</div>
                <div><strong>Phone:</strong> {selectedRequest.phone}</div>
                <div><strong>Type:</strong> {getTypeBadge(selectedRequest.shop_type)}</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedRequest.status)}</div>
                <div className="full-width"><strong>Address:</strong> {selectedRequest.address}</div>
                <div className="full-width"><strong>Created:</strong> {formatDate(selectedRequest.created_at)}</div>
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div className="full-width">
                    <strong>Documents:</strong>
                    <div className="doc-list">
                      {selectedRequest.documents.map((doc, idx) => {
                        const ext = doc.split('.').pop().toLowerCase();
                        const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext);
                        return (
                          <span key={idx} className="doc-item">
                            <i className={isImage ? 'bi bi-file-image file-icon-image' : 'bi bi-file-pdf file-icon-pdf'}></i>
                            {doc}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowDetailModal(false)}>Close</button>
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    className="add-item-btn"
                    style={{ background: '#198754' }}
                    onClick={() => {
                      updateRequestStatus(selectedRequest.id, 'approved');
                      setShowDetailModal(false);
                    }}
                  >
                    <i className="bi bi-check-circle"></i> Approve
                  </button>
                  <button
                    className="add-item-btn"
                    style={{ background: '#dc3545' }}
                    onClick={() => {
                      updateRequestStatus(selectedRequest.id, 'rejected');
                      setShowDetailModal(false);
                    }}
                  >
                    <i className="bi bi-x-circle"></i> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && selectedRequestForEdit && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2><i className="bi bi-pencil-square"></i> Edit Shop</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info mb-3">
                Editing shop: <strong>{selectedRequestForEdit.shop_name}</strong>
              </div>
              <div className="form-group mb-3">
                <label>Shop Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedRequestForEdit.shop_name}
                  onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, shop_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                  }}
                />
              </div>
              <div className="form-group mb-3">
                <label>Owner Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedRequestForEdit.owner_name}
                  onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, owner_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                  }}
                />
              </div>
              <div className="form-group mb-3">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedRequestForEdit.phone}
                  onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                  }}
                />
              </div>
              <div className="form-group mb-3">
                <label>Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedRequestForEdit.address}
                  onChange={(e) => setSelectedRequestForEdit({ ...selectedRequestForEdit, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                  }}
                />
              </div>
              <div className="alert alert-secondary mt-3">
                <small>Note: Only basic info can be edited here. Type and status changes require Approve/Reject actions.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="add-item-btn" onClick={handleConfirmEdit} disabled={loading}>
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