import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-light custom-navbar shadow-sm sticky-top">
      <div className="container-fluid px-4 align-items-center">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 brand-area">
          <img
            src="/logoStudioku.jpg"
            alt="Studioku Jogja"
            className="brand-logo"
          />
          <span className="brand-wordmark">studioku.jogja</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center nav-right">
            <li className="nav-item">
              <Link to="/" className="nav-link nav-link-custom">Beranda</Link>
            </li>
            <li className="nav-item">
              <Link to="/layanan" className="nav-link nav-link-custom">Layanan</Link>
            </li>
            <li className="nav-item">
              <Link to="/gallery" className="nav-link nav-link-custom">Galeri</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;