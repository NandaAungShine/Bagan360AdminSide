import React, { useState, useEffect } from 'react';
import Header from './Header';

function Cars() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [selectedCarForEdit, setSelectedCarForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    carName: '',
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    discount: '',
    description: '',
    transmission: '',
    fuelType: '',
    seats: '',
    location: '',
    images: []
  });

  const [cars, setCars] = useState([
    {
      id: 1,
      name: 'Toyota Land Cruiser',
      brand: 'Toyota',
      model: 'Prado',
      year: '2023',
      pricePerDay: '150,000',
      rating: 4.9,
      reviews: '234',
      images: ['🚙', '🚙', '🚙'],
      description: 'Luxury SUV perfect for off-road adventures and family trips',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: '7',
      location: 'Yangon'
    },
    {
      id: 2,
      name: 'Honda CR-V',
      brand: 'Honda',
      model: '2024',
      year: '2024',
      pricePerDay: '90,000',
      rating: 4.7,
      reviews: '189',
      images: ['🚗', '🚗', '🚗'],
      description: 'Comfortable SUV with great fuel efficiency and modern features',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: '5',
      location: 'Mandalay'
    },
    {
      id: 3,
      name: 'Suzuki Swift',
      brand: 'Suzuki',
      model: 'Swift',
      year: '2023',
      pricePerDay: '45,000',
      rating: 4.5,
      reviews: '567',
      images: ['🚘', '🚘', '🚘'],
      description: 'Compact and fuel-efficient car perfect for city driving',
      transmission: 'Manual',
      fuelType: 'Petrol',
      seats: '5',
      location: 'Naypyidaw'
    },
    {
      id: 4,
      name: 'Nissan Navara',
      brand: 'Nissan',
      model: 'Navara',
      year: '2023',
      pricePerDay: '120,000',
      rating: 4.6,
      reviews: '145',
      images: ['🚛', '🚛', '🚛'],
      description: 'Powerful pickup truck ideal for cargo and rough terrain',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: '5',
      location: 'Bagan'
    },
    {
      id: 5,
      name: 'Mitsubishi Pajero',
      brand: 'Mitsubishi',
      model: 'Sport',
      year: '2024',
      pricePerDay: '130,000',
      rating: 4.8,
      reviews: '312',
      images: ['🚙', '🚙', '🚙'],
      description: 'Spacious SUV with advanced safety features',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: '7',
      location: 'Inle'
    },
    {
      id: 6,
      name: 'Hyundai Grand i10',
      brand: 'Hyundai',
      model: 'Grand i10',
      year: '2023',
      pricePerDay: '35,000',
      rating: 4.4,
      reviews: '423',
      images: ['🚗', '🚗', '🚗'],
      description: 'Economical compact car with easy handling',
      transmission: 'Manual',
      fuelType: 'Petrol',
      seats: '5',
      location: 'Yangon'
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

  const handleAddCar = () => {
    if (formData.carName && formData.pricePerDay) {
      const newCar = {
        id: cars.length + 1,
        name: formData.carName,
        brand: formData.brand || 'Various',
        model: formData.model || 'Standard',
        year: formData.year || '2024',
        pricePerDay: formData.pricePerDay.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🚗'],
        description: formData.description,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: formData.seats,
        location: formData.location
      };
      setCars([newCar, ...cars]);
      setFormData({
        carName: '',
        brand: '',
        model: '',
        year: '',
        pricePerDay: '',
        discount: '',
        description: '',
        transmission: '',
        fuelType: '',
        seats: '',
        location: '',
        images: []
      });
      setImages([]);
      alert('Car added successfully!');
    } else {
      alert('Please fill in car name and price per day');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedCarId) {
      alert('Please select a car to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this car?')) {
      setCars(cars.filter(car => car.id !== selectedCarId));
      setSelectedCarId(null);
      alert('Car deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedCarId) {
      alert('Please select a car to edit');
      return;
    }
    const carToEdit = cars.find(car => car.id === selectedCarId);
    if (carToEdit) {
      setSelectedCarForEdit(carToEdit);
      setFormData({
        carName: carToEdit.name,
        brand: carToEdit.brand || '',
        model: carToEdit.model || '',
        year: carToEdit.year || '',
        pricePerDay: carToEdit.pricePerDay,
        discount: '',
        description: carToEdit.description || '',
        transmission: carToEdit.transmission || '',
        fuelType: carToEdit.fuelType || '',
        seats: carToEdit.seats || '',
        location: carToEdit.location || '',
        images: carToEdit.images || []
      });
      setImages(carToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedCarForEdit && formData.carName) {
      const updatedCars = cars.map(car =>
        car.id === selectedCarForEdit.id
          ? {
              ...car,
              name: formData.carName,
              brand: formData.brand || car.brand,
              model: formData.model || car.model,
              year: formData.year || car.year,
              pricePerDay: formData.pricePerDay.replace(/[^0-9]/g, ''),
              description: formData.description,
              transmission: formData.transmission,
              fuelType: formData.fuelType,
              seats: formData.seats,
              location: formData.location,
              images: formData.images.length > 0 ? formData.images : car.images
            }
          : car
      );
      setCars(updatedCars);
      setShowEditModal(false);
      setSelectedCarId(null);
      setSelectedCarForEdit(null);
      setFormData({
        carName: '',
        brand: '',
        model: '',
        year: '',
        pricePerDay: '',
        discount: '',
        description: '',
        transmission: '',
        fuelType: '',
        seats: '',
        location: '',
        images: []
      });
      setImages([]);
      alert('Car updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedCarId === 'all') {
      setSelectedCarId(null);
    } else {
      setSelectedCarId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleCarSelection = (id) => {
    if (selectedCarId === id) {
      setSelectedCarId(null);
    } else {
      setSelectedCarId(id);
    }
  };

  const filteredCars = cars.filter(car =>
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Header title="Cars Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search car..."
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
              <button onClick={() => { setSelectedCarId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedCarId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Car Cards (Right) */}
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
                <label>Car Name</label>
                <input
                  type="text"
                  name="carName"
                  placeholder="eg. Toyota Land Cruiser"
                  value={formData.carName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="eg. Toyota, Honda, Suzuki"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Model</label>
                  <input
                    type="text"
                    name="model"
                    placeholder="eg. Prado, CR-V, Swift"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Year</label>
                  <input
                    type="text"
                    name="year"
                    placeholder="eg. 2023, 2024"
                    value={formData.year}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Price Per Day (MMK)</label>
                  <input
                    type="text"
                    name="pricePerDay"
                    placeholder="eg. 150000"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
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
                <div className="add-form-group half">
                  <label>Seats</label>
                  <input
                    type="text"
                    name="seats"
                    placeholder="eg. 5, 7"
                    value={formData.seats}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Transmission</label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="add-form-group half">
                  <label>Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="add-form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="eg. Yangon, Mandalay, Bagan"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the car features, condition, included services..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddCar}>
                Add Car
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Car Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredCars.map((car) => (
                <div 
                  key={car.id} 
                  className={`hotel-card-vertical ${selectedCarId === car.id ? 'selected' : ''}`}
                  onClick={() => toggleCarSelection(car.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      <img src={car.images[0]} alt={car.name} />
                    </div>
                    <div className="selection-check">
                      {selectedCarId === car.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{car.name}</h3>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {car.location}
                    </p>
                    <div className="car-details">
                      <span className="car-brand">{car.brand} {car.model}</span>
                      <span className="car-year">{car.year}</span>
                    </div>
                    <div className="car-specs">
                      <span><i className="bi bi-gear"></i> {car.transmission}</span>
                      <span><i className="bi bi-fuel-pump"></i> {car.fuelType}</span>
                      <span><i className="bi bi-people"></i> {car.seats} seats</span>
                    </div>
                    <p className="hotel-price">Per Day <span>MMK {car.pricePerDay}</span></p>
                    <div className="hotel-rating">
                      {renderStars(car.rating)}
                      <span className="rating-count">({car.reviews})</span>
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
              <h2>Edit Car</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Car Name</label>
                <input
                  type="text"
                  name="carName"
                  value={formData.carName}
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
                  <label>Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
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
              <div className="form-row">
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
                  <label>Seats</label>
                  <input
                    type="text"
                    name="seats"
                    value={formData.seats}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Transmission</label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
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

export default Cars;