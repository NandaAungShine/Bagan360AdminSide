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
  const [copied, setCopied] = useState(false);

  // ---------- API States ----------
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Shop Active State ----------
  const [isShopActive, setIsShopActive] = useState(true);

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
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  });

  const API_BASE_SHOP = '/auth/shop';
  const BACKEND_URL = 'http://130.94.21.185:8000';

  const ACTIVATE_API = `${BACKEND_URL}/auth/shop/activate/`;

  // Password change endpoints (role-based)
  const CHANGE_PASSWORD_API_SHOP = `${BACKEND_URL}/auth/shop/change/password`;
  const CHANGE_PASSWORD_API_ADMIN = `${BACKEND_URL}/auth/admin/change/password`;

  const handle401Error = () => {
    localStorage.removeItem('token');
    showToast('error', 'Session expired. Please login again.');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  };

  // ---------- Role Check ----------
  const getRole = () => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) return String(storedRole).toLowerCase();
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return String(u.role || '').toLowerCase();
    } catch {
      return '';
    }
  };
  const userRole = getRole();
  const isShopRole = userRole === 'shop';
  const isAdminRole = userRole === 'admin' || userRole === 'superadmin';
  const canChangePassword = isShopRole || isAdminRole;

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
    image: null,
    imageFile: null,
    imagePreview: null,
    createdAt: '',
    updatedAt: '',
    raw: {},
    slug: '',
    profileUrl: '',
  });

  const [tempProfile, setTempProfile] = useState({ ...adminProfile });

  // ---------- Helpers ----------
  const buildImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `${BACKEND_URL}/${img.replace(/^\/+/, '')}`;
  };

  const buildProfileUrl = (key) => {
    if (!key) return '';
    return `${window.location.origin}/shop/${key}`;
  };

  const getStoredUser = () => {
    const keys = [
      'user', 'userData', 'userInfo', 'shop', 'shopData',
      'currentUser', 'profile', 'authUser', 'loggedUser',
      'admin', 'adminData',
    ];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          const obj = Array.isArray(parsed) ? parsed[0] : parsed;
          if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
            if (obj.user && typeof obj.user === 'object') return { ...obj, ...obj.user };
            return obj;
          }
        }
      } catch (e) {
        /* ignore */
      }
    }
    return {};
  };

  const pick = (...values) => {
    for (const v of values) {
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  };

  const deriveActiveStatus = (data, storedUser) => {
    const rawStatus = pick(
      data.is_active, data.active, data.status, data.shop_status,
      storedUser.is_active, storedUser.active, storedUser.status, storedUser.shop_status
    );
    if (typeof rawStatus === 'boolean') return rawStatus;
    if (typeof rawStatus === 'number') return rawStatus === 1;
    if (typeof rawStatus === 'string') {
      const lower = rawStatus.toLowerCase();
      if (['active', 'open', '1', 'true', 'yes'].includes(lower)) return true;
      if (['inactive', 'closed', '0', 'false', 'no', 'disable', 'disabled'].includes(lower)) return false;
    }
    return true;
  };

  // ==================================================================
  // ⭐ ADMIN: load profile from localStorage (NO shop API call)
  // ==================================================================
  const loadAdminProfileFromStorage = () => {
    const storedUser = getStoredUser();
    const roleLower = getRole();

    const mapped = {
      id: pick(storedUser.id, storedUser.user_id, storedUser.admin_id),
      fullName: pick(
        storedUser.full_name,
        storedUser.name,
        storedUser.username,
        storedUser.email ? storedUser.email.split('@')[0] : '',
        'Admin'
      ),
      email: pick(storedUser.email),
      role: roleLower
        ? roleLower.charAt(0).toUpperCase() + roleLower.slice(1)
        : 'Admin',
      phone: pick(storedUser.phone, storedUser.phone_number, storedUser.mobile),
      location: [storedUser.address, storedUser.township, storedUser.region]
        .filter(Boolean)
        .join(', '),
      address: pick(storedUser.address, storedUser.street),
      township: pick(storedUser.township, storedUser.city),
      region: pick(storedUser.region, storedUser.state),
      department: pick(storedUser.department, 'Administration'),
      joinDate: storedUser.created_at
        ? new Date(storedUser.created_at).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })
        : '',
      lastLogin:
        'Today at ' +
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
        }),
      timezone: 'Asia/Yangon (MMT)',
      status: storedUser.status
        ? storedUser.status.charAt(0).toUpperCase() + storedUser.status.slice(1)
        : 'Active',
      image: buildImageUrl(pick(storedUser.image, storedUser.avatar)),
      imageFile: null,
      imagePreview: buildImageUrl(pick(storedUser.image, storedUser.avatar)),
      createdAt: pick(storedUser.created_at),
      updatedAt: pick(storedUser.updated_at),
      raw: storedUser,
      slug: pick(storedUser.slug, storedUser.username),
      profileUrl: '',
    };

    setAdminProfile(mapped);
    setTempProfile({ ...mapped });
    setLoading(false);
  };

  // ---------- FETCH SHOP PROFILE (Shop only) ----------
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
      const rawData = result.data || result.shop || result.user || result || {};
      const data = Array.isArray(rawData) ? (rawData[0] || {}) : rawData;
      const storedUser = getStoredUser();

      const mapped = {
        id: pick(
          data.shop_id, data.id, data.user_id,
          storedUser.shop_id, storedUser.id, storedUser.user_id
        ),
        fullName: pick(
          data.shop_name, data.name, data.full_name, data.username,
          storedUser.shop_name, storedUser.name, storedUser.full_name, storedUser.username,
          'Shop'
        ),
        email: pick(data.email, data.shop_email, storedUser.email, storedUser.shop_email),
        role: data.role
          ? data.role.charAt(0).toUpperCase() + data.role.slice(1)
          : (storedUser.role
              ? storedUser.role.charAt(0).toUpperCase() + storedUser.role.slice(1)
              : 'Shop'),
        phone: pick(
          data.phone, data.phone_number, data.mobile,
          storedUser.phone, storedUser.phone_number, storedUser.mobile
        ),
        location: pick(
          data.location,
          [data.address, data.township, data.region].filter(Boolean).join(', '),
          [storedUser.address, storedUser.township, storedUser.region].filter(Boolean).join(', ')
        ),
        address: pick(data.address, data.street, storedUser.address, storedUser.street),
        township: pick(data.township, data.city, storedUser.township, storedUser.city),
        region: pick(data.region, data.state, storedUser.region, storedUser.state),
        department: pick(data.department, storedUser.department, 'Operations'),
        joinDate: data.created_at
          ? new Date(data.created_at).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })
          : (storedUser.created_at
              ? new Date(storedUser.created_at).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })
              : ''),
        lastLogin:
          'Today at ' +
          new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit',
          }),
        timezone: 'Asia/Yangon (MMT)',
        status: data.status
          ? data.status.charAt(0).toUpperCase() + data.status.slice(1)
          : (storedUser.status
              ? storedUser.status.charAt(0).toUpperCase() + storedUser.status.slice(1)
              : 'Active'),
        image: buildImageUrl(pick(
          data.image, data.avatar, data.logo,
          storedUser.image, storedUser.avatar, storedUser.logo
        )),
        imageFile: null,
        imagePreview: buildImageUrl(pick(
          data.image, data.avatar, data.logo,
          storedUser.image, storedUser.avatar, storedUser.logo
        )),
        createdAt: pick(data.created_at, storedUser.created_at),
        updatedAt: pick(data.updated_at, storedUser.updated_at),
        raw: data,
        slug: pick(
          data.slug, data.username, data.profile_slug, data.shop_code,
          storedUser.slug, storedUser.username, storedUser.profile_slug, storedUser.shop_code
        ),
        profileUrl: pick(
          data.profile_url, data.profileUrl,
          storedUser.profile_url, storedUser.profileUrl
        ),
      };

      if (!mapped.profileUrl) {
        const key = mapped.slug || mapped.id;
        if (key) mapped.profileUrl = buildProfileUrl(key);
      }

      setAdminProfile(mapped);
      setTempProfile({ ...mapped });

      const activeStatus = deriveActiveStatus(data, storedUser);
      setIsShopActive(activeStatus);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Failed to load shop profile.');
    } finally {
      setLoading(false);
    }
  };

  // ==================================================================
  // ⭐ ROLE-AWARE INITIAL LOAD  (404 fix)
  // ==================================================================
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }

    const role = getRole();
    if (role === 'shop') {
      fetchProfile();
    } else {
      loadAdminProfileFromStorage();
    }
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

  // ==================================================================
  // ⭐ PASSWORD CHANGE (Shop + Admin)
  // ==================================================================
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwdVisibility, setPwdVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePwdVisibility = (field) => {
    setPwdVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPwdVisibility({ current: false, new: false, confirm: false });
  };

  const getChangePasswordApi = () => {
    if (isShopRole) return CHANGE_PASSWORD_API_SHOP;
    if (isAdminRole) return CHANGE_PASSWORD_API_ADMIN;
    return null;
  };

  const handleChangePassword = async () => {
    if (!canChangePassword) {
      showToast('warning', 'You do not have permission to change password.');
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('warning', 'Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('warning', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('warning', 'New password and confirm password do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      showToast('warning', 'New password must be different from current password.');
      return;
    }

    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    const api = getChangePasswordApi();
    if (!api) {
      showToast('error', 'Password change endpoint not configured for your role.');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(api, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          CurrentPassword: currentPassword,
          NewPassword: newPassword,
          ConfirmPassword: confirmPassword,
        }),
      });

      if (response.status === 401) return handle401Error();

      let result = {};
      try {
        result = await response.json();
      } catch {
        /* non-JSON */
      }

      if (!response.ok || result.success === false) {
        const msg =
          result.message ||
          result.error ||
          result.detail ||
          `Failed to change password (${response.status})`;
        throw new Error(msg);
      }

      showToast('success', '🔐 Password changed successfully!');
      setSuccessMsg('Password changed successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      resetPasswordForm();
    } catch (err) {
      console.error('❌ Change Password Error:', err);
      showToast('error', 'Error: ' + (err.message || 'Failed to change password'));
    } finally {
      setChangingPassword(false);
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
    setTempProfile({ ...tempProfile, imageFile: file, imagePreview: previewUrl });
  };

  const removeProfileImage = () => {
    if (tempProfile.imagePreview && tempProfile.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(tempProfile.imagePreview);
    }
    setTempProfile({ ...tempProfile, imageFile: null, imagePreview: null, image: null });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      const clean = value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
      setTempProfile({ ...tempProfile, slug: clean });
      return;
    }
    setTempProfile({ ...tempProfile, [name]: value });
  };

  // ---------- Copy / Share Profile Link ----------
  const copyProfileLink = async () => {
    const link = adminProfile.profileUrl || buildProfileUrl(adminProfile.slug || adminProfile.id);
    if (!link) {
      showToast('warning', 'Profile link is not available yet.');
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.top = '-1000px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('success', 'Profile link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('error', 'Could not copy link. Please copy manually.');
    }
  };

  const shareProfileLink = async () => {
    const link = adminProfile.profileUrl || buildProfileUrl(adminProfile.slug || adminProfile.id);
    if (!link) {
      showToast('warning', 'Profile link is not available yet.');
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: adminProfile.fullName || 'Shop Profile',
          text: `Check out ${adminProfile.fullName || 'our shop'} on Myanmar Travel`,
          url: link,
        });
      } else {
        copyProfileLink();
      }
    } catch (err) {
      /* user cancel */
    }
  };

  // ---------- TOGGLE SHOP ACTIVE/INACTIVE ----------
  const handleToggleActive = async () => {
    if (!isShopRole) {
      showToast('warning', 'Only shop accounts can toggle this.');
      return;
    }
    const token = getToken();
    if (!token) {
      showToast('error', 'Please login first');
      return;
    }

    const previousState = isShopActive;
    const newState = !isShopActive;
    setTogglingActive(true);
    setIsShopActive(newState);

    try {
      const response = await fetch(ACTIVATE_API, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newState }),
      });

      if (response.status === 401) {
        setIsShopActive(previousState);
        return handle401Error();
      }

      let result = {};
      try {
        result = await response.json();
      } catch {
        /* empty */
      }

      if (!response.ok || result.success === false) {
        setIsShopActive(previousState);
        throw new Error(result.message || result.error || `Failed (${response.status})`);
      }

      try {
        const keys = ['user', 'userData', 'userInfo', 'shop', 'shopData', 'currentUser'];
        for (const key of keys) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              const merged = {
                ...parsed,
                status: newState ? 'Active' : 'Inactive',
                is_active: newState,
                active: newState,
              };
              localStorage.setItem(key, JSON.stringify(merged));
            }
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }

      setAdminProfile((prev) => ({
        ...prev,
        status: newState ? 'Active' : 'Inactive',
        raw: {
          ...prev.raw,
          status: newState ? 'active' : 'inactive',
          is_active: newState,
          active: newState,
        },
      }));

      showToast(
        'success',
        newState ? '🏪 Shop turned ON successfully!' : '🔒 Shop turned OFF successfully!'
      );
    } catch (err) {
      setIsShopActive(previousState);
      showToast('error', 'Error: ' + (err.message || 'Toggle failed'));
    } finally {
      setTogglingActive(false);
    }
  };

  // ==================================================================
  // ⭐ SAVE PROFILE — role-aware
  // ==================================================================
  const handleSaveProfile = async () => {
    if (!tempProfile.fullName || !tempProfile.fullName.trim()) {
      showToast('warning', 'Name is required.');
      return;
    }

    // ---------- ADMIN: localStorage only ----------
    if (!isShopRole) {
      try {
        const updateKeys = ['user', 'userData', 'userInfo', 'admin', 'adminData', 'currentUser', 'profile'];
        for (const key of updateKeys) {
          try {
            const existing = localStorage.getItem(key);
            if (existing) {
              const parsed = JSON.parse(existing);
              const merged = {
                ...parsed,
                full_name: tempProfile.fullName,
                name: tempProfile.fullName,
                username: parsed.username || tempProfile.fullName,
                email: tempProfile.email,
                phone: tempProfile.phone,
                address: tempProfile.address,
                township: tempProfile.township,
                region: tempProfile.region,
                department: tempProfile.department,
              };
              localStorage.setItem(key, JSON.stringify(merged));
            }
          } catch (e) {
            /* ignore */
          }
        }

        setAdminProfile({ ...tempProfile });
        setIsEditingProfile(false);
        showToast('success', 'Profile updated successfully!');
        setSuccessMsg('Profile updated successfully!');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (err) {
        showToast('error', 'Error: ' + err.message);
      }
      return;
    }

    // ---------- SHOP: shop API ----------
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
      if (tempProfile.slug) form.append('slug', tempProfile.slug.trim());
      if (tempProfile.imageFile) form.append('image', tempProfile.imageFile);

      const response = await fetch(`${API_BASE_SHOP}/profile/update`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (response.status === 401) return handle401Error();
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
      }

      const result = await response.json();
      if (result.success === false) throw new Error(result.message || 'Update failed');

      try {
        const updateKeys = ['user', 'userData', 'userInfo', 'shop', 'shopData', 'currentUser', 'profile'];
        for (const key of updateKeys) {
          try {
            const existing = localStorage.getItem(key);
            if (existing) {
              const parsed = JSON.parse(existing);
              const merged = {
                ...parsed,
                name: tempProfile.fullName,
                shop_name: tempProfile.fullName,
                full_name: tempProfile.fullName,
                email: tempProfile.email,
                phone: tempProfile.phone,
                address: tempProfile.address,
                township: tempProfile.township,
                region: tempProfile.region,
                slug: tempProfile.slug,
              };
              localStorage.setItem(key, JSON.stringify(merged));
            }
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }

      await fetchProfile();
      setIsEditingProfile(false);
      showToast('success', 'Shop profile updated successfully!');
      setSuccessMsg('Shop profile updated successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      setError(err.message);
      showToast('error', 'Error: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (tempProfile.imagePreview && tempProfile.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(tempProfile.imagePreview);
    }
    setTempProfile({ ...adminProfile });
    setIsEditingProfile(false);
  };

  const handleStartEdit = () => {
    setTempProfile({ ...adminProfile });
    setIsEditingProfile(true);
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

  // ---------- Switch Button ----------
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
        <div
          style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
            padding: '12px 20px', borderRadius: '8px',
            backgroundColor: toast.type === 'success' ? '#d4edda' : toast.type === 'warning' ? '#fff3cd' : '#f8d7da',
            color: toast.type === 'success' ? '#155724' : toast.type === 'warning' ? '#856404' : '#721c24',
            border: '1px solid ' + (toast.type === 'success' ? '#c3e6cb' : toast.type === 'warning' ? '#ffeeba' : '#f5c6cb'),
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: '420px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast({ ...toast, visible: false })}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {showSuccessMessage && (
        <div className="success-message">
          <i className="bi bi-check-circle-fill"></i>
          {successMsg}
        </div>
      )}

      {loading && (
        <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '10px', textAlign: 'center' }}>
          ⏳ Loading...
        </div>
      )}

      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', margin: '10px', borderRadius: '5px' }}>
          ❌ {error}
          <button
            onClick={() => setError(null)}
            style={{ marginLeft: '10px', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

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

      <div className="settings-two-columns">
        {/* ============ Left Column - Profile Card ============ */}
        <div className="admin-profile-card">
          <div className="profile-header">
            <div className="profile-image-section">
              <div className="profile-avatar-large">
                {tempProfile.imagePreview ? (
                  <img src={tempProfile.imagePreview} alt="Profile" />
                ) : (
                  <span className="avatar-emoji">{isShopRole ? '🏪' : '👤'}</span>
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
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
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
                  value={tempProfile.fullName || ''}
                  onChange={handleProfileChange}
                  className="profile-name-input"
                  placeholder="Full Name"
                  autoComplete="off"
                />
              ) : (
                <h2>{adminProfile.fullName || (isShopRole ? 'Shop' : 'Admin')}</h2>
              )}
              <span className={getStatusBadgeClass(adminProfile.status)}>
                {adminProfile.status}
              </span>
              {isEditingProfile ? (
                <input
                  type="text"
                  name="role"
                  value={tempProfile.role || ''}
                  className="profile-role-input"
                  disabled
                />
              ) : (
                <p className="profile-role">{adminProfile.role}</p>
              )}
            </div>
          </div>

          {/* SHOP STATUS — Shop only */}
          {isShopRole && (
            <div
              className="shop-active-section"
              style={{
                margin: '12px 0 0',
                padding: '14px 16px',
                borderRadius: 10,
                background: isDarkMode
                  ? (isShopActive ? 'rgba(40,167,69,0.12)' : 'rgba(220,53,69,0.12)')
                  : (isShopActive ? '#e6f7ed' : '#fdeaec'),
                border: `1px solid ${isShopActive
                  ? (isDarkMode ? 'rgba(40,167,69,0.35)' : '#b7e4c7')
                  : (isDarkMode ? 'rgba(220,53,69,0.35)' : '#f5c6cb')}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i
                    className={`bi ${isShopActive ? 'bi-shop-window' : 'bi-shop'}`}
                    style={{ fontSize: 22, color: isShopActive ? '#28a745' : '#dc3545' }}
                  ></i>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: isDarkMode ? '#eee' : '#333' }}>
                      Shop Status
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: isShopActive
                          ? (isDarkMode ? '#b7eb8f' : '#155724')
                          : (isDarkMode ? '#ffa39e' : '#721c24'),
                      }}
                    >
                      {isShopActive
                        ? 'Currently ON — customers can see your shop'
                        : 'Currently OFF — hidden from customers'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={togglingActive || loading}
                  title={isShopActive ? 'Click to turn shop OFF' : 'Click to turn shop ON'}
                  style={{
                    position: 'relative', width: 64, height: 32, borderRadius: 16,
                    border: 'none',
                    cursor: togglingActive ? 'not-allowed' : 'pointer',
                    background: isShopActive ? '#28a745' : (isDarkMode ? '#555' : '#ccc'),
                    opacity: togglingActive ? 0.55 : 1,
                    transition: 'background 0.25s ease', flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute', top: 3, left: isShopActive ? 34 : 3,
                      width: 26, height: 26, borderRadius: '50%', background: '#fff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                      transition: 'left 0.25s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {togglingActive ? (
                      <i
                        className="bi bi-arrow-repeat"
                        style={{ fontSize: 14, color: '#333', animation: 'spin 1s linear infinite' }}
                      ></i>
                    ) : (
                      <i
                        className={`bi ${isShopActive ? 'bi-check-lg' : 'bi-x-lg'}`}
                        style={{ fontSize: 12, color: isShopActive ? '#28a745' : '#999' }}
                      ></i>
                    )}
                  </span>
                </button>
              </div>

              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 10px', borderRadius: 12,
                    background: isShopActive
                      ? (isDarkMode ? 'rgba(40,167,69,0.25)' : '#d4edda')
                      : (isDarkMode ? 'rgba(220,53,69,0.25)' : '#f8d7da'),
                    color: isShopActive
                      ? (isDarkMode ? '#b7eb8f' : '#155724')
                      : (isDarkMode ? '#ffa39e' : '#721c24'),
                    fontWeight: 600,
                  }}
                >
                  <i className={`bi ${isShopActive ? 'bi-circle-fill' : 'bi-circle'}`} style={{ fontSize: 8 }}></i>
                  {isShopActive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          )}

          {/* PROFILE LINK — Shop only */}
          {isShopRole && (
            <div className="profile-link-section" style={{ marginTop: 12 }}>
              <div className="profile-link-header">
                <i className="bi bi-link-45deg"></i>
                <span className="detail-label">Profile Link (Shareable)</span>
              </div>

              {isEditingProfile ? (
                <>
                  <div className="profile-link-input-wrap">
                    <span className="link-prefix">{window.location.origin}/shop/</span>
                    <input
                      type="text"
                      name="slug"
                      value={tempProfile.slug || ''}
                      onChange={handleProfileChange}
                      className="detail-input slug-input"
                      placeholder="my-shop-name"
                      autoComplete="off"
                    />
                  </div>
                  <p className="field-note">
                    Letters, numbers and dashes only. This becomes your public profile link.
                  </p>
                </>
              ) : (
                <div className="profile-link-input-wrap">
                  <input
                    type="text"
                    readOnly
                    value={
                      adminProfile.profileUrl ||
                      buildProfileUrl(adminProfile.slug || adminProfile.id) ||
                      'Profile link will be available soon'
                    }
                    onFocus={(e) => e.target.select()}
                    className="detail-input link-readonly"
                  />
                </div>
              )}

              <div className="profile-link-actions">
                <button
                  type="button"
                  className="copy-link-btn"
                  onClick={copyProfileLink}
                  disabled={!adminProfile.profileUrl && !adminProfile.slug && !adminProfile.id}
                >
                  <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard'}`}></i>
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  className="open-link-btn"
                  href={
                    adminProfile.profileUrl ||
                    buildProfileUrl(adminProfile.slug || adminProfile.id) ||
                    '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!adminProfile.profileUrl && !adminProfile.slug && !adminProfile.id) {
                      e.preventDefault();
                    }
                  }}
                >
                  <i className="bi bi-box-arrow-up-right"></i> Open
                </a>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button type="button" className="share-link-btn" onClick={shareProfileLink}>
                    <i className="bi bi-share-fill"></i> Share
                  </button>
                )}
              </div>
            </div>
          )}

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
                    value={tempProfile.email || ''}
                    onChange={handleProfileChange}
                    className="detail-input"
                    placeholder="email@example.com"
                    autoComplete="off"
                  />
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
                  <input
                    type="text"
                    name="phone"
                    value={tempProfile.phone || ''}
                    onChange={handleProfileChange}
                    className="detail-input"
                    placeholder="09-xxxxxxxxx"
                    autoComplete="off"
                  />
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
                  <input
                    type="text"
                    name="address"
                    value={tempProfile.address || ''}
                    onChange={handleProfileChange}
                    className="detail-input"
                    placeholder="Street address"
                    autoComplete="off"
                  />
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
                  <input
                    type="text"
                    name="township"
                    value={tempProfile.township || ''}
                    onChange={handleProfileChange}
                    className="detail-input"
                    placeholder="Township"
                    autoComplete="off"
                  />
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
                  <input
                    type="text"
                    name="region"
                    value={tempProfile.region || ''}
                    onChange={handleProfileChange}
                    className="detail-input"
                    placeholder="Region"
                    autoComplete="off"
                  />
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
                  <input
                    type="text"
                    name="department"
                    value={tempProfile.department || ''}
                    onChange={handleProfileChange}
                    className="detail-input"
                    autoComplete="off"
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

          {/* Stats — Shop only */}
          {isShopRole && (
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
          )}

          {/* Edit/Cancel */}
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
            <button className="edit-profile-btn" onClick={handleStartEdit} disabled={loading}>
              <i className="bi bi-pencil-square"></i> Edit Profile
            </button>
          )}
        </div>

        {/* ============ Right Column - Settings Tabs ============ */}
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
            {/* ---------- GENERAL ---------- */}
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
                      onChange={(checked) =>
                        setGeneralSettings({ ...generalSettings, maintenanceMode: checked })
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

            {/* ---------- NOTIFICATIONS ---------- */}
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
                        onChange={(c) => handleNotificationChange('emailNotifications', c)}
                        label="Email Notifications"
                      />
                      <SwitchButton
                        checked={notificationSettings.smsNotifications}
                        onChange={(c) => handleNotificationChange('smsNotifications', c)}
                        label="SMS Notifications"
                      />
                      <SwitchButton
                        checked={notificationSettings.pushNotifications}
                        onChange={(c) => handleNotificationChange('pushNotifications', c)}
                        label="Push Notifications"
                      />
                    </div>
                  </div>
                  <div className="notification-group">
                    <h3>Events</h3>
                    <div className="switch-grid">
                      <SwitchButton
                        checked={notificationSettings.newUserAlert}
                        onChange={(c) => handleNotificationChange('newUserAlert', c)}
                        label="New User Registration"
                      />
                      <SwitchButton
                        checked={notificationSettings.newBookingAlert}
                        onChange={(c) => handleNotificationChange('newBookingAlert', c)}
                        label="New Booking"
                      />
                      <SwitchButton
                        checked={notificationSettings.newReviewAlert}
                        onChange={(c) => handleNotificationChange('newReviewAlert', c)}
                        label="New Review"
                      />
                      <SwitchButton
                        checked={notificationSettings.reportAlert}
                        onChange={(c) => handleNotificationChange('reportAlert', c)}
                        label="Reported Content"
                      />
                    </div>
                  </div>
                  <div className="notification-group">
                    <h3>Digests</h3>
                    <div className="switch-grid">
                      <SwitchButton
                        checked={notificationSettings.dailyDigest}
                        onChange={(c) => handleNotificationChange('dailyDigest', c)}
                        label="Daily Digest"
                      />
                      <SwitchButton
                        checked={notificationSettings.weeklyReport}
                        onChange={(c) => handleNotificationChange('weeklyReport', c)}
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

            {/* ---------- SECURITY — Change Password only ---------- */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2 className="section-title">
                  <i className="bi bi-shield-lock-fill"></i> Security Settings
                </h2>

                {canChangePassword ? (
                  <div
                    className="password-change-card"
                    style={{
                      padding: '18px 18px 14px',
                      borderRadius: 12,
                      background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : '#e5e9f0'}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 14,
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <h3
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 15,
                          fontWeight: 600,
                          margin: 0,
                          color: isDarkMode ? '#f1f5f9' : '#1f2937',
                        }}
                      >
                        <i className="bi bi-key-fill" style={{ color: '#4f46e5' }}></i>
                        Change Password
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 20,
                          background: isShopRole
                            ? (isDarkMode ? 'rgba(59,130,246,0.2)' : '#dbeafe')
                            : (isDarkMode ? 'rgba(168,85,247,0.2)' : '#f3e8ff'),
                          color: isShopRole
                            ? (isDarkMode ? '#93c5fd' : '#1d4ed8')
                            : (isDarkMode ? '#d8b4fe' : '#6b21a8'),
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        <i className={`bi ${isShopRole ? 'bi-shop' : 'bi-person-badge'} me-1`}></i>
                        {isShopRole ? 'Shop Account' : 'Admin Account'}
                      </span>
                    </div>

                    <div className="settings-form">
                      <div className="form-group">
                        <label>Current Password</label>
                        <div className="password-input-wrap">
                          <input
                            type={pwdVisibility.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordFormChange}
                            placeholder="Enter current password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => togglePwdVisibility('current')}
                            title={pwdVisibility.current ? 'Hide' : 'Show'}
                          >
                            <i className={`bi ${pwdVisibility.current ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>New Password</label>
                          <div className="password-input-wrap">
                            <input
                              type={pwdVisibility.new ? 'text' : 'password'}
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordFormChange}
                              placeholder="Min. 6 characters"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => togglePwdVisibility('new')}
                              title={pwdVisibility.new ? 'Hide' : 'Show'}
                            >
                              <i className={`bi ${pwdVisibility.new ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Confirm New Password</label>
                          <div className="password-input-wrap">
                            <input
                              type={pwdVisibility.confirm ? 'text' : 'password'}
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordFormChange}
                              placeholder="Re-enter new password"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              className="password-toggle-btn"
                              onClick={() => togglePwdVisibility('confirm')}
                              title={pwdVisibility.confirm ? 'Hide' : 'Show'}
                            >
                              <i className={`bi ${pwdVisibility.confirm ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      {passwordForm.newPassword && passwordForm.confirmPassword && (
                        <p
                          style={{
                            margin: '4px 0 0',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            color:
                              passwordForm.newPassword === passwordForm.confirmPassword
                                ? '#16a34a'
                                : '#dc2626',
                          }}
                        >
                          <i
                            className={`bi ${
                              passwordForm.newPassword === passwordForm.confirmPassword
                                ? 'bi-check-circle-fill'
                                : 'bi-x-circle-fill'
                            }`}
                          ></i>
                          {passwordForm.newPassword === passwordForm.confirmPassword
                            ? 'Passwords match'
                            : 'Passwords do not match'}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: `1px dashed ${
                          isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                        }`,
                      }}
                    >
                      <button
                        className="btn-secondary"
                        onClick={resetPasswordForm}
                        disabled={changingPassword}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i> Clear
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                      >
                        {changingPassword ? (
                          <>
                            <i
                              className="bi bi-arrow-repeat"
                              style={{ animation: 'spin 1s linear infinite' }}
                            ></i>{' '}
                            Changing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-shield-lock-fill"></i> Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="field-note">You do not have permission to change password.</p>
                )}
              </div>
            )}

            {/* ---------- APPEARANCE ---------- */}
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
                    <SwitchButton
                      checked={appearanceSettings.sidebarCollapsed}
                      onChange={(c) =>
                        setAppearanceSettings({ ...appearanceSettings, sidebarCollapsed: c })
                      }
                      label="Collapse Sidebar by Default"
                    />
                    <SwitchButton
                      checked={appearanceSettings.compactMode}
                      onChange={(c) =>
                        setAppearanceSettings({ ...appearanceSettings, compactMode: c })
                      }
                      label="Compact Mode (Denser Layout)"
                    />
                    <SwitchButton
                      checked={appearanceSettings.animationsEnabled}
                      onChange={(c) =>
                        setAppearanceSettings({ ...appearanceSettings, animationsEnabled: c })
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

            {/* ---------- BACKUP ---------- */}
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
                      onChange={(c) => setBackupSettings({ ...backupSettings, autoBackup: c })}
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
                              setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })
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
                              setBackupSettings({ ...backupSettings, backupTime: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Backup Location</label>
                        <select
                          value={backupSettings.backupLocation}
                          onChange={(e) =>
                            setBackupSettings({ ...backupSettings, backupLocation: e.target.value })
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

      {/* Spinner + Password styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .password-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .password-input-wrap input {
          width: 100%;
          padding-right: 42px !important;
        }
        .password-toggle-btn {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 6px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
          font-size: 15px;
          line-height: 1;
        }
        .password-toggle-btn:hover {
          background: rgba(0, 0, 0, 0.06);
          color: #111827;
        }
        .dark-theme .password-toggle-btn { color: #9ca3af; }
        .dark-theme .password-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f3f4f6;
        }
      `}</style>
    </div>
  );
}

export default Settings;