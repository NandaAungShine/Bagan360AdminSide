import React, { useState, useEffect } from 'react';
import Header from './Header';

function Hotels() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [selectedHotelForEdit, setSelectedHotelForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    hotelName: '',
    roomType: '',
    price: '',
    discount: '',
    startDate: '',
    endDate: '',
    description: '',
    facilities: '',
    images: []
  });

  const [hotels, setHotels] = useState([
    {
      id: 1,
      name: 'Bagan Thande Hotel',
      location: 'Old Bagan',
      price: '228,359',
      rating: 4.7,
      reviews: '1K',
      images: ['🏨', '🏨', '🏨'],
      roomType: 'Deluxe Room',
      description: 'Beautiful hotel with river view'
    },
    {
      id: 2,
      name: 'Aureum Palace Hotel',
      location: 'Nyaung U',
      price: '450,000',
      rating: 4.9,
      reviews: '2.5K',
      images: ['🏰', '🏰', '🏰'],
      roomType: 'Suite Room',
      description: 'Luxury palace style hotel'
    },
    {
      id: 3,
      name: 'Bagan Lodge',
      location: 'Myin Kabar',
      price: '180,000',
      rating: 4.6,
      reviews: '800',
      images: ['🏨', '🏨', '🏨'],
      roomType: 'Standard Room',
      description: 'Cozy lodge with garden'
    },
    {
      id: 4,
      name: 'The Hotel Umbra',
      location: 'New Bagan',
      price: '95,000',
      rating: 4.3,
      reviews: '450',
      images: ['🏨', '🏨', '🏨'],
      roomType: 'Economy Room',
      description: 'Budget friendly hotel'
    },
    {
      id: 5,
      name: 'Bagan Thiripyitsaya',
      location: 'Irrawaddy River',
      price: '210,000',
      rating: 4.8,
      reviews: '1.2K',
      images: ['🏨', '🏨', '🏨'],
      roomType: 'River View Room',
      description: 'Beautiful river view'
    },
    {
      id: 6,
      name: 'Bagan Restaurant',
      location: 'Old Bagan',
      price: '228,359',
      rating: 4.7,
      reviews: '1K',
      images: ['🏨', '🏨', '🏨'],
      roomType: 'Standard Room',
      description: 'Traditional Bagan style'
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

  const handleAddHotel = () => {
    if (formData.hotelName && formData.price) {
      const newHotel = {
        id: hotels.length + 1,
        name: formData.hotelName,
        location: formData.roomType || 'New Location',
        price: formData.price.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🏨'],
        roomType: formData.roomType,
        description: formData.description
      };
      setHotels([newHotel, ...hotels]);
      setFormData({
        hotelName: '',
        roomType: '',
        price: '',
        discount: '',
        startDate: '',
        endDate: '',
        description: '',
        facilities: '',
        images: []
      });
      setImages([]);
      alert('Hotel added successfully!');
    } else {
      alert('Please fill in hotel name and price');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedHotelId) {
      alert('Please select a hotel to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      setHotels(hotels.filter(hotel => hotel.id !== selectedHotelId));
      setSelectedHotelId(null);
      alert('Hotel deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedHotelId) {
      alert('Please select a hotel to edit');
      return;
    }
    const hotelToEdit = hotels.find(hotel => hotel.id === selectedHotelId);
    if (hotelToEdit) {
      setSelectedHotelForEdit(hotelToEdit);
      setFormData({
        hotelName: hotelToEdit.name,
        roomType: hotelToEdit.roomType || '',
        price: hotelToEdit.price,
        discount: '',
        startDate: '',
        endDate: '',
        description: hotelToEdit.description || '',
        facilities: hotelToEdit.facilities || '',
        images: hotelToEdit.images || []
      });
      setImages(hotelToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedHotelForEdit && formData.hotelName) {
      const updatedHotels = hotels.map(hotel =>
        hotel.id === selectedHotelForEdit.id
          ? {
              ...hotel,
              name: formData.hotelName,
              location: formData.roomType || hotel.location,
              price: formData.price.replace(/[^0-9]/g, ''),
              roomType: formData.roomType,
              description: formData.description,
              images: formData.images.length > 0 ? formData.images : hotel.images
            }
          : hotel
      );
      setHotels(updatedHotels);
      setShowEditModal(false);
      setSelectedHotelId(null);
      setSelectedHotelForEdit(null);
      setFormData({
        hotelName: '',
        roomType: '',
        price: '',
        discount: '',
        startDate: '',
        endDate: '',
        description: '',
        facilities: '',
        images: []
      });
      setImages([]);
      alert('Hotel updated successfully!');
    }
  };

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

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Header title="Hotels Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
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
              <button onClick={() => { setSelectedHotelId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedHotelId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Hotel Cards (Right) */}
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
                <label>Hotel Name</label>
                <input
                  type="text"
                  name="hotelName"
                  placeholder="eg. Aureum Palace Hotel"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Room Type</label>
                <input
                  type="text"
                  name="roomType"
                  placeholder="eg. Deluxe Room"
                  value={formData.roomType}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="eg. 50000 ks"
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
                  placeholder="product onboarding effortless and intuitive..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>Facilities</label>
                <textarea
                  name="facilities"
                  rows="2"
                  placeholder="WiFi, Parking, Pool, Restaurant..."
                  value={formData.facilities}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddHotel}>
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Hotel Cards (2 per row) */}
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
                      <img src={hotel.images[0]} alt={hotel.name} />
                    </div>
                    <div className="selection-check">
                      {selectedHotelId === hotel.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {hotel.location}
                    </p>
                    <p className="hotel-price">Starting from <span>MMK {hotel.price}</span></p>
                    <div className="hotel-rating">
                      {renderStars(hotel.rating)}
                      <span className="rating-count">({hotel.reviews})</span>
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
                <label>Hotel Name</label>
                <input
                  type="text"
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Room Type</label>
                <input
                  type="text"
                  name="roomType"
                  value={formData.roomType}
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
                <label>Facilities</label>
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

export default Hotels;