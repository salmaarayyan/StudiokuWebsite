import React from 'react';
import { Link } from 'react-router-dom';

const heroImage = '/heroSection1.png';
const Hero = () => {
  return (
    <section
      className="hero-section text-white"
      style={{
        backgroundImage: `linear-gradient(120deg, rgba(0,4,5,0.75), rgba(0,4,5,0.4)), url(${heroImage})`,
      }}
    >
      <div style={{ paddingLeft: '5%', paddingTop: '100px', paddingBottom: '100px' }}>
        <div style={{ maxWidth: '800px' }}>
          <p className="hero-eyebrow mb-3" style={{ fontSize: '1rem' }}>Capture your best moments</p>
          <h1 className="hero-title mb-4" style={{ fontSize: '4.5rem', lineHeight: '1.1' }}>
            <span>FOR GREAT MOMENTS,</span>
            <span>just visit <span className="accent-text">studioku.jogja</span></span>
          </h1>
          <p className="hero-subtitle mb-4" style={{ fontSize: '1.2rem' }}>Self photo studio dengan suasana hangat dan hasil premium.</p>
          <Link to="/layanan" className="btn btn-accent btn-lg px-5 py-3" style={{ fontSize: '1.15rem' }}>
            Reservasi Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;