// components/Hotels.jsx
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import axios from 'axios';

/* ============================================================
   FacilitiesEditor — moved OUTSIDE Hotels component
============================================================ */
const FacilitiesEditor = ({
  facilities,
  isDarkMode,
  onAdd,
  onRemove,
  onUpdate,
  onImageChange,
  onImageRemove,
}) => (
  <div className="add-form-group">
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <label style={{ margin: 0 }}>
        Facilities (name · description · image)
      </label>
      <button
        type="button"
        onClick={onAdd}
        style={{
          padding: '4px 10px',
          fontSize: 12,
          borderRadius: 6,
          border: '1px solid #17a2b8',
          background: 'transparent',
          color: '#17a2b8',
          cursor: 'pointer',
        }}
      >
        <i className="bi bi-plus-lg"></i> Add Facility
      </button>
    </div>

    {facilities.length === 0 && (
      <small style={{ opacity: 0.6 }}>No facilities added yet.</small>
    )}

    {facilities.map((f, index) => (
      <div
        key={f._key ?? index}
        style={{
          border: '1px solid rgba(128,128,128,0.3)',
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          background: isDarkMode
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.01)',
        }}
      >
        {/* Facility Image */}
        <div style={{ flexShrink: 0 }}>
          <input
            type="file"
            accept="image/*"
            id={`facility-image-${index}`}
            style={{ display: 'none' }}
            onChange={(e) => onImageChange(index, e.target.files[0])}
          />
          {f.imagePreview ? (
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <img
                src={f.imagePreview}
                alt="facility"
                style={{
                  width: 72,
                  height: 72,
                  objectFit: 'cover',
                  borderRadius: 6,
                }}
              />
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: 'none',
                  background: '#dc3545',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 10,
                  lineHeight: '20px',
                  padding: 0,
                }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ) : (
            <label
              htmlFor={`facility-image-${index}`}
              style={{
                width: 72,
                height: 72,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(128,128,128,0.5)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 10,
                gap: 2,
                color: isDarkMode ? '#ccc' : '#666',
              }}
            >
              <i className="bi bi-image" style={{ fontSize: 18 }}></i>
              <span>Image</span>
            </label>
          )}
        </div>

        {/* Facility Name + Description */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <input
            type="text"
            placeholder="Facility name (e.g. Free WiFi)"
            value={f.name}
            onChange={(e) => onUpdate(index, 'name', e.target.value)}
          />
          <textarea
            rows={2}
            placeholder="Facility description..."
            value={f.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
          ></textarea>
        </div>

        {/* Remove Facility */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{
            alignSelf: 'flex-start',
            border: 'none',
            background: 'transparent',
            color: '#dc3545',
            cursor: 'pointer',
            padding: 4,
          }}
          title="Remove facility"
        >
          <i className="bi bi-trash"></i>
        </button>
      </div>
    ))}
  </div>
);

