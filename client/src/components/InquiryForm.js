import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useToast } from "./ToastNotification";
import axios from "axios";

const InquiryForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { success, error: showError } = useToast();

  const assignmentDetails = watch("assignmentDetails", "");

  const onDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  });

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formData = new FormData();
      formData.append("courseName", data.courseName);
      formData.append("assignmentDetails", data.assignmentDetails);
      formData.append("contactEmail", data.contactEmail);
      formData.append("name", data.name || "");
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("clientType", data.clientType);
      formData.append("serviceType", data.serviceType);
      formData.append("urgency", data.urgency || "normal");

      // Append files
      uploadedFiles.forEach((fileObj, index) => {
        formData.append("files", fileObj.file);
      });

      const response = await axios.post("/api/inquiry", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSubmitStatus("success");
        success(
          "Inquiry Submitted!",
          "We will send you a quote within 24 hours."
        );
        reset();
        setUploadedFiles([]);
      } else {
        setSubmitStatus("error");
        showError(
          "Submission Failed",
          "Please try again or contact us directly."
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      showError(
        "Submission Failed",
        "Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-section" id="inquiry-form">
      <div className="container">
        <motion.div
          className="form-container"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="form-title">Get Your Quote</h2>
          <p className="form-subtitle">
            Fill out the form below and we'll send you a personalized quote
            within 24 hours.
          </p>

          {submitStatus === "success" && (
            <motion.div
              className="alert alert-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "#d4edda",
                color: "#155724",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                border: "1px solid #c3e6cb",
              }}
            >
              ✅ Inquiry submitted successfully! We will send you a quote within
              24 hours.
            </motion.div>
          )}

          {submitStatus === "error" && (
            <motion.div
              className="alert alert-error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "#f8d7da",
                color: "#721c24",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                border: "1px solid #f5c6cb",
              }}
            >
              ❌ Failed to submit inquiry. Please try again.
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Course Name/Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Python Programming, Business 101, Statistics 200"
                {...register("courseName", {
                  required: "Course name is required",
                  minLength: {
                    value: 2,
                    message: "Course name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 200,
                    message: "Course name must be less than 200 characters",
                  },
                })}
              />
              {errors.courseName && (
                <span style={{ color: "#e74c3c", fontSize: "0.9rem" }}>
                  {errors.courseName.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Assignment Details *</label>
              <textarea
                className="form-textarea"
                placeholder="Please provide detailed information about your assignment, including requirements, deadline, and any specific instructions..."
                {...register("assignmentDetails", {
                  required: "Assignment details are required",
                  minLength: {
                    value: 10,
                    message:
                      "Please provide more details (at least 10 characters)",
                  },
                  maxLength: {
                    value: 2000,
                    message:
                      "Assignment details must be less than 2000 characters",
                  },
                })}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  color: "#6c757d",
                  marginTop: "0.5rem",
                }}
              >
                <span>Characters: {assignmentDetails.length}/2000</span>
                <span>
                  Words:{" "}
                  {
                    assignmentDetails
                      .split(/\s+/)
                      .filter((word) => word.length > 0).length
                  }
                </span>
              </div>
              {errors.assignmentDetails && (
                <span style={{ color: "#e74c3c", fontSize: "0.9rem" }}>
                  {errors.assignmentDetails.message}
                </span>
              )}
            </div>
            <>
              <div className="form-group">
                <label className="form-label">Contact Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your.email@example.com"
                  {...register("contactEmail", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    marginTop: "0.5rem",
                  }}
                >
                  💡 Use a secure, non-personal email for complete anonymity
                </div>
                {errors.contactEmail && (
                  <span style={{ color: "#e74c3c", fontSize: "0.9rem" }}>
                    {errors.contactEmail.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Full Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your full name (optional)"
                  {...register("name", {
                    maxLength: {
                      value: 100,
                      message: "Name must be less than 100 characters",
                    },
                  })}
                />
                {errors.name && (
                  <span style={{ color: "#e74c3c", fontSize: "0.9rem" }}>
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 characters",
                    },
                    maxLength: {
                      value: 20,
                      message: "Phone number must be less than 20 characters",
                    },
                  })}
                />
                {errors.phoneNumber && (
                  <span style={{ color: "#e74c3c", fontSize: "0.9rem" }}>
                    {errors.phoneNumber.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Client Type *</label>
                <select
                  className="form-select"
                  {...register("clientType", {
                    required: "Please select a client type",
                  })}
                >
                  <option value="">Select client type</option>
                  <option value="first-time">First-time client</option>
                  <option value="repeat">Repeat client</option>
                </select>
                {errors.clientType && (
                  <span style={{ color: "#e74c3c", fontSize: "0.9rem" }}>
                    {errors.clientType.message}
                  </span>
                )}
              </div>
            </>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Service Type *</label>
                <select
                  className="form-select"
                  {...register("serviceType", {
                    required: "Please select a service type",
                  })}
                >
                  <option value="">Select service type</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="class">Full or Partial Class</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                </select>
                {errors.serviceType && (
                  <span style={{ color: "#e74c3c", fontSize: "0.9rem" }}>
                    {errors.serviceType.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Urgency</label>
                <select className="form-select" {...register("urgency")}>
                  <option value="normal">Normal (1-2 weeks)</option>
                  <option value="urgent">Urgent (3-7 days)</option>
                  <option value="flexible">Flexible (3+ weeks)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Upload Files (Optional)</label>
              <div
                {...getRootProps()}
                className={`file-upload-area ${isDragActive ? "dragover" : ""}`}
              >
                <input {...getInputProps()} />
                <div className="file-upload-icon">📁</div>
                <div className="file-upload-text">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop files here, or click to select"}
                </div>
                <div className="file-upload-hint">
                  Accepted: PDF, DOC, DOCX, TXT, Images (Max 10MB each, 5 files
                  max)
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <h4
                    style={{
                      fontSize: "1rem",
                      marginBottom: "0.5rem",
                      color: "#2c3e50",
                    }}
                  >
                    Uploaded Files:
                  </h4>
                  {uploadedFiles.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5rem",
                        background: "#f8f9fa",
                        borderRadius: "4px",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "0.9rem" }}>
                        {fileObj.name} ({formatFileSize(fileObj.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(fileObj.id)}
                        style={{
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
              </button>
            </>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default InquiryForm;
