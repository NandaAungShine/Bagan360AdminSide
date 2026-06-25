import React, { useState, useEffect } from 'react';
import Header from './Header';

function Tricycles() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTricycleId, setSelectedTricycleId] = useState(null);
  const [selectedTricycleForEdit, setSelectedTricycleForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    tricycleName: '',
    type: '',
    capacity: '',
    pricePerHour: '',
    pricePerDay: '',
    discount: '',
    description: '',
    features: '',
    location: '',
    contactNumber: '',
    images: []
  });

  const [tricycles, setTricycles] = useState([
    {
      id: 1,
      name: 'Bagan Traditional Trishaw',
      type: 'Traditional',
      capacity: '2 passengers',
      pricePerHour: '15,000',
      pricePerDay: '80,000',
      rating: 4.7,
      reviews: '342',
      images: ['🚲', '🚲', '🚲'],
      description: 'Classic Burmese trishaw perfect for exploring ancient temples at a relaxed pace',
      features: 'Comfortable seating, canopy roof, local guide driver',
      location: 'Old Bagan',
      contactNumber: '09-123456789'
    },
    {
      id: 2,
      name: 'Electric Tuk Tuk',
      type: 'Electric',
      capacity: '4 passengers',
      pricePerHour: '25,000',
      pricePerDay: '120,000',
      rating: 4.9,
      reviews: '567',
      images: ['🛺', '🛺', '🛺'],
      description: 'Eco-friendly electric tricycle with comfortable seating and silent operation',
      features: 'USB charging ports, Bluetooth speaker, rain cover',
      location: 'New Bagan',
      contactNumber: '09-987654321'
    },
    {
      id: 3,
      name: 'Tourist Trishaw',
      type: 'Modern',
      capacity: '3 passengers',
      pricePerHour: '20,000',
      pricePerDay: '100,000',
      rating: 4.6,
      reviews: '423',
      images: ['🚲', '🚲', '🚲'],
      description: 'Modern trishaw with enhanced comfort and safety features',
      features: 'Padded seats, seat belts, storage basket',
      location: 'Nyaung U',
      contactNumber: '09-456789123'
    },
    {
      id: 4,
      name: 'Family Tricycle',
      type: 'Family',
      capacity: '5 passengers (2 adults, 3 children)',
      pricePerHour: '30,000',
      pricePerDay: '150,000',
      rating: 4.8,
      reviews: '289',
      images: ['🛺', '🛺', '🛺'],
      description: 'Spacious tricycle designed for families with children',
      features: 'Child seats, sunshade, drink holders, toy bag',
      location: 'Old Bagan',
      contactNumber: '09-234567890'
    },
    {
      id: 5,
      name: 'Sunset Tour Trishaw',
      type: 'Tourist',
      capacity: '2 passengers',
      pricePerHour: '18,000',
      pricePerDay: '90,000',
      rating: 4.7,
      reviews: '634',
      images: ['🚲', '🚲', '🚲'],
      description: 'Specialized for sunset tours with best viewing spots',
      features: 'Blankets, binoculars, sunset guide map',
      location: 'Bagan',
      contactNumber: '09-345678901'
    },
    {
      id: 6,
      name: 'Luxury Pedicab',
      type: 'Luxury',
      capacity: '2 passengers',
      pricePerHour: '40,000',
      pricePerDay: '200,000',
      rating: 4.9,
      reviews: '178',
      images: ['🛺', '🛺', '🛺'],
      description: 'Premium tricycle with luxury amenities and professional driver',
      features: 'Leather seats, mini-fridge, WiFi, tour guide service',
      location: 'New Bagan',
      contactNumber: '09-567890123'
    }
  ]);

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
    setImages(newImages);
    setFormData({ ...formData, images: newImages });
  };

  const handleAddTricycle = () => {
    if (formData.tricycleName && formData.pricePerHour) {
      const newTricycle = {
        id: tricycles.length + 1,
        name: formData.tricycleName,
        type: formData.type || 'Standard',
        capacity: formData.capacity || '2 passengers',
        pricePerHour: formData.pricePerHour.replace(/[^0-9]/g, ''),
        pricePerDay: formData.pricePerDay ? formData.pricePerDay.replace(/[^0-9]/g, '') : '',
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🚲'],
        description: formData.description,
        features: formData.features,
        location: formData.location,
        contactNumber: formData.contactNumber
      };
      setTricycles([newTricycle, ...tricycles]);
      setFormData({
        tricycleName: '',
        type: '',
        capacity: '',
        pricePerHour: '',
        pricePerDay: '',
        discount: '',
        description: '',
        features: '',
        location: '',
        contactNumber: '',
        images: []
      });
      setImages([]);
      alert('Tricycle added successfully!');
    } else {
      alert('Please fill in tricycle name and price per hour');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedTricycleId) {
      alert('Please select a tricycle to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this tricycle?')) {
      setTricycles(tricycles.filter(tricycle => tricycle.id !== selectedTricycleId));
      setSelectedTricycleId(null);
      alert('Tricycle deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedTricycleId) {
      alert('Please select a tricycle to edit');
      return;
    }
    const tricycleToEdit = tricycles.find(tricycle => tricycle.id === selectedTricycleId);
    if (tricycleToEdit) {
      setSelectedTricycleForEdit(tricycleToEdit);
      setFormData({
        tricycleName: tricycleToEdit.name,
        type: tricycleToEdit.type || '',
        capacity: tricycleToEdit.capacity || '',
        pricePerHour: tricycleToEdit.pricePerHour,
        pricePerDay: tricycleToEdit.pricePerDay || '',
        discount: '',
        description: tricycleToEdit.description || '',
        features: tricycleToEdit.features || '',
        location: tricycleToEdit.location || '',
        contactNumber: tricycleToEdit.contactNumber || '',
        images: tricycleToEdit.images || []
      });
      setImages(tricycleToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedTricycleForEdit && formData.tricycleName) {
      const updatedTricycles = tricycles.map(tricycle =>
        tricycle.id === selectedTricycleForEdit.id
          ? {
              ...tricycle,
              name: formData.tricycleName,
              type: formData.type || tricycle.type,
              capacity: formData.capacity || tricycle.capacity,
              pricePerHour: formData.pricePerHour.replace(/[^0-9]/g, ''),
              pricePerDay: formData.pricePerDay ? formData.pricePerDay.replace(/[^0-9]/g, '') : tricycle.pricePerDay,
              description: formData.description,
              features: formData.features,
              location: formData.location,
              contactNumber: formData.contactNumber,
              images: formData.images.length > 0 ? formData.images : tricycle.images
            }
          : tricycle
      );
      setTricycles(updatedTricycles);
      setShowEditModal(false);
      setSelectedTricycleId(null);
      setSelectedTricycleForEdit(null);
      setFormData({
        tricycleName: '',
        type: '',
        capacity: '',
        pricePerHour: '',
        pricePerDay: '',
        discount: '',
        description: '',
        features: '',
        location: '',
        contactNumber: '',
        images: []
      });
      setImages([]);
      alert('Tricycle updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedTricycleId === 'all') {
      setSelectedTricycleId(null);
    } else {
      setSelectedTricycleId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleTricycleSelection = (id) => {
    if (selectedTricycleId === id) {
      setSelectedTricycleId(null);
    } else {
      setSelectedTricycleId(id);
    }
  };

  const filteredTricycles = tricycles.filter(tricycle =>
    tricycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tricycle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tricycle.location.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Tricycles Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search tricycle..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className="action-btn delete-btn" onClick={handleDeleteSelected}>
          <i className="bi bi-trash"></i> Delete
        </button>
        
        <button className="action-btn edit-btn-action" onClick={handleEditSelected}>
          <i className="bi bi-pencil-square"></i> Edit
        </button>
        
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}>
            <i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i>
          </button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => { setSelectedTricycleId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedTricycleId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Tricycle Cards (Right) */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form with Image Gallery on Top */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery Section - ON TOP */}
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

            {/* Form Fields - BELOW Image Gallery */}
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Tricycle Name</label>
                <input
                  type="text"
                  name="tricycleName"
                  placeholder="eg. Bagan Traditional Trishaw"
                  value={formData.tricycleName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
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
                  <input
                    type="text"
                    name="capacity"
                    placeholder="eg. 2 passengers"
                    value={formData.capacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price Per Hour (MMK)</label>
                  <input
                    type="text"
                    name="pricePerHour"
                    placeholder="eg. 15000"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Price Per Day (MMK)</label>
                  <input
                    type="text"
                    name="pricePerDay"
                    placeholder="eg. 80000"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-group">
                <label>Discount %</label>
                <input
                  type="text"
                  name="discount"
                  placeholder="eg. 10"
                  value={formData.discount}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="eg. Old Bagan, New Bagan"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  placeholder="eg. 09-123456789"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Features</label>
                <textarea
                  name="features"
                  rows="2"
                  placeholder="Comfortable seating, canopy roof, local guide driver..."
                  value={formData.features}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the tricycle experience and what makes it special..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddTricycle}>
                Add Tricycle
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Tricycle Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredTricycles.map((tricycle) => (
                <div 
                  key={tricycle.id} 
                  className={`hotel-card-vertical ${selectedTricycleId === tricycle.id ? 'selected' : ''}`}
                  onClick={() => toggleTricycleSelection(tricycle.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img src={tricycle.images[0]} alt={tricycle.name} />
                    </div>
                    <div className="selection-check">
                      {selectedTricycleId === tricycle.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{tricycle.name}</h3>
                    <div className="tricycle-type">
                      <span className="type-badge">{tricycle.type}</span>
                    </div>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {tricycle.location}
                    </p>
                    <div className="tricycle-details">
                      <span><i className="bi bi-people"></i> {tricycle.capacity}</span>
                    </div>
                    <div className="tricycle-pricing">
                      <span className="price-hour">Hour: MMK {tricycle.pricePerHour}</span>
                      {tricycle.pricePerDay && (
                        <span className="price-day">Day: MMK {tricycle.pricePerDay}</span>
                      )}
                    </div>
                    {tricycle.features && (
                      <p className="features">
                        <i className="bi bi-star"></i> {tricycle.features.substring(0, 60)}...
                      </p>
                    )}
                    <div className="hotel-rating">
                      {renderStars(tricycle.rating)}
                      <span className="rating-count">({tricycle.reviews})</span>
                    </div>
                    {tricycle.contactNumber && (
                      <p className="contact-info">
                        <i className="bi bi-telephone"></i> {tricycle.contactNumber}
                      </p>
                    )}
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
              <h2>Edit Tricycle</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tricycle Name</label>
                <input
                  type="text"
                  name="tricycleName"
                  value={formData.tricycleName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
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
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Hour (MMK)</label>
                  <input
                    type="text"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Price Per Day (MMK)</label>
                  <input
                    type="text"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                  />
                </div>
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
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Features</label>
                <textarea
                  name="features"
                  rows="2"
                  value={formData.features}
                  onChange={handleInputChange}
                ></textarea>
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
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="add-item-btn" onClick={handleConfirmEdit}>
                Confirm Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tricycles;