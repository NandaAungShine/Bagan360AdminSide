import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  // ---------- Login State ----------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ===== SIGNUP STATE (COMMENTED OUT) =====
  /*
  const [activeTab, setActiveTab] = useState('login');
  const [signupData, setSignupData] = useState({
    username: '',
    shop_name: '',
    email: '',
    password: '',
    address: '',
    township: '',
    region: '',
    shop_address: '',
    shop_phone: '',
    nrc: '',
    type: 'hotel',
  });
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  */

  const navigate = useNavigate();

  // axios instance
  const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // ============ Helper: user object ကို key အမျိုးမျိုးနဲ့ သိမ်းခြင်း ============
  const saveUserToStorage = (userObject) => {
    if (!userObject || typeof userObject !== 'object') return;

    try {
      // Main 'user' key
      localStorage.setItem('user', JSON.stringify(userObject));

      // Backup keys (Settings.jsx fallback အတွက်)
      localStorage.setItem('userData', JSON.stringify(userObject));
      localStorage.setItem('userInfo', JSON.stringify(userObject));
      localStorage.setItem('currentUser', JSON.stringify(userObject));
      localStorage.setItem('profile', JSON.stringify(userObject));

      // Role
      if (userObject.role) {
        localStorage.setItem('role', userObject.role);
      }

      // Shop-specific
      if (userObject.role === 'shop' || userObject.shop_id) {
        localStorage.setItem('shop', JSON.stringify({
          shop_id: userObject.shop_id,
          shop_name: userObject.shop_name || userObject.name,
          email: userObject.email,
          phone: userObject.phone || userObject.shop_phone,
          address: userObject.address || userObject.shop_address,
          township: userObject.township,
          region: userObject.region,
          type: userObject.type,
          image: userObject.image,
          slug: userObject.slug,
        }));
      }

      console.log('💾 User saved to localStorage:', userObject);
    } catch (e) {
      console.warn('❌ Failed to save user to localStorage:', e);
    }
  };

  // ---------- Login handler ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      console.log('✅ Login Response:', response.data);

      if (response.data?.success === true && response.data?.token) {
        localStorage.clear();

        const token = response.data.token;
        localStorage.setItem('token', token);

        // ============ User Object ကို စုစည်းခြင်း ============
        // Backend က response.data.user ဒါမှမဟုတ် response.data.data ဒါမှမဟုတ် response.data ကိုယ်တိုင် ဖြစ်နိုင်တယ်
        const userRaw =
          response.data.user ||
          response.data.data ||
          response.data.shop ||
          response.data;

        // user က Array ဖြစ်နိုင်တယ်
        const user = Array.isArray(userRaw) ? (userRaw[0] || {}) : (userRaw || {});

        console.log('👤 User Object:', user);

        // User ကို localStorage ထဲ သိမ်း
        saveUserToStorage(user);

        // ============ Shop-specific data ============
        if (user?.role === 'shop' || user?.shop_id) {
          const shopId =
            response.data.shop?.id ||
            user?.shop_id ||
            user?.id ||
            null;

          if (shopId) {
            localStorage.setItem('shopId', String(shopId));
            console.log('✅ Shop ID saved:', shopId);
          }

          const shopType =
            response.data.shop?.type ||
            user?.type ||
            user?.shop_type ||
            null;

          if (shopType) {
            localStorage.setItem('shopType', shopType);
          } else {
            // Try to fetch from /auth/me
            try {
              const meRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
              });

              const meData = meRes.data?.data || meRes.data;
              const meShop = Array.isArray(meData) ? meData[0] : meData;

              const meShopId =
                meShop?.shop?.id ||
                meShop?.shop_id ||
                meShop?.id ||
                null;

              if (meShopId) {
                localStorage.setItem('shopId', String(meShopId));
              }

              const meType =
                meShop?.shop?.type ||
                meShop?.type ||
                meShop?.shop_type ||
                null;

              if (meType) {
                localStorage.setItem('shopType', meType);
              }

              // /auth/me က data ပြန်ပေးရင် user object ကိုလည်း merge လုပ်
              if (meShop && typeof meShop === 'object') {
                const merged = { ...user, ...meShop };
                saveUserToStorage(merged);
              }
            } catch (e) {
              console.warn('Could not fetch shop data from /auth/me');
            }
          }
        } else {
          localStorage.removeItem('shopId');
          localStorage.removeItem('shopType');
        }

        navigate('/dashboard');
      } else {
        setError(response.data?.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        const status = err.response.status;
        if (status === 401) setError('Invalid email or password');
        else if (status === 404) setError('Login endpoint not found');
        else if (status === 500) setError('Server error. Please try again later.');
        else setError(err.response.data?.message || `Error ${status}`);
      } else if (err.request) {
        setError('No response from server. Please check if backend is running.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== SIGNUP HANDLER (COMMENTED OUT) =====
  /*
  const handleSignup = async (e) => {
    // ... full signup code ...
  };
  */

  // ===== OTP VERIFICATION (COMMENTED OUT) =====
  /*
  const handleVerifyOtp = async (e) => {
    // ... full OTP code ...
  };
  */

  // ===== RENDER HELPERS =====
  const renderLogin = () => (
    <form onSubmit={handleLogin} className="login-form" noValidate>
      <div className="login-form-group">
        <label htmlFor="email">Email Address</label>
        <div className="login-input-wrapper">
          <i className="bi bi-envelope-fill"></i>
          <input
            id="email"
            type="email"
            placeholder="admin@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            disabled={loading}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="login-form-group">
        <label htmlFor="password">Password</label>
        <div className="login-input-wrapper">
          <i className="bi bi-lock-fill"></i>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
          </button>
        </div>
      </div>

      <button type="submit" className="login-btn" disabled={loading}>
        {loading ? (
          <>
            <i className="bi bi-arrow-repeat spin"></i>
            <span>Logging in...</span>
          </>
        ) : (
          <>
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
          </>
        )}
      </button>
    </form>
  );

  // ===== SIGNUP RENDER (COMMENTED OUT) =====
  /*
  const renderSignup = () => (
    // ... full signup form JSX ...
  );
  */

  // ===== OTP RENDER (COMMENTED OUT) =====
  /*
  const renderOtp = () => (
    // ... full OTP form JSX ...
  );
  */

  // ===== MAIN RENDER =====
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-icon">
            <img
              src="/images/1.jpg"
              alt="Bagan 360 Logo"
              className="logo-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/64?text=B360';
              }}
            />
          </div>
          <h1 className="login-logo">Bagan 360</h1>
          <p className="login-subtitle">Admin Dashboard Login</p>
        </div>

        {error && (
          <div className="login-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="login-content">
          {renderLogin()}
        </div>

        <div className="login-footer">
          <span>Contact admin for account access.</span>
        </div>
      </div>
    </div>
  );
}

export default Login;