import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/customer/Navbar';
import Spinner from '../../components/common/Spinner';
import { layananAPI } from '../../services/api';

const Layanan = () => {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLayanan();
  }, []);

  const fetchLayanan = async () => {
    try {
      const response = await layananAPI.getAll();
      setLayananList(response.data.data);
    } catch (error) {
      console.error('Error fetching layanan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

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
      
      <section className="section container">
        <div className="section-header">
          <div>
            <p className="eyebrow">Layanan & Paket</p>
            <h2 className="section-title">Semua paket tersedia</h2>
            <p className="section-subtitle">Ditampilkan otomatis saat paket tersedia.</p>
          </div>
        </div>

        {layananList.length === 0 ? (
          <p className="text-muted">Belum ada paket tersedia.</p>
        ) : (
          <div className="row g-4">
            {layananList.map((pkg) => (
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
                  <Link
                    to={`/booking?package=${pkg.id}`}
                    className="btn btn-accent w-100 py-2 package-btn"
                  >
                    Reservasi Sekarang
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer text-center py-4">
        <div className="container">
          <p className="mb-0">© 2025 Studioku Jogja. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layanan;