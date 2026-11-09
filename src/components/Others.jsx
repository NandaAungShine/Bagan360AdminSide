import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './Header';

// ===== API INSTANCE =====
const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : 'http://130.94.21.185:8000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Image paths come back as "images/other/xxx.webp" — served from host root
const ASSET_BASE = 'http://130.94.21.185:8000';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${ASSET_BASE}/${path.replace(/^\/+/, '')}`;
};

// ===== HELPERS =====
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Robust active check
const isActiveItem = (item) => {
  const v = item?.isActive;
  return v === 1 || v === true || v === '1';
};

// Normalize item coming from API (handles camelCase / snake_case / nested)
const normalizeItem = (item = {}) => {
  const rawImages = [item.other_image1, item.other_image2, item.other_image3].filter(
    Boolean
  );
  const imgs = rawImages.map((p) => getImageUrl(p));

  return {
    id: item.id ?? item._id ?? item.uuid ?? Date.now(),
    shopId: item.shop_id ?? item.shopId ?? null,
    name: item.name ?? item.title ?? '',
    priceFrom: String(item.price_from ?? item.priceFrom ?? ''),
    priceTo: String(item.price_to ?? item.priceTo ?? ''),
    description: item.description ?? item.remark ?? '',
    images: imgs,
    rawImages, // original relative paths — used when re-sending on update
    location: item.location ?? '',
    status: item.status ?? 'available',
    isActive: item.is_active ?? item.isActive ?? 1,
    shopName: item.shop_name ?? item.shopName ?? '',
    shopAddress: item.shop_address ?? item.shopAddress ?? '',
    shopPhone: item.shop_phone ?? item.shopPhone ?? '',
    created_at:
      (item.created_at ?? item.createdAt ?? '').toString().split('T')[0] ||
      new Date().toISOString().split('T')[0],
  };
};

// Extract list from various response shapes
const extractList = (res) => {
  let d = res?.data;
  for (let i = 0; i < 3; i++) {
    if (Array.isArray(d)) return d;
    if (!d || typeof d !== 'object') return [];
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.results)) return d.results;
    if (Array.isArray(d.others)) return d.others;
    d = d.data;
  }
  return [];
};

function Others() {
  // ===== THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== STATE =====
  const [others, setOthers] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    name: '',
    priceFrom: '',
    priceTo: '',
    description: '',
    location: '',
    status: 'available',
    isActive: true,
  });

  // ===== EDIT MODAL =====
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ===== IMAGE STATE =====
  const [imagePreviews, setImagePreviews] = useState([]);
  const MAX_IMAGES = 3;

  // ===== SELECTION STATE =====
  const [selectedId, setSelectedId] = useState(null);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // ===== TOGGLE LOADING STATE (per-item) =====
  const [togglingId, setTogglingId] = useState(null);

  // ===== TOAST & CONFIRM =====
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    message: '',
    onConfirm: null,
  });

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ===== FETCH LIST =====
  const fetchOthers = async ({ silent = false } = {}) => {
    if (!silent) setFetching(true);
    try {
      const res = await api.get('/admin/other/list');
      const list = extractList(res).map(normalizeItem);
      setOthers(list);
    } catch (err) {
      console.error('Fetch others error:', err);
      if (!silent) showToast('error', 'Failed to load items from server.');
    } finally {
      if (!silent) setFetching(false);
    }
  };

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchOthers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== THEME APPLY =====
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // ===== DROPDOWN CLICK OUTSIDE =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== FORM HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  // ===== IMAGE UPLOAD (limit 3) =====
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - imagePreviews.length;
    if (remaining <= 0) {
      showToast('warning', `Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = '';
      return;
    }

    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      showToast('warning', `Only ${remaining} more image(s) can be added.`);
    }

    try {
      const base64s = await Promise.all(toAdd.map(fileToBase64));
      setImagePreviews((prev) => [...prev, ...base64s]);
    } catch (err) {
      showToast('error', 'Failed to process image.');
    }
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      priceFrom: '',
      priceTo: '',
      description: '',
      location: '',
      status: 'available',
      isActive: true,
    });
    setImagePreviews([]);
  };

  // ===== BUILD PAYLOAD =====
  const buildPayload = () => {
    const payload = {
      name: formData.name.trim(),
      price_from: formData.priceFrom.replace(/[^0-9]/g, ''),
      price_to: formData.priceTo.replace(/[^0-9]/g, ''),
      description: formData.description.trim(),
      location: formData.location.trim(),
      status: formData.status || 'available',
      is_active: formData.isActive ? 1 : 0,
    };

    // images: distribute to other_image1/2/3
    for (let i = 0; i < MAX_IMAGES; i++) {
      payload[`other_image${i + 1}`] = imagePreviews[i] || null;
    }

    return payload;
  };

  // ===== ADD =====
  const handleAdd = async () => {
    if (!formData.name.trim()) {
      showToast('warning', 'Please enter a name.');
      return;
    }
    if (!formData.priceFrom && !formData.priceTo) {
      showToast('warning', 'Please enter at least one price value.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/other/create', buildPayload());
      resetForm();
      showToast('success', 'Other item added successfully!');
      await fetchOthers({ silent: true });
    } catch (err) {
      console.error('Create error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to add item.';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const performDelete = async (id) => {
    try {
      await api.delete(`/admin/other/delete/${id}`);
      if (selectedId === id) setSelectedId(null);
      showToast('success', 'Item deleted successfully!');
      await fetchOthers({ silent: true });
    } catch (err) {
      console.error('Delete error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to delete item.';
      showToast('error', msg);
    }
  };

  const handleDelete = (id) => {
    setActiveDropdown(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this item?',
      onConfirm: () => performDelete(id),
    });
  };

  // ===== EDIT =====
  const handleEdit = (item) => {
    setSelectedForEdit(item);
    setFormData({
      name: item.name || '',
      priceFrom: item.priceFrom || '',
      priceTo: item.priceTo || '',
      description: item.description || '',
      location: item.location || '',
      status: item.status || 'available',
      isActive: isActiveItem(item),
    });
    setImagePreviews(item.images || []);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmEdit = async () => {
    if (!selectedForEdit) return;
    if (!formData.name.trim()) {
      showToast('warning', 'Please enter a name.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/admin/other/update/${selectedForEdit.id}`, buildPayload());

      setShowEditModal(false);
      setSelectedForEdit(null);
      resetForm();
      showToast('success', 'Item updated successfully!');
      await fetchOthers({ silent: true });
    } catch (err) {
      console.error('Update error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to update item.';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ===== TOGGLE ACTIVE (from card) =====
  const handleToggleActive = async (item) => {
    if (togglingId === item.id) return;

    const currentlyActive = isActiveItem(item);
    const newActive = currentlyActive ? 0 : 1;

    // Optimistic update
    setOthers((prev) =>
      prev.map((o) => (o.id === item.id ? { ...o, isActive: newActive } : o))
    );
    setTogglingId(item.id);

    try {
      // Send full payload so backend receives same shape it expects on update
      const payload = {
        name: item.name,
        price_from: item.priceFrom,
        price_to: item.priceTo,
        description: item.description,
        location: item.location,
        status: item.status,
        is_active: newActive,
        other_image1: item.rawImages?.[0] || null,
        other_image2: item.rawImages?.[1] || null,
        other_image3: item.rawImages?.[2] || null,
      };

      await api.put(`/admin/other/update/${item.id}`, payload);

      showToast(
        'success',
        newActive ? 'Item activated.' : 'Item deactivated.'
      );
    } catch (err) {
      console.error('Toggle active error:', err);
      // Revert on failure
      setOthers((prev) =>
        prev.map((o) =>
          o.id === item.id ? { ...o, isActive: currentlyActive ? 1 : 0 } : o
        )
      );
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to update active status.';
      showToast('error', msg);
    } finally {
      setTogglingId(null);
    }
  };

  // ===== SELECTION =====
  const handleDeleteSelected = () => {
    if (!selectedId || selectedId === 'all') {
      showToast('warning', 'Please select an item to delete');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this item?',
      onConfirm: () => performDelete(selectedId),
    });
  };

  const handleEditSelected = () => {
    if (!selectedId || selectedId === 'all') {
      showToast('warning', 'Please select an item to edit');
      return;
    }
    const item = others.find((c) => c.id === selectedId);
    if (item) handleEdit(item);
  };

  const handleSelectAll = () => {
    if (selectedId === 'all') {
      setSelectedId(null);
    } else {
      setSelectedId('all');
    }
    setShowAllDropdown(false);
  };

  // ===== FILTER & SORT =====
  const filtered = others.filter(
    (c) =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSorted = (list) => {
    const sorted = [...list];
    switch (sortBy) {
      case 'lifo':
        return sorted.sort((a, b) =>
          (b.created_at || '').localeCompare(a.created_at || '')
        );
      case 'fifo':
        return sorted.sort((a, b) =>
          (a.created_at || '').localeCompare(b.created_at || '')
        );
      case 'az':
        return sorted.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );
      case 'za':
        return sorted.sort((a, b) =>
          (b.name || '').localeCompare(a.name || '')
        );
      default:
        return sorted;
    }
  };
  const sortedItems = getSorted(filtered);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i
            key={`f${i}`}
            className="bi bi-star-fill"
            style={{ color: '#ff8a00', fontSize: '12px' }}
          ></i>
        ))}
        {hasHalfStar && (
          <i
            className="bi bi-star-half"
            style={{ color: '#ff8a00', fontSize: '12px' }}
          ></i>
        )}
        {[...Array(5 - Math.ceil(rating || 0))].map((_, i) => (
          <i
            key={`e${i}`}
            className="bi bi-star"
            style={{ color: '#ff8a00', fontSize: '12px' }}
          ></i>
        ))}
      </>
    );
  };

  // ===== CARD ACTIONS =====
  const CardActions = ({ id }) => {
    const isOpen = activeDropdown === id;

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setActiveDropdown(isOpen ? null : id);
    };

    const handleEditAction = (e) => {
      e.stopPropagation();
      const item = others.find((c) => c.id === id);
      if (item) handleEdit(item);
    };

    const handleDeleteAction = (e) => {
      e.stopPropagation();
      handleDelete(id);
    };

    return (
      <div
        className="card-actions-wrapper"
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
      >
        <button
          className="card-actions-btn"
          onClick={toggleDropdown}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
          }}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div
          className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}
          style={{
            position: 'absolute',
            top: '40px',
            right: '0',
            background: isDarkMode ? '#2d2d2d' : '#fff',
            borderRadius: '8px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            minWidth: '150px',
            padding: '4px 0',
            border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
            display: isOpen ? 'block' : 'none',
          }}
        >
          <button
            onClick={handleEditAction}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              color: isDarkMode ? '#eee' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <i className="bi bi-pencil-square" style={{ color: '#0d6efd' }}></i>{' '}
            Edit
          </button>
          <button
            onClick={handleDeleteAction}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              color: isDarkMode ? '#eee' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <i className="bi bi-trash" style={{ color: '#dc3545' }}></i> Delete
          </button>
        </div>
      </div>
    );
  };

  // ===== ACTIVE TOGGLE SWITCH =====
  const ActiveToggle = ({ item }) => {
    const active = isActiveItem(item);
    const busy = togglingId === item.id;

    return (
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: active ? '#28a745' : isDarkMode ? '#888' : '#999',
          }}
        >
          {active ? 'ON' : 'OFF'}
        </span>
        <button
          type="button"
          onClick={() => handleToggleActive(item)}
          disabled={busy}
          title={active ? 'Deactivate this item' : 'Activate this item'}
          aria-label={active ? 'Deactivate this item' : 'Activate this item'}
          aria-checked={active}
          role="switch"
          style={{
            position: 'relative',
            width: '38px',
            height: '20px',
            borderRadius: '10px',
            border: 'none',
            padding: 0,
            background: active
              ? '#28a745'
              : isDarkMode
              ? '#444'
              : '#ccc',
            cursor: busy ? 'wait' : 'pointer',
            transition: 'background 0.25s ease',
            opacity: busy ? 0.6 : 1,
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: active ? '20px' : '2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              transition: 'left 0.25s ease',
            }}
          />
        </button>
      </div>
    );
  };

  // ===== TOAST UI =====
  const ToastUI = () => {
    if (!toast.visible) return null;
    return (
      <div
        style={{
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
          backgroundColor:
            toast.type === 'success'
              ? isDarkMode
                ? '#1e3a2e'
                : '#d4edda'
              : toast.type === 'error'
              ? isDarkMode
                ? '#3e1f1f'
                : '#f8d7da'
              : toast.type === 'warning'
              ? isDarkMode
                ? '#3d3512'
                : '#fff3cd'
              : isDarkMode
              ? '#112b3c'
              : '#d1ecf1',
          color:
            toast.type === 'success'
              ? isDarkMode
                ? '#b7eb8f'
                : '#155724'
              : toast.type === 'error'
              ? isDarkMode
                ? '#ffa39e'
                : '#721c24'
              : toast.type === 'warning'
              ? isDarkMode
                ? '#ffe58f'
                : '#856404'
              : isDarkMode
              ? '#91d5ff'
              : '#0c5460',
          borderLeft: `5px solid ${
            toast.type === 'success'
              ? isDarkMode
                ? '#52c41a'
                : '#28a745'
              : toast.type === 'error'
              ? isDarkMode
                ? '#ff4d4f'
                : '#dc3545'
              : toast.type === 'warning'
              ? isDarkMode
                ? '#faad14'
                : '#ffc107'
              : isDarkMode
              ? '#1890ff'
              : '#17a2b8'
          }`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${
              isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }`,
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
          <button
            onClick={() => {
              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              setToast({ ...toast, visible: false });
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '28px' }}>
            {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
            {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
            {toast.type === 'warning' && (
              <i className="bi bi-exclamation-triangle-fill"></i>
            )}
            {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
          </div>
          <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{toast.message}</div>
        </div>
      </div>
    );
  };

  // ===== CONFIRM DIALOG UI =====
  const ConfirmDialogUI = () => {
    if (!confirmDialog.visible) return null;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: isDarkMode ? '#2d2d2d' : '#fff',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
          }}
        >
          <h3
            style={{
              color: isDarkMode ? '#eee' : '#333',
              marginBottom: '12px',
            }}
          >
            Confirm Delete
          </h3>
          <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>
            {confirmDialog.message}
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px',
            }}
          >
            <button
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, visible: false })
              }
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                background: 'transparent',
                cursor: 'pointer',
                color: isDarkMode ? '#ccc' : '#333',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, visible: false });
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#dc3545',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Others Management" onThemeChange={handleThemeChange} />
      <ToastUI />
      <ConfirmDialogUI />

      {(loading || fetching) && (
        <div
          style={{
            textAlign: 'center',
            padding: '10px',
            background: isDarkMode ? '#333' : '#f0f0f0',
          }}
        >
          ⏳ {loading ? 'Processing...' : 'Loading data...'}
        </div>
      )}

      {/* Search & Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search other..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="action-btn delete-btn" onClick={handleDeleteSelected}>
          <i className="bi bi-trash"></i> Delete
        </button>
        <button className="action-btn edit-btn-action" onClick={handleEditSelected}>
          <i className="bi bi-pencil-square"></i> Edit
        </button>
        <div className="dropdown-wrapper">
          <button
            className="action-btn all-btn"
            onClick={() => setShowAllDropdown(!showAllDropdown)}
          >
            <i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i>
          </button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>Select All</button>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setShowAllDropdown(false);
                }}
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
        <div className="sort-dropdown-wrapper">
          <button
            className="sort-btn"
            onClick={() => setShowSortDropdown(!showSortDropdown)}
          >
            <i className="bi bi-arrow-down-up"></i> Sort: {sortBy.toUpperCase()}{' '}
            <i className="bi bi-chevron-down"></i>
          </button>
          {showSortDropdown && (
            <div className="sort-dropdown-menu">
              <button
                onClick={() => {
                  setSortBy('lifo');
                  setShowSortDropdown(false);
                }}
              >
                LIFO
              </button>
              <button
                onClick={() => {
                  setSortBy('fifo');
                  setShowSortDropdown(false);
                }}
              >
                FIFO
              </button>
              <button
                onClick={() => {
                  setSortBy('az');
                  setShowSortDropdown(false);
                }}
              >
                A-Z
              </button>
              <button
                onClick={() => {
                  setSortBy('za');
                  setShowSortDropdown(false);
                }}
              >
                Z-A
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Two Columns */}
      <div className="hotels-two-columns">
        {/* Left - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Images (3 max) */}
            <div className="image-gallery-top">
              <label className="gallery-label">
                📸 Images{' '}
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  ({imagePreviews.length}/{MAX_IMAGES} max)
                </span>
              </label>
              <div className="image-gallery-wrapper">
                {imagePreviews.length < MAX_IMAGES && (
                  <div className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="image-upload-gallery"
                    />
                    <label htmlFor="image-upload-gallery" className="upload-box">
                      <i className="bi bi-plus-lg"></i>
                      <span>Add Image</span>
                    </label>
                  </div>
                )}
                <div className="image-scroll-container-horizontal">
                  {imagePreviews.map((img, i) => (
                    <div key={i} className="image-item">
                      <img src={img} alt="" />
                      <button
                        className="remove-image-btn"
                        onClick={() => removeImage(i)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              {/* Name */}
              <div className="add-form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Bagan Pain and Puppet"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              {/* Price Range */}
              <div className="add-form-group">
                <label>Price Range (MMK)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    name="priceFrom"
                    placeholder="From (e.g. 100000)"
                    value={formData.priceFrom}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input
                    type="text"
                    name="priceTo"
                    placeholder="To (e.g. 150000)"
                    value={formData.priceTo}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="add-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Old Bagan"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              {/* Status */}
              <div className="add-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              {/* Description */}
              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Enter description..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <button
                className="add-item-btn-full"
                onClick={handleAdd}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>

        {/* Right - Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedItems.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '50px',
                    color: '#6c757d',
                  }}
                >
                  <i
                    className="bi bi-inbox"
                    style={{ fontSize: '48px', display: 'block' }}
                  ></i>
                  <p>{fetching ? 'Loading...' : 'No items found.'}</p>
                </div>
              ) : (
                sortedItems.map((item) => {
                  const hasPrice = item.priceFrom || item.priceTo;
                  const active = isActiveItem(item);
                  return (
                    <div
                      key={item.id}
                      className="hotel-card-vertical"
                      style={{ opacity: active ? 1 : 0.65, transition: 'opacity 0.25s' }}
                    >
                      <div
                        className="hotel-card-image"
                        style={{
                          position: 'relative',
                          minHeight: '200px',
                          background: isDarkMode ? '#2d2d2d' : '#f8f9fa',
                        }}
                      >
                        <div
                          className="image-slider"
                          style={{ height: '100%', overflow: 'hidden' }}
                        >
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              style={{
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%',
                                maxHeight: '150px',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '60px', padding: '20px' }}>✨</div>
                          )}
                        </div>
                        <CardActions id={item.id} />
                        {/* Status badge */}
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#fff',
                            background:
                              item.status === 'available' ? '#28a745' : '#6c757d',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="hotel-card-info">
                        {/* Name + Active switch */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <h3
                            className="hotel-name"
                            style={{ fontSize: '16px', margin: 0, flex: 1 }}
                          >
                            {item.name || 'Other'}
                          </h3>
                          <ActiveToggle item={item} />
                        </div>

                        {hasPrice && (
                          <p className="hotel-price" style={{ marginTop: '6px' }}>
                            MMK{' '}
                            <span>
                              {item.priceFrom || '?'} — {item.priceTo || '?'}
                            </span>
                          </p>
                        )}

                        {item.location && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#bbb' : '#555',
                              margin: '2px 0',
                            }}
                          >
                            <i className="bi bi-geo-alt"></i> {item.location}
                          </p>
                        )}

                        <div className="hotel-rating">
                          {renderStars(item.rating)}
                          <span className="rating-count">({item.reviews})</span>
                        </div>

                        {item.description && (
                          <p
                            style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
                            title={item.description}
                          >
                            <i className="bi bi-chat-left-text"></i>{' '}
                            {item.description.length > 60
                              ? item.description.slice(0, 60) + '…'
                              : item.description}
                          </p>
                        )}

                        {item.shopName && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: isDarkMode ? '#aaa' : '#666',
                              marginTop: '2px',
                            }}
                          >
                            <i className="bi bi-shop"></i> {item.shopName}
                          </p>
                        )}

                        {item.shopPhone && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: '#0d6efd',
                              marginTop: '2px',
                            }}
                          >
                            <i className="bi bi-telephone-fill"></i> {item.shopPhone}
                          </p>
                        )}

                        <p style={{ fontSize: '11px', color: '#999' }}>
                          <i className="bi bi-clock"></i> Added: {item.created_at}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Other Item</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="image-gallery-top">
                <label className="gallery-label">
                  📸 Images{' '}
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    ({imagePreviews.length}/{MAX_IMAGES} max)
                  </span>{' '}
                  — Upload new to replace
                </label>
                <div className="image-gallery-wrapper">
                  {imagePreviews.length < MAX_IMAGES && (
                    <div className="image-upload-box">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        id="edit-image-upload"
                      />
                      <label htmlFor="edit-image-upload" className="upload-box">
                        <i className="bi bi-plus-lg"></i>
                        <span>Add Image</span>
                      </label>
                    </div>
                  )}
                  <div className="image-scroll-container-horizontal">
                    {imagePreviews.map((img, i) => (
                      <div key={i} className="image-item">
                        <img src={img} alt="" />
                        <button
                          className="remove-image-btn"
                          onClick={() => removeImage(i)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <small style={{ opacity: 0.7, display: 'block', marginTop: '5px' }}>
                  ⚡ Max {MAX_IMAGES} images. Leave empty to keep current.
                </small>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Bagan Pain and Puppet"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Price Range (MMK)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    name="priceFrom"
                    placeholder="From"
                    value={formData.priceFrom}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input
                    type="text"
                    name="priceTo"
                    placeholder="To"
                    value={formData.priceTo}
                    onChange={handleInputChange}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Old Bagan"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="discard-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="add-item-btn"
                onClick={handleConfirmEdit}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Others;