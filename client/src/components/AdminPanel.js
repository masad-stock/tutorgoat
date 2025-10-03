import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaEye,
  FaDownload,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";
import AdminLogin from "./AdminLogin";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [admin, setAdmin] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState("all");
  const [debugInfo, setDebugInfo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem("admin");
    const accessToken = localStorage.getItem("accessToken");

    if (storedAdmin && accessToken) {
      setAdmin(JSON.parse(storedAdmin));
      fetchInquiries();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchInquiries = async (
    page = 1,
    search = "",
    statusFilter = "all"
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      let url = `/api/admin/inquiries?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setInquiries(data.data.inquiries);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
        console.log("Fetched inquiries:", data.data.inquiries.length);
      } else if (response.status === 401) {
        // Token expired, redirect to login
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    fetchInquiries();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAdmin(null);
    setInquiries([]);
  };

  const testDownload = async () => {
    try {
      const response = await fetch("/api/admin/test-download");
      const data = await response.json();
      setDebugInfo(JSON.stringify(data, null, 2));
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const listFiles = async () => {
    try {
      const response = await fetch("/api/admin/list-files");
      const data = await response.json();
      setDebugInfo(JSON.stringify(data, null, 2));
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const downloadFile = async (filePath, originalName) => {
    try {
      console.log("Downloading file:", filePath);
      console.log("Original name:", originalName);

      const encodedPath = encodeURIComponent(filePath);
      console.log("Encoded path:", encodedPath);

      const response = await fetch(`/api/admin/download/${encodedPath}`);

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const blob = await response.blob();
        console.log("Blob size:", blob.size);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log("Download initiated successfully");
      } else {
        const errorText = await response.text();
        console.error("Download failed:", response.status, errorText);
        alert(`Download failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(`Download error: ${error.message}`);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === "all") return true;
    return inquiry.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "quoted":
        return "#3498db";
      case "paid":
        return "#27ae60";
      case "completed":
        return "#2ecc71";
      default:
        return "#95a5a6";
    }
  };

  // Show login form if not authenticated
  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <Header />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading inquiries...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <Header />

      <div className="admin-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="admin-header"
        >
          <div className="admin-title-section">
            <h1>Admin Panel</h1>
            <p>Manage student inquiries and submissions</p>
            <div className="admin-user-info">
              <span>Welcome, {admin.username}</span>
              <span className="admin-role">({admin.role})</span>
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </motion.div>

        <div className="admin-controls">
          <div className="filter-buttons">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All ({inquiries.length})
            </button>
            <button
              onClick={testDownload}
              style={{ background: "#28a745", color: "white" }}
            >
              Test API
            </button>
            <button
              onClick={listFiles}
              style={{ background: "#17a2b8", color: "white" }}
            >
              List Files
            </button>
            <button
              className={filter === "pending" ? "active" : ""}
              onClick={() => setFilter("pending")}
            >
              Pending ({inquiries.filter((i) => i.status === "pending").length})
            </button>
            <button
              className={filter === "quoted" ? "active" : ""}
              onClick={() => setFilter("quoted")}
            >
              Quoted ({inquiries.filter((i) => i.status === "quoted").length})
            </button>
            <button
              className={filter === "paid" ? "active" : ""}
              onClick={() => setFilter("paid")}
            >
              Paid ({inquiries.filter((i) => i.status === "paid").length})
            </button>
          </div>
        </div>

        <div className="inquiries-grid">
          {filteredInquiries.map((inquiry) => (
            <motion.div
              key={inquiry._id}
              className="inquiry-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <div className="inquiry-header">
                <div className="inquiry-id">{inquiry.inquiryId}</div>
                <div
                  className="inquiry-status"
                  style={{ backgroundColor: getStatusColor(inquiry.status) }}
                >
                  {inquiry.status}
                </div>
              </div>

              <div className="inquiry-content">
                <h3>{inquiry.courseName}</h3>
                <p className="inquiry-details">
                  {inquiry.assignmentDetails.substring(0, 100)}...
                </p>

                <div className="inquiry-meta">
                  <div className="meta-item">
                    <FaUser className="meta-icon" />
                    <span>{inquiry.name || "Anonymous"}</span>
                  </div>
                  <div className="meta-item">
                    <FaEnvelope className="meta-icon" />
                    <span>{inquiry.contactEmail}</span>
                  </div>
                  <div className="meta-item">
                    <FaPhone className="meta-icon" />
                    <span>{inquiry.phoneNumber}</span>
                  </div>
                </div>

                <div className="inquiry-files">
                  <strong>Files ({inquiry.files.length}):</strong>
                  {inquiry.files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span>{file.originalName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file.filePath, file.originalName);
                        }}
                        className="download-btn"
                      >
                        <FaDownload />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="inquiry-date">
                  {formatDate(inquiry.createdAt)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredInquiries.length === 0 && (
          <div className="no-inquiries">
            <p>No inquiries found for the selected filter.</p>
          </div>
        )}

        {debugInfo && (
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <h3>Debug Info:</h3>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
              {debugInfo}
            </pre>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <motion.div
            className="inquiry-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Inquiry Details - {selectedInquiry.inquiryId}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedInquiry(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-section">
                <h3>Student Information</h3>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedInquiry.name || "Not provided"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedInquiry.contactEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedInquiry.phoneNumber}
                </p>
                <p>
                  <strong>Client Type:</strong> {selectedInquiry.clientType}
                </p>
              </div>

              <div className="detail-section">
                <h3>Assignment Details</h3>
                <p>
                  <strong>Course:</strong> {selectedInquiry.courseName}
                </p>
                <p>
                  <strong>Service Type:</strong> {selectedInquiry.serviceType}
                </p>
                <p>
                  <strong>Urgency:</strong> {selectedInquiry.urgency}
                </p>
                <p>
                  <strong>Details:</strong>
                </p>
                <div className="assignment-details">
                  {selectedInquiry.assignmentDetails}
                </div>
              </div>

              <div className="detail-section">
                <h3>Attached Files ({selectedInquiry.files.length})</h3>
                {selectedInquiry.files.map((file, index) => (
                  <div key={index} className="file-detail">
                    <div className="file-info">
                      <strong>{file.originalName}</strong>
                      <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <button
                      onClick={() =>
                        downloadFile(file.filePath, file.originalName)
                      }
                      className="download-btn"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h3>Timeline</h3>
                <p>
                  <strong>Submitted:</strong>{" "}
                  {formatDate(selectedInquiry.createdAt)}
                </p>
                <p>
                  <strong>Status:</strong> {selectedInquiry.status}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminPanel;
