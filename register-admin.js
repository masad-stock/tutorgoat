const axios = require("axios");

async function registerAdmin() {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/register", {
      username: "admin",
      email: "admin@tutorgoat.com",
      password: "admin123",
      role: "ADMIN",
    });
    console.log("Admin registered successfully:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Registration failed:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

registerAdmin();
