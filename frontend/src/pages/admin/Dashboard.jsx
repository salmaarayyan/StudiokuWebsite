import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminInfo from '../../components/admin/AdminInfo';
import BookingNotifications from '../../components/admin/BookingNotifications';
import { layananAPI, galleryAPI, testimonialAPI, bookingAPI } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    layanan: 0,
    gallery: 0,
    testimonials: 0,
    bookings: 0,
    revenueQris: 0,
    revenueCash: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [layanan, gallery, testimonials, bookings] = await Promise.all([
        layananAPI.getAll(),
        galleryAPI.getAll(),
        testimonialAPI.getAll(),
        bookingAPI.getAll()
      ]);

      const bookingList = bookings.data.data || [];

      // Calculate revenue by payment method
      const revenueByMethod = bookingList.reduce((acc, booking) => {
        if (booking.payment_method === 'qris') {
          acc.qris += Number(booking.total_price) || 0;
        } else if (booking.payment_method === 'cash') {
          acc.cash += Number(booking.total_price) || 0;
        }
        return acc;
      }, { qris: 0, cash: 0 });

      setStats({
        layanan: layanan.data.count || layanan.data.data?.length || 0,
        gallery: gallery.data.count || gallery.data.data?.length || 0,
        testimonials: testimonials.data.count || testimonials.data.data?.length || 0,
        bookings: bookings.data.count || bookingList.length || 0,
        revenueQris: revenueByMethod.qris,
        revenueCash: revenueByMethod.cash
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="dashboard-wrapper">
        <AdminNavbar currentPage="Dashboard" />

        <div className="dashboard-content">
          <div className="dashboard-top">
            <div className="dashboard-left">
              <div className="cards-grid cards-grid-4">
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#FFE5B4' }}>📦</div>
                  <div className="stat-body">
                    <p className="stat-label">Total Layanan</p>
                    <p className="stat-value">{stats.layanan}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#E6F2FF' }}>📅</div>
                  <div className="stat-body">
                    <p className="stat-label">Total Booking</p>
                    <p className="stat-value">{stats.bookings}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#FFF1E6' }}>🖼️</div>
                  <div className="stat-body">
                    <p className="stat-label">Total Galeri</p>
                    <p className="stat-value">{stats.gallery}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#E6E9FF' }}>💬</div>
                  <div className="stat-body">
                    <p className="stat-label">Total Testimoni</p>
                    <p className="stat-value">{stats.testimonials}</p>
                  </div>
                </div>
              </div>

              <div className="cards-grid cards-grid-2">
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#FFE6E6' }}>💸</div>
                  <div className="stat-body">
                    <p className="stat-label">Pemasukan Cash</p>
                    <p className="stat-value-small">{formatCurrency(stats.revenueCash)}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: '#E6FFE6' }}>💰</div>
                  <div className="stat-body">
                    <p className="stat-label">Pemasukan QRIS</p>
                    <p className="stat-value-small">{formatCurrency(stats.revenueQris)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-right">
              <AdminInfo />
            </div>
          </div>

          <div className="dashboard-bottom">
            <BookingNotifications />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;