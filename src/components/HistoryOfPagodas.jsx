// components/HistoryOfPagodas.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';

function HistoryOfPagodas() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPagodaForEdit, setSelectedPagodaForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    pagodaName: '',
    location: '',
    price: '',
    discount: '',
    startDate: '',
    endDate: '',
    description: '',
    history: '',
    tags: '',
    facilities: '',
    images: []
  });

  const [pagodas, setPagodas] = useState([]);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const api = axios.create({
    baseURL: '/api',
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
      console.log('=== API Request ===');
      console.log('Method:', config.method.toUpperCase());
      console.log('URL:', config.baseURL + config.url);
      console.log('Data:', config.data);
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      return response;
    },
    (error) => {
      console.error('=== API Error ===');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        alert(`Error ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'Server error'}`);
      } else if (error.request) {
        console.error('No response received');
        alert('Cannot connect to server. Please check your connection.');
      } else {
        console.error('Error:', error.message);
        alert('An error occurred. Please try again.');
      }
      return Promise.reject(error);
    }
  );

  const fetchPagodas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/pagoda/list');
      console.log('GET Response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const formattedPagodas = response.data.data.map((item) => ({
          id: item.id,
          name: item.name || '',
          nameEn: item.name || '',
          location: item.location || '',
          locationMm: item.location || '',
          price: item.fee ? `${item.fee} MMK` : 'Free',
          rating: 4.5,
          reviews: '0',
          images: item.image ? [`http://130.94.21.185:8000/${item.image}`] : ['🛕'],
          descriptionMm: item.description || '',
          description: item.description || '',
          historyMm: item.history || '',
          history: item.history || '',
          tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
          bestTimeToVisit: item.visit_date || '',
          bestTimeToVisitMm: item.visit_date || '',
          discount: item.discount || '',
          facilities: item.facilities || '',
          startDate: item.visit_date || '',
          endDate: item.visit_date || '',
          fee: item.fee || 0,
          total_fee: item.total_fee || 0,
          image: item.image || '',
          created_at: item.created_at || ''
        }));
        
        setPagodas(formattedPagodas);
        console.log('Formatted Pagodas:', formattedPagodas);
      } else {
        setPagodas([]);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to fetch pagodas. Please try again.');
      setPagodas([]);
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
    fetchPagodas();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store file for FormData
      setImageFiles([...imageFiles, file]);
      
      // Preview
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

  // ✅ CORRECT: Using FormData for POST
  const handleAddPagoda = async () => {
    if (!formData.pagodaName || !formData.location) {
      alert('Please fill in pagoda name and location.');
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      // Create FormData
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.pagodaName);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('fee', formData.price || '0');
      formDataToSend.append('visit_date', formData.startDate || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('history', formData.history || '');
      formDataToSend.append('discount', formData.discount || '');
      
      // Add tags as comma separated string or array
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }

      // Add image files
      imageFiles.forEach((file) => {
        formDataToSend.append('image', file);
      });

      console.log('Creating pagoda with FormData');
      
      // Use axios with FormData
      const response = await axios.post('/api/admin/pagoda/create', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('POST Response:', response.data);
      
      if (response.data && response.data.success) {
        alert('Pagoda added successfully!');
        await fetchPagodas();
        setFormData({
          pagodaName: '',
          location: '',
          price: '',
          discount: '',
          startDate: '',
          endDate: '',
          description: '',
          history: '',
          tags: '',
          facilities: '',
          images: []
        });
        setImages([]);
        setImageFiles([]);
      } else {
        alert(response.data?.message || 'Failed to add pagoda.');
      }
    } catch (err) {
      console.error('Create Error:', err);
      if (err.response) {
        console.error('Error Response Data:', err.response.data);
        alert(`Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Server error'}`);
      } else {
        alert('Error adding pagoda. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePagoda = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pagoda?')) {
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting pagoda ID:', id);
      const response = await api.delete(`/admin/pagoda/delete/${id}`);
      console.log('DELETE Response:', response.data);
      
      if (response.data && response.data.success) {
        alert('Pagoda deleted successfully!');
        await fetchPagodas();
      } else {
        alert(response.data?.message || 'Failed to delete pagoda.');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      if (err.response) {
        alert(`Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Server error'}`);
      } else {
        alert('Error deleting pagoda. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditPagoda = (id) => {
    const pagodaToEdit = pagodas.find(pagoda => pagoda.id === id);
    if (pagodaToEdit) {
      setSelectedPagodaForEdit(pagodaToEdit);
      setFormData({
        pagodaName: pagodaToEdit.name || '',
        location: pagodaToEdit.location || '',
        price: pagodaToEdit.fee ? pagodaToEdit.fee.toString() : '',
        discount: pagodaToEdit.discount || '',
        startDate: pagodaToEdit.bestTimeToVisit || '',
        endDate: pagodaToEdit.endDate || '',
        description: pagodaToEdit.descriptionMm || '',
        history: pagodaToEdit.historyMm || '',
        tags: pagodaToEdit.tags || '',
        facilities: pagodaToEdit.facilities || '',
        images: pagodaToEdit.images || []
      });
      setImages(pagodaToEdit.images || []);
      setImageFiles([]);
      setShowEditModal(true);
    }
  };

  // ✅ CORRECT: Using FormData for PUT
  const handleConfirmEdit = async () => {
    if (!selectedPagodaForEdit || !formData.pagodaName) {
      alert('Please fill in all required fields');
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      // Create FormData
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.pagodaName);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('fee', formData.price || '0');
      formDataToSend.append('visit_date', formData.startDate || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('history', formData.history || '');
      formDataToSend.append('discount', formData.discount || '');
      
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }

      imageFiles.forEach((file) => {
        formDataToSend.append('image', file);
      });

      console.log('Updating pagoda ID:', selectedPagodaForEdit.id);
      
      const response = await axios.put(`/api/admin/pagoda/update/${selectedPagodaForEdit.id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('PUT Response:', response.data);
      
      if (response.data && response.data.success) {
        alert('Pagoda updated successfully!');
        setShowEditModal(false);
        setSelectedPagodaForEdit(null);
        await fetchPagodas();
        setFormData({
          pagodaName: '',
          location: '',
          price: '',
          discount: '',
          startDate: '',
          endDate: '',
          description: '',
          history: '',
          tags: '',
          facilities: '',
          images: []
        });
        setImages([]);
        setImageFiles([]);
      } else {
        alert(response.data?.message || 'Failed to update pagoda.');
      }
    } catch (err) {
      console.error('Update Error:', err);
      if (err.response) {
        alert(`Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Server error'}`);
      } else {
        alert('Error updating pagoda. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPagodas = pagodas.filter(pagoda =>
    pagoda.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagoda.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagoda.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pagoda.tags && pagoda.tags.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const CardActions = ({ pagodaId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleEditPagoda(pagodaId);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleDeletePagoda(pagodaId);
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

  if (loading && pagodas.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Bagan Pagodas History Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading pagodas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Bagan Pagodas History Management" onThemeChange={handleThemeChange} />

      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by pagoda name, location or tags..."
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
              <label className="gallery-label">Pagoda Images Gallery</label>
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
                <label>Pagoda Name *</label>
                <input
                  type="text"
                  name="pagodaName"
                  placeholder="e.g., Shwezigon Pagoda"
                  value={formData.pagodaName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g., Nyaung U, Bagan"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="e.g., Buddhist, Temple"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Entry Fee (MMK)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g., 10000"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Visit Date / Best Time</label>
                  <input
                    type="text"
                    name="startDate"
                    placeholder="e.g., Jan to May"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="e.g., 5"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="2"
                  placeholder="Enter a brief description of the pagoda..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>History</label>
                <textarea
                  name="history"
                  rows="4"
                  placeholder="Enter the history of the pagoda..."
                  value={formData.history}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddPagoda} disabled={loading}>
                {loading ? 'Adding...' : 'Add Pagoda'}
              </button>
            </div>
          </div>
        </div>

        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredPagodas.length > 0 ? (
                filteredPagodas.map((pagoda) => (
                  <div key={pagoda.id} className="hotel-card-vertical">
                    <div className="hotel-card-image">
                      <div className="image-slider">
                        {pagoda.images && pagoda.images[0] && pagoda.images[0].startsWith('http') ? (
                          <img 
                            src={pagoda.images[0]} 
                            alt={pagoda.name} 
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div style="font-size:60px;display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white">
                                    🛕
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div style={{ 
                            fontSize: '60px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '100%', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                          }}>
                            🛕
                          </div>
                        )}
                      </div>
                      <CardActions pagodaId={pagoda.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name">{pagoda.name}</h3>
                      <p className="hotel-location">
                        <i className="bi bi-geo-alt-fill"></i> {pagoda.location}
                      </p>
                      {pagoda.tags && (
                        <div className="pagoda-tags">
                          <i className="bi bi-tag-fill"></i> {pagoda.tags}
                        </div>
                      )}
                      <p className="hotel-price">
                        {pagoda.price === 'Free' ? 'Free' : `Fee: ${pagoda.price}`}
                      </p>
                      {pagoda.bestTimeToVisit && (
                        <p className="best-time">
                          <i className="bi bi-calendar-check"></i> Visit: {pagoda.bestTimeToVisit}
                        </p>
                      )}
                      {pagoda.total_fee && pagoda.total_fee > 0 && pagoda.total_fee !== pagoda.fee && (
                        <p className="total-fee" style={{ color: '#28a745', fontSize: '13px', fontWeight: '500' }}>
                          <i className="bi bi-tag"></i> After Discount: {pagoda.total_fee} MMK
                        </p>
                      )}
                      <div className="hotel-rating">
                        {renderStars(pagoda.rating || 4.5)}
                        <span className="rating-count">({pagoda.reviews || '0'} reviews)</span>
                      </div>
                      {pagoda.descriptionMm && (
                        <p className="pagoda-description">
                          {pagoda.descriptionMm.length > 80 ? `${pagoda.descriptionMm.substring(0, 80)}...` : pagoda.descriptionMm}
                        </p>
                      )}
                      {pagoda.created_at && (
                        <p className="created-at" style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                          <i className="bi bi-clock"></i> Added: {pagoda.created_at}
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
                  <p>No pagodas found. Add your first pagoda!</p>
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
              <h2>Edit Pagoda Information</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Pagoda Name *</label>
                <input
                  type="text"
                  name="pagodaName"
                  value={formData.pagodaName}
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
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Entry Fee (MMK)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Visit Date / Best Time</label>
                  <input
                    type="text"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>History</label>
                <textarea
                  name="history"
                  rows="4"
                  value={formData.history}
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

export default HistoryOfPagodas;