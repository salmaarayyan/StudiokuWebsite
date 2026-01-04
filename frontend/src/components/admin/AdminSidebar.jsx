import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PopupModal from '../common/PopupModal';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  const icons = {
    dashboard: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
    booking: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 9h18" />
        <path d="M9 13h3v3H9z" />
      </svg>
    ),
    layanan: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M3 12h18" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    gallery: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-4.5-4.5a1 1 0 0 0-1.4 0L9 18" />
      </svg>
    ),
    testimoni: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16v10H6l-2 3z" />
        <path d="M8 10h8M8 7h5" />
      </svg>
    ),
    jadwal: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    logout: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5v2a2 2 0 0 0 2 2h8" />
        <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
        <path d="M3 12h12" />
        <path d="M6 9l-3 3 3 3" />
      </svg>
    )
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: icons.dashboard, title: 'Dashboard' },
    { path: '/admin/bookings', icon: icons.booking, title: 'Booking' },
    { path: '/admin/layanan', icon: icons.layanan, title: 'Layanan' },
    { path: '/admin/gallery', icon: icons.gallery, title: 'Galeri' },
    { path: '/admin/testimonials', icon: icons.testimoni, title: 'Testimoni' },
    { path: '/admin/schedule', icon: icons.jadwal, title: 'Jadwal' },
  ];

  return (
    <>
      <aside className="admin-sidebar">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-icon ${isActive(item.path) ? 'active' : ''}`}
              title={item.title}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="sidebar-icon logout-btn"
            title="Logout"
          >
            {icons.logout}
          </button>
        </div>
      </aside>

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

export default AdminSidebar;
