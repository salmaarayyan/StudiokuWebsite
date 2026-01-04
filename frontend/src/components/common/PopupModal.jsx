import React from "react";
import "./PopupModal.css";

const icons = {
  success: "✓",
  error: "!",
  confirm: "?",
};

const PopupModal = ({
  show,
  type = "success",
  title = "",
  message = "",
  confirmLabel = "OK",
  cancelLabel = "Batal",
  onConfirm,
  onClose,
  loading = false,
}) => {
  if (!show) return null;

  const isConfirm = type === "confirm";
  const icon = icons[type] || icons.success;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="popup-backdrop" role="dialog" aria-modal="true">
      <div className={`popup-card ${type}`}>
        <div className="popup-body">
          <div className="popup-icon" aria-hidden="true">
            {icon}
          </div>
          <div className="popup-text">
            {title && <h3>{title}</h3>}
            {message && <p>{message}</p>}
          </div>
        </div>

        <div className="popup-actions">
          {isConfirm && (
            <button
              type="button"
              className="popup-btn ghost"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className="popup-btn primary"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
