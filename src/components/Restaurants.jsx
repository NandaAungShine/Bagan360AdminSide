import React, { useState, useEffect } from 'react';
import Header from './Header';

function Restaurants() {
  // Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedRestaurantForEdit, setSelectedRestaurantForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  // API States
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisine: '',
    discount: '',
    description: '',
    openingHours: '',
    location: '',
    phone: '',
    images: []
  });

  // ✅ Proxy သုံးထားတဲ့အတွက် Relative Path
  const API_BASE = '/api/admin/restaurant';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  // ========== FETCH ==========
  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/list`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      console.log('✅ API Response:', result);

      let list = [];
      if (result.success && Array.isArray(result.data)) {
        list = result.data.map(item => ({
          ...item,
          images: item.images ? item.images.map(img => `http://130.94.21.185:8000/${img}`) : [],
          image: item.image ? `http://130.94.21.185:8000/${item.image}` : null,
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
      alert('❌ Failed to fetch restaurants: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
        setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // ========== ADD ==========
  const handleAddRestaurant = async () => {
    if (!formData.restaurantName || !formData.location) {
      alert('⚠️ Please fill in Restaurant Name and Location.');
      return;
    }
    setLoading(true);
    setError(null);
    
    const payload = {
      name: formData.restaurantName.trim(),
      cuisine: formData.cuisine.trim() || 'Various',
      price_range: '0',
      discount: formData.discount.replace(/[^0-9]/g, '') || '0',
      description: formData.description.trim() || '',
      opening_hours: formData.openingHours.trim() || '',
      location: formData.location.trim() || '',
      phone: formData.phone.trim() || '',
      images: formData.images.length ? formData.images : ['🍽️']
    };
    
    try {
      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Create failed');
      await fetchRestaurants();
      setFormData({
        restaurantName: '',
        cuisine: '',
        discount: '',
        description: '',
        openingHours: '',
        location: '',
        phone: '',
        images: []
      });
      setImages([]);
      alert('✅ Restaurant added successfully!');
    } catch (err) {
      setError(err.message);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== DELETE (from top bar) ==========
  const handleDeleteSelected = async () => {
    if (!selectedRestaurantId || selectedRestaurantId === 'all') {
      alert('⚠️ Please select a single restaurant.');
      return;
    }
    if (!window.confirm('🗑️ Delete this restaurant?')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/delete/${selectedRestaurantId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Delete failed');
      await fetchRestaurants();
      setSelectedRestaurantId(null);
      alert('🗑️ Restaurant deleted successfully!');
    } catch (err) {
      setError(err.message);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== DELETE (from card) ==========
  const handleDeleteFromCard = async (id) => {
    if (!window.confirm('🗑️ Delete this restaurant?')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Delete failed');
      await fetchRestaurants();
      alert('🗑️ Restaurant deleted successfully!');
    } catch (err) {
      setError(err.message);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== EDIT (open modal) ==========
  const openEditModal = (restaurant) => {
    setSelectedRestaurantForEdit(restaurant);
    setFormData({
      restaurantName: restaurant.name || '',
      cuisine: restaurant.cuisine || '',
      discount: restaurant.discount || '',
      description: restaurant.description || '',
      openingHours: restaurant.opening_hours || '',
      location: restaurant.location || '',
      phone: restaurant.phone || '',
      images: restaurant.images || []
    });
    setImages(restaurant.images || []);
    setShowEditModal(true);
  };

  const handleEditSelected = () => {
    if (!selectedRestaurantId || selectedRestaurantId === 'all') {
      alert('⚠️ Please select a single restaurant.');
      return;
    }
    const restaurant = restaurants.find(r => r.id === selectedRestaurantId);
    if (restaurant) openEditModal(restaurant);
  };

  const handleEditFromCard = (id) => {
    const restaurant = restaurants.find(r => r.id === id);
    if (restaurant) {
      openEditModal(restaurant);
    }
  };

  // ========== CONFIRM EDIT ==========
  const handleConfirmEdit = async () => {
    if (!selectedRestaurantForEdit) return;
    if (!formData.restaurantName) {
      alert('⚠️ Name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    
    const payload = {
      name: formData.restaurantName.trim(),
      cuisine: formData.cuisine.trim() || selectedRestaurantForEdit.cuisine,
      price_range: '0',
      discount: formData.discount.replace(/[^0-9]/g, '') || '0',
      description: formData.description.trim() || '',
      opening_hours: formData.openingHours.trim() || '',
      location: formData.location.trim() || '',
      phone: formData.phone.trim() || '',
      images: formData.images.length ? formData.images : selectedRestaurantForEdit.images
    };
    
    try {
      const response = await fetch(`${API_BASE}/update/${selectedRestaurantForEdit.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Update failed');
      await fetchRestaurants();
      setShowEditModal(false);
      setSelectedRestaurantId(null);
      setSelectedRestaurantForEdit(null);
      setFormData({
        restaurantName: '',
        cuisine: '',
        discount: '',
        description: '',
        openingHours: '',
        location: '',
        phone: '',
        images: []
      });
      setImages([]);
      alert('✅ Restaurant updated successfully!');
    } catch (err) {
      setError(err.message);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== SELECT ALL ==========
  const handleSelectAll = () => {
    setSelectedRestaurantId(prev => prev === 'all' ? null : 'all');
    setShowAllDropdown(false);
  };

  const toggleRestaurantSelection = (id) => {
    setSelectedRestaurantId(prev => prev === id ? null : id);
  };

  // ========== FILTER ==========
  const filteredRestaurants = restaurants.filter(r =>
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.cuisine || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(searchTerm.toLowerCase())
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

      {loading && <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px', textAlign: 'center' }}>⏳ Loading...</div>}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '5px' }}>
          ❌ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Search and Bulk Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search restaurant..."
            className="search-input-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
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
              <label className="gallery-label">Images Gallery</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload-gallery" />
                  <label htmlFor="image-upload-gallery" className="upload-box">
                    <i className="bi bi-plus-lg"></i> <span>Add Image</span>
                  </label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {images.map((img, idx) => (
                    <div key={idx} className="image-item">
                      <img src={img} alt="preview" />
                      <button className="remove-image-btn" onClick={() => removeImage(idx)}><i className="bi bi-x-lg"></i></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Restaurant Name *</label>
                <input type="text" name="restaurantName" placeholder="eg. Bagan Golden" value={formData.restaurantName} onChange={handleInputChange} />
              </div>
              <div className="add-form-group">
                <label>Cuisine Type</label>
                <input type="text" name="cuisine" placeholder="eg. Burmese, Shan" value={formData.cuisine} onChange={handleInputChange} />
              </div>
              <div className="add-form-group">
                <label>Discount % (Optional)</label>
                <input type="text" name="discount" placeholder="10 (optional)" value={formData.discount} onChange={handleInputChange} />
              </div>
              <div className="add-form-group">
                <label>Location *</label>
                <input type="text" name="location" placeholder="Old Bagan" value={formData.location} onChange={handleInputChange} />
              </div>
              <div className="add-form-group">
                <label>Opening Hours</label>
                <input type="text" name="openingHours" placeholder="9:00 AM - 9:00 PM" value={formData.openingHours} onChange={handleInputChange} />
              </div>
              <div className="add-form-group">
                <label>Phone</label>
                <input type="text" name="phone" placeholder="09-123456789" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="add-form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Describe..." value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              <button className="add-item-btn-full" onClick={handleAddRestaurant} disabled={loading}>
                {loading ? 'Adding...' : 'Add Restaurant'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            {!loading && restaurants.length === 0 && !error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <i className="bi bi-emoji-frown" style={{ fontSize: '40px' }}></i>
                <p>No restaurants found.</p>
              </div>
            ) : (
              <div className="hotels-grid-2cols">
                {filteredRestaurants.map(r => {
                  const imageUrl = r.images && r.images.length > 0 
                    ? r.images[0] 
                    : (r.image || 'https://via.placeholder.com/300x200?text=No+Image');
                  return (
                    <div
                      key={r.id}
                      className={`hotel-card-vertical ${selectedRestaurantId === r.id ? 'selected' : ''}`}
                      onClick={() => toggleRestaurantSelection(r.id)}
                    >
                      <div className="hotel-card-image">
                        <div className="image-slider">
                          <img
                            src={imageUrl}
                            alt={r.name}
                            onError={e => e.target.src = 'https://via.placeholder.com/300x200?text=Error'}
                          />
                        </div>
                        <div className="selection-check">
                          {selectedRestaurantId === r.id && <i className="bi bi-check-circle-fill"></i>}
                        </div>
                        <CardActions restaurantId={r.id} />
                      </div>
                      <div className="hotel-card-info">
                        <h3 className="hotel-name">{r.name}</h3>
                        <p className="hotel-location"><i className="bi bi-geo-alt-fill"></i> {r.location || 'N/A'}</p>
                        <div className="cuisine-type"><i className="bi bi-egg-fried"></i> {r.cuisine || 'Various'}</div>
                        <div className="hotel-rating">
                          {renderStars(r.rating || 4.0)}
                          <span className="rating-count">({r.reviews || '0'})</span>
                        </div>
                        {r.opening_hours && (
                          <p className="opening-hours"><i className="bi bi-clock"></i> {r.opening_hours}</p>
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
              <h2>Edit Restaurant</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Restaurant Name *</label>
                <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Cuisine</label>
                <input type="text" name="cuisine" value={formData.cuisine} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Discount % (Optional)</label>
                <input type="text" name="discount" value={formData.discount} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Opening Hours</label>
                <input type="text" name="openingHours" value={formData.openingHours} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
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

export default Restaurants;