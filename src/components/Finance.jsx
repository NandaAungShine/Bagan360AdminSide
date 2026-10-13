// Finance.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

// ---------------- Helpers ----------------
const fmt = (n) => Number(n || 0).toLocaleString();

const BACKEND_URL = 'http://130.94.21.185:8000';

const buildImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `${BACKEND_URL}/${img.replace(/^\/+/, '')}`;
};

const PAYMENT_OPTIONS = ['K Pay', 'Wave Pay', 'CB Pay', 'UAB Pay', 'AYA Pay', 'Cash'];

const normalizeTax = (tax) => {
  if (!tax) return '';
  const t = String(tax).toLowerCase().trim().replace(/[-\s]/g, '_');
  if (t === 'percent') return 'percentage';
  return t;
};

const isMonthlyTax = (tax) => ['monthly', 'daily', 'weekly', 'yearly'].includes(normalizeTax(tax));
const isPercentageTax = (tax) => normalizeTax(tax) === 'percentage';

const currentBillingMonth = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
};

const readTotalBooking = (r) =>
  Number(
    r?.total_booking ?? r?.totalBooking ?? r?.bookings ??
    r?.booking_count ?? r?.bookingCount ?? 0
  ) || 0;

// period range helpers
const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const periodFromCreatedAt = (createdAt) => {
  if (!createdAt) {
    const now = new Date();
    return { start: fmtDate(now), end: fmtDate(now) };
  }
  const d = new Date(String(createdAt).replace(' ', 'T'));
  if (isNaN(d.getTime())) return { start: createdAt, end: createdAt };
  return { start: fmtDate(d), end: fmtDate(d) };
};

const periodFromBillingMonth = (billing) => {
  if (!billing) {
    const now = new Date();
    return { start: fmtDate(now), end: fmtDate(now) };
  }
  const [y, m] = String(billing).split('-').map(Number);
  if (!y || !m) {
    const now = new Date();
    return { start: fmtDate(now), end: fmtDate(now) };
  }
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  return { start: fmtDate(start), end: fmtDate(end) };
};

