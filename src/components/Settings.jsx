import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';

function Settings() {
  // ---------- Theme ----------
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // ---------- UI State ----------
  const [activeTab, setActiveTab] = useState('general');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Settings saved successfully!');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ---------- API States ----------
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Toast ----------
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });
  const toastTimeoutRef = useRef(null);
  const showToast = (type, message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3000);
  };

  // ---------- API Helpers ----------
  const getToken = () => localStorage.getItem('token');
  const getHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const API_BASE_SHOP = '/auth/shop';
  const BACKEND_URL = 'http://130.94.21.185:8000';

  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => { window.location.href = '/login'; }, 1500);
  };

  // ---------- Profile Data ----------
  const [adminProfile, setAdminProfile] = useState({
    id: null,
    fullName: '',
    email: '',
    role: 'Shop',
    phone: '',
    location: '',
    address: '',
    township: '',
    region: '',
    department: 'Operations',
    joinDate: '',
    lastLogin: 'Today',
    timezone: 'Asia/Yangon (MMT)',
    status: 'Active',
    image: null,          // full URL for display
    imageFile: null,      // File object when uploading new
    imagePreview: null,   // preview URL
    createdAt: '',
    updatedAt: '',
    raw: {},
  });

  const [tempProfile, setTempProfile] = useState({ ...adminProfile });

  // ---------- Backend URL helper ----------
  const buildImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `${BACKEND_URL}/${img.replace(/^\/+/, '')}`;
  };

  // ---------- FETCH SHOP PROFILE ----------
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_SHOP}/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }
      const result = await response.json();
      console.log('✅ Shop Profile:', result);

      const data = result.data || result.shop || result.user || result || {};

      const mapped = {
        id: data.id || data.shop_id || data.user_id || null,
        fullName: data.name || data.shop_name || data.full_name || '',
        email: data.email || '',
        role: data.role
          ? data.role.charAt(0).toUpperCase() + data.role.slice(1)
          : 'Shop',
        phone: data.phone || '',
        location: [data.address, data.township, data.region]
          .filter(Boolean)
          .join(', ') || data.location || '',
        address: data.address || '',
        township: data.township || '',
        region: data.region || '',
        department: data.department || 'Operations',
        joinDate: data.created_at
          ? new Date(data.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })
          : '',
        lastLogin: 'Today at ' + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
        }),
        timezone: 'Asia/Yangon (MMT)',
        status: data.status
          ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
          : 'Active',
        image: buildImageUrl(data.image),
        imageFile: null,
        imagePreview: buildImageUrl(data.image),
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || '',
        raw: data,
      };

      setAdminProfile(mapped);
      setTempProfile({ ...mapped });
    } catch (err) {
      setError(err.message);
      console.error('❌ Fetch Shop Profile Error:', err);
      showToast('error', 'Failed to load shop profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Theme Effect ----------
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

  // ---------- General Settings ----------
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Myanmar Travel Admin',
    siteEmail: 'admin@myanmartravel.com',
    sitePhone: '+95 9 123 456 789',
    siteAddress: 'No. 123, Bagan Road, Mandalay, Myanmar',
    timezone: 'Asia/Yangon',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    currency: 'MMK',
    maintenanceMode: false,
  });

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // ---------- Notification Settings ----------
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newUserAlert: true,
    newBookingAlert: true,
    newReviewAlert: true,
    reportAlert: true,
    dailyDigest: false,
    weeklyReport: true,
  });

  const handleNotificationChange = (name, value) => {
    setNotificationSettings({ ...notificationSettings, [name]: value });
  };

  // ---------- Security Settings ----------
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    passwordExpiry: '90',
    ipWhitelist: '',
  });

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // ---------- Appearance Settings ----------
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false,
    fontSize: 'medium',
    animationsEnabled: true,
    cardStyle: 'rounded',
  });

  const handleAppearanceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppearanceSettings({
      ...appearanceSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // ---------- Backup Settings ----------
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    backupLocation: 'local',
    lastBackup: '2024-03-23 02:00 AM',
    backupSize: '245 MB',
  });

  // ---------- Profile Image Upload ----------
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setTempProfile({
      ...tempProfile,
      imageFile: file,
      imagePreview: previewUrl,
    });
  };

  const removeProfileImage = () => {
    if (tempProfile.imagePreview && tempProfile.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(tempProfile.imagePreview);
    }
    setTempProfile({
      ...tempProfile,
      imageFile: null,
      imagePreview: null,
      image: null,
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setTempProfile({ ...tempProfile, [name]: value });
  };

  // ---------- SAVE SHOP PROFILE (PUT) ----------
  const handleSaveProfile = async () => {
    if (!tempProfile.fullName) {
      showToast('warning', 'Shop name is required.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    setSavingProfile(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('name', tempProfile.fullName.trim());
      form.append('email', (tempProfile.email || '').trim());
      form.append('phone', (tempProfile.phone || '').trim());
      form.append('address', (tempProfile.address || '').trim());
      form.append('township', (tempProfile.township || '').trim());
      form.append('region', (tempProfile.region || '').trim());

      if (tempProfile.imageFile) {
        form.append('image', tempProfile.imageFile);
      }

      console.log('📤 Updating Shop Profile...');

      const response = await fetch(`${API_BASE_SHOP}/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NOTE: do NOT set Content-Type manually with FormData
        },
        body: form,
      });

      if (response.status === 401) return handle401Error();

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();
      console.log('✅ Update Shop Profile Response:', result);

      if (result.success === false) {
        throw new Error(result.message || 'Update failed');
      }

      // Re-fetch fresh profile from server
      await fetchProfile();

      // Also update cached user in localStorage (name/email/phone/image)
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...stored,
          name: tempProfile.fullName,
          email: tempProfile.email,
          phone: tempProfile.phone,
          address: tempProfile.address,
          township: tempProfile.township,
          region: tempProfile.region,
        }));
      } catch (e) { /* ignore */ }

      setIsEditingProfile(false);
      showToast('success', 'Shop profile updated successfully!');
      setSuccessMsg('Shop profile updated successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      setError(err.message);
      console.error('❌ Update Profile Error:', err);
      showToast('error', 'Error: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    // Restore any blob preview
    if (tempProfile.imagePreview && tempProfile.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(tempProfile.imagePreview);
    }
    setTempProfile({ ...adminProfile });
    setIsEditingProfile(false);
  };

  // ---------- General Actions ----------
  const handleSaveSettings = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleResetSettings = () => setShowResetConfirm(true);

  const confirmReset = () => {
    setGeneralSettings({
      siteName: 'Myanmar Travel Admin',
      siteEmail: 'admin@myanmartravel.com',
      sitePhone: '+95 9 123 456 789',
      siteAddress: 'No. 123, Bagan Road, Mandalay, Myanmar',
      timezone: 'Asia/Yangon',
      dateFormat: 'DD/MM/YYYY',
      language: 'en',
      currency: 'MMK',
      maintenanceMode: false,
    });
    setShowResetConfirm(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const performBackup = () => {
    alert('Backup initiated. You will be notified when completed.');
  };

  // ---------- Helpers ----------
  const getTabClass = (tabName) =>
    `settings-tab ${activeTab === tabName ? 'active' : ''}`;

  const getStatusBadgeClass = (status) =>
    status === 'Active' ? 'status-badge active' : 'status-badge inactive';

  // ---------- Switch Button Component ----------
  const SwitchButton = ({ checked, onChange, label }) => (
    <label className="switch-button">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch-slider"></span>
      <span className="switch-label">{label}</span>
    </label>
  );

  // ---------- Render ----------
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Settings" onThemeChange={handleThemeChange} />

      {/* Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
          padding: '12px 20px', borderRadius: '8px',
          backgroundColor: toast.type === 'success' ? '#d4edda' : toast.type === 'warning' ? '#fff3cd' : '#f8d7da',
          color: toast.type === 'success' ? '#155724' : toast.type === 'warning' ? '#856404' : '#721c24',
          border: '1px solid ' + (toast.type === 'success' ? '#c3e6cb' : toast.type === 'warning' ? '#ffeeba' : '#f5c6cb'),
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '420px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span>{toast.message}</span>
            <button onClick={() => setToast({ ...toast, visible: false })}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <i className="bi bi-check-circle-fill"></i>
          {successMsg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px', textAlign: 'center' }}>
          ⏳ Loading...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '5px' }}>
          ❌ {error}
          <button onClick={() => setError(null)}
            style={{ marginLeft: '10px', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-content-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset All Settings</h2>
              <button className="close-btn" onClick={() => setShowResetConfirm(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reset all settings to default values?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="btn-danger" onClick={confirmReset}>Reset All</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Layout - Two Columns */}
      <div className="settings-two-columns">
        {/* Left Column - Admin Profile Card */}
        <div className="admin-profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-image-section">
              <div className="profile-avatar-large">
                {tempProfile.imagePreview ? (
                  <img src={tempProfile.imagePreview} alt="Shop" />
                ) : (
                  <span className="avatar-emoji">🏪</span>
                )}
              </div>
              {isEditingProfile && (
                <div className="image-upload-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    style={{ display: 'none' }}
                    id="profile-image-upload"
                  />
                  <label htmlFor="profile-image-upload" className="upload-label">
                    <i className="bi bi-camera-fill"></i>
                  </label>
                </div>
              )}
              {isEditingProfile && tempProfile.imagePreview && (
                <button
                  type="button"
                  onClick={removeProfileImage}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: '#dc3545', color: '#fff', border: 'none',
                    borderRadius: '50%', width: '26px', height: '26px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Remove image"
                >
                  <i className="bi bi-x-lg" style={{ fontSize: '12px' }}></i>
                </button>
              )}
            </div>
            <div className="profile-info">
              {isEditingProfile ? (
                <input
                  type="text"
                  name="fullName"
                  value={tempProfile.fullName}
                  onChange={handleProfileChange}
                  className="profile-name-input"
                  placeholder="Shop Name"
                />
              ) : (
                <h2>{adminProfile.fullName || 'Shop'}</h2>
              )}
              <span className={getStatusBadgeClass(adminProfile.status)}>
                {adminProfile.status}
              </span>
              {isEditingProfile ? (
                <input
                  type="text"
                  name="role"
                  value={tempProfile.role}
                  onChange={handleProfileChange}
                  className="profile-role-input"
                  placeholder="Role"
                  disabled
                />
              ) : (
                <p className="profile-role">{adminProfile.role}</p>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <div className="detail-item">
              <i className="bi bi-envelope-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Email</span>
                {isEditingProfile ? (
                  <input type="email" name="email" value={tempProfile.email}
                    onChange={handleProfileChange} className="detail-input" placeholder="email@example.com" />
                ) : (
                  <span className="detail-value">{adminProfile.email || 'N/A'}</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-telephone-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                {isEditingProfile ? (
                  <input type="text" name="phone" value={tempProfile.phone}
                    onChange={handleProfileChange} className="detail-input" placeholder="09-xxxxxxxxx" />
                ) : (
                  <span className="detail-value">{adminProfile.phone || 'N/A'}</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-house-door-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Address</span>
                {isEditingProfile ? (
                  <input type="text" name="address" value={tempProfile.address}
                    onChange={handleProfileChange} className="detail-input" placeholder="Street address" />
                ) : (
                  <span className="detail-value">{adminProfile.address || 'N/A'}</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-geo-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Township</span>
                {isEditingProfile ? (
                  <input type="text" name="township" value={tempProfile.township}
                    onChange={handleProfileChange} className="detail-input" placeholder="Township" />
                ) : (
                  <span className="detail-value">{adminProfile.township || 'N/A'}</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-map-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Region</span>
                {isEditingProfile ? (
                  <input type="text" name="region" value={tempProfile.region}
                    onChange={handleProfileChange} className="detail-input" placeholder="Region" />
                ) : (
                  <span className="detail-value">{adminProfile.region || 'N/A'}</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-briefcase-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Department</span>
                {isEditingProfile ? (
                  <input type="text" name="department" value={tempProfile.department}
                    onChange={handleProfileChange} className="detail-input" />
                ) : (
                  <span className="detail-value">{adminProfile.department}</span>
                )}
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-calendar-check-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Joined Date</span>
                <span className="detail-value">{adminProfile.joinDate || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-clock-history"></i>
              <div className="detail-content">
                <span className="detail-label">Last Login</span>
                <span className="detail-value">{adminProfile.lastLogin}</span>
              </div>
            </div>

            <div className="detail-item">
              <i className="bi bi-clock-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Timezone</span>
                <span className="detail-value">{adminProfile.timezone}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat">
              <i className="bi bi-people-fill"></i>
              <div>
                <h4>1,234</h4>
                <span>Customers</span>
              </div>
            </div>
            <div className="stat">
              <i className="bi bi-star-fill"></i>
              <div>
                <h4>4.9</h4>
                <span>Rating</span>
              </div>
            </div>
            <div className="stat">
              <i className="bi bi-trophy-fill"></i>
              <div>
                <h4>2 yrs</h4>
                <span>Experience</span>
              </div>
            </div>
          </div>

          {/* Edit/Cancel Buttons */}
          {isEditingProfile ? (
            <div className="profile-edit-actions">
              <button className="cancel-edit-btn" onClick={handleCancelEdit} disabled={savingProfile}>
                Cancel
              </button>
              <button className="save-profile-btn" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          ) : (
            <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)} disabled={loading}>
              <i className="bi bi-pencil-square"></i> Edit Profile
            </button>
          )}
        </div>

        {/* Right Column - Settings Tabs and Content */}
        <div className="settings-right-column">
          <div className="settings-tabs-container">
            <div className="settings-tabs">
              <button className={getTabClass('general')} onClick={() => setActiveTab('general')}>
                <i className="bi bi-gear-fill"></i> General
              </button>
              <button className={getTabClass('notifications')} onClick={() => setActiveTab('notifications')}>
                <i className="bi bi-bell-fill"></i> Notifications
              </button>
              <button className={getTabClass('security')} onClick={() => setActiveTab('security')}>
                <i className="bi bi-shield-lock-fill"></i> Security
              </button>
              <button className={getTabClass('appearance')} onClick={() => setActiveTab('appearance')}>
                <i className="bi bi-palette-fill"></i> Appearance
              </button>
              <button className={getTabClass('backup')} onClick={() => setActiveTab('backup')}>
                <i className="bi bi-database-fill"></i> Backup
              </button>
            </div>
          </div>

          <div className="settings-content">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="bi bi-gear-fill"></i> General Settings
                </h2>
                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Site Name</label>
                      <input type="text" name="siteName" value={generalSettings.siteName} onChange={handleGeneralChange} />
                    </div>
                    <div className="form-group">
                      <label>Site Email</label>
                      <input type="email" name="siteEmail" value={generalSettings.siteEmail} onChange={handleGeneralChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="text" name="sitePhone" value={generalSettings.sitePhone} onChange={handleGeneralChange} />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input type="text" name="siteAddress" value={generalSettings.siteAddress} onChange={handleGeneralChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Timezone</label>
                      <select name="timezone" value={generalSettings.timezone} onChange={handleGeneralChange}>
                        <option value="Asia/Yangon">Asia/Yangon (MMT)</option>
                        <option value="Asia/Bangkok">Asia/Bangkok</option>
                        <option value="Asia/Singapore">Asia/Singapore</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date Format</label>
                      <select name="dateFormat" value={generalSettings.dateFormat} onChange={handleGeneralChange}>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Language</label>
                      <select name="language" value={generalSettings.language} onChange={handleGeneralChange}>
                        <option value="en">English</option>
                        <option value="my">Burmese (Myanmar)</option>
                        <option value="th">Thai</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select name="currency" value={generalSettings.currency} onChange={handleGeneralChange}>
                        <option value="MMK">MMK - Myanmar Kyat</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="THB">THB - Thai Baht</option>
                      </select>
                    </div>
                  </div>
                  <div className="switch-group">
                    <SwitchButton
                      checked={generalSettings.maintenanceMode}
                      onChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                      label="Maintenance Mode"
                    />
                    <p className="field-note">When enabled, only admins can access the site</p>
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="btn-secondary" onClick={handleResetSettings}>
                    <i className="bi bi-arrow-repeat"></i> Reset to Default
                  </button>
                  <button className="btn-primary" onClick={handleSaveSettings}>
                    <i className="bi bi-check-lg"></i> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="bi bi-bell-fill"></i> Notification Settings
                </h2>
                <div className="settings-form">
                  <div className="notification-group">
                    <h3>Channels</h3>
                    <div className="switch-grid">
                      <SwitchButton checked={notificationSettings.emailNotifications}
                        onChange={(c) => handleNotificationChange('emailNotifications', c)} label="Email Notifications" />
                      <SwitchButton checked={notificationSettings.smsNotifications}
                        onChange={(c) => handleNotificationChange('smsNotifications', c)} label="SMS Notifications" />
                      <SwitchButton checked={notificationSettings.pushNotifications}
                        onChange={(c) => handleNotificationChange('pushNotifications', c)} label="Push Notifications" />
                    </div>
                  </div>
                  <div className="notification-group">
                    <h3>Events</h3>
                    <div className="switch-grid">
                      <SwitchButton checked={notificationSettings.newUserAlert}
                        onChange={(c) => handleNotificationChange('newUserAlert', c)} label="New User Registration" />
                      <SwitchButton checked={notificationSettings.newBookingAlert}
                        onChange={(c) => handleNotificationChange('newBookingAlert', c)} label="New Booking" />
                      <SwitchButton checked={notificationSettings.newReviewAlert}
                        onChange={(c) => handleNotificationChange('newReviewAlert', c)} label="New Review" />
                      <SwitchButton checked={notificationSettings.reportAlert}
                        onChange={(c) => handleNotificationChange('reportAlert', c)} label="Reported Content" />
                    </div>
                  </div>
                  <div className="notification-group">
                    <h3>Digests</h3>
                    <div className="switch-grid">
                      <SwitchButton checked={notificationSettings.dailyDigest}
                        onChange={(c) => handleNotificationChange('dailyDigest', c)} label="Daily Digest" />
                      <SwitchButton checked={notificationSettings.weeklyReport}
                        onChange={(c) => handleNotificationChange('weeklyReport', c)} label="Weekly Report" />
                    </div>
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="btn-secondary" onClick={handleResetSettings}>
                    <i className="bi bi-arrow-repeat"></i> Reset to Default
                  </button>
                  <button className="btn-primary" onClick={handleSaveSettings}>
                    <i className="bi bi-check-lg"></i> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="bi bi-shield-lock-fill"></i> Security Settings
                </h2>
                <div className="settings-form">
                  <div className="switch-group">
                    <SwitchButton
                      checked={securitySettings.twoFactorAuth}
                      onChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                      label="Enable Two-Factor Authentication"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Session Timeout (minutes)</label>
                      <input type="number" name="sessionTimeout" value={securitySettings.sessionTimeout} onChange={handleSecurityChange} />
                    </div>
                    <div className="form-group">
                      <label>Max Login Attempts</label>
                      <input type="number" name="maxLoginAttempts" value={securitySettings.maxLoginAttempts} onChange={handleSecurityChange} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password Expiry (days)</label>
                      <input type="number" name="passwordExpiry" value={securitySettings.passwordExpiry} onChange={handleSecurityChange} />
                    </div>
                    <div className="form-group">
                      <label>IP Whitelist</label>
                      <input type="text" name="ipWhitelist" placeholder="192.168.1.1, 10.0.0.1"
                        value={securitySettings.ipWhitelist} onChange={handleSecurityChange} />
                      <p className="field-note">Comma-separated IP addresses</p>
                    </div>
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="btn-secondary" onClick={handleResetSettings}>
                    <i className="bi bi-arrow-repeat"></i> Reset to Default
                  </button>
                  <button className="btn-primary" onClick={handleSaveSettings}>
                    <i className="bi bi-check-lg"></i> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="bi bi-palette-fill"></i> Appearance Settings
                </h2>
                <div className="settings-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Theme</label>
                      <select name="theme" value={appearanceSettings.theme} onChange={handleAppearanceChange}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Font Size</label>
                      <select name="fontSize" value={appearanceSettings.fontSize} onChange={handleAppearanceChange}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Card Style</label>
                      <select name="cardStyle" value={appearanceSettings.cardStyle} onChange={handleAppearanceChange}>
                        <option value="rounded">Rounded</option>
                        <option value="sharp">Sharp</option>
                        <option value="shadow">Shadow</option>
                      </select>
                    </div>
                  </div>
                  <div className="switch-group">
                    <SwitchButton checked={appearanceSettings.sidebarCollapsed}
                      onChange={(c) => setAppearanceSettings({ ...appearanceSettings, sidebarCollapsed: c })}
                      label="Collapse Sidebar by Default" />
                    <SwitchButton checked={appearanceSettings.compactMode}
                      onChange={(c) => setAppearanceSettings({ ...appearanceSettings, compactMode: c })}
                      label="Compact Mode (Denser Layout)" />
                    <SwitchButton checked={appearanceSettings.animationsEnabled}
                      onChange={(c) => setAppearanceSettings({ ...appearanceSettings, animationsEnabled: c })}
                      label="Enable Animations" />
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="btn-secondary" onClick={handleResetSettings}>
                    <i className="bi bi-arrow-repeat"></i> Reset to Default
                  </button>
                  <button className="btn-primary" onClick={handleSaveSettings}>
                    <i className="bi bi-check-lg"></i> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Backup Settings */}
            {activeTab === 'backup' && (
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="bi bi-database-fill"></i> Backup Settings
                </h2>
                <div className="settings-form">
                  <div className="backup-info-card">
                    <div className="backup-info-row">
                      <span>Last Backup:</span>
                      <strong>{backupSettings.lastBackup}</strong>
                    </div>
                    <div className="backup-info-row">
                      <span>Backup Size:</span>
                      <strong>{backupSettings.backupSize}</strong>
                    </div>
                  </div>
                  <div className="switch-group">
                    <SwitchButton checked={backupSettings.autoBackup}
                      onChange={(c) => setBackupSettings({ ...backupSettings, autoBackup: c })}
                      label="Enable Automatic Backups" />
                  </div>
                  {backupSettings.autoBackup && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Backup Frequency</label>
                          <select value={backupSettings.backupFrequency}
                            onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Backup Time</label>
                          <input type="time" value={backupSettings.backupTime}
                            onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Backup Location</label>
                        <select value={backupSettings.backupLocation}
                          onChange={(e) => setBackupSettings({ ...backupSettings, backupLocation: e.target.value })}>
                          <option value="local">Local Server</option>
                          <option value="cloud">Cloud Storage</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="backup-actions">
                    <button className="btn-secondary" onClick={performBackup}>
                      <i className="bi bi-cloud-upload"></i> Backup Now
                    </button>
                    <button className="btn-secondary">
                      <i className="bi bi-download"></i> Download Latest Backup
                    </button>
                  </div>
                </div>
                <div className="settings-actions">
                  <button className="btn-secondary" onClick={handleResetSettings}>
                    <i className="bi bi-arrow-repeat"></i> Reset to Default
                  </button>
                  <button className="btn-primary" onClick={handleSaveSettings}>
                    <i className="bi bi-check-lg"></i> Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;