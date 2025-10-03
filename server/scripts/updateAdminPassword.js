const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
require("dotenv").config();

const updateAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/tutorgoat"
    );
    console.log("Connected to MongoDB");

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("@Kukumfalme2023", salt);

    // Update password directly
    const result = await Admin.findOneAndUpdate(
      { email: "admin@tutorgoat.com" },
      { password: hashedPassword },
      { new: true }
    );

    if (!result) {
      console.log("Admin not found");
      process.exit(1);
    }

    console.log("Admin password updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin password:", error);
    process.exit(1);
  }
};

updateAdminPassword();
