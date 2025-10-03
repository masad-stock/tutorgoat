const express = require("express");
const path = require("path");
const fs = require("fs");
const Inquiry = require("../models/Inquiry");
const Admin = require("../models/Admin");
const InquiryService = require("../services/inquiryService");
const {
  authenticate,
  authorize,
  requirePermission,
} = require("../middleware/auth");
const { auditLog } = require("../middleware/audit");

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);

// GET /api/admin/test-download - Test file download
router.get("/test-download", (req, res) => {
  res.json({
    success: true,
    message: "Admin API is working",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/admin/list-files - List all files in uploads directory
router.get("/list-files", (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, "..", "uploads");
    const resolvedUploadsDir = path.resolve(uploadsDir);

    console.log("Listing files in:", resolvedUploadsDir);

    if (!fs.existsSync(resolvedUploadsDir)) {
      return res.json({
        success: false,
        message: "Uploads directory does not exist",
        uploadsDir: resolvedUploadsDir,
      });
    }

    const listFiles = (dir, basePath = "") => {
      const files = [];
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          files.push(...listFiles(fullPath, relativePath));
        } else {
          files.push({
            name: item,
            path: relativePath,
            fullPath: fullPath,
            size: stats.size,
            modified: stats.mtime,
          });
        }
      }

      return files;
    };

    const allFiles = listFiles(resolvedUploadsDir);

    res.json({
      success: true,
      uploadsDir: resolvedUploadsDir,
      fileCount: allFiles.length,
      files: allFiles,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({
      success: false,
      message: "Error listing files",
      error: error.message,
    });
  }
});

// GET /api/admin/inquiries - Get all inquiries with advanced filtering
router.get(
  "/inquiries",
  requirePermission("canViewInquiries"),
  auditLog("view_inquiries", "inquiries"),
  async (req, res) => {
    const startTime = Date.now();
    console.log(`[ADMIN INQUIRIES] Starting request at ${new Date().toISOString()}`);

    try {
      const {
        page = 1,
        limit = 10,
        status,
        serviceType,
        urgency,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        dateFrom,
        dateTo,
        assignedTutor,
        minQuote,
        maxQuote,
      } = req.query;

      console.log(`[ADMIN INQUIRIES] Query params: page=${page}, limit=${limit}, search=${search}, status=${status}`);

      // Build filter object
      const filter = {};

      if (status) filter.status = status;
      if (serviceType) filter.serviceType = serviceType;
      if (urgency) filter.urgency = urgency;
      if (assignedTutor) filter.assignedTutor = assignedTutor;

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Quote amount range filter
      if (minQuote || maxQuote) {
        filter.quoteAmount = {};
        if (minQuote) filter.quoteAmount.$gte = parseFloat(minQuote);
        if (maxQuote) filter.quoteAmount.$lte = parseFloat(maxQuote);
      }

      // Search filter
      if (search) {
        filter.$or = [
          { courseName: { $regex: search, $options: "i" } },
          { contactEmail: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { inquiryId: { $regex: search, $options: "i" } },
          { assignedTutor: { $regex: search, $options: "i" } },
        ];
      }

      console.log(`[ADMIN INQUIRIES] Built filter:`, JSON.stringify(filter, null, 2));

      // Build sort object
      const validSortFields = [
        "createdAt",
        "quoteAmount",
        "courseName",
        "status",
        "urgency",
      ];
      const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
      const sort = {};
      sort[sortField] = sortOrder === "desc" ? -1 : 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      console.log(`[ADMIN INQUIRIES] Starting database queries...`);

      // Get inquiries with pagination
      const inquiriesStart = Date.now();
      const inquiries = await Inquiry.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-__v");
      const inquiriesTime = Date.now() - inquiriesStart;
      console.log(`[ADMIN INQUIRIES] Inquiries query took ${inquiriesTime}ms, returned ${inquiries.length} records`);

      // Get total count for pagination
      const countStart = Date.now();
      const total = await Inquiry.countDocuments(filter);
      const countTime = Date.now() - countStart;
      console.log(`[ADMIN INQUIRIES] Count query took ${countTime}ms, total records: ${total}`);

      // Get status counts for dashboard
      const aggregateStart = Date.now();
      const statusCounts = await Inquiry.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      const aggregateTime = Date.now() - aggregateStart;
      console.log(`[ADMIN INQUIRIES] Aggregate query took ${aggregateTime}ms`);

      const totalTime = Date.now() - startTime;
      console.log(`[ADMIN INQUIRIES] Total request time: ${totalTime}ms`);

      res.json({
        success: true,
        data: {
          inquiries,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      });
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`[ADMIN INQUIRIES] Error after ${totalTime}ms:`, error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch inquiries",
      });
    }
  }
);

// GET /api/admin/download/:filePath - Download file
router.get("/download/:filePath", (req, res) => {
  try {
    // Decode and normalize filePath early
    let filePath = req.params.filePath.replace(/\\/g, "/");
    filePath = decodeURIComponent(filePath);
    console.log("Original filePath from database:", filePath);

    // Normalize filePath - remove "server/" prefix if present
    if (filePath.startsWith("server/")) {
      filePath = filePath.substring(7); // Remove "server/" prefix
      console.log("Normalized filePath:", filePath);
    }
    // Convert backslashes to forward slashes for cross-platform compatibility
    filePath = filePath.replace(/\\/g, "/");
    console.log("Final normalized filePath:", filePath);

    // Handle both relative and absolute paths
    let fullPath;
    if (path.isAbsolute(filePath)) {
      // If it's already an absolute path, use it directly
      fullPath = filePath;
    } else {
      // If it's relative, construct the full path from project root
      fullPath = path.join(__dirname, "..", "..", filePath);
    }

    console.log("Resolved fullPath:", fullPath);
    console.log("File exists:", fs.existsSync(fullPath));

    // Security check - ensure file is within uploads directory
    const uploadsDir = path.join(__dirname, "..", "..", "uploads");
    const resolvedUploadsDir = path.resolve(uploadsDir);
    const resolvedFullPath = path.resolve(fullPath);

    console.log("Uploads directory:", resolvedUploadsDir);
    console.log("File path (resolved):", resolvedFullPath);
    console.log(
      "Path starts with uploads:",
      resolvedFullPath.startsWith(resolvedUploadsDir)
    );

    if (!resolvedFullPath.startsWith(resolvedUploadsDir)) {
      console.log("Security check failed - file outside uploads directory");
      console.log("Expected to start with:", resolvedUploadsDir);
      console.log("Actual path:", resolvedFullPath);
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if file exists
    if (!fs.existsSync(resolvedFullPath)) {
      console.log("File not found at:", resolvedFullPath);

      // Let's also check if the uploads directory exists
      console.log(
        "Uploads directory exists:",
        fs.existsSync(resolvedUploadsDir)
      );

      // List files in uploads directory to see what's actually there
      try {
        const uploadsContents = fs.readdirSync(resolvedUploadsDir);
        console.log("Contents of uploads directory:", uploadsContents);

        // If there's an inquiries subdirectory, check that too
        const inquiriesDir = path.join(resolvedUploadsDir, "inquiries");
        if (fs.existsSync(inquiriesDir)) {
          const inquiriesContents = fs.readdirSync(inquiriesDir);
          console.log("Contents of inquiries directory:", inquiriesContents);
        }
      } catch (err) {
        console.log("Error reading uploads directory:", err.message);
      }

      return res.status(404).json({
        success: false,
        message: "File not found",
        debug: {
          resolvedPath: resolvedFullPath,
          uploadsDir: resolvedUploadsDir,
          uploadsExists: fs.existsSync(resolvedUploadsDir),
        },
      });
    }

    // Get file stats
    const stats = fs.statSync(resolvedFullPath);
    const fileName = path.basename(resolvedFullPath);

    console.log("Serving file:", fileName, "Size:", stats.size);

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Stream the file
    const fileStream = fs.createReadStream(resolvedFullPath);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error streaming file:", error);
      res.status(500).json({
        success: false,
        message: "Error downloading file",
      });
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download file",
    });
  }
});

router.put(
  "/inquiries/:id/status",
  requirePermission("canEditInquiries"),
  async (req, res) => {
    try {
      const { status, reason, notes, internalNotes, assignedTutor } = req.body;
      const inquiryId = req.params.id;

      // Use InquiryService to update status with validation and history logging
      const result = await InquiryService.updateStatus(
        inquiryId,
        status,
        req.admin._id,
        reason,
        notes
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      // Update internalNotes and assignedTutor if provided
      const updateFields = {};
      if (internalNotes !== undefined)
        updateFields.internalNotes = internalNotes;
      if (assignedTutor !== undefined)
        updateFields.assignedTutor = assignedTutor;

      if (Object.keys(updateFields).length > 0) {
        await Inquiry.findByIdAndUpdate(inquiryId, updateFields);
      }

      // Emit real-time update to admin panel
      const io = req.app.get("io");
      if (io) {
        io.to("admin").emit("inquiry-updated", {
          type: "status-update",
          inquiryId: inquiryId,
          newStatus: status,
          updatedBy: req.admin.username,
          timestamp: new Date(),
        });
      }

      res.json({
        success: true,
        message: "Status updated successfully",
        data: { inquiry: result.data },
      });
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update status",
      });
    }
  }
);

