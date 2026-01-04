import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminNavbar from "../../components/admin/AdminNavbar";
import PopupModal from "../../components/common/PopupModal";
import { testimonialAPI, galleryAPI } from "../../services/api";
import "./TestimonialManagement.css";

const TestimonialManagement = () => {
  const [testimonialList, setTestimonialList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    review: "",
    rating: 5,
    gallery_id: "",
  });
  const [loading, setLoading] = useState(false);
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
    fetchTestimonials();
    fetchGallery();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialAPI.getAll();
      setTestimonialList(response.data.data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await galleryAPI.getAll();
      setGalleryList(response.data.data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      customer_name: formData.customer_name,
      review: formData.review,
      rating: formData.rating ? Number(formData.rating) : null,
      gallery_id: formData.gallery_id ? Number(formData.gallery_id) : null,
    };

    try {
      if (editMode) {
        await testimonialAPI.update(currentId, payload);
        showPopup("success", "Berhasil", "Testimoni berhasil diupdate!");
      } else {
        await testimonialAPI.create(payload);
        showPopup("success", "Berhasil", "Testimoni berhasil ditambahkan!");
      }
      fetchTestimonials();
      resetForm();
    } catch (error) {
      showPopup(
        "error",
        "Gagal",
        error.response?.data?.message || "Gagal menyimpan testimoni"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (testimonial) => {
    setEditMode(true);
    setCurrentId(testimonial.id);
    setFormData({
      customer_name: testimonial.customer_name,
      review: testimonial.review,
      rating: testimonial.rating || 5,
      gallery_id: testimonial.gallery_id || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setConfirmData({ id });
  };

  const confirmDelete = async () => {
    if (!confirmData) return;
    setDeleteLoading(true);

    try {
      await testimonialAPI.delete(confirmData.id);
      showPopup("success", "Berhasil", "Testimoni berhasil dihapus!");
      fetchTestimonials();
    } catch (error) {
      showPopup("error", "Gagal", "Gagal menghapus testimoni");
    } finally {
      setDeleteLoading(false);
      setConfirmData(null);
    }
  };

  const resetForm = () => {
    setFormData({ customer_name: "", review: "", rating: 5, gallery_id: "" });
    setEditMode(false);
    setCurrentId(null);
    setShowModal(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? "star filled" : "star"}>
        ★
      </span>
    ));
  };

  return (
      <AdminLayout>
        <div className="testimonial-page">
          <AdminNavbar currentPage="Testimoni" />

          <div className="testimonial-content">
            <div className="testimonial-header">
              <div>
                <p className="testimonial-eyebrow">Halaman Admin</p>
                <h1 className="testimonial-title">Kelola Testimoni</h1>
              </div>

              <button
                className="testimonial-add-btn"
                onClick={() => setShowModal(true)}
                type="button"
              >
                + Tambah Testimoni
              </button>
            </div>

            {testimonialList.length === 0 ? (
              <div className="testimonial-empty">
                <div className="empty-box">💬</div>
                <p>Belum ada testimoni</p>
              </div>
            ) : (
              <div className="testimonial-list">
                {testimonialList.map((testimonial) => (
                  <div key={testimonial.id} className="testimonial-card">
                    {testimonial.gallery && (
                      <div className="testimonial-image">
                        <img
                          src={`http://localhost:5000${testimonial.gallery.image_url}`}
                          alt={testimonial.customer_name}
                        />
                      </div>
                    )}

                    <div className="testimonial-content-area">
                      <div className="testimonial-header-info">
                        <h3 className="customer-name">
                          {testimonial.customer_name}
                        </h3>
                        <div className="rating">
                          {renderStars(testimonial.rating || 5)}
                        </div>
                      </div>
                      <p className="review-text">{testimonial.review}</p>
                    </div>

                    <div className="testimonial-actions">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="action-btn edit-btn"
                        type="button"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="action-btn delete-btn"
                        type="button"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showModal && (
            <div className="testimonial-modal-backdrop">
              <div className="testimonial-modal">
                <div className="modal-header">
                  <h3>{editMode ? "Edit Testimoni" : "Tambah Testimoni"}</h3>
                  <button
                    className="close-btn"
                    onClick={resetForm}
                    aria-label="Tutup"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="modal-body">
                    <div className="form-group">
                      <label className="form-label">Nama Customer *</label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Masukkan nama customer"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Review *</label>
                      <textarea
                        name="review"
                        value={formData.review}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="form-input"
                        placeholder="Tulis review customer..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <select
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="1">⭐ 1 Bintang</option>
                        <option value="2">⭐⭐ 2 Bintang</option>
                        <option value="3">⭐⭐⭐ 3 Bintang</option>
                        <option value="4">⭐⭐⭐⭐ 4 Bintang</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 Bintang</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Pilih Foto dari Galeri
                      </label>
                      <select
                        name="gallery_id"
                        value={formData.gallery_id}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">-- Tanpa Foto --</option>
                        {galleryList.map((gallery) => (
                          <option key={gallery.id} value={gallery.id}>
                            {gallery.caption || `Foto ${gallery.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={resetForm}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={loading}
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
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
            title="Hapus testimoni?"
            message="Yakin ingin menghapus testimoni ini?"
            confirmLabel={deleteLoading ? "Menghapus..." : "Ya, hapus"}
            cancelLabel="Batal"
            onClose={() => setConfirmData(null)}
            onConfirm={confirmDelete}
            loading={deleteLoading}
          />
        </div>
      </AdminLayout>
    );
};

export default TestimonialManagement;