/* ============================================================
   Hotels component
============================================================ */
function Hotels() {
  // ===== API Config =====
  const BACKEND_URL = 'http://130.94.21.185:8000';
  const API_BASE = `${BACKEND_URL}/api/admin/hotel`;
  // ⭐ Same endpoint as Settings.jsx
  const SHOP_ACTIVATE_API = `${BACKEND_URL}/auth/shop/activate/`;

  // ===== Theme =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // ===== UI States =====
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelForEdit, setSelectedHotelForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== Data States =====
  const [hotels, setHotels] = useState([]);

  // ===== Main Image States =====
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // ===== Gallery Images =====
  const [hotelImages, setHotelImages] = useState([]);

  // ===== Facilities =====
  const [facilities, setFacilities] = useState([]);

  // ===== Form Data =====
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });

  // ===== ⭐ Shop Active States =====
  const [shopActive, setShopActive] = useState(true);
  const [togglingShop, setTogglingShop] = useState(false);

  // ===== Toast & Confirm =====
  const [toast, setToast] = useState({
    visible: false,
    type: 'success',
    message: '',
  });
  const toastTimeoutRef = useRef(null);

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    message: '',
    onConfirm: null,
  });

  // ===== User role / shop =====
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();
  const role = (localStorage.getItem('role') || user?.role || '').toLowerCase();
  const shopId = localStorage.getItem('shopId') || user?.shop_id || '';
  const isShopRole = role === 'shop';

  // ===== Toast Helper =====
  const showToast = (type, message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 4000);
  };

  // ===== 401 Handler =====
  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  // ===== Error Message Extractor =====
  const extractErrorMessage = (err) => {
    if (!err) return 'Unknown error';
    const data = err.response?.data;
    if (!data) {
      return err.message || `Request failed with status ${err.response?.status || '?'}`;
    }
    if (typeof data === 'string') {
      const patterns = [
        /ReferenceError[^<\n\r]*/i,
        /TypeError[^<\n\r]*/i,
        /SyntaxError[^<\n\r]*/i,
        /Call to a member function[^<\n\r]*/i,
        /SQLSTATE[^<\n\r]*/i,
        /Undefined variable[^<\n\r]*/i,
        /Class "[^"]*" not found/i,
        /Method [^ ]* does not exist/i,
      ];
      for (const p of patterns) {
        const m = data.match(p);
        if (m) return m[0].trim();
      }
      const stripped = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return stripped.substring(0, 250);
    }
    if (typeof data === 'object') {
      if (data.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        const firstMsg = Array.isArray(data.errors[firstKey])
          ? data.errors[firstKey][0]
          : data.errors[firstKey];
        if (firstMsg) return `${firstKey}: ${firstMsg}`;
      }
      return (
        data.message ||
        data.error ||
        data.detail ||
        JSON.stringify(data).substring(0, 250)
      );
    }
    return err.message || 'Unknown error';
  };

  // ===== Theme Handler =====
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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

  // ===== Token =====
  const getToken = () =>
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    '';

  // ===== Axios Instance =====
  const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: { Accept: 'application/json' },
  });

  api.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        handle401Error();
      }
      return Promise.reject(error);
    }
  );

  // ===== Image URL helper =====
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const trimmed = String(imagePath).trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
      return trimmed;
    if (trimmed.startsWith('/')) return `${BACKEND_URL}${trimmed}`;
    return `${BACKEND_URL}/${trimmed}`;
  };

  // ===== Unique key generator =====
  let _facilityKeyCounter = 0;
  const nextFacilityKey = () => `fac-${Date.now()}-${_facilityKeyCounter++}`;

  // ===== Map API → UI object =====
  const mapApiToHotel = (hotel) => {
    let rawFacilities = [];
    if (Array.isArray(hotel.facilities)) {
      rawFacilities = hotel.facilities;
    } else if (typeof hotel.facilities === 'string' && hotel.facilities.trim()) {
      try {
        const parsed = JSON.parse(hotel.facilities);
        rawFacilities = Array.isArray(parsed) ? parsed : [];
      } catch {
        rawFacilities = hotel.facilities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const mappedFacilities = rawFacilities
      .map((f) => {
        if (typeof f === 'string') {
          return {
            _key: nextFacilityKey(),
            id: null,
            name: f,
            description: '',
            image: null,
            imagePreview: null,
            existingImage: '',
          };
        }
        return {
          _key: nextFacilityKey(),
          id: f.id ?? null,
          name: f.name ?? '',
          description: f.description ?? f.detail ?? '',
          image: null,
          imagePreview: f.image ? getImageUrl(f.image) : null,
          existingImage: f.image || '',
        };
      })
      .filter((f) => f.name || f.description || f.existingImage);

    let mainImage = hotel.image || null;
    const galleryImages = [];

    if (Array.isArray(hotel.images) && hotel.images.length > 0) {
      hotel.images.forEach((img) => {
        const path = typeof img === 'string' ? img : img?.image;
        if (!path) return;
        galleryImages.push({
          id: img?.id ?? null,
          preview: getImageUrl(path),
          existing: path,
        });
      });
    }

    return {
      id: hotel.id,
      shop_id: hotel.shop_id,
      shop_name: hotel.shop_name || '',
      shop_address: hotel.shop_address || '',
      shop_phone: hotel.shop_phone || '',
      name: hotel.name || '',
      price: hotel.price || 0,
      facilities: mappedFacilities,
      description: hotel.description || '',
      image: getImageUrl(mainImage),
      images: galleryImages,
      raw: hotel,
    };
  };

  // ===== Fetch Hotels =====
  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/list');
      const list = response.data?.data || [];
      setHotels(list.map(mapApiToHotel));
    } catch (err) {
      console.error('Fetch Error:', err);
      if (err.response?.status !== 401) {
        setError('Failed to fetch hotels. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     ⭐ SHOP ACTIVE STATUS
     ------------------------------------------------------------
     • localStorage ကနေ ဖတ် (Settings.jsx က save လုပ်ထားတာ)
     • Backend API ကိုလည်း background မှာ sync
     • Settings မှာ toggle လုပ်လိုက်ရင် Hotels မှာ auto-reflect
  ============================================================ */
  const readShopStatusFromStorage = () => {
    const keys = [
      'user',
      'userData',
      'userInfo',
      'shop',
      'shopData',
      'currentUser',
      'profile',
      'authUser',
      'loggedUser',
    ];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const obj = Array.isArray(parsed) ? parsed[0] : parsed;
        if (!obj || typeof obj !== 'object') continue;
        const status =
          obj.is_active ?? obj.active ?? obj.shop_status ?? obj.status;
        if (status === undefined || status === null || status === '') continue;
        if (typeof status === 'boolean') return status;
        if (typeof status === 'number') return status === 1;
        if (typeof status === 'string') {
          const s = status.toLowerCase();
          if (['active', 'open', '1', 'true', 'yes'].includes(s)) return true;
          if (
            ['inactive', 'closed', '0', 'false', 'no', 'disabled', 'disable'].includes(s)
          )
            return false;
        }
      } catch {
        // ignore
      }
    }
    return true; // default ON
  };

  const writeShopStatusToStorage = (isActive) => {
    const keys = [
      'user',
      'userData',
      'userInfo',
      'shop',
      'shopData',
      'currentUser',
    ];
    keys.forEach((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const merged = {
          ...parsed,
          status: isActive ? 'Active' : 'Inactive',
          is_active: isActive,
          active: isActive,
        };
        localStorage.setItem(key, JSON.stringify(merged));
      } catch {
        // ignore
      }
    });
  };

  const loadShopStatus = () => {
    setShopActive(readShopStatusFromStorage());
  };

  // ⭐ Toggle shop (same endpoint & body as Settings.jsx)
  const handleToggleShop = async () => {
    if (!isShopRole) {
      showToast('warning', 'Only shop accounts can toggle shop status.');
      return;
    }
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    const previous = shopActive;
    const next = !shopActive;

    setTogglingShop(true);
    setShopActive(next); // optimistic

    try {
      console.log(`🔄 [Hotels] Toggling Shop → ${next ? 'ON' : 'OFF'}`);
      console.log(`🌐 PUT ${SHOP_ACTIVATE_API}`);
      console.log(`📦 Body: { is_active: ${next} }`);

      const response = await fetch(SHOP_ACTIVATE_API, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: next }),
      });

      if (response.status === 401) {
        setShopActive(previous);
        return handle401Error();
      }

      let result = {};
      try {
        result = await response.json();
      } catch {
        // non-JSON
      }

      console.log('✅ [Hotels] Toggle Response:', result);

      if (!response.ok || result.success === false) {
        setShopActive(previous);
        throw new Error(
          result.message ||
            result.error ||
            `Failed to turn shop ${next ? 'ON' : 'OFF'} (${response.status})`
        );
      }

      writeShopStatusToStorage(next);
      showToast(
        'success',
        next
          ? '🏪 Shop turned ON — hotels are visible to customers.'
          : '🔒 Shop turned OFF — hotels are hidden from customers.'
      );
    } catch (err) {
      console.error('❌ [Hotels] Toggle Shop Error:', err);
      setShopActive(previous);
      showToast('error', 'Error: ' + (err.message || 'Toggle failed'));
    } finally {
      setTogglingShop(false);
    }
  };

  // Listen to storage changes (if Settings toggled in another tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (!e.key) return;
      const watched = [
        'user',
        'userData',
        'userInfo',
        'shop',
        'shopData',
        'currentUser',
      ];
      if (watched.includes(e.key)) loadShopStatus();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }
    loadShopStatus();
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Input change =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ===== Main Image Upload =====
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  // ===== Gallery Upload =====
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      existing: '',
    }));
    setHotelImages((prev) => [...prev, ...mapped]);
  };

  const removeGalleryImage = (index) => {
    setHotelImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ===== Facilities CRUD =====
  const addFacility = () => {
    setFacilities((prev) => [
      ...prev,
      {
        _key: nextFacilityKey(),
        id: null,
        name: '',
        description: '',
        image: null,
        imagePreview: null,
        existingImage: '',
      },
    ]);
  };

  const removeFacility = (index) => {
    setFacilities((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFacility = (index, field, value) => {
    setFacilities((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };

  const handleFacilityImage = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setFacilities((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, image: file, imagePreview: preview } : f
      )
    );
  };

  const removeFacilityImage = (index) => {
    setFacilities((prev) =>
      prev.map((f, i) =>
        i === index
          ? { ...f, image: null, imagePreview: null, existingImage: '' }
          : f
      )
    );
  };

  // ===== Reset Form =====
  const resetForm = () => {
    setFormData({ name: '', price: '', description: '' });
    setImagePreview(null);
    setImageFile(null);
    setHotelImages([]);
    setFacilities([]);
  };

  // ===== Append facilities to FormData =====
  const appendFacilities = (form, facilitiesList) => {
    facilitiesList.forEach((f, i) => {
      const name = (f.name || '').trim();
      const description = (f.description || '').trim();
      if (!name && !description && !f.image && !f.existingImage) return;

      form.append(`facilities[${i}][name]`, name);
      form.append(`facilities[${i}][description]`, description);

      if (f.id != null) form.append(`facilities[${i}][id]`, f.id);

      if (f.existingImage && !f.image) {
        form.append(`facilities[${i}][existing_image]`, f.existingImage);
      }
      if (f.image) {
        form.append(`facilities[${i}][image]`, f.image);
      }
    });
  };

  // ===== Append gallery =====
  const appendHotelImages = (form, gallery) => {
    gallery.forEach((img, i) => {
      if (img.file) form.append(`hotel_images[${i}]`, img.file);
      else if (img.existing)
        form.append(`existing_hotel_images[${i}]`, img.existing);
    });
  };

  // ===== ADD HOTEL =====
  const handleAddHotel = async () => {
    if (!shopActive) {
      showToast(
        'warning',
        'Shop is currently OFF. Please turn the shop ON first.'
      );
      return;
    }
    if (!formData.name || !formData.price || !formData.description) {
      showToast('warning', 'Name, Price and Description are required.');
      return;
    }
    if (!imageFile) {
      showToast('warning', 'Please upload an image.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('price', formData.price);
      form.append('description', formData.description.trim());
      form.append('image', imageFile);

      appendHotelImages(form, hotelImages);
      appendFacilities(form, facilities);

      if (role === 'shop' && shopId) {
        form.append('shop_id', shopId);
      }

      console.log('📤 POST', `${API_BASE}/create`);
      console.log('FormData keys:', Array.from(form.keys()));

      const response = await axios.post(`${API_BASE}/create`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      if (response.data?.success) {
        showToast(
          'success',
          response.data.message || 'Hotel added successfully!'
        );
        resetForm();
        fetchHotels();
      } else {
        showToast(
          'error',
          response.data?.message || 'Failed to add hotel.'
        );
      }
    } catch (err) {
      console.error('❌ Add Error:', err);
      console.error('❌ Response:', err.response?.data);
      if (err.response?.status === 401) return;

      const status = err.response?.status;
      const msg = extractErrorMessage(err);

      if (status === 500) {
        showToast('error', `Backend 500 Error: ${msg}`);
        setError(`Backend 500 Error: ${msg}`);
      } else {
        showToast('error', `Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== DELETE HOTEL =====
  const performDeleteHotel = async (id) => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (response.data?.success) {
        showToast(
          'success',
          response.data.message || 'Hotel deleted successfully!'
        );
        fetchHotels();
      } else {
        showToast(
          'error',
          response.data?.message || 'Failed to delete hotel.'
        );
      }
    } catch (err) {
      console.error('Delete Error:', err);
      if (err.response?.status === 401) return;
      showToast('error', `Error: ${extractErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this hotel?',
      onConfirm: () => performDeleteHotel(id),
    });
  };

  // ===== EDIT (Open Modal) =====
  const handleEditHotel = (id) => {
    const h = hotels.find((x) => x.id === id);
    if (!h) {
      showToast('error', 'Hotel not found.');
      return;
    }
    setSelectedHotelForEdit(h);
    setFormData({
      name: h.name || '',
      price: h.price || '',
      description: h.description || '',
    });
    setImagePreview(h.image || null);
    setImageFile(null);

    setHotelImages(
      (h.images || []).map((img) => ({
        id: img.id,
        preview: img.preview,
        existing: img.existing,
      }))
    );

    setFacilities(
      (h.facilities || []).map((f) => ({
        _key: f._key ?? nextFacilityKey(),
        id: f.id ?? null,
        name: f.name || '',
        description: f.description || '',
        image: null,
        imagePreview: f.imagePreview || null,
        existingImage: f.existingImage || '',
      }))
    );

    setShowEditModal(true);
  };

  // ===== CONFIRM EDIT =====
  const handleConfirmEdit = async () => {
    if (!selectedHotelForEdit) return;
    if (!formData.name || !formData.price || !formData.description) {
      showToast('warning', 'Name, Price and Description are required.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name.trim());
      form.append('price', formData.price);
      form.append('description', formData.description.trim());
      if (imageFile) form.append('image', imageFile);

      appendHotelImages(form, hotelImages);
      appendFacilities(form, facilities);

      if (role === 'shop' && shopId) form.append('shop_id', shopId);

      form.append('_method', 'PUT');

      console.log('📤 POST', `${API_BASE}/update/${selectedHotelForEdit.id}`);

      const response = await axios.post(
        `${API_BASE}/update/${selectedHotelForEdit.id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        }
      );

      if (response.data?.success) {
        showToast(
          'success',
          response.data.message || 'Hotel updated successfully!'
        );
        setShowEditModal(false);
        setSelectedHotelForEdit(null);
        resetForm();
        fetchHotels();
      } else {
        showToast(
          'error',
          response.data?.message || 'Failed to update hotel.'
        );
      }
    } catch (err) {
      console.error('❌ Update Error:', err);
      console.error('❌ Response:', err.response?.data);
      if (err.response?.status === 401) return;
      const msg = extractErrorMessage(err);
      showToast('error', `Error: ${msg}`);
      if (err.response?.status === 500) {
        setError(`Backend 500 Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER =====
  const filteredHotels = hotels.filter((h) => {
    const term = searchTerm.toLowerCase();
    const facilityText = (h.facilities || [])
      .map((f) => `${f.name} ${f.description}`)
      .join(' ')
      .toLowerCase();
    return (
      (h.name || '').toLowerCase().includes(term) ||
      (h.description || '').toLowerCase().includes(term) ||
      (h.shop_name || '').toLowerCase().includes(term) ||
      facilityText.includes(term)
    );
  });

  // ===== Card Actions =====
  const CardActions = ({ hotelId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) {
          setIsOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () =>
        document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div
          className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}
        >
          <button
            className="edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              handleEditHotel(hotelId);
            }}
          >
            <i className="bi bi-pencil-square"></i> Edit
          </button>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              handleDeleteHotel(hotelId);
            }}
          >
            <i className="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    );
  };

  // ===== RENDER =====
  return (
    <div
      className={`dashboard-container ${
        isDarkMode ? 'dark-theme' : 'light-theme'
      }`}
    >
      <Header
        title="Hotels Management"
        onThemeChange={handleThemeChange}
      />

      {/* Toast */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999999,
            width: '420px',
            maxWidth: '90%',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            backgroundColor:
              toast.type === 'success'
                ? isDarkMode
                  ? '#1e3a2e'
                  : '#d4edda'
                : toast.type === 'error'
                ? isDarkMode
                  ? '#3e1f1f'
                  : '#f8d7da'
                : toast.type === 'warning'
                ? isDarkMode
                  ? '#3d3512'
                  : '#fff3cd'
                : isDarkMode
                ? '#112b3c'
                : '#d1ecf1',
            color:
              toast.type === 'success'
                ? isDarkMode
                  ? '#b7eb8f'
                  : '#155724'
                : toast.type === 'error'
                ? isDarkMode
                  ? '#ffa39e'
                  : '#721c24'
                : toast.type === 'warning'
                ? isDarkMode
                  ? '#ffe58f'
                  : '#856404'
                : isDarkMode
                ? '#91d5ff'
                : '#0c5460',
            borderLeft: `5px solid ${
              toast.type === 'success'
                ? isDarkMode
                  ? '#52c41a'
                  : '#28a745'
                : toast.type === 'error'
                ? isDarkMode
                  ? '#ff4d4f'
                  : '#dc3545'
                : toast.type === 'warning'
                ? isDarkMode
                  ? '#faad14'
                  : '#ffc107'
                : isDarkMode
                ? '#1890ff'
                : '#17a2b8'
            }`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: `1px solid ${
                isDarkMode
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.1)'
              }`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              Bagan 360
            </div>
            <button
              onClick={() => {
                if (toastTimeoutRef.current)
                  clearTimeout(toastTimeoutRef.current);
                setToast({ ...toast, visible: false });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                fontSize: '18px',
                cursor: 'pointer',
                opacity: 0.7,
                padding: '0 4px',
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '28px' }}>
              {toast.type === 'success' && (
                <i className="bi bi-check-circle-fill"></i>
              )}
              {toast.type === 'error' && (
                <i className="bi bi-x-circle-fill"></i>
              )}
              {toast.type === 'warning' && (
                <i className="bi bi-exclamation-triangle-fill"></i>
              )}
              {toast.type === 'info' && (
                <i className="bi bi-info-circle-fill"></i>
              )}
            </div>
            <div
              style={{
                fontSize: '15px',
                lineHeight: '1.5',
                wordBreak: 'break-word',
              }}
            >
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDialog.visible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: isDarkMode ? '#2d2d2d' : '#fff',
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3
              style={{
                color: isDarkMode ? '#eee' : '#333',
                marginBottom: '12px',
              }}
            >
              Confirm Delete
            </h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>
              {confirmDialog.message}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() =>
                  setConfirmDialog({
                    ...confirmDialog,
                    visible: false,
                  })
                }
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: isDarkMode ? '#ccc' : '#333',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({
                    ...confirmDialog,
                    visible: false,
                  });
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#dc3545',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
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
      </div>

      {/* ============================================================
          ⭐ SHOP STATUS STRIP — same design language as Settings
          ------------------------------------------------------------
          Shop OFF ဖြစ်နေရင် Hotels တွေ customer တွေဆီ မပေါ်ဘူးဆိုတာ
          ဒီနေရာမှာ ရှင်းရှင်းလင်းလင်း ပြပေးတယ်။
          Design Flow Frame မပြောင်း — search bar ရဲ့ အောက်မှာတင်
          banner တစ်ခုအနေနဲ့ ထည့်ထားတယ်။
      ============================================================ */}
      {isShopRole && (
        <div
          style={{
            margin: '0 20px 12px',
            padding: '10px 14px',
            borderRadius: 10,
            background: shopActive
              ? isDarkMode
                ? 'rgba(40,167,69,0.12)'
                : '#e6f7ed'
              : isDarkMode
              ? 'rgba(220,53,69,0.12)'
              : '#fdeaec',
            border: `1px solid ${
              shopActive
                ? isDarkMode
                  ? 'rgba(40,167,69,0.35)'
                  : '#b7e4c7'
                : isDarkMode
                ? 'rgba(220,53,69,0.35)'
                : '#f5c6cb'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i
              className={`bi ${shopActive ? 'bi-shop-window' : 'bi-shop'}`}
              style={{
                fontSize: 20,
                color: shopActive ? '#28a745' : '#dc3545',
              }}
            ></i>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: isDarkMode ? '#eee' : '#333',
                }}
              >
                Shop Status
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: shopActive
                    ? isDarkMode
                      ? '#b7eb8f'
                      : '#155724'
                    : isDarkMode
                    ? '#ffa39e'
                    : '#721c24',
                }}
              >
                {shopActive
                  ? 'ON — Hotels are visible to customers'
                  : 'OFF — Hotels are hidden from customers'}
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggleShop}
            disabled={togglingShop || loading}
            title={shopActive ? 'Click to turn shop OFF' : 'Click to turn shop ON'}
            style={{
              position: 'relative',
              width: 58,
              height: 30,
              borderRadius: 15,
              border: 'none',
              cursor: togglingShop ? 'not-allowed' : 'pointer',
              background: shopActive
                ? '#28a745'
                : isDarkMode
                ? '#555'
                : '#ccc',
              opacity: togglingShop ? 0.55 : 1,
              transition: 'background 0.25s ease',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: shopActive ? 31 : 3,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                transition: 'left 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {togglingShop ? (
                <i
                  className="bi bi-arrow-repeat"
                  style={{
                    fontSize: 13,
                    color: '#333',
                    animation: 'spin 1s linear infinite',
                  }}
                ></i>
              ) : (
                <i
                  className={`bi ${shopActive ? 'bi-check-lg' : 'bi-x-lg'}`}
                  style={{
                    fontSize: 12,
                    color: shopActive ? '#28a745' : '#999',
                  }}
                ></i>
              )}
            </span>
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span style={{ flex: 1, wordBreak: 'break-word' }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: 16,
            }}
            title="Dismiss"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* ⭐ Shop OFF warning (only shows when OFF) */}
      {isShopRole && !shopActive && (
        <div
          style={{
            margin: '0 20px 12px',
            padding: '10px 14px',
            borderRadius: 8,
            background: isDarkMode
              ? 'rgba(250,173,20,0.15)'
              : '#fff8e6',
            border: `1px dashed ${
              isDarkMode ? 'rgba(250,173,20,0.5)' : '#ffd591'
            }`,
            color: isDarkMode ? '#ffe58f' : '#874d00',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <i className="bi bi-info-circle"></i>
          <span>
            Your shop is <b>OFF</b>. Customers cannot see these hotels or add
            new bookings. Turn the shop ON above to make them visible again.
          </span>
        </div>
      )}

      <div className="hotels-two-columns">
        {/* Left: Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="image-gallery-top">
              <label className="gallery-label">Main Image *</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload-gallery"
                  />
                  <label
                    htmlFor="image-upload-gallery"
                    className="upload-box"
                  >
                    <i className="bi bi-plus-lg"></i>
                    <span>Add Image</span>
                  </label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {imagePreview && (
                    <div className="image-item">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        className="remove-image-btn"
                        onClick={removeImage}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hotel Gallery */}
            <div className="image-gallery-top" style={{ marginTop: 10 }}>
              <label className="gallery-label">
                Hotel Gallery (multiple)
              </label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    style={{ display: 'none' }}
                    id="gallery-upload"
                  />
                  <label htmlFor="gallery-upload" className="upload-box">
                    <i className="bi bi-images"></i>
                    <span>Add</span>
                  </label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {hotelImages.map((img, idx) => (
                    <div className="image-item" key={idx}>
                      <img src={img.preview} alt={`g-${idx}`} />
                      <button
                        className="remove-image-btn"
                        onClick={() => removeGalleryImage(idx)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Hotel / Plan Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="eg. Bagan Hotel Myanmar"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Price (MMK) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="eg. 50000"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              {/* Facilities Editor */}
              <FacilitiesEditor
                facilities={facilities}
                isDarkMode={isDarkMode}
                onAdd={addFacility}
                onRemove={removeFacility}
                onUpdate={updateFacility}
                onImageChange={handleFacilityImage}
                onImageRemove={removeFacilityImage}
              />

              <div className="add-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Hotel description..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* ⭐ Add button — disabled when shop is OFF */}
              <button
                className="add-item-btn-full"
                onClick={handleAddHotel}
                disabled={loading || (isShopRole && !shopActive)}
                title={
                  isShopRole && !shopActive
                    ? 'Shop is OFF — turn it ON to add hotels'
                    : 'Add Hotel'
                }
                style={
                  isShopRole && !shopActive
                    ? { opacity: 0.55, cursor: 'not-allowed' }
                    : undefined
                }
              >
                {loading
                  ? 'Adding...'
                  : isShopRole && !shopActive
                  ? 'Shop is OFF — Cannot Add'
                  : 'Add Hotel'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {loading && hotels.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '50px',
                  }}
                >
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading hotels...</p>
                </div>
              ) : filteredHotels.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="hotel-card-vertical"
                    style={
                      isShopRole && !shopActive
                        ? { opacity: 0.65, position: 'relative' }
                        : undefined
                    }
                  >
                    <div className="hotel-card-image">
                      <div className="image-slider">
                        <img
                          src={hotel.image || '/default-hotel.jpg'}
                          alt={hotel.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-hotel.jpg';
                          }}
                          style={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%',
                          }}
                        />
                      </div>

                      {/* ⭐ Hidden badge when shop is OFF */}
                      {isShopRole && !shopActive && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 5,
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: 'rgba(220,53,69,0.92)',
                            color: '#fff',
                            fontSize: 10.5,
                            fontWeight: 600,
                            letterSpacing: 0.3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                          }}
                        >
                          <i className="bi bi-eye-slash-fill"></i> HIDDEN
                        </div>
                      )}

                      <CardActions hotelId={hotel.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name">{hotel.name}</h3>
                      {hotel.shop_name && (
                        <p className="hotel-location">
                          <i className="bi bi-shop"></i> {hotel.shop_name}
                        </p>
                      )}
                      {hotel.shop_address && (
                        <p className="hotel-location">
                          <i className="bi bi-geo-alt-fill"></i>{' '}
                          {hotel.shop_address}
                        </p>
                      )}
                      <p className="hotel-price">
                        Starting from <span>MMK {hotel.price}</span>
                      </p>

                      {hotel.facilities?.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            marginTop: '8px',
                          }}
                        >
                          {hotel.facilities.slice(0, 4).map((f, i) => (
                            <span
                              key={i}
                              title={f.description || f.name}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '11px',
                                padding: '2px 8px 2px 4px',
                                borderRadius: '10px',
                                background: isDarkMode ? '#333' : '#eef',
                                color: isDarkMode ? '#ccc' : '#335',
                              }}
                            >
                              {f.imagePreview && (
                                <img
                                  src={f.imagePreview}
                                  alt=""
                                  style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                              )}
                              {f.name || f.description}
                            </span>
                          ))}
                          {hotel.facilities.length > 4 && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                color: '#888',
                              }}
                            >
                              +{hotel.facilities.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                    padding: '50px',
                    color: '#999',
                  }}
                >
                  <i
                    className="bi bi-inbox"
                    style={{
                      fontSize: '48px',
                      display: 'block',
                      marginBottom: '10px',
                    }}
                  ></i>
                  <p>No hotels found. Add your first hotel!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Hotel</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Main Image (Optional - upload new to replace)
                </label>
                <div
                  className="image-gallery-wrapper"
                  style={{ marginBottom: '10px' }}
                >
                  <div className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      id="edit-image-upload"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="upload-box"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="bi bi-plus-lg"></i>
                    </label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {imagePreview && (
                      <div className="image-item">
                        <img src={imagePreview} alt="Preview" />
                        <button
                          className="remove-image-btn"
                          onClick={removeImage}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <small style={{ opacity: 0.7 }}>
                  Leave as is if you don't want to change image.
                </small>
              </div>

              {/* Gallery in edit */}
              <div className="form-group">
                <label>Hotel Gallery</label>
                <div
                  className="image-gallery-wrapper"
                  style={{ marginBottom: '10px' }}
                >
                  <div className="image-upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      style={{ display: 'none' }}
                      id="edit-gallery-upload"
                    />
                    <label
                      htmlFor="edit-gallery-upload"
                      className="upload-box"
                      style={{ width: '80px', height: '80px' }}
                    >
                      <i className="bi bi-images"></i>
                    </label>
                  </div>
                  <div className="image-scroll-container-horizontal">
                    {hotelImages.map((img, idx) => (
                      <div className="image-item" key={idx}>
                        <img src={img.preview} alt={`g-${idx}`} />
                        <button
                          className="remove-image-btn"
                          onClick={() => removeGalleryImage(idx)}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Hotel / Plan Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Price (MMK) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              {/* Facilities Editor */}
              <FacilitiesEditor
                facilities={facilities}
                isDarkMode={isDarkMode}
                onAdd={addFacility}
                onRemove={removeFacility}
                onUpdate={updateFacility}
                onImageChange={handleFacilityImage}
                onImageRemove={removeFacilityImage}
              />

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="discard-btn"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="add-item-btn"
                onClick={handleConfirmEdit}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm Edit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spinner keyframes (for toggle loading icon) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Hotels;