// PUT /api/admin/inquiries/:id/quote - Update quote amount
router.put(
  "/inquiries/:id/quote",
  requirePermission("canEditInquiries"),
  async (req, res) => {
    try {
      const { quoteAmount } = req.body;
      const inquiryId = req.params.id;

      if (quoteAmount === undefined || quoteAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid quote amount is required",
        });
      }

      const inquiry = await Inquiry.findByIdAndUpdate(
        inquiryId,
        {
          quoteAmount,
          status: "quoted",
          updatedBy: req.admin._id,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      res.json({
        success: true,
        message: "Quote updated successfully",
        data: { inquiry },
      });
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update quote",
      });
    }
  }
);

router.put(
  "/inquiries/bulk-status",
  requirePermission("canEditInquiries"),
  async (req, res) => {
    try {
      const { updates } = req.body; // Array of {inquiryId, newStatus, reason, notes}

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Valid updates array is required",
        });
      }

      const result = await InquiryService.bulkUpdateStatus(
        updates,
        req.admin._id
      );

      res.json({
        success: true,
        message: `Bulk update completed: ${result.successful.length} successful, ${result.failed.length} failed`,
        data: result,
      });
    } catch (error) {
      console.error("Error bulk updating inquiries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk update inquiries",
      });
    }
  }
);

