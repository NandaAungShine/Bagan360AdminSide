// Packageplan.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';

// ==================== STATIC HELPERS ====================
let idCounter = 0;
const generateItemId = () => `item-${++idCounter}`;

const emptyHotel = () => ({
  id: generateItemId(),
  image: null,
  imageFile: null,
  title: '',
  description: '',
  link: '',
});

const emptyRestaurant = () => ({
  id: generateItemId(),
  image: null,
  imageFile: null,
  title: '',
  description: '',
  link: '',
});

const emptyTransport = () => ({
  id: generateItemId(),
  image: null,
  imageFile: null,
  title: '',
  description: '',
  link: '',
});

const emptyPackage = () => ({
  title: '',
  description: '',
  hotels: [emptyHotel()],
  restaurants: [emptyRestaurant()],
  transports: [emptyTransport()],
});

// ==================== MOCK DATA (fallback) ====================
let nextId = 100;
const generateId = () => (nextId++).toString();

const INITIAL_MOCK_PACKAGES = [
  {
    id: generateId(),
    title: 'Bagan Heritage Package',
    description: 'A curated 2‑day experience with top‑rated stays, local dining, and classic transport.',
    hotels: [
      { id: 'h1', image: 'https://picsum.photos/seed/hotel1/300/200', title: 'Bagan Thande Hotel', description: 'Riverside hotel with sunset views', link: 'https://example.com/hotel1' },
    ],
    restaurants: [
      { id: 'r1', image: 'https://picsum.photos/seed/rest1/300/200', title: 'Saravana Bagan', description: 'Authentic Burmese and Indian cuisine', link: 'https://example.com/rest1' },
    ],
    transports: [
      { id: 't1', image: 'https://picsum.photos/seed/trans1/300/200', title: 'Electric Bike Rental', description: 'Reliable e‑bikes for temple touring', link: 'https://example.com/ebike' },
    ],
    created_at: '2025-03-01',
  },
];

