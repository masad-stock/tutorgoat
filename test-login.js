const axios = require("axios");

async function testAdminLogin() {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email: "admin@tutorgoat.com",
    password: "admin123",
    });
    console.log("Login successful:", response.data.message);
  } catch (error) {
    if (error.response) {
      console.error("Login failed:", error.response.data.message);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testAdminLogin();
