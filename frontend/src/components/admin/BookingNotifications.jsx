import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../services/api';
import './BookingNotifications.css';

const BookingNotifications = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestBookings();
  }, []);

  const fetchLatestBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAll();
      // Get 10 latest bookings
      const latest = response.data.data.slice(0, 10);
      setBookings(latest);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEmailLink = (booking) => {
    // Open Gmail with specific search for this booking notification
    const customerName = booking.customer_name || booking.name || '';
    const bookingDate = booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-CA') : '';
    
    // Search: subject + customer name + booking date
    const searchQuery = `subject:"New Booking - Studioku Jogja" ${customerName} ${bookingDate}`;
    const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(searchQuery)}`;
    window.open(gmailSearchUrl, '_blank');
  };

  return (
    <div className="booking-notifications">
      <div className="notifications-header">
        <h3 className="notifications-title">Notifikasi Booking Terbaru</h3>
        <button 
          onClick={fetchLatestBookings}
          className="refresh-btn"
          title="Refresh"
          disabled={loading}
        >
          {loading ? '⏳' : '🔄'}
        </button>
      </div>

      {loading && (
        <p className="loading-text" style={{ marginTop: '4px' }}>Checking new notification...</p>
      )}

      <div className="notifications-list">
        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="empty-text">Belum ada booking.</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="notification-item">
              <div className="notification-main">
                <div className="notification-header">
                  <h4 className="customer-name">
                    {booking.customer_name || booking.name || 'N/A'}
                  </h4>
                  <span className="booking-date">
                    {formatDate(booking.createdAt)}
                  </span>
                </div>

                <div className="notification-info">
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">
                      {booking.customer_email || booking.email || 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Telp:</span>
                    <span className="info-value">
                      {booking.customer_phone || booking.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Jadwal:</span>
                    <span className="info-value">
                      {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('id-ID') : 'N/A'} 
                      {' '}
                      {booking.booking_time || booking.time_slot || ''}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Paket:</span>
                    <span className="info-value">
                      {booking.layanan?.name || booking.selected_package || 'N/A'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleEmailLink(booking)}
                  className="email-link-btn"
                >
                  Selengkapnya di Email →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingNotifications;
