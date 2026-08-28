// components/Hotels.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import axios from 'axios';

function Hotels() {
  // ===== API Base URL =====
  const API_BASE = '/api/admin/hotel';
  const BACKEND_URL = 'http://130.94.21.185:8000';

  // ===== Theme =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== UI States =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelForEdit, setSelectedHotelForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== Data States =====
  const [hotels, setHotels] = useState([]);

  // ===== Image States =====
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // ===== Form Data =====
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    price: '',
    discount: '',
    start_date: '',
    end_date: '',
    description: '',
    facilities: '',
  });

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

  // ===== User role check =====
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } 
    catch { return null; }
  })();
  const admin = user?.role === 'admin';
  const userId = user?.id;

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

  // ===== Theme Handler =====
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // ===== Get Token =====
  const getToken = () => localStorage.getItem('token');

  // ===== Axios Instance =====
  const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('=== API Request ===', config.method.toUpperCase(), config.url);
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      console.log('=== API Response ===', response.status);
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        handle401Error();
      }
      console.error('=== API Error ===', error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const trimmed = imagePath.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return `${BACKEND_URL}${trimmed}`;
    }
    return `${BACKEND_URL}/${trimmed}`;
  };

  // ===== Fetch Hotels =====
  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/list');
      console.log('GET Response:', response.data);

      let hotelData = response.data.data || response.data.hotels || response.data || [];
      hotelData = hotelData.map((hotel) => ({
        ...hotel,
        image: getImageUrl(hotel.image)
      }));

      setHotels(hotelData);
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to fetch hotels. Please try again.');
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
    fetchHotels();
  }, []);

  // ===== Form Input Change =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ===== Image Upload =====
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // ===== Reset Form =====
  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      location: '',
      price: '',
      discount: '',
      start_date: '',
      end_date: '',
      description: '',
      facilities: '',
    });
    setImagePreview(null);
    setImageFile(null);
  };

  // ===== ADD HOTEL (shop_id အမြဲပို့မယ်) =====
  const handleAddHotel = async () => {
    // Validation
    if (!formData.name || !formData.type || !formData.location || !formData.price ||
        !formData.start_date || !formData.end_date || !formData.description ||
        !formData.facilities) {
      showToast('warning', 'All fields are required!');
      return;
    }

    if (!imageFile) {
      showToast('warning', 'Please upload an image.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    // 👇 Get role and shopId
    const shopId = localStorage.getItem('shopId');
    const role = localStorage.getItem('role');

    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('type', formData.type);
      form.append('location', formData.location);
      form.append('price', formData.price);
      form.append('discount', formData.discount || '0');
      form.append('start_date', formData.start_date);
      form.append('end_date', formData.end_date);
      form.append('description', formData.description);
      form.append('facilities', formData.facilities);
      form.append('image', imageFile);
      
      // ✅ shop_id ကို အမြဲပို့မယ် (Backend က required လုပ်ထားလို့)
      if (role === 'shop' && shopId) {
        form.append('shop_id', shopId);
      } else {
        // Admin အတွက် shop_id ကို '0' ပို့မယ်
        form.append('shop_id', '0');
      }

      console.log('📤 Sending FormData:');
      for (let [key, value] of form.entries()) {
        console.log(key, '=', value);
      }

      const response = await axios.post(`${API_BASE}/create`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('POST Response:', response.data);
      if (response.data && response.data.success) {
        showToast('success', 'Hotel added successfully!');
        resetForm();
        fetchHotels();
      } else {
        showToast('error', response.data?.message || 'Failed to add hotel.');
      }
    } catch (err) {
      console.error('Add Error:', err);
      if (err.response?.status === 401) return;
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      showToast('error', `Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE HOTEL =====
  const performDeleteHotel = async (id) => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/delete/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        showToast('success', 'Hotel deleted successfully!');
        fetchHotels();
      } else {
        showToast('error', response.data?.message || 'Failed to delete hotel.');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      if (err.response?.status === 401) return;
      showToast('error', `Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this hotel?',
      onConfirm: () => performDeleteHotel(id)
    });
  };

  // ===== Helper: Format date for input =====
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    const yyyymmddMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (yyyymmddMatch) return yyyymmddMatch[0];
    
    const yyyyslashMatch = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
    if (yyyyslashMatch) return `${yyyyslashMatch[1]}-${yyyyslashMatch[2]}-${yyyyslashMatch[3]}`;
    
    const ddmmyyyyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (ddmmyyyyMatch) return `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[1]}`;
    
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return isoMatch[0];
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // ===== EDIT (Open Modal) =====
  const handleEditHotel = (id) => {
    const hotelToEdit = hotels.find((h) => h.id === id);
    if (!hotelToEdit) {
      showToast('error', 'Hotel not found.');
      return;
    }

    setSelectedHotelForEdit(hotelToEdit);
    setFormData({
      name: hotelToEdit.name || '',
      type: hotelToEdit.type || '',
      location: hotelToEdit.location || '',
      price: hotelToEdit.price || '',
      discount: hotelToEdit.discount || '',
      start_date: formatDateForInput(hotelToEdit.start_date),
      end_date: formatDateForInput(hotelToEdit.end_date),
      description: hotelToEdit.description || '',
      facilities: hotelToEdit.facilities || '',
    });
    setImagePreview(hotelToEdit.image || null);
    setImageFile(null);
    setShowEditModal(true);
  };

  // ===== CONFIRM EDIT (shop_id အမြဲပို့မယ်) =====
  const handleConfirmEdit = async () => {
    if (!formData.name || !formData.type || !formData.location || !formData.price ||
        !formData.description || !formData.facilities) {
      showToast('warning', 'Please fill all required fields.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    const shopId = localStorage.getItem('shopId');
    const role = localStorage.getItem('role');

    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('type', formData.type);
      form.append('location', formData.location);
      form.append('price', formData.price);
      form.append('discount', formData.discount || '0');
      form.append('start_date', formData.start_date);
      form.append('end_date', formData.end_date);
      form.append('description', formData.description);
      form.append('facilities', formData.facilities);
      
      if (imageFile) {
        form.append('image', imageFile);
      }

      // ✅ shop_id ကို အမြဲပို့မယ်
      if (role === 'shop' && shopId) {
        form.append('shop_id', shopId);
      } else {
        form.append('shop_id', '0');
      }

      const response = await axios.put(`${API_BASE}/update/${selectedHotelForEdit.id}`, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        showToast('success', 'Hotel updated successfully!');
        setShowEditModal(false);
        setSelectedHotelForEdit(null);
        resetForm();
        fetchHotels();
      } else {
        showToast('error', response.data?.message || 'Failed to update hotel.');
      }
    } catch (err) {
      console.error('Update Error:', err);
      if (err.response?.status === 401) return;
      showToast('error', `Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER & RENDER – filter by shop_id (priority) or createdBy =====
  const filteredHotels = hotels
    .filter(hotel => {
      if (admin) return true;

      const shopId = localStorage.getItem('shopId');
      if (hotel.shop_id && shopId) {
        return String(hotel.shop_id) === String(shopId);
      }

      if (hotel.createdBy) {
        return hotel.createdBy === userId;
      }

      return false;
    })
    .filter(hotel =>
      hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const renderStars = (rating) => {
    const safeRating = rating || 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }}></i>}
        {[...Array(5 - Math.ceil(safeRating))].map((_, i) => (
          <i key={i} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
      </>
    );
  };

  // ===== Card Actions Component =====
  const CardActions = ({ hotelId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleEditHotel(hotelId);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleDeleteHotel(hotelId);
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

  // ===== LOADING =====
  if (loading && hotels.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Hotels Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading hotels...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Hotels Management" onThemeChange={handleThemeChange} />

      {/* Toast Alert */}
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

      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search hotel..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i> {error}
        </div>
      )}

      <div className="hotels-two-columns">
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="image-gallery-top">
              <label className="gallery-label">Image *</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
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
                  {imagePreview && (
                    <div className="image-item">
                      <img src={imagePreview} alt="Preview" />
                      <button className="remove-image-btn" onClick={removeImage}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Hotel Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="eg. Aureum Palace Hotel"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Room Type *</label>
                <input
                  type="text"
                  name="type"
                  placeholder="eg. Deluxe Room"
                  value={formData.type}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="eg. Old Bagan, Nyaung U"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="eg. 50000"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Discount %</label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="eg. 20"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Hotel description..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>Facilities * (comma separated)</label>
                <textarea
                  name="facilities"
                  rows="2"
                  placeholder="WiFi, Parking, Pool, Restaurant..."
                  value={formData.facilities}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddHotel} disabled={loading}>
                {loading ? 'Adding...' : 'Add Hotel'}
              </button>
            </div>
          </div>
        </div>

        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredHotels.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <div key={hotel.id} className="hotel-card-vertical">
                    <div className="hotel-card-image">
                      <div className="image-slider">
                        <img
                          src={hotel.image || '/default-hotel.jpg'}
                          alt={hotel.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-hotel.jpg';
                          }}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                      <CardActions hotelId={hotel.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name">{hotel.name}</h3>
                      <p className="hotel-location">
                        <i className="bi bi-geo-alt-fill"></i> {hotel.location || 'Location not specified'}
                      </p>
                      <p className="hotel-price">Starting from <span>MMK {hotel.price}</span></p>
                      <div className="hotel-rating">
                        {renderStars(hotel.rating || 0)}
                        <span className="rating-count">({hotel.reviews || 0})</span>
                      </div>
                      {hotel.created_at && (
                        <p className="created-at" style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                          <i className="bi bi-clock"></i> Added: {hotel.created_at}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '50px',
                  color: '#999'
                }}>
                  <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No hotels found. Add your first hotel!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Hotel</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Image (Optional - upload new to replace)</label>
                <div className="image-gallery-wrapper" style={{ marginBottom: '10px' }}>
                  <div className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="upload-box" style={{ width: '80px', height: '80px' }}>
                      <i className="bi bi-plus-lg"></i>
                    </label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {imagePreview && (
                      <div className="image-item">
                        <img src={imagePreview} alt="Preview" />
                        <button className="remove-image-btn" onClick={removeImage}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <small style={{ opacity: 0.7 }}>Leave as is if you don't want to change image.</small>
              </div>

              <div className="form-group">
                <label>Hotel Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Room Type *</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Discount %</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Facilities * (comma separated)</label>
                <textarea
                  name="facilities"
                  rows="2"
                  value={formData.facilities}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="add-item-btn" onClick={handleConfirmEdit} disabled={loading}>
                {loading ? 'Updating...' : 'Confirm Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hotels;