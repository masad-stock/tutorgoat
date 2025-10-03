const axios = require("axios");

async function testInquiryAPI() {
  try {
    const response = await axios.post("http://localhost:5000/api/inquiry", {
      courseName: "Test Course",
      assignmentDetails: "Test assignment details for admin panel verification",
      contactEmail: "test@example.com",
      serviceType: "assignment",
      urgency: "normal",
      clientType: "first-time",
      phoneNumber: "1234567890",
      name: "Test User",
    });
    console.log("API Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("API Error Response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

testInquiryAPI();
