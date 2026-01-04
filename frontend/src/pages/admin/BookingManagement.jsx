import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminNavbar from "../../components/admin/AdminNavbar";
import PopupModal from "../../components/common/PopupModal";
import { bookingAPI } from "../../services/api";
import "./BookingManagement.css";

const BookingManagement = () => {
  const [bookingList, setBookingList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popup, setPopup] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmData, setConfirmData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const closePopup = () =>
    setPopup((prev) => ({ ...prev, open: false }));

  const showPopup = (type, title, message) => {
    setPopup({ open: true, type, title, message });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookingList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking) return;
    setLoading(true);

    try {
      await bookingAPI.updateStatus(selectedBooking.id, { status: newStatus });
      showPopup("success", "Berhasil", "Status booking berhasil diupdate!");
      fetchBookings();
      setShowModal(false);
      setSelectedBooking(null);
    } catch (error) {
      showPopup("error", "Gagal", "Gagal update status");
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (booking) => {
    const displayName = booking.name || booking.customer_name || "booking";
    setConfirmData({ id: booking.id, name: displayName });
  };

  const handleDelete = async () => {
    if (!confirmData) return;
    setDeleteLoading(true);

    try {
      await bookingAPI.delete(confirmData.id);
      showPopup("success", "Berhasil", "Booking berhasil dihapus!");
      fetchBookings();
    } catch (error) {
      showPopup("error", "Gagal", "Gagal menghapus booking");
    } finally {
      setDeleteLoading(false);
      setConfirmData(null);
    }
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status || "pending");
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "pending",
      confirmed: "confirmed",
      cancelled: "cancelled",
    };
    return map[status] || "pending";
  };

  const filteredBookings = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return bookingList.filter((booking) => {
      const name = (booking.name || booking.customer_name || "").toLowerCase();
      const email = (
        booking.email ||
        booking.customer_email ||
        ""
      ).toLowerCase();
      const status = (booking.status || "").toLowerCase();
      return (
        name.includes(query) || email.includes(query) || status.includes(query)
      );
    });
  }, [bookingList, searchQuery]);

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="booking-page">
        <AdminNavbar currentPage="Booking" />

        <div className="booking-content">
          <div className="booking-header">
            <div>
              <p className="booking-eyebrow">Halaman Admin</p>
              <h1 className="booking-title">Kelola Booking</h1>
            </div>
          </div>

          <div className="booking-filters">
            <div
              className={`filter-search ${searchQuery ? "active-search" : ""}`}
            >
              <input
                type="text"
                placeholder="Cari nama, email, atau status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="search-result-count">
              {searchQuery ? (
                <span style={{ fontWeight: "bold", color: "#efab46" }}>
                  ✓ {filteredBookings.length} hasil ditemukan untuk "
                  {searchQuery}"
                </span>
              ) : (
                `${filteredBookings.length} total booking`
              )}
            </div>
          </div>

          <div className="booking-table-card">
            <div className="table-wrapper">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Jam</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Telepon</th>
                    <th>Paket</th>
                    <th>Metode</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan="11" style={{ textAlign: "center" }}>
                        <div className="empty-state">
                          <div className="empty-content">
                            <div className="empty-box" aria-hidden="true">
                              📦
                            </div>
                            <p>Belum Ada Data</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredBookings.map((booking, idx) => {
                    const displayName =
                      booking.name || booking.customer_name || "-";
                    const displayEmail =
                      booking.email || booking.customer_email || "-";
                    const displayPhone =
                      booking.phone || booking.customer_phone || "-";
                    const displayPackage =
                      booking.layanan?.name || booking.selected_package || "-";
                    const paymentMethod = booking.payment_method || "-";
                    const total = formatCurrency(booking.total_price);
                    const statusClass = getStatusBadge(booking.status);
                    const bookingTime = booking.booking_time || booking.time_slot || "-";

                    return (
                      <tr key={booking.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{formatDate(booking.booking_date)}</td>
                        <td>{bookingTime.slice(0, 5)}</td>
                        <td>{displayName}</td>
                        <td>{displayEmail}</td>
                        <td>{displayPhone}</td>
                        <td>{displayPackage}</td>
                        <td className="text-capitalize">{paymentMethod}</td>
                        <td>{total}</td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {booking.status || "pending"}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="action-link"
                              onClick={() => openStatusModal(booking)}
                            >
                              Update
                            </button>
                            <span className="divider" />
                            <button
                              type="button"
                              className="action-link delete"
                              onClick={() => requestDelete(booking)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && selectedBooking && (
          <div className="status-modal-backdrop">
            <div className="status-modal">
              <div className="modal-header">
                <h3>Update Status Booking</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                  aria-label="Tutup"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-info">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {selectedBooking.name || selectedBooking.customer_name}
                  </p>
                  <p>
                    <strong>Tanggal:</strong>{" "}
                    {formatDate(selectedBooking.booking_date)}
                  </p>
                  <p>
                    <strong>Waktu:</strong>{" "}
                    {selectedBooking.booking_time ||
                      selectedBooking.booking_time_slot ||
                      "-"}
                  </p>
                </div>

                <label className="form-label">Status Baru</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  className="outline-btn"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  className="primary-btn"
                  onClick={handleUpdateStatus}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        <PopupModal
          show={popup.open}
          type={popup.type}
          title={popup.title || (popup.type === "success" ? "Berhasil" : "Gagal")}
          message={popup.message}
          confirmLabel="Tutup"
          onClose={closePopup}
        />

        <PopupModal
          show={!!confirmData}
          type="confirm"
          title="Hapus booking?"
          message={`Yakin ingin menghapus booking ${confirmData?.name || "ini"}?`}
          confirmLabel={deleteLoading ? "Menghapus..." : "Ya, hapus"}
          cancelLabel="Batal"
          onClose={() => setConfirmData(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default BookingManagement;
