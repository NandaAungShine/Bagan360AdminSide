import React, { useState, useEffect } from 'react';
import Header from './Header';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

function Reports() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [timeFrame, setTimeFrame] = useState('weekly');

  const handleThemeChange = (isDark) => setIsDarkMode(isDark);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // ==================== DATA ====================
  const statsData = {
    shareholders: { total: 156, approved: 98, pending: 42, rejected: 16, today: 3, weekly: 18, monthly: 52, investment: '1.25B', shares: '245K' },
    users: { total: 2456, active: 1890, inactive: 566, today: 23, weekly: 145, monthly: 520 },
    bookings: { total: 2847, today: 23, weekly: 145, monthly: 580, avgValue: '438K' },
    revenue: { total: '1.25B', today: '23.5M', weekly: '98.2M', monthly: '385M', yearly: '1.25B', growth: '+22%' }
  };

  const categoryData = [
    { name: 'Hotels', bookings: 1245, revenue: 128, growth: '+12%', color: '#3b82f6', icon: 'bi-building' },
    { name: 'Restaurants', bookings: 856, revenue: 45.6, growth: '+8%', color: '#10b981', icon: 'bi-egg-fried' },
    { name: 'Hot Air Balloons', bookings: 489, revenue: 89.2, growth: '+20%', color: '#f59e0b', icon: 'bi-balloon' },
    { name: 'E-Bikes', bookings: 734, revenue: 12.5, growth: '+15%', color: '#8b5cf6', icon: 'bi-bicycle' },
    { name: 'Cars', bookings: 567, revenue: 23.4, growth: '+5%', color: '#ef4444', icon: 'bi-car-front' },
    { name: 'Destinations', bookings: 567, revenue: 34.5, growth: '+10%', color: '#84cc16', icon: 'bi-geo-alt' }
  ];

  const trendData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      bookings: [45, 52, 48, 61, 73, 85, 78],
      revenue: [12.5, 14.8, 13.2, 17.5, 20.8, 24.2, 22.1],
      users: [12, 15, 18, 14, 23, 20, 10]
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      bookings: [245, 278, 312, 298],
      revenue: [68.5, 78.9, 89.2, 84.5],
      users: [156, 178, 201, 189]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      bookings: [45, 52, 48, 61, 73, 85, 94, 108, 112, 125, 142, 158],
      revenue: [12.5, 14.8, 13.2, 17.5, 20.8, 24.2, 26.8, 30.8, 31.9, 35.6, 40.5, 45.0],
      users: [12, 15, 18, 14, 23, 20, 25, 28, 22, 30, 35, 28]
    },
    yearly: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      bookings: [120, 180, 245, 312, 398, 456],
      revenue: [32, 48, 68, 89, 115, 142],
      users: [45, 68, 89, 112, 145, 189]
    }
  };

  const currentData = trendData[timeFrame];
  const chartData = currentData.labels.map((label, i) => ({
    name: label,
    bookings: currentData.bookings[i],
    revenue: currentData.revenue[i],
    users: currentData.users[i]
  }));

  const ratingData = [
    { stars: 5, count: 456, percent: 45.6, color: '#10b981' },
    { stars: 4, count: 289, percent: 28.9, color: '#3b82f6' },
    { stars: 3, count: 156, percent: 15.6, color: '#f59e0b' },
    { stars: 2, count: 67, percent: 6.7, color: '#ef4444' },
    { stars: 1, count: 32, percent: 3.2, color: '#8b5cf6' }
  ];

  const shareholderTrend = {
    daily: [
      { name: 'Mon', new: 5, approved: 3 }, { name: 'Tue', new: 3, approved: 2 },
      { name: 'Wed', new: 4, approved: 3 }, { name: 'Thu', new: 2, approved: 2 },
      { name: 'Fri', new: 6, approved: 4 }, { name: 'Sat', new: 3, approved: 2 },
      { name: 'Sun', new: 1, approved: 1 }
    ],
    weekly: [
      { name: 'Week 1', new: 15, approved: 10 }, { name: 'Week 2', new: 18, approved: 12 },
      { name: 'Week 3', new: 12, approved: 8 }, { name: 'Week 4', new: 20, approved: 14 }
    ],
    monthly: [
      { name: 'Jan', new: 45, approved: 30 }, { name: 'Feb', new: 52, approved: 35 },
      { name: 'Mar', new: 48, approved: 32 }, { name: 'Apr', new: 56, approved: 38 },
      { name: 'May', new: 62, approved: 42 }, { name: 'Jun', new: 58, approved: 40 }
    ],
    yearly: [
      { name: '2020', new: 120, approved: 80 }, { name: '2021', new: 180, approved: 120 },
      { name: '2022', new: 220, approved: 150 }, { name: '2023', new: 280, approved: 190 },
      { name: '2024', new: 320, approved: 220 }
    ]
  };

  const userTrend = {
    daily: [
      { name: 'Mon', new: 12, active: 245 }, { name: 'Tue', new: 15, active: 268 },
      { name: 'Wed', new: 18, active: 289 }, { name: 'Thu', new: 14, active: 276 },
      { name: 'Fri', new: 23, active: 312 }, { name: 'Sat', new: 20, active: 298 },
      { name: 'Sun', new: 10, active: 256 }
    ],
    weekly: [
      { name: 'Week 1', new: 85, active: 1250 }, { name: 'Week 2', new: 92, active: 1320 },
      { name: 'Week 3', new: 78, active: 1280 }, { name: 'Week 4', new: 105, active: 1450 }
    ],
    monthly: [
      { name: 'Jan', new: 120, active: 890 }, { name: 'Feb', new: 135, active: 950 },
      { name: 'Mar', new: 148, active: 1020 }, { name: 'Apr', new: 156, active: 1100 },
      { name: 'May', new: 168, active: 1180 }, { name: 'Jun', new: 180, active: 1250 }
    ],
    yearly: [
      { name: '2020', new: 450, active: 1200 }, { name: '2021', new: 580, active: 1650 },
      { name: '2022', new: 720, active: 2100 }, { name: '2023', new: 890, active: 2450 },
      { name: '2024', new: 320, active: 1890 }
    ]
  };

  const topItems = [
    { rank: 1, name: 'Balloons Over Bagan', category: 'Hot Air Balloon', revenue: '88.9M', rating: 4.9, trend: '+15%' },
    { rank: 2, name: 'Aureum Palace Hotel', category: 'Hotel', revenue: '60.3M', rating: 4.9, trend: '+12%' },
    { rank: 3, name: 'Bagan Thande Hotel', category: 'Hotel', revenue: '43.2M', rating: 4.7, trend: '+8%' },
    { rank: 4, name: 'Shan Kitchen', category: 'Restaurant', revenue: '2.5M', rating: 4.8, trend: '+5%' },
    { rank: 5, name: 'Yadea C1S E-Bike', category: 'E-Bike', revenue: '2.2M', rating: 4.6, trend: '+3%' }
  ];

  const formatCurrency = (val) => {
    if (typeof val === 'string') return val;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="modern-tooltip">
          <p className="tooltip-title">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="tooltip-item" style={{ color: p.color }}>
              <span>{p.name}:</span> <strong>{p.name === 'Revenue' ? `${p.value}M` : p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Analytics & Reports" onThemeChange={handleThemeChange} />

      {/* Tab Navigation and Period Selector - Same Row */}
      <div className="tab-and-period-row">
        <div className="tab-nav">
          <button className={`tab-nav-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <i className="bi bi-speedometer2"></i> Overview
          </button>
          <button className={`tab-nav-btn ${activeTab === 'shareholders' ? 'active' : ''}`} onClick={() => setActiveTab('shareholders')}>
            <i className="bi bi-people-fill"></i> Shareholders
          </button>
          <button className={`tab-nav-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <i className="bi bi-grid-3x3-gap-fill"></i> Categories
          </button>
          <button className={`tab-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <i className="bi bi-person-badge-fill"></i> Users
          </button>
          <button className={`tab-nav-btn ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => setActiveTab('financial')}>
            <i className="bi bi-currency-dollar"></i> Financial
          </button>
        </div>

        <div className="period-selector">
          <button className={`period-btn ${timeFrame === 'daily' ? 'active' : ''}`} onClick={() => setTimeFrame('daily')}>
            <i className="bi bi-calendar-day"></i> Daily
          </button>
          <button className={`period-btn ${timeFrame === 'weekly' ? 'active' : ''}`} onClick={() => setTimeFrame('weekly')}>
            <i className="bi bi-calendar-week"></i> Weekly
          </button>
          <button className={`period-btn ${timeFrame === 'monthly' ? 'active' : ''}`} onClick={() => setTimeFrame('monthly')}>
            <i className="bi bi-calendar-month"></i> Monthly
          </button>
          <button className={`period-btn ${timeFrame === 'yearly' ? 'active' : ''}`} onClick={() => setTimeFrame('yearly')}>
            <i className="bi bi-calendar-year"></i> Yearly
          </button>
        </div>
      </div>

      {/* Main Stats Row - 5 cards */}
      <div className="stats-row">
        <div className="stat-card-v2">
          <div className="stat-icon purple"><i className="bi bi-people-fill"></i></div>
          <div className="stat-content">
            <span className="stat-label">Total Shareholders</span>
            <h2>{statsData.shareholders.total}</h2>
            <div className="stat-footer">
              <span className="stat-sub">{statsData.shareholders.approved} approved</span>
              <span className="stat-change up">+{statsData.shareholders.today} today</span>
            </div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon green"><i className="bi bi-currency-dollar"></i></div>
          <div className="stat-content">
            <span className="stat-label">Total Investment</span>
            <h2>{statsData.shareholders.investment}</h2>
            <div className="stat-footer">
              <span className="stat-sub">{statsData.shareholders.shares} shares</span>
              <span className="stat-change up">+8.5%</span>
            </div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon blue"><i className="bi bi-person-badge-fill"></i></div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <h2>{statsData.users.total.toLocaleString()}</h2>
            <div className="stat-footer">
              <span className="stat-sub">{statsData.users.active} active</span>
              <span className="stat-change up">+{statsData.users.today} today</span>
            </div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon orange"><i className="bi bi-calendar-check-fill"></i></div>
          <div className="stat-content">
            <span className="stat-label">Total Bookings</span>
            <h2>{statsData.bookings.total}</h2>
            <div className="stat-footer">
              <span className="stat-sub">Avg {statsData.bookings.avgValue}</span>
              <span className="stat-change up">+{statsData.bookings.today} today</span>
            </div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon red"><i className="bi bi-graph-up"></i></div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <h2>{statsData.revenue.total}</h2>
            <div className="stat-footer">
              <span className="stat-sub">This year</span>
              <span className="stat-change up">{statsData.revenue.growth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== OVERVIEW TAB ==================== */}
      {activeTab === 'overview' && (
        <div className="dashboard-layout">
          <div className="chart-card-v2 full">
            <div className="card-header">
              <h3><i className="bi bi-graph-up"></i> Booking & Revenue Trend ({timeFrame})</h3>
              <div className="legend">
                <span><span className="dot bookings-dot"></span> Bookings</span>
                <span><span className="dot revenue-dot"></span> Revenue (MMK)</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#e0e0e0'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#888' : '#666'} />
                <YAxis yAxisId="left" stroke={isDarkMode ? '#888' : '#666'} />
                <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#888' : '#666'} />
                <Tooltip content={<CustomTooltip />} />
                <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} name="Bookings" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="two-col-grid">
            <div className="chart-card-v2">
              <div className="card-header">
                <h3><i className="bi bi-bar-chart"></i> Category Performance</h3>
              </div>
              <div className="category-list">
                {categoryData.map((cat, i) => (
                  <div key={i} className="category-item">
                    <div className="category-left">
                      <span className="cat-icon" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                        <i className={`bi ${cat.icon}`}></i>
                      </span>
                      <div>
                        <div className="cat-name">{cat.name}</div>
                        <div className="cat-stats">{cat.bookings} bookings</div>
                      </div>
                    </div>
                    <div className="category-right">
                      <div className="cat-revenue">{cat.revenue}M MMK</div>
                      <div className="cat-growth">
                        <span className="growth-badge" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                          {cat.growth}
                        </span>
                      </div>
                      <div className="cat-progress">
                        <div className="progress-bar" style={{ width: `${(cat.revenue / 150) * 100}%`, backgroundColor: cat.color }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card-v2">
              <div className="card-header">
                <h3><i className="bi bi-star-fill"></i> Rating Distribution</h3>
              </div>
              {ratingData.map((item) => (
                <div key={item.stars} className="rating-item">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi bi-star${i < item.stars ? '-fill' : ''}`} style={{ color: i < item.stars ? item.color : '#ccc' }}></i>
                    ))}
                    <span className="rating-count">{item.count}</span>
                  </div>
                  <div className="rating-bar-wrapper">
                    <div className="rating-bar-bg">
                      <div className="rating-bar-fill" style={{ width: `${item.percent}%`, backgroundColor: item.color }}></div>
                    </div>
                    <span className="rating-percent">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card-v2 full">
            <div className="card-header">
              <h3><i className="bi bi-trophy-fill"></i> Top Performing Items</h3>
            </div>
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Rating</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item) => (
                    <tr key={item.rank}>
                      <td><span className={`rank-badge rank-${item.rank}`}>{item.rank}</span></td>
                      <td className="item-name">{item.name}</td>
                      <td><span className="category-tag">{item.category}</span></td>
                      <td className="revenue-cell">{item.revenue}</td>
                      <td>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi bi-star${i < Math.floor(item.rating) ? '-fill' : ''}`} style={{ color: '#ff8a00', fontSize: '11px' }}></i>
                          ))}
                          <span className="rating-val">{item.rating}</span>
                        </div>
                      </td>
                      <td className="trend-up">{item.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SHAREHOLDERS TAB ==================== */}
      {activeTab === 'shareholders' && (
        <div className="dashboard-layout">
          <div className="stats-row-mini">
            <div className="mini-stat"><i className="bi bi-check-circle-fill text-green"></i><div><h3>{statsData.shareholders.approved}</h3><span>Approved</span></div></div>
            <div className="mini-stat"><i className="bi bi-clock-history text-orange"></i><div><h3>{statsData.shareholders.pending}</h3><span>Pending</span></div></div>
            <div className="mini-stat"><i className="bi bi-x-circle-fill text-red"></i><div><h3>{statsData.shareholders.rejected}</h3><span>Rejected</span></div></div>
            <div className="mini-stat"><i className="bi bi-calendar-today text-blue"></i><div><h3>{statsData.shareholders.today}</h3><span>New Today</span></div></div>
          </div>

          <div className="chart-card-v2 full">
            <div className="card-header">
              <h3><i className="bi bi-graph-up"></i> Shareholder Registration Trend ({timeFrame})</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={shareholderTrend[timeFrame]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#e0e0e0'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#888' : '#666'} />
                <YAxis stroke={isDarkMode ? '#888' : '#666'} />
                <Tooltip />
                <Legend />
                <Bar dataKey="new" fill="#3b82f6" name="New Registrations" radius={[4,4,0,0]} />
                <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ==================== CATEGORIES TAB ==================== */}
      {activeTab === 'categories' && (
        <div className="dashboard-layout">
          <div className="two-col-grid">
            <div className="chart-card-v2">
              <div className="card-header">
                <h3><i className="bi bi-pie-chart"></i> Revenue Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="revenue" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card-v2">
              <div className="card-header">
                <h3><i className="bi bi-bar-chart"></i> Bookings by Category</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 70 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card-v2 full">
            <div className="card-header">
              <h3><i className="bi bi-table"></i> Category Details</h3>
            </div>
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Bookings</th>
                    <th>Revenue (MMK)</th>
                    <th>Growth</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((cat, i) => (
                    <tr key={i}>
                      <td><span className="dot" style={{ backgroundColor: cat.color }}></span> {cat.name}</td>
                      <td>{cat.bookings.toLocaleString()}</td>
                      <td>{cat.revenue}M</td>
                      <td><span className="growth-badge small" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>{cat.growth}</span></td>
                      <td><div className="progress-small"><div className="progress-fill" style={{ width: `${(cat.revenue / 150) * 100}%`, backgroundColor: cat.color }}></div></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== USERS TAB ==================== */}
      {activeTab === 'users' && (
        <div className="dashboard-layout">
          <div className="stats-row-mini">
            <div className="mini-stat"><i className="bi bi-people-fill text-purple"></i><div><h3>{statsData.users.total.toLocaleString()}</h3><span>Total Users</span></div></div>
            <div className="mini-stat"><i className="bi bi-person-plus-fill text-green"></i><div><h3>{statsData.users.today}</h3><span>New Today</span></div></div>
            <div className="mini-stat"><i className="bi bi-person-check-fill text-blue"></i><div><h3>{statsData.users.active.toLocaleString()}</h3><span>Active</span></div></div>
            <div className="mini-stat"><i className="bi bi-person-x-fill text-red"></i><div><h3>{statsData.users.inactive.toLocaleString()}</h3><span>Inactive</span></div></div>
          </div>

          <div className="chart-card-v2 full">
            <div className="card-header">
              <h3><i className="bi bi-graph-up"></i> User Growth Trend ({timeFrame})</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={userTrend[timeFrame]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#e0e0e0'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#888' : '#666'} />
                <YAxis stroke={isDarkMode ? '#888' : '#666'} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="new" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="New Users" />
                <Area type="monotone" dataKey="active" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ==================== FINANCIAL TAB ==================== */}
      {activeTab === 'financial' && (
        <div className="dashboard-layout">
          <div className="chart-card-v2 full">
            <div className="card-header">
              <h3><i className="bi bi-graph-up"></i> Revenue Trend ({timeFrame})</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#444' : '#e0e0e0'} />
                <XAxis dataKey="name" stroke={isDarkMode ? '#888' : '#666'} />
                <YAxis stroke={isDarkMode ? '#888' : '#666'} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Revenue (MMK)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="two-col-grid">
            <div className="chart-card-v2">
              <div className="card-header">
                <h3><i className="bi bi-star-fill"></i> Rating Distribution</h3>
              </div>
              {ratingData.map((item) => (
                <div key={item.stars} className="rating-item">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (<i key={i} className={`bi bi-star${i < item.stars ? '-fill' : ''}`} style={{ color: i < item.stars ? item.color : '#ccc' }}></i>))}
                    <span className="rating-count">{item.count}</span>
                  </div>
                  <div className="rating-bar-wrapper">
                    <div className="rating-bar-bg"><div className="rating-bar-fill" style={{ width: `${item.percent}%`, backgroundColor: item.color }}></div></div>
                    <span className="rating-percent">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-card-v2">
              <div className="card-header">
                <h3><i className="bi bi-trophy-fill"></i> Top Items by Revenue</h3>
              </div>
              <div className="top-items-list">
                {topItems.map((item) => (
                  <div key={item.rank} className="top-item">
                    <span className="item-rank">{item.rank}</span>
                    <div className="item-info">
                      <div className="item-name">{item.name}</div>
                      <div className="item-category">{item.category}</div>
                    </div>
                    <div className="item-revenue">{item.revenue}</div>
                    <div className="item-trend"><span className="growth-badge small" style={{ backgroundColor: '#10b98120', color: '#10b981' }}>{item.trend}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;