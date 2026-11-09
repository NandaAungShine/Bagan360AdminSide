import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './Header';

/* ============================================================
   AXIOS INSTANCE
   ============================================================ */
const api = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : 'http://130.94.21.185:8000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Attach bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ============================================================
   ENDPOINT PATHS
   ============================================================ */
const ADMIN_AIR_API = '/admin/air_balloon';       // POST /create, GET /list, PUT /update/:id, DELETE /delete/:id
const SHOP_AIR_API  = '/air_balloon/shop';        // GET /list, GET /details/:id

const BACKEND_URL = 'http://130.94.21.185:8000';

/* ============================================================
   HELPERS
   ============================================================ */
const MAX_IMAGES = 3;

const buildImageUrl = (img) => {
  if (!img || typeof img !== 'string') return null;
  if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('blob:')) return img;
  return `${BACKEND_URL}/${img.replace(/^\/+/, '')}`;
};

const isActiveItem = (item) => {
  const v = item?.isActive;
  return v === 1 || v === true || v === '1';
};

const extractList = (resp) => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.data)) return resp.data;
  if (Array.isArray(resp.list)) return resp.list;
  if (Array.isArray(resp.items)) return resp.items;
  if (Array.isArray(resp.balloons)) return resp.balloons;
  if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
  return [];
};

