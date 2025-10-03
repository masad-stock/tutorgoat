import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaSave, FaEnvelope } from "react-icons/fa";
import "./InquiryEditModal.css";

const InquiryEditModal = ({ inquiry, isOpen, onClose, onSave, onSendQuote }) => {
  const [formData, setFormData] = useState({
    status: "",
    quoteAmount: "",
    assignedTutor: "",
    internalNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (inquiry) {
      setFormData({
        status: inquiry.status || "",
        quoteAmount: inquiry.quoteAmount || "",
        assignedTutor: inquiry.assignedTutor || "",
        internalNotes: inquiry.internalNotes || "",
      });
    }
  }, [inquiry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.status === "quoted" && (!formData.quoteAmount || formData.quoteAmount <= 0)) {
      newErrors.quoteAmount = "Quote amount is required when status is quoted";
    }

    if (formData.quoteAmount && (isNaN(formData.quoteAmount) || formData.quoteAmount < 0)) {
      newErrors.quoteAmount = "Quote amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(inquiry._id, formData);
      onClose();
    } catch (error) {
      console.error("Error saving inquiry:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!formData.quoteAmount || formData.quoteAmount <= 0) {
      setErrors({ quoteAmount: "Quote amount is required to send quote" });
      return;
    }

    setLoading(true);
    try {
      await onSendQuote(inquiry._id, formData.quoteAmount);
      onClose();
    } catch (error) {
      console.error("Error sending quote:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "#e74c3c" },
    { value: "quoted", label: "Quoted", color: "#f39c12" },
    { value: "accepted", label: "Accepted", color: "#27ae60" },
    { value: "in_progress", label: "In Progress", color: "#3498db" },
    { value: "completed", label: "Completed", color: "#27ae60" },
    { value: "cancelled", label: "Cancelled", color: "#95a5a6" },
  ];

  if (!inquiry) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="inquiry-edit-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Inquiry - {inquiry.inquiryId}</h2>
              <button className="close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {/* Inquiry Details (Read-only) */}
              <div className="inquiry-details-section">
                <h3>Inquiry Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Course:</label>
                    <span>{inquiry.courseName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Service Type:</label>
                    <span>{inquiry.serviceType}</span>
                  </div>
                  <div className="detail-item">
                    <label>Urgency:</label>
                    <span>{inquiry.urgency}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact Email:</label>
                    <span>{inquiry.contactEmail}</span>
                  </div>
                  <div className="detail-item">
                    <label>Submitted:</label>
                    <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Files:</label>
                    <span>{inquiry.files?.length || 0} file(s)</span>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="edit-section">
                <h3>Update Status & Assignment</h3>

                <div className="form-group">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quoteAmount">Quote Amount ($):</label>
                  <input
                    type="number"
                    id="quoteAmount"
                    name="quoteAmount"
                    value={formData.quoteAmount}
                    onChange={handleInputChange}
                    placeholder="Enter quote amount"
                    min="0"
                    step="0.01"
                    className={`form-input ${errors.quoteAmount ? 'error' : ''}`}
                  />
                  {errors.quoteAmount && (
                    <span className="error-message">{errors.quoteAmount}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="assignedTutor">Assigned Tutor:</label>
                  <input
                    type="text"
                    id="assignedTutor"
                    name="assignedTutor"
                    value={formData.assignedTutor}
                    onChange={handleInputChange}
                    placeholder="Enter tutor name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="internalNotes">Internal Notes:</label>
                  <textarea
                    id="internalNotes"
                    name="internalNotes"
                    value={formData.internalNotes}
                    onChange={handleInputChange}
                    placeholder="Add internal notes..."
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              {formData.status === "quoted" && formData.quoteAmount && (
                <button
                  className="btn-quote"
                  onClick={handleSendQuote}
                  disabled={loading}
                >
                  <FaEnvelope /> Send Quote Email
                </button>
              )}

              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                <FaSave /> {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InquiryEditModal;
