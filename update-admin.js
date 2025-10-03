const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./server/models/Admin");

async function updateAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tutorgoat");

    // Find the admin
    const admin = await Admin.findOne({ email: "admin@tutorgoat.com" });

    if (!admin) {
      console.log("Admin not found, creating new admin...");
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      const newAdmin = new Admin({
        username: "admin",
        email: "admin@tutorgoat.com",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
        permissions: {
          canViewInquiries: true,
          canEditInquiries: true,
          canDeleteInquiries: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canManageSettings: true,
        },
        passwordBreached: false,
      });
      await newAdmin.save();
      console.log("Admin created successfully");
    } else {
      console.log("Admin found, updating...");
      admin.password = "admin123"; // Let the pre-save hook hash it
      admin.role = "ADMIN";
      admin.isActive = true;
      admin.permissions = {
        canViewInquiries: true,
        canEditInquiries: true,
        canDeleteInquiries: true,
        canManageUsers: true,
        canViewAnalytics: true,
        canManageSettings: true,
      };
      admin.passwordBreached = false;
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
      console.log("Admin updated successfully");
    }

    console.log("Admin details:");
    console.log("- Email: admin@tutorgoat.com");
    console.log("- Password: admin123");
    console.log("- Role: ADMIN");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdmin();
