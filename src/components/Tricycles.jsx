import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function Tricycles() {
  // ===== User Role Check (added) =====
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
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);

  // ===== Image States =====
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ===== API States =====
  const [tricycles, setTricycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== Toast & Confirm States =====
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

  // ===== 401 Unauthorized Handler =====
  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  // ===== Form State (discount removed) =====
  const [formData, setFormData] = useState({
    name: '',           
    type: '',
    capacity: '',
    price: '',          
    pricePerDay: '',
    description: '',
    features: '',
    location: '',
    contactNumber: '',
  });

  // ===== API Base =====
  const API_BASE = '/api/admin/thonebane';
  const BACKEND_URL = 'http://130.94.21.185:8000';

  // ===== Token & Headers =====
  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  // ========== FETCH TRICYCLES ==========
  const fetchTricycles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/list`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (response.status === 401) return handle401Error();

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      
      const result = await response.json();
      console.log('✅ ThoneBane List:', result);
      
      const list = result.data || result || [];
      setTricycles(list);
    } catch (err) {
      setError(err.message);
      console.error('❌ Fetch Error:', err);
      showToast('error', 'Failed to load tricycles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      showToast('error', 'Please login first');
      return;
    }
    fetchTricycles();
  }, []);

  // ========== THEME ==========
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-mode' : 'light-mode';
  }, [isDarkMode]);

  // ========== FORM HANDLERS ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      capacity: '',
      price: '',
      pricePerDay: '',
      description: '',
      features: '',
      location: '',
      contactNumber: '',
    });
    removeImage();
  };

  // ========== CREATE TRICYCLE ==========
  const handleAddTricycle = async () => {
    if (!formData.name || !formData.price) {
      showToast('warning', 'Please fill in Name and Price.');
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
      const form = new FormData();
      form.append('name', String(formData.name || '').trim());
      form.append('type', String(formData.type || '').trim());
      form.append('capacity', String(formData.capacity || '').trim());
      form.append('price', String(formData.price || '').trim());
      form.append('pricePerDay', String(formData.pricePerDay || '').trim());
      // discount omitted
      form.append('description', String(formData.description || '').trim());
      form.append('features', String(formData.features || '').trim());
      form.append('location', String(formData.location || '').trim());
      form.append('contactNumber', String(formData.contactNumber || '').trim());
      
      if (imageFile) {
        form.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });

      if (response.status === 401) return handle401Error();

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      
      const result = await response.json();
      console.log('✅ Create Response:', result);
      
      if (result.success === false) {
        throw new Error(result.message || 'Create failed');
      }
      
      await fetchTricycles();
      resetForm();
      showToast('success', 'Tricycle added successfully!');
    } catch (err) {
      setError(err.message);
      console.error('❌ Add Error:', err);
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== DELETE ==========
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
        headers: getHeaders(),
      });
      
      if (response.status === 401) return handle401Error();
      if (!response.ok) throw new Error('Delete failed');
      
      await fetchTricycles();
      setSelectedId(null);
      showToast('success', 'Tricycle deleted successfully!');
    } catch (err) {
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId || selectedId === 'all') {
      showToast('warning', 'Please select a single item.');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Delete this tricycle?',
      onConfirm: () => performDeleteSelected(selectedId)
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
        headers: getHeaders(),
      });
      
      if (response.status === 401) return handle401Error();
      if (!response.ok) throw new Error('Delete failed');
      
      await fetchTricycles();
      showToast('success', 'Tricycle deleted successfully!');
    } catch (err) {
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromCard = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Delete this tricycle?',
      onConfirm: () => performDeleteFromCard(id)
    });
  };

  // ========== EDIT ==========
  const openEditModal = (item) => {
    setSelectedItemForEdit(item);
    setFormData({
      name: item.name || '',
      type: item.type || '',
      capacity: item.capacity || '',
      price: item.price || '',
      pricePerDay: item.pricePerDay || '',
      // discount omitted
      description: item.description || '',
      features: item.features || '',
      location: item.location || '',
      contactNumber: item.contactNumber || '',
    });
    if (item.image) {
      const imgUrl = item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image}`;
      setImagePreview(imgUrl);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleEditSelected = () => {
    if (!selectedId || selectedId === 'all') {
      showToast('warning', 'Please select a single item.');
      return;
    }
    const item = tricycles.find(t => t.id === selectedId);
    if (item) openEditModal(item);
  };

  const handleEditFromCard = (id) => {
    const item = tricycles.find(t => t.id === id);
    if (item) openEditModal(item);
  };

  // ========== CONFIRM EDIT ==========
  const handleConfirmEdit = async () => {
    if (!selectedItemForEdit) return;
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
      const form = new FormData();
      form.append('name', String(formData.name || '').trim());
      form.append('type', String(formData.type || '').trim());
      form.append('capacity', String(formData.capacity || '').trim());
      form.append('price', String(formData.price || '').trim());
      form.append('pricePerDay', String(formData.pricePerDay || '').trim());
      // discount omitted
      form.append('description', String(formData.description || '').trim());
      form.append('features', String(formData.features || '').trim());
      form.append('location', String(formData.location || '').trim());
      form.append('contactNumber', String(formData.contactNumber || '').trim());
      
      if (imageFile) {
        form.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE}/update/${selectedItemForEdit.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
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
      
      await fetchTricycles();
      setShowEditModal(false);
      setSelectedId(null);
      setSelectedItemForEdit(null);
      resetForm();
      showToast('success', 'Tricycle updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('❌ Update Error:', err);
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== SELECT ALL ==========
  const handleSelectAll = () => {
    setSelectedId(prev => prev === 'all' ? null : 'all');
    setShowAllDropdown(false);
  };

  const toggleSelection = (id) => {
    setSelectedId(prev => prev === id ? null : id);
  };

  // ===== Modified filteredTricycles (added user role filter) =====
  const filteredTricycles = tricycles
    .filter(item => {
      if (admin) return true;
      return item.createdBy === userId;
    })
    .filter(item =>
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ========== RENDER STARS ==========
  const renderStars = (rating) => {
    const num = parseFloat(rating) || 0;
    const full = Math.floor(num);
    const half = num % 1 !== 0;
    return (
      <>
        {[...Array(full)].map((_, i) => (
          <i key={i} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
        {half && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }}></i>}
        {[...Array(5 - Math.ceil(num))].map((_, i) => (
          <i key={i} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
      </>
    );
  };

  // ========== CARD ACTIONS ==========
  const CardActions = ({ itemId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = (e) => { e.stopPropagation(); setIsOpen(!isOpen); };
    const handleEdit = (e) => { e.stopPropagation(); setIsOpen(false); handleEditFromCard(itemId); };
    const handleDelete = (e) => { e.stopPropagation(); setIsOpen(false); handleDeleteFromCard(itemId); };
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) setIsOpen(false);
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
          <button className="edit-btn" onClick={handleEdit}><i className="bi bi-pencil-square"></i> Edit</button>
          <button className="delete-btn" onClick={handleDelete}><i className="bi bi-trash"></i> Delete</button>
        </div>
      </div>
    );
  };

  // ========== RENDER ==========
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Tricycles Management" onThemeChange={setIsDarkMode} />

      {/* Toast Alert UI */}
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

      {/* Confirm Delete Modal */}
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

      {loading && <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px', textAlign: 'center' }}>⏳ Loading...</div>}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '5px' }}>
          ❌ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Search & Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input type="text" placeholder="Search tricycle..." className="search-input-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button className="action-btn delete-btn" onClick={handleDeleteSelected} disabled={loading}>
          <i className="bi bi-trash"></i> Delete
        </button>
        <button className="action-btn edit-btn-action" onClick={handleEditSelected} disabled={loading}>
          <i className="bi bi-pencil-square"></i> Edit
        </button>
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}>
            <i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i>
          </button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>Select All</button>
              <button onClick={() => { setSelectedId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Two Columns Layout */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery */}
            <div className="image-gallery-top">
              <label className="gallery-label">Images Gallery</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload" />
                  <label htmlFor="image-upload" className="upload-box">
                    <i className="bi bi-plus-lg"></i> <span>Add Image</span>
                  </label>
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

            {/* Form Fields */}
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Tricycle Name</label>
                <input type="text" name="name" placeholder="eg. Bagan Traditional Trishaw" value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="">Select Type</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Electric">Electric</option>
                    <option value="Modern">Modern</option>
                    <option value="Family">Family</option>
                    <option value="Tourist">Tourist</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div className="add-form-group half">
                  <label>Capacity</label>
                  <input type="text" name="capacity" placeholder="eg. 2 passengers" value={formData.capacity} onChange={handleInputChange} />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price Per Hour (MMK)</label>
                  <input type="text" name="price" placeholder="eg. 15000" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="add-form-group half">
                  <label>Price Per Day (MMK)</label>
                  <input type="text" name="pricePerDay" placeholder="eg. 80000" value={formData.pricePerDay} onChange={handleInputChange} />
                </div>
              </div>

              <div className="add-form-group">
                <label>Location</label>
                <input type="text" name="location" placeholder="eg. Old Bagan, New Bagan" value={formData.location} onChange={handleInputChange} />
              </div>

              <div className="add-form-group">
                <label>Contact Number</label>
                <input type="text" name="contactNumber" placeholder="eg. 09-123456789" value={formData.contactNumber} onChange={handleInputChange} />
              </div>

              <div className="add-form-group">
                <label>Features</label>
                <textarea name="features" rows="2" placeholder="Comfortable seating, canopy roof, local guide driver..." value={formData.features} onChange={handleInputChange}></textarea>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Describe the tricycle experience..." value={formData.description} onChange={handleInputChange}></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddTricycle} disabled={loading}>
                {loading ? 'Adding...' : 'Add Tricycle'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            {!loading && tricycles.length === 0 && !error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <i className="bi bi-emoji-frown" style={{ fontSize: '40px' }}></i>
                <p>No tricycles found.</p>
              </div>
            ) : (
              <div className="hotels-grid-2cols">
                {filteredTricycles.map(item => {
                  const imageUrl = item.image
                    ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image}`)
                    : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                  return (
                    <div
                      key={item.id}
                      className={`hotel-card-vertical ${selectedId === item.id ? 'selected' : ''}`}
                      onClick={() => toggleSelection(item.id)}
                    >
                      <div className="hotel-card-image">
                        <div className="image-slider">
                          <img src={imageUrl} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"; }} />
                        </div>
                        <div className="selection-check">
                          {selectedId === item.id && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                        <CardActions itemId={item.id} />
                      </div>
                      <div className="hotel-card-info">
                        <h3 className="hotel-name">{item.name}</h3>
                        <div className="tricycle-type">
                          <span className="type-badge">{item.type || 'Standard'}</span>
                        </div>
                        <p className="hotel-location">
                          <i className="bi bi-geo-alt-fill"></i> {item.location || 'N/A'}
                        </p>
                        <div className="tricycle-details">
                          <span><i className="bi bi-people"></i> {item.capacity || 'N/A'}</span>
                        </div>
                        <div className="tricycle-pricing">
                          <span className="price-hour">Hour: MMK {item.price || '0'}</span>
                          {item.pricePerDay && (
                            <span className="price-day">Day: MMK {item.pricePerDay}</span>
                          )}
                        </div>
                        {item.features && (
                          <p className="features">
                            <i className="bi bi-star"></i> {item.features.substring(0, 60)}...
                          </p>
                        )}
                        <div className="hotel-rating">
                          {renderStars(item.rating || 4.0)}
                          <span className="rating-count">({item.reviews || '0'})</span>
                        </div>
                        {item.contactNumber && (
                          <p className="contact-info">
                            <i className="bi bi-telephone"></i> {item.contactNumber}
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
              <h2>Edit Tricycle</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Image</label>
                <div className="image-gallery-wrapper" style={{ marginBottom: '10px' }}>
                  <div className="image-upload-box">
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="edit-image-upload" />
                    <label htmlFor="edit-image-upload" className="upload-box" style={{ width: '80px', height: '80px' }}>
                      <i className="bi bi-plus-lg"></i>
                    </label>
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
                <label>Tricycle Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="">Select Type</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Electric">Electric</option>
                    <option value="Modern">Modern</option>
                    <option value="Family">Family</option>
                    <option value="Tourist">Tourist</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="text" name="capacity" value={formData.capacity} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Hour (MMK)</label>
                  <input type="text" name="price" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Price Per Day (MMK)</label>
                  <input type="text" name="pricePerDay" value={formData.pricePerDay} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Features</label>
                <textarea name="features" rows="2" value={formData.features} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
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

export default Tricycles;