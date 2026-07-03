import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';

function Hotels() {
  // ===== API Base URL =====
  const API_BASE = '/api/admin/hotel';
  
  // 🔥 Backend Base URL (Image အတွက်)
  const BACKEND_URL = 'http://130.94.21.185:8000';

  // ===== Theme =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== UI States =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [selectedHotelForEdit, setSelectedHotelForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== Data States =====
  const [hotels, setHotels] = useState([]);

  // ===== Image Preview (Single) =====
  const [imagePreview, setImagePreview] = useState(null);

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
    imageFile: null
  });

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

  // ===== Fetch Hotels (Image URL ပြန်တည်ဆောက်မယ်) =====
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/list`);
      let hotelData = response.data.data || response.data.hotels || response.data || [];
      
      // 🔥 Image URL ကို ပြန်တည်ဆောက်မယ်
      hotelData = hotelData.map((hotel) => {
        let imageUrl = '/default-hotel.jpg';
        
        if (hotel.image) {
          // Case 1: Full URL ဖြစ်ရင်
          if (hotel.image.startsWith('http://') || hotel.image.startsWith('https://')) {
            imageUrl = hotel.image;
          }
          // Case 2: Relative path (/uploads/...) ဖြစ်ရင်
          else if (hotel.image.startsWith('/')) {
            imageUrl = `${BACKEND_URL}${hotel.image}`;
          }
          // Case 3: Filename only ဖြစ်ရင်
          else if (typeof hotel.image === 'string' && hotel.image.length > 0 && !/^\d+$/.test(hotel.image)) {
            imageUrl = `${BACKEND_URL}/uploads/${hotel.image}`;
          }
          // Case 4: Number (ID) ဖြစ်ရင် မပြဘူး
          else {
            imageUrl = '/default-hotel.jpg';
          }
        }
        
        return {
          ...hotel,
          image: imageUrl // 🔥 ပြင်ဆင်ပြီးသား URL ကို ပြန်သိမ်းမယ်
        };
      });
      
      console.log('📸 Hotels with images:', hotelData); // 👈 စစ်ကြည့်ဖို့
      setHotels(hotelData);
    } catch (error) {
      console.error('Fetch error:', error);
      alert(`Failed to load hotels: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    setFormData((prev) => ({
      ...prev,
      imageFile: file
    }));
  };

  // ===== Remove Image =====
  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      imageFile: null
    }));
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
      imageFile: null
    });
    setImagePreview(null);
  };

  // ===== ADD HOTEL =====
  const handleAddHotel = async () => {
    console.log("Add button clicked");

    if (!formData.name || !formData.type || !formData.location || !formData.price || 
        !formData.start_date || !formData.end_date || !formData.description || 
        !formData.facilities) {
      alert('All fields (except image) are required!');
      return;
    }

    if (!formData.imageFile) {
      alert('Please upload an image.');
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();

      form.append('name', formData.name);
      form.append('type', formData.type);
      form.append('location', formData.location);
      form.append('price', formData.price);
      form.append('discount', formData.discount || '0');
      
      const totalAmount = parseFloat(formData.price) - parseFloat(formData.discount || 0);
      form.append('total_amount', totalAmount);

      form.append('start_date', formData.start_date);
      form.append('end_date', formData.end_date);
      form.append('description', formData.description);
      form.append('facilities', formData.facilities);

      if (formData.imageFile) {
        form.append('image', formData.imageFile);
      }

      await axios.post(`${API_BASE}/create`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Hotel added successfully!');
      resetForm();
      fetchHotels();
    } catch (error) {
      console.error('Add error:', error);
      alert(`Failed to add hotel: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE HOTEL =====
  const handleDeleteSelected = async () => {
    if (!selectedHotelId || selectedHotelId === 'all') {
      alert('Please select a specific hotel to delete.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/delete/${selectedHotelId}`);
      alert('Hotel deleted successfully!');
      setSelectedHotelId(null);
      fetchHotels();
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== EDIT (Open Modal) =====
  const handleEditSelected = () => {
    if (!selectedHotelId || selectedHotelId === 'all') {
      alert('Please select a specific hotel to edit.');
      return;
    }
    const hotelToEdit = hotels.find((h) => h.id === selectedHotelId);
    if (!hotelToEdit) {
      alert('Hotel not found.');
      return;
    }

    setSelectedHotelForEdit(hotelToEdit);

    if (hotelToEdit.image) {
      setImagePreview(hotelToEdit.image);
    } else {
      setImagePreview(null);
    }

    setFormData({
      name: hotelToEdit.name || '',
      type: hotelToEdit.type || '',
      location: hotelToEdit.location || '',
      price: hotelToEdit.price || '',
      discount: hotelToEdit.discount || '',
      start_date: hotelToEdit.start_date || '',
      end_date: hotelToEdit.end_date || '',
      description: hotelToEdit.description || '',
      facilities: hotelToEdit.facilities || '',
      imageFile: null
    });

    setShowEditModal(true);
  };

  // ===== CONFIRM EDIT =====
  const handleConfirmEdit = async () => {
    if (!formData.name || !formData.type || !formData.location || !formData.price || 
        !formData.description || !formData.facilities) {
      alert('Please fill all required fields (image is optional).');
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();

      form.append('name', formData.name);
      form.append('type', formData.type);
      form.append('location', formData.location);
      form.append('price', formData.price);
      form.append('discount', formData.discount || '0');
      
      const totalAmount = parseFloat(formData.price) - parseFloat(formData.discount || 0);
      form.append('total_amount', totalAmount);

      form.append('start_date', formData.start_date);
      form.append('end_date', formData.end_date);
      form.append('description', formData.description);
      form.append('facilities', formData.facilities);

      if (formData.imageFile) {
        form.append('image', formData.imageFile);
      }

      await axios.put(`${API_BASE}/update/${selectedHotelForEdit.id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Hotel updated successfully!');
      setShowEditModal(false);
      setSelectedHotelId(null);
      setSelectedHotelForEdit(null);
      resetForm();
      fetchHotels();
    } catch (error) {
      console.error('Update error:', error);
      alert(`Failed to update: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ===== SELECT ALL =====
  const handleSelectAll = () => {
    if (selectedHotelId === 'all') {
      setSelectedHotelId(null);
    } else {
      setSelectedHotelId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleHotelSelection = (id) => {
    if (selectedHotelId === id) {
      setSelectedHotelId(null);
    } else {
      setSelectedHotelId(id);
    }
  };

  // ===== FILTER & RENDER STARS =====
  const filteredHotels = hotels.filter((hotel) =>
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

  // ===== RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Hotels Management" onThemeChange={handleThemeChange} />

      {loading && <div className="loading-overlay">Processing...</div>}

      {/* Search & Actions */}
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
              <button onClick={() => { setSelectedHotelId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Two Columns */}
      <div className="hotels-two-columns">
        {/* Left: Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery */}
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

            {/* Form Fields */}
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
                <label>Facilities *</label>
                <textarea
                  name="facilities"
                  rows="2"
                  placeholder="WiFi, Parking, Pool, Restaurant..."
                  value={formData.facilities}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddHotel} disabled={loading}>
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Hotel Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredHotels.map((hotel) => (
                <div 
                  key={hotel.id} 
                  className={`hotel-card-vertical ${selectedHotelId === hotel.id ? 'selected' : ''}`}
                  onClick={() => toggleHotelSelection(hotel.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img 
                        src={hotel.image || '/default-hotel.jpg'} 
                        alt={hotel.name} 
                        onError={(e) => {
                          e.target.src = '/default-hotel.jpg'; // 🔥 ပုံမပေါ်ရင် default ပြမယ်
                        }}
                      />
                    </div>
                    <div className="selection-check">
                      {selectedHotelId === hotel.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
                <label>Facilities *</label>
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