router.get(
  "/inquiries/:id",
  requirePermission("canViewInquiries"),
  async (req, res) => {
    try {
      const result = await InquiryService.getInquiryWithHistory(req.params.id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
        });
      }

      res.json({
        success: true,
        data: { inquiry: result.data },
      });
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch inquiry",
      });
    }
  }
);

// GET /api/admin/dashboard - Get dashboard analytics
router.get(
  "/dashboard",
  requirePermission("canViewAnalytics"),
  async (req, res) => {
    try {
      const { period = "30d" } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate;

      switch (period) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get analytics data
      const [
        totalInquiries,
        statusCounts,
        serviceTypeCounts,
        urgencyCounts,
        recentInquiries,
        revenueData,
      ] = await Promise.all([
        Inquiry.countDocuments({ createdAt: { $gte: startDate } }),
        Inquiry.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Inquiry.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: "$serviceType", count: { $sum: 1 } } },
        ]),
        Inquiry.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: "$urgency", count: { $sum: 1 } } },
        ]),
        Inquiry.find({ createdAt: { $gte: startDate } })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("inquiryId courseName status createdAt contactEmail"),
        Inquiry.aggregate([
          { $match: { createdAt: { $gte: startDate }, status: "completed" } },
          { $group: { _id: null, totalRevenue: { $sum: "$quoteAmount" } } },
        ]),
      ]);

      res.json({
        success: true,
        data: {
          period,
          totalInquiries,
          statusCounts: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          serviceTypeCounts: serviceTypeCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          urgencyCounts: urgencyCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          recentInquiries,
          totalRevenue: revenueData[0]?.totalRevenue || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard data",
      });
    }
  }
);

// DELETE /api/admin/inquiries/:id - Delete inquiry
router.delete(
  "/inquiries/:id",
  requirePermission("canDeleteInquiries"),
  async (req, res) => {
    try {
      const inquiryId = req.params.id;

      const inquiry = await Inquiry.findById(inquiryId);
      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      // Delete associated files
      inquiry.files.forEach((file) => {
        const filePath = path.join(__dirname, "..", file.filePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Delete inquiry from database
      await Inquiry.findByIdAndDelete(inquiryId);

      res.json({
        success: true,
        message: "Inquiry deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete inquiry",
      });
    }
  }
);

router.get(
  "/inquiries/metrics",
  requirePermission("canViewAnalytics"),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate query parameters are required",
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const result = await InquiryService.getStatusMetrics(start, end);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.message,
        });
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch metrics",
      });
    }
  }
);

module.exports = router;
