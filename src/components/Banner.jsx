import React, { useState, useEffect } from 'react';
import Header from './Header';

function Banner() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBannerForEdit, setSelectedBannerForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    link: '',
    status: 'Active'
  });

  const [banners, setBanners] = useState(() => {
    const stored = localStorage.getItem('banners');
    if (stored) {
      return JSON.parse(stored);
    }
    // Default Demo Data
    return [
      {
        id: 1,
        title: 'Bagan Sunset',
        imageUrl: 'https://via.placeholder.com/800x400/FFB6C1/000000?text=Bagan+Sunset',
        link: '/promo/sunset',
        status: 'Active',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Hot Air Balloon Festival',
        imageUrl: 'https://via.placeholder.com/800x400/ADD8E6/000000?text=Balloon+Festival',
        link: '/promo/balloon',
        status: 'Inactive',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Bagan Temple Marathon',
        imageUrl: 'https://via.placeholder.com/800x400/90EE90/000000?text=Temple+Marathon',
        link: '/promo/marathon',
        status: 'Active',
        createdAt: new Date().toISOString()
      }
    ];
  });

  const MAX_BANNERS = 10;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('banners', JSON.stringify(banners));
  }, [banners]);

  // Theme
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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

  // Add
  const handleAddBanner = () => {
    setLoading(true);
    try {
      if (banners.length >= MAX_BANNERS) {
        alert(`You can only add up to ${MAX_BANNERS} banners.`);
        setLoading(false);
        return;
      }
      if (!formData.title.trim() || !formData.imageUrl.trim()) {
        alert('Title and Image URL are required.');
        setLoading(false);
        return;
      }

      const newBanner = {
        id: Date.now(),
        title: formData.title,
        imageUrl: formData.imageUrl,
        link: formData.link || '',
        status: formData.status || 'Active',
        createdAt: new Date().toISOString()
      };

      setBanners([newBanner, ...banners]);
      setFormData({ title: '', imageUrl: '', link: '', status: 'Active' });
      setImages([]);
      alert('Banner added successfully!');
    } catch (err) {
      alert('Error adding banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete from Card
  const handleDeleteFromCard = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setBanners(banners.filter(banner => banner.id !== id));
      alert('Banner deleted successfully!');
    }
  };

  // Edit from Card
  const handleEditFromCard = (banner) => {
    setSelectedBannerForEdit(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      link: banner.link || '',
      status: banner.status,
    });
    setImages([banner.imageUrl]);
    setShowEditModal(true);
  };

  // Confirm Edit
  const handleConfirmEdit = () => {
    setLoading(true);
    try {
      if (selectedBannerForEdit && formData.title.trim() && formData.imageUrl.trim()) {
        const updatedBanners = banners.map(banner =>
          banner.id === selectedBannerForEdit.id
            ? {
                ...banner,
                title: formData.title,
                imageUrl: formData.imageUrl,
                link: formData.link || '',
                status: formData.status,
              }
            : banner
        );
        setBanners(updatedBanners);
        setShowEditModal(false);
        setSelectedBannerForEdit(null);
        setFormData({ title: '', imageUrl: '', link: '', status: 'Active' });
        setImages([]);
        alert('Banner updated successfully!');
      } else {
        alert('Title and Image URL are required.');
      }
    } catch (err) {
      alert('Error updating banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (banner.link && banner.link.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusStyle = (status) => {
    if (status === 'Active') {
      return { backgroundColor: '#d1e7dd', color: '#0f5132' };
    }
    return { backgroundColor: '#f8d7da', color: '#842029' };
  };

  // ---------- CARD ACTIONS (⋮ Dropdown) ----------
  const CardActions = ({ bannerId }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (e) => {
      e.stopPropagation();
      setIsOpen(!isOpen);
    };

    const handleEdit = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      const banner = banners.find(b => b.id === bannerId);
      if (banner) handleEditFromCard(banner);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      setIsOpen(false);
      const banner = banners.find(b => b.id === bannerId);
      if (banner) handleDeleteFromCard(bannerId, banner.title);
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
  // ---------- END CARD ACTIONS ----------

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Banner Management" onThemeChange={handleThemeChange} />

      {/* Search Bar */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search banner by title, status or link..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery */}
            <div className="image-gallery-top">
              <label className="gallery-label">Image Gallery</label>
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
                  placeholder="eg. Bagan Special Offer"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Image URL *</label>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
                {formData.imageUrl && (
                  <div style={{ marginTop: '6px' }}>
                    <img src={formData.imageUrl} alt="Preview" style={{ height: '50px', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </div>
                )}
              </div>

              <div className="add-form-group">
                <label>Link (Optional)</label>
                <input
                  type="text"
                  name="link"
                  placeholder="/promo-page or https://..."
                  value={formData.link}
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

              <button className="add-item-btn-full" onClick={handleAddBanner} disabled={loading}>
                {loading ? 'Adding...' : 'Add Banner'}
              </button>

              <div style={{ marginTop: '8px', fontSize: '13px', color: '#6c757d', textAlign: 'center' }}>
                {banners.length} / {MAX_BANNERS} banners
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Banner Cards */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredBanners.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#6c757d' }}>
                  <i className="bi bi-image" style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}></i>
                  <p>No banners found. Click "Add Banner" to create one.</p>
                </div>
              ) : (
                filteredBanners.map((banner) => (
                  <div key={banner.id} className="hotel-card-vertical">
                    <div className="hotel-card-image">
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x200/ccc/666?text=No+Image';
                        }}
                      />
                      {/* Status Badge - LEFT TOP */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        ...getStatusStyle(banner.status)
                      }}>
                        {banner.status}
                      </div>
                      {/* ⋮ Card Actions - RIGHT TOP */}
                      <CardActions bannerId={banner.id} />
                    </div>
                    <div className="hotel-card-info">
                      <h3 className="hotel-name">{banner.title}</h3>
                      {banner.link && (
                        <p className="hotel-location">
                          <i className="bi bi-link-45deg"></i> 
                          <a href={banner.link} target="_blank" rel="noreferrer" style={{ color: '#0d6efd', textDecoration: 'none' }}>
                            {banner.link.length > 40 ? banner.link.substring(0, 40) + '...' : banner.link}
                          </a>
                        </p>
                      )}
                      <p className="hotel-location">
                        <i className="bi bi-calendar3"></i> Added: {new Date(banner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Banner</h2>
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
                <label>Image URL *</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
                {formData.imageUrl && (
                  <div style={{ marginTop: '6px' }}>
                    <img src={formData.imageUrl} alt="Preview" style={{ height: '50px', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Link (Optional)</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
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

export default Banner;