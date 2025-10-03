const express = require("express");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const {
  generateTokens,
  verifyToken,
  authenticate,
  authRateLimit,
  JWT_REFRESH_SECRET,
} = require("../middleware/auth");
const {
  auditFailedLogin,
  auditSuccessfulLogin,
  auditLogout,
  auditAccountLockout,
  getClientIP,
  getUserAgent,
} = require("../middleware/audit");

const router = express.Router();

// Validation rules
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["admin", "moderator"])
    .withMessage("Invalid role"),
];

// POST /api/auth/login - Admin login
router.post("/login", authRateLimit, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Admin not found for email:", email);
      // Log failed login attempt
      await auditFailedLogin(
        email,
        getClientIP(req),
        getUserAgent(req),
        "Admin not found"
      );

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("Admin found:", admin.email, "role:", admin.role, "isActive:", admin.isActive);

    // Check if account is locked
    if (admin.isLocked) {
      await auditFailedLogin(
        email,
        getClientIP(req),
        getUserAgent(req),
        "Account locked"
      );

      return res.status(401).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed login attempts",
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      await auditFailedLogin(
        email,
        getClientIP(req),
        getUserAgent(req),
        "Account deactivated"
      );

      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Compare password
    console.log("Comparing password for admin:", admin.email);
    const isPasswordValid = await admin.comparePassword(password);
    console.log("Password valid:", isPasswordValid);
    if (!isPasswordValid) {
      console.log("Password invalid for admin:", admin.email);
      // Increment login attempts
      await admin.incLoginAttempts();

      // Check if account is now locked
      const updatedAdmin = await Admin.findById(admin._id);
      if (updatedAdmin.isLocked) {
        await auditAccountLockout(
          updatedAdmin,
          getClientIP(req),
          getUserAgent(req)
        );
      } else {
        await auditFailedLogin(
          email,
          getClientIP(req),
          getUserAgent(req),
          "Invalid password"
        );
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password was breached
    if (admin.passwordBreached) {
      // Reset login attempts on successful login
      await admin.resetLoginAttempts();

      // Log successful login
      await auditSuccessfulLogin(admin, getClientIP(req), getUserAgent(req));

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(admin);

      return res.json({
        success: true,
        message: "Login successful",
        passwordBreached: true,
        data: {
          admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            lastLogin: admin.lastLogin,
          },
          accessToken,
          refreshToken,
        },
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Log successful login
    await auditSuccessfulLogin(admin, getClientIP(req), getUserAgent(req));

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// POST /api/auth/register - Admin registration (super admin only)
router.post(
  "/register",
  authRateLimit,
  registerValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { username, email, password, role = "admin" } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        $or: [{ email }, { username }],
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Admin with this email or username already exists",
        });
      }

      // Create new admin
      const admin = new Admin({
        username,
        email,
        password,
        role,
      });

      await admin.save();

      res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: {
          admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
          },
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
      });
    }
  }
);

// POST /api/auth/refresh - Refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = verifyToken(refreshToken, JWT_REFRESH_SECRET);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Find admin and check if still active
    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found or deactivated",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(admin);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
    });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post("/logout", async (req, res) => {
  try {
    // Try to get admin info from token for audit logging
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(
        token,
        process.env.JWT_SECRET ||
          "your-super-secret-jwt-key-change-in-production"
      );

      if (decoded) {
        const admin = await Admin.findById(decoded.id);
        if (admin) {
          await auditLogout(admin, getClientIP(req), getUserAgent(req));
        }
      }
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.json({
      success: true,
      message: "Logout successful",
    });
  }
});

// GET /api/auth/me - Get current admin info
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(
      token,
      process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
    );

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found or deactivated",
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error("Get admin info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get admin info",
    });
  }
});

// POST /api/auth/change-password - Change admin password
router.post("/change-password", authenticate, [
  body("currentPassword")
    .isLength({ min: 6 })
    .withMessage("Current password must be at least 6 characters"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id; // From authenticate middleware

    // Find admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from current
    const isSamePassword = await admin.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Update password and reset breach status
    admin.password = newPassword;
    admin.passwordBreached = false;
    admin.passwordBreachDate = undefined;
    await admin.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      success: false,
      message: "Password change failed",
    });
  }
});

// Set secure HTTP-only cookies endpoint
router.post('/set-cookies', authenticate, (req, res) => {
  const { accessToken, refreshToken, adminData } = req.body;

  if (!accessToken || !refreshToken) {
    return res.status(400).json({
      success: false,
      message: "Tokens required"
    });
  }

  // Set cookies with security flags
  res
    .cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    })
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .status(200)
    .json({
      success: true,
      message: "Cookies set successfully",
      data: { admin: adminData }
    });
});

module.exports = router;
