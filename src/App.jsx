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
import Banner from './components/Banner';
import Users from './components/Users';
import Shop from './components/Shop';
import Reviews from './components/Reviews';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Message from './components/Message';


 import HotelsOrder from './components/HotelsOrder';
 import DestinationsOrder from './components/DestinationsOrder';
 import RestaurantsOrder from './components/RestaurantsOrder';
// import CarsOrder from './components/CarsOrder';
 import EBikesOrder from './components/EBikesOrder';
 import TricyclesOrder from './components/TricyclesOrder';
// import HotAirBalloonsOrder from './components/HotAirBalloonsOrder';
// import HorseCartsOrder from './components/HorseCartsOrder';
// import BannerOrder from './components/BannerOrder';

import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
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
        <Route path="/login" element={<Login />} />

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
        
          <Route path="/shop" element={
  <ProtectedRoute>
    <MainLayout>
      <Shop />
    </MainLayout>
  </ProtectedRoute>
} />

        {/* ===== Add Section Routes ===== */}
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
        <Route path="/banner" element={
          <ProtectedRoute>
            <MainLayout>
              <Banner />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        {/* ===== Order Section Routes (Comment ထားတယ်) ===== */}
        
        <Route path="/hotelsorder" element={
          <ProtectedRoute>
            <MainLayout>
              <HotelsOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
       
        <Route path="/destinationsorder" element={
          <ProtectedRoute>
            <MainLayout>
              <DestinationsOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
       
        <Route path="/restaurantsorder" element={
          <ProtectedRoute>
            <MainLayout>
              <RestaurantsOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
          {/*
        <Route path="/carsorder" element={
          <ProtectedRoute>
            <MainLayout>
              <CarsOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
         */}
        <Route path="/ebikesorder" element={
          <ProtectedRoute>
            <MainLayout>
              <EBikesOrder />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/tricyclesorder" element={
          <ProtectedRoute>
            <MainLayout>
              <TricyclesOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
          {/*
        <Route path="/hotairballoonsorder" element={
          <ProtectedRoute>
            <MainLayout>
              <HotAirBalloonsOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/horsecartsorder" element={
          <ProtectedRoute>
            <MainLayout>
              <HorseCartsOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/bannerorder" element={
          <ProtectedRoute>
            <MainLayout>
              <BannerOrder />
            </MainLayout>
          </ProtectedRoute>
        } />
        */}
        
        <Route path="/users" element={
          <ProtectedRoute>
            <MainLayout>
              <Users />
            </MainLayout>
          </ProtectedRoute>
        } />
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
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;