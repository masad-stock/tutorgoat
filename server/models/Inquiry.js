const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    inquiryId: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    assignmentDetails: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    clientType: {
      type: String,
      enum: ["first-time", "repeat"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    files: [
      {
        originalName: String,
        fileName: String,
        filePath: String,
        fileSize: Number,
        mimeType: String,
      },
    ],
    serviceType: {
      type: String,
      enum: ["quiz", "exam", "class", "assignment", "project"],
      required: true,
    },
    urgency: {
      type: String,
      enum: ["urgent", "normal", "flexible"],
      default: "normal",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ASSIGNED",
        "IN_PROGRESS",
        "COMPLETED",
        "REJECTED",
        "REFUTED",
        "ON_HOLD",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    order_status_history: [
      {
        status: {
          type: String,
          enum: [
            "PENDING",
            "ASSIGNED",
            "IN_PROGRESS",
            "COMPLETED",
            "REJECTED",
            "REFUTED",
            "ON_HOLD",
            "CANCELLED",
          ],
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
          required: true,
        },
        reason: {
          type: String,
          maxlength: 500,
        },
        notes: {
          type: String,
          maxlength: 1000,
        },
      },
    ],
    quoteAmount: {
      type: Number,
      min: 0,
    },
    quoteEmailSent: {
      type: Boolean,
      default: false,
    },
    quoteEmailSentAt: Date,
    paymentReceived: {
      type: Boolean,
      default: false,
    },
    paymentReceivedAt: Date,
    internalNotes: {
      type: String,
      maxlength: 1000,
    },
    assignedTutor: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
inquirySchema.index({ inquiryId: 1 });
inquirySchema.index({ contactEmail: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
