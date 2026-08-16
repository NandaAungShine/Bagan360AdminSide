import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';

// ==================== STATIC OPTIONS ====================
const ZONE_OPTIONS = ['Old Bagan', 'New Bagan', 'Nyaung U', 'Myinkaba', 'Multiple Zones'];
const DURATION_OPTIONS = ['1 Day', '2 Days', '3+ Days'];
const TRANSPORT_OPTIONS = [
  { key: 'ebike', label: 'E-bike', icon: 'bi-bicycle' },
  { key: 'horsecart', label: 'Horse Cart', icon: 'bi-cart2' },
  { key: 'taxi', label: 'Taxi / Car', icon: 'bi-car-front-fill' },
  { key: 'bicycle', label: 'Bicycle', icon: 'bi-bicycle' },
  { key: 'balloon', label: 'Hot Air Balloon', icon: 'bi-circle' },
  { key: 'walking', label: 'Walking', icon: 'bi-person-walking' },
];
const TIME_SLOTS = ['Early Morning', 'Morning', 'Afternoon', 'Evening / Sunset'];

let stepIdCounter = 0;
const createStepId = () => `step-${++stepIdCounter}`;

const emptyStep = () => ({ id: createStepId(), time: 'Morning', activity: '' });

const emptyForm = () => ({
  title: '',
  zone: ZONE_OPTIONS[0],
  duration: DURATION_OPTIONS[0],
  transport: [],
  estimatedCost: '',
  tips: '',
  tags: '',
  itinerary: [emptyStep()],
  images: [],
  description: '',
});

// ==================== MOCK DATA (fallback) ====================
let nextId = 100;
const generateId = () => (nextId++).toString();

const INITIAL_MOCK_PLANS = [
  {
    id: generateId(),
    title: 'Old Bagan Temple Trail',
    zone: 'Old Bagan',
    duration: '1 Day',
    transport: ['ebike', 'walking'],
    estimatedCost: '8,000 – 12,000 MMK',
    tips: 'Start early to beat the heat. Wear comfortable shoes.',
    tags: 'Sunrise, Heritage, Photography',
    itinerary: [
      { time: 'Early Morning', activity: 'Watch sunrise from Shwesandaw Pagoda' },
      { time: 'Morning', activity: 'Visit Ananda Temple and Thatbyinnyu Temple' },
      { time: 'Afternoon', activity: 'Explore Sulamani Temple and local markets' },
      { time: 'Evening / Sunset', activity: 'Sunset at Pyathada Pagoda' },
    ],
    images: ['https://picsum.photos/seed/bagan1/400/300'],
    created_at: '2025-02-10',
    prices: [
      { id: 1, passenger: 1, price: 50000 },
      { id: 2, passenger: 2, price: 80000 },
      { id: 3, passenger: 5, price: 150000 },
    ]
  },
];

