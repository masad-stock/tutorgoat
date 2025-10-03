import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaFilter,
  FaTimes,
  FaSearch,
  FaCalendarAlt,
  FaDollarSign,
  FaUser,
  FaSort,
} from "react-icons/fa";
import "./AdvancedFilters.css";

const AdvancedFilters = ({
  filters,
  onFiltersChange,
  sortOptions,
  onSortChange,
  onApplyFilters,
  onResetFilters,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      status: "all",
      serviceType: "all",
      urgency: "all",
      assignedTutor: "",
      minQuote: "",
      maxQuote: "",
      dateFrom: "",
      dateTo: "",
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "quoted", label: "Quoted" },
    { value: "accepted", label: "Accepted" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const serviceTypeOptions = [
    { value: "all", label: "All Service Types" },
    { value: "quiz", label: "Quiz" },
    { value: "exam", label: "Exam" },
    { value: "class", label: "Class" },
    { value: "assignment", label: "Assignment" },
    { value: "project", label: "Project" },
  ];

  const urgencyOptions = [
    { value: "all", label: "All Urgencies" },
    { value: "urgent", label: "Urgent" },
    { value: "normal", label: "Normal" },
    { value: "flexible", label: "Flexible" },
  ];

  const sortOptionsList = [
    { value: "createdAt", label: "Date Created" },
    { value: "courseName", label: "Course Name" },
    { value: "status", label: "Status" },
    { value: "quoteAmount", label: "Quote Amount" },
    { value: "urgency", label: "Urgency" },
  ];

  return (
    <motion.div
      className={`advanced-filters ${isOpen ? "open" : ""}`}
      initial={false}
      animate={{ height: isOpen ? "auto" : 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="filters-content">
        <div className="filters-header">
          <h3>
            <FaFilter /> Advanced Filters
          </h3>
          <button className="toggle-btn" onClick={onToggle}>
            <FaTimes />
          </button>
        </div>

        <div className="filters-grid">
          {/* Search */}
          <div className="filter-group">
            <label>
              <FaSearch /> Search
            </label>
            <input
              type="text"
              placeholder="Search by ID, course, email..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Status */}
          <div className="filter-group">
            <label>Status</label>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="filter-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type */}
          <div className="filter-group">
            <label>Service Type</label>
            <select
              value={localFilters.serviceType}
              onChange={(e) => handleFilterChange("serviceType", e.target.value)}
              className="filter-select"
            >
              {serviceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div className="filter-group">
            <label>Urgency</label>
            <select
              value={localFilters.urgency}
              onChange={(e) => handleFilterChange("urgency", e.target.value)}
              className="filter-select"
            >
              {urgencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Tutor */}
          <div className="filter-group">
            <label>
              <FaUser /> Assigned Tutor
            </label>
            <input
              type="text"
              placeholder="Tutor name..."
              value={localFilters.assignedTutor}
              onChange={(e) => handleFilterChange("assignedTutor", e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Quote Range */}
          <div className="filter-group quote-range">
            <label>
              <FaDollarSign /> Quote Range
            </label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minQuote}
                onChange={(e) => handleFilterChange("minQuote", e.target.value)}
                className="filter-input small"
                min="0"
                step="0.01"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxQuote}
                onChange={(e) => handleFilterChange("maxQuote", e.target.value)}
                className="filter-input small"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="filter-group date-range">
            <label>
              <FaCalendarAlt /> Date Range
            </label>
            <div className="date-inputs">
              <input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="filter-input"
              />
              <span>to</span>
              <input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="filter-group sort-options">
            <label>
              <FaSort /> Sort By
            </label>
            <div className="sort-controls">
              <select
                value={sortOptions.field}
                onChange={(e) => onSortChange({ ...sortOptions, field: e.target.value })}
                className="filter-select"
              >
                {sortOptionsList.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={sortOptions.order}
                onChange={(e) => onSortChange({ ...sortOptions, order: e.target.value })}
                className="filter-select small"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn-secondary" onClick={handleResetFilters}>
            Reset Filters
          </button>
          <button className="btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedFilters;
