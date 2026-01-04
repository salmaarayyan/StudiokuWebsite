import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminNavbar from '../../components/admin/AdminNavbar';
import PopupModal from '../../components/common/PopupModal';
import { galleryAPI } from '../../services/api';
import './GalleryManagement.css';

const GalleryManagement = () => {
  const [galleryList, setGalleryList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    image: null,
    caption: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, type: 'success', title: '', message: '' });
  const [confirmData, setConfirmData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const closePopup = () => setPopup((prev) => ({ ...prev, open: false }));
  const showPopup = (type, title, message) => {
    setPopup({ open: true, type, title, message });
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await galleryAPI.getAll();
      setGalleryList(response.data.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('caption', formData.caption);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editMode) {
        await galleryAPI.update(currentId, data);
        showPopup('success', 'Berhasil', 'Gallery berhasil diupdate!');
      } else {
        await galleryAPI.create(data);
        showPopup('success', 'Berhasil', 'Gallery berhasil ditambahkan!');
      }
      fetchGallery();
      resetForm();
    } catch (error) {
      showPopup(
        'error',
        'Gagal',
        error.response?.data?.message || 'Gagal menyimpan gallery'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gallery) => {
    setEditMode(true);
    setCurrentId(gallery.id);
    setFormData({
      image: null,
      caption: gallery.caption || ''
    });
    setShowModal(true);
  };

  const requestDelete = (gallery) => {
    setConfirmData({ id: gallery.id, caption: gallery.caption || 'foto' });
  };

  const handleDelete = async () => {
    if (!confirmData) return;
    setDeleteLoading(true);

    try {
      await galleryAPI.delete(confirmData.id);
      showPopup('success', 'Berhasil', 'Gallery berhasil dihapus!');
      fetchGallery();
    } catch (error) {
      showPopup('error', 'Gagal', 'Gagal menghapus gallery');
    } finally {
      setDeleteLoading(false);
      setConfirmData(null);
    }
  };

  const resetForm = () => {
    setFormData({ image: null, caption: '' });
    setImagePreview(null);
    setEditMode(false);
    setCurrentId(null);
    setShowModal(false);
  };

  return (
    <AdminLayout>
      <div className="gallery-page">
        <AdminNavbar currentPage="Galeri" />

        <div className="gallery-content">
          <div className="gallery-header">
            <div>
              <p className="gallery-eyebrow">Halaman Admin</p>
              <h1 className="gallery-title">Kelola Galeri</h1>
            </div>

            <button className="gallery-add-btn" onClick={() => setShowModal(true)} type="button">
              + Tambah Foto
            </button>
          </div>

          {galleryList.length === 0 ? (
            <div className="gallery-empty">
              <div className="empty-box">📷</div>
              <p>Belum ada foto dalam galeri</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {galleryList.map((gallery) => (
                <div key={gallery.id} className="gallery-card">
                  <div className="gallery-card-image">
                    <img 
                      src={`http://localhost:5000${gallery.image_url}`}
                      alt={gallery.caption || 'Gallery image'}
                    />
                    <div className="gallery-card-overlay">
                      <button
                        onClick={() => handleEdit(gallery)}
                        className="overlay-btn edit-btn"
                        type="button"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => requestDelete(gallery)}
                        className="overlay-btn delete-btn"
                        type="button"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                  <div className="gallery-card-caption">
                    <p>{gallery.caption || 'Tanpa caption'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="gallery-modal-backdrop">
            <div className="gallery-modal">
              <div className="modal-header">
                <h3>{editMode ? 'Edit Foto' : 'Tambah Foto'}</h3>
                <button className="close-btn" onClick={resetForm} aria-label="Tutup">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">
                      Upload Foto {!editMode && '*'}
                    </label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleChange}
                      accept="image/*"
                      required={!editMode}
                      className="form-input"
                    />
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Caption</label>
                    <textarea
                      name="caption"
                      value={formData.caption}
                      onChange={handleChange}
                      rows="3"
                      className="form-input"
                      placeholder="Tulis caption untuk foto ini..."
                    />
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
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <PopupModal
          show={popup.open}
          type={popup.type}
          title={popup.title || (popup.type === 'success' ? 'Berhasil' : 'Gagal')}
          message={popup.message}
          confirmLabel="Tutup"
          onClose={closePopup}
        />

        <PopupModal
          show={!!confirmData}
          type="confirm"
          title="Hapus foto?"
          message={`Yakin ingin menghapus ${confirmData?.caption || 'foto'}?`}
          confirmLabel={deleteLoading ? 'Menghapus...' : 'Ya, hapus'}
          cancelLabel="Batal"
          onClose={() => setConfirmData(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      </div>
    </AdminLayout>
  );
};

export default GalleryManagement;