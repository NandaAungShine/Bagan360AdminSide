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

  // ---------- Signup State ----------
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

  // ---------- Login handler (unchanged, but includes shop type saving) ----------
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

        // Save shop type if shop
        if (user?.role === 'shop') {
          const shopType = response.data.shop?.type || user?.type || null;
          if (shopType) {
            localStorage.setItem('shopType', shopType);
          } else {
            // Try to fetch from /auth/me
            try {
              const meRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
              });
              const meType = meRes.data?.shop?.type || meRes.data?.type || null;
              if (meType) localStorage.setItem('shopType', meType);
            } catch (e) {
              console.warn('Could not fetch shop type from /auth/me');
            }
          }
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

  // ---------- Signup handler (unchanged) ----------
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    const { username, shop_name, email, password, address, township, region, shop_address, shop_phone, nrc, type } = signupData;
    if (!username || !shop_name || !email || !password || !address || !township || !region || !shop_address || !shop_phone || !nrc) {
      setSignupError('All fields are required.');
      setSignupLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/shop/register', {
        username,
        shop_name,
        email,
        password,
        address,
        township,
        region,
        shop_address,
        shop_phone,
        nrc,
        type,
      });

      if (response.data?.success && response.data?.token) {
        setOtpToken(response.data.token);
        setSignupData(prev => ({ ...prev, email }));
        setActiveTab('otp');
        setSignupSuccess(false);
        setOtp('');
      } else {
        setSignupError(response.data?.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response) {
        setSignupError(err.response.data?.message || `Error ${err.response.status}`);
      } else if (err.request) {
        setSignupError('No response from server.');
      } else {
        setSignupError('An unexpected error occurred.');
      }
    } finally {
      setSignupLoading(false);
    }
  };

  // ---------- OTP Verification (IMPROVED) ----------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    if (!otp || otp.length < 4) {
      setOtpError('Please enter a valid OTP.');
      setOtpLoading(false);
      return;
    }

    // List of possible payload variations to try
    const payloadVariations = [
      // 1. Original
      { email: signupData.email, otp: otp.trim(), token: otpToken },
      // 2. otp_code instead of otp
      { email: signupData.email, otp_code: otp.trim(), token: otpToken },
      // 3. code instead of otp
      { email: signupData.email, code: otp.trim(), token: otpToken },
      // 4. verification_token instead of token
      { email: signupData.email, otp: otp.trim(), verification_token: otpToken },
      // 5. Without token
      { email: signupData.email, otp: otp.trim() },
      // 6. otp_code without token
      { email: signupData.email, otp_code: otp.trim() },
      // 7. code without token
      { email: signupData.email, code: otp.trim() },
    ];

    let lastError = null;

    for (let i = 0; i < payloadVariations.length; i++) {
      const payload = payloadVariations[i];
      try {
        console.log(`📤 Trying OTP payload variation ${i+1}:`, payload);
        const response = await api.post('/auth/shop/verify/otp', payload);

        if (response.data?.code === 200 || response.data?.success === true) {
          setSignupSuccess(true);
          setActiveTab('login');
          setEmail(signupData.email);
          setSignupData({
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
          setOtp('');
          setOtpToken('');
          setOtpLoading(false);
          return; // success, exit
        } else {
          // If response says failure, we can stop trying
          setOtpError(response.data?.message || 'OTP verification failed.');
          setOtpLoading(false);
          return;
        }
      } catch (err) {
        console.warn(`⚠️ Variation ${i+1} failed:`, err.message);
        lastError = err;
        // Continue to next variation
      }
    }

    // If all variations failed
    console.error('❌ All OTP payload variations failed.');
    if (lastError?.response) {
      console.error('📄 Last response data:', lastError.response.data);
      setOtpError(
        `Server error (${lastError.response.status}). ` +
        'Please check the console for details. ' +
        'It may be a backend issue; contact support.'
      );
    } else if (lastError?.request) {
      setOtpError('No response from server. Please check your connection.');
    } else {
      setOtpError('OTP verification failed. Please try again.');
    }
    setOtpLoading(false);
  };

  // ---------- Render Helpers (unchanged) ----------
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

  const renderSignup = () => (
    <form onSubmit={handleSignup} className="login-form" noValidate>
      <div className="login-form-group">
        <label>Owner Username</label>
        <div className="login-input-wrapper">
          <i className="bi bi-person-fill"></i>
          <input
            type="text"
            placeholder="Kyaw Zin"
            value={signupData.username}
            onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Shop Name</label>
        <div className="login-input-wrapper">
          <i className="bi bi-building-fill"></i>
          <input
            type="text"
            placeholder="Golden Hotel"
            value={signupData.shop_name}
            onChange={(e) => setSignupData({ ...signupData, shop_name: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Email</label>
        <div className="login-input-wrapper">
          <i className="bi bi-envelope-fill"></i>
          <input
            type="email"
            placeholder="shop@example.com"
            value={signupData.email}
            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Password</label>
        <div className="login-input-wrapper">
          <i className="bi bi-lock-fill"></i>
          <input
            type="password"
            placeholder="••••••••"
            value={signupData.password}
            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Address (User)</label>
        <div className="login-input-wrapper">
          <i className="bi bi-geo-alt-fill"></i>
          <input
            type="text"
            placeholder="Old Bagan"
            value={signupData.address}
            onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Township</label>
        <div className="login-input-wrapper">
          <i className="bi bi-building"></i>
          <input
            type="text"
            placeholder="Nan Si"
            value={signupData.township}
            onChange={(e) => setSignupData({ ...signupData, township: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Region</label>
        <div className="login-input-wrapper">
          <i className="bi bi-globe"></i>
          <input
            type="text"
            placeholder="Chakha"
            value={signupData.region}
            onChange={(e) => setSignupData({ ...signupData, region: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Shop Address</label>
        <div className="login-input-wrapper">
          <i className="bi bi-shop"></i>
          <input
            type="text"
            placeholder="Old Bagan, Nyaung U"
            value={signupData.shop_address}
            onChange={(e) => setSignupData({ ...signupData, shop_address: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Shop Phone</label>
        <div className="login-input-wrapper">
          <i className="bi bi-telephone-fill"></i>
          <input
            type="tel"
            placeholder="09988888888"
            value={signupData.shop_phone}
            onChange={(e) => setSignupData({ ...signupData, shop_phone: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>NRC</label>
        <div className="login-input-wrapper">
          <i className="bi bi-card-text"></i>
          <input
            type="text"
            placeholder="12/lakana(N)308086"
            value={signupData.nrc}
            onChange={(e) => setSignupData({ ...signupData, nrc: e.target.value })}
            required
            disabled={signupLoading}
          />
        </div>
      </div>
      <div className="login-form-group">
        <label>Shop Type</label>
        <div className="login-input-wrapper">
          <i className="bi bi-tags"></i>
          <select
            value={signupData.type}
            onChange={(e) => setSignupData({ ...signupData, type: e.target.value })}
            required
            disabled={signupLoading}
          >
            <option value="hotel">Hotel</option>
            <option value="restaurant">Restaurant</option>
            <option value="e-bike">E-Bike</option>
            <option value="theme-bane">TriCycle</option>
          </select>
        </div>
      </div>
      <button type="submit" className="login-btn" disabled={signupLoading}>
        {signupLoading ? (
          <>
            <i className="bi bi-arrow-repeat spin"></i>
            <span>Registering...</span>
          </>
        ) : (
          <>
            <i className="bi bi-person-plus"></i>
            <span>Sign Up</span>
          </>
        )}
      </button>
    </form>
  );

  const renderOtp = () => (
    <div className="otp-container">
      <h3>Verify Your Email</h3>
      <p>We sent a 6‑digit OTP to <strong>{signupData.email}</strong></p>
      <form onSubmit={handleVerifyOtp} className="login-form">
        <div className="login-form-group">
          <label>OTP Code</label>
          <div className="login-input-wrapper">
            <i className="bi bi-shield-lock-fill"></i>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              maxLength="6"
              required
              disabled={otpLoading}
            />
          </div>
        </div>
        <button type="submit" className="login-btn" disabled={otpLoading}>
          {otpLoading ? (
            <>
              <i className="bi bi-arrow-repeat spin"></i>
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <i className="bi bi-check-circle"></i>
              <span>Verify OTP</span>
            </>
          )}
        </button>
        <div className="otp-actions">
          <button
            type="button"
            className="link-btn"
            onClick={() => setActiveTab('signup')}
            disabled={otpLoading}
          >
            ← Back to Signup
          </button>
        </div>
      </form>
      {signupSuccess && (
        <div className="login-success">
          <i className="bi bi-check-circle-fill"></i>
          <span>Registration successful! You can now log in.</span>
        </div>
      )}
    </div>
  );

  // ---------- Main Render ----------
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
          <p className="login-subtitle">
            {activeTab === 'login' && 'Admin Dashboard Login'}
            {activeTab === 'signup' && 'Shop Registration'}
            {activeTab === 'otp' && 'OTP Verification'}
          </p>
        </div>

        {activeTab === 'login' && error && (
          <div className="login-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}
        {activeTab === 'signup' && signupError && (
          <div className="login-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{signupError}</span>
          </div>
        )}
        {activeTab === 'otp' && otpError && (
          <div className="login-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{otpError}</span>
          </div>
        )}
        {activeTab === 'otp' && signupSuccess && (
          <div className="login-success">
            <i className="bi bi-check-circle-fill"></i>
            <span>OTP verified! You can now login.</span>
          </div>
        )}

        <div className="login-tabs">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSignupError('');
              setOtpError('');
            }}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setSignupError('');
              setOtpError('');
            }}
          >
            Sign Up
          </button>
        </div>

        <div className="login-content">
          {activeTab === 'login' && renderLogin()}
          {activeTab === 'signup' && renderSignup()}
          {activeTab === 'otp' && renderOtp()}
        </div>

        {activeTab === 'login' && (
          <div className="login-footer">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setActiveTab('signup');
                setError('');
              }}
            >
              Sign up here
            </button>
          </div>
        )}
        {activeTab === 'signup' && (
          <div className="login-footer">
            <span>Already have an account? </span>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setActiveTab('login');
                setSignupError('');
              }}
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;