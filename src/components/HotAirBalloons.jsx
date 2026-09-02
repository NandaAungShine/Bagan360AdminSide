import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function HotAirBalloons() {
  // ===== THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== STATE =====
  const [balloons, setBalloons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    name: '',
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
    status: 'Active'
  });

  // ===== EDIT MODAL =====
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ===== IMAGE STATE =====
  const [imagePreviews, setImagePreviews] = useState([]);

  // ===== SELECTION STATE =====
  const [selectedId, setSelectedId] = useState(null);
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
  const sampleData = [
    {
      id: 1,
      name: 'Balloons Over Bagan',
      company: 'Balloons Over Bagan',
      capacity: '8-12 persons',
      duration: '45-60 minutes',
      price: '380,000',
      rating: 4.9,
      reviews: '2.5K',
      images: [],
      description: 'Experience the breathtaking sunrise over thousands of ancient temples in Bagan',
      flightTimes: '5:30 AM - 7:30 AM (Sunrise Flight)',
      season: 'October - April',
      location: 'Old Bagan',
      includes: 'Hotel transfer, breakfast, souvenir certificate',
      status: 'Active',
      created_at: '2024-03-20'
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
      images: [],
      description: 'Luxury hot air balloon experience with champagne breakfast',
      flightTimes: '5:30 AM - 7:00 AM',
      season: 'October - April',
      location: 'New Bagan',
      includes: 'Champagne breakfast, flight certificate, photos',
      status: 'Active',
      created_at: '2024-03-18'
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
      images: [],
      description: 'Spectacular views of Bagan archaeological zone at sunrise',
      flightTimes: '5:45 AM - 7:15 AM',
      season: 'November - March',
      location: 'Nyaung U',
      includes: 'Hotel pickup, light breakfast, flight certificate',
      status: 'Inactive',
      created_at: '2024-03-15'
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
      images: [],
      description: 'Intimate ballooning experience with small groups',
      flightTimes: '5:30 AM - 7:00 AM',
      season: 'October - April',
      location: 'Old Bagan',
      includes: 'Morning tea, snacks, digital photos',
      status: 'Active',
      created_at: '2024-03-25'
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
      images: [],
      description: 'Affordable hot air balloon ride with great views',
      flightTimes: '6:00 AM - 7:30 AM',
      season: 'December - March',
      location: 'New Bagan',
      includes: 'Basic breakfast, hotel transfer',
      status: 'Active',
      created_at: '2024-03-22'
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
      images: [],
      description: 'Exclusive premium experience with extended flight time',
      flightTimes: '5:30 AM - 7:45 AM',
      season: 'October - April',
      location: 'Old Bagan',
      includes: 'Gourmet breakfast, premium drinks, professional photos, souvenir video',
      status: 'Active',
      created_at: '2024-03-28'
    }
  ];

  // ===== LOAD & SAVE =====
  useEffect(() => {
    const stored = localStorage.getItem('hotAirBalloonsData');
    if (stored) {
      try { setBalloons(JSON.parse(stored)); } 
      catch { setBalloons(sampleData); }
    } else {
      setBalloons(sampleData);
    }
  }, []);

  useEffect(() => {
    if (balloons.length > 0) {
      localStorage.setItem('hotAirBalloonsData', JSON.stringify(balloons));
    }
  }, [balloons]);

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
      name: '', company: '', capacity: '', duration: '', price: '',
      discount: '', description: '', flightTimes: '', season: '',
      location: '', includes: '', status: 'Active'
    });
    setImagePreviews([]);
  };

  // ===== ADD =====
  const handleAdd = () => {
    setLoading(true);
    try {
      if (!formData.name || !formData.price) {
        showToast('warning', 'Please fill in name and price.');
        setLoading(false);
        return;
      }
      const newItem = {
        id: Date.now(),
        name: formData.name.trim(),
        company: formData.company.trim() || 'Various',
        capacity: formData.capacity.trim() || 'N/A',
        duration: formData.duration.trim() || 'N/A',
        price: formData.price.replace(/[^0-9]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: imagePreviews.length > 0 ? imagePreviews : [],
        description: formData.description.trim() || 'No description provided.',
        flightTimes: formData.flightTimes.trim() || 'N/A',
        season: formData.season.trim() || 'N/A',
        location: formData.location.trim() || 'N/A',
        includes: formData.includes.trim() || 'None',
        status: formData.status || 'Active',
        created_at: new Date().toISOString().split('T')[0]
      };
      setBalloons([newItem, ...balloons]);
      resetForm();
      showToast('success', 'Balloon added successfully!');
    } catch (err) {
      showToast('error', 'Failed to add balloon.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const performDelete = (id) => {
    setBalloons(balloons.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    showToast('success', 'Balloon deleted successfully!');
  };

  const handleDelete = (id) => {
    setActiveDropdown(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this balloon?',
      onConfirm: () => performDelete(id),
    });
  };

  // ===== EDIT =====
  const handleEdit = (item) => {
    setSelectedForEdit(item);
    setFormData({
      name: item.name || '',
      company: item.company || '',
      capacity: item.capacity || '',
      duration: item.duration || '',
      price: item.price || '',
      discount: '',
      description: item.description || '',
      flightTimes: item.flightTimes || '',
      season: item.season || '',
      location: item.location || '',
      includes: item.includes || '',
      status: item.status || 'Active'
    });
    setImagePreviews(item.images || []);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmEdit = () => {
    setLoading(true);
    try {
      if (selectedForEdit && formData.name) {
        const updated = balloons.map(c =>
          c.id === selectedForEdit.id ? {
            ...c,
            name: formData.name.trim(),
            company: formData.company.trim() || c.company,
            capacity: formData.capacity.trim() || c.capacity,
            duration: formData.duration.trim() || c.duration,
            price: formData.price.replace(/[^0-9]/g, ''),
            description: formData.description.trim() || c.description,
            flightTimes: formData.flightTimes.trim() || c.flightTimes,
            season: formData.season.trim() || c.season,
            location: formData.location.trim() || c.location,
            includes: formData.includes.trim() || c.includes,
            status: formData.status || c.status,
            images: imagePreviews.length > 0 ? imagePreviews : c.images
          } : c
        );
        setBalloons(updated);
        setShowEditModal(false);
        setSelectedForEdit(null);
        resetForm();
        showToast('success', 'Balloon updated successfully!');
      }
    } catch (err) {
      showToast('error', 'Failed to update balloon.');
    } finally {
      setLoading(false);
    }
  };

  // ===== SELECTION =====
  const handleDeleteSelected = () => {
    if (!selectedId) {
      showToast('warning', 'Please select an item to delete');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this balloon?',
      onConfirm: () => {
        setBalloons(balloons.filter(c => c.id !== selectedId));
        setSelectedId(null);
        showToast('success', 'Balloon deleted successfully!');
      },
    });
  };

  const handleEditSelected = () => {
    if (!selectedId) {
      showToast('warning', 'Please select an item to edit');
      return;
    }
    const item = balloons.find(c => c.id === selectedId);
    if (item) handleEdit(item);
  };

  const handleSelectAll = () => {
    if (selectedId === 'all') {
      setSelectedId(null);
    } else {
      setSelectedId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleSelection = (id) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  // ===== FILTER & SORT =====
  const filtered = balloons.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSorted = (list) => {
    const sorted = [...list];
    switch (sortBy) {
      case 'lifo': return sorted.sort((a, b) => b.id - a.id);
      case 'fifo': return sorted.sort((a, b) => a.id - b.id);
      case 'az': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'za': return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default: return sorted;
    }
  };
  const sortedItems = getSorted(filtered);

  // ===== STATS =====
  const total = balloons.length;
  const active = balloons.filter(c => c.status === 'Active').length;
  const inactive = balloons.filter(c => c.status === 'Inactive').length;

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
  const CardActions = ({ id }) => {
    const isOpen = activeDropdown === id;

    const toggleDropdown = (e) => {
      e.stopPropagation();
      setActiveDropdown(isOpen ? null : id);
    };

    const handleEditAction = (e) => {
      e.stopPropagation();
      const item = balloons.find(c => c.id === id);
      if (item) handleEdit(item);
    };

    const handleDeleteAction = (e) => {
      e.stopPropagation();
      handleDelete(id);
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
          <button onClick={handleEditAction} style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 16px', border: 'none', background: 'transparent',
            color: isDarkMode ? '#eee' : '#333', cursor: 'pointer', fontSize: '14px'
          }}>
            <i className="bi bi-pencil-square" style={{ color: '#0d6efd' }}></i> Edit
          </button>
          <button onClick={handleDeleteAction} style={{
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
      <Header title="Hot Air Balloons Management" onThemeChange={handleThemeChange} />
      <ToastUI />
      <ConfirmDialogUI />

      {loading && <div style={{ textAlign: 'center', padding: '10px', background: isDarkMode ? '#333' : '#f0f0f0' }}>⏳ Processing...</div>}

      {/* Search & Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input type="text" placeholder="Search balloon..." className="search-input-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="action-btn delete-btn" onClick={handleDeleteSelected}><i className="bi bi-trash"></i> Delete</button>
        <button className="action-btn edit-btn-action" onClick={handleEditSelected}><i className="bi bi-pencil-square"></i> Edit</button>
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}><i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i></button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={handleSelectAll}>Select All</button>
              <button onClick={() => { setSelectedId(null); setShowAllDropdown(false); }}>Deselect All</button>
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
        <div className="stat-card-mini"><div className="stat-icon-mini total"><i className="bi bi-circle"></i></div><div className="stat-info-mini"><h3>{total}</h3><p>Total</p></div></div>
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
              <div className="add-form-group"><label>Name *</label><input type="text" name="name" placeholder="Balloons Over Bagan" value={formData.name} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Company</label><input type="text" name="company" placeholder="Balloons Over Bagan" value={formData.company} onChange={handleInputChange} /></div>
              <div className="add-form-row"><div className="add-form-group half"><label>Capacity</label><input type="text" name="capacity" placeholder="8-12 persons" value={formData.capacity} onChange={handleInputChange} /></div><div className="add-form-group half"><label>Duration</label><input type="text" name="duration" placeholder="45-60 min" value={formData.duration} onChange={handleInputChange} /></div></div>
              <div className="add-form-row"><div className="add-form-group half"><label>Price (MMK) *</label><input type="text" name="price" placeholder="380000" value={formData.price} onChange={handleInputChange} /></div><div className="add-form-group half"><label>Discount</label><input type="text" name="discount" placeholder="10" value={formData.discount} onChange={handleInputChange} /></div></div>
              <div className="add-form-group"><label>Flight Times</label><input type="text" name="flightTimes" placeholder="5:30 AM - 7:30 AM" value={formData.flightTimes} onChange={handleInputChange} /></div>
              <div className="add-form-row"><div className="add-form-group half"><label>Season</label><input type="text" name="season" placeholder="October - April" value={formData.season} onChange={handleInputChange} /></div><div className="add-form-group half"><label>Location</label><input type="text" name="location" placeholder="Old Bagan" value={formData.location} onChange={handleInputChange} /></div></div>
              <div className="add-form-group"><label>Includes</label><textarea name="includes" rows="2" placeholder="Hotel transfer, breakfast..." value={formData.includes} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Status</label><select name="status" value={formData.status} onChange={handleInputChange}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              <div className="add-form-group"><label>Description</label><textarea name="description" rows="2" placeholder="Describe the experience..." value={formData.description} onChange={handleInputChange} /></div>
              <button className="add-item-btn-full" onClick={handleAdd} disabled={loading}>{loading ? 'Adding...' : 'Add Balloon'}</button>
            </div>
          </div>
        </div>

        {/* Right - Balloon Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedItems.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6c757d' }}><i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block' }}></i><p>No balloons found.</p></div>
              ) : (
                sortedItems.map(item => (
                  <div key={item.id} className="hotel-card-vertical" style={{ borderLeft: `4px solid ${item.status === 'Active' ? '#28a745' : '#dc3545'}` }}>
                    <div className="hotel-card-image" style={{ position: 'relative', minHeight: '150px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa' }}>
                      <div className="image-slider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                        {item.images && item.images.length > 0 ? <img src={item.images[0]} alt={item.name} style={{ objectFit: 'cover', width: '100%', height: '100%', maxHeight: '150px' }} /> : <div style={{ fontSize: '60px', padding: '20px' }}>🎈</div>}
                      </div>
                      <div style={{ position: 'absolute', top: '10px', left: '10px', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', ...getStatusStyle(item.status) }}>{item.status}</div>
                      <CardActions id={item.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name" style={{ fontSize: '16px' }}>{item.name}</h3>
                      <p style={{ fontSize: '13px', color: '#6c757d' }}><i className="bi bi-building"></i> {item.company}</p>
                      <p className="hotel-location"><i className="bi bi-geo-alt-fill"></i> {item.location}</p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6c757d', flexWrap: 'wrap' }}><span><i className="bi bi-people"></i> {item.capacity}</span><span><i className="bi bi-clock"></i> {item.duration}</span><span><i className="bi bi-sunrise"></i> {item.flightTimes}</span></div>
                      <p className="hotel-price">From <span>MMK {item.price}</span></p>
                      <div className="hotel-rating">{renderStars(item.rating)}<span className="rating-count">({item.reviews})</span></div>
                      {item.season && <p style={{ fontSize: '12px', color: '#888' }}><i className="bi bi-calendar-event"></i> Season: {item.season}</p>}
                      <p style={{ fontSize: '11px', color: '#999' }}><i className="bi bi-clock"></i> Added: {item.created_at}</p>
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
            <div className="modal-header"><h2>Edit Hot Air Balloon</h2><button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button></div>
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

              <div className="form-group"><label>Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Company</label><input type="text" name="company" value={formData.company} onChange={handleInputChange} /></div>
              <div className="form-row"><div className="form-group"><label>Capacity</label><input type="text" name="capacity" value={formData.capacity} onChange={handleInputChange} /></div><div className="form-group"><label>Duration</label><input type="text" name="duration" value={formData.duration} onChange={handleInputChange} /></div></div>
              <div className="form-row"><div className="form-group"><label>Price (MMK)</label><input type="text" name="price" value={formData.price} onChange={handleInputChange} /></div><div className="form-group"><label>Discount</label><input type="text" name="discount" value={formData.discount} onChange={handleInputChange} /></div></div>
              <div className="form-group"><label>Flight Times</label><input type="text" name="flightTimes" value={formData.flightTimes} onChange={handleInputChange} /></div>
              <div className="form-row"><div className="form-group"><label>Season</label><input type="text" name="season" value={formData.season} onChange={handleInputChange} /></div><div className="form-group"><label>Location</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} /></div></div>
              <div className="form-group"><label>Includes</label><textarea name="includes" rows="2" value={formData.includes} onChange={handleInputChange} /></div>
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

export default HotAirBalloons;