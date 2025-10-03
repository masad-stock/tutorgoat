const express = require("express");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const Inquiry = require("../models/Inquiry");
const { sendInquiryEmail } = require("../services/emailService");
const { validateFileUpload } = require("../middleware/security");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/inquiries";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, TXT, and image files are allowed."
        ),
        false
      );
    }
  },
});

// Validation middleware
const validateInquiry = [
  body("courseName")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Course name must be between 2 and 200 characters"),
  body("assignmentDetails")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Assignment details must be between 10 and 2000 characters"),
  body("contactEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("clientType")
    .isIn(["first-time", "repeat"])
    .withMessage("Please select a valid client type"),
  body("phoneNumber")
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name must be less than 100 characters"),
  body("serviceType")
    .isIn(["quiz", "exam", "class", "assignment", "project"])
    .withMessage("Please select a valid service type"),
  body("urgency")
    .optional()
    .isIn(["urgent", "normal", "flexible"])
    .withMessage("Please select a valid urgency level"),
];

// POST /api/inquiry - Submit new inquiry
router.post(
  "/",
  upload.array("files", 5),
  validateFileUpload,
  validateInquiry,
  async (req, res) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Generate unique inquiry ID
      const inquiryId = `TG-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

      // Process uploaded files
      const files = req.files
        ? req.files.map((file) => ({
            originalName: file.originalname,
            fileName: file.filename,
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
          }))
        : [];

      // Create inquiry record
      const inquiry = new Inquiry({
        inquiryId,
        courseName: req.body.courseName,
        assignmentDetails: req.body.assignmentDetails,
        contactEmail: req.body.contactEmail,
        clientType: req.body.clientType,
        phoneNumber: req.body.phoneNumber,
        name: req.body.name || "",
        files,
        serviceType: req.body.serviceType,
        urgency: req.body.urgency || "normal",
      });

      await inquiry.save();

      // Emit real-time update to admin panel
      const io = req.app.get("io");
      if (io) {
        io.to("admin").emit("inquiry-updated", {
          type: "new-inquiry",
          inquiryId: inquiry.inquiryId,
          courseName: inquiry.courseName,
          contactEmail: inquiry.contactEmail,
          status: inquiry.status,
          timestamp: new Date(),
        });
      }

      // Send confirmation email to student
      try {
        await sendInquiryEmail(inquiry);
      } catch (emailError) {
        console.error("Failed to send inquiry emails:", emailError);
        // Continue with success response even if email fails
      }

      res.status(201).json({
        success: true,
        message:
          "Inquiry submitted successfully! We will send you a quote within 24 hours.",
        inquiryId: inquiry.inquiryId,
      });
    } catch (error) {
      console.error("Error submitting inquiry:", error);

      // Clean up uploaded files if inquiry creation failed
      if (req.files) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to submit inquiry. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// GET /api/inquiry/:inquiryId - Get inquiry status (for internal use)
router.get("/:inquiryId", async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({ inquiryId: req.params.inquiryId });

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      inquiry: {
        inquiryId: inquiry.inquiryId,
        status: inquiry.status,
        quoteAmount: inquiry.quoteAmount,
        quoteEmailSent: inquiry.quoteEmailSent,
        paymentReceived: inquiry.paymentReceived,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiry status",
    });
  }
});

module.exports = router;
