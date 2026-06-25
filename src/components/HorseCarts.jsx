import React, { useState, useEffect } from 'react';
import Header from './Header';

function HorseCarts() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [selectedCartForEdit, setSelectedCartForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    cartName: '',
    type: '',
    capacity: '',
    pricePerHour: '',
    pricePerDay: '',
    pricePerTour: '',
    discount: '',
    description: '',
    features: '',
    route: '',
    location: '',
    contactNumber: '',
    images: []
  });

  const [horseCarts, setHorseCarts] = useState([
    {
      id: 1,
      name: 'Bagan Heritage Cart',
      type: 'Traditional',
      capacity: '4 passengers',
      pricePerHour: '25,000',
      pricePerDay: '120,000',
      pricePerTour: '35,000',
      rating: 4.8,
      reviews: '456',
      images: ['🐎', '🐎', '🐎'],
      description: 'Authentic horse cart experience through ancient Bagan temples',
      features: 'Traditional wooden cart, experienced local driver, decorative canopy',
      route: 'Old Bagan Temple Circuit',
      location: 'Old Bagan',
      contactNumber: '09-123456789'
    },
    {
      id: 2,
      name: 'Sunset Special Cart',
      type: 'Tourist',
      capacity: '3 passengers',
      pricePerHour: '30,000',
      pricePerDay: '150,000',
      pricePerTour: '40,000',
      rating: 4.9,
      reviews: '678',
      images: ['🐎', '🐎', '🐎'],
      description: 'Romantic sunset tour to the best viewing spots in Bagan',
      features: 'Comfortable seating, blankets, sunset guide map, photo stops',
      route: 'Sunset Viewing Points Tour',
      location: 'New Bagan',
      contactNumber: '09-987654321'
    },
    {
      id: 3,
      name: 'Family Adventure Cart',
      type: 'Family',
      capacity: '5 passengers (2 adults, 3 children)',
      pricePerHour: '35,000',
      pricePerDay: '180,000',
      pricePerTour: '50,000',
      rating: 4.7,
      reviews: '345',
      images: ['🐎', '🐎', '🐎'],
      description: 'Spacious cart perfect for families with children',
      features: 'Child seats, sunshade, snack basket, activity books for kids',
      route: 'Family-Friendly Temple Tour',
      location: 'Nyaung U',
      contactNumber: '09-456789123'
    },
    {
      id: 4,
      name: 'Premium Luxury Cart',
      type: 'Luxury',
      capacity: '2 passengers',
      pricePerHour: '50,000',
      pricePerDay: '250,000',
      pricePerTour: '70,000',
      rating: 5.0,
      reviews: '234',
      images: ['🐎', '🐎', '🐎'],
      description: 'Deluxe horse cart with premium amenities and private guide',
      features: 'Leather seats, refreshments, professional guide, camera service',
      route: 'Custom Private Tours',
      location: 'Old Bagan',
      contactNumber: '09-234567890'
    },
    {
      id: 5,
      name: 'Cultural Explorer Cart',
      type: 'Cultural',
      capacity: '4 passengers',
      pricePerHour: '28,000',
      pricePerDay: '140,000',
      pricePerTour: '38,000',
      rating: 4.8,
      reviews: '567',
      images: ['🐎', '🐎', '🐎'],
      description: 'Explore hidden temples and local villages off the beaten path',
      features: 'Cultural insights, local village visits, traditional snack tasting',
      route: 'Cultural Heritage Route',
      location: 'Myinkaba Village',
      contactNumber: '09-345678901'
    },
    {
      id: 6,
      name: 'Full Day Temple Tour',
      type: 'Tourist',
      capacity: '4 passengers',
      pricePerHour: '22,000',
      pricePerDay: '160,000',
      pricePerTour: '45,000',
      rating: 4.6,
      reviews: '789',
      images: ['🐎', '🐎', '🐎'],
      description: 'Comprehensive full-day tour covering major temples and pagodas',
      features: 'Lunch included, water bottles, temple information guide',
      route: 'Complete Bagan Temple Circuit',
      location: 'Bagan',
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

  const handleAddCart = () => {
    if (formData.cartName && formData.pricePerHour) {
      const newCart = {
        id: horseCarts.length + 1,
        name: formData.cartName,
        type: formData.type || 'Standard',
        capacity: formData.capacity || '4 passengers',
        pricePerHour: formData.pricePerHour.replace(/[^0-9]/g, ''),
        pricePerDay: formData.pricePerDay ? formData.pricePerDay.replace(/[^0-9]/g, '') : '',
        pricePerTour: formData.pricePerTour ? formData.pricePerTour.replace(/[^0-9]/g, '') : '',
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🐎'],
        description: formData.description,
        features: formData.features,
        route: formData.route,
        location: formData.location,
        contactNumber: formData.contactNumber
      };
      setHorseCarts([newCart, ...horseCarts]);
      setFormData({
        cartName: '',
        type: '',
        capacity: '',
        pricePerHour: '',
        pricePerDay: '',
        pricePerTour: '',
        discount: '',
        description: '',
        features: '',
        route: '',
        location: '',
        contactNumber: '',
        images: []
      });
      setImages([]);
      alert('Horse Cart added successfully!');
    } else {
      alert('Please fill in horse cart name and price per hour');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedCartId) {
      alert('Please select a horse cart to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this horse cart?')) {
      setHorseCarts(horseCarts.filter(cart => cart.id !== selectedCartId));
      setSelectedCartId(null);
      alert('Horse Cart deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedCartId) {
      alert('Please select a horse cart to edit');
      return;
    }
    const cartToEdit = horseCarts.find(cart => cart.id === selectedCartId);
    if (cartToEdit) {
      setSelectedCartForEdit(cartToEdit);
      setFormData({
        cartName: cartToEdit.name,
        type: cartToEdit.type || '',
        capacity: cartToEdit.capacity || '',
        pricePerHour: cartToEdit.pricePerHour,
        pricePerDay: cartToEdit.pricePerDay || '',
        pricePerTour: cartToEdit.pricePerTour || '',
        discount: '',
        description: cartToEdit.description || '',
        features: cartToEdit.features || '',
        route: cartToEdit.route || '',
        location: cartToEdit.location || '',
        contactNumber: cartToEdit.contactNumber || '',
        images: cartToEdit.images || []
      });
      setImages(cartToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedCartForEdit && formData.cartName) {
      const updatedCarts = horseCarts.map(cart =>
        cart.id === selectedCartForEdit.id
          ? {
              ...cart,
              name: formData.cartName,
              type: formData.type || cart.type,
              capacity: formData.capacity || cart.capacity,
              pricePerHour: formData.pricePerHour.replace(/[^0-9]/g, ''),
              pricePerDay: formData.pricePerDay ? formData.pricePerDay.replace(/[^0-9]/g, '') : cart.pricePerDay,
              pricePerTour: formData.pricePerTour ? formData.pricePerTour.replace(/[^0-9]/g, '') : cart.pricePerTour,
              description: formData.description,
              features: formData.features,
              route: formData.route,
              location: formData.location,
              contactNumber: formData.contactNumber,
              images: formData.images.length > 0 ? formData.images : cart.images
            }
          : cart
      );
      setHorseCarts(updatedCarts);
      setShowEditModal(false);
      setSelectedCartId(null);
      setSelectedCartForEdit(null);
      setFormData({
        cartName: '',
        type: '',
        capacity: '',
        pricePerHour: '',
        pricePerDay: '',
        pricePerTour: '',
        discount: '',
        description: '',
        features: '',
        route: '',
        location: '',
        contactNumber: '',
        images: []
      });
      setImages([]);
      alert('Horse Cart updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedCartId === 'all') {
      setSelectedCartId(null);
    } else {
      setSelectedCartId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleCartSelection = (id) => {
    if (selectedCartId === id) {
      setSelectedCartId(null);
    } else {
      setSelectedCartId(id);
    }
  };

  const filteredCarts = horseCarts.filter(cart =>
    cart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cart.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cart.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cart.route.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Header title="Horse Carts Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search horse cart..."
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
              <button onClick={() => { setSelectedCartId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedCartId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Horse Cart Cards (Right) */}
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
                <label>Horse Cart Name</label>
                <input
                  type="text"
                  name="cartName"
                  placeholder="eg. Bagan Heritage Cart"
                  value={formData.cartName}
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
                    <option value="Tourist">Tourist</option>
                    <option value="Family">Family</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>
                <div className="add-form-group half">
                  <label>Capacity</label>
                  <input
                    type="text"
                    name="capacity"
                    placeholder="eg. 4 passengers"
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
                    placeholder="eg. 25000"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Price Per Day (MMK)</label>
                  <input
                    type="text"
                    name="pricePerDay"
                    placeholder="eg. 120000"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-group">
                <label>Price Per Tour (MMK)</label>
                <input
                  type="text"
                  name="pricePerTour"
                  placeholder="eg. 35000"
                  value={formData.pricePerTour}
                  onChange={handleInputChange}
                />
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
                <label>Route / Tour Path</label>
                <input
                  type="text"
                  name="route"
                  placeholder="eg. Old Bagan Temple Circuit"
                  value={formData.route}
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
                  placeholder="Traditional wooden cart, experienced local driver, decorative canopy..."
                  value={formData.features}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the horse cart experience and what makes it special..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddCart}>
                Add Horse Cart
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Horse Cart Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredCarts.map((cart) => (
                <div 
                  key={cart.id} 
                  className={`hotel-card-vertical ${selectedCartId === cart.id ? 'selected' : ''}`}
                  onClick={() => toggleCartSelection(cart.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img src={cart.images[0]} alt={cart.name} />
                    </div>
                    <div className="selection-check">
                      {selectedCartId === cart.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{cart.name}</h3>
                    <div className="cart-type">
                      <span className="type-badge">{cart.type}</span>
                    </div>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {cart.location}
                    </p>
                    <div className="cart-details">
                      <span><i className="bi bi-people"></i> {cart.capacity}</span>
                      <span><i className="bi bi-signpost"></i> {cart.route}</span>
                    </div>
                    <div className="cart-pricing">
                      <span className="price-hour">Hour: MMK {cart.pricePerHour}</span>
                      {cart.pricePerDay && (
                        <span className="price-day">Day: MMK {cart.pricePerDay}</span>
                      )}
                      {cart.pricePerTour && (
                        <span className="price-tour">Tour: MMK {cart.pricePerTour}</span>
                      )}
                    </div>
                    {cart.features && (
                      <p className="features">
                        <i className="bi bi-star"></i> {cart.features.substring(0, 60)}...
                      </p>
                    )}
                    <div className="hotel-rating">
                      {renderStars(cart.rating)}
                      <span className="rating-count">({cart.reviews})</span>
                    </div>
                    {cart.contactNumber && (
                      <p className="contact-info">
                        <i className="bi bi-telephone"></i> {cart.contactNumber}
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
              <h2>Edit Horse Cart</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Horse Cart Name</label>
                <input
                  type="text"
                  name="cartName"
                  value={formData.cartName}
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
                    <option value="Tourist">Tourist</option>
                    <option value="Family">Family</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Cultural">Cultural</option>
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
                <label>Price Per Tour (MMK)</label>
                <input
                  type="text"
                  name="pricePerTour"
                  value={formData.pricePerTour}
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
              <div className="form-group">
                <label>Route / Tour Path</label>
                <input
                  type="text"
                  name="route"
                  value={formData.route}
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

export default HorseCarts;