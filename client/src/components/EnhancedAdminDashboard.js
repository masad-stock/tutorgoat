import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaBell,
  FaFilter,
  FaSearch,
  FaColumns,
  FaTable,
  FaChartLine,
  FaUsers,
  FaDollarSign,
  FaTasks,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
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
  FunnelChart,
  Funnel,
  LabelList,
  Area,
  AreaChart,
} from "recharts";
import { io } from "socket.io-client";
import Header from "./Header";
import Footer from "./Footer";
import AdminLogin from "./AdminLogin";
import StatusUpdateModal from "./StatusUpdateModal";
import "./EnhancedAdminDashboard.css";
import "./StatusUpdateModal.css";

const EnhancedAdminDashboard = () => {
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
  const [viewMode, setViewMode] = useState("table"); // table, kanban
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInquiryForStatus, setSelectedInquiryForStatus] =
    useState(null);

  const statusOptions = [
    { value: "PENDING", label: "Pending", color: "#f39c12", count: 0 },
    { value: "ASSIGNED", label: "Assigned", color: "#3498db", count: 0 },
    { value: "IN_PROGRESS", label: "In Progress", color: "#e67e22", count: 0 },
    { value: "COMPLETED", label: "Completed", color: "#27ae60", count: 0 },
    { value: "REJECTED", label: "Rejected", color: "#e74c3c", count: 0 },
    { value: "REFUTED", label: "Refuted", color: "#9b59b6", count: 0 },
    { value: "ON_HOLD", label: "On Hold", color: "#f1c40f", count: 0 },
    { value: "CANCELLED", label: "Cancelled", color: "#95a5a6", count: 0 },
  ];

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      newSocket.emit("join-admin");
    });

    newSocket.on("inquiry-updated", (data) => {
      console.log("Received update:", data);
      addNotification(data);
      fetchInquiries();
      fetchDashboardData();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (data) => {
    const notification = {
      id: Date.now(),
      type: data.type,
      message: getNotificationMessage(data),
      timestamp: new Date(),
    };
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);
  };

  const getNotificationMessage = (data) => {
    switch (data.type) {
      case "new-inquiry":
        return `New inquiry: ${data.courseName} from ${data.contactEmail}`;
      case "status-update":
        return `Status updated to ${data.newStatus} by ${data.updatedBy}`;
      default:
        return "Inquiry updated";
    }
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    const accessToken = localStorage.getItem("accessToken");

    if (storedAdmin && accessToken) {
      setAdmin(JSON.parse(storedAdmin));
      // Fetch data in parallel and handle loading state properly
      Promise.all([fetchInquiries(), fetchDashboardData()]).catch((error) => {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      });

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status: statusFilter !== "all" ? statusFilter : "",
      });

      const response = await fetch(`/api/admin/inquiries?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInquiries(data.data.inquiries);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
      } else {
        console.error(
          "Failed to fetch inquiries:",
          response.status,
          response.statusText
        );
        // If unauthorized, redirect to login
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      } else {
        console.error(
          "Failed to fetch dashboard data:",
          response.status,
          response.statusText
        );
        // If unauthorized, redirect to login
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleLogin = (adminData, token) => {
    setAdmin(adminData);
    localStorage.setItem("admin", JSON.stringify(adminData));
    localStorage.setItem("accessToken", token);
    fetchInquiries();
    fetchDashboardData();
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("accessToken");
    setInquiries([]);
    setDashboardData(null);
  };

  const handleStatusUpdate = async (inquiryId, newStatus, reason, notes) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          status: newStatus,
          reason,
          notes,
        }),
      });

      if (response.ok) {
        fetchInquiries(currentPage, searchTerm, filter);
        setShowStatusModal(false);
        setSelectedInquiryForStatus(null);
        addNotification({
          type: "status-update",
          inquiryId,
          newStatus,
          updatedBy: admin.username,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEditStatus = (inquiry) => {
    setSelectedInquiryForStatus(inquiry);
    setShowStatusModal(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInquiries(1, searchTerm, filter);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchInquiries(1, searchTerm, newFilter);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "#95a5a6";
  };

  // KPI Cards Data
  const kpiData = dashboardData
    ? [
        {
          title: "Total Inquiries",
          value: dashboardData.totalInquiries || 0,
          change: "+12%",
          changeType: "positive",
          icon: FaTasks,
          color: "#3498db",
        },
        {
          title: "Completed Orders",
          value: dashboardData.statusCounts?.COMPLETED || 0,
          change: "+8%",
          changeType: "positive",
          icon: FaCheckCircle,
          color: "#27ae60",
        },
        {
          title: "Pending Orders",
          value: dashboardData.statusCounts?.PENDING || 0,
          change: "-5%",
          changeType: "negative",
          icon: FaClock,
          color: "#f39c12",
        },
        {
          title: "Total Revenue",
          value: `$${dashboardData.totalRevenue || 0}`,
          change: "+15%",
          changeType: "positive",
          icon: FaDollarSign,
          color: "#9b59b6",
        },
      ]
    : [];

  // Chart Data
  const statusChartData = dashboardData?.statusCounts
    ? Object.entries(dashboardData.statusCounts).map(([status, count]) => ({
        status,
        count,
        color: getStatusColor(status),
      }))
    : [];

  const serviceTypeData = dashboardData?.serviceTypeCounts
    ? Object.entries(dashboardData.serviceTypeCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
      }))
    : [];

  // Funnel Chart Data
  const funnelData = [
    {
      name: "Inquiries",
      value: dashboardData?.totalInquiries || 0,
      fill: "#8884d8",
    },
    {
      name: "Assigned",
      value: dashboardData?.statusCounts?.ASSIGNED || 0,
      fill: "#82ca9d",
    },
    {
      name: "In Progress",
      value: dashboardData?.statusCounts?.IN_PROGRESS || 0,
      fill: "#ffc658",
    },
    {
      name: "Completed",
      value: dashboardData?.statusCounts?.COMPLETED || 0,
      fill: "#ff7300",
    },
  ];

  // Line Chart Data (last 7 days)
  const lineChartData = [
    { day: "Mon", inquiries: 12, completed: 8 },
    { day: "Tue", inquiries: 19, completed: 15 },
    { day: "Wed", inquiries: 15, completed: 12 },
    { day: "Thu", inquiries: 22, completed: 18 },
    { day: "Fri", inquiries: 18, completed: 14 },
    { day: "Sat", inquiries: 8, completed: 6 },
    { day: "Sun", inquiries: 5, completed: 4 },
  ];

  // Kanban Columns
  const kanbanColumns = [
    {
      id: "PENDING",
      title: "Pending",
      inquiries: inquiries.filter((i) => i.status === "PENDING"),
    },
    {
      id: "ASSIGNED",
      title: "Assigned",
      inquiries: inquiries.filter((i) => i.status === "ASSIGNED"),
    },
    {
      id: "IN_PROGRESS",
      title: "In Progress",
      inquiries: inquiries.filter((i) => i.status === "IN_PROGRESS"),
    },
    {
      id: "COMPLETED",
      title: "Completed",
      inquiries: inquiries.filter((i) => i.status === "COMPLETED"),
    },
  ];

  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="enhanced-admin-dashboard">
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
    <div className="enhanced-admin-dashboard">
      <Header />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="notification"
          >
            <FaBell />
            <span>{notification.message}</span>
            <button
              onClick={() =>
                setNotifications((prev) =>
                  prev.filter((n) => n.id !== notification.id)
                )
              }
            >
              <FaTimes />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="admin-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="admin-header"
        >
          <div className="admin-title-section">
            <h1>Enhanced Admin Dashboard</h1>
            <p>Real-time order management and analytics</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="kpi-cards"
        >
          {kpiData.map((kpi, index) => (
            <div key={index} className="kpi-card">
              <div className="kpi-icon" style={{ backgroundColor: kpi.color }}>
                <kpi.icon />
              </div>
              <div className="kpi-content">
                <h3>{kpi.title}</h3>
                <div className="kpi-value">{kpi.value}</div>
                <div className={`kpi-change ${kpi.changeType}`}>
                  {kpi.changeType === "positive" ? (
                    <FaArrowUp />
                  ) : kpi.changeType === "negative" ? (
                    <FaArrowDown />
                  ) : (
                    <FaMinus />
                  )}
                  {kpi.change}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="charts-section"
        >
          <div className="chart-row">
            {/* Status Distribution Pie Chart */}
            <div className="chart-container">
              <h3>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Service Type Bar Chart */}
            <div className="chart-container">
              <h3>Service Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-row">
            {/* Conversion Funnel */}
            <div className="chart-container">
              <h3>Conversion Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Funnel dataKey="value" data={funnelData} isAnimationActive>
                    <LabelList position="center" fill="#fff" stroke="none" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Line Chart */}
            <div className="chart-container">
              <h3>Weekly Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="inquiries"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="admin-controls"
        >
          <div className="search-filter-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">Search</button>
              </div>
            </form>

            <div className="filter-section">
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="view-toggle">
              <button
                className={viewMode === "table" ? "active" : ""}
                onClick={() => setViewMode("table")}
              >
                <FaTable /> Table
              </button>
              <button
                className={viewMode === "kanban" ? "active" : ""}
                onClick={() => setViewMode("kanban")}
              >
                <FaColumns /> Kanban
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="data-display"
        >
          {viewMode === "table" ? (
            <div className="inquiries-table">
              <table>
                <thead>
                  <tr>
                    <th>Inquiry ID</th>
                    <th>Course Name</th>
                    <th>Contact Email</th>
                    <th>Status</th>
                    <th>Service Type</th>
                    <th>Urgency</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry._id}>
                      <td>{inquiry.inquiryId}</td>
                      <td>{inquiry.courseName}</td>
                      <td>{inquiry.contactEmail}</td>
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
                      <td>{inquiry.serviceType}</td>
                      <td>{inquiry.urgency}</td>
                      <td>{formatDate(inquiry.createdAt)}</td>
                      <td>
                        <button
                          onClick={() => setSelectedInquiry(inquiry)}
                          className="action-btn view-btn"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditStatus(inquiry)}
                          className="action-btn edit-btn"
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="kanban-board">
              {kanbanColumns.map((column) => (
                <div key={column.id} className="kanban-column">
                  <div className="kanban-header">
                    <h3>{column.title}</h3>
                    <span className="count">{column.inquiries.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {column.inquiries.map((inquiry) => (
                      <div key={inquiry._id} className="kanban-card">
                        <div className="card-header">
                          <span className="inquiry-id">
                            {inquiry.inquiryId}
                          </span>
                          <span className="urgency">{inquiry.urgency}</span>
                        </div>
                        <div className="card-content">
                          <h4>{inquiry.courseName}</h4>
                          <p>{inquiry.contactEmail}</p>
                          <span className="service-type">
                            {inquiry.serviceType}
                          </span>
                        </div>
                        <div className="card-actions">
                          <button
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="action-btn view-btn"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditStatus(inquiry)}
                            className="action-btn edit-btn"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="pagination"
        >
          <button
            onClick={() => {
              const newPage = currentPage - 1;
              if (newPage >= 1) {
                setCurrentPage(newPage);
                fetchInquiries(newPage, searchTerm, filter);
              }
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
              const newPage = currentPage + 1;
              if (newPage <= totalPages) {
                setCurrentPage(newPage);
                fetchInquiries(newPage, searchTerm, filter);
              }
            }}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </motion.div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedInquiryForStatus(null);
        }}
        inquiry={selectedInquiryForStatus}
        onUpdate={handleStatusUpdate}
        statusOptions={statusOptions}
      />

      <Footer />
    </div>
  );
};

export default EnhancedAdminDashboard;
