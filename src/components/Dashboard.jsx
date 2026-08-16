// components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Header from './Header';

function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [timeRange, setTimeRange] = useState('weekly');
  const [userRole, setUserRole] = useState(null);
  const [shopType, setShopType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check Auth & Role
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const role = localStorage.getItem('role') || 'admin';
    const type = localStorage.getItem('shopType') || 'hotel';
    setUserRole(role);
    setShopType(type);
    setLoading(false);
  }, [navigate]);

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

  // ----- Data Definitions -----
  const dailyData = [
    { day: 'Mon', bookings: 45, revenue: 12500, users: 32 },
    { day: 'Tue', bookings: 52, revenue: 14800, users: 38 },
    { day: 'Wed', bookings: 48, revenue: 13200, users: 35 },
    { day: 'Thu', bookings: 61, revenue: 17500, users: 42 },
    { day: 'Fri', bookings: 73, revenue: 20800, users: 51 },
    { day: 'Sat', bookings: 85, revenue: 24200, users: 58 },
    { day: 'Sun', bookings: 78, revenue: 22100, users: 54 },
  ];
  const weeklyData = [
    { week: 'Week 1', bookings: 245, revenue: 68500, users: 156 },
    { week: 'Week 2', bookings: 278, revenue: 78900, users: 178 },
    { week: 'Week 3', bookings: 312, revenue: 89200, users: 201 },
    { week: 'Week 4', bookings: 298, revenue: 84500, users: 189 },
  ];
  const monthlyData = [
    { month: 'Jan', bookings: 245, revenue: 68500, users: 156 },
    { month: 'Feb', bookings: 278, revenue: 78900, users: 178 },
    { month: 'Mar', bookings: 312, revenue: 89200, users: 201 },
    { month: 'Apr', bookings: 298, revenue: 84500, users: 189 },
    { month: 'May', bookings: 356, revenue: 102000, users: 234 },
    { month: 'Jun', bookings: 389, revenue: 112000, users: 256 },
  ];
  const yearlyData = [
    { year: '2019', bookings: 1845, revenue: 525000, users: 1234 },
    { year: '2020', bookings: 2120, revenue: 608000, users: 1456 },
    { year: '2021', bookings: 2456, revenue: 712000, users: 1678 },
    { year: '2022', bookings: 2890, revenue: 845000, users: 1987 },
    { year: '2023', bookings: 3456, revenue: 1025000, users: 2345 },
    { year: '2024', bookings: 3980, revenue: 1250000, users: 2876 },
  ];

  const getCurrentData = () => {
    switch(timeRange) {
      case 'daily': return dailyData;
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      case 'yearly': return yearlyData;
      default: return weeklyData;
    }
  };
  const getXAxisKey = () => {
    switch(timeRange) {
      case 'daily': return 'day';
      case 'weekly': return 'week';
      case 'monthly': return 'month';
      case 'yearly': return 'year';
      default: return 'week';
    }
  };

  const currentData = getCurrentData();
  const xAxisKey = getXAxisKey();

  // Category data (filtered by role)
  const allCategoryData = [
    { name: 'Hotels', value: 45, color: '#ff8a00' },
    { name: 'Restaurants', value: 25, color: '#ffb347' },
    { name: 'Tours', value: 20, color: '#ffcc80' },
    { name: 'Transport', value: 10, color: '#ffa04d' },
  ];

  // Filter category data for Shop
  const getFilteredCategoryData = () => {
    if (userRole === 'admin') return allCategoryData;
    // Shop: only show their own type
    const lowerType = shopType?.toLowerCase();
    return allCategoryData.filter(item => item.name.toLowerCase() === lowerType);
  };

  // All Bookings for Recent Table (filtered by role)
  const allBookingsData = [
    { customer: 'Emily Chen', service: 'Hotel', status: 'Confirmed', amount: 320 },
    { customer: 'Robert Kim', service: 'Tour', status: 'Pending', amount: 180 },
    { customer: 'Lisa Park', service: 'Restaurant', status: 'Completed', amount: 95 },
    { customer: 'James Wong', service: 'Transport', status: 'Cancelled', amount: 210 },
    { customer: 'Maria Garcia', service: 'Hotel', status: 'Confirmed', amount: 450 },
    { customer: 'David Lee', service: 'Restaurant', status: 'Pending', amount: 120 },
    { customer: 'Anna Smith', service: 'Hotel', status: 'Completed', amount: 280 },
  ];

  const getFilteredBookings = () => {
    if (userRole === 'admin') return allBookingsData.slice(0, 5);
    return allBookingsData.filter(b => b.service.toLowerCase() === shopType?.toLowerCase()).slice(0, 5);
  };

  // Top Agencies (filtered by role)
  const allTopAgencies = [
    { rank: 1, name: 'Travel World', meta: 'Hotels & Tours', bookings: 284, revenue: 82400, color: '#f59e0b', initials: 'TW' },
    { rank: 2, name: 'Golden Holiday', meta: 'Tours & Transport', bookings: 231, revenue: 67100, color: '#8b5cf6', initials: 'GH' },
    { rank: 3, name: 'Blue Elephant', meta: 'Restaurants & Hotels', bookings: 198, revenue: 54800, color: '#10b981', initials: 'BE' },
    { rank: 4, name: 'Sunset Safari', meta: 'Tours & Transport', bookings: 165, revenue: 48200, color: '#ec4899', initials: 'SS' },
    { rank: 5, name: 'City Heights', meta: 'Hotels & Restaurants', bookings: 142, revenue: 39600, color: '#8b5cf6', initials: 'CH' },
  ];

  const getFilteredAgencies = () => {
    if (userRole === 'admin') return allTopAgencies;
    // For shop, show only agencies that match their type (or show a placeholder)
    const filtered = allTopAgencies.filter(a => a.meta.toLowerCase().includes(shopType?.toLowerCase()));
    if (filtered.length === 0) {
      // Return a dummy entry showing their own shop
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return [{ rank: 1, name: user.username || 'Your Shop', meta: shopType || 'Shop', bookings: 0, revenue: 0, color: '#3b82f6', initials: 'YS' }];
    }
    return filtered;
  };

  // Metrics (keep as is, but can be adjusted later)
  const importantMetrics = [
    { title: 'Total Bookings', value: '1,248', change: '+12.5%', icon: 'bi-calendar-check-fill', color: '#3b82f6' },
    { title: 'Total Revenue', value: '245.8M', change: '+18.2%', icon: 'bi-currency-dollar', color: '#10b981' },
    { title: 'Active Users', value: '1,245', change: '+8.3%', icon: 'bi-people-fill', color: '#8b5cf6' },
    { title: 'Active Agency/Shop', value: '48', change: '+6', icon: 'bi-shop', color: '#ec4899' },
    { title: 'Today Active', value: '87', change: '+5', icon: 'bi-person-check-fill', color: '#f59e0b' },
    { title: 'Avg Rating', value: '4.6', change: '+0.2', icon: 'bi-star-fill', color: '#ef4444' },
  ];

  const todayActiveUsers = [
    { name: 'John Doe', time: '10:30 AM', action: 'Booked Hotel' },
    { name: 'Jane Smith', time: '09:45 AM', action: 'Reviewed Restaurant' },
    { name: 'Mike Johnson', time: '11:20 AM', action: 'Booked Tour' },
    { name: 'Sarah Williams', time: '08:15 AM', action: 'Registered' },
    { name: 'David Brown', time: '02:30 PM', action: 'Booked Car' },
  ];

  const customerReviews = [
    { id: 1, name: 'John Doe', rating: 5, review: 'Excellent service! Very satisfied with the hotel booking.', date: '2 days ago', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', rating: 4, review: 'Great experience, would recommend to others.', date: '3 days ago', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', rating: 5, review: 'Amazing tour package! Everything was perfect.', date: '5 days ago', avatar: 'MJ' },
    { id: 4, name: 'Sarah Williams', rating: 4, review: 'Good service, quick response from support.', date: '1 week ago', avatar: 'SW' },
  ];

  const statusData = [
    { name: 'Confirmed', value: 157, color: '#10b981' },
    { name: 'Pending', value: 94, color: '#f59e0b' },
    { name: 'Cancelled', value: 47, color: '#ef4444' },
    { name: 'Completed', value: 16, color: '#3b82f6' },
  ];

  const insights = [
    { label: 'Conversion Rate', value: '68%', change: '+4.2%', up: true, accent: 'accent-blue' },
    { label: 'Avg. Booking Value', value: '$312', change: '+7.8%', up: true, accent: 'accent-green' },
    { label: 'Refund Rate', value: '2.4%', change: '+0.3%', up: false, accent: 'accent-orange' },
    { label: 'New Signups (7d)', value: '89', change: '+12%', up: true, accent: 'accent-purple' },
    { label: 'Repeat Customers', value: '43%', change: '+5.1%', up: true, accent: 'accent-blue' },
    { label: 'Avg. Response Time', value: '2.4h', change: '↓ 0.8h', up: false, accent: 'accent-green' },
  ];

  // ----- Helpers -----
  const renderStars = (rating) => {
    return Array(5).fill().map((_, i) => (
      <i key={i} className={`bi bi-star${i < rating ? '-fill' : ''}`} style={{ color: '#ff8a00', fontSize: '12px' }}></i>
    ));
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard...</div>;
  }

  // ---- FILTERED DATA ----
  const categoryData = getFilteredCategoryData();
  const recentBookings = getFilteredBookings();
  const topAgencies = getFilteredAgencies();

  // ---- Render ----
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Dashboard" onThemeChange={handleThemeChange} />
      
      {/* Role Indicator */}
      <div style={{ padding: '0 28px', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
        <span style={{ background: userRole === 'admin' ? '#3b82f6' : '#10b981', color: '#fff', padding: '4px 14px', borderRadius: '20px' }}>
          {userRole === 'admin' ? '👑 Admin' : `🏪 Shop (${shopType})`}
        </span>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button className={`time-btn ${timeRange === 'daily' ? 'active' : ''}`} onClick={() => setTimeRange('daily')}><i className="bi bi-calendar-day"></i> Daily</button>
        <button className={`time-btn ${timeRange === 'weekly' ? 'active' : ''}`} onClick={() => setTimeRange('weekly')}><i className="bi bi-calendar-week"></i> Weekly</button>
        <button className={`time-btn ${timeRange === 'monthly' ? 'active' : ''}`} onClick={() => setTimeRange('monthly')}><i className="bi bi-calendar-month"></i> Monthly</button>
        <button className={`time-btn ${timeRange === 'yearly' ? 'active' : ''}`} onClick={() => setTimeRange('yearly')}><i className="bi bi-calendar-year"></i> Yearly</button>
      </div>

      {/* Important Metrics */}
      <div className="important-metrics-grid">
        {importantMetrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
              <i className={`bi ${metric.icon}`}></i>
            </div>
            <div className="metric-info">
              <h3>{metric.value}</h3>
              <p>{metric.title}</p>
              <span className="metric-change positive">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid - 3 Charts */}
      <div className="charts-grid-three">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Booking & Revenue Trend</h3>
            <div className="chart-legend">
              <span><span className="legend-color bookings"></span> Bookings</span>
              <span><span className="legend-color revenue"></span> Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
              <XAxis dataKey={xAxisKey} stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
              <YAxis yAxisId="left" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#252a41' : '#fff', border: 'none', borderRadius: '8px' }} />
              <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Bookings" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff8a00" strokeWidth={2} dot={{ fill: '#ff8a00', r: 3 }} name="Revenue (MMK)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3>User Growth</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
              <XAxis dataKey={xAxisKey} stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
              <YAxis stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3>Booking Distribution</h3></div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {categoryData.map((item, index) => (
              <div key={index} className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                <span>{item.name}</span>
                <span className="legend-value">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row - Today's Active Users & Customer Reviews */}
      <div className="charts-grid-two">
        <div className="chart-card">
          <div className="chart-header"><h3><i className="bi bi-person-activity"></i> Today's Active Users</h3></div>
          <div className="active-users-list">
            {todayActiveUsers.map((user, index) => (
              <div key={index} className="active-user-item">
                <div className="active-user-avatar"><i className="bi bi-person-circle"></i></div>
                <div className="active-user-info"><span className="active-user-name">{user.name}</span><span className="active-user-time">{user.time}</span></div>
                <div className="active-user-action"><span className="action-badge">{user.action}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header"><h3>Customer Reviews</h3><a href="#" className="view-all">View All</a></div>
          <div className="reviews-list">
            {customerReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-avatar"><div className="avatar-circle">{review.avatar}</div></div>
                <div className="review-content">
                  <div className="review-header"><span className="review-name">{review.name}</span><span className="review-date">{review.date}</span></div>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                  <p className="review-text">{review.review}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW ROW 1: Booking Status + Recent Bookings (Filtered) */}
      <div className="charts-grid-two" style={{ marginBottom: '28px' }}>
        <div className="chart-card">
          <div className="chart-header"><h3><i className="bi bi-pie-chart"></i> Booking Status</h3></div>
          <div className="status-chart-wrapper">
            <div className="status-donut-container">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={2} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="status-center-label">314 <small>total</small></div>
            </div>
            <div className="status-legend-list">
              {statusData.map((s) => (
                <div key={s.name} className="status-legend-item">
                  <span className="dot" style={{ backgroundColor: s.color }}></span>
                  <span className="label">{s.name}</span>
                  <span className="count">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header"><h3><i className="bi bi-clock-history"></i> Recent Bookings {userRole !== 'admin' && <span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8' }}>({shopType})</span>}</h3><a href="#" className="view-all">View All</a></div>
          <div className="recent-bookings-table-wrap">
            <table className="recent-bookings-table">
              <thead><tr><th>Customer</th><th>Service</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {recentBookings.length > 0 ? recentBookings.map((b, idx) => (
                  <tr key={idx}>
                    <td>{b.customer}</td>
                    <td>{b.service}</td>
                    <td><span className={`booking-status-badge ${b.status.toLowerCase()}`}>{b.status}</span></td>
                    <td style={{ textAlign: 'right' }} className="booking-amount">${b.amount}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No recent bookings for your shop type.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NEW ROW 2: Top Agencies (Filtered) + Quick Insights */}
      <div className="charts-grid-two">
        <div className="chart-card">
          <div className="chart-header"><h3><i className="bi bi-trophy"></i> Top Agencies {userRole !== 'admin' && <span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8' }}>(Related)</span>}</h3><a href="#" className="view-all">View All</a></div>
          <div className="top-agencies-list">
            {topAgencies.map((a) => (
              <div key={a.rank} className="agency-item">
                <span className="agency-rank">#{a.rank}</span>
                <div className="agency-avatar" style={{ background: a.color }}>{a.initials}</div>
                <div className="agency-info">
                  <span className="agency-name">{a.name}</span>
                  <span className="agency-meta">{a.meta}</span>
                </div>
                <div className="agency-stats">
                  <div className="bookings-count">{a.bookings}</div>
                  <div className="revenue-small">${(a.revenue / 1000).toFixed(1)}K</div>
                  <div className="agency-progress">
                    <div className="agency-progress-bar" style={{ width: `${topAgencies.length > 0 ? (a.bookings / topAgencies[0].bookings) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header"><h3><i className="bi bi-lightning-fill"></i> Quick Insights</h3></div>
          <div className="quick-insights-grid">
            {insights.map((ins, idx) => (
              <div key={idx} className={`insight-card ${ins.accent}`}>
                <div className="insight-label">{ins.label}</div>
                <div className="insight-value">{ins.value}</div>
                <span className={`insight-change ${ins.up ? 'up' : 'down'}`}>{ins.change}</span>
              </div>
            ))}
          </div>
          <div className="peak-hour-note">
            <i className="bi bi-megaphone-fill"></i>
            <span>Peak booking hour: <strong>10:00 – 11:30 AM</strong> &nbsp;·&nbsp; 42% of daily bookings</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '18px' }}>
        <i className="bi bi-arrow-repeat" style={{ marginRight: '6px' }}></i> Data updates every 5 minutes &nbsp;·&nbsp; Dashboard v2.0
      </div>
    </div>
  );
}

export default Dashboard;