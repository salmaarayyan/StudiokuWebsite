import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminNavbar from "../../components/admin/AdminNavbar";
import PopupModal from "../../components/common/PopupModal";
import { layananAPI } from "../../services/api";
import "./LayananManagement.css";

const LayananManagement = () => {
  const [layananList, setLayananList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    max_person: "",
    min_person: "",
    pricing_type: "per_session",
  });
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
    fetchLayanan();
  }, []);

  const fetchLayanan = async () => {
    try {
      const response = await layananAPI.getAll();
      setLayananList(response.data.data || []);
    } catch (error) {
      console.error("Error fetching layanan:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      max_person: formData.max_person,
      min_person: formData.min_person,
      pricing_type: formData.pricing_type,
    };

    try {
      if (editMode) {
        await layananAPI.update(currentId, data);
        showPopup("success", "Berhasil", "Layanan berhasil diupdate!");
      } else {
        await layananAPI.create(data);
        showPopup("success", "Berhasil", "Layanan berhasil ditambahkan!");
      }
      fetchLayanan();
      resetForm();
    } catch (error) {
      showPopup(
        "error",
        "Gagal",
        error.response?.data?.message || "Gagal menyimpan layanan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (layanan) => {
    setEditMode(true);
    setCurrentId(layanan.id);
    setFormData({
      name: layanan.name,
      description: layanan.description,
      price: layanan.price,
      duration: layanan.duration,
      max_person: layanan.max_person,
      min_person: layanan.min_person,
      pricing_type: layanan.pricing_type || "per_session",
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
      await layananAPI.delete(confirmData.id);
      showPopup("success", "Berhasil", "Layanan berhasil dihapus!");
      fetchLayanan();
    } catch (error) {
      showPopup("error", "Gagal", "Gagal menghapus layanan");
    } finally {
      setDeleteLoading(false);
      setConfirmData(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      max_person: "",
      min_person: "",
      pricing_type: "per_session",
    });
    setEditMode(false);
    setCurrentId(null);
    setShowModal(false);
  };

  const filteredLayanan = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return layananList.filter((layanan) => {
      const name = (layanan.name || "").toLowerCase();
      return name.includes(query);
    });
  }, [layananList, searchQuery]);

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="layanan-page">
        <AdminNavbar currentPage="Layanan" />

        <div className="layanan-content">
          <div className="layanan-header">
            <div>
              <p className="layanan-eyebrow">Halaman Admin</p>
              <h1 className="layanan-title">Kelola Layanan</h1>
            </div>

            <button
              className="layanan-add-btn"
              onClick={() => setShowModal(true)}
              type="button"
              style={{ backgroundColor: "#efab46", borderColor: "#efab46" }}
            >
              Tambah Layanan
            </button>
          </div>

          <div className="layanan-filters">
            <div
              className={`filter-search ${searchQuery ? "active-search" : ""}`}
            >
              <input
                type="text"
                placeholder="Cari nama layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="search-result-count">
              {searchQuery ? (
                <span style={{ fontWeight: "bold", color: "#efab46" }}>
                  ✓ {filteredLayanan.length} hasil ditemukan untuk "
                  {searchQuery}"
                </span>
              ) : (
                `${filteredLayanan.length} total layanan`
              )}
            </div>
          </div>

          <div className="layanan-table-card">
            <div className="table-wrapper">
              <table className="layanan-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Layanan</th>
                    <th>Deskripsi</th>
                    <th>Harga</th>
                    <th>Tipe Harga</th>
                    <th>Durasi (menit)</th>
                    <th>Min Orang</th>
                    <th>Maks Orang</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLayanan.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center" }}>
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

                  {filteredLayanan.map((layanan, idx) => (
                    <tr key={layanan.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{layanan.name}</td>
                      <td className="desc-cell">
                        {layanan.description?.substring(0, 50)}...
                      </td>
                      <td className="price-cell">
                        {formatCurrency(layanan.price)}
                      </td>
                      <td>
                        {layanan.pricing_type === 'per_person' ? 'Per Orang' : 'Per Sesi'}
                      </td>
                      <td>{layanan.duration || "-"}</td>
                      <td>{layanan.min_person || "-"}</td>
                      <td>{layanan.max_person || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="action-link"
                            onClick={() => handleEdit(layanan)}
                          >
                            Edit
                          </button>
                          <span className="divider" />
                          <button
                            type="button"
                            className="action-link delete"
                            onClick={() => handleDelete(layanan.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="layanan-modal-backdrop">
            <div className="layanan-modal">
              <div className="modal-header">
                <h3>{editMode ? "Edit Layanan" : "Tambah Layanan"}</h3>
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
                    <label className="form-label">Nama Layanan *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Masukkan nama layanan"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deskripsi</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="form-input"
                      placeholder="Masukkan deskripsi"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Harga *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Masukkan harga"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipe Harga *</label>
                    <select
                      name="pricing_type"
                      value={formData.pricing_type}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="per_session">Per Sesi</option>
                      <option value="per_person">Per Orang</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Durasi (menit)</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Contoh: 60"
                      min="0"
                    />
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Min Orang</label>
                      <input
                        type="number"
                        name="min_person"
                        value={formData.min_person}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Contoh: 1"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Maks Orang</label>
                      <input
                        type="number"
                        name="max_person"
                        value={formData.max_person}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Contoh: 10"
                        min="0"
                      />
                    </div>
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
          title="Hapus layanan?"
          message="Yakin ingin menghapus layanan ini?"
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

export default LayananManagement;
