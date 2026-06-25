import React, { useState, useEffect } from 'react';
import Header from './Header';

function Restaurants() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [selectedRestaurantForEdit, setSelectedRestaurantForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisine: '',
    priceRange: '',
    discount: '',
    description: '',
    openingHours: '',
    location: '',
    phone: '',
    images: []
  });

  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      name: 'Shan Kitchen',
      cuisine: 'Shan',
      priceRange: '15,000',
      rating: 4.6,
      reviews: '850',
      images: ['🍜', '🍜', '🍜'],
      description: 'Authentic Shan noodles and traditional Shan dishes',
      openingHours: '9:00 AM - 9:00 PM',
      location: 'Nyaung U, Bagan',
      phone: '09-123456789'
    },
    {
      id: 2,
      name: 'Green Elephant Restaurant',
      cuisine: 'Burmese, Asian',
      priceRange: '25,000',
      rating: 4.8,
      reviews: '1.2K',
      images: ['🐘', '🐘', '🐘'],
      description: 'Fine dining Burmese cuisine in a garden setting',
      openingHours: '11:00 AM - 10:00 PM',
      location: 'New Bagan',
      phone: '09-987654321'
    },
    {
      id: 3,
      name: 'The Moon Vegetarian',
      cuisine: 'Vegetarian, Asian',
      priceRange: '12,000',
      rating: 4.7,
      reviews: '2.1K',
      images: ['🌙', '🌙', '🌙'],
      description: 'Popular vegetarian restaurant with authentic Burmese flavors',
      openingHours: '8:00 AM - 8:30 PM',
      location: 'Old Bagan',
      phone: '09-456789123'
    },
    {
      id: 4,
      name: 'La Terrasse',
      cuisine: 'French, Asian Fusion',
      priceRange: '45,000',
      rating: 4.9,
      reviews: '650',
      images: ['🍽️', '🍽️', '🍽️'],
      description: 'Elegant French-Asian fusion with river views',
      openingHours: '12:00 PM - 10:30 PM',
      location: 'Irrawaddy Riverside',
      phone: '09-789123456'
    },
    {
      id: 5,
      name: 'Weather Spoon\'s Bagan',
      cuisine: 'International, Bar',
      priceRange: '20,000',
      rating: 4.5,
      reviews: '980',
      images: ['🥄', '🥄', '🥄'],
      description: 'Casual dining with international menu and craft beers',
      openingHours: '10:00 AM - 11:00 PM',
      location: 'New Bagan',
      phone: '09-234567891'
    },
    {
      id: 6,
      name: 'Star Beam Bagan',
      cuisine: 'Burmese, Chinese',
      priceRange: '18,000',
      rating: 4.4,
      reviews: '720',
      images: ['⭐', '⭐', '⭐'],
      description: 'Rooftop restaurant with panoramic views',
      openingHours: '4:00 PM - 10:00 PM',
      location: 'Old Bagan',
      phone: '09-345678912'
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

  const handleAddRestaurant = () => {
    if (formData.restaurantName && formData.priceRange) {
      const newRestaurant = {
        id: restaurants.length + 1,
        name: formData.restaurantName,
        cuisine: formData.cuisine || 'Various',
        priceRange: formData.priceRange.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🍽️'],
        description: formData.description,
        openingHours: formData.openingHours,
        location: formData.location,
        phone: formData.phone
      };
      setRestaurants([newRestaurant, ...restaurants]);
      setFormData({
        restaurantName: '',
        cuisine: '',
        priceRange: '',
        discount: '',
        description: '',
        openingHours: '',
        location: '',
        phone: '',
        images: []
      });
      setImages([]);
      alert('Restaurant added successfully!');
    } else {
      alert('Please fill in restaurant name and price range');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedRestaurantId) {
      alert('Please select a restaurant to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      setRestaurants(restaurants.filter(restaurant => restaurant.id !== selectedRestaurantId));
      setSelectedRestaurantId(null);
      alert('Restaurant deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedRestaurantId) {
      alert('Please select a restaurant to edit');
      return;
    }
    const restaurantToEdit = restaurants.find(restaurant => restaurant.id === selectedRestaurantId);
    if (restaurantToEdit) {
      setSelectedRestaurantForEdit(restaurantToEdit);
      setFormData({
        restaurantName: restaurantToEdit.name,
        cuisine: restaurantToEdit.cuisine || '',
        priceRange: restaurantToEdit.priceRange,
        discount: '',
        description: restaurantToEdit.description || '',
        openingHours: restaurantToEdit.openingHours || '',
        location: restaurantToEdit.location || '',
        phone: restaurantToEdit.phone || '',
        images: restaurantToEdit.images || []
      });
      setImages(restaurantToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedRestaurantForEdit && formData.restaurantName) {
      const updatedRestaurants = restaurants.map(restaurant =>
        restaurant.id === selectedRestaurantForEdit.id
          ? {
              ...restaurant,
              name: formData.restaurantName,
              cuisine: formData.cuisine || restaurant.cuisine,
              priceRange: formData.priceRange.replace(/[^0-9]/g, ''),
              description: formData.description,
              openingHours: formData.openingHours,
              location: formData.location,
              phone: formData.phone,
              images: formData.images.length > 0 ? formData.images : restaurant.images
            }
          : restaurant
      );
      setRestaurants(updatedRestaurants);
      setShowEditModal(false);
      setSelectedRestaurantId(null);
      setSelectedRestaurantForEdit(null);
      setFormData({
        restaurantName: '',
        cuisine: '',
        priceRange: '',
        discount: '',
        description: '',
        openingHours: '',
        location: '',
        phone: '',
        images: []
      });
      setImages([]);
      alert('Restaurant updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedRestaurantId === 'all') {
      setSelectedRestaurantId(null);
    } else {
      setSelectedRestaurantId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleRestaurantSelection = (id) => {
    if (selectedRestaurantId === id) {
      setSelectedRestaurantId(null);
    } else {
      setSelectedRestaurantId(id);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Header title="Restaurants Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search restaurant..."
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
              <button onClick={() => { setSelectedRestaurantId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedRestaurantId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Restaurant Cards (Right) */}
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
                <label>Restaurant Name</label>
                <input
                  type="text"
                  name="restaurantName"
                  placeholder="eg. Shan Kitchen"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Cuisine Type</label>
                <input
                  type="text"
                  name="cuisine"
                  placeholder="eg. Burmese, Shan, Chinese, International"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price Range (MMK)</label>
                  <input
                    type="text"
                    name="priceRange"
                    placeholder="eg. 25000"
                    value={formData.priceRange}
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
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="eg. New Bagan, Old Bagan"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Opening Hours</label>
                <input
                  type="text"
                  name="openingHours"
                  placeholder="eg. 9:00 AM - 9:00 PM"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="eg. 09-123456789"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the restaurant, signature dishes, ambiance..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddRestaurant}>
                Add Restaurant
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Restaurant Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredRestaurants.map((restaurant) => (
                <div 
                  key={restaurant.id} 
                  className={`hotel-card-vertical ${selectedRestaurantId === restaurant.id ? 'selected' : ''}`}
                  onClick={() => toggleRestaurantSelection(restaurant.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img src={restaurant.images[0]} alt={restaurant.name} />
                    </div>
                    <div className="selection-check">
                      {selectedRestaurantId === restaurant.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{restaurant.name}</h3>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {restaurant.location}
                    </p>
                    <div className="cuisine-type">
                      <i className="bi bi-egg-fried"></i> {restaurant.cuisine}
                    </div>
                    <p className="hotel-price">Avg. Price <span>MMK {restaurant.priceRange}</span></p>
                    <div className="hotel-rating">
                      {renderStars(restaurant.rating)}
                      <span className="rating-count">({restaurant.reviews})</span>
                    </div>
                    {restaurant.openingHours && (
                      <p className="opening-hours">
                        <i className="bi bi-clock"></i> {restaurant.openingHours}
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
              <h2>Edit Restaurant</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Cuisine Type</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Range (MMK)</label>
                  <input
                    type="text"
                    name="priceRange"
                    value={formData.priceRange}
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
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Opening Hours</label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
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

export default Restaurants;