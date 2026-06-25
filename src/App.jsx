// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import HistoryOfPagodas from './components/HistoryOfPagodas';
import Hotels from './components/Hotels';
import Destinations from './components/Destinations';
import Restaurants from './components/Restaurants';
import Cars from './components/Cars';
import EBikes from './components/EBikes';
import HotAirBalloons from './components/HotAirBalloons';
import Tricycles from './components/Tricycles';
import HorseCarts from './components/HorseCarts';
import Users from './components/Users';
import Reviews from './components/Reviews';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Message from './components/Message';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout Component with Sidebar
const MainLayout = ({ children }) => {
  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - Login (No Sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* Root path - Check token and redirect accordingly */}
        <Route 
          path="/" 
          element={
            (() => {
              const token = localStorage.getItem('token');
              if (token) {
                return <Navigate to="/dashboard" replace />;
              } else {
                return <Navigate to="/login" replace />;
              }
            })()
          } 
        />

        {/* Protected Routes - Require Login, With Sidebar */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Add Section Routes */}
        <Route path="/historyofpagodas" element={
          <ProtectedRoute>
            <MainLayout>
              <HistoryOfPagodas />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/hotels" element={
          <ProtectedRoute>
            <MainLayout>
              <Hotels />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/destinations" element={
          <ProtectedRoute>
            <MainLayout>
              <Destinations />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/restaurants" element={
          <ProtectedRoute>
            <MainLayout>
              <Restaurants />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/cars" element={
          <ProtectedRoute>
            <MainLayout>
              <Cars />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/ebikes" element={
          <ProtectedRoute>
            <MainLayout>
              <EBikes />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/hotairballoons" element={
          <ProtectedRoute>
            <MainLayout>
              <HotAirBalloons />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/tricycles" element={
          <ProtectedRoute>
            <MainLayout>
              <Tricycles />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/horsecarts" element={
          <ProtectedRoute>
            <MainLayout>
              <HorseCarts />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* User Management Routes */}
        <Route path="/users" element={
          <ProtectedRoute>
            <MainLayout>
              <Users />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        
        
        {/* Review & Report Routes */}
        <Route path="/reviews" element={
          <ProtectedRoute>
            <MainLayout>
              <Reviews />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <MainLayout>
              <Reports />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Message Routes */}
        <Route path="/message" element={
          <ProtectedRoute>
            <MainLayout>
              <Message />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/messages" element={
          <ProtectedRoute>
            <MainLayout>
              <Message />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* Settings Route */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;