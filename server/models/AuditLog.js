const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    adminUsername: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "view_inquiries",
        "update_inquiry_status",
        "update_quote",
        "delete_inquiry",
        "download_file",
        "create_admin",
        "update_admin",
        "delete_admin",
        "view_dashboard",
        "failed_login",
        "account_locked",
        "permission_denied",
      ],
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
auditLogSchema.index({ adminId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });

// Static method to log admin actions
auditLogSchema.statics.logAction = async function (data) {
  try {
    const log = new this({
      adminId: data.adminId,
      adminUsername: data.adminUsername,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      success: data.success !== false,
      errorMessage: data.errorMessage,
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Error logging audit action:", error);
    // Don't throw error to avoid breaking the main flow
  }
};

// Static method to get audit logs with pagination
auditLogSchema.statics.getLogs = async function (
  filters = {},
  page = 1,
  limit = 50
) {
  const skip = (page - 1) * limit;

  const query = {};

  if (filters.adminId) query.adminId = filters.adminId;
  if (filters.action) query.action = filters.action;
  if (filters.resource) query.resource = filters.resource;
  if (filters.success !== undefined) query.success = filters.success;
  if (filters.dateFrom || filters.dateTo) {
    query.timestamp = {};
    if (filters.dateFrom) query.timestamp.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.timestamp.$lte = new Date(filters.dateTo);
  }

  const [logs, total] = await Promise.all([
    this.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("adminId", "username email role"),
    this.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

module.exports = mongoose.model("AuditLog", auditLogSchema);
