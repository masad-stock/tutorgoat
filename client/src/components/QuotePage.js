import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useToast } from "./ToastNotification";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import "./QuotePage.css";

const QuotePage = () => {
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
      formData.append("serviceType", data.serviceType);
      formData.append("urgency", data.urgency || "normal");
      formData.append("clientType", data.clientType);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("name", data.name || "");

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
          "Quote Request Submitted!",
          "We will send you a personalized quote within 24 hours."
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
    <div className="quote-page">
      <Header />

      {/* Hero Section */}
      <section className="quote-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="quote-hero-content"
          >
            <h1>Get Your Free Quote</h1>
            <p>Get a personalized quote for your academic needs</p>
          </motion.div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="quote-content">
        <div className="container">
          <motion.div
            className="quote-form-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="quote-form-wrapper">
              <h2>Request Your Quote</h2>
              <p>
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
                  ✅ Quote request submitted successfully! We will send you a
                  personalized quote within 24 hours.
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
                  ❌ Failed to submit quote request. Please try again.
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="quote-form">
                {/* Client Type and Name Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Client Type *</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          value="first-time"
                          {...register("clientType", {
                            required: "Please select client type",
                          })}
                        />
                        <span className="radio-text">First-time Client</span>
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          value="repeat"
                          {...register("clientType", {
                            required: "Please select client type",
                          })}
                        />
                        <span className="radio-text">Repeat Client</span>
                      </label>
                    </div>
                    {errors.clientType && (
                      <span className="error-message">
                        {errors.clientType.message}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Name (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                      {...register("name", {
                        maxLength: {
                          value: 100,
                          message: "Name must be less than 100 characters",
                        },
                      })}
                    />
                    {errors.name && (
                      <span className="error-message">
                        {errors.name.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                  />
                  {errors.phoneNumber && (
                    <span className="error-message">
                      {errors.phoneNumber.message}
                    </span>
                  )}
                </div>

                {/* Course Name */}
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
                    <span className="error-message">
                      {errors.courseName.message}
                    </span>
                  )}
                </div>

                {/* Assignment Details */}
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
                  <div className="character-count">
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
                    <span className="error-message">
                      {errors.assignmentDetails.message}
                    </span>
                  )}
                </div>

                {/* Contact Email */}
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
                  <div className="form-hint">
                    💡 Use a secure, non-personal email for complete anonymity
                  </div>
                  {errors.contactEmail && (
                    <span className="error-message">
                      {errors.contactEmail.message}
                    </span>
                  )}
                </div>

                {/* Service Type and Urgency Row */}
                <div className="form-row">
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
                      <span className="error-message">
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

                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">Upload Files (Optional)</label>
                  <div
                    {...getRootProps()}
                    className={`file-upload-area ${
                      isDragActive ? "dragover" : ""
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="file-upload-icon">📁</div>
                    <div className="file-upload-text">
                      {isDragActive
                        ? "Drop files here..."
                        : "Drag & drop files here, or click to select"}
                    </div>
                    <div className="file-upload-hint">
                      Accepted: PDF, DOC, DOCX, TXT, Images (Max 10MB each, 5
                      files max)
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="uploaded-files">
                      <h4>Uploaded Files:</h4>
                      {uploadedFiles.map((fileObj) => (
                        <div key={fileObj.id} className="file-item">
                          <span>
                            {fileObj.name} ({formatFileSize(fileObj.size)})
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(fileObj.id)}
                            className="remove-file-btn"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default QuotePage;
