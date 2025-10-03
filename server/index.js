const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const inquiryRoutes = require("./routes/inquiry");
const contactRoutes = require("./routes/contact");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const healthRoutes = require("./routes/health");
const { connectDB } = require("./config/database");
const {
  apiLimiter,
  formLimiter,
  securityHeaders,
  sanitizeInput,
} = require("./middleware/security");

const app = express();

// Configure CORS with preflight support
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Security headers
app.use(securityHeaders);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (important for development)
app.set("trust proxy", 1);

// Security middleware
app.use(securityHeaders);
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
app.use("/api/", apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Input sanitization
app.use(sanitizeInput);

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inquiry", formLimiter, inquiryRoutes);
app.use("/api/contact", formLimiter, contactRoutes);
app.use("/api/admin", adminRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join admin room for real-time updates
  socket.on("join-admin", () => {
    socket.join("admin");
    console.log("Admin joined:", socket.id);
  });

  // Handle inquiry status updates
  socket.on("status-update", (data) => {
    socket.to("admin").emit("inquiry-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
