import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function HorseCarts() {
  // ===== THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== STATE =====
  const [horseCarts, setHorseCarts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ===== FORM STATE =====
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
    status: 'Active',
  });

  // ===== EDIT MODAL =====
  const [selectedCartForEdit, setSelectedCartForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ===== IMAGE STATE =====
  const [imagePreviews, setImagePreviews] = useState([]);

  // ===== DROPDOWN STATE =====
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // ===== SELECTION STATE =====
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [showAllDropdown, setShowAllDropdown] = useState(false);

  // ===== SAMPLE DATA =====
  const sampleCarts = [
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
      images: [],
      description: 'Authentic horse cart experience through ancient Bagan temples',
      features: 'Traditional wooden cart, experienced local driver, decorative canopy',
      route: 'Old Bagan Temple Circuit',
      location: 'Old Bagan',
      contactNumber: '09-123456789',
      status: 'Active',
      created_at: '2024-03-20'
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
      images: [],
      description: 'Romantic sunset tour to the best viewing spots in Bagan',
      features: 'Comfortable seating, blankets, sunset guide map, photo stops',
      route: 'Sunset Viewing Points Tour',
      location: 'New Bagan',
      contactNumber: '09-987654321',
      status: 'Active',
      created_at: '2024-03-18'
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
      images: [],
      description: 'Spacious cart perfect for families with children',
      features: 'Child seats, sunshade, snack basket, activity books for kids',
      route: 'Family-Friendly Temple Tour',
      location: 'Nyaung U',
      contactNumber: '09-456789123',
      status: 'Inactive',
      created_at: '2024-03-15'
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
      images: [],
      description: 'Deluxe horse cart with premium amenities and private guide',
      features: 'Leather seats, refreshments, professional guide, camera service',
      route: 'Custom Private Tours',
      location: 'Old Bagan',
      contactNumber: '09-234567890',
      status: 'Active',
      created_at: '2024-03-25'
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
      images: [],
      description: 'Explore hidden temples and local villages off the beaten path',
      features: 'Cultural insights, local village visits, traditional snack tasting',
      route: 'Cultural Heritage Route',
      location: 'Myinkaba Village',
      contactNumber: '09-345678901',
      status: 'Active',
      created_at: '2024-03-22'
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
      images: [],
      description: 'Comprehensive full-day tour covering major temples and pagodas',
      features: 'Lunch included, water bottles, temple information guide',
      route: 'Complete Bagan Temple Circuit',
      location: 'Bagan',
      contactNumber: '09-567890123',
      status: 'Active',
      created_at: '2024-03-28'
    }
  ];

  // ===== LOAD FROM LOCALSTORAGE =====
  useEffect(() => {
    const stored = localStorage.getItem('horseCartsData');
    if (stored) {
      try {
        setHorseCarts(JSON.parse(stored));
      } catch {
        setHorseCarts(sampleCarts);
      }
    } else {
      setHorseCarts(sampleCarts);
    }
  }, []);

  // ===== SAVE TO LOCALSTORAGE =====
  useEffect(() => {
    if (horseCarts.length > 0) {
      localStorage.setItem('horseCartsData', JSON.stringify(horseCarts));
    }
  }, [horseCarts]);

  // ===== THEME EFFECT =====
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

  // ===== IMAGE UPLOAD (multiple) =====
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

  // ===== RESET FORM =====
  const resetForm = () => {
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
      status: 'Active',
    });
    setImagePreviews([]);
  };

  // ===== ADD CART =====
  const handleAddCart = () => {
    setLoading(true);
    try {
      if (!formData.cartName || !formData.pricePerHour) {
        showToast('warning', 'Please fill in cart name and price per hour.');
        setLoading(false);
        return;
      }

      const newCart = {
        id: Date.now(),
        name: formData.cartName.trim(),
        type: formData.type || 'Standard',
        capacity: formData.capacity.trim() || '4 passengers',
        pricePerHour: formData.pricePerHour.replace(/[^0-9]/g, ''),
        pricePerDay: formData.pricePerDay ? formData.pricePerDay.replace(/[^0-9]/g, '') : '',
        pricePerTour: formData.pricePerTour ? formData.pricePerTour.replace(/[^0-9]/g, '') : '',
        rating: 4.5,
        reviews: '0',
        images: imagePreviews.length > 0 ? imagePreviews : [],
        description: formData.description.trim() || 'No description provided.',
        features: formData.features.trim() || '',
        route: formData.route.trim() || '',
        location: formData.location.trim() || 'N/A',
        contactNumber: formData.contactNumber.trim() || '',
        status: formData.status || 'Active',
        created_at: new Date().toISOString().split('T')[0],
      };

      setHorseCarts([newCart, ...horseCarts]);
      resetForm();
      showToast('success', 'Horse Cart added successfully!');
    } catch (err) {
      showToast('error', 'Failed to add horse cart.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const performDeleteCart = (id) => {
    setHorseCarts(horseCarts.filter(c => c.id !== id));
    showToast('success', 'Horse Cart deleted successfully!');
  };

  const handleDeleteCart = (id) => {
    setActiveDropdown(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this horse cart?',
      onConfirm: () => performDeleteCart(id),
    });
  };

  // ===== EDIT =====
  const handleEditCart = (cart) => {
    setSelectedCartForEdit(cart);
    setFormData({
      cartName: cart.name || '',
      type: cart.type || '',
      capacity: cart.capacity || '',
      pricePerHour: cart.pricePerHour || '',
      pricePerDay: cart.pricePerDay || '',
      pricePerTour: cart.pricePerTour || '',
      discount: '',
      description: cart.description || '',
      features: cart.features || '',
      route: cart.route || '',
      location: cart.location || '',
      contactNumber: cart.contactNumber || '',
      status: cart.status || 'Active',
    });
    setImagePreviews(cart.images || []);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  // ===== CONFIRM EDIT =====
  const handleConfirmEdit = () => {
    setLoading(true);
    try {
      if (selectedCartForEdit && formData.cartName) {
        const updatedCarts = horseCarts.map(c =>
          c.id === selectedCartForEdit.id
            ? {
                ...c,
                name: formData.cartName.trim(),
                type: formData.type || c.type,
                capacity: formData.capacity.trim() || c.capacity,
                pricePerHour: formData.pricePerHour.replace(/[^0-9]/g, ''),
                pricePerDay: formData.pricePerDay ? formData.pricePerDay.replace(/[^0-9]/g, '') : c.pricePerDay,
                pricePerTour: formData.pricePerTour ? formData.pricePerTour.replace(/[^0-9]/g, '') : c.pricePerTour,
                description: formData.description.trim() || c.description,
                features: formData.features.trim() || c.features,
                route: formData.route.trim() || c.route,
                location: formData.location.trim() || c.location,
                contactNumber: formData.contactNumber.trim() || c.contactNumber,
                status: formData.status || c.status,
                images: imagePreviews.length > 0 ? imagePreviews : c.images
              }
            : c
        );
        setHorseCarts(updatedCarts);
        setShowEditModal(false);
        setSelectedCartForEdit(null);
        resetForm();
        showToast('success', 'Horse Cart updated successfully!');
      }
    } catch (err) {
      showToast('error', 'Failed to update horse cart.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE SELECTED (Top Button) =====
  const handleDeleteSelected = () => {
    if (!selectedCartId) {
      showToast('warning', 'Please select a horse cart to delete');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this horse cart?',
      onConfirm: () => {
        setHorseCarts(horseCarts.filter(c => c.id !== selectedCartId));
        setSelectedCartId(null);
        showToast('success', 'Horse Cart deleted successfully!');
      },
    });
  };

  const handleEditSelected = () => {
    if (!selectedCartId) {
      showToast('warning', 'Please select a horse cart to edit');
      return;
    }
    const cartToEdit = horseCarts.find(c => c.id === selectedCartId);
    if (cartToEdit) {
      handleEditCart(cartToEdit);
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

  // ===== SORTING =====
  const getSortedCarts = (list) => {
    const sorted = [...list];
    switch (sortBy) {
      case 'lifo': return sorted.sort((a, b) => b.id - a.id);
      case 'fifo': return sorted.sort((a, b) => a.id - b.id);
      case 'az': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'za': return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default: return sorted;
    }
  };

  // ===== FILTER =====
  const filteredCarts = horseCarts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCarts = getSortedCarts(filteredCarts);

  // ===== STATS =====
  const total = horseCarts.length;
  const active = horseCarts.filter(c => c.status === 'Active').length;
  const inactive = horseCarts.filter(c => c.status === 'Inactive').length;

  // ===== STATUS BADGE =====
  const getStatusStyle = (status) => {
    if (status === 'Active') {
      return { backgroundColor: '#d1e7dd', color: '#0f5132' };
    }
    return { backgroundColor: '#f8d7da', color: '#842029' };
  };

  // ===== RATING STARS =====
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

  // ===== CARD ACTIONS (Dropdown) =====
  const CardActions = ({ cartId }) => {
    const isOpen = activeDropdown === cartId;

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setActiveDropdown(isOpen ? null : cartId);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      const cart = horseCarts.find(c => c.id === cartId);
      if (cart) handleEditCart(cart);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      handleDeleteCart(cartId);
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
          <button className="edit-btn" onClick={handleEdit} style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 16px', border: 'none', background: 'transparent',
            color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: '14px'
          }}>
            <i className="bi bi-pencil-square" style={{ color: '#0d6efd' }}></i> Edit
          </button>
          <button className="delete-btn" onClick={handleDelete} style={{
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

  // ===== LOADING =====
  if (loading && horseCarts.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Horse Carts Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
          <p>Loading horse carts...</p>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Horse Carts Management" onThemeChange={handleThemeChange} />

      {/* Toast */}
      {toast.visible && (
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
      )}

      {/* Confirm Dialog */}
      {confirmDialog.visible && (
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
      )}

      {/* Loading Indicator */}
      {loading && <div style={{ textAlign: 'center', padding: '10px', background: isDarkMode ? '#333' : '#f0f0f0' }}>⏳ Processing...</div>}

      {/* Search & Sort Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by name, type, location, route..."
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
              <button onClick={handleSelectAll}>Select All</button>
              <button onClick={() => { setSelectedCartId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>

        <div className="sort-dropdown-wrapper">
          <button className="sort-btn" onClick={() => setShowSortDropdown(!showSortDropdown)}>
            <i className="bi bi-arrow-down-up"></i> Sort: {sortBy.toUpperCase()} <i className="bi bi-chevron-down"></i>
          </button>
          {showSortDropdown && (
            <div className="sort-dropdown-menu">
              <button onClick={() => { setSortBy('lifo'); setShowSortDropdown(false); }}><i className="bi bi-arrow-up-circle"></i> Last In, First Out (LIFO)</button>
              <button onClick={() => { setSortBy('fifo'); setShowSortDropdown(false); }}><i className="bi bi-arrow-down-circle"></i> First In, First Out (FIFO)</button>
              <button onClick={() => { setSortBy('az'); setShowSortDropdown(false); }}><i className="bi bi-sort-alpha-down"></i> Alphabetical (A-Z)</button>
              <button onClick={() => { setSortBy('za'); setShowSortDropdown(false); }}><i className="bi bi-sort-alpha-up"></i> Alphabetical (Z-A)</button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards-row">
        <div className="stat-card-mini">
          <div className="stat-icon-mini total"><i className="bi bi-box-seam"></i></div>
          <div className="stat-info-mini"><h3>{total}</h3><p>Total Carts</p></div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini active"><i className="bi bi-check-circle-fill"></i></div>
          <div className="stat-info-mini"><h3>{active}</h3><p>Active</p></div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini inactive"><i className="bi bi-x-circle-fill"></i></div>
          <div className="stat-info-mini"><h3>{inactive}</h3><p>Inactive</p></div>
        </div>
        <div className="stat-card-mini" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#bbb' }}>
            <i className="bi bi-info-circle" style={{ fontSize: '20px' }}></i>
            <span style={{ fontSize: '13px' }}>Sorting: <strong>{sortBy.toUpperCase()}</strong> — {sortBy === 'lifo' ? 'Newest first' : sortBy === 'fifo' ? 'Oldest first' : 'Sorted by name'}</span>
          </div>
        </div>
      </div>

      {/* Two Columns Layout */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery */}
            <div className="image-gallery-top">
              <label className="gallery-label">📸 Images (Optional)</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
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
                  {imagePreviews.map((img, index) => (
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

            {/* Form Fields */}
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Horse Cart Name *</label>
                <input type="text" name="cartName" placeholder="eg. Bagan Heritage Cart" value={formData.cartName} onChange={handleInputChange} />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
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
                  <input type="text" name="capacity" placeholder="eg. 4 passengers" value={formData.capacity} onChange={handleInputChange} />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price Per Hour (MMK) *</label>
                  <input type="text" name="pricePerHour" placeholder="eg. 25000" value={formData.pricePerHour} onChange={handleInputChange} />
                </div>
                <div className="add-form-group half">
                  <label>Price Per Day (MMK)</label>
                  <input type="text" name="pricePerDay" placeholder="eg. 120000" value={formData.pricePerDay} onChange={handleInputChange} />
                </div>
              </div>

              <div className="add-form-group">
                <label>Price Per Tour (MMK)</label>
                <input type="text" name="pricePerTour" placeholder="eg. 35000" value={formData.pricePerTour} onChange={handleInputChange} />
              </div>

              <div className="add-form-group">
                <label>Discount %</label>
                <input type="text" name="discount" placeholder="eg. 10" value={formData.discount} onChange={handleInputChange} />
              </div>

              <div className="add-form-group">
                <label>Route / Tour Path</label>
                <input type="text" name="route" placeholder="eg. Old Bagan Temple Circuit" value={formData.route} onChange={handleInputChange} />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Location</label>
                  <input type="text" name="location" placeholder="eg. Old Bagan" value={formData.location} onChange={handleInputChange} />
                </div>
                <div className="add-form-group half">
                  <label>Contact Number</label>
                  <input type="text" name="contactNumber" placeholder="eg. 09-123456789" value={formData.contactNumber} onChange={handleInputChange} />
                </div>
              </div>

              <div className="add-form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="add-form-group">
                <label>Features</label>
                <textarea name="features" rows="2" placeholder="Traditional wooden cart, experienced local driver..." value={formData.features} onChange={handleInputChange} />
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Describe the horse cart experience..." value={formData.description} onChange={handleInputChange} />
              </div>

              <button className="add-item-btn-full" onClick={handleAddCart} disabled={loading}>
                {loading ? 'Adding...' : 'Add Horse Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Horse Cart Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedCarts.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6c757d' }}>
                  <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No horse carts found. Add one using the form on the left.</p>
                </div>
              ) : (
                sortedCarts.map((cart) => (
                  <div key={cart.id} className="hotel-card-vertical" style={{ borderLeft: `4px solid ${cart.status === 'Active' ? '#28a745' : '#dc3545'}` }}>
                    <div className="hotel-card-image" style={{ position: 'relative', minHeight: '150px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa' }}>
                      <div className="image-slider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                        {cart.images && cart.images.length > 0 ? (
                          <img src={cart.images[0]} alt={cart.name} style={{ objectFit: 'cover', width: '100%', height: '100%', maxHeight: '150px' }} />
                        ) : (
                          <div style={{ fontSize: '60px', padding: '20px' }}>🐎</div>
                        )}
                      </div>
                      {/* Status Badge - Left Top */}
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '600', ...getStatusStyle(cart.status)
                      }}>
                        {cart.status}
                      </div>
                      <CardActions cartId={cart.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name" style={{ fontSize: '16px' }}>{cart.name}</h3>
                      <div className="cart-type">
                        <span className="type-badge" style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', background: '#e9ecef', fontSize: '12px', color: '#495057' }}>{cart.type}</span>
                      </div>
                      <p className="hotel-location"><i className="bi bi-geo-alt-fill"></i> {cart.location}</p>
                      <div className="cart-details" style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6c757d', flexWrap: 'wrap' }}>
                        <span><i className="bi bi-people"></i> {cart.capacity}</span>
                        <span><i className="bi bi-signpost"></i> {cart.route}</span>
                      </div>
                      <div className="cart-pricing" style={{ fontSize: '13px', marginTop: '4px' }}>
                        <span className="price-hour" style={{ display: 'inline-block', marginRight: '8px' }}>Hour: MMK {cart.pricePerHour}</span>
                        {cart.pricePerDay && <span className="price-day" style={{ display: 'inline-block', marginRight: '8px' }}>Day: MMK {cart.pricePerDay}</span>}
                        {cart.pricePerTour && <span className="price-tour" style={{ display: 'inline-block' }}>Tour: MMK {cart.pricePerTour}</span>}
                      </div>
                      {cart.features && (
                        <p className="features" style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                          <i className="bi bi-star"></i> {cart.features.substring(0, 60)}...
                        </p>
                      )}
                      <div className="hotel-rating">
                        {renderStars(cart.rating)}
                        <span className="rating-count">({cart.reviews})</span>
                      </div>
                      {cart.contactNumber && (
                        <p className="contact-info" style={{ fontSize: '12px', color: '#6c757d' }}>
                          <i className="bi bi-telephone"></i> {cart.contactNumber}
                        </p>
                      )}
                      <p style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                        <i className="bi bi-clock"></i> Added: {cart.created_at}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ===== EDIT MODAL (IMAGE GALLERY ကို ထိပ်ဆုံးမှာ ထည့်ထားပါတယ်) ===== */}
      {/* ========================================================= */}
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
              {/* ⭐ EDIT MODAL ထဲမှာ ပထမဆုံး Image Gallery ကို ထည့်ထားပါတယ် */}
              <div className="image-gallery-top">
                <label className="gallery-label">📸 Images (Upload new to replace)</label>
                <div className="image-gallery-wrapper">
                  <div className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="upload-box">
                      <i className="bi bi-plus-lg"></i>
                      <span>Add Image</span>
                    </label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {imagePreviews.map((img, index) => (
                      <div key={index} className="image-item">
                        <img src={img} alt={`Preview ${index}`} />
                        <button className="remove-image-btn" onClick={() => removeImage(index)}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <small style={{ opacity: 0.7, display: 'block', marginTop: '5px' }}>
                  ⚡ Upload new images to replace existing ones. Leave empty to keep current images.
                </small>
              </div>

              {/* ကျန်တဲ့ Form Fields တွေ */}
              <div className="form-group">
                <label>Horse Cart Name *</label>
                <input type="text" name="cartName" value={formData.cartName} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
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
                  <input type="text" name="capacity" value={formData.capacity} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Hour (MMK)</label>
                  <input type="text" name="pricePerHour" value={formData.pricePerHour} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Price Per Day (MMK)</label>
                  <input type="text" name="pricePerDay" value={formData.pricePerDay} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Price Per Tour (MMK)</label>
                <input type="text" name="pricePerTour" value={formData.pricePerTour} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Discount %</label>
                <input type="text" name="discount" value={formData.discount} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Route / Tour Path</label>
                <input type="text" name="route" value={formData.route} onChange={handleInputChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Features</label>
                <textarea name="features" rows="2" value={formData.features} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
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

export default HorseCarts;