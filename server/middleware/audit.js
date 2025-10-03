const AuditLog = require("../models/AuditLog");

// Get client IP address
const getClientIP = (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    "unknown"
  );
};

// Get user agent
const getUserAgent = (req) => {
  return req.headers["user-agent"] || "unknown";
};

// Audit logging middleware
const auditLog = (action, resource, getResourceId = null) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json;

    // Override res.json to capture response
    res.json = function (data) {
      // Log the action after response is sent
      setImmediate(async () => {
        try {
          if (req.admin) {
            const resourceId = getResourceId
              ? getResourceId(req)
              : req.params.id || null;

            await AuditLog.logAction({
              adminId: req.admin._id,
              adminUsername: req.admin.username,
              action,
              resource,
              resourceId,
              details: {
                method: req.method,
                url: req.originalUrl,
                body: req.body,
                query: req.query,
                response: {
                  success: data.success,
                  statusCode: res.statusCode,
                  message: data.message,
                },
              },
              ipAddress: getClientIP(req),
              userAgent: getUserAgent(req),
              success: res.statusCode < 400,
              errorMessage: res.statusCode >= 400 ? data.message : null,
            });
          }
        } catch (error) {
          console.error("Error in audit logging:", error);
        }
      });

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Special audit log for failed login attempts
const auditFailedLogin = async (email, ipAddress, userAgent, reason) => {
  try {
    await AuditLog.logAction({
      adminId: null,
      adminUsername: email,
      action: "failed_login",
      resource: "authentication",
      details: {
        email,
        reason,
      },
      ipAddress,
      userAgent,
      success: false,
      errorMessage: reason,
    });
  } catch (error) {
    console.error("Error logging failed login:", error);
  }
};

// Special audit log for successful login
const auditSuccessfulLogin = async (admin, ipAddress, userAgent) => {
  try {
    await AuditLog.logAction({
      adminId: admin._id,
      adminUsername: admin.username,
      action: "login",
      resource: "authentication",
      details: {
        email: admin.email,
        role: admin.role,
      },
      ipAddress,
      userAgent,
      success: true,
    });
  } catch (error) {
    console.error("Error logging successful login:", error);
  }
};

// Special audit log for logout
const auditLogout = async (admin, ipAddress, userAgent) => {
  try {
    await AuditLog.logAction({
      adminId: admin._id,
      adminUsername: admin.username,
      action: "logout",
      resource: "authentication",
      ipAddress,
      userAgent,
      success: true,
    });
  } catch (error) {
    console.error("Error logging logout:", error);
  }
};

// Special audit log for account lockout
const auditAccountLockout = async (admin, ipAddress, userAgent) => {
  try {
    await AuditLog.logAction({
      adminId: admin._id,
      adminUsername: admin.username,
      action: "account_locked",
      resource: "authentication",
      details: {
        reason: "Multiple failed login attempts",
        lockUntil: admin.lockUntil,
      },
      ipAddress,
      userAgent,
      success: false,
      errorMessage: "Account locked due to multiple failed login attempts",
    });
  } catch (error) {
    console.error("Error logging account lockout:", error);
  }
};

module.exports = {
  auditLog,
  auditFailedLogin,
  auditSuccessfulLogin,
  auditLogout,
  auditAccountLockout,
  getClientIP,
  getUserAgent,
};
