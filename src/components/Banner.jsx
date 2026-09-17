import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

// ====== API CONFIG ======
const API_BASE = 'http://130.94.21.185:8000/api/admin/slider';
const IMAGE_BASE = 'http://130.94.21.185:8000/';

// ⭐ Token ကို localStorage ကနေ ယူ (သင့် login က သိမ်းတဲ့ key အတိုင်း)
const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('authToken') ||
  localStorage.getItem('access_token') ||
  localStorage.getItem('auth_token') ||
  '';

// ⭐ Auth header ပါတဲ့ fetch helper
const authFetch = (url, options = {}) => {
  const token = getToken();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

function Banner() {
  // ===== THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== STATE =====
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    status: 'Active',
  });

  // ===== EDIT MODAL =====
  const [selectedBannerForEdit, setSelectedBannerForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ===== IMAGE STATE =====
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); // actual File objects

  // ===== SELECTION STATE =====
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // ===== TOAST & CONFIRM =====
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

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ===== MAX BANNERS =====
  const MAX_BANNERS = 10;

  // ===== HELPERS =====
  const buildImageUrl = (image) => {
    if (!image)
      return 'https://via.placeholder.com/400x200/ccc/666?text=No+Image';
    if (
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('blob:') ||
      image.startsWith('data:')
    ) {
      return image;
    }
    return IMAGE_BASE + image.replace(/^\/+/, '');
  };

  const mapApiToBanner = (item) => ({
    id: item.id,
    title: item.title || '',
    link: item.link || '',
    imagePath: item.image,
    imageUrl: buildImageUrl(item.image),
    status:
      item.is_active === 1 ||
      item.is_active === true ||
      item.is_active === '1'
        ? 'Active'
        : 'Inactive',
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
  });

  // ===== FETCH LIST =====
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/list`);
      const json = await res.json();

      if (res.status === 401) {
        showToast('error', 'Unauthorized. Please login again.');
        return;
      }

      if (json.success && Array.isArray(json.data)) {
        setBanners(json.data.map(mapApiToBanner));
      } else {
        showToast('error', json.message || 'Failed to load banners.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while loading banners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== THEME EFFECT =====
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ===== IMAGE UPLOAD =====
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({ title: '', link: '', status: 'Active' });
    setImagePreviews([]);
    setImageFiles([]);
  };

  // ===== ADD (CREATE) =====
  const handleAddBanner = async () => {
    if (banners.length >= MAX_BANNERS) {
      showToast('warning', `You can only add up to ${MAX_BANNERS} banners.`);
      return;
    }
    if (imageFiles.length === 0) {
      showToast('warning', 'Image is required.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('link', formData.link.trim());
      fd.append('is_active', formData.status === 'Active' ? '1' : '0');
      fd.append('image', imageFiles[0]);

      const res = await authFetch(`${API_BASE}/create`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();

      if (res.status === 401) {
        showToast('error', 'Unauthorized. Please login again.');
        return;
      }

      if (json.success) {
        showToast('success', json.message || 'Banner added successfully!');
        resetForm();
        fetchBanners();
      } else {
        showToast('error', json.message || 'Failed to add banner.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while adding banner.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const performDeleteBanner = async (id) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (res.status === 401) {
        showToast('error', 'Unauthorized. Please login again.');
        return;
      }

      if (json.success) {
        showToast('success', json.message || 'Banner deleted successfully!');
        if (selectedBannerId === id) setSelectedBannerId(null);
        fetchBanners();
      } else {
        showToast('error', json.message || 'Failed to delete banner.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while deleting banner.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = (id) => {
    setActiveDropdown(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this banner?',
      onConfirm: () => performDeleteBanner(id),
    });
  };

  // ===== STATUS TOGGLE (PUT) =====
  const handleStatusToggle = async (banner) => {
    setActiveDropdown(null);
    const newStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/status/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: newStatus === 'Active' ? 1 : 0,
        }),
      });
      const json = await res.json();

      if (res.status === 401) {
        showToast('error', 'Unauthorized. Please login again.');
        return;
      }

      if (json.success) {
        showToast('success', json.message || `Status changed to ${newStatus}`);
        fetchBanners();
      } else {
        showToast('error', json.message || 'Failed to change status.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while changing status.');
    } finally {
      setLoading(false);
    }
  };

  // ===== EDIT =====
  const handleEditBanner = (banner) => {
    setSelectedBannerForEdit(banner);
    setFormData({
      title: banner.title || '',
      link: banner.link || '',
      status: banner.status || 'Active',
    });
    setImagePreviews([banner.imageUrl]);
    setImageFiles([]);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmEdit = async () => {
    if (!selectedBannerForEdit) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('link', formData.link.trim());
      fd.append('is_active', formData.status === 'Active' ? '1' : '0');
      if (imageFiles.length > 0) {
        fd.append('image', imageFiles[0]);
      }
      // ⭐ Laravel method spoofing (PUT လိုအပ်ရင်)
      fd.append('_method', 'PUT');

      const res = await authFetch(
        `${API_BASE}/update/${selectedBannerForEdit.id}`,
        {
          method: 'POST', // FormData နဲ့ method spoofing
          body: fd,
        }
      );
      const json = await res.json();

      if (res.status === 401) {
        showToast('error', 'Unauthorized. Please login again.');
        return;
      }

      if (json.success) {
        showToast('success', json.message || 'Banner updated successfully!');
        setShowEditModal(false);
        setSelectedBannerForEdit(null);
        resetForm();
        fetchBanners();
      } else {
        showToast('error', json.message || 'Failed to update banner.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while updating banner.');
    } finally {
      setLoading(false);
    }
  };

  // ===== SELECTION =====
  const handleDeleteSelected = () => {
    if (!selectedBannerId || selectedBannerId === 'all') {
      showToast('warning', 'Please select a banner to delete');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this banner?',
      onConfirm: () => performDeleteBanner(selectedBannerId),
    });
  };

  const handleEditSelected = () => {
    if (!selectedBannerId || selectedBannerId === 'all') {
      showToast('warning', 'Please select a banner to edit');
      return;
    }
    const banner = banners.find((b) => b.id === selectedBannerId);
    if (banner) handleEditBanner(banner);
  };

  const handleSelectAll = () => {
    setShowAllDropdown(false);
    showToast('info', 'Please select a banner individually.');
  };

  const toggleBannerSelection = (id) => {
    setSelectedBannerId(selectedBannerId === id ? null : id);
  };

  // ===== FILTER & SORT =====
  const filteredBanners = banners.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.title || '').toLowerCase().includes(term) ||
      (b.link || '').toLowerCase().includes(term) ||
      (b.status || '').toLowerCase().includes(term)
    );
  });

  const getSortedBanners = (list) => {
    const sorted = [...list];
    switch (sortBy) {
      case 'lifo':
        return sorted.sort((a, b) => b.id - a.id);
      case 'fifo':
        return sorted.sort((a, b) => a.id - b.id);
      case 'az':
        return sorted.sort((a, b) =>
          (a.title || a.link || '').localeCompare(b.title || b.link || '')
        );
      case 'za':
        return sorted.sort((a, b) =>
          (b.title || b.link || '').localeCompare(a.title || a.link || '')
        );
      default:
        return sorted;
    }
  };
  const sortedBanners = getSortedBanners(filteredBanners);

  // ===== STATS =====
  const total = banners.length;
  const active = banners.filter((b) => b.status === 'Active').length;
  const inactive = banners.filter((b) => b.status === 'Inactive').length;

  const getStatusStyle = (status) => {
    if (status === 'Active')
      return { backgroundColor: '#d1e7dd', color: '#0f5132' };
    return { backgroundColor: '#f8d7da', color: '#842029' };
  };

  // ===== CARD ACTIONS =====
  const CardActions = ({ banner }) => {
    const isOpen = activeDropdown === banner.id;

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setActiveDropdown(isOpen ? null : banner.id);
    };

    const handleEditAction = (e) => {
      e.stopPropagation();
      handleEditBanner(banner);
    };

    const handleDeleteAction = (e) => {
      e.stopPropagation();
      handleDeleteBanner(banner.id);
    };

    const handleToggleStatusAction = (e) => {
      e.stopPropagation();
      handleStatusToggle(banner);
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
            minWidth: '170px',
            padding: '4px 0',
            border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
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
            onClick={handleToggleStatusAction}
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
            <i
              className={
                banner.status === 'Active'
                  ? 'bi bi-toggle-on'
                  : 'bi bi-toggle-off'
              }
              style={{ color: '#ffc107' }}
            ></i>
            {banner.status === 'Active' ? 'Set Inactive' : 'Set Active'}
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
              if (toastTimeoutRef.current)
                clearTimeout(toastTimeoutRef.current);
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
            {toast.type === 'success' && (
              <i className="bi bi-check-circle-fill"></i>
            )}
            {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
            {toast.type === 'warning' && (
              <i className="bi bi-exclamation-triangle-fill"></i>
            )}
            {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
          </div>
          <div style={{ fontSize: '15px', lineHeight: '1.5' }}>
            {toast.message}
          </div>
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
    <div
      className={`dashboard-container ${
        isDarkMode ? 'dark-theme' : 'light-theme'
      }`}
    >
      <Header title="Banner Management" onThemeChange={handleThemeChange} />
      <ToastUI />
      <ConfirmDialogUI />

      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '10px',
            background: isDarkMode ? '#333' : '#f0f0f0',
          }}
        >
          ⏳ Processing...
        </div>
      )}

      {/* Search & Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search banner by title, status or link..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="action-btn delete-btn"
          onClick={handleDeleteSelected}
        >
          <i className="bi bi-trash"></i> Delete
        </button>
        <button
          className="action-btn edit-btn-action"
          onClick={handleEditSelected}
        >
          <i className="bi bi-pencil-square"></i> Edit
        </button>
        <div className="dropdown-wrapper">
          <button
            className="action-btn all-btn"
            onClick={() => setShowAllDropdown(!showAllDropdown)}
          >
            <i className="bi bi-check-all"></i> All{' '}
            <i className="bi bi-chevron-down"></i>
          </button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>Select All</button>
              <button
                onClick={() => {
                  setSelectedBannerId(null);
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

      {/* Stats Cards */}
      <div className="stats-cards-row">
        <div className="stat-card-mini">
          <div className="stat-icon-mini total">
            <i className="bi bi-image"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{total}</h3>
            <p>Total Banners</p>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini active">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini inactive">
            <i className="bi bi-x-circle-fill"></i>
          </div>
          <div className="stat-info-mini">
            <h3>{inactive}</h3>
            <p>Inactive</p>
          </div>
        </div>
        <div className="stat-card-mini" style={{ gridColumn: 'span 2' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#bbb',
            }}
          >
            <i className="bi bi-info-circle" style={{ fontSize: '20px' }}></i>
            <span style={{ fontSize: '13px' }}>
              Sorting: <strong>{sortBy.toUpperCase()}</strong> —{' '}
              {sortBy === 'lifo'
                ? 'Newest first'
                : sortBy === 'fifo'
                ? 'Oldest first'
                : 'Sorted by title'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns Layout */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery */}
            <div className="image-gallery-top">
              <label className="gallery-label">📸 Image Gallery *</label>
              <div className="image-gallery-wrapper">
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
                <div className="image-scroll-container-horizontal">
                  {imagePreviews.map((img, index) => (
                    <div key={index} className="image-item">
                      <img src={img} alt={`Preview ${index}`} />
                      <button
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="eg. Bagan Special Offer"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Link (Optional)</label>
                <input
                  type="text"
                  name="link"
                  placeholder="/promo-page or https://..."
                  value={formData.link}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
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

              <button
                className="add-item-btn-full"
                onClick={handleAddBanner}
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Banner'}
              </button>

              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#6c757d',
                  textAlign: 'center',
                }}
              >
                {banners.length} / {MAX_BANNERS} banners
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Banner Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedBanners.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '50px',
                    color: '#6c757d',
                  }}
                >
                  <i
                    className="bi bi-image"
                    style={{
                      fontSize: '48px',
                      display: 'block',
                      marginBottom: '10px',
                    }}
                  ></i>
                  <p>No banners found. Click "Add Banner" to create one.</p>
                </div>
              ) : (
                sortedBanners.map((banner) => (
                  <div
                    key={banner.id}
                    className={`hotel-card-vertical ${
                      selectedBannerId === banner.id ? 'selected' : ''
                    }`}
                    onClick={() => toggleBannerSelection(banner.id)}
                  >
                    <div
                      className="hotel-card-image"
                      style={{
                        position: 'relative',
                        minHeight: '150px',
                        background: isDarkMode ? '#2d2d2d' : '#f8f9fa',
                         height: '200px',
                      }}
                    >
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || banner.link || 'banner'}
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '100%',
                          maxHeight: '150px',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://via.placeholder.com/400x200/ccc/666?text=No+Image';
                        }}
                      />
                      {/* Status Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          ...getStatusStyle(banner.status),
                        }}
                      >
                        {banner.status}
                      </div>
                      {/* Selection Check */}
                      <div className="selection-check">
                        {selectedBannerId === banner.id && (
                          <i className="bi bi-check-circle-fill"></i>
                        )}
                      </div>
                      {/* Card Actions */}
                      <CardActions banner={banner} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name">
                        {banner.title || banner.link || `Banner #${banner.id}`}
                      </h3>
                      {banner.link && (
                        <p className="hotel-location">
                          <i className="bi bi-link-45deg"></i>
                          <a
                            href={banner.link}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#0d6efd',
                              textDecoration: 'none',
                            }}
                          >
                            {banner.link.length > 40
                              ? banner.link.substring(0, 40) + '...'
                              : banner.link}
                          </a>
                        </p>
                      )}
                      <p className="hotel-location">
                        <i className="bi bi-hash"></i> ID: {banner.id}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Banner</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {/* Image Gallery */}
              <div className="image-gallery-top">
                <label className="gallery-label">
                  📸 Images (Upload new to replace)
                </label>
                <div className="image-gallery-wrapper">
                  <div className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="upload-box"
                    >
                      <i className="bi bi-plus-lg"></i>
                      <span>Add Image</span>
                    </label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {imagePreviews.map((img, index) => (
                      <div key={index} className="image-item">
                        <img src={img} alt={`Preview ${index}`} />
                        <button
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <small
                  style={{
                    opacity: 0.7,
                    display: 'block',
                    marginTop: '5px',
                  }}
                >
                  ⚡ Upload new image to replace. Leave empty to keep current.
                </small>
              </div>

              {/* Form Fields */}
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Link (Optional)</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                />
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

export default Banner;