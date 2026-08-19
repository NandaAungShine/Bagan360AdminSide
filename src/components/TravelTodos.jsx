import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function TravelTodos() {
  // ===== 1. THEME =====
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ===== 2. STATE =====
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lifo'); // lifo, fifo, az, za
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Active'
  });

  // Edit modal
  const [selectedTodoForEdit, setSelectedTodoForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Image state (like Banner)
  const [images, setImages] = useState([]);

  // ===== 3. TOAST & CONFIRM =====
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

  // ===== 4. THEME HANDLER =====
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

  // ===== 5. SAMPLE DATA =====
  const sampleTodos = [
    { id: 1, title: 'Bring comfortable walking shoes', description: 'Bagan has many temples to explore on foot.', status: 'Active', created_at: '2024-03-20' },
    { id: 2, title: 'Reserve hot air balloon in advance', description: 'Balloon rides fill up quickly during peak season.', status: 'Active', created_at: '2024-03-18' },
    { id: 3, title: 'Carry sunscreen and a hat', description: 'The sun can be very strong during the day.', status: 'Inactive', created_at: '2024-03-15' },
    { id: 4, title: 'Book accommodation early', description: 'Hotels get fully booked during festival seasons.', status: 'Active', created_at: '2024-03-25' },
    { id: 5, title: 'Learn basic Burmese phrases', description: 'Locals appreciate when tourists try to speak their language.', status: 'Active', created_at: '2024-03-22' },
  ];

  // Load from localStorage or use sample
  useEffect(() => {
    const stored = localStorage.getItem('travelTodos');
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch {
        setTodos(sampleTodos);
      }
    } else {
      setTodos(sampleTodos);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (todos.length > 0) {
      localStorage.setItem('travelTodos', JSON.stringify(todos));
    }
  }, [todos]);

  // ===== 6. FORM HANDLERS =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Image upload (like Banner)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setImages([...images, imageUrl]);
        setFormData({ ...formData, imageUrl: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (newImages.length === 0) {
      setFormData({ ...formData, imageUrl: '' });
    } else {
      setFormData({ ...formData, imageUrl: newImages[0] });
    }
  };

  // ===== 7. ADD TODO (LIFO by default) =====
  const handleAddTodo = () => {
    setLoading(true);
    try {
      if (!formData.title.trim()) {
        showToast('warning', 'Please enter a title.');
        setLoading(false);
        return;
      }

      const newTodo = {
        id: Date.now(),
        title: formData.title.trim(),
        description: formData.description.trim() || 'No description provided.',
        status: formData.status || 'Active',
        created_at: new Date().toISOString().split('T')[0],
      };

      setTodos([newTodo, ...todos]);
      setFormData({ title: '', description: '', status: 'Active' });
      setImages([]);
      showToast('success', 'To-Do added successfully!');
    } catch (err) {
      showToast('error', 'Failed to add to-do.');
    } finally {
      setLoading(false);
    }
  };

  // ===== 8. DELETE =====
  const performDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    showToast('success', 'To-Do deleted successfully!');
  };

  const handleDeleteTodo = (id) => {
    setConfirmDialog({
      visible: true,
      message: 'Are you sure you want to delete this to-do item?',
      onConfirm: () => performDeleteTodo(id),
    });
  };

  // ===== 9. EDIT =====
  const handleEditFromCard = (todo) => {
    setSelectedTodoForEdit(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      status: todo.status || 'Active',
    });
    setImages(todo.imageUrl ? [todo.imageUrl] : []);
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    setLoading(true);
    try {
      if (selectedTodoForEdit && formData.title.trim()) {
        const updatedTodos = todos.map(todo =>
          todo.id === selectedTodoForEdit.id
            ? {
                ...todo,
                title: formData.title.trim(),
                description: formData.description.trim() || 'No description provided.',
                status: formData.status,
              }
            : todo
        );
        setTodos(updatedTodos);
        setShowEditModal(false);
        setSelectedTodoForEdit(null);
        setFormData({ title: '', description: '', status: 'Active' });
        setImages([]);
        showToast('success', 'To-Do updated successfully!');
      } else {
        showToast('warning', 'Title is required.');
      }
    } catch (err) {
      showToast('error', 'Failed to update to-do.');
    } finally {
      setLoading(false);
    }
  };

  // ===== 10. SORTING FUNCTIONS =====
  const getSortedTodos = (todoList) => {
    const sorted = [...todoList];
    switch (sortBy) {
      case 'lifo':
        return sorted.sort((a, b) => b.id - a.id); // Newest first
      case 'fifo':
        return sorted.sort((a, b) => a.id - b.id); // Oldest first
      case 'az':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'za':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  };

  // ===== 11. FILTER =====
  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTodos = getSortedTodos(filteredTodos);

  // ===== 12. STATS =====
  const totalTodos = todos.length;
  const activeTodos = todos.filter(t => t.status === 'Active').length;
  const inactiveTodos = todos.filter(t => t.status === 'Inactive').length;

  // ===== 13. STATUS BADGE =====
  const getStatusStyle = (status) => {
    if (status === 'Active') {
      return { backgroundColor: '#d1e7dd', color: '#0f5132' };
    }
    return { backgroundColor: '#f8d7da', color: '#842029' };
  };

  // ===== 14. CARD ACTIONS (Dropdown) =====
  const CardActions = ({ todoId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      const todo = todos.find(t => t.id === todoId);
      if (todo) handleEditFromCard(todo);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      const todo = todos.find(t => t.id === todoId);
      if (todo) handleDeleteTodo(todoId);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.card-actions-wrapper')) {
          setIsOpen(false);
        }
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

  // ===== 15. MAIN RENDER =====
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Traveler To-Do List (Admin)" onThemeChange={handleThemeChange} />

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

      {/* Search & Actions Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search to-do by title or description..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="sort-dropdown-wrapper">
          <button className="sort-btn" onClick={() => setShowSortDropdown(!showSortDropdown)}>
            <i className="bi bi-arrow-down-up"></i> Sort: {sortBy.toUpperCase()} <i className="bi bi-chevron-down"></i>
          </button>
          {showSortDropdown && (
            <div className="sort-dropdown-menu">
              <button onClick={() => { setSortBy('lifo'); setShowSortDropdown(false); }}>
                <i className="bi bi-arrow-up-circle"></i> Last In, First Out (LIFO)
              </button>
              <button onClick={() => { setSortBy('fifo'); setShowSortDropdown(false); }}>
                <i className="bi bi-arrow-down-circle"></i> First In, First Out (FIFO)
              </button>
              <button onClick={() => { setSortBy('az'); setShowSortDropdown(false); }}>
                <i className="bi bi-sort-alpha-down"></i> Alphabetical (A-Z)
              </button>
              <button onClick={() => { setSortBy('za'); setShowSortDropdown(false); }}>
                <i className="bi bi-sort-alpha-up"></i> Alphabetical (Z-A)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-cards-row">
        <div className="stat-card-mini">
          <div className="stat-icon-mini total"><i className="bi bi-list-check"></i></div>
          <div className="stat-info-mini"><h3>{totalTodos}</h3><p>Total Items</p></div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini active"><i className="bi bi-check-circle-fill"></i></div>
          <div className="stat-info-mini"><h3>{activeTodos}</h3><p>Active</p></div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini inactive"><i className="bi bi-x-circle-fill"></i></div>
          <div className="stat-info-mini"><h3>{inactiveTodos}</h3><p>Inactive</p></div>
        </div>
        <div className="stat-card-mini" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#bbb' }}>
            <i className="bi bi-info-circle" style={{ fontSize: '20px' }}></i>
            <span style={{ fontSize: '13px' }}>Sorting: <strong>{sortBy.toUpperCase()}</strong> — {sortBy === 'lifo' ? 'Newest items appear first' : sortBy === 'fifo' ? 'Oldest items appear first' : 'Sorted by title'}</span>
          </div>
        </div>
      </div>

      {/* Two Columns Layout (Like Banner.jsx) */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery (optional) */}
            <div className="image-gallery-top">
              <label className="gallery-label">📸 Image (Optional)</label>
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

            {/* Form Fields */}
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Bring comfortable shoes"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="2"
                  placeholder="e.g., Bagan has many temples to explore on foot."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button className="add-item-btn-full" onClick={handleAddTodo} disabled={loading}>
                {loading ? 'Adding...' : 'Add To-Do'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Todo Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {sortedTodos.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6c757d' }}>
                  <i className="bi bi-clipboard-check" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No to-do items found. Add one using the form on the left.</p>
                </div>
              ) : (
                sortedTodos.map((todo) => (
                  <div key={todo.id} className="hotel-card-vertical" style={{ borderLeft: `4px solid ${todo.status === 'Active' ? '#28a745' : '#dc3545'}` }}>
                    <div className="hotel-card-image" style={{ minHeight: '80px', background: isDarkMode ? '#2d2d2d' : '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                      <div style={{ fontSize: '32px' }}>📋</div>
                      {/* Status Badge - LEFT TOP */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        ...getStatusStyle(todo.status)
                      }}>
                        {todo.status}
                      </div>
                      {/* Card Actions - RIGHT TOP */}
                      <CardActions todoId={todo.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name" style={{ fontSize: '16px' }}>{todo.title}</h3>
                      <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>{todo.description}</p>
                      <p className="hotel-location">
                        <i className="bi bi-calendar3"></i> Added: {todo.created_at}
                      </p>
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
            <div className="modal-header">
              <h2>Edit To-Do</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
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

export default TravelTodos;