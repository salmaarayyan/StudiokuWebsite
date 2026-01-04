import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

import Home from './pages/customer/Home';
import Layanan from './pages/customer/Layanan';
import Gallery from './pages/customer/Gallery';
import Testimonial from './pages/customer/Testimonial';
import Booking from './pages/customer/Booking';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import LayananManagement from './pages/admin/LayananManagement';
import GalleryManagement from './pages/admin/GalleryManagement';
import TestimonialManagement from './pages/admin/TestimonialManagement';
import BookingManagement from './pages/admin/BookingManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonial" element={<Testimonial />} />
          <Route path="/booking" element={<Booking />} />

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admin/layanan" element={<PrivateRoute><LayananManagement /></PrivateRoute>} />
          <Route path="/admin/gallery" element={<PrivateRoute><GalleryManagement /></PrivateRoute>} />
          <Route path="/admin/testimonials" element={<PrivateRoute><TestimonialManagement /></PrivateRoute>} />
          <Route path="/admin/bookings" element={<PrivateRoute><BookingManagement /></PrivateRoute>} />
          <Route path="/admin/schedule" element={<PrivateRoute><ScheduleManagement /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;