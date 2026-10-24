import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function Others() {
  // ===== THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== STATE =====
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    priceMmkMin: '',
    priceMmkMax: '',
    priceUsdMin: '',
    priceUsdMax: '',
    remark: ''
  });

  // ===== PHONE NUMBERS (dynamic list) =====
  const phoneIdCounter = useRef(1);
  const [phoneNumbers, setPhoneNumbers] = useState([{ id: phoneIdCounter.current++, value: '' }]);

  // ===== EDIT MODAL =====
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ===== IMAGE STATE =====
  const [imagePreviews, setImagePreviews] = useState([]);
  const MAX_IMAGES = 3;

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
      name: 'Other #1',
      priceMmkMin: '50000',
      priceMmkMax: '120000',
      priceUsdMin: '25',
      priceUsdMax: '60',
      rating: 4.8,
      reviews: '120',
      images: [],
      remark: 'Sunset horse cart tour with traditional Burmese snacks included.',
      phoneNumbers: ['+95 9 111 222 333'],
      created_at: '2024-03-20'
    },
    {
      id: 2,
      name: 'Other #2',
      priceMmkMin: '80000',
      priceMmkMax: '180000',
      priceUsdMin: '40',
      priceUsdMax: '85',
      rating: 4.6,
      reviews: '85',
      images: [],
      remark: 'Traditional lacquerware workshop experience with local artisan.',
      phoneNumbers: ['+95 9 222 333 444', '+95 9 555 666 777'],
      created_at: '2024-03-22'
    },
    {
      id: 3,
      name: 'Other #3',
      priceMmkMin: '30000',
      priceMmkMax: '75000',
      priceUsdMin: '15',
      priceUsdMax: '35',
      rating: 4.9,
      reviews: '250',
      images: [],
      remark: 'Evening cultural puppet show with traditional music performance.',
      phoneNumbers: ['+95 9 333 444 555'],
      created_at: '2024-03-25'
    },
  ];

  // ===== LOAD & SAVE =====
  useEffect(() => {
    const stored = localStorage.getItem('othersData');
    if (stored) {
      try { setOthers(JSON.parse(stored)); }
      catch { setOthers(sampleData); }
    } else {
      setOthers(sampleData);
    }
  }, []);

  useEffect(() => {
    if (others.length > 0) {
      localStorage.setItem('othersData', JSON.stringify(others));
    }
  }, [others]);

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

  // ===== IMAGE UPLOAD (limit 3) =====
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - imagePreviews.length;
    if (remaining <= 0) {
      showToast('warning', `Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = '';
      return;
    }

    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      showToast('warning', `Only ${remaining} more image(s) can be added.`);
    }

    const newPreviews = toAdd.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // ===== PHONE NUMBER HANDLERS =====
  const handlePhoneChange = (id, value) => {
    setPhoneNumbers(prev => prev.map(p => (p.id === id ? { ...p, value } : p)));
  };

  const addPhoneNumber = () => {
    setPhoneNumbers(prev => [...prev, { id: phoneIdCounter.current++, value: '' }]);
  };

  const removePhoneNumber = (id) => {
    setPhoneNumbers(prev => (prev.length > 1 ? prev.filter(p => p.id !== id) : prev));
  };

  const resetForm = () => {
    setFormData({
      priceMmkMin: '',
      priceMmkMax: '',
      priceUsdMin: '',
      priceUsdMax: '',
      remark: ''
    });
    setImagePreviews([]);
    setPhoneNumbers([{ id: phoneIdCounter.current++, value: '' }]);
  };

  const getValidPhones = () =>
    phoneNumbers.map(p => p.value.trim()).filter(p => p !== '');

  // Generate next auto name "Other #N"
  const generateNextName = () => {
    const maxNum = others.reduce((max, b) => {
      const m = (b.name || '').match(/#(\d+)\s*$/);
      const n = m ? parseInt(m[1], 10) : 0;
      return Math.max(max, n);
    }, 0);
    return `Other #${maxNum + 1}`;
  };

  // ===== ADD =====
  const handleAdd = () => {
    setLoading(true);
    try {
      const hasAnyPrice =
        formData.priceMmkMin || formData.priceMmkMax ||
        formData.priceUsdMin || formData.priceUsdMax;
      if (!hasAnyPrice) {
        showToast('warning', 'Please enter at least one price value.');
        setLoading(false);
        return;
      }

      const newItem = {
        id: Date.now(),
        name: generateNextName(),
        priceMmkMin: formData.priceMmkMin.replace(/[^0-9]/g, ''),
        priceMmkMax: formData.priceMmkMax.replace(/[^0-9]/g, ''),
        priceUsdMin: formData.priceUsdMin.replace(/[^0-9.]/g, ''),
        priceUsdMax: formData.priceUsdMax.replace(/[^0-9.]/g, ''),
        rating: 4.5,
        reviews: '0',
        images: imagePreviews.length > 0 ? imagePreviews : [],
        remark: formData.remark.trim(),
        phoneNumbers: getValidPhones(),
        created_at: new Date().toISOString().split('T')[0]
      };
      setOthers([newItem, ...others]);
      resetForm();
      showToast('success', 'Other item added successfully!');
    } catch (err) {
      showToast('error', 'Failed to add item.');
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE =====
  const performDelete = (id) => {
    setOthers(others.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    showToast('success', 'Item deleted successfully!');
  };

  const handleDelete = (id) => {
    setActiveDropdown(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this item?',
      onConfirm: () => performDelete(id),
    });
  };

  // ===== EDIT =====
  const handleEdit = (item) => {
    setSelectedForEdit(item);
    setFormData({
      priceMmkMin: item.priceMmkMin || '',
      priceMmkMax: item.priceMmkMax || '',
      priceUsdMin: item.priceUsdMin || '',
      priceUsdMax: item.priceUsdMax || '',
      remark: item.remark || ''
    });
    setImagePreviews(item.images || []);

    const loadedPhones = (item.phoneNumbers && item.phoneNumbers.length > 0)
      ? item.phoneNumbers.map(v => ({ id: phoneIdCounter.current++, value: v }))
      : [{ id: phoneIdCounter.current++, value: '' }];
    setPhoneNumbers(loadedPhones);

    setShowEditModal(true);
    setActiveDropdown(null);
  };

  const handleConfirmEdit = () => {
    setLoading(true);
    try {
      if (selectedForEdit) {
        const updated = others.map(c =>
          c.id === selectedForEdit.id ? {
            ...c,
            priceMmkMin: formData.priceMmkMin.replace(/[^0-9]/g, ''),
            priceMmkMax: formData.priceMmkMax.replace(/[^0-9]/g, ''),
            priceUsdMin: formData.priceUsdMin.replace(/[^0-9.]/g, ''),
            priceUsdMax: formData.priceUsdMax.replace(/[^0-9.]/g, ''),
            remark: formData.remark.trim(),
            phoneNumbers: getValidPhones(),
            images: imagePreviews.length > 0 ? imagePreviews : c.images
          } : c
        );
        setOthers(updated);
        setShowEditModal(false);
        setSelectedForEdit(null);
        resetForm();
        showToast('success', 'Item updated successfully!');
      }
    } catch (err) {
      showToast('error', 'Failed to update item.');
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
      message: 'Are you sure you want to delete this item?',
      onConfirm: () => {
        setOthers(others.filter(c => c.id !== selectedId));
        setSelectedId(null);
        showToast('success', 'Item deleted successfully!');
      },
    });
  };

  const handleEditSelected = () => {
    if (!selectedId) {
      showToast('warning', 'Please select an item to edit');
      return;
    }
    const item = others.find(c => c.id === selectedId);
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

  // ===== FILTER & SORT =====
  const filtered = others.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.remark || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSorted = (list) => {
    const sorted = [...list];
    switch (sortBy) {
      case 'lifo': return sorted.sort((a, b) => b.id - a.id);
      case 'fifo': return sorted.sort((a, b) => a.id - b.id);
      case 'az': return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'za': return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default: return sorted;
    }
  };
  const sortedItems = getSorted(filtered);

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
      const item = others.find(c => c.id === id);
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

  // ===== PHONE NUMBERS UI =====
  const PhoneNumbersUI = ({ formMode = false }) => {
    const inputStyle = {
      flex: 1,
      padding: '10px 12px',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#444' : '#ddd'}`,
      background: isDarkMode ? '#1e1e1e' : '#fff',
      color: isDarkMode ? '#eee' : '#333',
      fontSize: '14px',
      outline: 'none'
    };
    return (
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: isDarkMode ? '#ccc' : '#333' }}>Phone Numbers</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {phoneNumbers.map((phone, index) => (
            <div key={phone.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder={`Phone ${index + 1} (e.g. +95 9 123 456 789)`}
                value={phone.value}
                onChange={(e) => handlePhoneChange(phone.id, e.target.value)}
                style={inputStyle}
              />
              {phoneNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhoneNumber(phone.id)}
                  title="Remove this phone number"
                  style={{
                    padding: '10px 12px', borderRadius: '8px', border: 'none',
                    background: '#dc3545', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPhoneNumber}
            style={{
              padding: '10px 14px', borderRadius: '8px',
              border: '1px dashed #0d6efd', background: 'transparent',
              color: '#0d6efd', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontWeight: '500', fontSize: '14px'
            }}
          >
            <i className="bi bi-plus-lg"></i> Add Ph no.
          </button>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Others Management" onThemeChange={handleThemeChange} />
      <ToastUI />
      <ConfirmDialogUI />

      {loading && <div style={{ textAlign: 'center', padding: '10px', background: isDarkMode ? '#333' : '#f0f0f0' }}>⏳ Processing...</div>}

      {/* Search & Actions */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input type="text" placeholder="Search other..." className="search-input-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

      {/* Two Columns */}
      <div className="hotels-two-columns">
        {/* Left - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Images (3 max) */}
            <div className="image-gallery-top">
              <label className="gallery-label">
                📸 Images <span style={{ fontSize: '12px', opacity: 0.7 }}>({imagePreviews.length}/{MAX_IMAGES} max)</span>
              </label>
              <div className="image-gallery-wrapper">
                {imagePreviews.length < MAX_IMAGES && (
                  <div className="image-upload-box">
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="image-upload-gallery" />
                    <label htmlFor="image-upload-gallery" className="upload-box"><i className="bi bi-plus-lg"></i><span>Add Image</span></label>
                  </div>
                )}
                <div className="image-scroll-container-horizontal">
                  {imagePreviews.map((img, i) => (
                    <div key={i} className="image-item"><img src={img} alt="" /><button className="remove-image-btn" onClick={() => removeImage(i)}><i className="bi bi-x-lg"></i></button></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              {/* MMK Price Range */}
              <div className="add-form-group">
                <label>MMK Price Range (MMK)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" name="priceMmkMin" placeholder="Min (e.g. 30000)" value={formData.priceMmkMin} onChange={handleInputChange} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="priceMmkMax" placeholder="Max (e.g. 120000)" value={formData.priceMmkMax} onChange={handleInputChange} style={{ flex: 1 }} />
                </div>
              </div>

              {/* USD Price Range */}
              <div className="add-form-group">
                <label>USD Price Range (USD)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" name="priceUsdMin" placeholder="Min (e.g. 15)" value={formData.priceUsdMin} onChange={handleInputChange} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="priceUsdMax" placeholder="Max (e.g. 60)" value={formData.priceUsdMax} onChange={handleInputChange} style={{ flex: 1 }} />
                </div>
              </div>

              {/* Remark */}
              <div className="add-form-group">
                <label>Remark</label>
                <textarea name="remark" rows="3" placeholder="Enter remark..." value={formData.remark} onChange={handleInputChange} />
              </div>

              {/* Phone Numbers */}
              <div className="add-form-group">
                <PhoneNumbersUI formMode />
              </div>

              <button className="add-item-btn-full" onClick={handleAdd} disabled={loading}>{loading ? 'Adding...' : 'Add Item'}</button>
            </div>
          </div>
        </div>

        {/* Right - Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedItems.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6c757d' }}><i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block' }}></i><p>No items found.</p></div>
              ) : (
                sortedItems.map(item => {
                  const hasMmkRange = item.priceMmkMin || item.priceMmkMax;
                  const hasUsdRange = item.priceUsdMin || item.priceUsdMax;
                  return (
                    <div key={item.id} className="hotel-card-vertical">
                      <div className="hotel-card-image" style={{ position: 'relative', minHeight: '150px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa' }}>
                        <div className="image-slider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                          {item.images && item.images.length > 0 ? <img src={item.images[0]} alt={item.name} style={{ objectFit: 'cover', width: '100%', height: '100%', maxHeight: '150px' }} /> : <div style={{ fontSize: '60px', padding: '20px' }}>✨</div>}
                        </div>
                        <CardActions id={item.id} />
                      </div>
                      <div className="hotel-card-info">
                        {/* Name */}
                        <h3 className="hotel-name" style={{ fontSize: '16px' }}>{item.name || 'Other'}</h3>

                        {/* MMK Range */}
                        {hasMmkRange && (
                          <p className="hotel-price" style={{ marginTop: '6px' }}>
                            MMK <span>{item.priceMmkMin || '?'} — {item.priceMmkMax || '?'}</span>
                          </p>
                        )}
                        {/* USD Range */}
                        {hasUsdRange && (
                          <p style={{ fontSize: '13px', color: isDarkMode ? '#bbb' : '#555', margin: '2px 0' }}>
                            USD <span style={{ fontWeight: 600 }}>{item.priceUsdMin || '?'} — {item.priceUsdMax || '?'}</span>
                          </p>
                        )}

                        <div className="hotel-rating">{renderStars(item.rating)}<span className="rating-count">({item.reviews})</span></div>

                        {/* Remark — show only if present */}
                        {item.remark && (
                          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }} title={item.remark}>
                            <i className="bi bi-chat-left-text"></i> {item.remark.length > 60 ? item.remark.slice(0, 60) + '…' : item.remark}
                          </p>
                        )}

                        {/* Phones */}
                        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                          <p style={{ fontSize: '12px', color: '#0d6efd', marginTop: '2px' }} title={item.phoneNumbers.join('\n')}>
                            <i className="bi bi-telephone-fill"></i> {item.phoneNumbers.join(' / ')}
                          </p>
                        )}

                        <p style={{ fontSize: '11px', color: '#999' }}><i className="bi bi-clock"></i> Added: {item.created_at}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Edit Other Item</h2><button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button></div>
            <div className="modal-body">
              {/* Image Gallery - TOP */}
              <div className="image-gallery-top">
                <label className="gallery-label">
                  📸 Images <span style={{ fontSize: '12px', opacity: 0.7 }}>({imagePreviews.length}/{MAX_IMAGES} max)</span> — Upload new to replace
                </label>
                <div className="image-gallery-wrapper">
                  {imagePreviews.length < MAX_IMAGES && (
                    <div className="image-upload-box">
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} id="edit-image-upload" />
                      <label htmlFor="edit-image-upload" className="upload-box"><i className="bi bi-plus-lg"></i><span>Add Image</span></label>
                    </div>
                  )}
                  <div className="image-scroll-container-horizontal">
                    {imagePreviews.map((img, i) => (
                      <div key={i} className="image-item"><img src={img} alt="" /><button className="remove-image-btn" onClick={() => removeImage(i)}><i className="bi bi-x-lg"></i></button></div>
                    ))}
                  </div>
                </div>
                <small style={{ opacity: 0.7, display: 'block', marginTop: '5px' }}>⚡ Max {MAX_IMAGES} images. Leave empty to keep current.</small>
              </div>

              {/* MMK Price Range */}
              <div className="form-group">
                <label>MMK Price Range</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" name="priceMmkMin" placeholder="Min" value={formData.priceMmkMin} onChange={handleInputChange} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="priceMmkMax" placeholder="Max" value={formData.priceMmkMax} onChange={handleInputChange} style={{ flex: 1 }} />
                </div>
              </div>

              {/* USD Price Range */}
              <div className="form-group">
                <label>USD Price Range</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" name="priceUsdMin" placeholder="Min" value={formData.priceUsdMin} onChange={handleInputChange} style={{ flex: 1 }} />
                  <span style={{ color: '#888', fontWeight: 'bold' }}>—</span>
                  <input type="text" name="priceUsdMax" placeholder="Max" value={formData.priceUsdMax} onChange={handleInputChange} style={{ flex: 1 }} />
                </div>
              </div>

              {/* Remark */}
              <div className="form-group"><label>Remark</label><textarea name="remark" rows="3" value={formData.remark} onChange={handleInputChange} /></div>

              {/* Phone Numbers */}
              <div className="form-group">
                <PhoneNumbersUI formMode />
              </div>
            </div>
            <div className="modal-footer"><button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button><button className="add-item-btn" onClick={handleConfirmEdit} disabled={loading}>{loading ? 'Updating...' : 'Confirm Edit'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Others;