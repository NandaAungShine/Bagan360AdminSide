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

      if (response.data?.success === true && response.data?.token) {
        localStorage.clear();
        const token = response.data.token;
        localStorage.setItem('token', token);
        const user = response.data.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          if (user.role) localStorage.setItem('role', user.role);
        }

        // Save shop type & shop ID if shop
        if (user?.role === 'shop') {
          const shopId = response.data.shop?.id || user?.shop_id || null;
          if (shopId) {
            localStorage.setItem('shopId', String(shopId));
            console.log('✅ Shop ID saved:', shopId);
          }

          const shopType = response.data.shop?.type || user?.type || null;
          if (shopType) {
            localStorage.setItem('shopType', shopType);
          } else {
            // Try to fetch from /auth/me
            try {
              const meRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
              });
              const meShopId = meRes.data?.shop?.id || meRes.data?.id || null;
              if (meShopId) localStorage.setItem('shopId', String(meShopId));
              
              const meType = meRes.data?.shop?.type || meRes.data?.type || null;
              if (meType) localStorage.setItem('shopType', meType);
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