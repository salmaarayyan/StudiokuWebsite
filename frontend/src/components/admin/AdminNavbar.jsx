import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PopupModal from '../common/PopupModal';
import './AdminNavbar.css';

const AdminNavbar = ({ currentPage = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    'Dashboard',
    'Booking',
    'Layanan',
    'Galeri',
    'Testimoni',
    'Jadwal'
  ];

  const handleNavClick = (item) => {
    const pathMap = {
      'Dashboard': '/admin/dashboard',
      'Booking': '/admin/bookings',
      'Layanan': '/admin/layanan',
      'Galeri': '/admin/gallery',
      'Testimoni': '/admin/testimonials',
      'Jadwal': '/admin/schedule'
    };
    navigate(pathMap[item]);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      <div className="admin-navbar">
        <nav className="admin-nav">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className={`admin-nav-item ${currentPage === item ? 'active' : ''}`}
            >
              {item}
            </button>
          ))}
        </nav>
        <button className="logout-nav-btn" onClick={handleLogoutClick}>
          Logout
        </button>
      </div>

      <PopupModal
        show={showLogoutConfirm}
        type="confirm"
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari sistem?"
        confirmLabel="Ya, Logout"
        cancelLabel="Batal"
        onConfirm={confirmLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default AdminNavbar;