// ==================== ITEM BUILDER ====================
const CategoryItemList = React.memo(({
  items,
  onUpdate,
  onRemove,
  onAdd,
  categoryLabel,
  addButtonLabel,
  isDarkMode,
  readOnly = false,
}) => {
  const handleImageChange = (index, e) => {
    if (readOnly) return;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...items];
      updated[index].image = reader.result;
      updated[index].imageFile = file;
      onUpdate(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    if (readOnly) return;
    const updated = [...items];
    updated[index].image = null;
    updated[index].imageFile = null;
    onUpdate(updated);
  };

  const handleTextChange = (index, field, value) => {
    if (readOnly) return;
    const updated = [...items];
    updated[index][field] = value;
    onUpdate(updated);
  };

  return (
    <div className="category-section" style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
      <h4 style={{ marginBottom: '10px', color: isDarkMode ? '#eee' : '#333' }}>
        {categoryLabel}
      </h4>
      {items.map((item, idx) => (
        <div key={item.id} className="category-item" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', background: isDarkMode ? '#2a2a2a' : '#f9f9f9' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {/* Image display */}
            <div style={{ flex: '0 0 120px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Image</label>
              {item.image ? (
                <div style={{ position: 'relative' }}>
                  <img src={item.image} alt="preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                !readOnly ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(idx, e)}
                    style={{ width: '100%' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '80px', background: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', fontSize: '14px' }}>
                    No image
                  </div>
                )
              )}
            </div>

            {/* Title, Description, Link */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => handleTextChange(idx, 'title', e.target.value)}
                  disabled={readOnly}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ced4da', background: readOnly ? (isDarkMode ? '#3a3a3a' : '#e9ecef') : (isDarkMode ? '#333' : '#fff'), color: isDarkMode ? '#eee' : '#333', cursor: readOnly ? 'default' : 'text' }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <textarea
                  placeholder="Description"
                  rows="2"
                  value={item.description}
                  onChange={(e) => handleTextChange(idx, 'description', e.target.value)}
                  disabled={readOnly}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ced4da', background: readOnly ? (isDarkMode ? '#3a3a3a' : '#e9ecef') : (isDarkMode ? '#333' : '#fff'), color: isDarkMode ? '#eee' : '#333', cursor: readOnly ? 'default' : 'text' }}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Link (URL)"
                  value={item.link}
                  onChange={(e) => handleTextChange(idx, 'link', e.target.value)}
                  disabled={readOnly}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ced4da', background: readOnly ? (isDarkMode ? '#3a3a3a' : '#e9ecef') : (isDarkMode ? '#333' : '#fff'), color: isDarkMode ? '#eee' : '#333', cursor: readOnly ? 'default' : 'text' }}
                />
              </div>
            </div>

            {!readOnly && items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(idx)}
                style={{ alignSelf: 'center', background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '20px' }}
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={onAdd}
          style={{ background: 'transparent', border: '1px dashed #6c757d', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', color: '#6c757d' }}
        >
          <i className="bi bi-plus-lg"></i> {addButtonLabel}
        </button>
      )}
    </div>
  );
});

// ==================== MAIN COMPONENT ====================
function PackagePlan() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [packages, setPackages] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const dataRef = useRef([]);

  const API_BASE = 'http://130.94.21.185:8000/api/admin/package';
  const BACKEND_URL = 'http://130.94.21.185:8000';
  const getToken = () => localStorage.getItem('token');

  // ==================== FETCH PACKAGES (MAPPED TO UI STRUCTURE) ====================
  const fetchPackages = async () => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      loadSampleData();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Raw API response:', result);

      // The API returns { message, data: [...] }
      let packagesArray = result.data || [];
      if (!Array.isArray(packagesArray)) packagesArray = [];

      // Map to our internal structure (arrays with single item)
      const mapped = packagesArray.map((item) => {
        // Extract images from the images array (if any)
        const images = item.images || [];
        return {
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          hotels: [
            {
              id: generateItemId(),
              title: item.hotel_title || '',
              description: item.hotel_description || '',
              link: item.hotel_url || '',
              image: images[0] ? `${BACKEND_URL}/${images[0]}` : null,
              imageFile: null,
            },
          ],
          restaurants: [
            {
              id: generateItemId(),
              title: item.restaurant_title || '',
              description: item.restaurant_description || '',
              link: item.restaurant_url || '',
              image: images[1] ? `${BACKEND_URL}/${images[1]}` : null,
              imageFile: null,
            },
          ],
          transports: [
            {
              id: generateItemId(),
              title: item.transport_title || '',
              description: item.transport_description || '',
              link: item.transport_url || '',
              image: images[2] ? `${BACKEND_URL}/${images[2]}` : null,
              imageFile: null,
            },
          ],
          created_at: item.created_at || '',
        };
      });

      dataRef.current = mapped;
      applyFilters(searchTerm, 1);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setError('Failed to fetch packages. Showing sample data.');
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    dataRef.current = [...INITIAL_MOCK_PACKAGES];
    applyFilters(searchTerm, 1);
  };

  const applyFilters = (search = searchTerm, pageNum = 1) => {
    let filtered = [...dataRef.current];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
      );
    }
    const total = filtered.length;
    const totalPg = Math.ceil(total / limit) || 1;
    const start = (pageNum - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    setPackages(paginated);
    setTotalItems(total);
    setTotalPages(totalPg);
    setPage(pageNum);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    applyFilters(searchTerm, newPage);
  };

  const [formData, setFormData] = useState(emptyPackage());
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPackageForView, setSelectedPackageForView] = useState(null);

  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, message: '', onConfirm: null });

  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // Hotels
  const updateHotels = (newHotels) => setFormData({ ...formData, hotels: newHotels });
  const addHotel = () => setFormData({ ...formData, hotels: [...formData.hotels, emptyHotel()] });
  const removeHotel = (index) => {
    if (formData.hotels.length <= 1) {
      showToast('warning', 'At least one hotel is required.');
      return;
    }
    const updated = formData.hotels.filter((_, i) => i !== index);
    setFormData({ ...formData, hotels: updated });
  };

  const updateRestaurants = (newRestaurants) => setFormData({ ...formData, restaurants: newRestaurants });
  const addRestaurant = () => setFormData({ ...formData, restaurants: [...formData.restaurants, emptyRestaurant()] });
  const removeRestaurant = (index) => {
    if (formData.restaurants.length <= 1) {
      showToast('warning', 'At least one restaurant is required.');
      return;
    }
    const updated = formData.restaurants.filter((_, i) => i !== index);
    setFormData({ ...formData, restaurants: updated });
  };

  const updateTransports = (newTransports) => setFormData({ ...formData, transports: newTransports });
  const addTransport = () => setFormData({ ...formData, transports: [...formData.transports, emptyTransport()] });
  const removeTransport = (index) => {
    if (formData.transports.length <= 1) {
      showToast('warning', 'At least one transport is required.');
      return;
    }
    const updated = formData.transports.filter((_, i) => i !== index);
    setFormData({ ...formData, transports: updated });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ==================== BUILD FORM DATA (MATCHES YOUR API) ====================
  const buildPackageFormData = (isEdit = false) => {
    const form = new FormData();
    form.append('title', formData.title.trim());
    form.append('description', formData.description.trim() || '');

    // Take the first item from each category (or empty strings)
    const hotel = formData.hotels[0] || {};
    const restaurant = formData.restaurants[0] || {};
    const transport = formData.transports[0] || {};

    form.append('hotel_title', hotel.title || '');
    form.append('hotel_description', hotel.description || '');
    form.append('hotel_url', hotel.link || '');

    form.append('restaurant_title', restaurant.title || '');
    form.append('restaurant_description', restaurant.description || '');
    form.append('restaurant_url', restaurant.link || '');

    form.append('transport_title', transport.title || '');
    form.append('transport_description', transport.description || '');
    form.append('transport_url', transport.link || '');

    // Collect all image files from all categories (if any)
    const allImageFiles = [
      ...formData.hotels.map(item => item.imageFile).filter(Boolean),
      ...formData.restaurants.map(item => item.imageFile).filter(Boolean),
      ...formData.transports.map(item => item.imageFile).filter(Boolean),
    ];

    // Append each image file under the field name 'images' (matches your API)
    allImageFiles.forEach(file => {
      form.append('images', file);
    });

    // For debugging, log the fields
    console.log('📦 FormData entries:');
    for (let pair of form.entries()) {
      console.log(pair[0], pair[1]);
    }

    return form;
  };

  // ==================== CRUD ====================
  const handleAddPackage = async () => {
    if (!formData.title.trim()) {
      showToast('warning', 'Please enter a package title.');
      return;
    }
    // Validate that each category has at least one item with a title (or we can skip validation)
    // We'll just check if the first item has a title? Actually we send empty strings if not,
    // so we can skip validation for categories.
    // But we'll keep a light check: if the user added multiple items, we only use the first.

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const form = buildPackageFormData(false);
      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();
      if (result.success === false) {
        throw new Error(result.message || 'Create failed');
      }

      showToast('success', 'Package added successfully!');
      setFormData(emptyPackage());
      await fetchPackages();
    } catch (err) {
      console.error('❌ Add Error:', err);
      showToast('error', 'Failed to add package: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const performDeletePackage = async (id) => {
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Delete failed');
      const result = await response.json();
      if (result.success === false) {
        throw new Error(result.message || 'Delete failed');
      }
      showToast('success', 'Package deleted successfully!');
      await fetchPackages();
    } catch (err) {
      console.error('❌ Delete Error:', err);
      showToast('error', 'Failed to delete package: ' + err.message);
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, visible: false });
    }
  };

  const handleDeletePackage = (id) => {
    setConfirmDialog({
      visible: true,
      message: '🗑️ Are you sure you want to delete this package?',
      onConfirm: () => performDeletePackage(id),
    });
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackageForEdit(pkg);
    // pkg already has the structure with arrays
    setFormData({
      title: pkg.title || '',
      description: pkg.description || '',
      hotels: pkg.hotels.map(h => ({ ...h, imageFile: null })),
      restaurants: pkg.restaurants.map(r => ({ ...r, imageFile: null })),
      transports: pkg.transports.map(t => ({ ...t, imageFile: null })),
    });
    setShowEditModal(true);
  };

  const handleConfirmEdit = async () => {
    if (!formData.title.trim()) {
      showToast('warning', 'Please enter a package title.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setLoading(true);
    try {
      const form = buildPackageFormData(true);
      // Append the ID for update
      form.append('id', selectedPackageForEdit.id);

      const response = await fetch(`${API_BASE}/update/${selectedPackageForEdit.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const result = await response.json();
      if (result.success === false) {
        throw new Error(result.message || 'Update failed');
      }

      showToast('success', 'Package updated successfully!');
      setShowEditModal(false);
      setSelectedPackageForEdit(null);
      setFormData(emptyPackage());
      await fetchPackages();
    } catch (err) {
      console.error('❌ Update Error:', err);
      showToast('error', 'Failed to update package: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPackage = (pkg) => {
    setSelectedPackageForView(pkg);
    setShowViewModal(true);
  };

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CardActions = ({ packageId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = (e) => { e.stopPropagation(); setIsOpen(!isOpen); };
    const handleView = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      const pkg = dataRef.current.find(p => p.id === packageId);
      if (pkg) handleViewPackage(pkg);
    };
    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      const pkg = dataRef.current.find(p => p.id === packageId);
      if (pkg) handleEditPackage(pkg);
    };
    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleDeletePackage(packageId);
    };
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) setIsOpen(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);
    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}>
          <i className="bi bi-three-dots-vertical"></i>
        </button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="view-btn" onClick={handleView}>
            <i className="bi bi-eye"></i> View Details
          </button>
          <button className="edit-btn" onClick={handleEdit}>
            <i className="bi bi-pencil-square"></i> Edit
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            <i className="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Bagan Package Plans Management" onThemeChange={handleThemeChange} />

      {toast.visible && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 999999, width: '420px', maxWidth: '90%', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', padding: '0', overflow: 'hidden', backgroundColor: toast.type === 'success' ? (isDarkMode ? '#1e3a2e' : '#d4edda') : '#f8d7da', color: toast.type === 'success' ? (isDarkMode ? '#b7eb8f' : '#155724') : '#721c24', borderLeft: `5px solid ${toast.type === 'success' ? (isDarkMode ? '#52c41a' : '#28a745') : '#dc3545'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Bagan 360</div>
            <button onClick={() => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); setToast({ ...toast, visible: false }); }} style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}>
            <div style={{ fontSize: '28px' }}>{toast.type === 'success' ? <i className="bi bi-check-circle-fill"></i> : <i className="bi bi-x-circle-fill"></i>}</div>
            <div style={{ fontSize: '15px', lineHeight: '1.5' }}>{toast.message}</div>
          </div>
        </div>
      )}

      {confirmDialog.visible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDarkMode ? '#2d2d2d' : '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: isDarkMode ? '#eee' : '#333', marginBottom: '12px' }}>Confirm Delete</h3>
            <p style={{ color: isDarkMode ? '#ccc' : '#555' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setConfirmDialog({ ...confirmDialog, visible: false })} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'transparent', cursor: 'pointer', color: isDarkMode ? '#ccc' : '#333' }}>Cancel</button>
              <button onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: '#fff', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: '10px', background: isDarkMode ? '#333' : '#f0f0f0' }}>⏳ Loading...</div>}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '5px' }}>
          ⚠️ {error} <button onClick={() => setError(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="search-actions-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div className="search-bar-wrapper" style={{ flex: '1 1 250px' }}>
          <i className="bi bi-search search-icon"></i>
          <input type="text" placeholder="Search packages by title or description..." className="search-input-full" value={searchTerm} onChange={handleSearch} />
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6c757d' }}>Total: {totalItems} packages</div>
      </div>

      <div className="hotels-two-columns">
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Package Title *</label>
                <input type="text" name="title" placeholder="e.g., Bagan Heritage Tour" value={formData.title} onChange={handleInputChange} />
              </div>
              <div className="add-form-group">
                <label>Package Description</label>
                <textarea name="description" rows="3" placeholder="Overview of the package..." value={formData.description} onChange={handleInputChange} />
              </div>

              <CategoryItemList
                items={formData.hotels}
                onUpdate={updateHotels}
                onRemove={removeHotel}
                onAdd={addHotel}
                categoryLabel="🏨 Hotels"
                addButtonLabel="Add more Hotel"
                isDarkMode={isDarkMode}
                readOnly={false}
              />

              <CategoryItemList
                items={formData.restaurants}
                onUpdate={updateRestaurants}
                onRemove={removeRestaurant}
                onAdd={addRestaurant}
                categoryLabel="🍽️ Restaurants"
                addButtonLabel="Add more Restaurant"
                isDarkMode={isDarkMode}
                readOnly={false}
              />

              <CategoryItemList
                items={formData.transports}
                onUpdate={updateTransports}
                onRemove={removeTransport}
                onAdd={addTransport}
                categoryLabel="🚗 Transportation"
                addButtonLabel="Add more Transportation"
                isDarkMode={isDarkMode}
                readOnly={false}
              />

              <button className="add-item-btn-full" onClick={handleAddPackage} disabled={loading}>
                {loading ? 'Adding...' : 'Add Package Plan'}
              </button>
            </div>
          </div>
        </div>

        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {packages.length > 0 ? packages.map((pkg) => (
                <div key={pkg.id} className="hotel-card-vertical plan-card" >
                  <div className="hotel-card-image" style={{ height : '200px'}}>
                    {pkg.hotels && pkg.hotels.length > 0 && pkg.hotels[0].image ? (
                      <img src={pkg.hotels[0].image} alt={pkg.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    ) : (
                      <div style={{ fontSize: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #d97757 0%, #8a4a2a 100%)', color: 'white' }}>🏝️</div>
                    )}
                    <CardActions packageId={pkg.id} />
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{pkg.title}</h3>
                    <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>{pkg.description}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      <span className="plan-transport-badge"><i className="bi bi-building"></i> {pkg.hotels?.length || 0} hotels</span>
                      <span className="plan-transport-badge"><i className="bi bi-shop"></i> {pkg.restaurants?.length || 0} restaurants</span>
                      <span className="plan-transport-badge"><i className="bi bi-truck"></i> {pkg.transports?.length || 0} transports</span>
                    </div>
                    {pkg.created_at && <p className="created-at" style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}><i className="bi bi-clock"></i> Added: {pkg.created_at}</p>}
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#999' }}>
                  <i className="bi bi-box-seam" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No package plans found.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '10px 0', flexWrap: 'wrap' }}>
                <button className="pagination-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ced4da', backgroundColor: page === 1 ? '#e9ecef' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                  <i className="bi bi-chevron-left"></i> Prev
                </button>
                {[...Array(totalPages).keys()].map((num) => (
                  <button key={num + 1} onClick={() => handlePageChange(num + 1)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ced4da', backgroundColor: page === num + 1 ? '#0d6efd' : 'white', color: page === num + 1 ? 'white' : '#212529', cursor: 'pointer', fontWeight: page === num + 1 ? 'bold' : 'normal' }}>
                    {num + 1}
                  </button>
                ))}
                <button className="pagination-btn" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ced4da', backgroundColor: page === totalPages ? '#e9ecef' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                  Next <i className="bi bi-chevron-right"></i>
                </button>
                <span style={{ fontSize: '14px', color: '#6c757d', marginLeft: '10px' }}>Page {page} of {totalPages}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Package Plan</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Package Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Package Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} />
              </div>

              <CategoryItemList
                items={formData.hotels}
                onUpdate={updateHotels}
                onRemove={removeHotel}
                onAdd={addHotel}
                categoryLabel="🏨 Hotels"
                addButtonLabel="Add more Hotel"
                isDarkMode={isDarkMode}
                readOnly={false}
              />

              <CategoryItemList
                items={formData.restaurants}
                onUpdate={updateRestaurants}
                onRemove={removeRestaurant}
                onAdd={addRestaurant}
                categoryLabel="🍽️ Restaurants"
                addButtonLabel="Add more Restaurant"
                isDarkMode={isDarkMode}
                readOnly={false}
              />

              <CategoryItemList
                items={formData.transports}
                onUpdate={updateTransports}
                onRemove={removeTransport}
                onAdd={addTransport}
                categoryLabel="🚗 Transportation"
                addButtonLabel="Add more Transportation"
                isDarkMode={isDarkMode}
                readOnly={false}
              />
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

      {/* VIEW MODAL */}
      {showViewModal && selectedPackageForView && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>👁️ Package Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <p style={{ fontWeight: 'bold', margin: '5px 0 10px', color: isDarkMode ? '#eee' : '#333' }}>{selectedPackageForView.title}</p>
              </div>
              <div className="form-group">
                <label>Description</label>
                <p style={{ margin: '5px 0 10px', color: isDarkMode ? '#ddd' : '#555' }}>{selectedPackageForView.description || '—'}</p>
              </div>
              <div className="form-group">
                <label>Created At</label>
                <p style={{ margin: '5px 0 10px', color: isDarkMode ? '#ddd' : '#555' }}>{selectedPackageForView.created_at || '—'}</p>
              </div>

              <CategoryItemList
                items={selectedPackageForView.hotels || []}
                onUpdate={() => {}}
                onRemove={() => {}}
                onAdd={() => {}}
                categoryLabel="🏨 Hotels"
                addButtonLabel=""
                isDarkMode={isDarkMode}
                readOnly={true}
              />

              <CategoryItemList
                items={selectedPackageForView.restaurants || []}
                onUpdate={() => {}}
                onRemove={() => {}}
                onAdd={() => {}}
                categoryLabel="🍽️ Restaurants"
                addButtonLabel=""
                isDarkMode={isDarkMode}
                readOnly={true}
              />

              <CategoryItemList
                items={selectedPackageForView.transports || []}
                onUpdate={() => {}}
                onRemove={() => {}}
                onAdd={() => {}}
                categoryLabel="🚗 Transportation"
                addButtonLabel=""
                isDarkMode={isDarkMode}
                readOnly={true}
              />
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackagePlan;