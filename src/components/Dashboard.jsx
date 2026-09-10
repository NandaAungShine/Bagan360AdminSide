// components/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Header from './Header';

// --------------------- API Base & Endpoints ---------------------
const API_BASE = 'http://130.94.21.185:8000';

// ⚠️ NOTE: Endpoints must match EXACTLY what the server expects.
// The user provided URLs show that 'thonebane' and 'restaurant' need trailing slash.
const SERVICE_BOOKING_ENDPOINTS = {
  hotel: '/api/admin/hotel/booking/list',
  destination: '/api/admin/destination/booking/list',
  'e-bike': '/api/admin/e-bike/booking/list',
  thonebane: '/api/admin/thonebane/booking/list/',
  restaurant: '/api/admin/restaurant/booking/list/',
  package: '/api/admin/package/booking/list',
};

const ALL_SERVICES = Object.keys(SERVICE_BOOKING_ENDPOINTS);

// --------------------- Shop Type Normalization ---------------------
// localStorage could store "EBike", "E-Bike", "ebike", "e_bike", "ThoneBane",
// "Thone Bane", "thonebane", etc. This normalizes all variants to the key
// used in SERVICE_BOOKING_ENDPOINTS.
const normalizeShopType = (rawType) => {
  if (!rawType) return 'hotel';
  const cleaned = String(rawType).toLowerCase().replace(/[\s_-]+/g, '');
  const aliases = {
    hotel: 'hotel',
    hotels: 'hotel',
    restaurant: 'restaurant',
    restaurants: 'restaurant',
    destination: 'destination',
    destinations: 'destination',
    package: 'package',
    packages: 'package',
    ebike: 'e-bike',
    electricbike: 'e-bike',
    ebikes: 'e-bike',
    thonebane: 'thonebane',
    thonebain: 'thonebane',
    thone: 'thonebane',
  };
  if (aliases[cleaned]) return aliases[cleaned];
  // Fallback: contains check (e.g., "thonebaneshop")
  for (const [alias, target] of Object.entries(aliases)) {
    if (cleaned.includes(alias)) return target;
  }
  return cleaned;
};

// Pretty display name for the shop badge
const prettyShopName = (normalized) => {
  const map = {
    'hotel': 'Hotel',
    'restaurant': 'Restaurant',
    'destination': 'Destination',
    'package': 'Package',
    'e-bike': 'E-Bike',
    'thonebane': 'ThoneBane',
  };
  return map[normalized] || normalized;
};

// --------------------- Defensive Field Getters ---------------------
// Different services may use different field names. These helpers keep the
// metrics code from crashing when a field is missing.
const getAmount = (b) => {
  if (!b) return 0;
  const v = b.amount ?? b.total_price ?? b.totalPrice ?? b.price ?? b.total ?? b.cost ?? 0;
  return Number(v) || 0;
};
const getStatus = (b) => {
  if (!b) return '';
  return String(b.status ?? b.booking_status ?? b.bookingStatus ?? b.state ?? b.payment_status ?? '').toLowerCase().trim();
};
const getDateValue = (b) => {
  if (!b) return null;
  const d = b.createdAt ?? b.created_at ?? b.booking_date ?? b.bookingDate ?? b.date ?? b.created_date ?? b.updatedAt;
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
};
const getCustomerName = (b) => {
  if (!b) return 'Guest';
  return b.customer ?? b.customer_name ?? b.customerName ?? b.user_name ?? b.userName ?? b.user ?? b.name ?? 'Guest';
};
const getServiceType = (b) => {
  if (!b) return 'Unknown';
  return b.serviceType ?? b.service_type ?? b.service ?? b.type ?? 'Unknown';
};
const getRating = (b) => {
  if (!b) return null;
  const r = b.rating ?? b.star ?? b.stars ?? b.review_rating;
  const n = Number(r);
  return isNaN(n) ? null : n;
};

// --------------------- Fetch Helper ---------------------
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`API ${response.status} at ${url}`);
  return response.json();
};

