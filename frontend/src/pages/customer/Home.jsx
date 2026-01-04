import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/customer/Navbar';
import Hero from '../../components/customer/Hero';
import GalleryCard from '../../components/customer/GalleryCard';
import TestimonialCard from '../../components/customer/TestimonialCard';
import { galleryAPI, testimonialAPI, layananAPI } from '../../services/api';

const Home = () => {
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [testimonialPreview, setTestimonialPreview] = useState([]);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPreviews = async () => {
      try {
        const [galleryRes, testimonialRes, layananRes] = await Promise.all([
          galleryAPI.getAll(),
          testimonialAPI.getAll(),
          layananAPI.getAll(),
        ]);

        setGalleryPreview((galleryRes.data?.data || []).slice(0, 3));
        setTestimonialPreview((testimonialRes.data?.data || []).slice(0, 3));
        setPackages(layananRes.data?.data || []);
      } catch (error) {
        console.error('Error fetching preview data:', error);
      }
    };

    fetchPreviews();
  }, []);

  const priceNoteFromName = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('group') || lower.includes('grup')) return 'per orang';
    return 'per sesi';
  };

  const peopleLabel = (pkg) => {
    const lower = (pkg.name || '').toLowerCase();
    if (pkg.min_person && pkg.max_person) return `${pkg.min_person}-${pkg.max_person} orang`;
    if (pkg.min_person) return `Minimal ${pkg.min_person} orang`;
    if (pkg.max_person) return `Maksimal ${pkg.max_person} orang`;
    if (lower.includes('photo') || lower.includes('photobox')) return '1-3 orang';
    if (lower.includes('couple')) return 'Maksimal 2 orang';
    if (lower.includes('group') || lower.includes('grup')) return 'Minimal 3 orang';
    return null;
  };

  return (
    <div className="page-shell">
      <Navbar />
      <Hero />

      <section className="section container" id="layanan">
        <div className="section-header">
          <div>
            <p className="eyebrow">Layanan & Paket</p>
            <h2 className="section-title">Pilih sesi terbaikmu</h2>
            <p className="section-subtitle">Self photo studio fleksibel untuk semua momen.</p>
          </div>
          <Link to="/layanan" className="link-accent">Lihat Semua</Link>
        </div>

        {packages.length === 0 ? (
          <p className="text-muted">Belum ada paket tersedia.</p>
        ) : (
          <div className="row g-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="col-md-4">
                <div className="surface-card package-card">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h3 className="fw-bold text-uppercase mb-0">{pkg.name}</h3>
                    <div className="text-end">
                      <span className="badge-price">Rp {Number(pkg.price).toLocaleString('id-ID')}</span>
                      <span className="badge-price-note">{priceNoteFromName(pkg.name)}</span>
                    </div>
                  </div>
                  <div className="package-body">
                    <ul className="package-meta list-unstyled mb-2">
                      {pkg.duration && (
                        <li><span className="dot" />Durasi: {pkg.duration} menit</li>
                      )}
                      {peopleLabel(pkg) && (
                        <li><span className="dot" />{peopleLabel(pkg)}</li>
                      )}
                    </ul>
                    <p className="text-muted mb-0">{pkg.description || 'Deskripsi belum tersedia.'}</p>
                  </div>
                  <Link to={`/booking?package=${pkg.id}`} className="btn btn-accent w-100 py-2 package-btn">
                    Reservasi Sekarang
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="section-header">
          <div>
            <p className="eyebrow">Cuplikan Galeri</p>
            <h2 className="section-title">Potret terbaik</h2>
            <p className="section-subtitle">3 foto terbaru, versi lengkap ada di halaman galeri.</p>
          </div>
          <Link to="/gallery" className="link-accent">Selengkapnya →</Link>
        </div>

        {galleryPreview.length === 0 ? (
          <p className="text-muted">Belum ada foto di galeri.</p>
        ) : (
          <div className="row g-4">
            {galleryPreview.map((gallery) => (
              <div key={gallery.id} className="col-md-4">
                <GalleryCard gallery={gallery} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="section-header">
          <div>
            <p className="eyebrow">Testimoni</p>
            <h2 className="section-title">Apa kata mereka</h2>
            <p className="section-subtitle">3 testimoni terbaru, lainnya di halaman galeri.</p>
          </div>
          <Link to="/gallery" className="link-accent">Selengkapnya →</Link>
        </div>

        {testimonialPreview.length === 0 ? (
          <p className="text-muted">Belum ada testimoni.</p>
        ) : (
          <div className="row g-4">
            {testimonialPreview.map((testimonial) => (
              <div key={testimonial.id} className="col-md-4">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section map-section">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="section-title mb-2">Studio Collection</h2>
            <p className="section-subtitle text-center mx-auto">Your Moment, Your Vibe, studioku.jogja</p>
          </div>

          <div className="map-wrapper">
            <iframe
              title="Map Studioku Jogja"
              src="https://www.google.com/maps?q=studioku.jogja&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="row g-3 mt-4">
            <div className="col-md-6">
              <div className="info-card h-100">
                <p className="eyebrow mb-2">Jam Operasional</p>
                <h4 className="mb-2">09:00 - 20:00 WIB</h4>
                <p className="text-muted mb-0">Buka setiap hari</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="info-card h-100 d-flex flex-column gap-3">
                <div>
                  <p className="eyebrow mb-2">WhatsApp</p>
                  <h5 className="mb-2">0857-2525-0794</h5>
                  <p className="text-muted mb-0">Chat cepat untuk jadwal dan pertanyaan.</p>
                </div>
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <a
                    href="https://wa.me/6285725250794"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent w-100"
                  >
                    Hubungi via WhatsApp
                  </a>
                  <a
                    href="https://maps.app.goo.gl/xHyeuVthQhnudYK78"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-dark w-100"
                  >
                    Buka di Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer text-center py-4">
        <div className="container">
          <p className="mb-0">© 2025 Studioku Jogja. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;