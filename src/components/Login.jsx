// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Create axios instance with proxy
  const api = axios.create({
    baseURL: '/api', // This will be proxied to http://130.94.21.185:8000
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

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
      // Use the proxy - request will go to /api/auth/login
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password: password
      });
      
      console.log('Login Response:', response.data);
      
      if (response.data && response.data.success === true && response.data.token) {
        localStorage.clear();
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        setLoading(false);
        navigate('/dashboard');
      } else {
        setError(response.data?.message || 'Login failed. Please try again.');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          setError('Invalid email or password');
        } else if (status === 404) {
          setError('Login endpoint not found');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(data?.message || `Login failed (Error ${status})`);
        }
      } else if (error.request) {
        setError('No response from server. Please check if backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
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

        <form onSubmit={handleSubmit} className="login-form" noValidate>
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

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
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