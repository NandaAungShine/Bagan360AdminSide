import React, { useState, useEffect } from 'react';
import Header from './Header';

function Destinations() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [selectedDestinationForEdit, setSelectedDestinationForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

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

  const [destinations, setDestinations] = useState([
    {
      id: 1,
      name: 'Bagan Ancient City',
      location: 'Mandalay Region',
      price: '150,000',
      rating: 4.8,
      reviews: '2.3K',
      images: ['🏯', '🏯', '🏯'],
      description: 'Thousands of ancient pagodas and temples spread across the plains',
      bestTimeToVisit: 'November to February',
      activities: 'Temple hopping, hot air balloon, sunset viewing'
    },
    {
      id: 2,
      name: 'Inle Lake',
      location: 'Shan State',
      price: '120,000',
      rating: 4.7,
      reviews: '1.8K',
      images: ['🌊', '🌊', '🌊'],
      description: 'Famous for floating gardens and leg-rowing fishermen',
      bestTimeToVisit: 'September to November',
      activities: 'Boat tours, floating markets, vineyard visits'
    },
    {
      id: 3,
      name: 'Golden Rock (Kyaiktiyo)',
      location: 'Mon State',
      price: '80,000',
      rating: 4.6,
      reviews: '1.2K',
      images: ['⛰️', '⛰️', '⛰️'],
      description: 'Sacred golden boulder balancing on the edge of a cliff',
      bestTimeToVisit: 'November to March',
      activities: 'Pilgrimage, hiking, sunrise viewing'
    },
    {
      id: 4,
      name: 'Mandalay Palace',
      location: 'Mandalay',
      price: '50,000',
      rating: 4.4,
      reviews: '950',
      images: ['🏰', '🏰', '🏰'],
      description: 'Last royal palace of the Burmese monarchy',
      bestTimeToVisit: 'October to February',
      activities: 'Cultural tours, palace exploration, photography'
    },
    {
      id: 5,
      name: 'Ngapali Beach',
      location: 'Rakhine State',
      price: '200,000',
      rating: 4.9,
      reviews: '3.1K',
      images: ['🏖️', '🏖️', '🏖️'],
      description: 'Pristine white sand beach with crystal clear waters',
      bestTimeToVisit: 'November to April',
      activities: 'Swimming, snorkeling, seafood dining, boat trips'
    },
    {
      id: 6,
      name: 'Shwedagon Pagoda',
      location: 'Yangon',
      price: '30,000',
      rating: 4.9,
      reviews: '5.2K',
      images: ['🛕', '🛕', '🛕'],
      description: 'Most sacred Buddhist pagoda in Myanmar, covered in gold',
      bestTimeToVisit: 'Year-round',
      activities: 'Religious tours, cultural experience, evening visits'
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

  const handleAddDestination = () => {
    if (formData.destinationName && formData.price) {
      const newDestination = {
        id: destinations.length + 1,
        name: formData.destinationName,
        location: formData.location || 'New Location',
        price: formData.price.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['📍'],
        description: formData.description,
        bestTimeToVisit: formData.bestTimeToVisit,
        activities: formData.activities
      };
      setDestinations([newDestination, ...destinations]);
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
      alert('Destination added successfully!');
    } else {
      alert('Please fill in destination name and price');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedDestinationId) {
      alert('Please select a destination to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this destination?')) {
      setDestinations(destinations.filter(destination => destination.id !== selectedDestinationId));
      setSelectedDestinationId(null);
      alert('Destination deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedDestinationId) {
      alert('Please select a destination to edit');
      return;
    }
    const destinationToEdit = destinations.find(destination => destination.id === selectedDestinationId);
    if (destinationToEdit) {
      setSelectedDestinationForEdit(destinationToEdit);
      setFormData({
        destinationName: destinationToEdit.name,
        location: destinationToEdit.location || '',
        price: destinationToEdit.price,
        discount: '',
        startDate: '',
        endDate: '',
        description: destinationToEdit.description || '',
        activities: destinationToEdit.activities || '',
        bestTimeToVisit: destinationToEdit.bestTimeToVisit || '',
        images: destinationToEdit.images || []
      });
      setImages(destinationToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedDestinationForEdit && formData.destinationName) {
      const updatedDestinations = destinations.map(destination =>
        destination.id === selectedDestinationForEdit.id
          ? {
              ...destination,
              name: formData.destinationName,
              location: formData.location || destination.location,
              price: formData.price.replace(/[^0-9]/g, ''),
              description: formData.description,
              bestTimeToVisit: formData.bestTimeToVisit,
              activities: formData.activities,
              images: formData.images.length > 0 ? formData.images : destination.images
            }
          : destination
      );
      setDestinations(updatedDestinations);
      setShowEditModal(false);
      setSelectedDestinationId(null);
      setSelectedDestinationForEdit(null);
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
      alert('Destination updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedDestinationId === 'all') {
      setSelectedDestinationId(null);
    } else {
      setSelectedDestinationId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleDestinationSelection = (id) => {
    if (selectedDestinationId === id) {
      setSelectedDestinationId(null);
    } else {
      setSelectedDestinationId(id);
    }
  };

  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Header title="Destinations Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
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
              <button onClick={() => { setSelectedDestinationId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedDestinationId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Destination Cards (Right) */}
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
                <label>Destination Name</label>
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
                  <label>Price</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="eg. 150000 ks"
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

              <button className="add-item-btn-full" onClick={handleAddDestination}>
                Add Destination
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Destination Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredDestinations.map((destination) => (
                <div 
                  key={destination.id} 
                  className={`hotel-card-vertical ${selectedDestinationId === destination.id ? 'selected' : ''}`}
                  onClick={() => toggleDestinationSelection(destination.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img src={destination.images[0]} alt={destination.name} />
                    </div>
                    <div className="selection-check">
                      {selectedDestinationId === destination.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{destination.name}</h3>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {destination.location}
                    </p>
                    <p className="hotel-price">Starting from <span>MMK {destination.price}</span></p>
                    <div className="hotel-rating">
                      {renderStars(destination.rating)}
                      <span className="rating-count">({destination.reviews})</span>
                    </div>
                    {destination.bestTimeToVisit && (
                      <p className="best-time">
                        <i className="bi bi-calendar-check"></i> Best: {destination.bestTimeToVisit}
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
              <h2>Edit Destination</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Destination Name</label>
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
                  <label>Price</label>
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

export default Destinations;