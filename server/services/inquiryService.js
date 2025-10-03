const Inquiry = require("../models/Inquiry");

// Status transition rules
const STATUS_TRANSITIONS = {
  PENDING: ["ASSIGNED", "REJECTED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "ON_HOLD", "REFUTED", "CANCELLED"],
  COMPLETED: [], // Terminal state
  REJECTED: [], // Terminal state
  REFUTED: ["ASSIGNED", "CANCELLED"], // Can be reassigned or cancelled
  ON_HOLD: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  CANCELLED: [], // Terminal state
};

// Status that require a reason
const STATUS_REQUIRING_REASON = ["REJECTED", "REFUTED", "ON_HOLD", "CANCELLED"];

class InquiryService {
  /**
   * Validate if a status transition is allowed
   * @param {string} currentStatus - Current status
   * @param {string} newStatus - New status to transition to
   * @returns {boolean} - True if transition is allowed
   */
  static isValidTransition(currentStatus, newStatus) {
    if (currentStatus === newStatus) return false; // No self-transition
    return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Check if a status requires a reason
   * @param {string} status - Status to check
   * @returns {boolean} - True if reason is required
   */
  static requiresReason(status) {
    return STATUS_REQUIRING_REASON.includes(status);
  }

  /**
   * Update inquiry status with validation and history logging
   * @param {string} inquiryId - Inquiry ID
   * @param {string} newStatus - New status
   * @param {ObjectId} changedBy - Admin who made the change
   * @param {string} reason - Reason for status change (required for certain statuses)
   * @param {string} notes - Additional notes
   * @returns {Object} - Updated inquiry or error
   */
  static async updateStatus(inquiryId, newStatus, changedBy, reason = null, notes = null) {
    try {
      const inquiry = await Inquiry.findById(inquiryId);
      if (!inquiry) {
        throw new Error("Inquiry not found");
      }

      // Validate transition
      if (!this.isValidTransition(inquiry.status, newStatus)) {
        throw new Error(`Invalid status transition from ${inquiry.status} to ${newStatus}`);
      }

      // Check if reason is required
      if (this.requiresReason(newStatus) && !reason) {
        throw new Error(`Reason is required for status ${newStatus}`);
      }

      // Create history entry
      const historyEntry = {
        status: newStatus,
        changedBy,
        reason,
        notes,
      };

      // Update inquiry
      const updatedInquiry = await Inquiry.findByIdAndUpdate(
        inquiryId,
        {
          status: newStatus,
          $push: { order_status_history: historyEntry },
          updatedAt: new Date(),
        },
        { new: true }
      ).populate("order_status_history.changedBy", "username");

      return {
        success: true,
        data: updatedInquiry,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get inquiry with full history
   * @param {string} inquiryId - Inquiry ID
   * @returns {Object} - Inquiry with populated history
   */
  static async getInquiryWithHistory(inquiryId) {
    try {
      const inquiry = await Inquiry.findById(inquiryId)
        .populate("order_status_history.changedBy", "username role")
        .sort({ "order_status_history.changedAt": -1 });

      if (!inquiry) {
        throw new Error("Inquiry not found");
      }

      return {
        success: true,
        data: inquiry,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get status transition metrics
   * @param {Date} startDate - Start date for metrics
   * @param {Date} endDate - End date for metrics
   * @returns {Object} - Status transition metrics
   */
  static async getStatusMetrics(startDate, endDate) {
    try {
      const matchStage = {
        "order_status_history.changedAt": {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const metrics = await Inquiry.aggregate([
        { $unwind: "$order_status_history" },
        { $match: matchStage },
        {
          $group: {
            _id: {
              fromStatus: "$status",
              toStatus: "$order_status_history.status",
            },
            count: { $sum: 1 },
            avgTimeInStatus: { $avg: "$order_status_history.changedAt" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Bulk update status for multiple inquiries
   * @param {Array} updates - Array of {inquiryId, newStatus, reason, notes}
   * @param {ObjectId} changedBy - Admin making the changes
   * @returns {Object} - Bulk update results
   */
  static async bulkUpdateStatus(updates, changedBy) {
    const results = {
      successful: [],
      failed: [],
    };

    for (const update of updates) {
      const result = await this.updateStatus(
        update.inquiryId,
        update.newStatus,
        changedBy,
        update.reason,
        update.notes
      );

      if (result.success) {
        results.successful.push({
          inquiryId: update.inquiryId,
          newStatus: update.newStatus,
        });
      } else {
        results.failed.push({
          inquiryId: update.inquiryId,
          error: result.message,
        });
      }
    }

    return results;
  }
}

module.exports = InquiryService;
