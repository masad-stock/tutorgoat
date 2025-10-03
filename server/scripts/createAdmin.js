const mongoose = require("mongoose");
const Admin = require("../models/Admin");
require("dotenv").config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/tutorgoat"
    );
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@tutorgoat.com" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const admin = new Admin({
      username: "superadmin",
      email: "admin@tutorgoat.com",
      password: "admin123", // Change this in production!
      role: "super_admin",
      permissions: {
        canViewInquiries: true,
        canEditInquiries: true,
        canDeleteInquiries: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
      },
    });

    await admin.save();
    console.log("Super admin created successfully!");
    console.log("Email: admin@tutorgoat.com");
    console.log("Password: admin123");
    console.log(
      "⚠️  Please change the password immediately after first login!"
    );

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
