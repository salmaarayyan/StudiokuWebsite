import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: '250px' }}>
      <h2 className="h4 mb-4">Admin Panel</h2>
      
      <nav className="nav flex-column">
        <Link to="/admin/dashboard" className="nav-link text-white mb-2">
          Dashboard
        </Link>
        <Link to="/admin/schedule" className="nav-link text-white mb-2">
          Kelola Jadwal
        </Link>
        <Link to="/admin/layanan" className="nav-link text-white mb-2">
          Kelola Layanan
        </Link>
        <Link to="/admin/gallery" className="nav-link text-white mb-2">
          Kelola Galeri
        </Link>
        <Link to="/admin/testimonials" className="nav-link text-white mb-2">
          Kelola Testimoni
        </Link>
        <Link to="/admin/bookings" className="nav-link text-white mb-2">
          Manage Booking
        </Link>
        
        <button
          onClick={handleLogout}
          className="btn btn-danger mt-4 w-100"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;