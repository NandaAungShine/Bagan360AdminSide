import React, { useState, useEffect } from 'react';
import Header from './Header';

function EBikes() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEBikeId, setSelectedEBikeId] = useState(null);
  const [selectedEBikeForEdit, setSelectedEBikeForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    ebikeName: '',
    brand: '',
    model: '',
    batteryCapacity: '',
    range: '',
    pricePerDay: '',
    discount: '',
    description: '',
    maxSpeed: '',
    weight: '',
    color: '',
    location: '',
    images: []
  });

  const [eBikes, setEBikes] = useState([
    {
      id: 1,
      name: 'Yadea C1S',
      brand: 'Yadea',
      model: 'C1S',
      batteryCapacity: '48V 20Ah',
      range: '60-70 km',
      pricePerDay: '15,000',
      rating: 4.8,
      reviews: '342',
      images: ['🛵', '🛵', '🛵'],
      description: 'Powerful electric scooter with long battery life, perfect for city tours',
      maxSpeed: '45 km/h',
      weight: '65 kg',
      color: 'Red',
      location: 'Old Bagan'
    },
    {
      id: 2,
      name: 'Gogoro 2 Plus',
      brand: 'Gogoro',
      model: '2 Plus',
      batteryCapacity: '30Ah',
      range: '85-100 km',
      pricePerDay: '20,000',
      rating: 4.9,
      reviews: '456',
      images: ['🛵', '🛵', '🛵'],
      description: 'Smart electric scooter with swappable batteries and app connectivity',
      maxSpeed: '88 km/h',
      weight: '103 kg',
      color: 'White',
      location: 'New Bagan'
    },
    {
      id: 3,
      name: 'Niu NQi Sport',
      brand: 'Niu',
      model: 'NQi Sport',
      batteryCapacity: '48V 26Ah',
      range: '65-80 km',
      pricePerDay: '18,000',
      rating: 4.7,
      reviews: '289',
      images: ['🛵', '🛵', '🛵'],
      description: 'Stylish and eco-friendly electric scooter with LED lighting',
      maxSpeed: '45 km/h',
      weight: '72 kg',
      color: 'Black',
      location: 'Mandalay'
    },
    {
      id: 4,
      name: 'Yadea G5',
      brand: 'Yadea',
      model: 'G5',
      batteryCapacity: '72V 20Ah',
      range: '80-100 km',
      pricePerDay: '25,000',
      rating: 4.9,
      reviews: '567',
      images: ['🛵', '🛵', '🛵'],
      description: 'High-performance electric scooter with dual disc brakes',
      maxSpeed: '70 km/h',
      weight: '85 kg',
      color: 'Blue',
      location: 'Inle Lake'
    },
    {
      id: 5,
      name: 'E-Flo E2S',
      brand: 'E-Flo',
      model: 'E2S',
      batteryCapacity: '48V 15Ah',
      range: '45-55 km',
      pricePerDay: '12,000',
      rating: 4.5,
      reviews: '178',
      images: ['🛵', '🛵', '🛵'],
      description: 'Compact and lightweight e-bike ideal for short trips',
      maxSpeed: '40 km/h',
      weight: '48 kg',
      color: 'Yellow',
      location: 'Yangon'
    },
    {
      id: 6,
      name: 'Vespa Elettrica',
      brand: 'Vespa',
      model: 'Elettrica',
      batteryCapacity: '4.2 kWh',
      range: '100 km',
      pricePerDay: '35,000',
      rating: 4.9,
      reviews: '234',
      images: ['🛵', '🛵', '🛵'],
      description: 'Luxury Italian electric scooter with premium design',
      maxSpeed: '70 km/h',
      weight: '110 kg',
      color: 'Green',
      location: 'Bagan'
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

  const handleAddEBike = () => {
    if (formData.ebikeName && formData.pricePerDay) {
      const newEBike = {
        id: eBikes.length + 1,
        name: formData.ebikeName,
        brand: formData.brand || 'Various',
        model: formData.model || 'Standard',
        batteryCapacity: formData.batteryCapacity || 'N/A',
        range: formData.range || 'N/A',
        pricePerDay: formData.pricePerDay.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🛵'],
        description: formData.description,
        maxSpeed: formData.maxSpeed,
        weight: formData.weight,
        color: formData.color,
        location: formData.location
      };
      setEBikes([newEBike, ...eBikes]);
      setFormData({
        ebikeName: '',
        brand: '',
        model: '',
        batteryCapacity: '',
        range: '',
        pricePerDay: '',
        discount: '',
        description: '',
        maxSpeed: '',
        weight: '',
        color: '',
        location: '',
        images: []
      });
      setImages([]);
      alert('E-Bike added successfully!');
    } else {
      alert('Please fill in e-bike name and price per day');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedEBikeId) {
      alert('Please select an e-bike to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this e-bike?')) {
      setEBikes(eBikes.filter(ebike => ebike.id !== selectedEBikeId));
      setSelectedEBikeId(null);
      alert('E-Bike deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedEBikeId) {
      alert('Please select an e-bike to edit');
      return;
    }
    const ebikeToEdit = eBikes.find(ebike => ebike.id === selectedEBikeId);
    if (ebikeToEdit) {
      setSelectedEBikeForEdit(ebikeToEdit);
      setFormData({
        ebikeName: ebikeToEdit.name,
        brand: ebikeToEdit.brand || '',
        model: ebikeToEdit.model || '',
        batteryCapacity: ebikeToEdit.batteryCapacity || '',
        range: ebikeToEdit.range || '',
        pricePerDay: ebikeToEdit.pricePerDay,
        discount: '',
        description: ebikeToEdit.description || '',
        maxSpeed: ebikeToEdit.maxSpeed || '',
        weight: ebikeToEdit.weight || '',
        color: ebikeToEdit.color || '',
        location: ebikeToEdit.location || '',
        images: ebikeToEdit.images || []
      });
      setImages(ebikeToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedEBikeForEdit && formData.ebikeName) {
      const updatedEBikes = eBikes.map(ebike =>
        ebike.id === selectedEBikeForEdit.id
          ? {
              ...ebike,
              name: formData.ebikeName,
              brand: formData.brand || ebike.brand,
              model: formData.model || ebike.model,
              batteryCapacity: formData.batteryCapacity || ebike.batteryCapacity,
              range: formData.range || ebike.range,
              pricePerDay: formData.pricePerDay.replace(/[^0-9]/g, ''),
              description: formData.description,
              maxSpeed: formData.maxSpeed,
              weight: formData.weight,
              color: formData.color,
              location: formData.location,
              images: formData.images.length > 0 ? formData.images : ebike.images
            }
          : ebike
      );
      setEBikes(updatedEBikes);
      setShowEditModal(false);
      setSelectedEBikeId(null);
      setSelectedEBikeForEdit(null);
      setFormData({
        ebikeName: '',
        brand: '',
        model: '',
        batteryCapacity: '',
        range: '',
        pricePerDay: '',
        discount: '',
        description: '',
        maxSpeed: '',
        weight: '',
        color: '',
        location: '',
        images: []
      });
      setImages([]);
      alert('E-Bike updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedEBikeId === 'all') {
      setSelectedEBikeId(null);
    } else {
      setSelectedEBikeId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleEBikeSelection = (id) => {
    if (selectedEBikeId === id) {
      setSelectedEBikeId(null);
    } else {
      setSelectedEBikeId(id);
    }
  };

  const filteredEBikes = eBikes.filter(ebike =>
    ebike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebike.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebike.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebike.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Header title="E-Bikes Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search e-bike..."
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
              <button onClick={() => { setSelectedEBikeId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedEBikeId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + E-Bike Cards (Right) */}
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
                <label>E-Bike Name</label>
                <input
                  type="text"
                  name="ebikeName"
                  placeholder="eg. Yadea C1S"
                  value={formData.ebikeName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="eg. Yadea, Gogoro, Niu"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    placeholder="eg. C1S, 2 Plus, NQi"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Battery Capacity</label>
                  <input
                    type="text"
                    name="batteryCapacity"
                    placeholder="eg. 48V 20Ah"
                    value={formData.batteryCapacity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Range (per charge)</label>
                  <input
                    type="text"
                    name="range"
                    placeholder="eg. 60-70 km"
                    value={formData.range}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price Per Day (MMK)</label>
                  <input
                    type="text"
                    name="pricePerDay"
                    placeholder="eg. 15000"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Discount %</label>
                  <input
                    type="text"
                    name="discount"
                    placeholder="eg. 10"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Max Speed</label>
                  <input
                    type="text"
                    name="maxSpeed"
                    placeholder="eg. 45 km/h"
                    value={formData.maxSpeed}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Weight</label>
                  <input
                    type="text"
                    name="weight"
                    placeholder="eg. 65 kg"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    placeholder="eg. Red, Black, White"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="eg. Old Bagan, New Bagan"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the e-bike features, condition, included accessories..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddEBike}>
                Add E-Bike
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - E-Bike Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredEBikes.map((ebike) => (
                <div 
                  key={ebike.id} 
                  className={`hotel-card-vertical ${selectedEBikeId === ebike.id ? 'selected' : ''}`}
                  onClick={() => toggleEBikeSelection(ebike.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img src={ebike.images[0]} alt={ebike.name} />
                    </div>
                    <div className="selection-check">
                      {selectedEBikeId === ebike.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{ebike.name}</h3>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {ebike.location}
                    </p>
                    <div className="ebike-details">
                      <span className="ebike-brand">{ebike.brand} {ebike.model}</span>
                    </div>
                    <div className="ebike-specs">
                      <span><i className="bi bi-battery-charging"></i> {ebike.batteryCapacity}</span>
                      <span><i className="bi bi-speedometer2"></i> {ebike.maxSpeed}</span>
                    </div>
                    <div className="ebike-specs">
                      <span><i className="bi bi-map"></i> Range: {ebike.range}</span>
                      <span><i className="bi bi-palette"></i> {ebike.color}</span>
                    </div>
                    <p className="hotel-price">Per Day <span>MMK {ebike.pricePerDay}</span></p>
                    <div className="hotel-rating">
                      {renderStars(ebike.rating)}
                      <span className="rating-count">({ebike.reviews})</span>
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
              <h2>Edit E-Bike</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>E-Bike Name</label>
                <input
                  type="text"
                  name="ebikeName"
                  value={formData.ebikeName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Battery Capacity</label>
                  <input
                    type="text"
                    name="batteryCapacity"
                    value={formData.batteryCapacity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Range (per charge)</label>
                  <input
                    type="text"
                    name="range"
                    value={formData.range}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Day (MMK)</label>
                  <input
                    type="text"
                    name="pricePerDay"
                    value={formData.pricePerDay}
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
                  <label>Max Speed</label>
                  <input
                    type="text"
                    name="maxSpeed"
                    value={formData.maxSpeed}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
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

export default EBikes;