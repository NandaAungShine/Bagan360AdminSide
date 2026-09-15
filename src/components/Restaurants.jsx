import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function Restaurants() {
  // ===== User Role Check =====
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  })();
  const admin = user?.role === 'admin';
  const userId = user?.id;

  // ===== Theme =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== UI States =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedMenuForEdit, setSelectedMenuForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);

  // ===== Image States (File-based) =====
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ===== API States =====
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== Form State (name, description, prices[]) =====
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prices: [{ size: '', price: '' }],
  });

  // ===== Size options =====
  const SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'Extra Large'];

  // ===== API Base URL =====
  const API_BASE = '/api/admin/res/menu';
  const BACKEND_URL = 'http://130.94.21.185:8000';

  // ===== Toast & Confirm Dialog States =====
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

  // ===== Toast Helper =====
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

  // ===== Helper: Handle 401 Unauthorized =====
  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  // ===== Get Token =====
  const getToken = () => localStorage.getItem('token');

  // ========== FETCH MENUS ==========
  const fetchMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) return handle401Error();

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);

      let list = [];
      if (result.success && Array.isArray(result.data)) {
        list = result.data.map(item => ({
          ...item,
          image: item.image
            ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image.trim()}`)
            : null,
          prices: Array.isArray(item.prices) ? item.prices : [],
        }));
      } else if (Array.isArray(result)) {
        list = result;
      } else {
        list = [];
      }

      setMenus(list);
    } catch (err) {
      setError(err.message);
      console.error('❌ Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }
    fetchMenus();
  }, []);

  // ========== THEME ==========
  useEffect(() => {
    document.body.classList.add(isDarkMode ? 'dark-mode' : 'light-mode');
    document.body.classList.remove(isDarkMode ? 'light-mode' : 'dark-mode');
  }, [isDarkMode]);

  // ========== FORM HANDLERS ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ========== PRICE HANDLERS ==========
  const handlePriceChange = (index, field, value) => {
    const updated = [...formData.prices];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, prices: updated });
  };

  const addPriceRow = () => {
    setFormData({
      ...formData,
      prices: [...formData.prices, { size: '', price: '' }],
    });
  };

  const removePriceRow = (index) => {
    const updated = formData.prices.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      prices: updated.length ? updated : [{ size: '', price: '' }],
    });
  };

  // ========== IMAGE HANDLERS ==========
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
  };

  // ========== RESET FORM ==========
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prices: [{ size: '', price: '' }],
    });
    removeImage();
  };

  // ========== BUILD FORMDATA (shared by add/update) ==========
  const buildFormData = () => {
    const form = new FormData();
    form.append('name', formData.name.trim());
    form.append('description', formData.description?.trim() || '');

    if (imageFile) form.append('image', imageFile);

    // shop_id (if logged in as shop)
    const shopId = localStorage.getItem('shopId');
    const role = localStorage.getItem('role');
    if (role === 'shop' && shopId) {
      form.append('shop_id', shopId);
    }

    // prices[]  -> prices[0][size], prices[0][price], prices[0][id] (if any)
    formData.prices.forEach((p, i) => {
      if (p.id !== undefined && p.id !== null && p.id !== '') {
        form.append(`prices[${i}][id]`, p.id);
      }
      form.append(`prices[${i}][size]`, (p.size || '').trim());
      form.append(
        `prices[${i}][price]`,
        String(p.price || '').replace(/[^0-9]/g, '') || '0'
      );
    });

    return form;
  };

  // ========== ADD MENU ==========
  const handleAddMenu = async () => {
    if (!formData.name) {
      showToast('warning', 'Please fill in Menu Name.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const form = buildFormData();
      console.log('📤 Sending Menu FormData...');

      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      if (response.status === 401) return handle401Error();

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();
      console.log('✅ Add Response:', result);

      if (result.success === false) {
        throw new Error(result.message || 'Create failed');
      }

      await fetchMenus();
      resetForm();
      showToast('success', 'Menu added successfully!');
    } catch (err) {
      setError(err.message);
      console.error('❌ Add Error:', err);
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== DELETE LOGIC ==========
  const performDeleteSelected = async (id) => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) return handle401Error();
      if (!response.ok) throw new Error('Delete failed');

      await fetchMenus();
      setSelectedMenuId(null);
      showToast('success', 'Menu deleted successfully!');
    } catch (err) {
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedMenuId || selectedMenuId === 'all') {
      showToast('warning', 'Please select a single menu item.');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Delete this menu item?',
      onConfirm: () => performDeleteSelected(selectedMenuId),
    });
  };

  const performDeleteFromCard = async (id) => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) return handle401Error();
      if (!response.ok) throw new Error('Delete failed');

      await fetchMenus();
      showToast('success', 'Menu deleted successfully!');
    } catch (err) {
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromCard = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Delete this menu item?',
      onConfirm: () => performDeleteFromCard(id),
    });
  };

  // ========== EDIT (open modal) ==========
  const openEditModal = (menu) => {
    setSelectedMenuForEdit(menu);
    setFormData({
      name: menu.name || '',
      description: menu.description || '',
      prices:
        Array.isArray(menu.prices) && menu.prices.length
          ? menu.prices.map(p => ({
              id: p.id,
              size: p.size || '',
              price: p.price != null ? String(p.price) : '',
            }))
          : [{ size: '', price: '' }],
    });

    const existingImage = menu.image
      ? (menu.image.startsWith('http') ? menu.image : `${BACKEND_URL}/${menu.image.trim()}`)
      : null;
    setImagePreview(existingImage);
    setImageFile(null);

    setShowEditModal(true);
  };

  const handleEditSelected = () => {
    if (!selectedMenuId || selectedMenuId === 'all') {
      showToast('warning', 'Please select a single menu item.');
      return;
    }
    const menu = menus.find(m => m.id === selectedMenuId);
    if (menu) openEditModal(menu);
  };

  const handleEditFromCard = (id) => {
    const menu = menus.find(m => m.id === id);
    if (menu) openEditModal(menu);
  };

  // ========== CONFIRM EDIT ==========
  const handleConfirmEdit = async () => {
    if (!selectedMenuForEdit) return;
    if (!formData.name) {
      showToast('warning', 'Name is required.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const form = buildFormData();
      console.log('📤 Updating Menu FormData...');

      const response = await fetch(`${API_BASE}/update/${selectedMenuForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      if (response.status === 401) return handle401Error();

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();
      console.log('✅ Update Response:', result);

      if (result.success === false) {
        throw new Error(result.message || 'Update failed');
      }

      await fetchMenus();
      setShowEditModal(false);
      setSelectedMenuId(null);
      setSelectedMenuForEdit(null);
      resetForm();
      showToast('success', 'Menu updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('❌ Update Error:', err);
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== SELECT ALL & FILTER ==========
  const handleSelectAll = () => {
    setSelectedMenuId(prev => (prev === 'all' ? null : 'all'));
    setShowAllDropdown(false);
  };

  const toggleMenuSelection = (id) => {
    setSelectedMenuId(prev => (prev === id ? null : id));
  };

  // ===== Filtered by shop_id (priority) or createdBy =====
  const filteredMenus = menus
    .filter(menu => {
      if (admin) return true;

      const shopId = localStorage.getItem('shopId');
      if (menu.shop_id && shopId) {
        return String(menu.shop_id) === String(shopId);
      }
      if (menu.createdBy) {
        return menu.createdBy === userId;
      }
      return false;
    })
    .filter(menu =>
      (menu.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (menu.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ==================== CardActions Component ====================
  const CardActions = ({ menuId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleEditFromCard(menuId);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleDeleteFromCard(menuId);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="edit-btn" onClick={handleEdit}>
            <i className="bi bi-pencil-square"></i> Edit
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            <i className="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    );
  };

  // ========== RENDER ==========
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Restaurants Management" onThemeChange={setIsDarkMode} />

      {/* 🟢 Toast Alert UI */}
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

      {/* 🟢 Confirm Delete Modal */}
      {confirmDialog.visible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDarkMode ? '#2d2d2d' : '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: '12px' }}>Confirm Delete</h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333' }}>Cancel</button>
              <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, visible: false }); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px', textAlign: 'center' }}>⏳ Loading...</div>}
      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '5px' }}>❌ {error} <button onClick={() => setError(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✕</button></div>}

      {/* Search and Bulk Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input type="text" placeholder="Search menu..." className="search-input-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button className="action-btn delete-btn" onClick={handleDeleteSelected} disabled={loading}><i className="bi bi-trash"></i> Delete</button>
        <button className="action-btn edit-btn-action" onClick={handleEditSelected} disabled={loading}><i className="bi bi-pencil-square"></i> Edit</button>
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}><i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i></button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>Select All</button>
              <button onClick={() => { setSelectedMenuId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Two Columns */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="image-gallery-top">
              <label className="gallery-label">Image</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload-gallery" />
                  <label htmlFor="image-upload-gallery" className="upload-box"><i className="bi bi-plus-lg"></i> <span>Add Image</span></label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {imagePreview && (
                    <div className="image-item">
                      <img src={imagePreview} alt="preview" />
                      <button className="remove-image-btn" onClick={removeImage}><i className="bi bi-x-lg"></i></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Menu Name *</label>
                <input type="text" name="name" placeholder="eg. Chicken Burger" value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Describe..." value={formData.description} onChange={handleInputChange}></textarea>
              </div>

              {/* ===== Prices Section ===== */}
              <div className="add-form-group">
                <label>Prices</label>
                {formData.prices.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <select
                      value={p.size}
                      onChange={e => handlePriceChange(i, 'size', e.target.value)}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'inherit', color: 'inherit' }}
                    >
                      <option value="">Select Size</option>
                      {SIZE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Price (eg. 10000)"
                      value={p.price}
                      onChange={e => handlePriceChange(i, 'price', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removePriceRow(i)}
                      style={{
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        width: '34px',
                        height: '34px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title="Remove"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPriceRow}
                  style={{
                    background: 'transparent',
                    border: '1px dashed #888',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    width: '100%',
                    color: 'inherit',
                  }}
                >
                  <i className="bi bi-plus-lg"></i> Add Price
                </button>
              </div>

              <button className="add-item-btn-full" onClick={handleAddMenu} disabled={loading}>
                {loading ? 'Adding...' : 'Add Menu'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            {!loading && menus.length === 0 && !error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <i className="bi bi-emoji-frown" style={{ fontSize: '40px' }}></i>
                <p>No menu items found.</p>
              </div>
            ) : (
              <div className="hotels-grid-2cols">
                {filteredMenus.map(m => {
                  const imageUrl = m.image
                    ? (m.image.startsWith('http') ? m.image : `${BACKEND_URL}/${m.image.trim()}`)
                    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

                  return (
                    <div
                      key={m.id}
                      className={`hotel-card-vertical ${selectedMenuId === m.id ? 'selected' : ''}`}
                      onClick={() => toggleMenuSelection(m.id)}
                    >
                      <div className="hotel-card-image">
                        <div className="image-slider">
                          <img
                            src={imageUrl}
                            alt={m.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div className="selection-check">
                          {selectedMenuId === m.id && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                        <CardActions menuId={m.id} />
                      </div>
                      <div className="hotel-card-info">
                        <h3 className="hotel-name">{m.name}</h3>
                        {m.description && (
                          <p className="address">
                            <i className="bi bi-card-text"></i> {m.description}
                          </p>
                        )}
                        {m.prices && m.prices.length > 0 && (
                          <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {m.prices.map((p, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '12px',
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  background: 'rgba(255,138,0,0.15)',
                                  color: '#ff8a00',
                                  border: '1px solid rgba(255,138,0,0.35)',
                                }}
                              >
                                {p.size}: {Number(p.price || 0).toLocaleString()} Ks
                              </span>
                            ))}
                          </div>
                        )}
                        {m.created_at && (
                          <p className="opening-hours">
                            <i className="bi bi-clock"></i> {new Date(m.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Menu</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Image</label>
                <div className="image-gallery-wrapper" style={{ marginBottom: '10px' }}>
                  <div className="image-upload-box">
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="edit-image-upload" />
                    <label htmlFor="edit-image-upload" className="upload-box" style={{ width: '80px', height: '80px' }}><i className="bi bi-plus-lg"></i></label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {imagePreview && (
                      <div className="image-item">
                        <img src={imagePreview} alt="preview" />
                        <button className="remove-image-btn" onClick={removeImage}><i className="bi bi-x-lg"></i></button>
                      </div>
                    )}
                  </div>
                </div>
                <small style={{ opacity: 0.7 }}>Upload new image to replace existing one.</small>
              </div>

              <div className="form-group">
                <label>Menu Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
              </div>

              {/* Prices in modal */}
              <div className="form-group">
                <label>Prices</label>
                {formData.prices.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <select
                      value={p.size}
                      onChange={e => handlePriceChange(i, 'size', e.target.value)}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc', background: 'inherit', color: 'inherit' }}
                    >
                      <option value="">Select Size</option>
                      {SIZE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Price"
                      value={p.price}
                      onChange={e => handlePriceChange(i, 'price', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => removePriceRow(i)}
                      style={{
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        width: '34px',
                        height: '34px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title="Remove"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPriceRow}
                  style={{
                    background: 'transparent',
                    border: '1px dashed #888',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    width: '100%',
                    color: 'inherit',
                  }}
                >
                  <i className="bi bi-plus-lg"></i> Add Price
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="add-item-btn" onClick={handleConfirmEdit} disabled={loading}>
                {loading ? 'Saving...' : 'Confirm Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restaurants;