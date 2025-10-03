const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "AGENT", "READONLY"],
      default: "AGENT",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    twoFactorSecret: {
      type: String,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    permissions: {
      canViewInquiries: { type: Boolean, default: true },
      canEditInquiries: { type: Boolean, default: true },
      canDeleteInquiries: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
      canManageSettings: { type: Boolean, default: false },
    },
    passwordBreached: {
      type: Boolean,
      default: false,
    },
    passwordBreachDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
adminSchema.index({ email: 1 });
adminSchema.index({ username: 1 });
adminSchema.index({ role: 1 });

// Virtual for account lockout
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  // Store previous password in history
  if (this.password) {
    this.passwordHistory = this.passwordHistory || [];
    this.passwordHistory.unshift({
      hash: this.password,
      changedAt: new Date()
    });
    
    // Keep only last 5 passwords
    if (this.passwordHistory.length > 5) {
      this.passwordHistory.pop();
    }
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() },
  });
};

// Method to check permissions
adminSchema.methods.hasPermission = function (permission) {
  // ADMIN has all permissions
  if (this.role === "ADMIN") return true;

  // MANAGER has most permissions except user management
  if (this.role === "MANAGER") {
    const restrictedPermissions = ["canManageUsers", "canManageSettings"];
    if (restrictedPermissions.includes(permission)) return false;
    return this.permissions[permission] || false;
  }

  // AGENT can view and edit inquiries
  if (this.role === "AGENT") {
    const allowedPermissions = ["canViewInquiries", "canEditInquiries", "canViewAnalytics"];
    return allowedPermissions.includes(permission) && (this.permissions[permission] || false);
  }

  // READONLY can only view
  if (this.role === "READONLY") {
    const viewPermissions = ["canViewInquiries", "canViewAnalytics"];
    return viewPermissions.includes(permission) && (this.permissions[permission] || false);
  }

  return false;
};

module.exports = mongoose.model("Admin", adminSchema);