// ==================== ITINERARY BUILDER (stable) ====================
const ItineraryBuilder = React.memo(({ steps, onStepChange, onAdd, onRemove }) => {
  return (
    <div className="itinerary-builder">
      {steps.map((step, index) => (
        <div key={step.id} className="itinerary-row">
          <span className="itinerary-index">{index + 1}</span>
          <select
            value={step.time}
            onChange={(e) => onStepChange(step.id, 'time', e.target.value)}
            className="itinerary-time-select"
          >
            {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
          <input
            type="text"
            placeholder="e.g., Watch sunrise at Shwesandaw"
            value={step.activity}
            onChange={(e) => onStepChange(step.id, 'activity', e.target.value)}
            className="itinerary-activity-input"
          />
          <button type="button" className="itinerary-remove-btn" onClick={() => onRemove(step.id)}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ))}
      <button type="button" className="itinerary-add-btn" onClick={onAdd}>
        <i className="bi bi-plus-lg"></i> Add itinerary step
      </button>
    </div>
  );
});

// ==================== MAIN COMPONENT ====================
function DestinationPlans() {
  // ==================== THEME ====================
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ==================== UI STATES ====================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==================== DATA STATE ====================
  const [plans, setPlans] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ==================== API CONFIG ====================
  const API_BASE = 'http://130.94.21.185:8000/api/admin/destination';
  const API_PRICE_BASE = 'http://130.94.21.185:8000/api/admin/destination/price';
  const BACKEND_URL = 'http://130.94.21.185:8000';

  const getToken = () => localStorage.getItem('token');

  // ==================== FETCH PLANS (with prices) ====================
  const fetchPlans = async () => {
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
      console.log('✅ API Response:', result);

      if (result.success && Array.isArray(result.data)) {
        const priceResponse = await fetch(`${API_PRICE_BASE}/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        let allPrices = [];
        if (priceResponse.ok) {
          const priceResult = await priceResponse.json();
          if (priceResult.success && Array.isArray(priceResult.data)) {
            allPrices = priceResult.data;
          }
        }

        const mappedPlans = result.data.map((item) => {
          const planPrices = allPrices.filter(p => p.destination_id === item.id);
          return {
            id: item.id,
            title: item.title || '',
            zone: item.zone || '',
            duration: item.duration || '',
            transport: Array.isArray(item.transport) ? item.transport : [],
            estimatedCost: item.estimatedCost || '',
            tips: item.tips || '',
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
            itinerary: item.itinerary && typeof item.itinerary === 'object' && !Array.isArray(item.itinerary)
              ? [{ time: item.itinerary.time || 'Morning', activity: item.itinerary.activity || '' }]
              : (Array.isArray(item.itinerary) ? item.itinerary : []),
            images: item.image ? [`${BACKEND_URL}/${item.image.replace(/^\/+/, '')}`] : [],
            created_at: item.created_at || '',
            description: item.description || '',
            prices: planPrices.map(p => ({ id: p.id, passenger: p.passenger, price: p.price })),
          };
        });

        dataRef.current = mappedPlans;
        applyFilters(searchTerm, filterZone, 1);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setError('Failed to fetch destination plans. Showing sample data.');
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOAD SAMPLE DATA (fallback) ====================
  const loadSampleData = () => {
    dataRef.current = [...INITIAL_MOCK_PLANS];
    applyFilters(searchTerm, filterZone, 1);
  };

  // ==================== REF FOR DATA ====================
  const dataRef = useRef([]);

  // ==================== FORM STATE ====================
  const [formData, setFormData] = useState(emptyForm());
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [editImageFiles, setEditImageFiles] = useState([]);

  // ==================== PRICE STATE ====================
  const [priceEntries, setPriceEntries] = useState([]);
  const [editPriceEntries, setEditPriceEntries] = useState([]);

  // ==================== TOAST & CONFIRM ====================
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

  // ==================== THEME ====================
  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // ==================== FILTER / SEARCH / PAGINATION ====================
  const applyFilters = (search = searchTerm, zone = filterZone, pageNum = 1) => {
    let filtered = [...dataRef.current];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.zone.toLowerCase().includes(s) ||
          p.tags.toLowerCase().includes(s)
      );
    }
    if (zone) {
      filtered = filtered.filter((p) => p.zone === zone);
    }
    const total = filtered.length;
    const totalPg = Math.ceil(total / limit) || 1;
    const start = (pageNum - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    setPlans(paginated);
    setTotalItems(total);
    setTotalPages(totalPg);
    setPage(pageNum);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilterZone('');
    applyFilters(value, '', 1);
  };

  const handleFilterZoneChange = (zone) => {
    setFilterZone(zone);
    setSearchTerm('');
    applyFilters('', zone, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    applyFilters(searchTerm, filterZone, newPage);
  };

  // ==================== FORM HANDLERS ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTransportToggle = (key) => {
    setFormData((prev) => {
      const exists = prev.transport.includes(key);
      const next = exists ? prev.transport.filter((t) => t !== key) : [...prev.transport, key];
      return { ...prev, transport: next };
    });
  };

  // ---- Itinerary ----
  const handleStepChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((step) => (step.id === id ? { ...step, [field]: value } : step)),
    }));
  };
  const addStep = () => setFormData((prev) => ({ ...prev, itinerary: [...prev.itinerary, emptyStep()] }));
  const removeStep = (id) => {
    setFormData((prev) => {
      if (prev.itinerary.length <= 1) {
        showToast('warning', 'At least one itinerary step is required.');
        return prev;
      }
      return { ...prev, itinerary: prev.itinerary.filter((step) => step.id !== id) };
    });
  };
  const handleEditStepChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((step) => (step.id === id ? { ...step, [field]: value } : step)),
    }));
  };
  const addEditStep = () => setFormData((prev) => ({ ...prev, itinerary: [...prev.itinerary, emptyStep()] }));
  const removeEditStep = (id) => {
    setFormData((prev) => {
      if (prev.itinerary.length <= 1) {
        showToast('warning', 'At least one itinerary step is required.');
        return prev;
      }
      return { ...prev, itinerary: prev.itinerary.filter((step) => step.id !== id) };
    });
  };

  // ---- Images ----
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFiles([...imageFiles, file]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, reader.result]);
        setFormData({ ...formData, images: [...formData.images, reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImageFiles([...editImageFiles, file]);
      const reader = new FileReader();
      reader.onloadend = () => setEditImages([...editImages, reader.result]);
      reader.readAsDataURL(file);
    }
  };
  const handleEditImageRemove = (index) => {
    setEditImages(editImages.filter((_, i) => i !== index));
    setEditImageFiles(editImageFiles.filter((_, i) => i !== index));
  };

  // ==================== PRICE HANDLERS ====================
  const addPriceEntry = () => {
    setPriceEntries([...priceEntries, { passenger: 1, price: 0 }]);
  };
  const removePriceEntry = (index) => {
    setPriceEntries(priceEntries.filter((_, i) => i !== index));
  };
  const updatePriceEntry = (index, field, value) => {
    const updated = [...priceEntries];
    updated[index][field] = value;
    setPriceEntries(updated);
  };

  const addEditPriceEntry = () => {
    setEditPriceEntries([...editPriceEntries, { passenger: 1, price: 0 }]);
  };
  const removeEditPriceEntry = (index) => {
    setEditPriceEntries(editPriceEntries.filter((_, i) => i !== index));
  };
  const updateEditPriceEntry = (index, field, value) => {
    const updated = [...editPriceEntries];
    updated[index][field] = value;
    setEditPriceEntries(updated);
  };

  // ==================== BUILD FORM DATA FOR API ====================
  const buildPlanFormData = (isEdit = false) => {
    const form = new FormData();
    form.append('title', formData.title.trim());
    form.append('zone', formData.zone);
    form.append('duration', formData.duration);
    form.append('transport', formData.transport.join(', '));
    form.append('tips', formData.tips.trim() || '');
    const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    form.append('tags', tagsArray.join(', '));
    if (formData.itinerary.length > 0) {
      const firstStep = formData.itinerary[0];
      form.append('itinerary', JSON.stringify({
        time: firstStep.time,
        activity: firstStep.activity.trim()
      }));
    }
    form.append('description', formData.description?.trim() || '');
    if (!isEdit && imageFiles.length > 0) {
      form.append('image', imageFiles[0]);
    } else if (isEdit && editImageFiles.length > 0) {
      form.append('image', editImageFiles[0]);
    }
    return form;
  };

  // ==================== CRUD (With API) ====================
  // ---- ADD ----
  const handleAddPlan = async () => {
    if (!formData.title.trim()) { showToast('warning', 'Please enter a plan title.'); return; }
    if (!formData.zone) { showToast('warning', 'Please select a zone.'); return; }
    if (formData.transport.length === 0) { showToast('warning', 'Please select at least one transport option.'); return; }
    const hasEmptyStep = formData.itinerary.some((step) => !step.activity.trim());
    if (hasEmptyStep) { showToast('warning', 'Please fill in every itinerary step.'); return; }
    if (priceEntries.length === 0) { showToast('warning', 'Please add at least one price entry.'); return; }
    for (let p of priceEntries) {
      if (p.passenger <= 0 || p.price <= 0) {
        showToast('warning', 'Price must have passenger > 0 and price > 0.');
        return;
      }
    }

    const token = getToken();
    if (!token) { showToast('error', 'Please login first'); return; }

    setLoading(true);
    try {
      const form = buildPlanFormData(false);
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
      if (!result.success) {
        throw new Error(result.message || 'Create failed');
      }

      const planId = result.data?.id || result.id;
      if (!planId) throw new Error('Plan ID not returned');

      // Create prices using JSON (fixed)
      for (let price of priceEntries) {
        const priceResp = await fetch(`${API_PRICE_BASE}/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination_id: planId,
            passenger: price.passenger,
            price: price.price,
          }),
        });
        if (!priceResp.ok) {
          const errText = await priceResp.text();
          throw new Error(`Failed to create price: ${errText}`);
        }
      }

      showToast('success', 'Plan and prices added successfully!');
      setFormData(emptyForm());
      setImages([]);
      setImageFiles([]);
      setPriceEntries([]);
      await fetchPlans();
    } catch (err) {
      console.error('❌ Add Error:', err);
      showToast('error', 'Failed to add plan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- DELETE ----
  const performDeletePlan = async (id) => {
    const token = getToken();
    if (!token) { showToast('error', 'Please login first'); return; }

    setLoading(true);
    try {
      const plan = dataRef.current.find(p => p.id === id);
      if (plan && plan.prices) {
        for (let price of plan.prices) {
          await fetch(`${API_PRICE_BASE}/delete/${price.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          });
        }
      }
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Delete failed');
      const result = await response.json();
      if (result.success) {
        showToast('success', 'Plan deleted successfully!');
        await fetchPlans();
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error('❌ Delete Error:', err);
      showToast('error', 'Failed to delete plan: ' + err.message);
    } finally {
      setLoading(false);
      setConfirmDialog({ ...confirmDialog, visible: false });
    }
  };

  const handleDeletePlan = (id) => {
    setConfirmDialog({
      visible: true,
      message: '🗑️ Are you sure you want to delete this destination plan?',
      onConfirm: () => performDeletePlan(id),
    });
  };

  // ---- EDIT ----
  const handleEditPlan = (id) => {
    const plan = dataRef.current.find((p) => p.id === id);
    if (!plan) return;

    setSelectedPlanForEdit(plan);
    setFormData({
      title: plan.title || '',
      zone: plan.zone || ZONE_OPTIONS[0],
      duration: plan.duration || DURATION_OPTIONS[0],
      transport: plan.transport || [],
      estimatedCost: plan.estimatedCost || '',
      tips: plan.tips || '',
      tags: plan.tags || '',
      itinerary: plan.itinerary && plan.itinerary.length > 0
        ? plan.itinerary.map((step) => ({ ...emptyStep(), ...step }))
        : [emptyStep()],
      images: plan.images || [],
      description: plan.description || '',
    });
    setEditImages(plan.images || []);
    setEditImageFiles([]);
    setEditPriceEntries(plan.prices ? plan.prices.map(p => ({ id: p.id, passenger: p.passenger, price: p.price })) : []);
    setShowEditModal(true);
  };

  const handleConfirmEdit = async () => {
    if (!formData.title.trim()) { showToast('warning', 'Please enter a plan title.'); return; }
    if (!formData.zone) { showToast('warning', 'Please select a zone.'); return; }
    if (formData.transport.length === 0) { showToast('warning', 'Please select at least one transport option.'); return; }
    const hasEmptyStep = formData.itinerary.some((step) => !step.activity.trim());
    if (hasEmptyStep) { showToast('warning', 'Please fill in every itinerary step.'); return; }
    if (editPriceEntries.length === 0) { showToast('warning', 'Please add at least one price entry.'); return; }
    for (let p of editPriceEntries) {
      if (p.passenger <= 0 || p.price <= 0) {
        showToast('warning', 'Price must have passenger > 0 and price > 0.');
        return;
      }
    }

    const token = getToken();
    if (!token) { showToast('error', 'Please login first'); return; }

    setLoading(true);
    try {
      const form = buildPlanFormData(true);
      const response = await fetch(`${API_BASE}/update/${selectedPlanForEdit.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Update failed');
      }

      const existingPrices = selectedPlanForEdit.prices || [];
      const existingIds = existingPrices.map(p => p.id);

      const toDelete = existingPrices.filter(p => !editPriceEntries.some(ep => ep.id === p.id));
      const toUpdate = editPriceEntries.filter(ep => ep.id && existingIds.includes(ep.id));
      const toCreate = editPriceEntries.filter(ep => !ep.id);

      // Delete
      for (let p of toDelete) {
        const resp = await fetch(`${API_PRICE_BASE}/delete/${p.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!resp.ok) throw new Error(`Failed to delete price ${p.id}`);
      }

      // Update (JSON)
      for (let p of toUpdate) {
        const resp = await fetch(`${API_PRICE_BASE}/update/${p.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            passenger: p.passenger,
            price: p.price,
          }),
        });
        if (!resp.ok) throw new Error(`Failed to update price ${p.id}`);
      }

      // Create (JSON)
      for (let p of toCreate) {
        const resp = await fetch(`${API_PRICE_BASE}/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destination_id: selectedPlanForEdit.id,
            passenger: p.passenger,
            price: p.price,
          }),
        });
        if (!resp.ok) throw new Error(`Failed to create price for passenger ${p.passenger}`);
      }

      showToast('success', 'Plan and prices updated successfully!');
      setShowEditModal(false);
      setSelectedPlanForEdit(null);
      setFormData(emptyForm());
      setImages([]);
      setImageFiles([]);
      setEditImages([]);
      setEditImageFiles([]);
      setEditPriceEntries([]);
      await fetchPlans();
    } catch (err) {
      console.error('❌ Update Error:', err);
      showToast('error', 'Failed to update plan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOAD DATA ON MOUNT ====================
  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== RENDER HELPERS ====================
  const transportLabel = (key) => TRANSPORT_OPTIONS.find((t) => t.key === key)?.label || key;
  const transportIcon = (key) => TRANSPORT_OPTIONS.find((t) => t.key === key)?.icon || 'bi-signpost-2';

  // ==================== CardActions ====================
  const CardActions = ({ planId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = (e) => { e.stopPropagation(); setIsOpen(!isOpen); };
    const handleEdit = (e) => { e.stopPropagation(); setIsOpen(false); handleEditPlan(planId); };
    const handleDelete = (e) => { e.stopPropagation(); setIsOpen(false); handleDeletePlan(planId); };
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) setIsOpen(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);
    return (
      <div className="card-actions-wrapper">
        <button className="card-actions-btn" onClick={handleToggle}><i className="bi bi-three-dots-vertical"></i></button>
        <div className={`card-actions-dropdown ${isOpen ? 'show' : ''}`}>
          <button className="edit-btn" onClick={handleEdit}><i className="bi bi-pencil-square"></i> Edit</button>
          <button className="delete-btn" onClick={handleDelete}><i className="bi bi-trash"></i> Delete</button>
        </div>
      </div>
    );
  };

  // ==================== PRICE LIST RENDER ====================
  const renderPriceList = (prices) => {
    if (!prices || prices.length === 0) return null;
    return (
      <div className="plan-price-list" style={{ marginTop: '5px' }}>
        <small><i className="bi bi-cash-coin"></i> Prices:</small>
        <ul style={{ listStyle: 'none', paddingLeft: '0', margin: '2px 0' }}>
          {prices.map(p => (
            <li key={p.id} style={{ fontSize: '12px', display: 'inline-block', marginRight: '10px' }}>
              {p.passenger} {p.passenger === 1 ? 'person' : 'people'}: <strong>{p.price.toLocaleString()} MMK</strong>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Bagan Destination Plans Management" onThemeChange={handleThemeChange} />

      {/* Toast */}
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

      {/* Confirm Delete */}
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

      {/* Loading / Error Indicator */}
      {loading && <div style={{ textAlign: 'center', padding: '10px', background: isDarkMode ? '#333' : '#f0f0f0' }}>⏳ Loading...</div>}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '5px' }}>
          ⚠️ {error} <button onClick={() => setError(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Search + Filter Row */}
      <div className="search-actions-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div className="search-bar-wrapper" style={{ flex: '1 1 250px' }}>
          <i className="bi bi-search search-icon"></i>
          <input type="text" placeholder="Search by title, zone or tags..." className="search-input-full" value={searchTerm} onChange={handleSearch} />
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select value={filterZone} onChange={(e) => handleFilterZoneChange(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ced4da', borderRadius: '6px', fontSize: '14px', minWidth: '160px' }}>
            <option value="">All zones</option>
            {ZONE_OPTIONS.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6c757d' }}>Total: {totalItems} items</div>
      </div>

      {/* Two Columns Layout */}
      <div className="hotels-two-columns">
        {/* Left: Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="image-gallery-top">
              <label className="gallery-label">📸 Destination Plan Images</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="plan-image-upload-gallery" />
                  <label htmlFor="plan-image-upload-gallery" className="upload-box"><i className="bi bi-plus-lg"></i><span>Add Image</span></label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {images.map((img, index) => (
                    <div key={index} className="image-item"><img src={img} alt={`Preview ${index}`} /><button className="remove-image-btn" onClick={() => removeImage(index)}><i className="bi bi-x-lg"></i></button></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-fields-section">
              <div className="add-form-group"><label>Plan Title *</label><input type="text" name="title" placeholder="e.g., Old Bagan 1-Day Temple Trail" value={formData.title} onChange={handleInputChange} /></div>
              <div className="add-form-group" style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}><label>Zone *</label><select name="zone" value={formData.zone} onChange={handleInputChange}>{ZONE_OPTIONS.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></div>
                <div style={{ flex: 1 }}><label>Duration *</label><select name="duration" value={formData.duration} onChange={handleInputChange}>{DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div className="add-form-group"><label>Recommended transport * (select all that apply)</label>
                <div className="transport-chip-group">{TRANSPORT_OPTIONS.map((opt) => { const active = formData.transport.includes(opt.key); return (<button type="button" key={opt.key} className={`transport-chip ${active ? 'active' : ''}`} onClick={() => handleTransportToggle(opt.key)}><i className={`bi ${opt.icon}`}></i> {opt.label}</button>); })}</div>
              </div>
              <div className="add-form-group"><label>Description</label><textarea name="description" rows="2" placeholder="Brief description..." value={formData.description} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Suggested itinerary *</label>
                <ItineraryBuilder
                  steps={formData.itinerary}
                  onStepChange={handleStepChange}
                  onAdd={addStep}
                  onRemove={removeStep}
                />
              </div>
              <div className="add-form-group"><label>Tags (comma separated)</label><input type="text" name="tags" placeholder="e.g., Sunrise, Family friendly" value={formData.tags} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Traveler tips</label><textarea name="tips" rows="3" placeholder="e.g., Cover shoulders and knees..." value={formData.tips} onChange={handleInputChange} /></div>

              {/* PRICE MANAGEMENT SECTION (Add Form) */}
              <div className="add-form-group" style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>💰 Price per Passenger (at least one)</label>
                {priceEntries.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="Passengers"
                      value={entry.passenger}
                      onChange={(e) => updatePriceEntry(idx, 'passenger', parseInt(e.target.value) || 0)}
                      style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da' }}
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Price (MMK)"
                      value={entry.price}
                      onChange={(e) => updatePriceEntry(idx, 'price', parseInt(e.target.value) || 0)}
                      style={{ width: '150px', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da' }}
                      min="1"
                    />
                    <button type="button" onClick={() => removePriceEntry(idx)} style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addPriceEntry} style={{ background: 'transparent', border: '1px dashed #6c757d', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', color: '#6c757d' }}>
                  <i className="bi bi-plus-lg"></i> Add Price
                </button>
              </div>

              <button className="add-item-btn-full" onClick={handleAddPlan} disabled={loading}>{loading ? 'Adding...' : 'Add Destination Plan'}</button>
            </div>
          </div>
        </div>

        {/* Right: Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {plans.length > 0 ? plans.map((plan) => (
                <div key={plan.id} className="hotel-card-vertical plan-card">
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      {plan.images && plan.images.length > 0 ? <img src={plan.images[0]} alt={plan.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; const parent = e.target.parentElement; if (parent) { parent.innerHTML = `<div style="font-size:60px;display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#d97757 0%,#8a4a2a 100%);color:white">🗺️</div>`; } }} /> : <div style={{ fontSize: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #d97757 0%, #8a4a2a 100%)', color: 'white' }}>🗺️</div>}
                    </div>
                    <CardActions planId={plan.id} />
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{plan.title}</h3>
                    <p className="hotel-location"><i className="bi bi-geo-alt-fill"></i> {plan.zone} <span className="plan-duration-badge"><i className="bi bi-calendar3"></i> {plan.duration}</span></p>
                    {plan.transport && plan.transport.length > 0 && <div className="plan-transport-row">{plan.transport.map((t) => <span key={t} className="plan-transport-badge"><i className={`bi ${transportIcon(t)}`}></i> {transportLabel(t)}</span>)}</div>}
                    {renderPriceList(plan.prices)}
                    {plan.itinerary && plan.itinerary.length > 0 && <div className="plan-itinerary-preview">{plan.itinerary.slice(0, 3).map((step, idx) => (<div key={idx} className="plan-itinerary-preview-row"><span className="plan-itinerary-time">{step.time}</span><span className="plan-itinerary-activity">{step.activity && step.activity.length > 50 ? `${step.activity.substring(0, 50)}...` : step.activity}</span></div>))}{plan.itinerary.length > 3 && <p className="plan-itinerary-more">+{plan.itinerary.length - 3} more steps</p>}</div>}
                    {plan.tags && <div className="pagoda-tags"><i className="bi bi-tag-fill"></i> {plan.tags}</div>}
                    {plan.created_at && <p className="created-at" style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}><i className="bi bi-clock"></i> Added: {plan.created_at}</p>}
                  </div>
                </div>
              )) : <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#999' }}><i className="bi bi-signpost-split" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i><p>No destination plans found.</p></div>}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '10px 0', flexWrap: 'wrap' }}>
                <button className="pagination-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ced4da', backgroundColor: page === 1 ? '#e9ecef' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}><i className="bi bi-chevron-left"></i> Prev</button>
                {[...Array(totalPages).keys()].map((num) => (<button key={num + 1} onClick={() => handlePageChange(num + 1)} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ced4da', backgroundColor: page === num + 1 ? '#0d6efd' : 'white', color: page === num + 1 ? 'white' : '#212529', cursor: 'pointer', fontWeight: page === num + 1 ? 'bold' : 'normal' }}>{num + 1}</button>))}
                <button className="pagination-btn" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ced4da', backgroundColor: page === totalPages ? '#e9ecef' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next <i className="bi bi-chevron-right"></i></button>
                <span style={{ fontSize: '14px', color: '#6c757d', marginLeft: '10px' }}>Page {page} of {totalPages}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== EDIT MODAL ==================== */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>✏️ Edit Destination Plan</h2><button className="close-btn" onClick={() => setShowEditModal(false)}><i className="bi bi-x-lg"></i></button></div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '20px' }}><label style={{ fontWeight: 'bold' }}>📸 Edit Images</label>
                <div className="image-gallery-wrapper" style={{ marginTop: '10px' }}>
                  <div className="image-upload-box"><input type="file" accept="image/*" onChange={handleEditImageUpload} style={{ display: 'none' }} id="edit-plan-image-upload" /><label htmlFor="edit-plan-image-upload" className="upload-box"><i className="bi bi-plus-lg"></i><span>Add Image</span></label></div>
                  <div className="image-scroll-container-horizontal">{editImages.map((img, index) => (<div key={index} className="image-item"><img src={img} alt={`Edit Preview ${index}`} /><button className="remove-image-btn" onClick={() => handleEditImageRemove(index)}><i className="bi bi-x-lg"></i></button></div>))}</div>
                </div>
                <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>💡 Add new images or remove existing ones.</small>
              </div>
              <div className="form-group"><label>Plan Title *</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} /></div>
              <div className="form-group" style={{ display: 'flex', gap: '10px' }}><div style={{ flex: 1 }}><label>Zone *</label><select name="zone" value={formData.zone} onChange={handleInputChange}>{ZONE_OPTIONS.map((zone) => <option key={zone} value={zone}>{zone}</option>)}</select></div><div style={{ flex: 1 }}><label>Duration *</label><select name="duration" value={formData.duration} onChange={handleInputChange}>{DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}</select></div></div>
              <div className="form-group"><label>Recommended transport *</label><div className="transport-chip-group">{TRANSPORT_OPTIONS.map((opt) => { const active = formData.transport.includes(opt.key); return (<button type="button" key={opt.key} className={`transport-chip ${active ? 'active' : ''}`} onClick={() => handleTransportToggle(opt.key)}><i className={`bi ${opt.icon}`}></i> {opt.label}</button>); })}</div></div>
              <div className="form-group"><label>Description</label><textarea name="description" rows="2" value={formData.description} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Suggested itinerary *</label>
                <ItineraryBuilder
                  steps={formData.itinerary}
                  onStepChange={handleEditStepChange}
                  onAdd={addEditStep}
                  onRemove={removeEditStep}
                />
              </div>
              <div className="form-group"><label>Tags</label><input type="text" name="tags" value={formData.tags} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Traveler tips</label><textarea name="tips" rows="3" value={formData.tips} onChange={handleInputChange} /></div>

              {/* PRICE MANAGEMENT SECTION (Edit Modal) */}
              <div className="form-group" style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>💰 Edit Prices (passenger / price in MMK)</label>
                {editPriceEntries.map((entry, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '5px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="Passengers"
                      value={entry.passenger}
                      onChange={(e) => updateEditPriceEntry(idx, 'passenger', parseInt(e.target.value) || 0)}
                      style={{ width: '100px', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da' }}
                      min="1"
                    />
                    <input
                      type="number"
                      placeholder="Price (MMK)"
                      value={entry.price}
                      onChange={(e) => updateEditPriceEntry(idx, 'price', parseInt(e.target.value) || 0)}
                      style={{ width: '150px', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da' }}
                      min="1"
                    />
                    <button type="button" onClick={() => removeEditPriceEntry(idx)} style={{ background: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addEditPriceEntry} style={{ background: 'transparent', border: '1px dashed #6c757d', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', color: '#6c757d' }}>
                  <i className="bi bi-plus-lg"></i> Add Price
                </button>
              </div>
            </div>
            <div className="modal-footer"><button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button><button className="add-item-btn" onClick={handleConfirmEdit} disabled={loading}>{loading ? 'Updating...' : 'Confirm Edit'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DestinationPlans;