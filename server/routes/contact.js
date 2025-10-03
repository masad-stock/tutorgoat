const express = require("express");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const router = express.Router();

// Create transporter for contact emails
const createContactTransporter = () => {
  if (process.env.EMAIL_USER) {
    if (process.env.EMAIL_SERVICE === "custom") {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  } else {
    // Fallback to ethereal for testing
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }
};

// Validation middleware
const validateContact = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("subject")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5 and 200 characters"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Message must be between 10 and 2000 characters"),
];

// POST /api/contact - Submit contact form
router.post("/", validateContact, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, subject, message } = req.body;

    // Create transporter
    const transporter = createContactTransporter();

    // Email to admin (contact form submission)
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tutorgoat.com",
      to:
        process.env.ADMIN_EMAIL ||
        process.env.EMAIL_USER ||
        "admin@tutorgoat.com",
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Contact Form Submission</h2>
          <p>You have received a new message through the contact form on your website.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Message:</h4>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p><strong>Action Required:</strong> Please respond to this inquiry as soon as possible.</p>
          
          <p>You can reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    };

    // Email to customer (confirmation)
    const customerMailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tutorgoat.com",
      to: email,
      subject: "Thank you for contacting TutorGoat",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Thank You for Contacting Us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 24 hours.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Your Message</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 5px;">${message}</p>
          </div>

          <p>In the meantime, feel free to:</p>
          <ul>
            <li>✅ Browse our services and pricing</li>
            <li>✅ Submit a quote request for academic help</li>
            <li>✅ Check out our FAQ section</li>
          </ul>
          
          <p>Best regards,<br>The TutorGoat Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(customerMailOptions);

    console.log(`Contact form emails sent from ${email}`);

    res.status(200).json({
      success: true,
      message:
        "Message sent successfully! We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error("Error sending contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
