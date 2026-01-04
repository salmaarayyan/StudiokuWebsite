import React, { useState, useEffect } from 'react';
import { bookingAPI, layananAPI } from '../../services/api';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    booking_date: '',
    booking_time: '',
    layanan_id: '',
    notes: ''
  });
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchLayanan();
  }, []);

  const fetchLayanan = async () => {
    try {
      const response = await layananAPI.getAll();
      setLayananList(response.data.data);
    } catch (error) {
      console.error('Error fetching layanan:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await bookingAPI.create(formData);
      setMessage({
        type: 'success',
        text: 'Booking berhasil! Kami akan menghubungi Anda segera.'
      });
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        booking_date: '',
        booking_time: '',
        layanan_id: '',
        notes: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Booking gagal. Silakan coba lagi.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
      <div className="card-body p-4">
        <h2 className="card-title text-center mb-4">Form Reservasi</h2>

        {message.text && (
          <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Nama Lengkap *</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email *</label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">No. Telepon *</label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Tanggal *</label>
            <input
              type="date"
              name="booking_date"
              value={formData.booking_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Waktu *</label>
            <input
              type="time"
              name="booking_time"
              value={formData.booking_time}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Pilih Layanan</label>
            <select
              name="layanan_id"
              value={formData.layanan_id}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Pilih Layanan --</option>
              {layananList.map((layanan) => (
                <option key={layanan.id} value={layanan.id}>
                  {layanan.name} - Rp {Number(layanan.price).toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Catatan</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="form-control"
              placeholder="Catatan tambahan (opsional)"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 py-2"
          >
            {loading ? 'Mengirim...' : 'Kirim Reservasi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;