// Normalize according to Postman Response
const normalizeAirBalloon = (b) => {
  if (!b) return null;
  const id = b.id ?? b.balloon_id ?? b.air_balloon_id;

  // Extract 3 specific image fields
  const rawImgs = [b.airballon_image1, b.airballon_image2, b.airballon_image3].filter(Boolean);
  const images = rawImgs.map(buildImageUrl);

  return {
    id,
    shopId: b.shop_id ?? b.shopId ?? null,
    // Map name from API to duration, or if backend has duration field, use it
    duration: b.duration ?? b.name ?? '', 
    priceFrom: b.price_from ?? '',
    priceTo: b.price_to ?? '',
    dollorFrom: b.dollor_from ?? '',
    dollorTo: b.dollor_to ?? '',
    guest: b.guest ?? '',
    description: b.description ?? '',
    rule: b.rule ?? b.rules ?? '',
    phone1: b.phone1 ?? '',
    phone2: b.phone2 ?? '',
    images: images,
    rawImages: rawImgs, // Keep relative paths for updates
    location: b.location || '',
    status: b.status || 'available',
    isActive: b.is_active ?? b.isActive ?? 1,
    shopName: b.shop_name ?? '',
    shopAddress: b.shop_address ?? '',
    shopPhone: b.shop_phone ?? '',
    created_at: b.created_at ? new Date(b.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    raw: b,
  };
};

// Build multipart FormData payload
const buildFormData = (data, imageItems, isUpdate = false) => {
  const fd = new FormData();
  // Duration ကို name နဲ့ duration နှစ်ခုလုံးအနေနဲ့ ပို့ပေးမယ် (Backend က name ကို လိုအပ်နေရင် Error မတက်အောင်)
  fd.append('name', data.duration || '');
  fd.append('duration', data.duration || ''); 
  
  fd.append('price_from', data.priceFrom || '');
  fd.append('price_to', data.priceTo || '');
  fd.append('dollor_from', data.dollorFrom || '');
  fd.append('dollor_to', data.dollorTo || '');
  fd.append('guest', data.guest || '');
  fd.append('description', data.description || '');
  fd.append('rule', data.rule || '');
  fd.append('phone1', data.phone1 || '');
  fd.append('phone2', data.phone2 || '');
  fd.append('location', data.location || '');
  fd.append('status', data.status || 'available');
  fd.append('is_active', data.isActive ? 1 : 0);

  // Map images exactly to airballon_image1, airballon_image2, airballon_image3
  let imgCount = 1;
  imageItems.forEach(item => {
    if (imgCount > 3) return;
    if (item.file) {
      fd.append(`airballon_image${imgCount}`, item.file, item.file.name);
    } else if (item.isExisting) {
      // Extract path from full URL
      const relPath = item.url.replace(BACKEND_URL + '/', '');
      fd.append(`airballon_image${imgCount}`, relPath);
    }
    imgCount++;
  });

  return fd;
};

const initialFormFields = () => ({
  duration: '',
  priceFrom: '',
  priceTo: '',
  dollorFrom: '',
  dollorTo: '',
  guest: '',
  description: '',
  rule: '',
  phone1: '',
  phone2: '',
  location: '',
  status: 'available',
  isActive: true,
});

/* ============================================================
   COMPONENT
   ============================================================ */
function HotAirBalloons() {
  /* -------- THEME -------- */
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  /* -------- DATA -------- */
  const [balloons, setBalloons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  /* -------- ADD FORM -------- */
  const [addForm, setAddForm] = useState(initialFormFields);
  const [addImages, setAddImages] = useState([]);
  const [adding, setAdding] = useState(false);

  /* -------- EDIT FORM -------- */
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(initialFormFields);
  const [editImages, setEditImages] = useState([]);
  const [updating, setUpdating] = useState(false);

  /* -------- TOGGLE ACTIVE -------- */
  const [togglingId, setTogglingId] = useState(null);

  /* -------- SELECTION -------- */
  const [selectedIds, setSelectedIds] = useState([]);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  /* -------- TOAST -------- */
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3500);
  };

  /* -------- CONFIRM -------- */
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false, message: '', onConfirm: null,
  });

  /* -------- SHOP PREVIEW MODALS -------- */
  const [shopPreview, setShopPreview] = useState({ show: false, loading: false, items: [] });
  const [shopDetail, setShopDetail] = useState({ show: false, loading: false, item: null });

  /* -------- CLICK-OUTSIDE -------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
      if (!e.target.closest('.sort-dropdown-wrapper')) setShowSortDropdown(false);
      if (!e.target.closest('.dropdown-wrapper')) setShowAllDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ============================================================
     FETCH LIST
     ============================================================ */
  const fetchBalloons = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await api.get(`${ADMIN_AIR_API}/list`);
      const list = extractList(data);
      setBalloons(list.map(normalizeAirBalloon).filter(Boolean));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to load air balloons';
      showToast('error', msg);
      setBalloons([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBalloons(); /* eslint-disable-next-line */ }, []);

  /* ============================================================
     FORM FIELD HANDLERS
     ============================================================ */
  const updateField = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const uploadImages = (setter, currentLength, files) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_IMAGES - currentLength;
    if (remaining <= 0) {
      showToast('warning', `Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const toAdd = files.slice(0, remaining).map(f => ({
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(f),
      file: f,
      isExisting: false,
    }));
    if (files.length > remaining) {
      showToast('warning', `Only ${remaining} more image(s) can be added.`);
    }
    setter(prev => [...prev, ...toAdd]);
  };

  const removeImageItem = (setter, id) => {
    setter(prev => prev.filter(i => i.id !== id));
  };

  /* ============================================================
     CREATE
     ============================================================ */
  const handleAdd = async () => {
    if (!addForm.duration) {
      showToast('warning', 'Please enter duration.');
      return;
    }
    if (!addForm.priceFrom && !addForm.priceTo) {
      showToast('warning', 'Please enter at least one price value.');
      return;
    }

    setAdding(true);
    try {
      const fd = buildFormData(addForm, addImages, false);
      const { data } = await api.post(`${ADMIN_AIR_API}/create`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data && data.success === false) {
        throw new Error(data.message || 'Create failed');
      }
      showToast('success', data?.message || 'Balloon added successfully!');
      setAddForm(initialFormFields());
      setAddImages([]);
      fetchBalloons(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to add balloon.';
      showToast('error', msg);
    } finally {
      setAdding(false);
    }
  };

  /* ============================================================
     EDIT
     ============================================================ */
  const handleEdit = (item) => {
    setSelectedForEdit(item);
    setEditForm({
      duration: item.duration || '',
      priceFrom: item.priceFrom ?? '',
      priceTo: item.priceTo ?? '',
      dollorFrom: item.dollorFrom ?? '',
      dollorTo: item.dollorTo ?? '',
      guest: item.guest ?? '',
      description: item.description || '',
      rule: item.rule || '',
      phone1: item.phone1 || '',
      phone2: item.phone2 || '',
      location: item.location || '',
      status: item.status || 'available',
      isActive: isActiveItem(item),
    });
    setEditImages(
      (item.images || []).map((url, idx) => ({
        id: `exist-${idx}-${url}`,
        url,
        file: null,
        isExisting: true,
      }))
    );
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmEdit = async () => {
    if (!selectedForEdit) return;
    if (!editForm.duration) {
      showToast('warning', 'Please enter duration.');
      return;
    }

    setUpdating(true);
    try {
      const fd = buildFormData(editForm, editImages, true);
      const { data } = await api.put(`${ADMIN_AIR_API}/update/${selectedForEdit.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data && data.success === false) {
        throw new Error(data.message || 'Update failed');
      }
      showToast('success', data?.message || 'Balloon updated successfully!');
      setShowEditModal(false);
      setSelectedForEdit(null);
      setEditForm(initialFormFields());
      setEditImages([]);
      fetchBalloons(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to update balloon.';
      showToast('error', msg);
    } finally {
      setUpdating(false);
    }
  };

  /* ============================================================
     TOGGLE ACTIVE (From Card)
     ============================================================ */
  const handleToggleActive = async (item) => {
    if (togglingId === item.id) return;

    const currentlyActive = isActiveItem(item);
    const newActive = currentlyActive ? 0 : 1;

    // Optimistic update
    setBalloons(prev => prev.map(b => b.id === item.id ? { ...b, isActive: newActive } : b));
    setTogglingId(item.id);

    try {
      const fd = new FormData();
      fd.append('is_active', newActive);
      await api.put(`${ADMIN_AIR_API}/update/${item.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('success', newActive ? 'Balloon activated.' : 'Balloon deactivated.');
    } catch (err) {
      // Revert
      setBalloons(prev => prev.map(b => b.id === item.id ? { ...b, isActive: currentlyActive ? 1 : 0 } : b));
      showToast('error', 'Failed to update active status.');
    } finally {
      setTogglingId(null);
    }
  };

  /* ============================================================
     DELETE
     ============================================================ */
  const performDelete = async (id) => {
    try {
      const { data } = await api.delete(`${ADMIN_AIR_API}/delete/${id}`);
      if (data && data.success === false) {
        throw new Error(data.message || 'Delete failed');
      }
      setBalloons(prev => prev.filter(b => b.id !== id));
      setSelectedIds(prev => prev.filter(x => x !== id));
      showToast('success', data?.message || 'Balloon deleted successfully!');
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Failed to delete balloon.';
      showToast('error', msg);
    }
  };

  const askDelete = (id) => {
    setActiveDropdown(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this balloon?',
      onConfirm: () => performDelete(id),
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      showToast('warning', 'Please select an item to delete');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: `Delete ${selectedIds.length} selected balloon(s)?`,
      onConfirm: async () => {
        for (const id of selectedIds) {
          try {
            await api.delete(`${ADMIN_AIR_API}/delete/${id}`);
          } catch { /* keep going */ }
        }
        setSelectedIds([]);
        showToast('success', 'Selected balloons deleted.');
        fetchBalloons(true);
      },
    });
  };

  const handleEditSelected = () => {
    if (selectedIds.length !== 1) {
      showToast('warning', 'Select exactly one item to edit.');
      return;
    }
    const item = balloons.find(b => b.id === selectedIds[0]);
    if (item) handleEdit(item);
  };

  /* ============================================================
     SHOP PREVIEW
     ============================================================ */
  const openShopPreview = async () => {
    setShopPreview({ show: true, loading: true, items: [] });
    try {
      const { data } = await api.get(`${SHOP_AIR_API}/list`);
      const list = extractList(data);
      setShopPreview({ show: true, loading: false, items: list.map(normalizeAirBalloon).filter(Boolean) });
    } catch (e) {
      showToast('error', e?.response?.data?.message || 'Failed to load shop list');
      setShopPreview({ show: true, loading: false, items: [] });
    }
  };

  const openShopDetail = async (id) => {
    setShopDetail({ show: true, loading: true, item: null });
    try {
      const { data } = await api.get(`${SHOP_AIR_API}/details/${id}`);
      const item = data?.data ?? data?.balloon ?? data;
      setShopDetail({ show: true, loading: false, item: normalizeAirBalloon(item) });
    } catch (e) {
      showToast('error', e?.response?.data?.message || 'Failed to load shop details');
      setShopDetail({ show: true, loading: false, item: null });
    }
  };

  /* ============================================================
     FILTER / SORT
     ============================================================ */
  const filtered = balloons.filter(b => {
    const q = searchTerm.toLowerCase();
    return (
      (b.duration || '').toLowerCase().includes(q) ||
      (b.location || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q) ||
      (b.rule || '').toLowerCase().includes(q) ||
      (b.shopName || '').toLowerCase().includes(q) ||
      (b.phone1 || '').toLowerCase().includes(q) ||
      (b.phone2 || '').toLowerCase().includes(q)
    );
  });

  const sortedItems = (() => {
    const list = [...filtered];
    const idCmp = (a, b) => {
      const na = Number(a.id), nb = Number(b.id);
      if (!isNaN(na) && !isNaN(nb)) return nb - na;
      return String(b.id).localeCompare(String(a.id));
    };
    switch (sortBy) {
      case 'lifo': return list.sort(idCmp);
      case 'fifo': return list.sort((a, b) => -idCmp(a, b));
      case 'az':   return list.sort((a, b) => (a.duration || '').localeCompare(b.duration || ''));
      case 'za':   return list.sort((a, b) => (b.duration || '').localeCompare(a.duration || ''));
      default:     return list;
    }
  })();

  /* ============================================================
     RENDER HELPERS
     ============================================================ */
  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) % 1 !== 0;
    return (
      <>
        {[...Array(full)].map((_, i) => (
          <i key={`f${i}`} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
        {half && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }}></i>}
        {[...Array(5 - Math.ceil(rating || 0))].map((_, i) => (
          <i key={`e${i}`} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
      </>
    );
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedItems.length && sortedItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedItems.map(i => i.id));
    }
    setShowAllDropdown(false);
  };

  /* ============================================================
     SMALL UI COMPONENTS
     ============================================================ */
  const ImagesUI = ({ items, setItems }) => (
    <div className="image-gallery-top">
      <label className="gallery-label">
        📸 Images <span style={{ fontSize: '12px', opacity: 0.7 }}>({items.length}/{MAX_IMAGES} max)</span>
      </label>
      <div className="image-gallery-wrapper">
        {items.length < MAX_IMAGES && (
          <div className="image-upload-box">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                uploadImages(setItems, items.length, Array.from(e.target.files));
                e.target.value = '';
              }}
              style={{ display: 'none' }}
              id={`img-upload-${Math.random().toString(36).slice(2, 8)}`}
            />
            <label
              htmlFor={document.querySelector('#img-upload-' + '')?.id}
              className="upload-box"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling;
                if (input) input.click();
              }}
            >
              <i className="bi bi-plus-lg"></i><span>Add Image</span>
            </label>
          </div>
        )}
        <div className="image-scroll-container-horizontal">
          {items.map(img => (
            <div key={img.id} className="image-item">
              <img src={img.url} alt="" />
              <button className="remove-image-btn" onClick={() => removeImageItem(setItems, img.id)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
          title={active ? 'Deactivate' : 'Activate'}
          role="switch"
          aria-checked={active}
          style={{
            position: 'relative',
            width: '38px',
            height: '20px',
            borderRadius: '10px',
            border: 'none',
            padding: 0,
            background: active ? '#28a745' : isDarkMode ? '#444' : '#ccc',
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

  const CardActions = ({ id }) => {
    const isOpen = activeDropdown === id;
    return (
      <div className="card-actions-wrapper" style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <button
          className="card-actions-btn"
          onClick={(e) => { e.stopPropagation(); setActiveDropdown(isOpen ? null : id); }}
          style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.6)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
        >
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div
          className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}
          style={{
            position: 'absolute', top: 40, right: 0,
            background: isDarkMode ? '#2d2d2d' : '#fff',
            borderRadius: 8, boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            minWidth: 160, padding: '4px 0',
            border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
            display: isOpen ? 'block' : 'none',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); const item = balloons.find(b => b.id === id); if (item) handleEdit(item); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 16px', border: 'none', background: 'transparent',
              color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: 14,
            }}
          >
            <i className="bi bi-pencil-square" style={{ color: '#0d6efd' }}></i> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openShopDetail(id); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 16px', border: 'none', background: 'transparent',
              color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: 14,
            }}
          >
            <i className="bi bi-shop" style={{ color: '#17a2b8' }}></i> Shop View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); askDelete(id); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '8px 16px', border: 'none', background: 'transparent',
              color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: 14,
            }}
          >
            <i className="bi bi-trash" style={{ color: '#dc3545' }}></i> Delete
          </button>
        </div>
      </div>
    );
  };

  const ToastUI = () => {
    if (!toast.visible) return null;
    const palette = {
      success: { bg: '#d1e7dd', color: '#0f5132', border: '#badbcc', icon: 'bi-check-circle-fill' },
      error:   { bg: '#f8d7da', color: '#842029', border: '#f5c2c7', icon: 'bi-x-circle-fill' },
      warning: { bg: '#fff3cd', color: '#856404', border: '#ffe69c', icon: 'bi-exclamation-triangle-fill' },
      info:    { bg: '#cff4fc', color: '#055160', border: '#b6effb', icon: 'bi-info-circle-fill' },
    }[toast.type] || { bg: '#e9ecef', color: '#333', border: '#dee2e6', icon: 'bi-info-circle-fill' };

    return (
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 999999,
        padding: '12px 18px', borderRadius: 10,
        background: palette.bg, color: palette.color, border: `1px solid ${palette.border}`,
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        animation: 'finSlide .25s ease',
      }}>
        <i className={`bi ${palette.icon}`} style={{ fontSize: 18 }}></i>
        <span>{toast.message}</span>
        <button
          onClick={() => setToast(t => ({ ...t, visible: false }))}
          style={{ background: 'transparent', border: 'none', color: palette.color, cursor: 'pointer' }}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    );
  };

  const ConfirmUI = () => {
    if (!confirmDialog.visible) return null;
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: isDarkMode ? '#2d2d2d' : '#fff',
          padding: 24, borderRadius: 12, maxWidth: 420, width: '90%',
          boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
        }}>
          <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: 12 }}>Confirm</h3>
          <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button
              onClick={() => setConfirmDialog({ visible: false, message: '', onConfirm: null })}
              style={{
                padding: '8px 16px', borderRadius: 6, border: '1px solid #ddd',
                background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const fn = confirmDialog.onConfirm;
                setConfirmDialog({ visible: false, message: '', onConfirm: null });
                if (fn) fn();
              }}
              style={{
                padding: '8px 16px', borderRadius: 6, border: 'none',
                background: '#dc3545', color: '#fff', cursor: 'pointer',
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ============================================================
     MAIN RENDER
     ============================================================ */
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Hot Air Balloons Management" onThemeChange={handleThemeChange} />
      <ToastUI />
      <ConfirmUI />

      {(loading || refreshing || adding || updating) && (
        <div style={{
          textAlign: 'center', padding: 8,
          background: isDarkMode ? '#333' : '#f0f0f0', color: isDarkMode ? '#eee' : '#333',
          fontSize: 13,
        }}>
          <i className="bi bi-arrow-repeat"></i>{' '}
          {loading ? 'Loading balloons…' : refreshing ? 'Refreshing…' : adding ? 'Adding…' : 'Updating…'}
        </div>
      )}

      {/* ===== Top action bar ===== */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search duration, location, shop, phone…"
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
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}>
            <i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i>
          </button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>
                {selectedIds.length === sortedItems.length && sortedItems.length > 0
                  ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          )}
        </div>
        <div className="sort-dropdown-wrapper">
          <button className="sort-btn" onClick={() => setShowSortDropdown(!showSortDropdown)}>
            <i className="bi bi-arrow-down-up"></i> Sort: {sortBy.toUpperCase()} <i className="bi bi-chevron-down"></i>
          </button>
          {showSortDropdown && (
            <div className="sort-dropdown-menu">
              <button onClick={() => { setSortBy('lifo'); setShowSortDropdown(false); }}>LIFO</button>
              <button onClick={() => { setSortBy('fifo'); setShowSortDropdown(false); }}>FIFO</button>
              <button onClick={() => { setSortBy('az'); setShowSortDropdown(false); }}>A-Z</button>
              <button onClick={() => { setSortBy('za'); setShowSortDropdown(false); }}>Z-A</button>
            </div>
          )}
        </div>
        <button className="action-btn" onClick={() => fetchBalloons(true)} title="Refresh">
          <i className="bi bi-arrow-clockwise"></i>
        </button>
        <button className="action-btn" onClick={openShopPreview} title="Preview as Shop">
          <i className="bi bi-shop"></i> Shop Preview
        </button>
      </div>

      {/* ===== Two-column layout ===== */}
      <div className="hotels-two-columns">
        {/* LEFT — Add form */}
        <div className="add-form-column">
          <div className="add-form-card">
            <ImagesUI items={addImages} setItems={setAddImages} />

            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Duration</label>
                <input
                  type="text" name="duration" placeholder="e.g. 1 Hour, 45 Minutes"
                  value={addForm.duration} onChange={updateField(setAddForm)}
                />
              </div>

              <div className="add-form-group">
                <label>MMK Price Range (MMK)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="text" name="priceFrom" placeholder="From (e.g. 500000)"
                    value={addForm.priceFrom} onChange={updateField(setAddForm)} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="priceTo" placeholder="To (e.g. 1000000)"
                    value={addForm.priceTo} onChange={updateField(setAddForm)} style={{ flex: 1 }} />
                </div>
              </div>

              <div className="add-form-group">
                <label>USD Price Range (USD)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="text" name="dollorFrom" placeholder="From (e.g. 12.45)"
                    value={addForm.dollorFrom} onChange={updateField(setAddForm)} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="dollorTo" placeholder="To (e.g. 25.50)"
                    value={addForm.dollorTo} onChange={updateField(setAddForm)} style={{ flex: 1 }} />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Guest (Min People)</label>
                  <input type="number" name="guest" placeholder="5" min="1"
                    value={addForm.guest} onChange={updateField(setAddForm)} />
                </div>
                <div className="add-form-group half">
                  <label>Status</label>
                  <select name="status" value={addForm.status} onChange={updateField(setAddForm)} style={{ width: '100%' }}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="add-form-group">
                <label>Location</label>
                <input type="text" name="location" placeholder="e.g. Old Bagan"
                  value={addForm.location} onChange={updateField(setAddForm)} />
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea name="description" rows="2"
                  placeholder="Hot air balloon experience..."
                  value={addForm.description} onChange={updateField(setAddForm)} />
              </div>

              <div className="add-form-group">
                <label>Rule</label>
                <textarea name="rule" rows="2"
                  placeholder="Arrive 30 minutes early..."
                  value={addForm.rule} onChange={updateField(setAddForm)} />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Phone 1</label>
                  <input type="text" name="phone1" placeholder="09123456789"
                    value={addForm.phone1} onChange={updateField(setAddForm)} />
                </div>
                <div className="add-form-group half">
                  <label>Phone 2</label>
                  <input type="text" name="phone2" placeholder="09987654321"
                    value={addForm.phone2} onChange={updateField(setAddForm)} />
                </div>
              </div>

              <button className="add-item-btn-full" onClick={handleAdd} disabled={adding}>
                {adding ? 'Adding…' : 'Add Balloon'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedItems.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 50, color: '#6c757d' }}>
                  <i className="bi bi-inbox" style={{ fontSize: 48, display: 'block' }}></i>
                  <p>No balloons found.</p>
                </div>
              ) : (
                sortedItems.map(item => {
                  const hasMmk = item.priceFrom || item.priceTo;
                  const hasUsd = item.dollorFrom || item.dollorTo;
                  const active = isActiveItem(item);

                  return (
                    <div key={item.id} className="hotel-card-vertical"
                      style={{
                        borderRadius: 10,
                        opacity: active ? 1 : 0.65,
                        transition: 'opacity 0.25s'
                      }}>
                      <div className="hotel-card-image"
                        style={{ position: 'relative', minHeight: 200, background: isDarkMode ? '#2d2d2d' : '#f8f9fa' }}>
                        <div style={{
                          display: 'flex', 
                          height: '100%', overflow: 'hidden'
                        }}>
                          {item.images && item.images.length > 0 ? (
                            <img src={item.images[0]} alt={item.duration}
                              style={{ objectFit: 'cover', width: '100%', height: '100%', maxHeight: 150 }} />
                          ) : (
                            <div style={{ fontSize: 60, padding: 20 }}>🎈</div>
                          )}
                        </div>
                        {/* Status badge */}
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '10px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#fff',
                            background: item.status === 'available' ? '#28a745' : '#6c757d',
                          }}
                        >
                          {item.status}
                        </span>
                        <CardActions id={item.id} />
                      </div>
                      <div className="hotel-card-info">
                        {/* Duration + Active switch */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <h3 className="hotel-name" style={{ fontSize: 16, margin: 0, flex: 1 }}>
                            <i className="bi bi-clock" style={{ marginRight: 6, color: '#0d6efd' }}></i>
                            {item.duration || 'Hot Air Balloon'}
                          </h3>
                          <ActiveToggle item={item} />
                        </div>

                        {item.guest && (
                          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6c757d', flexWrap: 'wrap', marginTop: 4 }}>
                            <span><i className="bi bi-person-check"></i> Min {item.guest} pax</span>
                          </div>
                        )}

                        {item.location && (
                          <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6c757d', flexWrap: 'wrap', marginTop: 4 }}>
                            <span><i className="bi bi-geo-alt"></i> {item.location}</span>
                          </div>
                        )}

                        {hasMmk && (
                          <p className="hotel-price" style={{ marginTop: 6 }}>
                            MMK <span>{item.priceFrom || '?'} — {item.priceTo || '?'}</span>
                          </p>
                        )}
                        {hasUsd && (
                          <p style={{ fontSize: 13, color: isDarkMode ? '#bbb' : '#555', margin: '2px 0' }}>
                            USD <span style={{ fontWeight: 600 }}>{item.dollorFrom || '?'} — {item.dollorTo || '?'}</span>
                          </p>
                        )}

                        <div className="hotel-rating">
                          {renderStars(item.rating)}<span className="rating-count">({item.reviews})</span>
                        </div>

                        {item.description && (
                          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }} title={item.description}>
                            <i className="bi bi-chat-left-text"></i>{' '}
                            {item.description.length > 45 ? item.description.slice(0, 45) + '…' : item.description}
                          </p>
                        )}

                        {item.rule && (
                          <p style={{ fontSize: 12, color: '#666', marginTop: 2 }} title={item.rule}>
                            <i className="bi bi-shield-check"></i>{' '}
                            {item.rule.length > 45 ? item.rule.slice(0, 45) + '…' : item.rule}
                          </p>
                        )}

                        {(item.phone1 || item.phone2) && (
                          <p style={{ fontSize: 12, color: '#0d6efd', marginTop: 2 }}>
                            <i className="bi bi-telephone-fill"></i> {[item.phone1, item.phone2].filter(Boolean).join(' / ')}
                          </p>
                        )}

                        {item.shopName && (
                          <p style={{ fontSize: 12, color: isDarkMode ? '#aaa' : '#666', marginTop: 2 }}>
                            <i className="bi bi-shop"></i> {item.shopName}
                          </p>
                        )}

                        {item.created_at && (
                          <p style={{ fontSize: 11, color: '#999' }}>
                            <i className="bi bi-clock-history"></i> Added: {item.created_at}
                          </p>
                        )}
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
      {showEditModal && selectedForEdit && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Hot Air Balloon</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <ImagesUI items={editImages} setItems={setEditImages} />

              <div className="form-group">
                <label>Duration</label>
                <input type="text" name="duration" placeholder="e.g. 1 Hour, 45 Minutes" 
                  value={editForm.duration} onChange={updateField(setEditForm)} />
              </div>

              <div className="form-group">
                <label>MMK Price Range</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="text" name="priceFrom" placeholder="From"
                    value={editForm.priceFrom} onChange={updateField(setEditForm)} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="priceTo" placeholder="To"
                    value={editForm.priceTo} onChange={updateField(setEditForm)} style={{ flex: 1 }} />
                </div>
              </div>

              <div className="form-group">
                <label>USD Price Range</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="text" name="dollorFrom" placeholder="From"
                    value={editForm.dollorFrom} onChange={updateField(setEditForm)} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="dollorTo" placeholder="To"
                    value={editForm.dollorTo} onChange={updateField(setEditForm)} style={{ flex: 1 }} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Guest (Min People)</label>
                  <input type="number" name="guest" min="1"
                    value={editForm.guest} onChange={updateField(setEditForm)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={editForm.status} onChange={updateField(setEditForm)} style={{ width: '100%' }}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location"
                  value={editForm.location} onChange={updateField(setEditForm)} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="2"
                  value={editForm.description} onChange={updateField(setEditForm)} />
              </div>

              <div className="form-group">
                <label>Rule</label>
                <textarea name="rule" rows="2"
                  value={editForm.rule} onChange={updateField(setEditForm)} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone 1</label>
                  <input type="text" name="phone1"
                    value={editForm.phone1} onChange={updateField(setEditForm)} />
                </div>
                <div className="form-group">
                  <label>Phone 2</label>
                  <input type="text" name="phone2"
                    value={editForm.phone2} onChange={updateField(setEditForm)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="add-item-btn" onClick={handleConfirmEdit} disabled={updating}>
                {updating ? 'Updating…' : 'Confirm Edit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SHOP PREVIEW MODAL (list API) ===== */}
      {shopPreview.show && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShopPreview({ show: false, loading: false, items: [] })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDarkMode ? '#2d2d2d' : '#fff',
              color: isDarkMode ? '#eee' : '#333',
              padding: 24, borderRadius: 12, width: '90%', maxWidth: 900,
              maxHeight: '85vh', overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>🛍️ Shop Preview <small style={{ color: '#9ca3af', fontSize: 12 }}>(/air_balloon/shop/list)</small></h2>
              <button
                onClick={() => setShopPreview({ show: false, loading: false, items: [] })}
                style={{ background: 'transparent', border: 'none', color: isDarkMode ? '#eee' : '#333', fontSize: 20, cursor: 'pointer' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {shopPreview.loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Loading…</div>
            ) : shopPreview.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No shop balloons available.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {shopPreview.items.map(it => (
                  <div key={it.id} style={{
                    border: `1px solid ${isDarkMode ? '#444' : '#ddd'}`,
                    borderRadius: 10, overflow: 'hidden',
                    background: isDarkMode ? '#1e1e1e' : '#fafafa',
                  }}>
                    <div style={{ height: 140, background: isDarkMode ? '#333' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {it.images[0] ? (
                        <img src={it.images[0]} alt={it.duration} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 40 }}>🎈</span>
                      )}
                    </div>
                    <div style={{ padding: 12 }}>
                      <h4 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className="bi bi-clock" style={{ color: '#0d6efd' }}></i>
                        {it.duration || 'Hot Air Balloon'}
                      </h4>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        {it.guest && <div><i className="bi bi-person-check"></i> Min {it.guest} pax</div>}
                        {it.location && <div><i className="bi bi-geo-alt"></i> {it.location}</div>}
                        {(it.priceFrom || it.priceTo) && (
                          <div style={{ color: '#22c55e', marginTop: 4 }}>
                            MMK {it.priceFrom || '?'} — {it.priceTo || '?'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== SHOP DETAIL MODAL (details API) ===== */}
      {shopDetail.show && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setShopDetail({ show: false, loading: false, item: null })}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDarkMode ? '#2d2d2d' : '#fff',
              color: isDarkMode ? '#eee' : '#333',
              padding: 24, borderRadius: 12, width: '90%', maxWidth: 600,
              maxHeight: '85vh', overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>🛍️ Shop Detail <small style={{ color: '#9ca3af', fontSize: 12 }}>(/air_balloon/shop/details/:id)</small></h2>
              <button
                onClick={() => setShopDetail({ show: false, loading: false, item: null })}
                style={{ background: 'transparent', border: 'none', color: isDarkMode ? '#eee' : '#333', fontSize: 20, cursor: 'pointer' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {shopDetail.loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>Loading…</div>
            ) : !shopDetail.item ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No details found.</div>
            ) : (
              <div>
                {shopDetail.item.images[0] && (
                  <img
                    src={shopDetail.item.images[0]}
                    alt={shopDetail.item.duration}
                    style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }}
                  />
                )}
                <h3 style={{ margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-clock" style={{ color: '#0d6efd' }}></i>
                  {shopDetail.item.duration || 'Hot Air Balloon'}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: 1.9, fontSize: 14 }}>
                  {shopDetail.item.location && <li><i className="bi bi-geo-alt"></i> Location: {shopDetail.item.location}</li>}
                  {(shopDetail.item.priceFrom || shopDetail.item.priceTo) && (
                    <li><i className="bi bi-currency-exchange"></i> MMK: {shopDetail.item.priceFrom || '?'} — {shopDetail.item.priceTo || '?'}</li>
                  )}
                  {(shopDetail.item.dollorFrom || shopDetail.item.dollorTo) && (
                    <li><i className="bi bi-currency-dollar"></i> USD: {shopDetail.item.dollorFrom || '?'} — {shopDetail.item.dollorTo || '?'}</li>
                  )}
                  {shopDetail.item.guest && <li><i className="bi bi-person-check"></i> Min People: {shopDetail.item.guest}</li>}
                  {shopDetail.item.description && <li><i className="bi bi-chat-left-text"></i> Desc: {shopDetail.item.description}</li>}
                  {shopDetail.item.rule && <li><i className="bi bi-shield-check"></i> Rule: {shopDetail.item.rule}</li>}
                  {(shopDetail.item.phone1 || shopDetail.item.phone2) && (
                    <li><i className="bi bi-telephone-fill"></i> Phones: {[shopDetail.item.phone1, shopDetail.item.phone2].filter(Boolean).join(' / ')}</li>
                  )}
                  {shopDetail.item.shopName && <li><i className="bi bi-shop"></i> Shop: {shopDetail.item.shopName}</li>}
                  {shopDetail.item.shopPhone && <li><i className="bi bi-telephone"></i> Shop Phone: {shopDetail.item.shopPhone}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simple keyframes for toast animation */}
      <style>{`
        @keyframes finSlide {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default HotAirBalloons;