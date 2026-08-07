import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function Restaurants() {
  // ===== Theme =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== UI States =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedRestaurantForEdit, setSelectedRestaurantForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);

  // ===== Image States (File-based) =====
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ===== API States =====
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== Form State =====
  const [formData, setFormData] = useState({
    restaurantName: '',
    location: '',
    address: '',
    phone: '',
    dishes: '',
    discount: '',
    openingHours: '',
    description: '',
  });

  // ===== API Base URL =====
  const API_BASE = '/api/admin/restaurant';
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

  // ===== Toast Helper (3s အကြာမှာ အလိုအလျောက်ပျောက်မယ်) =====
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

  // ========== FETCH RESTAURANTS (✅ FIX: .trim() added) ==========
  const fetchRestaurants = async () => {
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
          // 🔥 FIX: .trim() added here to remove leading space
          image: item.image
            ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}/${item.image.trim()}`)
            : null,
          dishes: Array.isArray(item.dishes) ? item.dishes.join(', ') : (item.dishes || ''),
        }));
      } else if (Array.isArray(result)) {
        list = result;
      } else {
        list = [];
      }

      setRestaurants(list);
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
    fetchRestaurants();
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
      restaurantName: '',
      location: '',
      address: '',
      phone: '',
      dishes: '',
      discount: '',
      openingHours: '',
      description: '',
    });
    removeImage();
  };

  // ========== ADD RESTAURANT ==========
  const handleAddRestaurant = async () => {
    if (!formData.restaurantName || !formData.location) {
      showToast('warning', 'Please fill in Restaurant Name and Location.');
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
      form.append('name', formData.restaurantName.trim());
      form.append('location', formData.location.trim());
      form.append('address', formData.address?.trim() || '');
      form.append('phone', formData.phone?.trim() || '');
      form.append('discount', String(formData.discount || '').replace(/[^0-9]/g, '') || '0');
      form.append('description', formData.description?.trim() || '');
      form.append('dishes', formData.dishes?.trim() || '');
      form.append('opening_hours', formData.openingHours?.trim() || '');
      
      if (imageFile) {
        form.append('image', imageFile);
      }

      console.log('📤 Sending FormData...');

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
      
      await fetchRestaurants();
      resetForm();
      showToast('success', 'Restaurant added successfully!');
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
      
      await fetchRestaurants();
      setSelectedRestaurantId(null);
      showToast('success', 'Restaurant deleted successfully!');
    } catch (err) {
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedRestaurantId || selectedRestaurantId === 'all') {
      showToast('warning', 'Please select a single restaurant.');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Delete this restaurant?',
      onConfirm: () => performDeleteSelected(selectedRestaurantId)
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
      
      await fetchRestaurants();
      showToast('success', 'Restaurant deleted successfully!');
    } catch (err) {
      showToast('error', 'Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromCard = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Delete this restaurant?',
      onConfirm: () => performDeleteFromCard(id)
    });
  };

  // ========== EDIT (open modal) ==========
  const openEditModal = (restaurant) => {
    setSelectedRestaurantForEdit(restaurant);
    setFormData({
      restaurantName: restaurant.name || '',
      location: restaurant.location || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      dishes: restaurant.dishes || '',
      discount: restaurant.discount || '',
      openingHours: restaurant.opening_hours || '',
      description: restaurant.description || '',
    });
    
    // ✅ Already had .trim() here - Good
    const existingImage = restaurant.image 
  ? (restaurant.image.startsWith('http') ? restaurant.image : `${BACKEND_URL}/${restaurant.image.trim()}`)
  : null;
    setImagePreview(existingImage);
    setImageFile(null);
    
    setShowEditModal(true);
  };

  const handleEditSelected = () => {
    if (!selectedRestaurantId || selectedRestaurantId === 'all') {
      showToast('warning', 'Please select a single restaurant.');
      return;
    }
    const restaurant = restaurants.find(r => r.id === selectedRestaurantId);
    if (restaurant) openEditModal(restaurant);
  };

  const handleEditFromCard = (id) => {
    const restaurant = restaurants.find(r => r.id === id);
    if (restaurant) openEditModal(restaurant);
  };

  // ========== 🚀 CONFIRM EDIT (✅ FIX: Removed the problematic else if) ==========
  const handleConfirmEdit = async () => {
    if (!selectedRestaurantForEdit) return;
    if (!formData.restaurantName) {
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
      form.append('name', formData.restaurantName.trim());
      form.append('location', formData.location.trim());
      form.append('address', formData.address?.trim() || '');
      form.append('phone', formData.phone?.trim() || '');
      form.append('discount', String(formData.discount || '').replace(/[^0-9]/g, '') || '0');
      form.append('description', formData.description?.trim() || '');
      form.append('dishes', formData.dishes?.trim() || '');
      form.append('opening_hours', formData.openingHours?.trim() || '');
      
      // ✅ FIX: Only send image if a NEW file is selected.
      // If no new file, DO NOT send the 'image' field at all.
      // This prevents sending the string path with spaces back to the backend.
      if (imageFile) {
        form.append('image', imageFile);
      }
      // ❌ အောက်က else if ကို လုံးဝ ဖျက်ပစ်လိုက်ပါ။ ဒါမှ ပုံဟောင်း မပျက်တော့မှာ။
      // else if (selectedRestaurantForEdit && selectedRestaurantForEdit.image) {
      //   form.append('image', selectedRestaurantForEdit.image);
      // }

      console.log('📤 Updating with FormData...');

      const response = await fetch(`${API_BASE}/update/${selectedRestaurantForEdit.id}`, {
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

      await fetchRestaurants();
      setShowEditModal(false);
      setSelectedRestaurantId(null);
      setSelectedRestaurantForEdit(null);
      resetForm();
      showToast('success', 'Restaurant updated successfully!');
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
    setSelectedRestaurantId(prev => prev === 'all' ? null : 'all');
    setShowAllDropdown(false);
  };

  const toggleRestaurantSelection = (id) => {
    setSelectedRestaurantId(prev => prev === id ? null : id);
  };

  const filteredRestaurants = restaurants.filter(r =>
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.dishes || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // ==================== CardActions Component ====================
  const CardActions = ({ restaurantId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleEditFromCard(restaurantId);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleDeleteFromCard(restaurantId);
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
              <button onClick={() => { if(confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, visible: false }); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>Delete</button>
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
          <input type="text" placeholder="Search restaurant..." className="search-input-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <button className="action-btn delete-btn" onClick={handleDeleteSelected} disabled={loading}><i className="bi bi-trash"></i> Delete</button>
        <button className="action-btn edit-btn-action" onClick={handleEditSelected} disabled={loading}><i className="bi bi-pencil-square"></i> Edit</button>
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}><i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i></button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>Select All</button>
              <button onClick={() => { setSelectedRestaurantId(null); setShowAllDropdown(false); }}>Deselect All</button>
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
              <div className="add-form-group"><label>Restaurant Name *</label><input type="text" name="restaurantName" placeholder="eg. Bagan Golden" value={formData.restaurantName} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Location *</label><input type="text" name="location" placeholder="Old Bagan" value={formData.location} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Address</label><input type="text" name="address" placeholder="Near Ananda Temple, Bagan" value={formData.address} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Phone</label><input type="text" name="phone" placeholder="09-123456789" value={formData.phone} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Dishes (comma separated)</label><input type="text" name="dishes" placeholder="Mohinga, Shan Noodle, Myanmar Curry" value={formData.dishes} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Discount %</label><input type="text" name="discount" placeholder="10" value={formData.discount} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Opening Hours</label><input type="text" name="openingHours" placeholder="9:00 AM - 9:00 PM" value={formData.openingHours} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Description</label><textarea name="description" rows="3" placeholder="Describe..." value={formData.description} onChange={handleInputChange}></textarea></div>
              <button className="add-item-btn-full" onClick={handleAddRestaurant} disabled={loading}>{loading ? 'Adding...' : 'Add Restaurant'}</button>
            </div>
          </div>
        </div>

        {/* Right Column - Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            {!loading && restaurants.length === 0 && !error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}><i className="bi bi-emoji-frown" style={{ fontSize: '40px' }}></i><p>No restaurants found.</p></div>
            ) : (
              <div className="hotels-grid-2cols">
                {filteredRestaurants.map(r => {
                  // ✅ FIX: .trim() added here to remove leading space in card rendering
                  const imageUrl = r.image ? (r.image.startsWith('http') ? r.image : `${BACKEND_URL}/${r.image.trim()}`) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                  return (
                    <div key={r.id} className={`hotel-card-vertical ${selectedRestaurantId === r.id ? 'selected' : ''}`} onClick={() => toggleRestaurantSelection(r.id)}>
                      <div className="hotel-card-image">
                        <div className="image-slider">
                          <img src={imageUrl} alt={r.name} onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"; }} />
                        </div>
                        <div className="selection-check">{selectedRestaurantId === r.id && <i className="bi bi-check-circle-fill"></i>}</div>
                        <CardActions restaurantId={r.id} />
                      </div>
                      <div className="hotel-card-info">
                        <h3 className="hotel-name">{r.name}</h3>
                        <p className="hotel-location"><i className="bi bi-geo-alt-fill"></i> {r.location || 'N/A'}</p>
                        {r.address && <p className="address"><i className="bi bi-house-door"></i> {r.address}</p>}
                        {r.dishes && <p className="dishes"><i className="bi bi-egg-fried"></i> {r.dishes}</p>}
                        <div className="hotel-rating">{renderStars(r.rating || 4.0)}<span className="rating-count">({r.reviews || '0'})</span></div>
                        {r.opening_hours && <p className="opening-hours"><i className="bi bi-clock"></i> {r.opening_hours}</p>}
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
              <h2>Edit Restaurant</h2>
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
              <div className="form-group"><label>Restaurant Name *</label><input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Location *</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Dishes (comma separated)</label><input type="text" name="dishes" value={formData.dishes} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Discount %</label><input type="text" name="discount" value={formData.discount} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Opening Hours</label><input type="text" name="openingHours" value={formData.openingHours} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Description</label><textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea></div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="add-item-btn" onClick={handleConfirmEdit} disabled={loading}>{loading ? 'Saving...' : 'Confirm Edit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restaurants;