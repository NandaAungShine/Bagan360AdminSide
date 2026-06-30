
/*
// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Create axios instance (no need to specify baseURL when using proxy)
const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      // Use relative path - will be proxied to your backend
      const response = await api.post('/auth/login', {
        email: email,
        password: password
      });
      
      console.log('Response:', response.data);
      
      // Your server response format: { message, success, token, user }
      if (response.data.success === true && response.data.token) {
        localStorage.clear();
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setLoading(false);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        // Server responded with error
        console.log('Error response:', error.response.data);
        setError(error.response.data?.message || 'Login failed');
      } else if (error.request) {
        // No response from server
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('An unexpected error occurred');
      }
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label>Email Address</label>
            <div className="login-input-wrapper">
              <i className="bi bi-envelope-fill"></i>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <div className="login-input-wrapper">
              <i className="bi bi-lock-fill"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
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
      </div>
    </div>
  );
}

export default Login;
*/


// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    // API ချိတ်တာကို ခေတ္တပိတ်ပြီး Local (Mock) စစ်ဆေးခြင်း
    setTimeout(() => {
      // --------------------------------------------------
      // သတ်မှတ်ထားတဲ့ Example Email နဲ့ Password စစ်ဆေးချက်
      // --------------------------------------------------
      const EXAMPLE_EMAIL = 'admin@gmail.com';
      const EXAMPLE_PASSWORD = 'password123';

      if (email === EXAMPLE_EMAIL && password === EXAMPLE_PASSWORD) {
        localStorage.clear();
        // Mock Token နဲ့ User Data သိမ်းဆည်းခြင်း
        localStorage.setItem('token', 'mock-token-12345');
        localStorage.setItem('user', JSON.stringify({ name: 'Admin User', email: email }));
        
        setLoading(false);
        navigate('/dashboard');
      } else {
        setError('အီးမေးလ် သို့မဟုတ် ပတ်စ်ဝေါ့ မှားယွင်းနေပါသည်။');
        setLoading(false);
      }
    }, 1000); // loading ပြတာလေး မြင်ရအောင် 1 စက္ကန့် စောင့်ခိုင်းထားတာပါ
  };

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

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label>Email Address</label>
            <div className="login-input-wrapper">
              <i className="bi bi-envelope-fill"></i>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <div className="login-input-wrapper">
              <i className="bi bi-lock-fill"></i>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
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
      </div>
    </div>
  );
}

export default Login;