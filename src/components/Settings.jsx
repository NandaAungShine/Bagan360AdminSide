import React, { useState, useEffect } from 'react';
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ---------- Profile Data (loaded from localStorage) ----------
  const [adminProfile, setAdminProfile] = useState(() => {
    // Try to get stored user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Map the stored user fields to the profile structure
        return {
          fullName: user.name || 'Admin',
          email: user.email || '',
          role: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin',
          phone: user.phone || '',
          location: [user.address, user.township, user.region]
            .filter(Boolean)
            .join(', ') || 'Myanmar',
          department: user.role ? `${user.role} Department` : 'Operations',
          joinDate: new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          lastLogin: 'Today at ' + new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          timezone: 'Asia/Yangon (MMT)',
          status: 'Active',
          images: user.image ? [user.image] : ['👨‍💻'],
        };
      } catch (e) {
        // Fallback if JSON parsing fails
        return getFallbackProfile();
      }
    }
    // No user in storage – use static fallback
    return getFallbackProfile();
  });

  // Fallback static profile (shown if no user in localStorage)
  function getFallbackProfile() {
    return {
      fullName: 'Min Thu Wun',
      email: 'min.thu@myanmartravel.com',
      role: 'Super Admin',
      phone: '+95 9 123 456 789',
      department: 'IT & Operations',
      joinDate: 'January 15, 2023',
      lastLogin: 'Today at 10:30 AM',
      location: 'Bagan, Myanmar',
      timezone: 'Asia/Yangon (MMT)',
      status: 'Active',
      images: ['👨‍💻'],
    };
  }

  const [tempProfile, setTempProfile] = useState({ ...adminProfile });
  const [profileImages, setProfileImages] = useState([]);

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

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
  };

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
    setNotificationSettings({
      ...notificationSettings,
      [name]: value,
    });
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
    if (type === 'checkbox') {
      setSecuritySettings({
        ...securitySettings,
        [name]: checked,
      });
    } else {
      setSecuritySettings({
        ...securitySettings,
        [name]: value,
      });
    }
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
    if (type === 'checkbox') {
      setAppearanceSettings({
        ...appearanceSettings,
        [name]: checked,
      });
    } else {
      setAppearanceSettings({
        ...appearanceSettings,
        [name]: value,
      });
    }
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

  // ---------- Profile Editing Handlers ----------
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImages([...profileImages, reader.result]);
        setTempProfile({
          ...tempProfile,
          images: [...tempProfile.images, reader.result],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = (index) => {
    const newImages = profileImages.filter((_, i) => i !== index);
    setProfileImages(newImages);
    setTempProfile({ ...tempProfile, images: newImages });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setTempProfile({ ...tempProfile, [name]: value });
  };

  const handleSaveProfile = () => {
    // Update the local state
    setAdminProfile({ ...tempProfile });
    // Also update the stored user in localStorage (so it persists after page reload)
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // Update only the fields we have in tempProfile
      const updatedUser = {
        ...storedUser,
        name: tempProfile.fullName,
        email: tempProfile.email,
        phone: tempProfile.phone,
        // You can also update region/township/address if you have separate fields
        // For now we store location as a combined string, but if your API expects separate fields,
        // you might need to parse it. For simplicity, we just update the whole user object with new values.
        // Since we don't have separate fields for region/township/address in the edit form,
        // we'll keep the existing ones.
        // If you want to update them, add additional input fields.
        // For now, we'll just update the display name and email.
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      // If no user in storage, do nothing
    }
    setIsEditingProfile(false);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleCancelEdit = () => {
    setTempProfile({ ...adminProfile });
    setIsEditingProfile(false);
  };

  // ---------- General Actions ----------
  const handleSaveSettings = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleResetSettings = () => {
    setShowResetConfirm(true);
  };

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
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const performBackup = () => {
    alert('Backup initiated. You will be notified when completed.');
  };

  // ---------- Helpers ----------
  const getTabClass = (tabName) => {
    return `settings-tab ${activeTab === tabName ? 'active' : ''}`;
  };

  const getStatusBadgeClass = (status) => {
    return status === 'Active' ? 'status-badge active' : 'status-badge inactive';
  };

  // ---------- Switch Button Component ----------
  const SwitchButton = ({ checked, onChange, label }) => {
    return (
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
  };

  // ---------- Render ----------
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Settings" onThemeChange={handleThemeChange} />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <i className="bi bi-check-circle-fill"></i>
          Settings saved successfully!
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
              <button className="discard-btn" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmReset}>
                Reset All
              </button>
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
                {tempProfile.images[0] && tempProfile.images[0].startsWith('data:') ? (
                  <img src={tempProfile.images[0]} alt="Admin" />
                ) : tempProfile.images[0] && tempProfile.images[0].startsWith('http') ? (
                  <img src={tempProfile.images[0]} alt="Admin" />
                ) : (
                  <span className="avatar-emoji">{tempProfile.images[0] || '👨‍💻'}</span>
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
            </div>
            <div className="profile-info">
              {isEditingProfile ? (
                <input
                  type="text"
                  name="fullName"
                  value={tempProfile.fullName}
                  onChange={handleProfileChange}
                  className="profile-name-input"
                />
              ) : (
                <h2>{adminProfile.fullName}</h2>
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
                  <input
                    type="email"
                    name="email"
                    value={tempProfile.email}
                    onChange={handleProfileChange}
                    className="detail-input"
                  />
                ) : (
                  <span className="detail-value">{adminProfile.email}</span>
                )}
              </div>
            </div>
            <div className="detail-item">
              <i className="bi bi-telephone-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="phone"
                    value={tempProfile.phone}
                    onChange={handleProfileChange}
                    className="detail-input"
                  />
                ) : (
                  <span className="detail-value">{adminProfile.phone}</span>
                )}
              </div>
            </div>
            <div className="detail-item">
              <i className="bi bi-briefcase-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Department</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="department"
                    value={tempProfile.department}
                    onChange={handleProfileChange}
                    className="detail-input"
                  />
                ) : (
                  <span className="detail-value">{adminProfile.department}</span>
                )}
              </div>
            </div>
            <div className="detail-item">
              <i className="bi bi-calendar-check-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Joined Date</span>
                <span className="detail-value">{adminProfile.joinDate}</span>
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
              <i className="bi bi-geo-alt-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Location</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="location"
                    value={tempProfile.location}
                    onChange={handleProfileChange}
                    className="detail-input"
                  />
                ) : (
                  <span className="detail-value">{adminProfile.location}</span>
                )}
              </div>
            </div>
            <div className="detail-item">
              <i className="bi bi-clock-fill"></i>
              <div className="detail-content">
                <span className="detail-label">Timezone</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="timezone"
                    value={tempProfile.timezone}
                    onChange={handleProfileChange}
                    className="detail-input"
                  />
                ) : (
                  <span className="detail-value">{adminProfile.timezone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat">
              <i className="bi bi-people-fill"></i>
              <div>
                <h4>1,234</h4>
                <span>Users Managed</span>
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
              <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="save-profile-btn" onClick={handleSaveProfile}>
                Save Profile
              </button>
            </div>
          ) : (
            <button className="edit-profile-btn" onClick={() => setIsEditingProfile(true)}>
              <i className="bi bi-pencil-square"></i> Edit Profile
            </button>
          )}
        </div>

        {/* Right Column - Settings Tabs and Content */}
        <div className="settings-right-column">
          <div className="settings-tabs-container">
            <div className="settings-tabs">
              <button
                className={getTabClass('general')}
                onClick={() => setActiveTab('general')}
              >
                <i className="bi bi-gear-fill"></i> General
              </button>
              <button
                className={getTabClass('notifications')}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="bi bi-bell-fill"></i> Notifications
              </button>
              <button
                className={getTabClass('security')}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-shield-lock-fill"></i> Security
              </button>
              <button
                className={getTabClass('appearance')}
                onClick={() => setActiveTab('appearance')}
              >
                <i className="bi bi-palette-fill"></i> Appearance
              </button>
              <button
                className={getTabClass('backup')}
                onClick={() => setActiveTab('backup')}
              >
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
                      <input
                        type="text"
                        name="siteName"
                        value={generalSettings.siteName}
                        onChange={handleGeneralChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Site Email</label>
                      <input
                        type="email"
                        name="siteEmail"
                        value={generalSettings.siteEmail}
                        onChange={handleGeneralChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        name="sitePhone"
                        value={generalSettings.sitePhone}
                        onChange={handleGeneralChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        name="siteAddress"
                        value={generalSettings.siteAddress}
                        onChange={handleGeneralChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Timezone</label>
                      <select
                        name="timezone"
                        value={generalSettings.timezone}
                        onChange={handleGeneralChange}
                      >
                        <option value="Asia/Yangon">Asia/Yangon (MMT)</option>
                        <option value="Asia/Bangkok">Asia/Bangkok</option>
                        <option value="Asia/Singapore">Asia/Singapore</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date Format</label>
                      <select
                        name="dateFormat"
                        value={generalSettings.dateFormat}
                        onChange={handleGeneralChange}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        name="language"
                        value={generalSettings.language}
                        onChange={handleGeneralChange}
                      >
                        <option value="en">English</option>
                        <option value="my">Burmese (Myanmar)</option>
                        <option value="th">Thai</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        name="currency"
                        value={generalSettings.currency}
                        onChange={handleGeneralChange}
                      >
                        <option value="MMK">MMK - Myanmar Kyat</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="THB">THB - Thai Baht</option>
                      </select>
                    </div>
                  </div>
                  <div className="switch-group">
                    <SwitchButton
                      checked={generalSettings.maintenanceMode}
                      onChange={(checked) =>
                        setGeneralSettings({
                          ...generalSettings,
                          maintenanceMode: checked,
                        })
                      }
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
                      <SwitchButton
                        checked={notificationSettings.emailNotifications}
                        onChange={(checked) =>
                          handleNotificationChange('emailNotifications', checked)
                        }
                        label="Email Notifications"
                      />
                      <SwitchButton
                        checked={notificationSettings.smsNotifications}
                        onChange={(checked) =>
                          handleNotificationChange('smsNotifications', checked)
                        }
                        label="SMS Notifications"
                      />
                      <SwitchButton
                        checked={notificationSettings.pushNotifications}
                        onChange={(checked) =>
                          handleNotificationChange('pushNotifications', checked)
                        }
                        label="Push Notifications"
                      />
                    </div>
                  </div>
                  <div className="notification-group">
                    <h3>Events</h3>
                    <div className="switch-grid">
                      <SwitchButton
                        checked={notificationSettings.newUserAlert}
                        onChange={(checked) =>
                          handleNotificationChange('newUserAlert', checked)
                        }
                        label="New User Registration"
                      />
                      <SwitchButton
                        checked={notificationSettings.newBookingAlert}
                        onChange={(checked) =>
                          handleNotificationChange('newBookingAlert', checked)
                        }
                        label="New Booking"
                      />
                      <SwitchButton
                        checked={notificationSettings.newReviewAlert}
                        onChange={(checked) =>
                          handleNotificationChange('newReviewAlert', checked)
                        }
                        label="New Review"
                      />
                      <SwitchButton
                        checked={notificationSettings.reportAlert}
                        onChange={(checked) =>
                          handleNotificationChange('reportAlert', checked)
                        }
                        label="Reported Content"
                      />
                    </div>
                  </div>
                  <div className="notification-group">
                    <h3>Digests</h3>
                    <div className="switch-grid">
                      <SwitchButton
                        checked={notificationSettings.dailyDigest}
                        onChange={(checked) =>
                          handleNotificationChange('dailyDigest', checked)
                        }
                        label="Daily Digest"
                      />
                      <SwitchButton
                        checked={notificationSettings.weeklyReport}
                        onChange={(checked) =>
                          handleNotificationChange('weeklyReport', checked)
                        }
                        label="Weekly Report"
                      />
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
                      onChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuth: checked,
                        })
                      }
                      label="Enable Two-Factor Authentication"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Session Timeout (minutes)</label>
                      <input
                        type="number"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Max Login Attempts</label>
                      <input
                        type="number"
                        name="maxLoginAttempts"
                        value={securitySettings.maxLoginAttempts}
                        onChange={handleSecurityChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password Expiry (days)</label>
                      <input
                        type="number"
                        name="passwordExpiry"
                        value={securitySettings.passwordExpiry}
                        onChange={handleSecurityChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>IP Whitelist</label>
                      <input
                        type="text"
                        name="ipWhitelist"
                        placeholder="192.168.1.1, 10.0.0.1"
                        value={securitySettings.ipWhitelist}
                        onChange={handleSecurityChange}
                      />
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
                      <select
                        name="theme"
                        value={appearanceSettings.theme}
                        onChange={handleAppearanceChange}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Font Size</label>
                      <select
                        name="fontSize"
                        value={appearanceSettings.fontSize}
                        onChange={handleAppearanceChange}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Card Style</label>
                      <select
                        name="cardStyle"
                        value={appearanceSettings.cardStyle}
                        onChange={handleAppearanceChange}
                      >
                        <option value="rounded">Rounded</option>
                        <option value="sharp">Sharp</option>
                        <option value="shadow">Shadow</option>
                      </select>
                    </div>
                  </div>
                  <div className="switch-group">
                    <SwitchButton
                      checked={appearanceSettings.sidebarCollapsed}
                      onChange={(checked) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          sidebarCollapsed: checked,
                        })
                      }
                      label="Collapse Sidebar by Default"
                    />
                    <SwitchButton
                      checked={appearanceSettings.compactMode}
                      onChange={(checked) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          compactMode: checked,
                        })
                      }
                      label="Compact Mode (Denser Layout)"
                    />
                    <SwitchButton
                      checked={appearanceSettings.animationsEnabled}
                      onChange={(checked) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          animationsEnabled: checked,
                        })
                      }
                      label="Enable Animations"
                    />
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
                    <SwitchButton
                      checked={backupSettings.autoBackup}
                      onChange={(checked) =>
                        setBackupSettings({ ...backupSettings, autoBackup: checked })
                      }
                      label="Enable Automatic Backups"
                    />
                  </div>
                  {backupSettings.autoBackup && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Backup Frequency</label>
                          <select
                            value={backupSettings.backupFrequency}
                            onChange={(e) =>
                              setBackupSettings({
                                ...backupSettings,
                                backupFrequency: e.target.value,
                              })
                            }
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Backup Time</label>
                          <input
                            type="time"
                            value={backupSettings.backupTime}
                            onChange={(e) =>
                              setBackupSettings({
                                ...backupSettings,
                                backupTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Backup Location</label>
                        <select
                          value={backupSettings.backupLocation}
                          onChange={(e) =>
                            setBackupSettings({
                              ...backupSettings,
                              backupLocation: e.target.value,
                            })
                          }
                        >
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