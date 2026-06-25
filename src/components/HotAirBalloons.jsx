import React, { useState, useEffect } from 'react';
import Header from './Header';

function HotAirBalloons() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBalloonId, setSelectedBalloonId] = useState(null);
  const [selectedBalloonForEdit, setSelectedBalloonForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    balloonName: '',
    company: '',
    capacity: '',
    duration: '',
    price: '',
    discount: '',
    description: '',
    flightTimes: '',
    season: '',
    location: '',
    includes: '',
    images: []
  });

  const [balloons, setBalloons] = useState([
    {
      id: 1,
      name: 'Balloons Over Bagan',
      company: 'Balloons Over Bagan',
      capacity: '8-12 persons',
      duration: '45-60 minutes',
      price: '380,000',
      rating: 4.9,
      reviews: '2.5K',
      images: ['🎈', '🎈', '🎈'],
      description: 'Experience the breathtaking sunrise over thousands of ancient temples in Bagan',
      flightTimes: '5:30 AM - 7:30 AM (Sunrise Flight)',
      season: 'October - April',
      location: 'Old Bagan',
      includes: 'Hotel transfer, breakfast, souvenir certificate'
    },
    {
      id: 2,
      name: 'Oriental Ballooning',
      company: 'Oriental Ballooning',
      capacity: '6-10 persons',
      duration: '60 minutes',
      price: '420,000',
      rating: 4.9,
      reviews: '1.8K',
      images: ['🎈', '🎈', '🎈'],
      description: 'Luxury hot air balloon experience with champagne breakfast',
      flightTimes: '5:30 AM - 7:00 AM',
      season: 'October - April',
      location: 'New Bagan',
      includes: 'Champagne breakfast, flight certificate, photos'
    },
    {
      id: 3,
      name: 'Golden Eagle Ballooning',
      company: 'Golden Eagle',
      capacity: '8-12 persons',
      duration: '50 minutes',
      price: '350,000',
      rating: 4.8,
      reviews: '1.2K',
      images: ['🎈', '🎈', '🎈'],
      description: 'Spectacular views of Bagan archaeological zone at sunrise',
      flightTimes: '5:45 AM - 7:15 AM',
      season: 'November - March',
      location: 'Nyaung U',
      includes: 'Hotel pickup, light breakfast, flight certificate'
    },
    {
      id: 4,
      name: 'Sunrise Balloon Tours',
      company: 'Sunrise Balloons',
      capacity: '6-8 persons',
      duration: '55 minutes',
      price: '395,000',
      rating: 4.7,
      reviews: '980',
      images: ['🎈', '🎈', '🎈'],
      description: 'Intimate ballooning experience with small groups',
      flightTimes: '5:30 AM - 7:00 AM',
      season: 'October - April',
      location: 'Old Bagan',
      includes: 'Morning tea, snacks, digital photos'
    },
    {
      id: 5,
      name: 'Bagan Balloon Express',
      company: 'Bagan Express',
      capacity: '10-14 persons',
      duration: '45 minutes',
      price: '320,000',
      rating: 4.6,
      reviews: '750',
      images: ['🎈', '🎈', '🎈'],
      description: 'Affordable hot air balloon ride with great views',
      flightTimes: '6:00 AM - 7:30 AM',
      season: 'December - March',
      location: 'New Bagan',
      includes: 'Basic breakfast, hotel transfer'
    },
    {
      id: 6,
      name: 'Premium Balloon Experience',
      company: 'Bagan Luxury Tours',
      capacity: '4-6 persons',
      duration: '75 minutes',
      price: '550,000',
      rating: 5.0,
      reviews: '520',
      images: ['🎈', '🎈', '🎈'],
      description: 'Exclusive premium experience with extended flight time',
      flightTimes: '5:30 AM - 7:45 AM',
      season: 'October - April',
      location: 'Old Bagan',
      includes: 'Gourmet breakfast, premium drinks, professional photos, souvenir video'
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

  const handleAddBalloon = () => {
    if (formData.balloonName && formData.price) {
      const newBalloon = {
        id: balloons.length + 1,
        name: formData.balloonName,
        company: formData.company || 'Various',
        capacity: formData.capacity || 'N/A',
        duration: formData.duration || 'N/A',
        price: formData.price.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🎈'],
        description: formData.description,
        flightTimes: formData.flightTimes,
        season: formData.season,
        location: formData.location,
        includes: formData.includes
      };
      setBalloons([newBalloon, ...balloons]);
      setFormData({
        balloonName: '',
        company: '',
        capacity: '',
        duration: '',
        price: '',
        discount: '',
        description: '',
        flightTimes: '',
        season: '',
        location: '',
        includes: '',
        images: []
      });
      setImages([]);
      alert('Hot Air Balloon experience added successfully!');
    } else {
      alert('Please fill in balloon name and price');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedBalloonId) {
      alert('Please select a balloon experience to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this balloon experience?')) {
      setBalloons(balloons.filter(balloon => balloon.id !== selectedBalloonId));
      setSelectedBalloonId(null);
      alert('Hot Air Balloon experience deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedBalloonId) {
      alert('Please select a balloon experience to edit');
      return;
    }
    const balloonToEdit = balloons.find(balloon => balloon.id === selectedBalloonId);
    if (balloonToEdit) {
      setSelectedBalloonForEdit(balloonToEdit);
      setFormData({
        balloonName: balloonToEdit.name,
        company: balloonToEdit.company || '',
        capacity: balloonToEdit.capacity || '',
        duration: balloonToEdit.duration || '',
        price: balloonToEdit.price,
        discount: '',
        description: balloonToEdit.description || '',
        flightTimes: balloonToEdit.flightTimes || '',
        season: balloonToEdit.season || '',
        location: balloonToEdit.location || '',
        includes: balloonToEdit.includes || '',
        images: balloonToEdit.images || []
      });
      setImages(balloonToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedBalloonForEdit && formData.balloonName) {
      const updatedBalloons = balloons.map(balloon =>
        balloon.id === selectedBalloonForEdit.id
          ? {
              ...balloon,
              name: formData.balloonName,
              company: formData.company || balloon.company,
              capacity: formData.capacity || balloon.capacity,
              duration: formData.duration || balloon.duration,
              price: formData.price.replace(/[^0-9]/g, ''),
              description: formData.description,
              flightTimes: formData.flightTimes,
              season: formData.season,
              location: formData.location,
              includes: formData.includes,
              images: formData.images.length > 0 ? formData.images : balloon.images
            }
          : balloon
      );
      setBalloons(updatedBalloons);
      setShowEditModal(false);
      setSelectedBalloonId(null);
      setSelectedBalloonForEdit(null);
      setFormData({
        balloonName: '',
        company: '',
        capacity: '',
        duration: '',
        price: '',
        discount: '',
        description: '',
        flightTimes: '',
        season: '',
        location: '',
        includes: '',
        images: []
      });
      setImages([]);
      alert('Hot Air Balloon experience updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedBalloonId === 'all') {
      setSelectedBalloonId(null);
    } else {
      setSelectedBalloonId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleBalloonSelection = (id) => {
    if (selectedBalloonId === id) {
      setSelectedBalloonId(null);
    } else {
      setSelectedBalloonId(id);
    }
  };

  const filteredBalloons = balloons.filter(balloon =>
    balloon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balloon.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balloon.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Header title="Hot Air Balloons Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search balloon experience..."
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
              <button onClick={() => { setSelectedBalloonId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedBalloonId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Balloon Cards (Right) */}
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
                <label>Balloon Experience Name</label>
                <input
                  type="text"
                  name="balloonName"
                  placeholder="eg. Balloons Over Bagan"
                  value={formData.balloonName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company"
                  placeholder="eg. Balloons Over Bagan"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Capacity</label>
                  <input
                    type="text"
                    name="capacity"
                    placeholder="eg. 8-12 persons"
                    value={formData.capacity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="eg. 45-60 minutes"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price (MMK)</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="eg. 380000"
                    value={formData.price}
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

              <div className="add-form-group">
                <label>Flight Times</label>
                <input
                  type="text"
                  name="flightTimes"
                  placeholder="eg. 5:30 AM - 7:30 AM (Sunrise Flight)"
                  value={formData.flightTimes}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Season</label>
                  <input
                    type="text"
                    name="season"
                    placeholder="eg. October - April"
                    value={formData.season}
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
                <label>What's Included</label>
                <textarea
                  name="includes"
                  rows="2"
                  placeholder="Hotel transfer, breakfast, souvenir certificate..."
                  value={formData.includes}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the balloon experience, views, and special features..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddBalloon}>
                Add Experience
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Balloon Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredBalloons.map((balloon) => (
                <div 
                  key={balloon.id} 
                  className={`hotel-card-vertical ${selectedBalloonId === balloon.id ? 'selected' : ''}`}
                  onClick={() => toggleBalloonSelection(balloon.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img src={balloon.images[0]} alt={balloon.name} />
                    </div>
                    <div className="selection-check">
                      {selectedBalloonId === balloon.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{balloon.name}</h3>
                    <p className="company-name">
                      <i className="bi bi-building"></i> {balloon.company}
                    </p>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {balloon.location}
                    </p>
                    <div className="balloon-details">
                      <span><i className="bi bi-people"></i> {balloon.capacity}</span>
                      <span><i className="bi bi-clock"></i> {balloon.duration}</span>
                    </div>
                    <div className="balloon-details">
                      <span><i className="bi bi-sunrise"></i> {balloon.flightTimes}</span>
                    </div>
                    <p className="hotel-price">From <span>MMK {balloon.price}</span></p>
                    <div className="hotel-rating">
                      {renderStars(balloon.rating)}
                      <span className="rating-count">({balloon.reviews})</span>
                    </div>
                    {balloon.season && (
                      <p className="season-info">
                        <i className="bi bi-calendar-event"></i> Best Season: {balloon.season}
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
              <h2>Edit Hot Air Balloon Experience</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Balloon Experience Name</label>
                <input
                  type="text"
                  name="balloonName"
                  value={formData.balloonName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>
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
              <div className="form-group">
                <label>Flight Times</label>
                <input
                  type="text"
                  name="flightTimes"
                  value={formData.flightTimes}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Season</label>
                  <input
                    type="text"
                    name="season"
                    value={formData.season}
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
                <label>What's Included</label>
                <textarea
                  name="includes"
                  rows="2"
                  value={formData.includes}
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

export default HotAirBalloons;