// --------------------- Main Component ---------------------
function Dashboard() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [timeRange, setTimeRange] = useState('weekly');
  const [userRole, setUserRole] = useState(null);
  const [shopType, setShopType] = useState(null);        // normalized, e.g. 'e-bike'
  const [shopTypeRaw, setShopTypeRaw] = useState(null);  // raw from localStorage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All fetched data
  const [allBookings, setAllBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);

  // --------------------- Authentication & Role ---------------------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const role = (localStorage.getItem('role') || 'admin').toLowerCase();
    const rawType = localStorage.getItem('shopType') || 'hotel';
    const normalized = normalizeShopType(rawType);

    console.log('[Dashboard] role:', role, '| rawShopType:', rawType, '| normalized:', normalized);

    setUserRole(role);
    setShopTypeRaw(rawType);
    setShopType(normalized);
  }, [navigate]);

  // --------------------- Fetch All Data ---------------------
  const fetchAllData = useCallback(async () => {
    if (!userRole) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Determine which booking endpoints to fetch
      let endpoints = [];
      if (userRole === 'admin') {
        endpoints = ALL_SERVICES.map((s) => ({ type: s, url: SERVICE_BOOKING_ENDPOINTS[s] }));
      } else {
        const url = SERVICE_BOOKING_ENDPOINTS[shopType];
        if (!url) {
          throw new Error(
            `Unknown shop type "${shopTypeRaw}" (normalized: "${shopType}"). ` +
            `Please set localStorage 'shopType' to one of: ${ALL_SERVICES.join(', ')}`
          );
        }
        endpoints = [{ type: shopType, url }];
      }

      console.log('[Dashboard] Fetching endpoints:', endpoints);

      // 2. Fetch bookings
      const bookingResults = await Promise.allSettled(
        endpoints.map((ep) => fetchWithAuth(ep.url))
      );

      let combined = [];
      bookingResults.forEach((result, idx) => {
        const ep = endpoints[idx];
        if (result.status === 'fulfilled') {
          const data = result.value;
          let items = [];
          if (Array.isArray(data)) items = data;
          else if (data && Array.isArray(data.results)) items = data.results;
          else if (data && Array.isArray(data.data)) items = data.data;
          else if (data && Array.isArray(data.items)) items = data.items;
          else {
            console.warn(`[Dashboard] Unexpected response for ${ep.type}:`, data);
          }
          // Tag each booking with its service type (so we know where it came from)
          items = items.map((it) => ({
            ...it,
            __serviceType: ep.type,
          }));
          combined = combined.concat(items);
          console.log(`[Dashboard] ${ep.type} → ${items.length} bookings`);
        } else {
          console.error(`[Dashboard] Failed to fetch ${ep.type}:`, result.reason);
        }
      });
      setAllBookings(combined);

      // 3. Admin: also fetch users + shops
      if (userRole === 'admin') {
        const [usersRes, shopsRes] = await Promise.allSettled([
          fetchWithAuth('/auth/user/list'),
          fetchWithAuth('/auth/shop/list'),
        ]);
        if (usersRes.status === 'fulfilled') {
          const d = usersRes.value;
          setUsers(Array.isArray(d) ? d : d?.results || d?.data || []);
        } else {
          console.warn('[Dashboard] users fetch failed:', usersRes.reason);
          setUsers([]);
        }
        if (shopsRes.status === 'fulfilled') {
          const d = shopsRes.value;
          setShops(Array.isArray(d) ? d : d?.results || d?.data || []);
        } else {
          console.warn('[Dashboard] shops fetch failed:', shopsRes.reason);
          setShops([]);
        }
      } else {
        setUsers([]);
        setShops([]);
      }
    } catch (err) {
      console.error('[Dashboard] Fatal error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userRole, shopType, shopTypeRaw]);

  useEffect(() => {
    if (userRole) fetchAllData();
  }, [userRole, shopType, fetchAllData]);

  // --------------------- Theme ---------------------
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  const handleThemeChange = (isDark) => setIsDarkMode(isDark);

  // ===================== DATA PROCESSING =====================

  // 1. Main Metrics
  const computeMetrics = useMemo(() => {
    const total = allBookings.length;
    const revenue = allBookings.reduce((sum, b) => sum + getAmount(b), 0);
    const ratings = allBookings.map(getRating).filter((r) => r != null);
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    const counts = { approved: 0, cancelled: 0, rejected: 0, pending: 0, other: 0 };
    allBookings.forEach((b) => {
      const s = getStatus(b);
      if (['approved', 'approve', 'confirmed', 'confirm', 'completed', 'complete', 'success', 'active', 'done'].includes(s)) {
        counts.approved++;
      } else if (['cancelled', 'cancel', 'canceled'].includes(s)) {
        counts.cancelled++;
      } else if (['rejected', 'reject', 'declined', 'denied'].includes(s)) {
        counts.rejected++;
      } else if (['pending', 'waiting', 'processing', 'new', 'in_progress'].includes(s)) {
        counts.pending++;
      } else {
        counts.other++;
      }
    });

    return { total, revenue, avgRating, ...counts, statusCounts: counts };
  }, [allBookings]);

  // 2. Admin user metrics
  const adminUserMetrics = useMemo(() => {
    const activeUsers = users.length;
    const today = new Date().toISOString().split('T')[0];
    const todayActive = users.filter((u) => {
      const lastLogin = u.last_login || u.lastLogin || u.updatedAt || u.createdAt || u.date_joined;
      if (!lastLogin) return false;
      const d = new Date(lastLogin);
      if (isNaN(d.getTime())) return false;
      return d.toISOString().split('T')[0] === today;
    }).length;

    const latestUsers = [...users]
      .sort((a, b) => {
        const da = new Date(a.last_login || a.lastLogin || a.updatedAt || 0);
        const db = new Date(b.last_login || b.lastLogin || b.updatedAt || 0);
        return db - da;
      })
      .slice(0, 5)
      .map((u) => ({
        name: u.username || u.name || u.email || 'User',
        time: (() => {
          const d = u.last_login || u.lastLogin || u.updatedAt;
          if (!d) return 'Just now';
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? 'Just now' : dt.toLocaleTimeString();
        })(),
        action: 'Active',
      }));

    return { activeUsers, todayActive, latestUsers };
  }, [users]);

  // 3. User Growth data (Admin)
  const userGrowthData = useMemo(() => {
    const dateMap = {};
    users.forEach((u) => {
      const d = u.createdAt || u.created_at || u.date_joined;
      if (!d) return;
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return;
      const key = dt.toISOString().split('T')[0];
      dateMap[key] = (dateMap[key] || 0) + 1;
    });
    return Object.entries(dateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, count]) => ({ date, users: count }));
  }, [users]);

  // 4. Trend Data
  const trendData = useMemo(() => {
    if (!allBookings.length) return [];
    const groupKey = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      if (timeRange === 'daily') return `${y}-${m}-${d}`;
      if (timeRange === 'weekly') {
        const firstDay = new Date(y, 0, 1);
        const pastDays = (date - firstDay) / 86400000;
        const week = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
        return `${y}-W${String(week).padStart(2, '0')}`;
      }
      if (timeRange === 'monthly') return `${y}-${m}`;
      return `${y}`;
    };

    const groups = {};
    allBookings.forEach((b) => {
      const date = getDateValue(b);
      if (!date) return;
      const key = groupKey(date);
      if (!groups[key]) groups[key] = { bookings: 0, revenue: 0, label: key };
      groups[key].bookings += 1;
      groups[key].revenue += getAmount(b);
    });

    return Object.values(groups)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((item) => ({
        ...item,
        label:
          timeRange === 'daily' ? item.label.slice(5) :
          timeRange === 'weekly' ? `Week ${item.label.split('-W')[1]}` :
          timeRange === 'monthly' ? item.label.slice(5) : item.label,
      }));
  }, [allBookings, timeRange]);

  // 5. Distribution
  const distributionData = useMemo(() => {
    if (userRole === 'admin') {
      const counts = {};
      allBookings.forEach((b) => {
        const service = b.__serviceType || getServiceType(b);
        counts[service] = (counts[service] || 0) + 1;
      });
      const total = allBookings.length || 1;
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value: Math.round((value / total) * 100),
      }));
    } else {
      // Shop: distribution by status
      const { statusCounts } = computeMetrics;
      const total = allBookings.length || 1;
      return Object.entries(statusCounts)
        .filter(([_, v]) => v > 0)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: Math.round((value / total) * 100),
        }));
    }
  }, [allBookings, userRole, computeMetrics]);

  // 6. Status data (pie chart)
  const statusData = useMemo(() => {
    const { statusCounts } = computeMetrics;
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color:
          name === 'approved' ? '#10b981' :
          name === 'cancelled' ? '#ef4444' :
          name === 'rejected' ? '#f59e0b' :
          name === 'pending' ? '#3b82f6' : '#94a3b8',
      }));
  }, [computeMetrics]);

  // 7. Recent bookings
  const recentBookings = useMemo(() => {
    return [...allBookings]
      .sort((a, b) => {
        const da = getDateValue(a);
        const db = getDateValue(b);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db - da;
      })
      .slice(0, 5)
      .map((b) => ({
        customer: getCustomerName(b),
        service: userRole === 'admin' ? (b.__serviceType || getServiceType(b)) : shopType,
        status: getStatus(b) || 'pending',
        amount: getAmount(b),
      }));
  }, [allBookings, userRole, shopType]);

  // 8. Top agencies (Admin)
  const topAgencies = useMemo(() => {
    if (userRole !== 'admin') return [];
    const counts = {};
    allBookings.forEach((b) => {
      const service = b.__serviceType || getServiceType(b);
      if (!counts[service]) counts[service] = { bookings: 0, revenue: 0 };
      counts[service].bookings += 1;
      counts[service].revenue += getAmount(b);
    });
    const palette = ['#f59e0b', '#8b5cf6', '#10b981', '#ec4899', '#3b82f6'];
    return Object.entries(counts)
      .map(([name, data], i) => ({
        name,
        meta: `${data.bookings} bookings`,
        bookings: data.bookings,
        revenue: data.revenue,
        color: palette[i % palette.length],
        initials: name.slice(0, 2).toUpperCase(),
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [allBookings, userRole]);

  // 9. Quick insights
  const insights = useMemo(() => {
    const { total, revenue, avgRating, approved, cancelled, pending } = computeMetrics;
    const conversion = total ? Math.round((approved / total) * 100) : 0;
    const avgValue = total ? revenue / total : 0;
    const refund = total ? Math.round((cancelled / total) * 100) : 0;
    return [
      { label: 'Conversion Rate', value: `${conversion}%`, change: '+4.2%', up: true, accent: 'accent-blue' },
      { label: 'Avg. Booking Value', value: `$${avgValue.toFixed(0)}`, change: '+7.8%', up: true, accent: 'accent-green' },
      { label: 'Refund Rate', value: `${refund}%`, change: '+0.3%', up: false, accent: 'accent-orange' },
      { label: 'Pending', value: pending, change: '+12%', up: true, accent: 'accent-purple' },
      { label: 'Avg Rating', value: avgRating.toFixed(1), change: '+0.2', up: true, accent: 'accent-blue' },
    ];
  }, [computeMetrics]);

  // 10. Customer Reviews (Dummy - Replace with real API)
  const customerReviews = [
    { id: 1, name: 'John Doe', rating: 5, review: 'Excellent service!', date: '2 days ago', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', rating: 4, review: 'Great experience.', date: '3 days ago', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', rating: 5, review: 'Amazing tour package!', date: '5 days ago', avatar: 'MJ' },
    { id: 4, name: 'Sarah Williams', rating: 4, review: 'Good service, quick response.', date: '1 week ago', avatar: 'SW' },
  ];

  // ===================== RENDER HELPERS =====================
  const renderStars = (rating) =>
    Array(5).fill().map((_, i) => (
      <i key={i} className={`bi bi-star${i < rating ? '-fill' : ''}`}
        style={{ color: '#ff8a00', fontSize: '12px' }}></i>
    ));

  const getColor = (name) => {
    const map = {
      hotel: '#ff8a00', destination: '#10b981', 'e-bike': '#3b82f6',
      thonebane: '#8b5cf6', restaurant: '#ec4899', package: '#f59e0b',
      approved: '#10b981', cancelled: '#ef4444', rejected: '#f59e0b',
      pending: '#3b82f6', other: '#94a3b8',
    };
    return map[String(name || '').toLowerCase()] || '#94a3b8';
  };

  // --------------------- Loading / Error ---------------------
  if (loading) {
    return (
      <div className="dashboard-loading" style={{ padding: '60px', textAlign: 'center', fontSize: '16px' }}>
        <i className="bi bi-arrow-repeat" style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}></i>
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', color: '#ef4444', fontSize: '15px' }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '42px', display: 'block', marginBottom: '14px' }}></i>
        <strong style={{ fontSize: '18px' }}>Dashboard Error</strong>
        <p style={{ marginTop: '12px', color: '#64748b', maxWidth: '600px', margin: '12px auto' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '16px', padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ============================================================
  // ===================== RENDER (ADMIN) =====================
  // ============================================================
  if (userRole === 'admin') {
    const adminMetrics = [
      { title: 'Total Bookings', value: computeMetrics.total, icon: 'bi-calendar-check-fill', color: '#3b82f6' },
      { title: 'Total Revenue', value: `$${computeMetrics.revenue.toLocaleString()}`, icon: 'bi-currency-dollar', color: '#10b981' },
      { title: 'Active Users', value: adminUserMetrics.activeUsers, icon: 'bi-people-fill', color: '#8b5cf6' },
      { title: 'Active Agency/Shop', value: shops.length, icon: 'bi-shop', color: '#ec4899' },
      { title: 'Today Active', value: adminUserMetrics.todayActive, icon: 'bi-person-check-fill', color: '#f59e0b' },
      { title: 'Avg Rating', value: computeMetrics.avgRating.toFixed(1), icon: 'bi-star-fill', color: '#ef4444' },
    ];

    const todayActiveUsers = adminUserMetrics.latestUsers.length > 0
      ? adminUserMetrics.latestUsers
      : [
          { name: 'John Doe', time: '10:30 AM', action: 'Booked Hotel' },
          { name: 'Jane Smith', time: '09:45 AM', action: 'Reviewed Restaurant' },
          { name: 'Mike Johnson', time: '11:20 AM', action: 'Booked Tour' },
          { name: 'Sarah Williams', time: '08:15 AM', action: 'Registered' },
          { name: 'David Brown', time: '02:30 PM', action: 'Booked Car' },
        ];

    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Dashboard" onThemeChange={handleThemeChange} />

        <div style={{ padding: '0 28px', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
          <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 14px', borderRadius: '20px' }}>
            👑 Admin
          </span>
        </div>

        {/* Time Range Selector */}
        <div className="time-range-selector">
          <button className={`time-btn ${timeRange === 'daily' ? 'active' : ''}`} onClick={() => setTimeRange('daily')}><i className="bi bi-calendar-day"></i> Daily</button>
          <button className={`time-btn ${timeRange === 'weekly' ? 'active' : ''}`} onClick={() => setTimeRange('weekly')}><i className="bi bi-calendar-week"></i> Weekly</button>
          <button className={`time-btn ${timeRange === 'monthly' ? 'active' : ''}`} onClick={() => setTimeRange('monthly')}><i className="bi bi-calendar-month"></i> Monthly</button>
          <button className={`time-btn ${timeRange === 'yearly' ? 'active' : ''}`} onClick={() => setTimeRange('yearly')}><i className="bi bi-calendar-year"></i> Yearly</button>
        </div>

        {/* Metrics */}
        <div className="important-metrics-grid">
          {adminMetrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="metric-icon" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
                <i className={`bi ${metric.icon}`}></i>
              </div>
              <div className="metric-info">
                <h3>{metric.value}</h3>
                <p>{metric.title}</p>
                <span className="metric-change positive">+12.5%</span>
              </div>
            </div>
          ))}
        </div>

        {/* 3 Charts */}
        <div className="charts-grid-three">
          {/* Trend */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Booking & Revenue Trend</h3>
              <div className="chart-legend">
                <span><span className="legend-color bookings"></span> Bookings</span>
                <span><span className="legend-color revenue"></span> Revenue</span>
              </div>
            </div>
            {trendData.length === 0 ? (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                  <XAxis dataKey="label" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                  <YAxis yAxisId="left" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#252a41' : '#fff', border: 'none', borderRadius: '8px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff8a00" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* User Growth */}
          <div className="chart-card">
            <div className="chart-header"><h3>User Growth</h3></div>
            {userGrowthData.length === 0 ? (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No user data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                  <XAxis dataKey="date" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                  <YAxis stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Distribution */}
          <div className="chart-card">
            <div className="chart-header"><h3>Booking Distribution</h3></div>
            {distributionData.length === 0 ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No distribution data
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {distributionData.map((item, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: getColor(item.name) }}></span>
                      <span>{item.name}</span>
                      <span className="legend-value">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Today Active Users + Reviews */}
        <div className="charts-grid-two">
          <div className="chart-card">
            <div className="chart-header"><h3><i className="bi bi-person-activity"></i> Today's Active Users</h3></div>
            <div className="active-users-list">
              {todayActiveUsers.map((user, index) => (
                <div key={index} className="active-user-item">
                  <div className="active-user-avatar"><i className="bi bi-person-circle"></i></div>
                  <div className="active-user-info">
                    <span className="active-user-name">{user.name}</span>
                    <span className="active-user-time">{user.time}</span>
                  </div>
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
                    <div className="review-header">
                      <span className="review-name">{review.name}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                    <p className="review-text">{review.review}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Booking Status + Recent Bookings */}
        <div className="charts-grid-two" style={{ marginBottom: '28px' }}>
          <div className="chart-card">
            <div className="chart-header"><h3><i className="bi bi-pie-chart"></i> Booking Status</h3></div>
            {statusData.length === 0 ? (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                No status data
              </div>
            ) : (
              <div className="status-chart-wrapper">
                <div className="status-donut-container">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={2} dataKey="value">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="status-center-label">{computeMetrics.total} <small>total</small></div>
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
            )}
          </div>
          <div className="chart-card">
            <div className="chart-header"><h3><i className="bi bi-clock-history"></i> Recent Bookings</h3><a href="#" className="view-all">View All</a></div>
            <div className="recent-bookings-table-wrap">
              <table className="recent-bookings-table">
                <thead><tr><th>Customer</th><th>Service</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                <tbody>
                  {recentBookings.length > 0 ? recentBookings.map((b, idx) => (
                    <tr key={idx}>
                      <td>{b.customer}</td>
                      <td>{b.service}</td>
                      <td><span className={`booking-status-badge ${b.status}`}>{b.status}</span></td>
                      <td style={{ textAlign: 'right' }} className="booking-amount">${b.amount}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No recent bookings</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Row 4: Top Agencies + Quick Insights */}
        <div className="charts-grid-two">
          <div className="chart-card">
            <div className="chart-header"><h3><i className="bi bi-trophy"></i> Top Agencies</h3><a href="#" className="view-all">View All</a></div>
            <div className="top-agencies-list">
              {topAgencies.length > 0 ? topAgencies.map((a) => (
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
                      <div className="agency-progress-bar" style={{ width: `${(a.bookings / topAgencies[0].bookings) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No agency data</div>
              )}
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

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '18px' }}>
          <i className="bi bi-arrow-repeat" style={{ marginRight: '6px' }}></i> Data updates every 5 minutes &nbsp;·&nbsp; Dashboard v2.0
        </div>
      </div>
    );
  }

  // ============================================================
  // ===================== RENDER (SHOP) =====================
  // ============================================================
  const shopMetrics = [
    { title: 'Total Bookings', value: computeMetrics.total, icon: 'bi-calendar-check-fill', color: '#3b82f6' },
    { title: 'Total Revenue', value: `$${computeMetrics.revenue.toLocaleString()}`, icon: 'bi-currency-dollar', color: '#10b981' },
    { title: 'Avg Rating', value: computeMetrics.avgRating.toFixed(1), icon: 'bi-star-fill', color: '#ef4444' },
    { title: 'Total Approve', value: computeMetrics.approved, icon: 'bi-check-circle-fill', color: '#10b981' },
    { title: 'Total Cancel', value: computeMetrics.cancelled, icon: 'bi-x-circle-fill', color: '#ef4444' },
    { title: 'Total Reject', value: computeMetrics.rejected, icon: 'bi-dash-circle-fill', color: '#f59e0b' },
  ];

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Dashboard" onThemeChange={handleThemeChange} />

      <div style={{ padding: '0 28px', marginBottom: '12px', fontSize: '14px', fontWeight: '500' }}>
        <span style={{ background: '#10b981', color: '#fff', padding: '4px 14px', borderRadius: '20px' }}>
          🏪 Shop ({prettyShopName(shopType)})
        </span>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector">
        <button className={`time-btn ${timeRange === 'daily' ? 'active' : ''}`} onClick={() => setTimeRange('daily')}><i className="bi bi-calendar-day"></i> Daily</button>
        <button className={`time-btn ${timeRange === 'weekly' ? 'active' : ''}`} onClick={() => setTimeRange('weekly')}><i className="bi bi-calendar-week"></i> Weekly</button>
        <button className={`time-btn ${timeRange === 'monthly' ? 'active' : ''}`} onClick={() => setTimeRange('monthly')}><i className="bi bi-calendar-month"></i> Monthly</button>
        <button className={`time-btn ${timeRange === 'yearly' ? 'active' : ''}`} onClick={() => setTimeRange('yearly')}><i className="bi bi-calendar-year"></i> Yearly</button>
      </div>

      {/* Shop Metrics */}
      <div className="important-metrics-grid">
        {shopMetrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: `${metric.color}15`, color: metric.color }}>
              <i className={`bi ${metric.icon}`}></i>
            </div>
            <div className="metric-info">
              <h3>{metric.value}</h3>
              <p>{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Trend + Distribution */}
      <div className="charts-grid-two" style={{ marginBottom: '28px' }}>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Booking & Revenue Trend</h3>
            <div className="chart-legend">
              <span><span className="legend-color bookings"></span> Bookings</span>
              <span><span className="legend-color revenue"></span> Revenue</span>
            </div>
          </div>
          {trendData.length === 0 ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No trend data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#e0e0e0'} />
                <XAxis dataKey="label" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                <YAxis yAxisId="left" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? '#a0aec0' : '#666'} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#252a41' : '#fff', border: 'none', borderRadius: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff8a00" strokeWidth={2} dot={{ r: 3 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3>Booking Distribution</h3></div>
          {distributionData.length === 0 ? (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No distribution data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {distributionData.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: getColor(item.name) }}></span>
                    <span>{item.name}</span>
                    <span className="legend-value">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Booking Status + Recent Bookings */}
      <div className="charts-grid-two" style={{ marginBottom: '28px' }}>
        <div className="chart-card">
          <div className="chart-header"><h3><i className="bi bi-pie-chart"></i> Booking Status</h3></div>
          {statusData.length === 0 ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              No status data
            </div>
          ) : (
            <div className="status-chart-wrapper">
              <div className="status-donut-container">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={2} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="status-center-label">{computeMetrics.total} <small>total</small></div>
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
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3><i className="bi bi-clock-history"></i> Recent Bookings <span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8' }}>({prettyShopName(shopType)})</span></h3>
            <a href="#" className="view-all">View All</a>
          </div>
          <div className="recent-bookings-table-wrap">
            <table className="recent-bookings-table">
              <thead><tr><th>Customer</th><th>Service</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {recentBookings.length > 0 ? recentBookings.map((b, idx) => (
                  <tr key={idx}>
                    <td>{b.customer}</td>
                    <td>{prettyShopName(shopType)}</td>
                    <td><span className={`booking-status-badge ${b.status}`}>{b.status}</span></td>
                    <td style={{ textAlign: 'right' }} className="booking-amount">${b.amount}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No recent bookings</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Reviews + Insights */}
      <div className="charts-grid-two">
        <div className="chart-card">
          <div className="chart-header"><h3><i className="bi bi-chat-dots"></i> Customer Reviews</h3><a href="#" className="view-all">View All</a></div>
          <div className="reviews-list">
            {customerReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-avatar"><div className="avatar-circle">{review.avatar}</div></div>
                <div className="review-content">
                  <div className="review-header">
                    <span className="review-name">{review.name}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                  <p className="review-text">{review.review}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
            <i className="bi bi-info-circle"></i> Review data is placeholder. Integrate a review API for real data.
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

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '18px' }}>
        <i className="bi bi-arrow-repeat" style={{ marginRight: '6px' }}></i> Data updates every 5 minutes &nbsp;·&nbsp; Dashboard v2.0
      </div>
    </div>
  );
}

export default Dashboard;