// ---------------- Mock Data ----------------
const MOCK_SHOPS = [
  {
    id: 1, shopCode: 'S001', name: 'kaung', owner: 'kaung',
    phone: '091234567', email: 'yarsu673@gmail.com', status: 'active',
    tax: 'percentage',
    image: null, created: '01 Apr 2026, 22:37',
    platformFee: { method: 'daily', amount: 10000 },
    commissionFee: { method: 'daily', percentage: 50 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: true,
  },
  {
    id: 2, shopCode: 'S002', name: 'PRO Burger & Coffee', owner: 'Aung',
    phone: '09960374233', email: 'kit303202@gmail.com', status: 'active',
    tax: 'monthly',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    created: '12 Mar 2026, 09:10',
    platformFee: { method: 'weekly', amount: 50000 },
    commissionFee: { method: 'weekly', percentage: 30 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: true,
  },
];

const PER_PAGE = 8;

function Finance() {
  // ---------------- Theme ----------------
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.body.classList.add(isDarkMode ? 'dark-mode' : 'light-mode');
    document.body.classList.remove(isDarkMode ? 'light-mode' : 'dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // ---------------- API Helpers ----------------
  const getToken = () =>
    localStorage.getItem('token') || localStorage.getItem('access_token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const SHOP_API = '/auth/shop';
  const USER_API = '/auth/user';
  const API_BASE = '/api/admin/finance';
  const PERCENTAGE_API = '/api/admin/percentage';
  const TAX_API = '/api/admin/tax';

  // ---------------- States ----------------
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [selectedShop, setSelectedShop] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [allPercentages, setAllPercentages] = useState([]);
  const [allTaxes, setAllTaxes] = useState([]);

  const [percentageRecords, setPercentageRecords] = useState([]);
  const [taxRecords, setTaxRecords] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Percentage create form
  const [percForm, setPercForm] = useState({ total_booking: '' });
  const [percSubmitting, setPercSubmitting] = useState(false);

  // Tax create form (Amount + Payment + Reason)
  const [taxForm, setTaxForm] = useState({ amount: '', payment: 'Cash', reason: '' });
  const [taxSubmitting, setTaxSubmitting] = useState(false);

  // Tax inline edit
  const [editingTaxId, setEditingTaxId] = useState(null);
  const [editTaxForm, setEditTaxForm] = useState({ amount: '', payment: 'Cash', reason: '' });

  // Percentage inline edit
  const [editingPercId, setEditingPercId] = useState(null);
  const [editPercForm, setEditPercForm] = useState({ total_booking: '' });

  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  // Toast
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimer = useRef(null);
  const showToast = (type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, type, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  // ---------------- Normalize shop ----------------
  const normalizeShop = (s) => {
    if (!s) return null;

    const user =
      s.user || s.owner_user || s.ownerUser || s.owner_info ||
      s.ownerInfo || s.user_info || s.account || {};

    const rawId = s.id ?? s.shop_id ?? s.shopId;
    const userId = s.user_id ?? s.userId ?? s.owner_id ?? user.id ?? null;

    const ownerName =
      s.owner_name ?? s.ownerName ?? s.owner ?? s.username ??
      s.user_name ?? s.userName ?? s.owner_full_name ??
      user.name ?? user.username ?? user.full_name ?? user.fullName ?? '';

    const phone =
      s.shop_phone ?? s.phone ?? s.phone_number ?? s.phoneNumber ??
      s.mobile ?? s.mobile_number ?? s.contact ?? s.contact_number ??
      user.phone ?? user.phone_number ?? user.phoneNumber ?? user.mobile ?? '';

    const email =
      s.email ?? s.email_address ?? s.emailAddress ??
      user.email ?? user.email_address ?? user.emailAddress ?? '';

    const tax = normalizeTax(s.tax ?? s.tax_type ?? s.taxType ?? '');

    return {
      id: rawId,
      user_id: userId,
      shopCode: s.shop_code ?? s.shopCode ?? s.code ?? `S${String(rawId || 0).padStart(3, '0')}`,
      name: s.name ?? s.shop_name ?? s.shopName ?? 'Shop',
      owner: ownerName,
      phone,
      email,
      status: (s.status || 'active').toLowerCase(),
      tax,
      image: buildImageUrl(s.image ?? s.logo ?? s.photo ?? s.image_url),
      created: s.created_at || s.createdAt
        ? new Date(s.created_at || s.createdAt).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : '',
      shopType: s.shop_type ?? s.shopType ?? s.type ?? '',
      platformFee: s.platform_fee || s.platformFee || { method: 'monthly', amount: 0 },
      commissionFee: s.commission_fee || s.commissionFee || { method: 'percentage', percentage: 0 },
      platformFeeRecords: s.platform_fee_records || s.platformFeeRecords || [],
      commissionRecords: s.commission_records || s.commissionRecords || [],
      needsPayment: s.needs_payment ?? s.needsPayment ?? false,
      raw: s,
    };
  };

  // ---------------- Enrich with user list ----------------
  const enrichWithUsers = async (shopList) => {
    const needUserInfo = shopList.some(s => !s.email || !s.owner || !s.phone);
    if (!needUserInfo) return shopList;

    try {
      const res = await fetch(`${USER_API}/list`, { headers: getHeaders() });
      if (!res.ok) return shopList;
      const json = await res.json();
      const arr = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.users)
            ? json.users
            : [];

      const map = {};
      arr.forEach(u => {
        const uid = u.id ?? u.user_id ?? u.userId;
        if (uid != null) {
          map[uid] = {
            email: u.email || u.email_address || '',
            name: u.name || u.username || u.full_name || u.fullName || '',
            phone: u.phone || u.phone_number || u.mobile || '',
          };
        }
      });

      return shopList.map(s => {
        const u = s.user_id != null ? map[s.user_id] : null;
        if (!u) return s;
        return {
          ...s,
          email: s.email || u.email || '',
          owner: s.owner || u.name || '',
          phone: s.phone || u.phone || '',
        };
      });
    } catch (e) {
      console.warn('User enrichment failed:', e.message);
      return shopList;
    }
  };

  // ---------------- Fetch Shops ----------------
  const fetchShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (token) {
        const res = await fetch(`${SHOP_API}/list`, { headers: getHeaders() });
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        if (res.ok) {
          const data = await res.json();
          let list = [];
          if (Array.isArray(data)) list = data;
          else if (Array.isArray(data.data)) list = data.data;
          else if (Array.isArray(data.shops)) list = data.shops;
          else if (Array.isArray(data.list)) list = data.list;

          if (list.length) {
            let normalized = list.map(normalizeShop).filter(Boolean);
            normalized = await enrichWithUsers(normalized);
            setShops(normalized);
            setLoading(false);
            return;
          }
        } else {
          const txt = await res.text();
          throw new Error(`Server error ${res.status}: ${txt.substring(0, 100)}`);
        }
      }
    } catch (e) {
      console.warn('Shop API unavailable, using mock data.', e.message);
      setError(e.message);
    }
    setShops(MOCK_SHOPS);
    setLoading(false);
  };

  const fetchGlobalFinanceExtras = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        fetch(`${PERCENTAGE_API}/list`, { headers: getHeaders() }).catch(() => null),
        fetch(`${TAX_API}/list`, { headers: getHeaders() }).catch(() => null),
      ]);
      if (pRes && pRes.ok) {
        const d = await pRes.json();
        const list = d.data || d.list || (Array.isArray(d) ? d : []);
        setAllPercentages(list);
      }
      if (tRes && tRes.ok) {
        const d = await tRes.json();
        const list = d.data || d.list || (Array.isArray(d) ? d : []);
        setAllTaxes(list);
      }
    } catch (e) {
      console.warn('Finance extras fetch failed:', e.message);
    }
  };

  useEffect(() => {
    fetchShops();
    fetchGlobalFinanceExtras();
    /* eslint-disable-next-line */
  }, []);

  // ---------------- Outside click ----------------
  useEffect(() => {
    const handler = (e) => {
      if (showNotif && notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotif]);

  // ---------------- Filters ----------------
  const filtered = shops.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.owner || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.shopCode || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedShops = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  useEffect(() => { setPage(1); }, [searchTerm]);

  // ---------------- Summary ----------------
  const totalPlatformFees = shops.reduce((sum, s) =>
    sum + (s.platformFeeRecords || []).filter(r => r.status === 'paid').reduce((a, r) => a + (r.amount || 0), 0), 0);
  const totalCommissionFees = shops.reduce((sum, s) =>
    sum + (s.commissionRecords || []).filter(r => r.status === 'paid').reduce((a, r) => a + (r.commissionFee || 0), 0), 0);
  const totalPercentageAmount = allPercentages.reduce((a, r) => a + (Number(r.amount) || 0), 0);
  const totalTaxAmount = allTaxes.reduce((a, r) => a + (Number(r.amount) || 0), 0);
  const totalFinance = totalPlatformFees + totalCommissionFees + totalPercentageAmount + totalTaxAmount;
  const totalShops = shops.length;
  const needsPaymentShops = shops.filter(s => s.needsPayment);

  // ---------------- Detail fetchers ----------------
  const fetchPercentageForShop = async (shopId) => {
    try {
      const res = await fetch(`${PERCENTAGE_API}/list`, { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      const list = data.data || data.list || (Array.isArray(data) ? data : []);
      return list.filter(r => String(r.shop_id) === String(shopId));
    } catch (e) {
      console.warn('Percentage fetch failed', e.message);
      return [];
    }
  };

  const fetchTaxForShop = async (shopId) => {
    try {
      const res = await fetch(`${TAX_API}/list`, { headers: getHeaders() });
      if (!res.ok) return [];
      const data = await res.json();
      const list = data.data || data.list || (Array.isArray(data) ? data : []);
      return list.filter(r => String(r.shop_id) === String(shopId));
    } catch (e) {
      console.warn('Tax fetch failed', e.message);
      return [];
    }
  };

  // ---------------- Handlers ----------------
  const handleViewFinance = async (shop) => {
    setSelectedShop(JSON.parse(JSON.stringify(shop)));
    setShowDetail(true);

    setPercentageRecords([]);
    setTaxRecords([]);
    setEditingTaxId(null);
    setEditingPercId(null);
    setPercForm({ total_booking: '' });

    const pfAmt = shop.platformFee?.amount;
    setTaxForm({
      amount: pfAmt != null && pfAmt !== '' ? String(pfAmt) : '',
      payment: 'Cash',
      reason: '',
    });

    setDetailsLoading(true);
    const [perc, tax] = await Promise.all([
      isPercentageTax(shop.tax) ? fetchPercentageForShop(shop.id) : Promise.resolve([]),
      isMonthlyTax(shop.tax) ? fetchTaxForShop(shop.id) : Promise.resolve([]),
    ]);
    setPercentageRecords(perc);
    setTaxRecords(tax);
    setDetailsLoading(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedShop) return;
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE}/settings/${selectedShop.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({
            platform_fee_method: selectedShop.platformFee.method,
            platform_fee_amount: Number(selectedShop.platformFee.amount) || 0,
            commission_fee_method: selectedShop.commissionFee.method,
            commission_fee_percentage: Number(selectedShop.commissionFee.percentage) || 0,
          }),
        }).catch(() => {});
      }
      setShops(prev => prev.map(s => s.id === selectedShop.id ? { ...selectedShop } : s));
      showToast('success', 'Finance settings saved. Shop has been notified.');
    } catch (e) {
      showToast('error', 'Failed to save settings.');
    }
  };

  const handleMarkPaid = (recordId, type) => {
    if (!selectedShop) return;
    const updatedShop = { ...selectedShop };
    if (type === 'platform') {
      updatedShop.platformFeeRecords = updatedShop.platformFeeRecords.map(r =>
        r.id === recordId ? { ...r, status: 'paid' } : r);
    } else {
      updatedShop.commissionRecords = updatedShop.commissionRecords.map(r =>
        r.id === recordId ? { ...r, status: 'paid' } : r);
    }
    setSelectedShop(updatedShop);
    setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));
    showToast('success', 'Marked as Paid.');
  };

  // ---------- Percentage CRUD ----------
  const handleCreatePercentage = async () => {
    if (!selectedShop) return;

    const commissionPct = Number(selectedShop.commissionFee?.percentage);
    if (!commissionPct || isNaN(commissionPct)) {
      showToast('error', 'Commission Fee percentage is missing. Set it above first.');
      return;
    }
    if (percForm.total_booking === '' || isNaN(Number(percForm.total_booking))) {
      showToast('error', 'Please enter a valid total booking.');
      return;
    }

    const totalBooking = parseInt(percForm.total_booking, 10) || 0;
    setPercSubmitting(true);
    try {
      const payload = {
        shop_id: selectedShop.id,
        shop_name: selectedShop.name,
        shop_type: selectedShop.shopType || '',
        tax: 'percentage',
        percentage: commissionPct,
        total_booking: totalBooking,
        booking_count: totalBooking,
        billing_month: currentBillingMonth(),
      };
      const res = await fetch(`${PERCENTAGE_API}/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Failed (${res.status})`);
      }
      showToast('success', data.message || 'Percentage created.');
      setPercForm({ total_booking: '' });
      const updated = await fetchPercentageForShop(selectedShop.id);
      setPercentageRecords(updated);
      fetchGlobalFinanceExtras();
    } catch (e) {
      showToast('error', e.message || 'Failed to create percentage.');
    } finally {
      setPercSubmitting(false);
    }
  };

  const handleStartEditPerc = (rec) => {
    setEditingPercId(rec.id);
    setEditPercForm({ total_booking: readTotalBooking(rec) || '' });
  };

  const handleCancelEditPerc = () => {
    setEditingPercId(null);
    setEditPercForm({ total_booking: '' });
  };

  const handleUpdatePerc = async (id) => {
    if (editPercForm.total_booking === '' || isNaN(Number(editPercForm.total_booking))) {
      showToast('error', 'Please enter a valid total booking.');
      return;
    }
    const newTB = parseInt(editPercForm.total_booking, 10) || 0;
    try {
      await fetch(`${PERCENTAGE_API}/update/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          total_booking: newTB,
          booking_count: newTB,
        }),
      }).catch(() => null);
    } catch (_) { /* ignore */ }

    setPercentageRecords(prev => prev.map(r =>
      r.id === id
        ? { ...r, total_booking: newTB, booking_count: newTB, amount: Math.round(newTB * (Number(r.percentage) || 0) / 100) }
        : r
    ));
    showToast('success', 'Percentage updated.');
    setEditingPercId(null);
    setEditPercForm({ total_booking: '' });
  };

  const handleDeletePerc = async (id) => {
    if (!window.confirm('Delete this percentage record?')) return;
    try {
      await fetch(`${PERCENTAGE_API}/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).catch(() => null);
    } catch (_) { /* ignore */ }
    setPercentageRecords(prev => prev.filter(r => r.id !== id));
    showToast('success', 'Percentage deleted.');
  };

  // Approve percentage → push to Commission Records as PAID
  const handleApprovePercentage = (rec) => {
    if (!selectedShop) return;
    const { start, end } = periodFromBillingMonth(rec.billing_month);
    const sellAmount = readTotalBooking(rec);
    const newCommission = {
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'Monthly',
      periodStart: start,
      periodEnd: end,
      sellAmount,
      commission: Number(rec.percentage) || 0,
      commissionFee: Number(rec.amount) || Math.round(sellAmount * (Number(rec.percentage) || 0) / 100),
      status: 'paid',
    };

    const updatedShop = {
      ...selectedShop,
      commissionRecords: [...(selectedShop.commissionRecords || []), newCommission],
    };
    setSelectedShop(updatedShop);
    setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));

    setPercentageRecords(prev => prev.filter(r => r.id !== rec.id));
    fetch(`${PERCENTAGE_API}/delete/${rec.id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).catch(() => null);

    showToast('success', 'Approved — added to Commission Records as Paid.');
  };

  // ---------- Tax CRUD ----------
  const handleCreateTax = async () => {
    if (!selectedShop) return;
    if (taxForm.amount === '' || isNaN(Number(taxForm.amount))) {
      showToast('error', 'Please enter a valid amount.');
      return;
    }
    setTaxSubmitting(true);
    try {
      const payload = {
        shop_id: selectedShop.id,
        shop_name: selectedShop.name,
        amount: Number(taxForm.amount) || 0,
        payment: taxForm.payment,
        reason: taxForm.reason || '',
      };
      const res = await fetch(`${TAX_API}/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Failed (${res.status})`);
      }
      showToast('success', data.message || 'Shop amount created.');
      const pfAmt = selectedShop.platformFee?.amount;
      setTaxForm({
        amount: pfAmt != null && pfAmt !== '' ? String(pfAmt) : '',
        payment: 'Cash',
        reason: '',
      });
      const updated = await fetchTaxForShop(selectedShop.id);
      setTaxRecords(updated);
      fetchGlobalFinanceExtras();
    } catch (e) {
      showToast('error', e.message || 'Failed to create shop amount.');
    } finally {
      setTaxSubmitting(false);
    }
  };

  const handleStartEditTax = (rec) => {
    setEditingTaxId(rec.id);
    setEditTaxForm({
      amount: rec.amount ?? '',
      payment: rec.payment || 'Cash',
      reason: rec.reason || '',
    });
  };

  const handleCancelEditTax = () => {
    setEditingTaxId(null);
    setEditTaxForm({ amount: '', payment: 'Cash', reason: '' });
  };

  const handleUpdateTax = async (id) => {
    if (editTaxForm.amount === '' || isNaN(Number(editTaxForm.amount))) {
      showToast('error', 'Please enter a valid amount.');
      return;
    }
    try {
      const payload = {
        amount: Number(editTaxForm.amount) || 0,
        payment: editTaxForm.payment,
        reason: editTaxForm.reason || '',
      };
      const res = await fetch(`${TAX_API}/update/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Failed (${res.status})`);
      }
      showToast('success', data.message || 'Shop amount updated.');
      setEditingTaxId(null);
      const updated = await fetchTaxForShop(selectedShop.id);
      setTaxRecords(updated);
      fetchGlobalFinanceExtras();
    } catch (e) {
      showToast('error', e.message || 'Failed to update.');
    }
  };

  const handleDeleteTax = async (id) => {
    if (!window.confirm('Delete this shop amount record?')) return;
    try {
      const res = await fetch(`${TAX_API}/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || `Failed (${res.status})`);
      }
      showToast('success', data.message || 'Shop amount deleted.');
      const updated = await fetchTaxForShop(selectedShop.id);
      setTaxRecords(updated);
      fetchGlobalFinanceExtras();
    } catch (e) {
      showToast('error', e.message || 'Failed to delete.');
    }
  };

  // Approve tax → push to Platform Fee Records as PAID
  const handleApproveTax = (rec) => {
    if (!selectedShop) return;
    const { start, end } = periodFromCreatedAt(rec.created_at);
    const methodLabel = (selectedShop.platformFee?.method || 'monthly');
    const newPlatform = {
      id: `pf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: methodLabel.charAt(0).toUpperCase() + methodLabel.slice(1),
      periodStart: start,
      periodEnd: end,
      amount: Number(rec.amount) || 0,
      status: 'paid',
    };

    const updatedShop = {
      ...selectedShop,
      platformFeeRecords: [...(selectedShop.platformFeeRecords || []), newPlatform],
    };
    setSelectedShop(updatedShop);
    setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));

    setTaxRecords(prev => prev.filter(r => r.id !== rec.id));
    fetch(`${TAX_API}/delete/${rec.id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).catch(() => null);

    showToast('success', 'Approved — added to Platform Fee Records as Paid.');
  };

  // ---------------- Render Helpers ----------------
  const SummaryCard = ({ label, value, suffix, icon, iconBg }) => (
    <div className="fin-summary-card">
      <div className="fin-summary-left">
        <div className="fin-summary-label">{label}</div>
        <div className="fin-summary-value">{value}<span className="fin-summary-suffix">{suffix}</span></div>
      </div>
      <div className="fin-summary-icon" style={{ background: iconBg }}>
        <i className={icon}></i>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    const map = {
      active: { color: '#0f5132', bg: '#d1e7dd', label: 'Active' },
      approved: { color: '#084298', bg: '#cfe2ff', label: 'Approved' },
      pending: { color: '#856404', bg: '#fff3cd', label: 'Pending' },
      warning: { color: '#856404', bg: '#fff3cd', label: 'Warning' },
      inactive: { color: '#842029', bg: '#f8d7da', label: 'Inactive' },
      paid: { color: '#0f5132', bg: '#d1e7dd', label: 'Paid' },
      unpaid: { color: '#856404', bg: '#fff3cd', label: 'Unpaid' },
    };
    const info = map[s] || { color: '#adb5bd', bg: '#e9ecef', label: status };
    return <span className="fin-badge" style={{ color: info.color, background: info.bg }}>{info.label}</span>;
  };

  const TaxBadge = ({ tax }) => {
    const key = normalizeTax(tax);
    if (!key) return null;
    const map = {
      monthly:    { color: '#6f42c1', bg: '#e2d9f3', label: 'Monthly' },
      percentage: { color: '#fd7e14', bg: '#ffe5d0', label: 'Percentage' },
      daily:      { color: '#0d6efd', bg: '#cfe2ff', label: 'Daily' },
      weekly:     { color: '#17a2b8', bg: '#cff4fc', label: 'Weekly' },
      yearly:     { color: '#198754', bg: '#d1e7dd', label: 'Yearly' },
    };
    const info = map[key] || { color: '#6c757d', bg: '#e9ecef', label: tax };
    return <span className="fin-badge" style={{ color: info.color, background: info.bg }}>{info.label}</span>;
  };

  const MethodPills = ({ value, onChange, methods }) => {
    const list = methods || ['daily', 'weekly', 'monthly'];
    return (
      <div className="fin-toggle-group">
        {list.map(m => (
          <button
            key={m}
            type="button"
            className={`fin-toggle-btn ${value === m ? 'active' : ''}`}
            onClick={() => onChange(m)}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
    );
  };

  // ---------------- Main Render ----------------
  return (
    <div className={`dashboard-container fin-page ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Finances" onThemeChange={setIsDarkMode} />

      <style>{`
        .fin-page { padding: 20px 26px 40px; }

        /* ===== Summary ===== */
        .fin-summary-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 15px; margin-bottom: 20px;
        }
        .fin-summary-card {
          background: #2d2d2d;
          border: 1px solid #555555;
          border-radius: 8px;
          padding: 15px 14px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform .15s, border-color .15s;
        }
        .fin-summary-card:hover { border-color: #0d6efd; }
        .fin-summary-label { font-size: 12px; color: #bbbbbb; margin-bottom: 4px; font-weight: 500; }
        .fin-summary-value { font-size: 18px; font-weight: 700; color: #ffffff; display: flex; align-items: baseline; gap: 4px; }
        .fin-summary-suffix { font-size: 12px; font-weight: 500; color: #cccccc; }
        .fin-summary-icon {
          width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 20px;
        }

        /* ===== Header row ===== */
        .fin-header-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; gap: 16px; flex-wrap: wrap;
        }
        .fin-title { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0; }
        .fin-search-wrap { position: relative; max-width: 420px; flex: 1; }
        .fin-search-wrap i {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #9ca3af; font-size: 14px;
        }
        .fin-search-input {
          width: 100%; padding: 10px 14px 10px 38px;
          background: #2d2d2d; border: 1px solid #555555; border-radius: 8px;
          color: #e5e7eb; font-size: 14px; outline: none;
          transition: border-color .15s;
        }
        .fin-search-input::placeholder { color: #9ca3af; }
        .fin-search-input:focus { border-color: #0d6efd; }

        /* ===== Notif ===== */
        .fin-notif-btn {
          position: relative;
          background: #2d2d2d; border: 1px solid #555555; color: #e5e7eb;
          width: 40px; height: 40px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all .15s;
        }
        .fin-notif-btn:hover { border-color: #0d6efd; color: #0d6efd; }
        .fin-notif-dot {
          position: absolute; top: 8px; right: 9px;
          width: 8px; height: 8px; background: #dc3545; border-radius: 50%;
        }
        .fin-notif-panel {
          position: absolute; top: 52px; right: 0;
          width: 380px; max-width: 90vw;
          background: #2d2d2d; border: 1px solid #555555;
          border-radius: 10px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          z-index: 200; overflow: hidden;
        }
        .fin-notif-head {
          padding: 14px 16px; display: flex; justify-content: space-between;
          align-items: flex-start; border-bottom: 1px solid #444444;
        }
        .fin-notif-title { font-size: 15px; font-weight: 700; color: #ffffff; }
        .fin-notif-sub { font-size: 12px; color: #9ca3af; margin-top: 2px; }
        .fin-notif-close { background: transparent; border: none; color: #9ca3af; cursor: pointer; }
        .fin-notif-list { max-height: 340px; overflow-y: auto; padding: 8px; }
        .fin-notif-item {
          display: flex; gap: 10px; padding: 10px 12px;
          border: 1px solid #444444; border-radius: 8px;
          margin-bottom: 8px; background: #252525;
        }
        .fin-notif-item-icon {
          width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
          background: rgba(13,110,253,0.15); color: #0d6efd;
          display: flex; align-items: center; justify-content: center;
        }
        .fin-notif-item-body { flex: 1; min-width: 0; }
        .fin-notif-item-top { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
        .fin-notif-item-name { font-size: 13px; color: #ffffff; font-weight: 600; }
        .fin-notif-item-sub { font-size: 11px; color: #9ca3af; }
        .fin-notif-item-note { font-size: 11px; color: #9ca3af; margin-top: 6px; }
        .fin-due-badge {
          font-size: 10px; font-weight: 700; letter-spacing: .3px;
          color: #f59e0b; background: rgba(245,158,11,0.15);
          padding: 3px 8px; border-radius: 6px;
        }

        /* ===== Shop grid ===== */
        .fin-shops-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .fin-shop-card {
          background: #2d2d2d;
          border: 1px solid #555555;
          border-radius: 10px;
          padding: 16px; display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform .15s, border-color .15s, box-shadow .15s;
        }
        .fin-shop-card:hover {
          transform: translateY(-3px);
          border-color: #0d6efd;
          box-shadow: 0 6px 20px rgba(13,110,253,0.2);
        }
        .fin-shop-head {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 10px; border-bottom: 1px dashed #444444;
          gap: 6px;
        }
        .fin-shop-name {
          font-size: 15px; font-weight: 700; color: #ffffff; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 55%;
        }
        .fin-shop-badges { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }
        .fin-shop-body { display: flex; gap: 12px; align-items: flex-start; }
        .fin-shop-thumb {
          width: 64px; height: 64px; border-radius: 10px; flex-shrink: 0;
          background: #1e1e1e; display: flex; align-items: center; justify-content: center;
          overflow: hidden; border: 1px solid #444444; color: #9ca3af; font-size: 22px;
        }
        .fin-shop-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .fin-shop-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
        .fin-shop-info-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #cbd5e1; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .fin-shop-info-row i { color: #0d6efd; font-size: 12px; }
        .fin-view-btn {
          align-self: flex-end;
          background: #0d6efd;
          color: #fff; border: none; padding: 8px 16px; border-radius: 6px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: background .15s;
        }
        .fin-view-btn:hover { background: #0b5ed7; }

        /* ===== Pagination ===== */
        .fin-pagination {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 24px; color: #9ca3af; font-size: 13px;
        }
        .fin-pagination-btns { display: flex; gap: 6px; align-items: center; }
        .fin-page-btn {
          background: #2d2d2d; border: 1px solid #555555; color: #cbd5e1;
          padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;
          transition: all .15s;
        }
        .fin-page-btn:hover { border-color: #0d6efd; color: #0d6efd; }
        .fin-page-btn.active { background: #0d6efd; color: #fff; border-color: #0d6efd; }
        .fin-page-btn:disabled { opacity: .4; cursor: not-allowed; }

        /* ===== Modal ===== */
        .fin-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .fin-modal {
          background: #2d2d2d; border: 1px solid #555555;
          border-radius: 12px; width: 900px; max-width: 100%;
          max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 30px 80px rgba(0,0,0,0.7);
        }
        .fin-modal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px; border-bottom: 1px solid #444444;
        }
        .fin-modal-title {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          font-size: 16px; font-weight: 700; color: #ffffff;
        }
        .fin-modal-title i { color: #0d6efd; }
        .fin-modal-close {
          background: transparent; border: none; color: #9ca3af;
          font-size: 18px; cursor: pointer;
        }
        .fin-modal-close:hover { color: #dc3545; }
        .fin-modal-body { padding: 20px 22px; overflow-y: auto; }

        /* ===== Section ===== */
        .fin-section {
          background: #252525; border: 1px solid #444444;
          border-radius: 10px; padding: 18px; margin-bottom: 18px;
        }
        .fin-section-title {
          font-size: 15px; font-weight: 700; color: #ffffff;
          display: flex; align-items: center; gap: 8px; margin: 0 0 6px;
        }
        .fin-section-title i { color: #0d6efd; }
        .fin-created { font-size: 12px; color: #9ca3af; margin-bottom: 14px; }

        .fin-settings-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .fin-settings-grid.single {
          grid-template-columns: 1fr;
        }
        .fin-setting-card {
          background: #2d2d2d; border: 1px solid #444444;
          border-radius: 10px; padding: 14px;
        }
        .fin-setting-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #e5e7eb; margin-bottom: 12px;
        }
        .fin-setting-title i { color: #0d6efd; }
        .fin-field-label {
          font-size: 11px; color: #9ca3af; margin-bottom: 6px; display: block;
        }
        .fin-toggle-group {
          display: flex; background: #1e1e1e; border-radius: 8px; padding: 3px;
          margin-bottom: 12px; border: 1px solid #444444;
        }
        .fin-toggle-btn {
          flex: 1; padding: 7px 6px; background: transparent; border: none;
          color: #9ca3af; font-size: 12px; font-weight: 600; cursor: pointer;
          border-radius: 6px; transition: all .2s;
        }
        .fin-toggle-btn.active {
          background: #0d6efd;
          color: #fff;
        }
        .fin-input-wrap { position: relative; }
        .fin-input {
          width: 100%; padding: 10px 48px 10px 12px;
          background: #1e1e1e; border: 1px solid #555555; border-radius: 8px;
          color: #fff; font-size: 14px; outline: none;
          box-sizing: border-box;
        }
        .fin-input.no-suffix { padding-right: 12px; }
        .fin-input:focus { border-color: #0d6efd; }
        .fin-input[readonly],
        .fin-input:disabled {
          background: #171717;
          color: #8fb4ff;
          font-weight: 700;
          cursor: not-allowed;
          opacity: 1;
        }
        .fin-input-suffix {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          font-size: 12px; color: #9ca3af; pointer-events: none;
        }

        .fin-hint {
          font-size: 11px; color: #7dd3fc; margin-top: 6px;
          display: inline-flex; align-items: center; gap: 4px;
        }

        .fin-save-btn {
          margin-left: auto; margin-top: 12px;
          background: #0d6efd;
          color: #fff; border: none; padding: 10px 22px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: background .15s;
        }
        .fin-save-btn:hover { background: #0b5ed7; }
        .fin-save-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* ===== Inline form ===== */
        .fin-inline-form {
          display: grid;
          grid-template-columns: 1fr 1fr 1.3fr auto;
          gap: 10px; margin-bottom: 14px; align-items: end;
        }
        .fin-inline-form.perc-form {
          grid-template-columns: 1fr 1.2fr auto;
        }
        .fin-field { display: flex; flex-direction: column; }
        .fin-select {
          width: 100%; padding: 10px 12px;
          background: #1e1e1e; border: 1px solid #555555; border-radius: 8px;
          color: #fff; font-size: 13px; outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239ca3af' viewBox='0 0 16 16'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .fin-select:focus { border-color: #0d6efd; }
        .fin-btn-primary {
          background: #0d6efd; color: #fff; border: none;
          padding: 10px 18px; border-radius: 8px;
          font-size: 12.5px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
          transition: background .15s;
        }
        .fin-btn-primary:hover { background: #0b5ed7; }
        .fin-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
        .fin-btn-ghost {
          background: transparent; color: #cbd5e1;
          border: 1px solid #555555; border-radius: 6px;
          padding: 5px 9px; font-size: 11.5px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 4px;
          transition: all .15s;
        }
        .fin-btn-ghost:hover { border-color: #0d6efd; color: #0d6efd; }
        .fin-btn-ghost.danger:hover { border-color: #dc3545; color: #dc3545; }
        .fin-btn-ghost.approve {
          background: rgba(25,135,84,0.15); color: #4ade80; border-color: rgba(25,135,84,0.5);
        }
        .fin-btn-ghost.approve:hover { background: #198754; color: #fff; border-color: #198754; }
        .fin-btn-ghost.success {
          background: #198754; color: #fff; border-color: #198754;
        }
        .fin-btn-ghost.success:hover { background: #157347; border-color: #157347; color: #fff; }
        .fin-actions { display: flex; gap: 5px; flex-wrap: nowrap; }

        /* ===== Table ===== */
        .fin-table {
          width: 100%; border-collapse: collapse; font-size: 12.5px;
        }
        .fin-table thead th {
          text-align: left; padding: 10px 12px;
          color: #adb5bd; font-weight: 600; font-size: 11.5px;
          border-bottom: 1px solid #444444;
        }
        .fin-table tbody td {
          padding: 12px; color: #e5e7eb; border-bottom: 1px solid #383838;
          vertical-align: middle;
        }
        .fin-table tbody tr:last-child td { border-bottom: none; }
        .fin-mark-paid-btn {
          background: #198754;
          color: #fff; border: none; padding: 6px 14px; border-radius: 6px;
          font-size: 11px; font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .fin-mark-paid-btn:hover { background: #157347; }
        .fin-empty {
          text-align: center; padding: 20px; color: #9ca3af; font-size: 13px;
        }

        .fin-table .mini-input,
        .fin-table .mini-select {
          background: #1e1e1e; border: 1px solid #555555; border-radius: 6px;
          color: #fff; padding: 6px 8px; font-size: 12px; outline: none;
          width: 100%; box-sizing: border-box;
        }
        .fin-table .mini-input:focus,
        .fin-table .mini-select:focus { border-color: #0d6efd; }

        /* ===== Badge ===== */
        .fin-badge {
          display: inline-block; padding: 3px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 600; white-space: nowrap;
        }

        /* ===== Toast ===== */
        .fin-toast {
          position: fixed; top: 20px; right: 20px; z-index: 99999;
          padding: 12px 18px; border-radius: 8px; font-size: 13px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          animation: finSlide .25s ease;
        }
        .fin-toast.success { background: #d1e7dd; color: #0f5132; border: 1px solid #badbcc; }
        .fin-toast.error { background: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
        @keyframes finSlide {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* ===== Responsive ===== */
        @media (max-width: 1200px) {
          .fin-summary-grid { grid-template-columns: repeat(2, 1fr); }
          .fin-shops-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .fin-shops-grid { grid-template-columns: repeat(2, 1fr); }
          .fin-settings-grid { grid-template-columns: 1fr; }
          .fin-inline-form,
          .fin-inline-form.perc-form { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .fin-summary-grid { grid-template-columns: 1fr; }
          .fin-shops-grid { grid-template-columns: 1fr; }
          .fin-inline-form,
          .fin-inline-form.perc-form { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Toast */}
      {toast.visible && (
        <div className={`fin-toast ${toast.type}`}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ---------- Summary Cards ---------- */}
      <div className="fin-summary-grid">
        <SummaryCard label="Total Finance" value={fmt(totalFinance)} suffix="Ks" icon="bi bi-currency-dollar" iconBg="linear-gradient(135deg, #22c55e, #16a34a)" />
        <SummaryCard label="Total Platform Fees" value={fmt(totalPlatformFees)} suffix="Ks" icon="bi bi-receipt" iconBg="linear-gradient(135deg, #3b82f6, #2563eb)" />
        <SummaryCard label="Total Commission Fees" value={fmt(totalCommissionFees)} suffix="Ks" icon="bi bi-percent" iconBg="linear-gradient(135deg, #f59e0b, #d97706)" />
        <SummaryCard label="Total Percentage" value={fmt(totalPercentageAmount)} suffix="Ks" icon="bi bi-graph-up-arrow" iconBg="linear-gradient(135deg, #06b6d4, #0891b2)" />
        <SummaryCard label="Total Shop Amount" value={fmt(totalTaxAmount)} suffix="Ks" icon="bi bi-wallet2" iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)" />
        <SummaryCard label="Total Shops" value={fmt(totalShops)} suffix="" icon="bi bi-shop" iconBg="linear-gradient(135deg, #ec4899, #db2777)" />
      </div>

      {/* ---------- Header Row ---------- */}
      <div className="fin-header-row">
        <h2 className="fin-title">Finance Shops</h2>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          <div className="fin-search-wrap">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="fin-search-input"
              placeholder="Search shop, owner, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ position: 'relative' }} ref={notifRef}>
            <button className="fin-notif-btn" onClick={() => setShowNotif(v => !v)}>
              <i className="bi bi-bell-fill"></i>
              {needsPaymentShops.length > 0 && <span className="fin-notif-dot"></span>}
            </button>

            {showNotif && (
              <div className="fin-notif-panel">
                <div className="fin-notif-head">
                  <div>
                    <div className="fin-notif-title">
                      <i className="bi bi-receipt" style={{ color: '#0d6efd', marginRight: 6 }}></i>
                      Finance Payments
                    </div>
                    <div className="fin-notif-sub">{needsPaymentShops.length} shops need to pay</div>
                  </div>
                  <button className="fin-notif-close" onClick={() => setShowNotif(false)}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                <div className="fin-notif-list">
                  {needsPaymentShops.length === 0 && (
                    <div className="fin-empty">No pending payments 🎉</div>
                  )}
                  {needsPaymentShops.map(s => (
                    <div className="fin-notif-item" key={s.id}>
                      <div className="fin-notif-item-icon">
                        <i className="bi bi-shop"></i>
                      </div>
                      <div className="fin-notif-item-body">
                        <div className="fin-notif-item-top">
                          <div>
                            <div className="fin-notif-item-name">{s.name}</div>
                            <div className="fin-notif-item-sub">Shop ID: {s.shopCode}</div>
                          </div>
                          <span className="fin-due-badge">PAYMENT DUE</span>
                        </div>
                        <div className="fin-notif-item-note">
                          <i className="bi bi-wallet2" style={{ marginRight: 6 }}></i>
                          {/* အရောင်းမှရရှိသောငွေ */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Shops Grid ---------- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>
          <i className="bi bi-arrow-repeat" style={{ fontSize: '32px' }}></i>
          <p>Loading finance data...</p>
        </div>
      ) : pagedShops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#9ca3af' }}>
          <i className="bi bi-inbox" style={{ fontSize: '42px' }}></i>
          <p>No shops found.</p>
        </div>
      ) : (
        <div className="fin-shops-grid">
          {pagedShops.map(shop => (
            <div className="fin-shop-card" key={shop.id}>
              <div className="fin-shop-head">
                <h3 className="fin-shop-name" title={shop.name}>{shop.name}</h3>
                <div className="fin-shop-badges">
                  <TaxBadge tax={shop.tax} />
                  <StatusBadge status={shop.status} />
                </div>
              </div>
              <div className="fin-shop-body">
                <div className="fin-shop-thumb">
                  {shop.image
                    ? <img src={shop.image} alt={shop.name} onError={(e) => { e.target.style.display = 'none'; }} />
                    : <i className="bi bi-shop"></i>}
                </div>
                <div className="fin-shop-info">
                  <div className="fin-shop-info-row" title={shop.owner}>
                    <i className="bi bi-person"></i> {shop.owner || '—'}
                  </div>
                  <div className="fin-shop-info-row" title={shop.phone}>
                    <i className="bi bi-telephone"></i> {shop.phone || '—'}
                  </div>
                  <div className="fin-shop-info-row" title={shop.email}>
                    <i className="bi bi-envelope"></i> {shop.email || '—'}
                  </div>
                </div>
              </div>
              <button className="fin-view-btn" onClick={() => handleViewFinance(shop)}>
                View Finance <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Pagination ---------- */}
      <div className="fin-pagination">
        <span>Page {currentPage} of {totalPages} ({filtered.length} shops)</span>
        <div className="fin-pagination-btns">
          <button className="fin-page-btn" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            <i className="bi bi-chevron-left"></i> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`fin-page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setPage(p)}>
              {p}
            </button>
          ))}
          <button className="fin-page-btn" disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* ---------- Detail Modal ---------- */}
      {showDetail && selectedShop && (() => {
        const monthly = isMonthlyTax(selectedShop.tax);
        const perc = isPercentageTax(selectedShop.tax);
        const commissionPct = Number(selectedShop.commissionFee?.percentage) || 0;

        return (
          <div className="fin-modal-overlay" onClick={() => setShowDetail(false)}>
            <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="fin-modal-head">
                <div className="fin-modal-title">
                  <i className="bi bi-shop"></i>
                  {selectedShop.name} ({selectedShop.shopCode})
                  {selectedShop.tax && <TaxBadge tax={selectedShop.tax} />}
                </div>
                <button className="fin-modal-close" onClick={() => setShowDetail(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="fin-modal-body">
                {/* --- Finance Settings --- */}
                <div className="fin-section">
                  <h3 className="fin-section-title">
                    <i className="bi bi-credit-card-2-front"></i>
                    Finance Settings {monthly ? '(Monthly Tax)' : perc ? '(Percentage Tax)' : ''}
                  </h3>
                  <div className="fin-created">Created : {selectedShop.created || 'N/A'}</div>

                  <div className={`fin-settings-grid ${(monthly || perc) ? 'single' : ''}`}>
                    {monthly && (
                      <div className="fin-setting-card">
                        <div className="fin-setting-title">
                          <i className="bi bi-list-check"></i> Platform Fee
                        </div>
                        <label className="fin-field-label">Method</label>
                        <MethodPills
                          value={selectedShop.platformFee.method}
                          onChange={(m) => setSelectedShop({
                            ...selectedShop,
                            platformFee: { ...selectedShop.platformFee, method: m },
                          })}
                        />
                        <label className="fin-field-label">Platform Fee Amount</label>
                        <div className="fin-input-wrap">
                          <input
                            type="number"
                            className="fin-input"
                            value={selectedShop.platformFee.amount}
                            onChange={(e) => setSelectedShop({
                              ...selectedShop,
                              platformFee: { ...selectedShop.platformFee, amount: e.target.value },
                            })}
                          />
                          <span className="fin-input-suffix">Ks</span>
                        </div>
                      </div>
                    )}

                    {perc && (
                      <div className="fin-setting-card">
                        <div className="fin-setting-title">
                          <i className="bi bi-percent"></i> Commission Fee
                        </div>
                        <label className="fin-field-label">Method</label>
                        <MethodPills
                          value={selectedShop.commissionFee.method}
                          onChange={(m) => setSelectedShop({
                            ...selectedShop,
                            commissionFee: { ...selectedShop.commissionFee, method: m },
                          })}
                        />
                        <label className="fin-field-label">Commission Percentage</label>
                        <div className="fin-input-wrap">
                          <input
                            type="number"
                            className="fin-input"
                            value={selectedShop.commissionFee.percentage}
                            onChange={(e) => setSelectedShop({
                              ...selectedShop,
                              commissionFee: { ...selectedShop.commissionFee, percentage: e.target.value },
                            })}
                          />
                          <span className="fin-input-suffix">%</span>
                        </div>
                        <div className="fin-hint">
                          <i className="bi bi-info-circle"></i>
                          {/* ဒီ % ကို အောက်က Booking Percentage မှာ အလိုအလျောက် သုံးပါမယ် */}
                        </div>
                      </div>
                    )}

                    {!monthly && !perc && (
                      <>
                        <div className="fin-setting-card">
                          <div className="fin-setting-title">
                            <i className="bi bi-list-check"></i> Platform Fee
                          </div>
                          <label className="fin-field-label">Method</label>
                          <MethodPills
                            value={selectedShop.platformFee.method}
                            onChange={(m) => setSelectedShop({
                              ...selectedShop,
                              platformFee: { ...selectedShop.platformFee, method: m },
                            })}
                          />
                          <label className="fin-field-label">Platform Fee Amount</label>
                          <div className="fin-input-wrap">
                            <input
                              type="number"
                              className="fin-input"
                              value={selectedShop.platformFee.amount}
                              onChange={(e) => setSelectedShop({
                                ...selectedShop,
                                platformFee: { ...selectedShop.platformFee, amount: e.target.value },
                              })}
                            />
                            <span className="fin-input-suffix">Ks</span>
                          </div>
                        </div>
                        <div className="fin-setting-card">
                          <div className="fin-setting-title">
                            <i className="bi bi-percent"></i> Commission Fee
                          </div>
                          <label className="fin-field-label">Method</label>
                          <MethodPills
                            value={selectedShop.commissionFee.method}
                            onChange={(m) => setSelectedShop({
                              ...selectedShop,
                              commissionFee: { ...selectedShop.commissionFee, method: m },
                            })}
                          />
                          <label className="fin-field-label">Commission Percentage</label>
                          <div className="fin-input-wrap">
                            <input
                              type="number"
                              className="fin-input"
                              value={selectedShop.commissionFee.percentage}
                              onChange={(e) => setSelectedShop({
                                ...selectedShop,
                                commissionFee: { ...selectedShop.commissionFee, percentage: e.target.value },
                              })}
                            />
                            <span className="fin-input-suffix">%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button className="fin-save-btn" onClick={handleSaveChanges}>
                    <i className="bi bi-save"></i> Save Changes
                  </button>
                </div>

                {/* --- Booking Percentage — percentage shops only --- */}
                {perc && (
                  <div className="fin-section">
                    <h3 className="fin-section-title">
                      <i className="bi bi-graph-up-arrow"></i> Booking Percentage
                    </h3>
                    <div className="fin-created">
                      {/* Booking အလိုက် percentage ဖြင့် amount တွက်ချက်ပေးသော API */}
                    </div>

                    <div className="fin-inline-form perc-form">
                      <div className="fin-field">
                        <label className="fin-field-label">
                          Percentage <span style={{ color: '#7dd3fc' }}>(from Commission Fee)</span>
                        </label>
                        <div className="fin-input-wrap">
                          <input
                            type="number"
                            className="fin-input"
                            value={commissionPct}
                            readOnly
                            disabled
                          />
                          <span className="fin-input-suffix">%</span>
                        </div>
                      </div>
                      <div className="fin-field">
                        <label className="fin-field-label">Total Booking</label>
                        <input
                          type="number"
                          className="fin-input no-suffix"
                          placeholder="e.g. 5000"
                          value={percForm.total_booking}
                          onChange={(e) => setPercForm(f => ({ ...f, total_booking: e.target.value }))}
                          min="0"
                        />
                      </div>
                      <button
                        className="fin-btn-primary"
                        disabled={percSubmitting}
                        onClick={handleCreatePercentage}
                      >
                        <i className={`bi ${percSubmitting ? 'bi-arrow-repeat' : 'bi-plus-lg'}`}></i>
                        {percSubmitting ? 'Creating...' : 'Create'}
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="fin-table">
                        <thead>
                          <tr>
                            <th>Percentage</th>
                            <th>Total Booking</th>
                            <th>Amount</th>
                            <th>Billing Month</th>
                            <th style={{ width: 200 }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailsLoading ? (
                            <tr><td colSpan="5" className="fin-empty">Loading...</td></tr>
                          ) : percentageRecords.length === 0 ? (
                            <tr><td colSpan="5" className="fin-empty">No percentage records yet.</td></tr>
                          ) : (
                            percentageRecords.map(r => {
                              const isEditing = editingPercId === r.id;
                              const tb = readTotalBooking(r);
                              return (
                                <tr key={r.id}>
                                  <td>{r.percentage}%</td>
                                  <td>
                                    {isEditing ? (
                                      <input
                                        type="number"
                                        className="mini-input"
                                        value={editPercForm.total_booking}
                                        onChange={(e) => setEditPercForm(f => ({ ...f, total_booking: e.target.value }))}
                                      />
                                    ) : (
                                      fmt(tb)
                                    )}
                                  </td>
                                  <td>
                                    <span style={{ color: '#22c55e', fontWeight: 600 }}>
                                      {fmt(r.amount)}
                                    </span>{' '}
                                    <span style={{ color: '#9ca3af', fontSize: 11 }}>MMK</span>
                                  </td>
                                  <td>{r.billing_month || '—'}</td>
                                  <td>
                                    {isEditing ? (
                                      <div className="fin-actions">
                                        <button className="fin-btn-ghost success" onClick={() => handleUpdatePerc(r.id)}>
                                          <i className="bi bi-check-lg"></i> Save
                                        </button>
                                        <button className="fin-btn-ghost" onClick={handleCancelEditPerc}>
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="fin-actions">
                                        <button
                                          className="fin-btn-ghost approve"
                                          onClick={() => handleApprovePercentage(r)}
                                          title="Approve & push to Commission Records"
                                        >
                                          <i className="bi bi-check2-circle"></i> Approve
                                        </button>
                                        <button className="fin-btn-ghost" onClick={() => handleStartEditPerc(r)}>
                                          <i className="bi bi-pencil"></i> Edit
                                        </button>
                                        <button className="fin-btn-ghost danger" onClick={() => handleDeletePerc(r.id)}>
                                          <i className="bi bi-trash"></i> Delete
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- Shop Amount (Tax) — monthly shops only --- */}
                {monthly && (
                  <div className="fin-section">
                    <h3 className="fin-section-title">
                      <i className="bi bi-wallet2"></i> Shop Amount (Tax)
                    </h3>
                    <div className="fin-created">
                      {/* ဆိုင်မှ Admin သို့ ပေးသွင်းရမည့် Amount များ */}
                    </div>

                    <div className="fin-inline-form">
                      <div className="fin-field">
                        <label className="fin-field-label">
                          Amount <span style={{ color: '#7dd3fc' }}>(default: Platform Fee)</span>
                        </label>
                        <div className="fin-input-wrap">
                          <input
                            type="number"
                            className="fin-input"
                            placeholder="60000"
                            value={taxForm.amount}
                            onChange={(e) => setTaxForm(f => ({ ...f, amount: e.target.value }))}
                          />
                          <span className="fin-input-suffix">Ks</span>
                        </div>
                      </div>
                      <div className="fin-field">
                        <label className="fin-field-label">Payment Method</label>
                        <select
                          className="fin-select"
                          value={taxForm.payment}
                          onChange={(e) => setTaxForm(f => ({ ...f, payment: e.target.value }))}
                        >
                          {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="fin-field">
                        <label className="fin-field-label">Reason</label>
                        <input
                          type="text"
                          className="fin-input no-suffix"
                          placeholder="e.g. Cash Pay"
                          value={taxForm.reason}
                          onChange={(e) => setTaxForm(f => ({ ...f, reason: e.target.value }))}
                        />
                      </div>
                      <button
                        className="fin-btn-primary"
                        disabled={taxSubmitting}
                        onClick={handleCreateTax}
                      >
                        <i className={`bi ${taxSubmitting ? 'bi-arrow-repeat' : 'bi-plus-lg'}`}></i>
                        {taxSubmitting ? 'Adding...' : 'Add'}
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="fin-table">
                        <thead>
                          <tr>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Reason</th>
                            <th>Created</th>
                            <th style={{ width: 200 }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailsLoading ? (
                            <tr><td colSpan="5" className="fin-empty">Loading...</td></tr>
                          ) : taxRecords.length === 0 ? (
                            <tr><td colSpan="5" className="fin-empty">No shop amount records yet.</td></tr>
                          ) : (
                            taxRecords.map(r => {
                              const isEditing = editingTaxId === r.id;
                              return (
                                <tr key={r.id}>
                                  <td>
                                    {isEditing ? (
                                      <input
                                        type="number"
                                        className="mini-input"
                                        value={editTaxForm.amount}
                                        onChange={(e) => setEditTaxForm(f => ({ ...f, amount: e.target.value }))}
                                      />
                                    ) : (
                                      <>
                                        <span style={{ color: '#22c55e', fontWeight: 600 }}>
                                          {fmt(r.amount)}
                                        </span>{' '}
                                        <span style={{ color: '#9ca3af', fontSize: 11 }}>MMK</span>
                                      </>
                                    )}
                                  </td>
                                  <td>
                                    {isEditing ? (
                                      <select
                                        className="mini-select"
                                        value={editTaxForm.payment}
                                        onChange={(e) => setEditTaxForm(f => ({ ...f, payment: e.target.value }))}
                                      >
                                        {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                      </select>
                                    ) : (
                                      r.payment || '—'
                                    )}
                                  </td>
                                  <td>
                                    {isEditing ? (
                                      <input
                                        type="text"
                                        className="mini-input"
                                        placeholder="Optional"
                                        value={editTaxForm.reason}
                                        onChange={(e) => setEditTaxForm(f => ({ ...f, reason: e.target.value }))}
                                      />
                                    ) : (
                                      r.reason || '—'
                                    )}
                                  </td>
                                  <td style={{ fontSize: 11.5, color: '#9ca3af' }}>{r.created_at || '—'}</td>
                                  <td>
                                    {isEditing ? (
                                      <div className="fin-actions">
                                        <button className="fin-btn-ghost success" onClick={() => handleUpdateTax(r.id)}>
                                          <i className="bi bi-check-lg"></i> Save
                                        </button>
                                        <button className="fin-btn-ghost" onClick={handleCancelEditTax}>
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="fin-actions">
                                        <button
                                          className="fin-btn-ghost approve"
                                          onClick={() => handleApproveTax(r)}
                                          title="Approve & push to Platform Fee Records"
                                        >
                                          <i className="bi bi-check2-circle"></i> Approve
                                        </button>
                                        <button className="fin-btn-ghost" onClick={() => handleStartEditTax(r)}>
                                          <i className="bi bi-pencil"></i> Edit
                                        </button>
                                        <button className="fin-btn-ghost danger" onClick={() => handleDeleteTax(r.id)}>
                                          <i className="bi bi-trash"></i> Delete
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- Platform Fee Records — monthly shops only --- */}
                {monthly && (
                  <div className="fin-section">
                    <h3 className="fin-section-title">
                      <i className="bi bi-journal-text"></i> Platform Fee Records
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="fin-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Period Start</th>
                            <th>Period End</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedShop.platformFeeRecords.length === 0 ? (
                            <tr><td colSpan="5" className="fin-empty">No platform fee records yet.</td></tr>
                          ) : (
                            selectedShop.platformFeeRecords.map(r => (
                              <tr key={r.id}>
                                <td>{r.type}</td>
                                <td>{r.periodStart}</td>
                                <td>{r.periodEnd}</td>
                                <td>{fmt(r.amount)} <span style={{ color: '#9ca3af', fontSize: 11 }}>MMK</span></td>
                                <td><StatusBadge status={r.status} /></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- Commission Records — percentage shops only --- */}
                {perc && (
                  <div className="fin-section" style={{ marginBottom: 0 }}>
                    <h3 className="fin-section-title">
                      <i className="bi bi-percent"></i> Commission Records
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="fin-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Period Start</th>
                            <th>Period End</th>
                            <th>Sell Amount</th>
                            <th>Commission</th>
                            <th>Commission Fee</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedShop.commissionRecords.length === 0 ? (
                            <tr><td colSpan="7" className="fin-empty">No commission records yet.</td></tr>
                          ) : (
                            selectedShop.commissionRecords.map(r => (
                              <tr key={r.id}>
                                <td>{r.type}</td>
                                <td>{r.periodStart}</td>
                                <td>{r.periodEnd}</td>
                                <td>{fmt(r.sellAmount)} <span style={{ color: '#9ca3af', fontSize: 11 }}>MMK</span></td>
                                <td>{r.commission}%</td>
                                <td>{fmt(r.commissionFee)} <span style={{ color: '#9ca3af', fontSize: 11 }}>MMK</span></td>
                                <td><StatusBadge status={r.status} /></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Finance;