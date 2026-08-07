// components/Destinations.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import axios from 'axios';

function Destinations() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestinationForEdit, setSelectedDestinationForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add Form Images
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Edit Modal Images
  const [editImages, setEditImages] = useState([]);
  const [editImageFiles, setEditImageFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    destinationName: '',
    location: '',
    price: '',
    discount: '',
    startDate: '',
    endDate: '',
    description: '',
    activities: '',
    bestTimeToVisit: '',
    images: [],
  });

  const [destinations, setDestinations] = useState([]);

  // ===== Toast & Confirm States (Alert အစားထိုးရန်) =====
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

  // ===== 401 Unauthorized Handler =====
  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  const getToken = () => localStorage.getItem('token');

  const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('image/')) {
      return `http://130.94.21.185:8000/${imagePath}`;
    }
    return `http://130.94.21.185:8000/${imagePath}`;
  };

  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      
      // 🔥 401 ရှိရင် အလိုအလျောက် Login ခေါ်သွားမယ်
      if (error.response && error.response.status === 401) {
        handle401Error();
        return Promise.reject(error);
      }

      if (error.response) {
        showToast('error', `Error ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'Server error'}`);
      } else if (error.request) {
        showToast('error', 'Cannot connect to server. Please check your connection.');
      } else {
        showToast('error', 'An error occurred. Please try again.');
      }
      return Promise.reject(error);
    }
  );

  // ===== Helper: convert any date string to YYYY-MM-DD =====
  const toISODate = (dateStr) => {
    if (!dateStr) return '';
    const str = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const parts = str.split(/[-/]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      if (year.length === 4 && day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return `${year}-${month}-${day}`;
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return str;
  };

  // ========== FETCH DESTINATIONS ==========
  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/destination/list');

      if (response.data && response.data.success && response.data.data) {
        const formattedDestinations = response.data.data.map((item) => ({
          id: item.id,
          name: item.name || '',
          location: item.location || '',
          price: item.price ? `${item.price} MMK` : 'Free',
          rating: item.rating || 4.5,
          reviews: item.reviews || '0',
          images: item.image ? [getImageUrl(item.image)] : ['📍'],
          description: item.description || '',
          activities: item.activities || '',
          discount: item.discount || '',
          created_at: item.created_at || '',
          startDate: toISODate(item.start_date || item.startDate || ''),
          endDate: toISODate(item.end_date || item.endDate || ''),
          bestTimeToVisit: item.best_time_to_visit || item.bestTimeToVisit || '',
        }));

        setDestinations(formattedDestinations);
      } else {
        setDestinations([]);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to fetch destinations. Please try again.');
      setDestinations([]);
      showToast('error', 'Failed to fetch destinations. Please try again.');
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
    fetchDestinations();
  }, []);

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

  // ==================== ADD FORM HANDLERS ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles([...imageFiles, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, reader.result]);
        setFormData({ ...formData, images: [...formData.images, reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setImages(newImages);
    setImageFiles(newImageFiles);
    setFormData({ ...formData, images: newImages });
  };

  // ==================== EDIT MODAL IMAGE HANDLERS ====================
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFiles([...editImageFiles, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImages([...editImages, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageRemove = (index) => {
    const newImages = editImages.filter((_, i) => i !== index);
    const newFiles = editImageFiles.filter((_, i) => i !== index);
    setEditImages(newImages);
    setEditImageFiles(newFiles);
  };

  // ==================== ADD DESTINATION ====================
  const handleAddDestination = async () => {
    if (!formData.destinationName || !formData.price) {
      showToast('warning', 'Please fill in destination name and price.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.destinationName);
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('price', formData.price.replace(/[^0-9]/g, '') || '0');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('best_time_to_visit', formData.bestTimeToVisit || '');
      formDataToSend.append('activities', formData.activities || '');
      formDataToSend.append('discount', formData.discount || '');
      formDataToSend.append('start_date', formData.startDate || '');
      formDataToSend.append('end_date', formData.endDate || '');

      imageFiles.forEach((file) => {
        formDataToSend.append('image', file);
      });

      const response = await axios.post('/api/admin/destination/create', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        showToast('success', 'Destination added successfully!');
        await fetchDestinations();
        setFormData({
          destinationName: '',
          location: '',
          price: '',
          discount: '',
          startDate: '',
          endDate: '',
          description: '',
          activities: '',
          bestTimeToVisit: '',
          images: [],
        });
        setImages([]);
        setImageFiles([]);
      } else {
        showToast('error', response.data?.message || 'Failed to add destination.');
      }
    } catch (err) {
      console.error('Create Error:', err);
      if (err.response?.status === 401) return;
      showToast('error', 'Error adding destination. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DELETE (With Custom Confirm) ====================
  const performDeleteDestination = async (id) => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await api.delete(`/admin/destination/delete/${id}`);

      if (response.data && response.data.success) {
        showToast('success', 'Destination deleted successfully!');
        await fetchDestinations();
      } else {
        showToast('error', response.data?.message || 'Failed to delete destination.');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      if (err.response?.status === 401) return;
      showToast('error', 'Error deleting destination. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDestination = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this destination?',
      onConfirm: () => performDeleteDestination(id)
    });
  };

  // ==================== EDIT (Open Modal) ====================
  const handleEditDestination = (id) => {
    const destinationToEdit = destinations.find((destination) => destination.id === id);
    if (!destinationToEdit) {
      showToast('error', 'Destination not found.');
      return;
    }

    setSelectedDestinationForEdit(destinationToEdit);

    const formatDate = (dateVal) => toISODate(dateVal);

    setFormData({
      destinationName: destinationToEdit.name || '',
      location: destinationToEdit.location || '',
      price: destinationToEdit.price ? destinationToEdit.price.replace(/[^0-9]/g, '') : '',
      discount: destinationToEdit.discount || '',
      startDate: formatDate(destinationToEdit.startDate),
      endDate: formatDate(destinationToEdit.endDate),
      description: destinationToEdit.description || '',
      activities: destinationToEdit.activities || '',
      bestTimeToVisit: destinationToEdit.bestTimeToVisit || '',
      images: destinationToEdit.images || [],
    });

    setEditImages(destinationToEdit.images || []);
    setEditImageFiles([]);
    setShowEditModal(true);
  };

  // ==================== CONFIRM EDIT ====================
  const handleConfirmEdit = async () => {
    if (!selectedDestinationForEdit || !formData.destinationName) {
      showToast('warning', 'Please fill in all required fields');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.destinationName);
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('price', formData.price.replace(/[^0-9]/g, '') || '0');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('best_time_to_visit', formData.bestTimeToVisit || '');
      formDataToSend.append('activities', formData.activities || '');
      formDataToSend.append('discount', formData.discount || '');
      formDataToSend.append('start_date', formData.startDate || '');
      formDataToSend.append('end_date', formData.endDate || '');

      editImageFiles.forEach((file) => {
        formDataToSend.append('image', file);
      });

      const response = await axios.put(
        `/api/admin/destination/update/${selectedDestinationForEdit.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.success) {
        showToast('success', 'Destination updated successfully!');
        setShowEditModal(false);
        setSelectedDestinationForEdit(null);
        setEditImages([]);
        setEditImageFiles([]);
        await fetchDestinations();
        setFormData({
          destinationName: '',
          location: '',
          price: '',
          discount: '',
          startDate: '',
          endDate: '',
          description: '',
          activities: '',
          bestTimeToVisit: '',
          images: [],
        });
        setImages([]);
        setImageFiles([]);
      } else {
        showToast('error', response.data?.message || 'Failed to update destination.');
      }
    } catch (err) {
      console.error('Update Error:', err);
      if (err.response?.status === 401) return;
      showToast('error', 'Error updating destination. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ========== FILTER & RENDER ==========
  const filteredDestinations = destinations.filter(
    (destination) =>
      destination.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }}></i>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <i key={i} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
      </>
    );
  };

  const CardActions = ({ destinationId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleEditDestination(destinationId);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleDeleteDestination(destinationId);
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

  if (loading && destinations.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Destinations Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Destinations Management" onThemeChange={handleThemeChange} />

      {/* 🟢 Screen အလယ် Toast Alert UI */}
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

      {/* 🟢 Screen အလယ် Confirm Delete Modal */}
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
            placeholder="Search destination..."
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
        {/* ===== ADD FORM COLUMN ===== */}
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="image-gallery-top">
              <label className="gallery-label">Images Gallery</label>
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
                  {images.map((img, index) => (
                    <div key={index} className="image-item">
                      <img src={img} alt={`Preview ${index}`} />
                      <button className="remove-image-btn" onClick={() => removeImage(index)}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Destination Name *</label>
                <input
                  type="text"
                  name="destinationName"
                  placeholder="eg. Bagan Ancient City"
                  value={formData.destinationName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="eg. Mandalay Region"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price (MMK) *</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="eg. 150000"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Discount %</label>
                  <input
                    type="text"
                    name="discount"
                    placeholder="eg. 20"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the destination, highlights, and attractions..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>Best Time to Visit</label>
                <input
                  type="text"
                  name="bestTimeToVisit"
                  placeholder="eg. November to February"
                  value={formData.bestTimeToVisit}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Activities</label>
                <textarea
                  name="activities"
                  rows="2"
                  placeholder="Temple hopping, hot air balloon, sunset viewing..."
                  value={formData.activities}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddDestination} disabled={loading}>
                {loading ? 'Adding...' : 'Add Destination'}
              </button>
            </div>
          </div>
        </div>

        {/* ===== DESTINATION CARDS COLUMN ===== */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredDestinations.length > 0 ? (
                filteredDestinations.map((destination) => (
                  <div key={destination.id} className="hotel-card-vertical">
                    <div className="hotel-card-image">
                      <div className="image-slider">
                        {destination.images && destination.images[0] && (
                          destination.images[0].startsWith('http') ? (
                            <img
                              src={destination.images[0]}
                              alt={destination.name}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div style="font-size:60px;display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white">
                                      📍
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                fontSize: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                              }}
                            >
                              📍
                            </div>
                          )
                        )}
                      </div>
                      <CardActions destinationId={destination.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name">{destination.name}</h3>
                      <p className="hotel-location">
                        <i className="bi bi-geo-alt-fill"></i> {destination.location}
                      </p>
                      <p className="hotel-price">
                        Starting from <span>MMK {destination.price}</span>
                      </p>
                      <div className="hotel-rating">
                        {renderStars(destination.rating || 4.5)}
                        <span className="rating-count">({destination.reviews || '0'})</span>
                      </div>
                      {destination.bestTimeToVisit && (
                        <p className="best-time">
                          <i className="bi bi-calendar-check"></i> Best: {destination.bestTimeToVisit}
                        </p>
                      )}
                      {destination.description && (
                        <p
                          className="destination-description"
                          style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}
                        >
                          {destination.description.length > 80
                            ? `${destination.description.substring(0, 80)}...`
                            : destination.description}
                        </p>
                      )}
                      {destination.created_at && (
                        <p className="created-at" style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                          <i className="bi bi-clock"></i> Added: {destination.created_at}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '50px',
                    color: '#999',
                  }}
                >
                  <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No destinations found. Add your first destination!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== EDIT MODAL ==================== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Destination</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {/* ===== EDIT IMAGE GALLERY ===== */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold' }}>📸 Edit Images</label>
                <div className="image-gallery-wrapper" style={{ marginTop: '10px' }}>
                  <div className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="upload-box">
                      <i className="bi bi-plus-lg"></i>
                      <span>Add Image</span>
                    </label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {editImages.map((img, index) => (
                      <div key={index} className="image-item">
                        <img src={img} alt={`Edit Preview ${index}`} />
                        <button className="remove-image-btn" onClick={() => handleEditImageRemove(index)}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                  💡 Add new images or remove existing ones. Existing images will be kept unless removed.
                </small>
              </div>

              {/* Edit Form Fields */}
              <div className="form-group">
                <label>Destination Name *</label>
                <input
                  type="text"
                  name="destinationName"
                  value={formData.destinationName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (MMK)</label>
                  <input type="text" name="price" value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Discount %</label>
                  <input type="text" name="discount" value={formData.discount} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Best Time to Visit</label>
                <input
                  type="text"
                  name="bestTimeToVisit"
                  value={formData.bestTimeToVisit}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Activities</label>
                <textarea
                  name="activities"
                  rows="2"
                  value={formData.activities}
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

export default Destinations;