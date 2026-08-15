import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

function Reviews() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    reply: '',
    status: ''
  });

  // ===== Toast & Confirm States (Alert အစားထိုးရန်) =====
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

  // ===== Toast Helper (3s အကြာမှာ အလိုအလျောက်ပျောက်မယ်) =====
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

  // Rating distribution data for pie chart
  const ratingData = [
    { name: '5 Stars', value: 234, color: '#10b981', rating: 5 },
    { name: '4 Stars', value: 456, color: '#3b82f6', rating: 4 },
    { name: '3 Stars', value: 189, color: '#f59e0b', rating: 3 },
    { name: '2 Stars', value: 67, color: '#ef4444', rating: 2 },
    { name: '1 Star', value: 34, color: '#8b5cf6', rating: 1 }
  ];

  // Rating trend data for line chart
  const ratingTrendData = [
    { month: 'Jan', avgRating: 4.2, totalReviews: 45 },
    { month: 'Feb', avgRating: 4.4, totalReviews: 52 },
    { month: 'Mar', avgRating: 4.3, totalReviews: 48 },
    { month: 'Apr', avgRating: 4.5, totalReviews: 61 },
    { month: 'May', avgRating: 4.6, totalReviews: 73 },
    { month: 'Jun', avgRating: 4.5, totalReviews: 85 },
    { month: 'Jul', avgRating: 4.7, totalReviews: 94 },
    { month: 'Aug', avgRating: 4.6, totalReviews: 108 },
    { month: 'Sep', avgRating: 4.4, totalReviews: 112 },
    { month: 'Oct', avgRating: 4.5, totalReviews: 125 },
    { month: 'Nov', avgRating: 4.7, totalReviews: 142 },
    { month: 'Dec', avgRating: 4.8, totalReviews: 158 }
  ];

  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: 'Aung Ko Lin',
      userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 5,
      reviewText: 'Amazing experience! The hot air balloon ride over Bagan at sunrise was absolutely breathtaking. Highly recommend!',
      itemName: 'Balloons Over Bagan',
      itemType: 'hot_air_balloon',
      date: '2024-03-20',
      status: 'approved',
      reportCount: 0,
      helpful: 124,
      reply: null
    },
    {
      id: 2,
      userName: 'Su Su Hlaing',
      userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      rating: 4,
      reviewText: 'Great hotel with excellent service. The room was clean and comfortable. Only minor issue was the wifi speed.',
      itemName: 'Bagan Thande Hotel',
      itemType: 'hotel',
      date: '2024-03-18',
      status: 'approved',
      reportCount: 0,
      helpful: 89,
      reply: null
    },
    {
      id: 3,
      userName: 'Min Thu Wun',
      userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: 2,
      reviewText: 'Disappointing experience. The e-bike battery died halfway through the tour and the support was slow to respond.',
      itemName: 'Yadea C1S E-Bike',
      itemType: 'e_bike',
      date: '2024-03-15',
      status: 'pending',
      reportCount: 2,
      helpful: 12,
      reply: null
    },
    {
      id: 4,
      userName: 'Thida Win',
      userAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      rating: 5,
      reviewText: 'Absolutely delicious! The Shan noodles were authentic and the service was fantastic. Will definitely come back.',
      itemName: 'Shan Kitchen',
      itemType: 'restaurant',
      date: '2024-03-14',
      status: 'approved',
      reportCount: 0,
      helpful: 67,
      reply: null
    },
    {
      id: 5,
      userName: 'Kyaw Zaw',
      userAvatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      rating: 1,
      reviewText: 'Scam! The tour was nothing like described. Driver was late and the vehicle was in poor condition.',
      itemName: 'Bagan Heritage Cart',
      itemType: 'horse_cart',
      date: '2024-03-10',
      status: 'reported',
      reportCount: 8,
      helpful: 45,
      reply: null
    },
    {
      id: 6,
      userName: 'Hla Hla Myint',
      userAvatar: 'https://randomuser.me/api/portraits/women/6.jpg',
      rating: 4,
      reviewText: 'Good value for money. The room was spacious and the location was convenient. Breakfast could be better.',
      itemName: 'Bagan Lodge',
      itemType: 'hotel',
      date: '2024-03-12',
      status: 'approved',
      reportCount: 0,
      helpful: 34,
      reply: null
    },
    {
      id: 7,
      userName: 'Zaw Min Oo',
      userAvatar: 'https://randomuser.me/api/portraits/men/7.jpg',
      rating: 3,
      reviewText: 'Average experience. The tour guide was knowledgeable but the itinerary felt rushed.',
      itemName: 'Bagan Temple Tour',
      itemType: 'tour',
      date: '2024-03-08',
      status: 'pending',
      reportCount: 1,
      helpful: 23,
      reply: null
    },
    {
      id: 8,
      userName: 'May Thazin',
      userAvatar: 'https://randomuser.me/api/portraits/women/8.jpg',
      rating: 5,
      reviewText: 'Best experience ever! The sunset view from the balloon was magical. Staff were professional and friendly.',
      itemName: 'Sunrise Balloon Tours',
      itemType: 'hot_air_balloon',
      date: '2024-03-05',
      status: 'approved',
      reportCount: 0,
      helpful: 156,
      reply: null
    }
  ]);

  // Statistics calculations
  const totalReviews = reviews.length;
  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const reportedReviews = reviews.filter(r => r.reportCount > 0).length;
  const todayReviews = reviews.filter(r => {
    const reviewDate = new Date(r.date);
    const today = new Date();
    return reviewDate.toDateString() === today.toDateString();
  }).length;
  
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

  // Approve (Replace alert with Toast)
  const handleApproveReview = (id) => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, status: 'approved' } : review
    ));
    showToast('success', 'Review approved successfully!');
  };

  // Hide (Replace alert with Toast)
  const handleHideReview = (id) => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, status: 'hidden' } : review
    ));
    showToast('success', 'Review hidden from public view');
  };

  // Delete (Replace window.confirm with Custom Confirm)
  const performDeleteReview = (id) => {
    setReviews(reviews.filter(review => review.id !== id));
    showToast('success', 'Review deleted successfully!');
  };

  const handleDeleteReview = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to permanently delete this review?',
      onConfirm: () => performDeleteReview(id)
    });
  };

  // Reply (Replace alert with Toast)
  const handleReplyToReview = (id) => {
    if (formData.reply) {
      setReviews(reviews.map(review => 
        review.id === id ? { ...review, reply: formData.reply } : review
      ));
      setFormData({ ...formData, reply: '' });
      setShowEditModal(false);
      showToast('success', 'Reply added successfully!');
    } else {
      showToast('warning', 'Please enter a reply');
    }
  };

  const handleSelectAll = () => {
    if (selectedReviewId === 'all') {
      setSelectedReviewId(null);
    } else {
      setSelectedReviewId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleReviewSelection = (id) => {
    if (selectedReviewId === id) {
      setSelectedReviewId(null);
    } else if (selectedReviewId === 'all') {
      setSelectedReviewId(id);
    } else {
      setSelectedReviewId(id);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesType = filterType === 'all' || review.itemType === filterType;
    
    return matchesSearch && matchesStatus && matchesRating && matchesType;
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved':
        return 'status-badge approved';
      case 'pending':
        return 'status-badge pending';
      case 'reported':
        return 'status-badge reported';
      case 'hidden':
        return 'status-badge hidden';
      default:
        return 'status-badge';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars-display">
        {[...Array(5)].map((_, i) => (
          <i 
            key={i} 
            className={`bi ${i < rating ? 'bi-star-fill' : 'bi-star'}`}
            style={{ color: '#ff8a00', fontSize: '12px' }}
          ></i>
        ))}
      </div>
    );
  };

  const getItemTypeIcon = (type) => {
    switch(type) {
      case 'hotel': return '🏨';
      case 'restaurant': return '🍽️';
      case 'hot_air_balloon': return '🎈';
      case 'e_bike': return '🛵';
      case 'horse_cart': return '🐎';
      case 'tour': return '🗺️';
      default: return '📝';
    }
  };

  const getItemTypeLabel = (type) => {
    switch(type) {
      case 'hotel': return 'Hotel';
      case 'restaurant': return 'Restaurant';
      case 'hot_air_balloon': return 'Hot Air Balloon';
      case 'e_bike': return 'E-Bike';
      case 'horse_cart': return 'Horse Cart';
      case 'tour': return 'Tour';
      default: return 'Review';
    }
  };

  // Custom Tooltip for Pie Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalReviews) * 100).toFixed(1);
      return (
        <div className="chart-tooltip">
          <div className="tooltip-rating">{data.name}</div>
          <div className="tooltip-count">{data.value} reviews</div>
          <div className="tooltip-percentage">{percentage}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Reviews Management" onThemeChange={handleThemeChange} />

      {/* 🟢 Screen အလယ် Toast Alert UI */}
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

      {/* 🟢 Screen အလယ် Custom Confirm Modal (Delete အတွက်) */}
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

      {/* Statistics Cards Row */}
      <div className="reviews-stats-cards-row">
        <div className="review-stat-card">
          <div className="review-stat-icon total">
            <i className="bi bi-chat-dots-fill"></i>
          </div>
          <div className="review-stat-info">
            <h3>{totalReviews}</h3>
            <p>Total Reviews</p>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon rating">
            <i className="bi bi-star-fill"></i>
          </div>
          <div className="review-stat-info">
            <h3>{averageRating}</h3>
            <p>Average Rating</p>
            <small>out of 5.0</small>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon pending">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="review-stat-info">
            <h3>{pendingReviews}</h3>
            <p>Pending Review</p>
            <small>Awaiting approval</small>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon reported">
            <i className="bi bi-flag-fill"></i>
          </div>
          <div className="review-stat-info">
            <h3>{reportedReviews}</h3>
            <p>Reported Reviews</p>
            <small>Need attention</small>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon today">
            <i className="bi bi-calendar-today"></i>
          </div>
          <div className="review-stat-info">
            <h3>{todayReviews}</h3>
            <p>Today's Reviews</p>
            <small>New submissions</small>
          </div>
        </div>
      </div>

      {/* Two Charts Row */}
      <div className="charts-two-columns">
        {/* Rating Distribution - Pie Chart */}
        <div className="chart-card-half">
          <h3 className="chart-title-simple">
            <i className="bi bi-pie-chart"></i> Rating Distribution
          </h3>
          <div className="rating-distribution-modern">
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ratingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-center-rating">
                <div className="center-rating-number">{averageRating}</div>
                <div className="center-stars">{renderStars(Math.round(averageRating))}</div>
              </div>
            </div>
            <div className="rating-legend">
              {ratingData.map((item) => (
                <div key={item.rating} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <div className="legend-label">{item.name}</div>
                  <div className="legend-value">{item.value}</div>
                  <div className="legend-percentage">
                    {((item.value / totalReviews) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rating Trend - Line Chart */}
        <div className="chart-card-half">
          <h3 className="chart-title-simple">
            <i className="bi bi-graph-up"></i> Rating Trend (Monthly)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ratingTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#888" fontSize={11} />
              <YAxis domain={[3, 5]} stroke="#888" fontSize={11} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="avgRating" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Avg Rating"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="trend-summary">
            <span className="trend-up">
              <i className="bi bi-arrow-up"></i> +0.6 from last year
            </span>
          </div>
        </div>
      </div>

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by user, review text, or item name..."
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="reported">Reported</option>
            <option value="hidden">Hidden</option>
          </select>

          <select 
            className="filter-select-simple"
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select 
            className="filter-select-simple"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="hotel">Hotels</option>
            <option value="restaurant">Restaurants</option>
            <option value="hot_air_balloon">Hot Air Balloons</option>
            <option value="e_bike">E-Bikes</option>
            <option value="horse_cart">Horse Carts</option>
            <option value="tour">Tours</option>
          </select>
        </div>
        
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}>
            <i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i>
          </button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => { setSelectedReviewId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedReviewId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="reviews-table-container">
        <div className="reviews-table-wrapper">
          <table className="reviews-data-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input 
                    type="checkbox" 
                    checked={selectedReviewId === 'all'}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>User</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Item</th>
                <th>Date</th>
                <th>Status</th>
                <th>Reports</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr 
                  key={review.id} 
                  className={selectedReviewId === review.id ? 'selected' : ''}
                  onClick={() => toggleReviewSelection(review.id)}
                >
                  <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedReviewId === review.id}
                      onChange={() => toggleReviewSelection(review.id)}
                    />
                  </td>
                  <td className="user-cell">
                    <div className="user-info">
                      <img src={review.userAvatar} alt={review.userName} className="user-avatar-small" />
                      <span className="user-name">{review.userName}</span>
                    </div>
                  </td>
                  <td className="rating-cell">
                    {renderStars(review.rating)}
                    <span className="rating-number">{review.rating}.0</span>
                  </td>
                  <td className="review-text-cell">
                    <div className="review-preview">
                      {review.reviewText.length > 80 ? `${review.reviewText.substring(0, 80)}...` : review.reviewText}
                      {review.reply && (
                        <div className="reply-preview">
                          <i className="bi bi-reply-fill"></i> {review.reply.substring(0, 50)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="item-cell">
                    <div className="item-info">
                      <span className="item-icon">{getItemTypeIcon(review.itemType)}</span>
                      <span className="item-name">{review.itemName}</span>
                      <span className="item-type">{getItemTypeLabel(review.itemType)}</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    {review.date}
                  </td>
                  <td className="status-cell">
                    <span className={getStatusBadgeClass(review.status)}>
                      {review.status}
                    </span>
                  </td>
                  <td className="report-cell">
                    {review.reportCount > 0 ? (
                      <span className="report-badge">
                        <i className="bi bi-flag-fill"></i> {review.reportCount}
                      </span>
                    ) : (
                      <span className="no-reports">-</span>
                    )}
                  </td>
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    {review.status !== 'approved' && review.status !== 'hidden' && (
                      <button 
                        className="action-icon approve" 
                        title="Approve Review"
                        onClick={() => handleApproveReview(review.id)}
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>
                    )}
                    {review.status === 'approved' && (
                      <button 
                        className="action-icon hide" 
                        title="Hide Review"
                        onClick={() => handleHideReview(review.id)}
                      >
                        <i className="bi bi-eye-slash"></i>
                      </button>
                    )}
                    <button 
                      className="action-icon reply" 
                      title="Reply to Review"
                      onClick={() => {
                        setSelectedReviewForEdit(review);
                        setFormData({ ...formData, reply: review.reply || '' });
                        setShowEditModal(true);
                      }}
                    >
                      <i className="bi bi-reply-fill"></i>
                    </button>
                    <button 
                      className="action-icon delete" 
                      title="Delete Review"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReviews.length === 0 && (
            <div className="empty-table-state">
              <i className="bi bi-chat-dots"></i>
              <p>No reviews found</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reply to Review</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="review-info-card">
                <div className="reviewer-info">
                  <img src={selectedReviewForEdit?.userAvatar} alt="" className="user-avatar-modal" />
                  <div>
                    <div className="reviewer-name">{selectedReviewForEdit?.userName}</div>
                    <div className="review-rating">{renderStars(selectedReviewForEdit?.rating || 0)}</div>
                  </div>
                </div>
                <div className="original-review">
                  <p>{selectedReviewForEdit?.reviewText}</p>
                </div>
              </div>
              <div className="form-group">
                <label>Your Reply</label>
                <textarea
                  name="reply"
                  rows="4"
                  placeholder="Write your response to this review..."
                  value={formData.reply}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="add-item-btn" onClick={() => handleReplyToReview(selectedReviewForEdit?.id)}>
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;