// components/Destinations.jsx
import React, { useState, useEffect } from 'react';
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
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
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
    images: []
  });

  const [destinations, setDestinations] = useState([]);

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

  // Helper function for image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If image path starts with 'image/', use it directly with backend URL
    if (imagePath.startsWith('image/')) {
      return `http://130.94.21.185:8000/${imagePath}`;
    }
    // Otherwise, just prepend the backend URL
    return `http://130.94.21.185:8000/${imagePath}`;
  };

  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('=== API Request ===');
      console.log('Method:', config.method.toUpperCase());
      console.log('URL:', config.baseURL + config.url);
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

  const fetchDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/destination/list');
      console.log('GET Response:', response.data);
      
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
          bestTimeToVisit: item.best_time_to_visit || item.visit_date || '',
          activities: item.activities || '',
          discount: item.discount || '',
          created_at: item.created_at || ''
        }));
        
        setDestinations(formattedDestinations);
        console.log('Formatted Destinations:', formattedDestinations);
      } else {
        setDestinations([]);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to fetch destinations. Please try again.');
      setDestinations([]);
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
  const handleAddDestination = async () => {
    if (!formData.destinationName || !formData.price) {
      alert('Please fill in destination name and price.');
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
      formDataToSend.append('name', formData.destinationName);
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('price', formData.price.replace(/[^0-9]/g, '') || '0');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('best_time_to_visit', formData.bestTimeToVisit || '');
      formDataToSend.append('activities', formData.activities || '');
      formDataToSend.append('discount', formData.discount || '');
      formDataToSend.append('start_date', formData.startDate || '');
      formDataToSend.append('end_date', formData.endDate || '');

      // Add image files
      imageFiles.forEach((file) => {
        formDataToSend.append('image', file);
      });

      console.log('Creating destination with FormData');
      
      // Use axios with FormData
      const response = await axios.post('/api/admin/destination/create', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('POST Response:', response.data);
      
      if (response.data && response.data.success) {
        alert('Destination added successfully!');
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
          images: []
        });
        setImages([]);
        setImageFiles([]);
      } else {
        alert(response.data?.message || 'Failed to add destination.');
      }
    } catch (err) {
      console.error('Create Error:', err);
      if (err.response) {
        console.error('Error Response Data:', err.response.data);
        alert(`Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Server error'}`);
      } else {
        alert('Error adding destination. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDestination = async (id) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) {
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }

    setLoading(true);
    try {
      console.log('Deleting destination ID:', id);
      const response = await api.delete(`/admin/destination/delete/${id}`);
      console.log('DELETE Response:', response.data);
      
      if (response.data && response.data.success) {
        alert('Destination deleted successfully!');
        await fetchDestinations();
      } else {
        alert(response.data?.message || 'Failed to delete destination.');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      if (err.response) {
        alert(`Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Server error'}`);
      } else {
        alert('Error deleting destination. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditDestination = (id) => {
    const destinationToEdit = destinations.find(destination => destination.id === id);
    if (destinationToEdit) {
      setSelectedDestinationForEdit(destinationToEdit);
      setFormData({
        destinationName: destinationToEdit.name || '',
        location: destinationToEdit.location || '',
        price: destinationToEdit.price ? destinationToEdit.price.replace(/[^0-9]/g, '') : '',
        discount: destinationToEdit.discount || '',
        startDate: destinationToEdit.startDate || '',
        endDate: destinationToEdit.endDate || '',
        description: destinationToEdit.description || '',
        activities: destinationToEdit.activities || '',
        bestTimeToVisit: destinationToEdit.bestTimeToVisit || '',
        images: destinationToEdit.images || []
      });
      setImages(destinationToEdit.images || []);
      setImageFiles([]);
      setShowEditModal(true);
    }
  };

  // ✅ CORRECT: Using FormData for PUT
  const handleConfirmEdit = async () => {
    if (!selectedDestinationForEdit || !formData.destinationName) {
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

      console.log('Updating destination ID:', selectedDestinationForEdit.id);
      
      const response = await axios.put(`/api/admin/destination/update/${selectedDestinationForEdit.id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('PUT Response:', response.data);
      
      if (response.data && response.data.success) {
        alert('Destination updated successfully!');
        setShowEditModal(false);
        setSelectedDestinationForEdit(null);
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
          images: []
        });
        setImages([]);
        setImageFiles([]);
      } else {
        alert(response.data?.message || 'Failed to update destination.');
      }
    } catch (err) {
      console.error('Update Error:', err);
      if (err.response) {
        alert(`Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Server error'}`);
      } else {
        alert('Error updating destination. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter(destination =>
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
                            <div style={{ 
                              fontSize: '60px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              height: '100%', 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white'
                            }}>
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
                      <p className="hotel-price">Starting from <span>MMK {destination.price}</span></p>
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
                        <p className="destination-description" style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                          {destination.description.length > 80 ? `${destination.description.substring(0, 80)}...` : destination.description}
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
                <div style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '50px',
                  color: '#999'
                }}>
                  <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No destinations found. Add your first destination!</p>
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
              <h2>Edit Destination</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
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
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (MMK)</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Discount %</label>
                  <input
                    type="text"
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
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
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