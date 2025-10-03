const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-super-secret-jwt-key-here";

console.log("JWT_SECRET loaded:", JWT_SECRET ? "Yes" : "No");
console.log("JWT_SECRET value:", JWT_SECRET);

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets must be defined in environment variables");
}

// Generate JWT tokens
const generateTokens = (admin) => {
  const payload = {
    id: admin._id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth failed: No token provided");
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token, JWT_SECRET);

    if (!decoded) {
      console.log("Auth failed: Invalid token");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.log("Decoded token:", decoded);

    // Check if admin still exists and is active
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      console.log("Auth failed: Admin not found, id:", decoded.id);
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    if (!admin.isActive) {
      console.log("Auth failed: Admin not active");
      return res.status(401).json({
        success: false,
        message: "Admin account deactivated",
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      console.log("Auth failed: Admin locked");
      return res.status(401).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed login attempts",
      });
    }

    console.log("Auth successful for admin:", admin.email, "role:", admin.role);
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Permission-based authorization
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
      });
    }

    next();
  };
};

// Rate limiting for auth endpoints
const authRateLimit = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generateTokens,
  verifyToken,
  authenticate,
  authorize,
  requirePermission,
  authRateLimit,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
};
