import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function Cars() {
  // ===== THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== STATE =====
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ===== FORM STATE =====
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
    status: 'Active'
  });

  // ===== EDIT MODAL =====
  const [selectedCarForEdit, setSelectedCarForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ===== IMAGE STATE =====
  const [imagePreviews, setImagePreviews] = useState([]);

  // ===== SELECTION STATE =====
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // ===== TOAST & CONFIRM =====
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    message: '',
    onConfirm: null,
  });

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ===== SAMPLE DATA =====
  const sampleCars = [
    {
      id: 1,
      name: 'Toyota Land Cruiser',
      brand: 'Toyota',
      model: 'Prado',
      year: '2023',
      pricePerDay: '150,000',
      rating: 4.9,
      reviews: '234',
      description: 'Luxury SUV perfect for off-road adventures and family trips',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: '7',
      location: 'Yangon',
      images: [],
      status: 'Active',
      created_at: '2024-03-20'
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
      description: 'Comfortable SUV with great fuel efficiency and modern features',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: '5',
      location: 'Mandalay',
      images: [],
      status: 'Active',
      created_at: '2024-03-18'
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
      description: 'Compact and fuel-efficient car perfect for city driving',
      transmission: 'Manual',
      fuelType: 'Petrol',
      seats: '5',
      location: 'Naypyidaw',
      images: [],
      status: 'Inactive',
      created_at: '2024-03-15'
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
      description: 'Powerful pickup truck ideal for cargo and rough terrain',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: '5',
      location: 'Bagan',
      images: [],
      status: 'Active',
      created_at: '2024-03-25'
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
      description: 'Spacious SUV with advanced safety features',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: '7',
      location: 'Inle',
      images: [],
      status: 'Active',
      created_at: '2024-03-22'
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
      description: 'Economical compact car with easy handling',
      transmission: 'Manual',
      fuelType: 'Petrol',
      seats: '5',
      location: 'Yangon',
      images: [],
      status: 'Active',
      created_at: '2024-03-28'
    }
  ];

  // ===== LOAD & SAVE =====
  useEffect(() => {
    const stored = localStorage.getItem('carsData');
    if (stored) {
      try { setCars(JSON.parse(stored)); } 
      catch { setCars(sampleCars); }
    } else {
      setCars(sampleCars);
    }
  }, []);

  useEffect(() => {
    if (cars.length > 0) {
      localStorage.setItem('carsData', JSON.stringify(cars));
    }
  }, [cars]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // ===== DROPDOWN CLICK OUTSIDE =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== FORM HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ===== IMAGE UPLOAD =====
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const resetForm = () => {
    setFormData({
      carName: '', brand: '', model: '', year: '', pricePerDay: '',
      discount: '', description: '', transmission: '', fuelType: '',
      seats: '', location: '', status: 'Active'
    });
    setImagePreviews([]);
  };

  // ===== ADD =====
  const handleAddCar = () => {
    setLoading(true);
    try {
      if (!formData.carName || !formData.pricePerDay) {
        showToast('warning', 'Please fill in car name and price.');
        setLoading(false);
        return;
      }
      const newCar = {
        id: Date.now(),
        name: formData.carName.trim(),
        brand: formData.brand.trim() || 'Various',
        model: formData.model.trim() || 'Standard',
        year: formData.year.trim() || '2024',
        pricePerDay: formData.pricePerDay.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: imagePreviews.length > 0 ? imagePreviews : [],
        description: formData.description.trim() || 'No description provided.',
        transmission: formData.transmission || 'N/A',
        fuelType: formData.fuelType || 'N/A',
        seats: formData.seats.trim() || 'N/A',
        location: formData.location.trim() || 'N/A',
        status: formData.status || 'Active',
        created_at: new Date().toISOString().split('T')[0]
      };
      setCars([newCar, ...cars]);
      resetForm();
      showToast('success', 'Car added successfully!');
    } catch (err) {
      showToast('error', 'Failed to add car.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const performDeleteCar = (id) => {
    setCars(cars.filter(c => c.id !== id));
    if (selectedCarId === id) setSelectedCarId(null);
    showToast('success', 'Car deleted successfully!');
  };

  const handleDeleteCar = (id) => {
    setActiveDropdown(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this car?',
      onConfirm: () => performDeleteCar(id),
    });
  };

  // ===== EDIT =====
  const handleEditCar = (car) => {
    setSelectedCarForEdit(car);
    setFormData({
      carName: car.name || '',
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      pricePerDay: car.pricePerDay || '',
      discount: '',
      description: car.description || '',
      transmission: car.transmission || '',
      fuelType: car.fuelType || '',
      seats: car.seats || '',
      location: car.location || '',
      status: car.status || 'Active'
    });
    setImagePreviews(car.images || []);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmEdit = () => {
    setLoading(true);
    try {
      if (selectedCarForEdit && formData.carName) {
        const updatedCars = cars.map(c =>
          c.id === selectedCarForEdit.id ? {
            ...c,
            name: formData.carName.trim(),
            brand: formData.brand.trim() || c.brand,
            model: formData.model.trim() || c.model,
            year: formData.year.trim() || c.year,
            pricePerDay: formData.pricePerDay.replace(/[^0-9]/g, ''),
            description: formData.description.trim() || c.description,
            transmission: formData.transmission || c.transmission,
            fuelType: formData.fuelType || c.fuelType,
            seats: formData.seats.trim() || c.seats,
            location: formData.location.trim() || c.location,
            status: formData.status || c.status,
            images: imagePreviews.length > 0 ? imagePreviews : c.images
          } : c
        );
        setCars(updatedCars);
        setShowEditModal(false);
        setSelectedCarForEdit(null);
        resetForm();
        showToast('success', 'Car updated successfully!');
      }
    } catch (err) {
      showToast('error', 'Failed to update car.');
    } finally {
      setLoading(false);
    }
  };

  // ===== SELECTION =====
  const handleDeleteSelected = () => {
    if (!selectedCarId) {
      showToast('warning', 'Please select a car to delete');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this car?',
      onConfirm: () => {
        setCars(cars.filter(c => c.id !== selectedCarId));
        setSelectedCarId(null);
        showToast('success', 'Car deleted successfully!');
      },
    });
  };

  const handleEditSelected = () => {
    if (!selectedCarId) {
      showToast('warning', 'Please select a car to edit');
      return;
    }
    const carToEdit = cars.find(c => c.id === selectedCarId);
    if (carToEdit) handleEditCar(carToEdit);
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

  // ===== FILTER & SORT =====
  const filteredCars = cars.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortedCars = (list) => {
    const sorted = [...list];
    switch (sortBy) {
      case 'lifo': return sorted.sort((a, b) => b.id - a.id);
      case 'fifo': return sorted.sort((a, b) => a.id - b.id);
      case 'az': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'za': return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default: return sorted;
    }
  };
  const sortedCars = getSortedCars(filteredCars);

  // ===== STATS =====
  const total = cars.length;
  const active = cars.filter(c => c.status === 'Active').length;
  const inactive = cars.filter(c => c.status === 'Inactive').length;

  const getStatusStyle = (status) => {
    if (status === 'Active') return { backgroundColor: '#d1e7dd', color: '#0f5132' };
    return { backgroundColor: '#f8d7da', color: '#842029' };
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }}></i>}
        {[...Array(5 - Math.ceil(rating || 0))].map((_, i) => (
          <i key={i} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
      </>
    );
  };

  // ===== CARD ACTIONS =====
  const CardActions = ({ carId }) => {
    const isOpen = activeDropdown === carId;

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setActiveDropdown(isOpen ? null : carId);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      const car = cars.find(c => c.id === carId);
      if (car) handleEditCar(car);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      handleDeleteCar(carId);
    };

    return (
      <div className="card-actions-wrapper" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        <button className="card-actions-btn" onClick={toggleDropdown} style={{
          width: '32px', height: '32px', borderRadius: '50%', border: 'none',
          background: 'rgba(0,0,0,0.6)', color: 'white', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          cursor: 'pointer', backdropFilter: 'blur(4px)'
        }}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`} style={{
          position: 'absolute', top: '40px', right: '0',
          background: isDarkMode ? '#2d2d2d' : '#fff',
          borderRadius: '8px', boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          minWidth: '150px', padding: '4px 0',
          border: isDarkMode ? '1px solid #444' : '1px solid #ddd'
        }}>
          <button onClick={handleEdit} style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 16px', border: 'none', background: 'transparent',
            color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: '14px'
          }}>
            <i className="bi bi-pencil-square" style={{ color: '#0d6efd' }}></i> Edit
          </button>
          <button onClick={handleDelete} style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 16px', border: 'none', background: 'transparent',
            color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: '14px'
          }}>
            <i className="bi bi-trash" style={{ color: '#dc3545' }}></i> Delete
          </button>
        </div>
      </div>
    );
  };

  // ===== TOAST UI =====
  const ToastUI = () => {
    if (!toast.visible) return null;
    return (
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 999999, width: '420px', maxWidth: '90%', borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '0', overflow: 'hidden',
        backgroundColor: toast.type === 'success' ? (isDarkMode ? '#1e3a2e' : '#d4edda') :
                         toast.type === 'error' ? (isDarkMode ? '#3e1f1f' : '#f8d7da') :
                         toast.type === 'warning' ? (isDarkMode ? '#3d3512' : '#fff3cd') :
                         (isDarkMode ? '#112b3c' : '#d1ecf1'),
        color: toast.type === 'success' ? (isDarkMode ? '#b7eb8f' : '#155724') :
               toast.type === 'error' ? (isDarkMode ? '#ffa39e' : '#721c24') :
               toast.type === 'warning' ? (isDarkMode ? '#ffe58f' : '#856404') :
               (isDarkMode ? '#91d5ff' : '#0c5460'),
        borderLeft: `5px solid ${toast.type === 'success' ? (isDarkMode ? '#52c41a' : '#28a745') :
                                 toast.type === 'error' ? (isDarkMode ? '#ff4d4f' : '#dc3545') :
                                 toast.type === 'warning' ? (isDarkMode ? '#faad14' : '#ffc107') :
                                 (isDarkMode ? '#1890ff' : '#17a2b8')}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
          <button onClick={() => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); setToast({ ...toast, visible: false }); }} style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
          <div style={{ fontSize: '28px' }}>
            {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
            {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
            {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
            {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
          </div>
          <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{toast.message}</div>
        </div>
      </div>
    );
  };

  // ===== CONFIRM DIALOG UI =====
  const ConfirmDialogUI = () => {
    if (!confirmDialog.visible) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: isDarkMode ? '#2d2d2d' : '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: '12px' }}>Confirm Delete</h3>
          <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333' }}>Cancel</button>
            <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, visible: false }); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Cars Management" onThemeChange={handleThemeChange} />
      <ToastUI />
      <ConfirmDialogUI />

      {loading && <div style={{ textAlign: 'center', padding: '10px', background: isDarkMode ? '#333' : '#f0f0f0' }}>⏳ Processing...</div>}

      {/* Search & Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input type="text" placeholder="Search car..." className="search-input-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="action-btn delete-btn" onClick={handleDeleteSelected}><i className="bi bi-trash"></i> Delete</button>
        <button className="action-btn edit-btn-action" onClick={handleEditSelected}><i className="bi bi-pencil-square"></i> Edit</button>
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}><i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i></button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>Select All</button>
              <button onClick={() => { setSelectedCarId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
        <div className="sort-dropdown-wrapper">
          <button className="sort-btn" onClick={() => setShowSortDropdown(!showSortDropdown)}><i className="bi bi-arrow-down-up"></i> Sort: {sortBy.toUpperCase()} <i className="bi bi-chevron-down"></i></button>
          {showSortDropdown && (
            <div className="sort-dropdown-menu">
              <button onClick={() => { setSortBy('lifo'); setShowSortDropdown(false); }}>LIFO</button>
              <button onClick={() => { setSortBy('fifo'); setShowSortDropdown(false); }}>FIFO</button>
              <button onClick={() => { setSortBy('az'); setShowSortDropdown(false); }}>A-Z</button>
              <button onClick={() => { setSortBy('za'); setShowSortDropdown(false); }}>Z-A</button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-cards-row">
        <div className="stat-card-mini"><div className="stat-icon-mini total"><i className="bi bi-car-front"></i></div><div className="stat-info-mini"><h3>{total}</h3><p>Total</p></div></div>
        <div className="stat-card-mini"><div className="stat-icon-mini active"><i className="bi bi-check-circle-fill"></i></div><div className="stat-info-mini"><h3>{active}</h3><p>Active</p></div></div>
        <div className="stat-card-mini"><div className="stat-icon-mini inactive"><i className="bi bi-x-circle-fill"></i></div><div className="stat-info-mini"><h3>{inactive}</h3><p>Inactive</p></div></div>
      </div>

      {/* Two Columns */}
      <div className="hotels-two-columns">
        {/* Left - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="image-gallery-top">
              <label className="gallery-label">📸 Images</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload-gallery" />
                  <label htmlFor="image-upload-gallery" className="upload-box"><i className="bi bi-plus-lg"></i><span>Add Image</span></label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {imagePreviews.map((img, i) => (
                    <div key={i} className="image-item"><img src={img} alt="" /><button className="remove-image-btn" onClick={() => removeImage(i)}><i className="bi bi-x-lg"></i></button></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              <div className="add-form-group"><label>Car Name *</label><input type="text" name="carName" placeholder="Toyota" value={formData.carName} onChange={handleInputChange} /></div>
              <div className="add-form-row"><div className="add-form-group half"><label>Brand</label><input type="text" name="brand" placeholder="Toyota" value={formData.brand} onChange={handleInputChange} /></div><div className="add-form-group half"><label>Model</label><input type="text" name="model" placeholder="Prado" value={formData.model} onChange={handleInputChange} /></div></div>
              <div className="add-form-row"><div className="add-form-group half"><label>Year</label><input type="text" name="year" placeholder="2023" value={formData.year} onChange={handleInputChange} /></div><div className="add-form-group half"><label>Price (MMK) *</label><input type="text" name="pricePerDay" placeholder="150000" value={formData.pricePerDay} onChange={handleInputChange} /></div></div>
              <div className="add-form-row"><div className="add-form-group half"><label>Discount</label><input type="text" name="discount" placeholder="10" value={formData.discount} onChange={handleInputChange} /></div><div className="add-form-group half"><label>Seats</label><input type="text" name="seats" placeholder="5" value={formData.seats} onChange={handleInputChange} /></div></div>
              <div className="add-form-row"><div className="add-form-group half"><label>Transmission</label><select name="transmission" value={formData.transmission} onChange={handleInputChange}><option value="">Select</option><option value="Automatic">Automatic</option><option value="Manual">Manual</option></select></div><div className="add-form-group half"><label>Fuel</label><select name="fuelType" value={formData.fuelType} onChange={handleInputChange}><option value="">Select</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option></select></div></div>
              <div className="add-form-group"><label>Location</label><input type="text" name="location" placeholder="Yangon" value={formData.location} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Status</label><select name="status" value={formData.status} onChange={handleInputChange}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              <div className="add-form-group"><label>Description</label><textarea name="description" rows="2" placeholder="Describe the car..." value={formData.description} onChange={handleInputChange} /></div>
              <button className="add-item-btn-full" onClick={handleAddCar} disabled={loading}>{loading ? 'Adding...' : 'Add Car'}</button>
            </div>
          </div>
        </div>

        {/* Right - Car Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedCars.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6c757d' }}><i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block' }}></i><p>No cars found.</p></div>
              ) : (
                sortedCars.map(car => (
                  <div key={car.id} className="hotel-card-vertical" style={{ borderLeft: `4px solid ${car.status === 'Active' ? '#28a745' : '#dc3545'}` }}>
                    <div className="hotel-card-image" style={{ position: 'relative', minHeight: '150px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa' }}>
                      <div className="image-slider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                        {car.images && car.images.length > 0 ? <img src={car.images[0]} alt={car.name} style={{ objectFit: 'cover', width: '100%', height: '100%', maxHeight: '150px' }} /> : <div style={{ fontSize: '60px', padding: '20px' }}>🚗</div>}
                      </div>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', ...getStatusStyle(car.status) }}>{car.status}</div>
                      <CardActions carId={car.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name" style={{ fontSize: '16px' }}>{car.name}</h3>
                      <p className="hotel-location"><i className="bi bi-geo-alt-fill"></i> {car.location}</p>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#6c757d', flexWrap: 'wrap' }}><span>{car.brand} {car.model}</span><span>| {car.year}</span><span>| {car.transmission}</span><span>| {car.fuelType}</span></div>
                      <p className="hotel-price">Per Day <span>MMK {car.pricePerDay}</span></p>
                      <div className="hotel-rating">{renderStars(car.rating)}<span className="rating-count">({car.reviews})</span></div>
                      <p style={{ fontSize: '11px', color: '#999' }}><i className="bi bi-clock"></i> Added: {car.created_at}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit Car</h2><button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button></div>
            <div className="modal-body">
              {/* Image Gallery - TOP */}
              <div className="image-gallery-top">
                <label className="gallery-label">📸 Images (Upload new to replace)</label>
                <div className="image-gallery-wrapper">
                  <div className="image-upload-box">
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="edit-image-upload" />
                    <label htmlFor="edit-image-upload" className="upload-box"><i className="bi bi-plus-lg"></i><span>Add Image</span></label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {imagePreviews.map((img, i) => (
                      <div key={i} className="image-item"><img src={img} alt="" /><button className="remove-image-btn" onClick={() => removeImage(i)}><i className="bi bi-x-lg"></i></button></div>
                    ))}
                  </div>
                </div>
                <small style={{ opacity: 0.7, display: 'block', marginTop: '5px' }}>⚡ Upload new to replace. Leave empty to keep current.</small>
              </div>

              {/* Form Fields */}
              <div className="form-group"><label>Car Name *</label><input type="text" name="carName" value={formData.carName} onChange={handleInputChange} /></div>
              <div className="form-row"><div className="form-group"><label>Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleInputChange} /></div><div className="form-group"><label>Model</label><input type="text" name="model" value={formData.model} onChange={handleInputChange} /></div></div>
              <div className="form-row"><div className="form-group"><label>Year</label><input type="text" name="year" value={formData.year} onChange={handleInputChange} /></div><div className="form-group"><label>Price (MMK)</label><input type="text" name="pricePerDay" value={formData.pricePerDay} onChange={handleInputChange} /></div></div>
              <div className="form-row"><div className="form-group"><label>Discount</label><input type="text" name="discount" value={formData.discount} onChange={handleInputChange} /></div><div className="form-group"><label>Seats</label><input type="text" name="seats" value={formData.seats} onChange={handleInputChange} /></div></div>
              <div className="form-row"><div className="form-group"><label>Transmission</label><select name="transmission" value={formData.transmission} onChange={handleInputChange}><option value="">Select</option><option value="Automatic">Automatic</option><option value="Manual">Manual</option></select></div><div className="form-group"><label>Fuel</label><select name="fuelType" value={formData.fuelType} onChange={handleInputChange}><option value="">Select</option><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option></select></div></div>
              <div className="form-group"><label>Location</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Status</label><select name="status" value={formData.status} onChange={handleInputChange}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              <div className="form-group"><label>Description</label><textarea name="description" rows="2" value={formData.description} onChange={handleInputChange} /></div>
            </div>
            <div className="modal-footer"><button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button><button className="add-item-btn" onClick={handleConfirmEdit} disabled={loading}>{loading ? 'Updating...' : 'Confirm Edit'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cars;