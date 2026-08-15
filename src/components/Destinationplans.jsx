import React, { useState, useRef } from 'react';
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

const emptyStep = () => ({ id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, time: 'Morning', activity: '' });

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
});

// ==================== MOCK DATA (ပုံအကြမ်းအတွက်) ====================
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
  },
  {
    id: generateId(),
    title: 'New Bagan Riverside Explorer',
    zone: 'New Bagan',
    duration: '2 Days',
    transport: ['bicycle', 'taxi'],
    estimatedCost: '15,000 – 20,000 MMK',
    tips: 'Bring a hat and sunscreen. Try the local tea shops.',
    tags: 'Riverside, Culture, Relaxed',
    itinerary: [
      { time: 'Morning', activity: 'Cycle along the Ayeyarwady River' },
      { time: 'Afternoon', activity: 'Visit Manuha Temple and Nanpaya Temple' },
      { time: 'Evening / Sunset', activity: 'Dinner with river view at a local restaurant' },
    ],
    images: ['https://picsum.photos/seed/bagan2/400/300'],
    created_at: '2025-02-12',
  },
  {
    id: generateId(),
    title: 'Nyaung U Market & Monasteries',
    zone: 'Nyaung U',
    duration: '1 Day',
    transport: ['horsecart', 'walking'],
    estimatedCost: '5,000 – 8,000 MMK',
    tips: 'Visit the morning market for fresh produce and souvenirs.',
    tags: 'Market, Monastic, Local Life',
    itinerary: [
      { time: 'Morning', activity: 'Explore Nyaung U Market' },
      { time: 'Afternoon', activity: 'Visit Shwezigon Pagoda and Wetkyi-In Gubyaukgyi' },
      { time: 'Evening / Sunset', activity: 'Stroll along the riverbank' },
    ],
    images: ['https://picsum.photos/seed/bagan3/400/300'],
    created_at: '2025-02-15',
  },
  {
    id: generateId(),
    title: 'Myinkaba Village Art & Crafts',
    zone: 'Myinkaba',
    duration: '2 Days',
    transport: ['ebike', 'bicycle'],
    estimatedCost: '10,000 – 14,000 MMK',
    tips: 'Try your hand at lacquerware making.',
    tags: 'Artisan, Handicrafts, Village',
    itinerary: [
      { time: 'Morning', activity: 'Lacquerware workshop visit' },
      { time: 'Afternoon', activity: 'Explore Myinkaba Village and local temples' },
      { time: 'Evening / Sunset', activity: 'Sunset at a nearby temple mound' },
    ],
    images: ['https://picsum.photos/seed/bagan4/400/300'],
    created_at: '2025-02-18',
  },
  {
    id: generateId(),
    title: 'Hot Air Balloon Adventure',
    zone: 'Multiple Zones',
    duration: '3+ Days',
    transport: ['balloon', 'taxi'],
    estimatedCost: '120,000 – 150,000 MMK',
    tips: 'Book in advance. Wear warm clothes for early morning flights.',
    tags: 'Adventure, Luxury, Panoramic',
    itinerary: [
      { time: 'Early Morning', activity: 'Hot air balloon flight over Bagan' },
      { time: 'Morning', activity: 'Breakfast at a resort with temple views' },
      { time: 'Afternoon', activity: 'Guided tour of lesser‑known temples' },
      { time: 'Evening / Sunset', activity: 'Sunset boat ride on the river' },
    ],
    images: ['https://picsum.photos/seed/bagan5/400/300'],
    created_at: '2025-02-20',
  },
];

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

  // ---- Mock Data ကို Ref နဲ့ သိမ်းထား (ပြင်ဆင်မှုတွေ ချက်ချင်းအလုပ်လုပ်ဖို့) ----
  const dataRef = useRef([...INITIAL_MOCK_PLANS]);

  // ---- Display အတွက် State (ဒါကို ပြင်ဆင်ပြီး ပြန်သတ်မှတ်မယ်) ----
  const [plans, setPlans] = useState(dataRef.current);
  const [totalItems, setTotalItems] = useState(dataRef.current.length);
  const [totalPages, setTotalPages] = useState(Math.ceil(dataRef.current.length / limit) || 1);

  // ==================== FORM STATE ====================
  const [formData, setFormData] = useState(emptyForm());
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add Form Images
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Edit Modal Images
  const [editImages, setEditImages] = useState([]);
  const [editImageFiles, setEditImageFiles] = useState([]);

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

  // ==================== FILTER / SEARCH / PAGINATION (Synchronous) ====================
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

  // ---- Search / Filter Handlers ----
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

  // ==================== VALIDATION ====================
  const validateForm = () => {
    if (!formData.title.trim()) { showToast('warning', 'Please enter a plan title.'); return false; }
    if (!formData.zone) { showToast('warning', 'Please select a zone.'); return false; }
    if (formData.transport.length === 0) { showToast('warning', 'Please select at least one transport option.'); return false; }
    const hasEmptyStep = formData.itinerary.some((step) => !step.activity.trim());
    if (hasEmptyStep) { showToast('warning', 'Please fill in every itinerary step.'); return false; }
    return true;
  };

  // ==================== BUILD PLAN OBJECT ====================
  const buildPlanObject = (files) => ({
    id: generateId(),
    title: formData.title.trim(),
    zone: formData.zone,
    duration: formData.duration,
    transport: [...formData.transport],
    estimatedCost: formData.estimatedCost.trim() || '',
    tips: formData.tips.trim() || '',
    tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean).join(', ') : '',
    itinerary: formData.itinerary.map(({ time, activity }) => ({ time, activity: activity.trim() })),
    images: files.length > 0 ? files.map((f) => URL.createObjectURL(f)) : ['https://picsum.photos/seed/placeholder/400/300'],
    created_at: new Date().toISOString().split('T')[0],
  });

  // ==================== CRUD (Synchronous) ====================
  // ---- ADD ----
  const handleAddPlan = () => {
    if (!validateForm()) return;
    const newPlan = buildPlanObject(imageFiles);
    dataRef.current = [newPlan, ...dataRef.current];
    applyFilters(searchTerm, filterZone, 1);
    setFormData(emptyForm());
    setImages([]);
    setImageFiles([]);
    showToast('success', 'Plan added successfully!');
  };

  // ---- DELETE ----
  const performDeletePlan = (id) => {
    dataRef.current = dataRef.current.filter((p) => p.id !== id);
    applyFilters(searchTerm, filterZone, page);
    showToast('success', 'Plan deleted successfully!');
    setConfirmDialog({ ...confirmDialog, visible: false });
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
    });
    setEditImages(plan.images || []);
    setEditImageFiles([]);
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    if (!selectedPlanForEdit || !validateForm()) return;
    const index = dataRef.current.findIndex((p) => p.id === selectedPlanForEdit.id);
    if (index === -1) return;
    const updated = {
      ...selectedPlanForEdit,
      title: formData.title.trim(),
      zone: formData.zone,
      duration: formData.duration,
      transport: [...formData.transport],
      estimatedCost: formData.estimatedCost.trim() || '',
      tips: formData.tips.trim() || '',
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean).join(', ') : '',
      itinerary: formData.itinerary.map(({ time, activity }) => ({ time, activity: activity.trim() })),
      images: editImageFiles.length > 0 ? editImageFiles.map((f) => URL.createObjectURL(f)) : editImages.length > 0 ? editImages : ['https://picsum.photos/seed/placeholder/400/300'],
    };
    dataRef.current[index] = updated;
    applyFilters(searchTerm, filterZone, page);
    setShowEditModal(false);
    setSelectedPlanForEdit(null);
    setEditImages([]);
    setEditImageFiles([]);
    setFormData(emptyForm());
    setImages([]);
    setImageFiles([]);
    showToast('success', 'Plan updated successfully!');
  };

  // ==================== RENDER HELPERS ====================
  const transportLabel = (key) => TRANSPORT_OPTIONS.find((t) => t.key === key)?.label || key;
  const transportIcon = (key) => TRANSPORT_OPTIONS.find((t) => t.key === key)?.icon || 'bi-signpost-2';

  // ==================== CardActions ====================
  const CardActions = ({ planId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = (e) => { e.stopPropagation(); setIsOpen(!isOpen); };
    const handleEdit = (e) => { e.stopPropagation(); setIsOpen(false); handleEditPlan(planId); };
    const handleDelete = (e) => { e.stopPropagation(); setIsOpen(false); handleDeletePlan(planId); };
    React.useEffect(() => {
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

  // ==================== ItineraryBuilder ====================
  const ItineraryBuilder = ({ onStepChange, onAdd, onRemove }) => (
    <div className="itinerary-builder">
      {formData.itinerary.map((step, index) => (
        <div key={step.id} className="itinerary-row">
          <span className="itinerary-index">{index + 1}</span>
          <select value={step.time} onChange={(e) => onStepChange(step.id, 'time', e.target.value)} className="itinerary-time-select">
            {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
          <input type="text" placeholder="e.g., Watch sunrise at Shwesandaw" value={step.activity} onChange={(e) => onStepChange(step.id, 'activity', e.target.value)} className="itinerary-activity-input" />
          <button type="button" className="itinerary-remove-btn" onClick={() => onRemove(step.id)}><i className="bi bi-x-lg"></i></button>
        </div>
      ))}
      <button type="button" className="itinerary-add-btn" onClick={onAdd}><i className="bi bi-plus-lg"></i> Add itinerary step</button>
    </div>
  );

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
              <div className="add-form-group"><label>Estimated cost</label><input type="text" name="estimatedCost" placeholder="e.g., 8,000 - 15,000 MMK" value={formData.estimatedCost} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Suggested itinerary *</label><ItineraryBuilder onStepChange={handleStepChange} onAdd={addStep} onRemove={removeStep} /></div>
              <div className="add-form-group"><label>Tags (comma separated)</label><input type="text" name="tags" placeholder="e.g., Sunrise, Family friendly" value={formData.tags} onChange={handleInputChange} /></div>
              <div className="add-form-group"><label>Traveler tips</label><textarea name="tips" rows="3" placeholder="e.g., Cover shoulders and knees..." value={formData.tips} onChange={handleInputChange} /></div>
              <button className="add-item-btn-full" onClick={handleAddPlan}>Add Destination Plan</button>
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
                    {plan.estimatedCost && <p className="best-time"><i className="bi bi-cash-coin"></i> {plan.estimatedCost}</p>}
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
              <div className="form-group"><label>Estimated cost</label><input type="text" name="estimatedCost" value={formData.estimatedCost} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Suggested itinerary *</label><ItineraryBuilder onStepChange={handleEditStepChange} onAdd={addEditStep} onRemove={removeEditStep} /></div>
              <div className="form-group"><label>Tags</label><input type="text" name="tags" value={formData.tags} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Traveler tips</label><textarea name="tips" rows="3" value={formData.tips} onChange={handleInputChange} /></div>
            </div>
            <div className="modal-footer"><button className="discard-btn" onClick={() => setShowEditModal(false)}>Cancel</button><button className="add-item-btn" onClick={handleConfirmEdit}>Confirm Edit</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DestinationPlans;