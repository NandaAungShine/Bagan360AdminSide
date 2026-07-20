import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';

function HistoryOfPagodas() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ----- Search / Filter / Pagination States -----
  const [searchTerm, setSearchTerm] = useState('');
  const [filterName, setFilterName] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // 10 per page
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ----- Other States -----
  const [selectedPagodaForEdit, setSelectedPagodaForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    pagodaName: '',
    location: '',
    // price & discount removed
    startDate: '',
    endDate: '',
    description: '',
    history: '',
    tags: '',
    facilities: '',
    images: []
  });

  const [pagodas, setPagodas] = useState([]);

  // ----- Axios Setup -----
  const getToken = () => localStorage.getItem('token');

  const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
      console.error('API Error:', error);
      if (error.response) {
        alert(`Error ${error.response.status}: ${error.response.data?.message || error.response.data?.error || 'Server error'}`);
      } else if (error.request) {
        alert('Cannot connect to server. Please check your connection.');
      } else {
        alert('An error occurred. Please try again.');
      }
      return Promise.reject(error);
    }
  );

  // ----- Main Fetch Function -----
  const fetchPagodas = async ({
    pageNum = page,
    limitNum = limit,
    search = searchTerm,
    filter = filterName,
  } = {}) => {
    setLoading(true);
    setError(null);

    try {
      let url = '';
      if (search) {
        url = `/admin/pagoda/search?search=${encodeURIComponent(search)}&page=${pageNum}&limit=${limitNum}`;
      } else if (filter) {
        url = `/admin/pagoda/filter?name=${encodeURIComponent(filter)}&page=${pageNum}&limit=${limitNum}`;
      } else {
        url = `/admin/pagoda/list?page=${pageNum}&limit=${limitNum}`;
      }

      console.log('Fetching:', url);
      const response = await api.get(url);
      console.log('Response:', response.data);

      if (response.data && response.data.success && response.data.data) {
        const formattedPagodas = response.data.data.map((item) => ({
          id: item.id,
          name: item.name || '',
          nameEn: item.name || '',
          location: item.location || '',
          locationMm: item.location || '',
          // price removed; we don't need fee now
          rating: 4.5,
          reviews: '0',
          images: item.image ? [`http://130.94.21.185:8000/${item.image}`] : ['🛕'],
          descriptionMm: item.description || '',
          description: item.description || '',
          historyMm: item.history || '',
          history: item.history || '',
          tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
          bestTimeToVisit: item.visit_date || '',
          bestTimeToVisitMm: item.visit_date || '',
          facilities: item.facilities || '',
          startDate: item.visit_date || '',
          endDate: item.visit_date || '',
          created_at: item.created_at || '',
        }));

        setPagodas(formattedPagodas);

        // Pagination info
        const pagination = response.data.pagination || response.data.meta || {};
        setTotalPages(pagination.totalPages || pagination.total_pages || 1);
        setTotalItems(pagination.total || pagination.totalItems || formattedPagodas.length);
        setPage(pageNum);
      } else {
        setPagodas([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setError('Failed to fetch pagodas. Please try again.');
      setPagodas([]);
    } finally {
      setLoading(false);
    }
  };

  // ----- Initial Load -----
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }
    fetchPagodas({ pageNum: 1 });
  }, []);

  // ----- Theme -----
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleThemeChange = (isDark) => setIsDarkMode(isDark);

  // ----- Search Handler -----
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilterName(''); // Clear filter
    fetchPagodas({ search: value, filter: '', pageNum: 1 });
  };

  // ----- Filter Handler -----
  const handleFilter = () => {
    if (!filterName.trim()) {
      alert('Please enter a name to filter.');
      return;
    }
    setSearchTerm(''); // Clear search
    fetchPagodas({ filter: filterName, search: '', pageNum: 1 });
  };

  // ----- Page Change -----
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchPagodas({ pageNum: newPage });
  };

  // ----- Form Handlers (price/discount removed) -----
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
    const newImages = images.filter((_, i) => i !== index);
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setImages(newImages);
    setImageFiles(newImageFiles);
    setFormData({ ...formData, images: newImages });
  };

  // ----- Add Pagoda (price/discount removed) -----
  const handleAddPagoda = async () => {
    if (!formData.pagodaName || !formData.location) {
      alert('Please fill in pagoda name and location.');
      return;
    }
    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.pagodaName);
      formDataToSend.append('location', formData.location);
      // fee and discount removed, so we don't append them
      formDataToSend.append('visit_date', formData.startDate || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('history', formData.history || '');
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }
      imageFiles.forEach((file) => formDataToSend.append('image', file));

      const response = await axios.post('/api/admin/pagoda/create', formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        alert('Pagoda added successfully!');
        await fetchPagodas({ pageNum: 1 });
        setFormData({
          pagodaName: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          history: '',
          tags: '',
          facilities: '',
          images: []
        });
        setImages([]);
        setImageFiles([]);
      } else {
        alert(response.data?.message || 'Failed to add pagoda.');
      }
    } catch (err) {
      console.error('Create Error:', err);
      alert('Error adding pagoda. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----- Delete -----
  const handleDeletePagoda = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pagoda?')) return;
    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }
    setLoading(true);
    try {
      const response = await api.delete(`/admin/pagoda/delete/${id}`);
      if (response.data && response.data.success) {
        alert('Pagoda deleted successfully!');
        await fetchPagodas({ pageNum: page });
      } else {
        alert(response.data?.message || 'Failed to delete pagoda.');
      }
    } catch (err) {
      console.error('Delete Error:', err);
      alert('Error deleting pagoda. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----- Edit (open modal) -----
  const handleEditPagoda = (id) => {
    const pagodaToEdit = pagodas.find(pagoda => pagoda.id === id);
    if (pagodaToEdit) {
      setSelectedPagodaForEdit(pagodaToEdit);
      setFormData({
        pagodaName: pagodaToEdit.name || '',
        location: pagodaToEdit.location || '',
        startDate: pagodaToEdit.bestTimeToVisit || '',
        endDate: pagodaToEdit.endDate || '',
        description: pagodaToEdit.descriptionMm || '',
        history: pagodaToEdit.historyMm || '',
        tags: pagodaToEdit.tags || '',
        facilities: pagodaToEdit.facilities || '',
        images: pagodaToEdit.images || []
      });
      setImages(pagodaToEdit.images || []);
      setImageFiles([]);
      setShowEditModal(true);
    }
  };

  // ----- Confirm Edit (price/discount removed) -----
  const handleConfirmEdit = async () => {
    if (!selectedPagodaForEdit || !formData.pagodaName) {
      alert('Please fill in all required fields');
      return;
    }
    const token = getToken();
    if (!token) {
      alert('Please login first');
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.pagodaName);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('visit_date', formData.startDate || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('history', formData.history || '');
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        formDataToSend.append('tags', JSON.stringify(tagsArray));
      }
      imageFiles.forEach((file) => formDataToSend.append('image', file));

      const response = await axios.put(`/api/admin/pagoda/update/${selectedPagodaForEdit.id}`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        alert('Pagoda updated successfully!');
        setShowEditModal(false);
        setSelectedPagodaForEdit(null);
        await fetchPagodas({ pageNum: page });
        setFormData({
          pagodaName: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          history: '',
          tags: '',
          facilities: '',
          images: []
        });
        setImages([]);
        setImageFiles([]);
      } else {
        alert(response.data?.message || 'Failed to update pagoda.');
      }
    } catch (err) {
      console.error('Update Error:', err);
      alert('Error updating pagoda. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----- Render Helpers -----
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }}></i>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <i key={i} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
      </>
    );
  };

  const CardActions = ({ pagodaId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleEditPagoda(pagodaId);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      handleDeletePagoda(pagodaId);
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

  // ----- Loading State -----
  if (loading && pagodas.length === 0) {
    return (
      <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Header title="Bagan Pagodas History Management" onThemeChange={handleThemeChange} />
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading pagodas...</p>
        </div>
      </div>
    );
  }

  // ----- Main Render -----
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Bagan Pagodas History Management" onThemeChange={handleThemeChange} />

      {/* Search + Filter Row */}
      <div className="search-actions-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div className="search-bar-wrapper" style={{ flex: '1 1 250px' }}>
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by name, location or tags..."
            className="search-input-full"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Filter by name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          />
          <button
            className="action-btn"
            onClick={handleFilter}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <i className="bi bi-funnel"></i> Filter
          </button>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6c757d' }}>
          Total: {totalItems} items
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i> {error}
        </div>
      )}

      {/* Two Columns Layout */}
      <div className="hotels-two-columns">
        {/* Left: Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            <div className="image-gallery-top">
              <label className="gallery-label">Pagoda Images Gallery</label>
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

            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Pagoda Name *</label>
                <input
                  type="text"
                  name="pagodaName"
                  placeholder="e.g., Shwezigon Pagoda"
                  value={formData.pagodaName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="add-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g., Nyaung U, Bagan"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="add-form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="e.g., Buddhist, Temple"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </div>
              <div className="add-form-group">
                <label>Visit Date / Best Time</label>
                <input
                  type="text"
                  name="startDate"
                  placeholder="e.g., Jan to May"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="add-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="2"
                  placeholder="Enter a brief description..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="add-form-group">
                <label>History</label>
                <textarea
                  name="history"
                  rows="4"
                  placeholder="Enter the history..."
                  value={formData.history}
                  onChange={handleInputChange}
                />
              </div>
              <button className="add-item-btn-full" onClick={handleAddPagoda} disabled={loading}>
                {loading ? 'Adding...' : 'Add Pagoda'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {pagodas.length > 0 ? (
                pagodas.map((pagoda) => (
                  <div key={pagoda.id} className="hotel-card-vertical">
                    <div className="hotel-card-image">
                      <div className="image-slider">
                        {pagoda.images && pagoda.images[0] && pagoda.images[0].startsWith('http') ? (
                          <img
                            src={pagoda.images[0]}
                            alt={pagoda.name}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div style="font-size:60px;display:flex;align-items:center;justify-content:center;height:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white">
                                    🛕
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              fontSize: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white'
                            }}
                          >
                            🛕
                          </div>
                        )}
                      </div>
                      <CardActions pagodaId={pagoda.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name">{pagoda.name}</h3>
                      <p className="hotel-location">
                        <i className="bi bi-geo-alt-fill"></i> {pagoda.location}
                      </p>
                      {pagoda.tags && (
                        <div className="pagoda-tags">
                          <i className="bi bi-tag-fill"></i> {pagoda.tags}
                        </div>
                      )}
                      {pagoda.bestTimeToVisit && (
                        <p className="best-time">
                          <i className="bi bi-calendar-check"></i> Visit: {pagoda.bestTimeToVisit}
                        </p>
                      )}
                      <div className="hotel-rating">
                        {renderStars(pagoda.rating || 4.5)}
                        <span className="rating-count">({pagoda.reviews || '0'} reviews)</span>
                      </div>
                      {pagoda.descriptionMm && (
                        <p className="pagoda-description">
                          {pagoda.descriptionMm.length > 80
                            ? `${pagoda.descriptionMm.substring(0, 80)}...`
                            : pagoda.descriptionMm}
                        </p>
                      )}
                      {pagoda.created_at && (
                        <p className="created-at" style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
                          <i className="bi bi-clock"></i> Added: {pagoda.created_at}
                        </p>
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
                    color: '#999'
                  }}
                >
                  <i className="bi bi-inbox" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No pagodas found.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '20px',
                  padding: '10px 0',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    backgroundColor: page === 1 ? '#e9ecef' : 'white',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className="bi bi-chevron-left"></i> Prev
                </button>

                {[...Array(totalPages).keys()].map((num) => (
                  <button
                    key={num + 1}
                    onClick={() => handlePageChange(num + 1)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '4px',
                      border: '1px solid #ced4da',
                      backgroundColor: page === num + 1 ? '#0d6efd' : 'white',
                      color: page === num + 1 ? 'white' : '#212529',
                      cursor: 'pointer',
                      fontWeight: page === num + 1 ? 'bold' : 'normal'
                    }}
                  >
                    {num + 1}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    backgroundColor: page === totalPages ? '#e9ecef' : 'white',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next <i className="bi bi-chevron-right"></i>
                </button>

                <span style={{ fontSize: '14px', color: '#6c757d', marginLeft: '10px' }}>
                  Page {page} of {totalPages}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal (price/discount removed) */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Pagoda Information</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Pagoda Name *</label>
                <input
                  type="text"
                  name="pagodaName"
                  value={formData.pagodaName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Visit Date / Best Time</label>
                <input
                  type="text"
                  name="startDate"
                  value={formData.startDate}
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
                <label>History</label>
                <textarea
                  name="history"
                  rows="4"
                  value={formData.history}
                  onChange={handleInputChange}
                />
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

export default HistoryOfPagodas;