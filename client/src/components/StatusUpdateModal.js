import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSave, FaExclamationTriangle } from "react-icons/fa";

const StatusUpdateModal = ({
  isOpen,
  onClose,
  inquiry,
  onUpdate,
  statusOptions,
}) => {
  const [formData, setFormData] = useState({
    status: "",
    reason: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate status
    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    // Validate reason for certain statuses
    const statusRequiringReason = [
      "REJECTED",
      "REFUTED",
      "ON_HOLD",
      "CANCELLED",
    ];
    if (
      statusRequiringReason.includes(formData.status) &&
      !formData.reason.trim()
    ) {
      newErrors.reason = "Reason is required for this status";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(inquiry._id, formData.status, formData.reason, formData.notes);
    setFormData({ status: "", reason: "", notes: "" });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({ status: "", reason: "", notes: "" });
    setErrors({});
    onClose();
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "#95a5a6";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="status-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>Update Status</h2>
            <button onClick={handleClose} className="close-btn">
              <FaTimes />
            </button>
          </div>

          <div className="modal-content">
            {inquiry && (
              <div className="inquiry-info">
                <h3>{inquiry.courseName}</h3>
                <p>
                  <strong>ID:</strong> {inquiry.inquiryId}
                </p>
                <p>
                  <strong>Email:</strong> {inquiry.contactEmail}
                </p>
                <p>
                  <strong>Current Status:</strong>
                  <span
                    className="current-status"
                    style={{ backgroundColor: getStatusColor(inquiry.status) }}
                  >
                    {inquiry.status}
                  </span>
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="status-form">
              <div className="form-group">
                <label htmlFor="status">New Status *</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={errors.status ? "error" : ""}
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <span className="error-message">
                    <FaExclamationTriangle /> {errors.status}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Enter reason for status change..."
                  rows="3"
                  className={errors.reason ? "error" : ""}
                />
                {errors.reason && (
                  <span className="error-message">
                    <FaExclamationTriangle /> {errors.reason}
                  </span>
                )}
                <small className="help-text">
                  Required for: REJECTED, REFUTED, ON_HOLD, CANCELLED
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add any additional notes..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  <FaSave /> Update Status
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusUpdateModal;
