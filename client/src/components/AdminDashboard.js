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
  FaChartBar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import Header from "./Header";
import Footer from "./Footer";
import AdminLogin from "./AdminLogin";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: "",
    reason: "",
    notes: "",
  });

  const statusOptions = [
    { value: "PENDING", label: "Pending", color: "#f39c12" },
    { value: "ASSIGNED", label: "Assigned", color: "#3498db" },
    { value: "IN_PROGRESS", label: "In Progress", color: "#e67e22" },
    { value: "COMPLETED", label: "Completed", color: "#27ae60" },
    { value: "REJECTED", label: "Rejected", color: "#e74c3c" },
    { value: "REFUTED", label: "Refuted", color: "#9b59b6" },
    { value: "ON_HOLD", label: "On Hold", color: "#f1c40f" },
    { value: "CANCELLED", label: "Cancelled", color: "#95a5a6" },
  ];

  useEffect(() => {
    // Check if admin is logged in
    const storedAdmin = localStorage.getItem("admin");
    const accessToken = localStorage.getItem("accessToken");

    if (storedAdmin && accessToken) {
      setAdmin(JSON.parse(storedAdmin));
      fetchDashboardData();
      fetchInquiries();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.error("Failed to fetch dashboard data:", response.status, data.message);
        if (response.status === 401) {
          alert(`Authentication failed: ${data.message || 'Unauthorized'}. Please login again.`);
          handleLogout();
        } else {
          alert(`Failed to load dashboard: ${data.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Network error while loading dashboard. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiryHistory = async (inquiryId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setStatusHistory(data.data.inquiry.order_status_history || []);
      }
    } catch (error) {
      console.error("Error fetching inquiry history:", error);
    }
  };

  const handleLogin = (adminData, token, refreshToken) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    fetchDashboardData();
    fetchInquiries();
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAdmin(null);
    setInquiries([]);
    setDashboardData(null);
  };

  const handleStatusUpdate = async (inquiryId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statusForm),
      });

      const data = await response.json();
      if (data.success) {
        setEditingStatus(null);
        setStatusForm({ status: "", reason: "", notes: "" });
        fetchInquiries(currentPage, searchTerm, filter);
        fetchDashboardData();
        alert("Status updated successfully!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const downloadFile = async (filePath, originalName) => {
    try {
      const encodedPath = encodeURIComponent(filePath);
      const response = await fetch(`/api/admin/download/${encodedPath}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(`Download failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(`Download error: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return statusOption ? statusOption.color : "#95a5a6";
  };

  const prepareChartData = () => {
    if (!dashboardData) return { statusData: [], trendData: [] };

    const statusData = Object.entries(dashboardData.statusCounts || {}).map(
      ([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: getStatusColor(status),
      })
    );

    // Mock trend data - in real app, this would come from metrics API
    const trendData = [
      { name: "Week 1", inquiries: 12 },
      { name: "Week 2", inquiries: 19 },
      { name: "Week 3", inquiries: 15 },
      { name: "Week 4", inquiries: 25 },
    ];

    return { statusData, trendData };
  };

  const { statusData, trendData } = prepareChartData();

  // Show login form if not authenticated
  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Header />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Header />

      <div className="dashboard-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="dashboard-header"
        >
          <div className="dashboard-title-section">
            <h1>Admin Dashboard</h1>
            <p>Comprehensive inquiry management and analytics</p>
            <div className="admin-user-info">
              <span>Welcome, {admin.username}</span>
              <span className="admin-role">({admin.role})</span>
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="kpi-icon">
              <FaChartBar />
            </div>
            <div className="kpi-content">
              <h3>{dashboardData?.totalInquiries || 0}</h3>
              <p>Total Inquiries</p>
            </div>
          </motion.div>

          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="kpi-icon">
              <FaClock />
            </div>
            <div className="kpi-content">
              <h3>{dashboardData?.statusCounts?.PENDING || 0}</h3>
              <p>Pending</p>
            </div>
          </motion.div>

          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="kpi-icon">
              <FaCheckCircle />
            </div>
            <div className="kpi-content">
              <h3>{dashboardData?.statusCounts?.COMPLETED || 0}</h3>
              <p>Completed</p>
            </div>
          </motion.div>

          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="kpi-icon">
              <FaExclamationTriangle />
            </div>
            <div className="kpi-content">
              <h3>${dashboardData?.totalRevenue || 0}</h3>
              <p>Total Revenue</p>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <motion.div
            className="chart-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3>Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="chart-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3>Inquiry Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="inquiries"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Inquiries Management */}
        <motion.div
          className="inquiries-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="section-header">
            <h2>Inquiry Management</h2>
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    fetchInquiries(1, searchTerm, filter);
                  }
                }}
              />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  fetchInquiries(1, searchTerm, e.target.value);
                }}
              >
                <option value="all">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="inquiries-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry._id}>
                    <td>{inquiry.inquiryId}</td>
                    <td>
                      <div className="student-info">
                        <strong>{inquiry.name || "Anonymous"}</strong>
                        <small>{inquiry.contactEmail}</small>
                      </div>
                    </td>
                    <td>{inquiry.courseName}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(inquiry.status),
                        }}
                      >
                        {inquiry.status}
                      </span>
                    </td>
                    <td>{formatDate(inquiry.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="action-btn view"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStatus(inquiry._id);
                            setStatusForm({
                              status: inquiry.status,
                              reason: "",
                              notes: "",
                            });
                          }}
                          className="action-btn edit"
                          title="Update Status"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => fetchInquiryHistory(inquiry._id)}
                          className="action-btn history"
                          title="View History"
                        >
                          <FaHistory />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => {
                  setCurrentPage(currentPage - 1);
                  fetchInquiries(currentPage - 1, searchTerm, filter);
                }}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                  fetchInquiries(currentPage + 1, searchTerm, filter);
                }}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Update Modal */}
      {editingStatus && (
        <div className="modal-overlay" onClick={() => setEditingStatus(null)}>
          <motion.div
            className="status-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Update Status</h2>
              <button
                className="close-btn"
                onClick={() => setEditingStatus(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>New Status:</label>
                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, status: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Reason (required for some statuses):</label>
                <textarea
                  value={statusForm.reason}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, reason: e.target.value })
                  }
                  placeholder="Enter reason for status change..."
                />
              </div>

              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  value={statusForm.notes}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => handleStatusUpdate(editingStatus)}
                  className="save-btn"
                >
                  <FaSave /> Update Status
                </button>
                <button
                  onClick={() => setEditingStatus(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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

      {/* Status History Modal */}
      {statusHistory.length > 0 && (
        <div className="modal-overlay" onClick={() => setStatusHistory([])}>
          <motion.div
            className="history-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Status History</h2>
              <button
                className="close-btn"
                onClick={() => setStatusHistory([])}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              <div className="history-timeline">
                {statusHistory.map((entry, index) => (
                  <div key={index} className="history-entry">
                    <div className="history-dot"></div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="status-label">{entry.status}</span>
                        <span className="history-date">
                          {formatDate(entry.changedAt)}
                        </span>
                      </div>
                      {entry.changedBy && (
                        <p className="history-user">
                          Changed by: {entry.changedBy.username}
                        </p>
                      )}
                      {entry.reason && (
                        <p className="history-reason">
                          <strong>Reason:</strong> {entry.reason}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="history-notes">
                          <strong>Notes:</strong> {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
