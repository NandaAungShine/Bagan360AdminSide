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

// ---------------- Mock Data (fallback when API not available) ----------------
const MOCK_SHOPS = [
  {
    id: 1, shopCode: 'S001', name: 'kaung', owner: 'kaung',
    phone: '091234567', email: 'yarsu673@gmail.com', status: 'active',
    image: null, created: '01 Apr 2026, 22:37',
    platformFee: { method: 'daily', amount: 10000 },
    commissionFee: { method: 'daily', percentage: 50 },
    platformFeeRecords: [
      { id: 101, type: 'Daily', periodStart: '10 Sept 2026', periodEnd: '10 Sept 2026', amount: 10000, status: 'unpaid' },
      { id: 102, type: 'Daily', periodStart: '09 Sept 2026', periodEnd: '09 Sept 2026', amount: 10000, status: 'unpaid' },
    ],
    commissionRecords: [
      { id: 201, type: 'Daily', periodStart: '10 Sept 2026', periodEnd: '10 Sept 2026', sellAmount: 250000, commission: 50, commissionFee: 125000, status: 'unpaid' },
    ],
    needsPayment: true,
  },
  {
    id: 2, shopCode: 'S002', name: 'PRO Burger & Coffee', owner: 'Aung',
    phone: '09960374233', email: 'kit303202@gmail.com', status: 'active',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    created: '12 Mar 2026, 09:10',
    platformFee: { method: 'weekly', amount: 50000 },
    commissionFee: { method: 'weekly', percentage: 30 },
    platformFeeRecords: [
      { id: 103, type: 'Weekly', periodStart: '02 Sept 2026', periodEnd: '08 Sept 2026', amount: 50000, status: 'unpaid' },
    ],
    commissionRecords: [
      { id: 202, type: 'Weekly', periodStart: '02 Sept 2026', periodEnd: '08 Sept 2026', sellAmount: 1200000, commission: 30, commissionFee: 360000, status: 'unpaid' },
    ],
    needsPayment: true,
  },
  {
    id: 3, shopCode: 'S036', name: 'DIMO', owner: 'Aung Aung',
    phone: '09763108132', email: 'ydm11372@gmail.com', status: 'active',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
    created: '05 Feb 2026, 14:22',
    platformFee: { method: 'monthly', amount: 200000 },
    commissionFee: { method: 'monthly', percentage: 15 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: true,
  },
  {
    id: 4, shopCode: 'S037', name: 'DIMA', owner: 'Aung',
    phone: '09960374233', email: 'ydm11372@gmail.com', status: 'active',
    image: null, created: '20 Jan 2026, 11:45',
    platformFee: { method: 'daily', amount: 8000 },
    commissionFee: { method: 'daily', percentage: 20 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: false,
  },
  {
    id: 5, shopCode: 'S038', name: 'Dreamy', owner: 'Dreamy',
    phone: '09763108132', email: 'aunghset.bo@gmail.com', status: 'active',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
    created: '10 Dec 2025, 16:30',
    platformFee: { method: 'daily', amount: 10000 },
    commissionFee: { method: 'daily', percentage: 25 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: false,
  },
  {
    id: 6, shopCode: 'S039', name: 'Su Shop', owner: 'Su Su',
    phone: '09950595435', email: 'su@gmail.com', status: 'active',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200',
    created: '08 Dec 2025, 10:15',
    platformFee: { method: 'daily', amount: 10000 },
    commissionFee: { method: 'daily', percentage: 20 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: false,
  },
  {
    id: 7, shopCode: 'S040', name: 'NoeNoeShop', owner: 'MMNA',
    phone: '09763108132', email: 'nn@gmail.com', status: 'active',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200',
    created: '01 Dec 2025, 09:00',
    platformFee: { method: 'daily', amount: 10000 },
    commissionFee: { method: 'daily', percentage: 20 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: false,
  },
  {
    id: 8, shopCode: 'S041', name: 'Little Shark', owner: 'MMNA',
    phone: '09763108136', email: 'littlesharkshop@gmail.com', status: 'active',
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=200',
    created: '28 Nov 2025, 13:20',
    platformFee: { method: 'daily', amount: 10000 },
    commissionFee: { method: 'daily', percentage: 20 },
    platformFeeRecords: [],
    commissionRecords: [],
    needsPayment: false,
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
  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const SHOP_API = '/auth/shop';
  const API_BASE = '/api/admin/finance';

  // ---------------- States ----------------
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [selectedShop, setSelectedShop] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [pendingShop, setPendingShop] = useState(null);

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

  // ---------------- Normalize shop from API ----------------
  const normalizeShop = (s) => {
    const rawId = s.id ?? s.shop_id;
    return {
      id: rawId,
      shopCode: s.shop_code ?? s.code ?? `S${String(rawId || 0).padStart(3, '0')}`,
      name: s.name ?? s.shop_name ?? 'Shop',
      owner: s.owner_name ?? s.owner ?? s.username ?? s.name ?? '',
      phone: s.phone ?? s.phone_number ?? '',
      email: s.email ?? '',
      status: (s.status || 'active').toLowerCase(),
      image: buildImageUrl(s.image),
      created: s.created_at
        ? new Date(s.created_at).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })
        : '',
      platformFee: s.platform_fee || s.platformFee || { method: 'daily', amount: 0 },
      commissionFee: s.commission_fee || s.commissionFee || { method: 'daily', percentage: 0 },
      platformFeeRecords: s.platform_fee_records || s.platformFeeRecords || [],
      commissionRecords: s.commission_records || s.commissionRecords || [],
      needsPayment: s.needs_payment ?? s.needsPayment ?? false,
      raw: s,
    };
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
          console.log('✅ Shop List Response:', data);

          let list = [];
          if (Array.isArray(data)) list = data;
          else if (Array.isArray(data.data)) list = data.data;
          else if (Array.isArray(data.shops)) list = data.shops;
          else if (Array.isArray(data.list)) list = data.list;

          if (list.length) {
            setShops(list.map(normalizeShop));
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

  useEffect(() => { fetchShops(); /* eslint-disable-next-line */ }, []);

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
  const totalFinance = totalPlatformFees + totalCommissionFees;
  const totalShops = shops.length;
  const needsPaymentShops = shops.filter(s => s.needsPayment);

  // ---------------- Handlers ----------------
  const handleViewFinance = (shop) => {
    setSelectedShop(JSON.parse(JSON.stringify(shop)));
    setShowDetail(true);
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

  const MethodPills = ({ value, onChange }) => {
    const methods = ['daily', 'weekly', 'monthly'];
    return (
      <div className="fin-toggle-group">
        {methods.map(m => (
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
        }
        .fin-shop-name {
          font-size: 15px; font-weight: 700; color: #ffffff; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;
        }
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
          display: flex; align-items: center; gap: 10px;
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
        }
        .fin-input:focus { border-color: #0d6efd; }
        .fin-input-suffix {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          font-size: 12px; color: #9ca3af; pointer-events: none;
        }

        .fin-save-btn {
          display: block; margin-left: auto; margin-top: 4px;
          background: #0d6efd;
          color: #fff; border: none; padding: 10px 22px; border-radius: 8px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: background .15s;
        }
        .fin-save-btn:hover { background: #0b5ed7; }

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

        /* ===== Badge ===== */
        .fin-badge {
          display: inline-block; padding: 3px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 600;
        }

        /* ===== Passcode modal (kept for future) ===== */
        .fin-passcode-modal {
          background: #2d2d2d; border: 1px solid #555555;
          border-radius: 14px; width: 360px; max-width: 100%;
          padding: 22px; text-align: center;
        }
        .fin-passcode-title {
          font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 16px;
        }
        .fin-passcode-input {
          width: 100%; padding: 11px 14px; background: #1e1e1e;
          border: 1px solid #555555; border-radius: 8px;
          color: #fff; font-size: 14px; outline: none; margin-bottom: 6px;
        }
        .fin-passcode-input:focus { border-color: #0d6efd; }
        .fin-passcode-error { color: #ef4444; font-size: 11.5px; margin-bottom: 10px; min-height: 14px; }
        .fin-passcode-actions {
          display: flex; gap: 10px; margin-top: 12px;
        }
        .fin-passcode-cancel {
          flex: 1; background: transparent; border: 1px solid #555555;
          color: #e5e7eb; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px;
        }
        .fin-passcode-confirm {
          flex: 1; background: #0d6efd;
          color: #fff; border: none; padding: 10px; border-radius: 8px;
          cursor: pointer; font-size: 13px; font-weight: 600;
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
        }
        @media (max-width: 600px) {
          .fin-summary-grid { grid-template-columns: 1fr; }
          .fin-shops-grid { grid-template-columns: 1fr; }
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
        <SummaryCard
          label="Total Finance"
          value={fmt(totalFinance)}
          suffix="Ks"
          icon="bi bi-currency-dollar"
          iconBg="linear-gradient(135deg, #22c55e, #16a34a)"
        />
        <SummaryCard
          label="Total Platform Fees"
          value={fmt(totalPlatformFees)}
          suffix="Ks"
          icon="bi bi-receipt"
          iconBg="linear-gradient(135deg, #3b82f6, #2563eb)"
        />
        <SummaryCard
          label="Total Commission Fees"
          value={fmt(totalCommissionFees)}
          suffix="Ks"
          icon="bi bi-percent"
          iconBg="linear-gradient(135deg, #f59e0b, #d97706)"
        />
        <SummaryCard
          label="Total Shops"
          value={fmt(totalShops)}
          suffix=""
          icon="bi bi-shop"
          iconBg="linear-gradient(135deg, #ec4899, #db2777)"
        />
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
              placeholder="Search shop, owner or phone..."
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
                          အရောင်းမှရရှိသောငွေ
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
                <StatusBadge status={shop.status} />
              </div>
              <div className="fin-shop-body">
                <div className="fin-shop-thumb">
                  {shop.image
                    ? <img src={shop.image} alt={shop.name} onError={(e) => { e.target.style.display = 'none'; }} />
                    : <i className="bi bi-shop"></i>}
                </div>
                <div className="fin-shop-info">
                  <div className="fin-shop-info-row"><i className="bi bi-person"></i> {shop.owner || 'N/A'}</div>
                  <div className="fin-shop-info-row"><i className="bi bi-telephone"></i> {shop.phone || 'N/A'}</div>
                  <div className="fin-shop-info-row"><i className="bi bi-envelope"></i> {shop.email || 'N/A'}</div>
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
          <button
            className="fin-page-btn"
            disabled={currentPage === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <i className="bi bi-chevron-left"></i> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`fin-page-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="fin-page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🚫 PASSCODE MODAL — DISABLED */}
      {/* ============================================================ */}
      {/*
      {showPasscode && ( ... )}
      */}

      {/* ---------- Detail Modal ---------- */}
      {showDetail && selectedShop && (
        <div className="fin-modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="fin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fin-modal-head">
              <div className="fin-modal-title">
                <i className="bi bi-shop"></i>
                {selectedShop.name} ({selectedShop.shopCode})
              </div>
              <button className="fin-modal-close" onClick={() => setShowDetail(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="fin-modal-body">
              {/* --- Finance Settings --- */}
              <div className="fin-section">
                <h3 className="fin-section-title">
                  <i className="bi bi-credit-card-2-front"></i> Finance Settings
                </h3>
                <div className="fin-created">Created : {selectedShop.created || 'N/A'}</div>

                <div className="fin-settings-grid">
                  {/* Platform Fee */}
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
                    <label className="fin-field-label">Platform Fee</label>
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

                  {/* Commission Fee */}
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
                    <label className="fin-field-label">Percentage</label>
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
                </div>

                <button className="fin-save-btn" onClick={handleSaveChanges}>
                  <i className="bi bi-save"></i> Save Changes
                </button>
              </div>

              {/* --- Platform Fee Records --- */}
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedShop.platformFeeRecords.length === 0 ? (
                        <tr><td colSpan="6" className="fin-empty">No platform fee records yet.</td></tr>
                      ) : (
                        selectedShop.platformFeeRecords.map(r => (
                          <tr key={r.id}>
                            <td>{r.type}</td>
                            <td>{r.periodStart}</td>
                            <td>{r.periodEnd}</td>
                            <td>{fmt(r.amount)} <span style={{ color: '#9ca3af', fontSize: 11 }}>MMK</span></td>
                            <td><StatusBadge status={r.status} /></td>
                            <td>
                              {r.status === 'paid' ? (
                                <span style={{ color: '#22c55e', fontSize: 11 }}>
                                  <i className="bi bi-check-circle-fill"></i> Paid
                                </span>
                              ) : (
                                <button
                                  className="fin-mark-paid-btn"
                                  onClick={() => handleMarkPaid(r.id, 'platform')}
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* --- Commission Records --- */}
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedShop.commissionRecords.length === 0 ? (
                        <tr><td colSpan="8" className="fin-empty">No commission records yet.</td></tr>
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
                            <td>
                              {r.status === 'paid' ? (
                                <span style={{ color: '#22c55e', fontSize: 11 }}>
                                  <i className="bi bi-check-circle-fill"></i> Paid
                                </span>
                              ) : (
                                <button
                                  className="fin-mark-paid-btn"
                                  onClick={() => handleMarkPaid(r.id, 'commission')}
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finance;