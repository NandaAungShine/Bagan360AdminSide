import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

const API_BASE = 'http://130.94.21.185:8000/api/admin';
const IMAGE_BASE = 'http://130.94.21.185:8000'; 

// Helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const fetchWithAuth = async (url, options = {}) => {
  const headers = getAuthHeaders();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
  return response;
};

function EBikes() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEBikeId, setSelectedEBikeId] = useState(null);
  const [selectedEBikeForEdit, setSelectedEBikeForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [cardMenuBikeId, setCardMenuBikeId] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({
    visible: false,
    type: 'success', 
    message: '',
  });
  // Toast timeout reference (3s auto close အတွက်)
  const toastTimeoutRef = useRef(null);

  // 🎯 Toast ကို ခေါ်သုံးမယ့် Helper Function (Auto-close 3s ပါဝင်ပါတယ်)
  const showToast = (type, message) => {
    // မူလ Timer ရှိနေရင် ရှင်းပစ်မယ် (Toast အသစ်တစ်ခုခေါ်လိုက်ရင် အဟောင်းက မပျောက်အောင်)
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ visible: true, type, message });
    // 3 စက္ကန့် (3000ms) ကြာပြီးရင် အလိုအလျောက် ပျောက်သွားမယ်
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // Confirm Dialog (Delete မေးတဲ့ Modal)
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    message: '',
    onConfirm: null, 
  });

  // Data states
  const [eBikeTypes, setEBikeTypes] = useState([]);
  const [eBikes, setEBikes] = useState([]);
  const [allPrices, setAllPrices] = useState([]); 
  const [pricesByBike, setPricesByBike] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    type_id: '',
    name: '',
    code: '',
    brand: '',
    color: '',
    location: '',
    price: '',
    discount: '',
    description: '',
    battery_voltage: '',
    battery_capacity: '',
    passenger_count: '',
    helmet: 'Yes',
    phone_holder: 'Yes',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Price modal states
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceModalMode, setPriceModalMode] = useState('add');
  const [currentPriceId, setCurrentPriceId] = useState(null);
  const [currentBikeIdForPrice, setCurrentBikeIdForPrice] = useState(null);
  const [priceFormData, setPriceFormData] = useState({
    price_type: 'full_day',
    start_time: '07:00',
    end_time: '14:00',
    price: '',
  });

  // Close card menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (cardMenuBikeId) setCardMenuBikeId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [cardMenuBikeId]);

  // ----- Helper: Handle 401 Unauthorized (Token Expired) -----
  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => {
      window.location.href = '/login'; // Login Page ကို ပြန်ပို့မယ်
    }, 1500);
  };

  // ----- Fetch Functions -----
  const fetchEBikeTypes = async () => {
    setLoadingTypes(true);
    try {
      const response = await fetchWithAuth(`${API_BASE}/e-bike/type/list`);
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        setEBikeTypes(data.data);
      } else {
        showToast('error', data.message || 'Failed to load types');
      }
    } catch (error) {
      console.error('Error fetching types:', error);
      showToast('error', 'Network error while loading types.');
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchEBikes = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE}/e-bike/list`);
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        setEBikes(data.data);
      } else {
        showToast('error', data.message || 'Failed to load e-bikes');
      }
    } catch (error) {
      console.error('Error fetching e-bikes:', error);
      showToast('error', 'Network error while loading e-bikes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPrices = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/e-bike/price/list`);
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        setAllPrices(data.data);
        const grouped = {};
        data.data.forEach((price) => {
          const id = price.e_bike_id;
          if (!grouped[id]) grouped[id] = [];
          grouped[id].push(price);
        });
        setPricesByBike(grouped);
      } else {
        console.warn('Failed to load prices:', data.message);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchEBikeTypes();
    fetchEBikes();
    fetchAllPrices();
  }, []);

  // Theme effect
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
  };

  // ----- E-Bike CRUD -----
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddEBike = async () => {
    if (!formData.type_id || !formData.name || !formData.price) {
      showToast('warning', 'Please fill in required fields: Type, Name, Price.');
      return;
    }

    const form = new FormData();
    form.append('type_id', formData.type_id);
    form.append('name', formData.name);
    form.append('code', formData.code || '');
    form.append('brand', formData.brand || '');
    form.append('color', formData.color || '');
    form.append('location', formData.location || '');
    form.append('price', formData.price);
    form.append('discount', formData.discount || 0);
    form.append('description', formData.description || '');
    form.append('battery_voltage', formData.battery_voltage || '');
    form.append('battery_capacity', formData.battery_capacity || '');
    form.append('passenger_count', formData.passenger_count || 1);
    form.append('helmet', formData.helmet === 'Yes' ? 'Yes' : 'No');
    form.append('phone_holder', formData.phone_holder === 'Yes' ? 'Yes' : 'No');
    if (imageFile) {
      form.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/e-bike/create`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: form,
      });
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        showToast('success', 'E-Bike added successfully!');
        resetForm();
        fetchEBikes();
        fetchAllPrices();
      } else {
        showToast('error', data.message || 'Failed to add e-bike.');
      }
    } catch (error) {
      console.error('Error adding:', error);
      showToast('error', 'Network error.');
    }
  };

  const resetForm = () => {
    setFormData({
      type_id: '',
      name: '',
      code: '',
      brand: '',
      color: '',
      location: '',
      price: '',
      discount: '',
      description: '',
      battery_voltage: '',
      battery_capacity: '',
      passenger_count: '',
      helmet: 'Yes',
      phone_holder: 'Yes',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  // ---- Delete Logic without window.confirm ----
  const performDeleteSelected = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/e-bike/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        showToast('success', 'E-Bike deleted successfully!');
        setSelectedEBikeId(null);
        fetchEBikes();
        fetchAllPrices();
      } else {
        showToast('error', data.message || 'Failed to delete.');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('error', 'Network error.');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedEBikeId) {
      showToast('warning', 'Please select an e-bike to delete');
      return;
    }
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this e-bike?',
      onConfirm: () => performDeleteSelected(selectedEBikeId)
    });
  };

  const performCardDelete = async (id) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/e-bike/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        showToast('success', 'E-Bike deleted successfully!');
        if (selectedEBikeId === id) setSelectedEBikeId(null);
        fetchEBikes();
        fetchAllPrices();
      } else {
        showToast('error', data.message || 'Failed to delete.');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('error', 'Network error.');
    }
  };

  const handleCardDelete = (id) => {
    setCardMenuBikeId(null);
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this e-bike?',
      onConfirm: () => performCardDelete(id)
    });
  };

  const handleEditSelected = () => {
    if (!selectedEBikeId) {
      showToast('warning', 'Please select an e-bike to edit');
      return;
    }
    const ebikeToEdit = eBikes.find((ebike) => ebike.id === selectedEBikeId);
    if (ebikeToEdit) {
      openEditModal(ebikeToEdit);
    }
  };

  const handleCardEdit = (bike) => {
    setCardMenuBikeId(null);
    openEditModal(bike);
  };

  const openEditModal = (bike) => {
    setSelectedEBikeForEdit(bike);
    setFormData({
      type_id: bike.type_id || '',
      name: bike.name || '',
      code: bike.code || '',
      brand: bike.brand || '',
      color: bike.color || '',
      location: bike.location || '',
      price: bike.price || '',
      discount: bike.discount || 0,
      description: bike.description || '',
      battery_voltage: bike.battery_voltage || '',
      battery_capacity: bike.battery_capacity || '',
      passenger_count: bike.passenger_count || '',
      helmet: bike.helmet || 'Yes',
      phone_holder: bike.phone_holder || 'Yes',
    });
    if (bike.image) {
      const fullImageUrl = `${IMAGE_BASE}/${bike.image}`;
      setImagePreview(fullImageUrl);
      setImageFile(null);
    } else {
      setImagePreview(null);
      setImageFile(null);
    }
    setShowEditModal(true);
  };

  const handleConfirmEdit = async () => {
    if (!selectedEBikeForEdit) return;
    if (!formData.type_id || !formData.name || !formData.price) {
      showToast('warning', 'Please fill in required fields (Type, Name, Price).');
      return;
    }

    const form = new FormData();
    form.append('type_id', formData.type_id);
    form.append('name', formData.name);
    form.append('code', formData.code || '');
    form.append('brand', formData.brand || '');
    form.append('color', formData.color || '');
    form.append('location', formData.location || '');
    form.append('price', formData.price);
    form.append('discount', formData.discount || 0);
    form.append('description', formData.description || '');
    form.append('battery_voltage', formData.battery_voltage || '');
    form.append('battery_capacity', formData.battery_capacity || '');
    form.append('passenger_count', formData.passenger_count || 1);
    form.append('helmet', formData.helmet === 'Yes' ? 'Yes' : 'No');
    form.append('phone_holder', formData.phone_holder === 'Yes' ? 'Yes' : 'No');
    if (imageFile) {
      form.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/e-bike/update/${selectedEBikeForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: form,
      });
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        showToast('success', 'E-Bike updated successfully!');
        setShowEditModal(false);
        setSelectedEBikeId(null);
        setSelectedEBikeForEdit(null);
        resetForm();
        fetchEBikes();
        fetchAllPrices();
      } else {
        showToast('error', data.message || 'Failed to update.');
      }
    } catch (error) {
      console.error('Error updating:', error);
      showToast('error', 'Network error.');
    }
  };

  // ----- Price CRUD -----
  const handleOpenAddPriceModal = (bikeId) => {
    setCurrentBikeIdForPrice(bikeId);
    setPriceModalMode('add');
    setCurrentPriceId(null);
    setPriceFormData({
      price_type: 'full_day',
      start_time: '07:00',
      end_time: '14:00',
      price: '',
    });
    setShowPriceModal(true);
  };

  const handleOpenEditPriceModal = (price) => {
    setCurrentBikeIdForPrice(price.e_bike_id);
    setPriceModalMode('edit');
    setCurrentPriceId(price.id);
    setPriceFormData({
      price_type: price.price_type || 'full_day',
      start_time: price.start_time ? price.start_time.slice(0, 5) : '07:00',
      end_time: price.end_time ? price.end_time.slice(0, 5) : '14:00',
      price: price.price || '',
    });
    setShowPriceModal(true);
  };

  const handlePriceInputChange = (e) => {
    const { name, value } = e.target;
    setPriceFormData({ ...priceFormData, [name]: value });
  };

  const handleSavePrice = async () => {
    if (!priceFormData.price || !priceFormData.start_time || !priceFormData.end_time) {
      showToast('warning', 'Please fill in all fields.');
      return;
    }

    const payload = {
      e_bike_id: currentBikeIdForPrice,
      price_type: priceFormData.price_type,
      start_time: priceFormData.start_time + ':00',
      end_time: priceFormData.end_time + ':00',
      price: parseFloat(priceFormData.price),
    };

    let url, method;
    if (priceModalMode === 'add') {
      url = `${API_BASE}/e-bike/price/create`;
      method = 'POST';
    } else {
      url = `${API_BASE}/e-bike/price/update/${currentPriceId}`;
      method = 'PUT';
    }

    try {
      const response = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(payload),
      });
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        showToast('success', priceModalMode === 'add' ? 'Price added successfully!' : 'Price updated successfully!');
        setShowPriceModal(false);
        fetchAllPrices();
      } else {
        showToast('error', data.message || 'Failed to save price.');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      showToast('error', 'Network error.');
    }
  };

  const performDeletePrice = async (priceId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/e-bike/price/delete/${priceId}`, {
        method: 'DELETE',
      });
      if (response.status === 401) return handle401Error();
      const data = await response.json();
      if (data.success) {
        showToast('success', 'Price deleted successfully!');
        fetchAllPrices();
      } else {
        showToast('error', data.message || 'Failed to delete price.');
      }
    } catch (error) {
      console.error('Error deleting price:', error);
      showToast('error', 'Network error.');
    }
  };

  const handleDeletePrice = (priceId) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this price?',
      onConfirm: () => performDeletePrice(priceId)
    });
  };

  // ----- UI Helpers -----
  const getPriceTypeLabel = (type) => {
    const map = {
      'full_day': 'Full Day',
      'hourly': 'Hourly',
      'half_day_1': 'Half Day (AM)',
      'half_day_2': 'Half Day (PM)',
    };
    return map[type] || type;
  };

  const renderStars = (rating = 4.5) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }} />
        ))}
        {hasHalfStar && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }} />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <i key={i} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }} />
        ))}
      </>
    );
  };

  const handleSelectAll = () => {
    if (selectedEBikeId === 'all') {
      setSelectedEBikeId(null);
    } else {
      setSelectedEBikeId('all');
    }
    setShowAllDropdown(false);
  };

  const toggleEBikeSelection = (id) => {
    if (selectedEBikeId === id) {
      setSelectedEBikeId(null);
    } else {
      setSelectedEBikeId(id);
    }
  };

  const toggleCardMenu = (id, e) => {
    e.stopPropagation();
    setCardMenuBikeId(cardMenuBikeId === id ? null : id);
  };

  const filteredEBikes = eBikes.filter((ebike) =>
    ebike.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebike.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebike.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebike.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ----- Render -----
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="E-Bikes Management" onThemeChange={handleThemeChange} />

      {/* 🟢 Screen အလယ် Toast Alert UI (အရောင် ခွဲခြားထားပြီး၊ 3s အကြာမှာ အလိုအလျောက် ပျောက်မယ်) */}
      {toast.visible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 999999,
          width: '420px',
          maxWidth: '90%',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          padding: '0',
          overflow: 'hidden',
          // Action အလိုက် အရောင်တွေ ခွဲပေးထားပါတယ် (Success=Green, Error=Red, Warning=Yellow, Info=Blue)
          backgroundColor: toast.type === 'success' ? (isDarkMode ? '#1e3a2e' : '#d4edda') : toast.type === 'error' ? (isDarkMode ? '#3e1f1f' : '#f8d7da') : toast.type === 'warning' ? (isDarkMode ? '#3d3512' : '#fff3cd') : (isDarkMode ? '#112b3c' : '#d1ecf1'),
          color: toast.type === 'success' ? (isDarkMode ? '#b7eb8f' : '#155724') : toast.type === 'error' ? (isDarkMode ? '#ffa39e' : '#721c24') : toast.type === 'warning' ? (isDarkMode ? '#ffe58f' : '#856404') : (isDarkMode ? '#91d5ff' : '#0c5460'),
          borderLeft: `5px solid ${toast.type === 'success' ? (isDarkMode ? '#52c41a' : '#28a745') : toast.type === 'error' ? (isDarkMode ? '#ff4d4f' : '#dc3545') : toast.type === 'warning' ? (isDarkMode ? '#faad14' : '#ffc107') : (isDarkMode ? '#1890ff' : '#17a2b8')}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Bagan 360
            </div>
            <button
              onClick={() => setToast({ ...toast, visible: false })}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                fontSize: '18px',
                cursor: 'pointer',
                opacity: 0.7,
                padding: '0 4px'
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            padding: '20px'
          }}>
            <div style={{ fontSize: '28px' }}>
              {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
              {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
              {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Screen အလယ် Custom Confirm Modal (Delete အတွက်) */}
      {confirmDialog.visible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDarkMode ? '#2d2d2d' : '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: '12px' }}>Confirm Delete</h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { 
                  if(confirmDialog.onConfirm) confirmDialog.onConfirm(); 
                  setConfirmDialog({ ...confirmDialog, visible: false }); 
                }}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search e-bike..."
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
              <button onClick={() => { setSelectedEBikeId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedEBikeId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      <div className="hotels-two-columns">
        {/* Left Column - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Upload */}
            <div className="image-gallery-top">
              <label className="gallery-label">Image</label>
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
                    <span>Upload Image</span>
                  </label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {imagePreview && (
                    <div className="image-item">
                      <img src={imagePreview} alt="Preview" />
                      <button className="remove-image-btn" onClick={removeImage}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>E-Bike Type <span style={{ color: 'red' }}>*</span></label>
                {loadingTypes ? (
                  <div>Loading types...</div>
                ) : (
                  <select
                    name="type_id"
                    value={formData.type_id}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">-- Select Type --</option>
                    {eBikeTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.distance})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="add-form-group">
                <label>E-Bike Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="eg. Honor Fit"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Code</label>
                  <input
                    type="text"
                    name="code"
                    placeholder="eg. 5K-1234 (unique)"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="eg. Honor"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    placeholder="eg. Green"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="eg. Bagan"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Price (MMK) <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    name="price"
                    placeholder="eg. 3000"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="eg. 5"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Battery Voltage</label>
                  <input
                    type="text"
                    name="battery_voltage"
                    placeholder="eg. 48V"
                    value={formData.battery_voltage}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Battery Capacity</label>
                  <input
                    type="text"
                    name="battery_capacity"
                    placeholder="eg. 12Ah"
                    value={formData.battery_capacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Passenger Count</label>
                  <input
                    type="number"
                    name="passenger_count"
                    placeholder="eg. 2"
                    value={formData.passenger_count}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Helmet</label>
                  <select
                    name="helmet"
                    value={formData.helmet}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Phone Holder</label>
                  <select
                    name="phone_holder"
                    value={formData.phone_holder}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="add-form-group half"></div>
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the e-bike features..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddEBike}>
                Add E-Bike
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - E-Bike Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            {loading ? (
              <div className="loading-text">Loading e-bikes...</div>
            ) : (
              <div className="hotels-grid-2cols">
                {filteredEBikes.map((ebike) => {
                  const imageUrl = ebike.image
                    ? `${IMAGE_BASE}/${ebike.image}`
                    : '🛵';
                  const bikePrices = pricesByBike[ebike.id] || [];

                  return (
                    <div
                      key={ebike.id}
                      className={`hotel-card-vertical ${selectedEBikeId === ebike.id ? 'selected' : ''}`}
                      onClick={() => toggleEBikeSelection(ebike.id)}
                    >
                      <div className="hotel-card-image" style={{ position: 'relative' }}>
                        <div className="image-slider">
                          {typeof imageUrl === 'string' && imageUrl.startsWith('http') ? (
                            <img src={imageUrl} alt={ebike.name} />
                          ) : (
                            <span style={{ fontSize: '48px' }}>{imageUrl}</span>
                          )}
                        </div>
                        <div className="selection-check">
                          {selectedEBikeId === ebike.id && <i className="bi bi-check-circle-fill"></i>}
                        </div>

                        {/* Kebab Menu */}
                        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                          <button
                            onClick={(e) => toggleCardMenu(ebike.id, e)}
                            style={{
                              background: 'rgba(0,0,0,0.6)',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#fff',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '18px',
                              lineHeight: '1',
                            }}
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          {cardMenuBikeId === ebike.id && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '30px',
                                right: '0',
                                background: isDarkMode ? '#2d2d2d' : '#fff',
                                borderRadius: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                zIndex: 20,
                                minWidth: '120px',
                                padding: '4px 0',
                                color: isDarkMode ? '#eee' : '#333',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleCardEdit(ebike)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: isDarkMode ? '#eee' : '#333',
                                  fontSize: '14px',
                                }}
                              >
                                <i className="bi bi-pencil-square"></i> Edit
                              </button>
                              <button
                                onClick={() => handleCardDelete(ebike.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  padding: '6px 12px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#dc3545',
                                  fontSize: '14px',
                                }}
                              >
                                <i className="bi bi-trash"></i> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="hotel-card-info">
                        <h3 className="hotel-name">{ebike.name}</h3>
                        <p className="hotel-location">
                          <i className="bi bi-geo-alt-fill"></i> {ebike.location || 'N/A'}
                        </p>
                        <div className="ebike-details">
                          <span className="ebike-brand">{ebike.brand} {ebike.code ? `(${ebike.code})` : ''}</span>
                        </div>
                        <div className="ebike-specs">
                          <span><i className="bi bi-battery-charging"></i> {ebike.battery_capacity || 'N/A'}</span>
                          <span><i className="bi bi-speedometer2"></i> {ebike.type_name || 'Type'}</span>
                        </div>
                        <div className="ebike-specs">
                          <span><i className="bi bi-map"></i> Range: {ebike.distance || 'N/A'}</span>
                          <span><i className="bi bi-palette"></i> {ebike.color || 'N/A'}</span>
                        </div>
                        <p className="hotel-price">
                          Per Day <span>MMK {ebike.total_price ?? ebike.price}</span>
                          {ebike.discount > 0 && (
                            <span style={{ fontSize: '12px', marginLeft: '8px', textDecoration: 'line-through', color: '#999' }}>
                              MMK {ebike.price}
                            </span>
                          )}
                        </p>

                        {/* Price Section */}
                        <div className="price-section" style={{ marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '14px' }}>Prices</strong>
                            <button
                              className="add-price-btn"
                              style={{
                                background: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                              onClick={(e) => { e.stopPropagation(); handleOpenAddPriceModal(ebike.id); }}
                            >
                              <i className="bi bi-plus-circle"></i> Add Price
                            </button>
                          </div>
                          {bikePrices.length === 0 ? (
                            <div style={{ fontSize: '13px', color: '#888' }}>No prices set</div>
                          ) : (
                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                              {bikePrices.map((price) => (
                                <div key={price.id} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '13px',
                                  padding: '4px 0',
                                  borderBottom: '1px solid #eee',
                                }}>
                                  <div>
                                    <strong>{getPriceTypeLabel(price.price_type)}</strong>
                                    <span style={{ marginLeft: '8px', color: '#555' }}>
                                      {price.start_time.slice(0,5)} - {price.end_time.slice(0,5)}
                                    </span>
                                    <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#28a745' }}>
                                      MMK {price.price}
                                    </span>
                                  </div>
                                  <div>
                                    <button
                                      style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', marginRight: '4px' }}
                                      onClick={(e) => { e.stopPropagation(); handleOpenEditPriceModal(price); }}
                                    >
                                      <i className="bi bi-pencil-square"></i>
                                    </button>
                                    <button
                                      style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer' }}
                                      onClick={(e) => { e.stopPropagation(); handleDeletePrice(price.id); }}
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="hotel-rating" style={{ marginTop: '8px' }}>
                          {renderStars(4.5)}
                          <span className="rating-count">(0)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ----- Edit E-Bike Modal ----- */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit E-Bike</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>E-Bike Type <span style={{ color: 'red' }}>*</span></label>
                <select
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">-- Select Type --</option>
                  {eBikeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.distance})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>E-Bike Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Code</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
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
              <div className="form-row">
                <div className="form-group">
                  <label>Price (MMK) <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Battery Voltage</label>
                  <input
                    type="text"
                    name="battery_voltage"
                    value={formData.battery_voltage}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Battery Capacity</label>
                  <input
                    type="text"
                    name="battery_capacity"
                    value={formData.battery_capacity}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Passenger Count</label>
                  <input
                    type="number"
                    name="passenger_count"
                    value={formData.passenger_count}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Helmet</label>
                  <select
                    name="helmet"
                    value={formData.helmet}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Holder</label>
                  <select
                    name="phone_holder"
                    value={formData.phone_holder}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'block', marginTop: '4px' }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                      <button
                        onClick={removeImage}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: 'red',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                        }}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  )}
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

      {/* ----- Price Modal (Add / Edit) ----- */}
      {showPriceModal && (
        <div className="modal-overlay" onClick={() => setShowPriceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>{priceModalMode === 'add' ? 'Add Price' : 'Edit Price'}</h2>
              <button className="close-btn" onClick={() => setShowPriceModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Price Type</label>
                <select
                  name="price_type"
                  value={priceFormData.price_type}
                  onChange={handlePriceInputChange}
                  className="form-select"
                >
                  <option value="full_day">Full Day</option>
                  <option value="hourly">Hourly</option>
                  <option value="half_day_1">Half Day (AM)</option>
                  <option value="half_day_2">Half Day (PM)</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={priceFormData.start_time}
                    onChange={handlePriceInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={priceFormData.end_time}
                    onChange={handlePriceInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Price (MMK)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Enter price"
                  value={priceFormData.price}
                  onChange={handlePriceInputChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowPriceModal(false)}>
                Cancel
              </button>
              <button className="add-item-btn" onClick={handleSavePrice}>
                {priceModalMode === 'add' ? 'Add Price' : 'Update Price'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EBikes;