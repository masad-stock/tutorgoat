const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === "production" || process.env.EMAIL_USER) {
    // Production/Development email configuration
    if (process.env.EMAIL_SERVICE === "custom") {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
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
    // Development - using Ethereal Email for testing
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

const sendInquiryEmail = async (inquiry) => {
  try {
    const transporter = createTransporter();

    // Email to student (confirmation)
    const studentMailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tutorgoat.com",
      to: inquiry.contactEmail,
      subject: "Inquiry Received - TutorGoat",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Thank You for Your Inquiry!</h2>
          <p>Dear Student,</p>
          <p>We have received your tutoring inquiry and will review it shortly. Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Inquiry Details</h3>
            <p><strong>Inquiry ID:</strong> ${inquiry.inquiryId}</p>
            <p><strong>Course:</strong> ${inquiry.courseName}</p>
            <p><strong>Service Type:</strong> ${
              inquiry.serviceType.charAt(0).toUpperCase() +
              inquiry.serviceType.slice(1)
            }</p>
            <p><strong>Urgency:</strong> ${
              inquiry.urgency.charAt(0).toUpperCase() + inquiry.urgency.slice(1)
            }</p>
            <p><strong>Submitted:</strong> ${new Date(
              inquiry.createdAt
            ).toLocaleString()}</p>
          </div>

          <p>Our team will review your assignment and send you a personalized quote within 24 hours. We guarantee:</p>
          <ul>
            <li>✅ A or B Grade Guarantee</li>
            <li>✅ Premium Expert Assignment</li>
            <li>✅ Fast and Friendly Support</li>
            <li>✅ 100% Confidential</li>
          </ul>

          <p>If you have any questions, please reference your Inquiry ID: <strong>${
            inquiry.inquiryId
          }</strong></p>
          
          <p>Best regards,<br>The TutorGoat Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    // Email to internal team (new inquiry notification)
    const internalMailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tutorgoat.com",
      to:
        process.env.ADMIN_EMAIL ||
        process.env.EMAIL_USER ||
        "admin@tutorgoat.com",
      subject: `New Inquiry Received - ${inquiry.inquiryId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">New Tutoring Inquiry</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Inquiry Details</h3>
            <p><strong>Inquiry ID:</strong> ${inquiry.inquiryId}</p>
            <p><strong>Course:</strong> ${inquiry.courseName}</p>
            <p><strong>Service Type:</strong> ${
              inquiry.serviceType.charAt(0).toUpperCase() +
              inquiry.serviceType.slice(1)
            }</p>
            <p><strong>Urgency:</strong> ${
              inquiry.urgency.charAt(0).toUpperCase() + inquiry.urgency.slice(1)
            }</p>
            <p><strong>Contact Email:</strong> ${inquiry.contactEmail}</p>
            <p><strong>Submitted:</strong> ${new Date(
              inquiry.createdAt
            ).toLocaleString()}</p>
            <p><strong>Files Attached:</strong> ${
              inquiry.files.length
            } file(s)</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Assignment Details:</h4>
            <p style="white-space: pre-wrap;">${inquiry.assignmentDetails}</p>
          </div>

          ${
            inquiry.files.length > 0
              ? `
          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #0066cc; margin-top: 0;">Attached Files:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${inquiry.files
                .map(
                  (file) =>
                    `<li><strong>${file.originalName}</strong> (${(
                      file.fileSize / 1024
                    ).toFixed(1)} KB)</li>`
                )
                .join("")}
            </ul>
            <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
              <strong>Note:</strong> Files are stored on the server. Access the admin panel to download them.
            </p>
          </div>
          `
              : ""
          }

          <p><strong>Action Required:</strong> Please review this inquiry and send a quote to the student within 24 hours.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/admin" 
               style="background-color: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Access Admin Panel
            </a>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(studentMailOptions);
    await transporter.sendMail(internalMailOptions);

    console.log(`Inquiry emails sent for ${inquiry.inquiryId}`);
    return true;
  } catch (error) {
    console.error("Error sending inquiry emails:", error);
    throw error;
  }
};

const sendQuoteEmail = async (inquiry, quoteAmount, paymentLink) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tutorgoat.com",
      to: inquiry.contactEmail,
      subject: `Your Quote - ${inquiry.inquiryId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Your Personalized Quote</h2>
          <p>Dear Student,</p>
          <p>Thank you for your inquiry. We have reviewed your assignment and prepared a personalized quote for you.</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h3 style="color: #27ae60; margin-top: 0;">Your Quote</h3>
            <p style="font-size: 24px; font-weight: bold; color: #27ae60;">$${quoteAmount}</p>
            <p><strong>Inquiry ID:</strong> ${inquiry.inquiryId}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">What's Included:</h3>
            <ul>
              <li>✅ A or B Grade Guarantee (Full refund if not achieved)</li>
              <li>✅ Premium Expert Assignment</li>
              <li>✅ Fast and Friendly Support</li>
              <li>✅ 100% Confidential</li>
              <li>✅ Unlimited Revisions</li>
              <li>✅ Plagiarism-Free Work</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" 
               style="background-color: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Pay Now & Get Started
            </a>
          </div>

          <p><strong>Payment is 100% secure and anonymous.</strong> We accept all major credit cards and PayPal.</p>
          
          <p>If you have any questions about this quote, please contact us with your Inquiry ID: <strong>${inquiry.inquiryId}</strong></p>
          
          <p>Best regards,<br>The TutorGoat Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Quote email sent for ${inquiry.inquiryId}`);
    return true;
  } catch (error) {
    console.error("Error sending quote email:", error);
    throw error;
  }
};

const sendStatusUpdateEmail = async (inquiry, newStatus, oldStatus) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tutorgoat.com",
      to: inquiry.contactEmail,
      subject: `Inquiry Status Update - ${inquiry.inquiryId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Inquiry Status Update</h2>
          <p>Dear Student,</p>
          <p>Your inquiry status has been updated:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Status Change</h3>
            <p><strong>Inquiry ID:</strong> ${inquiry.inquiryId}</p>
            <p><strong>Course:</strong> ${inquiry.courseName}</p>
            <p><strong>Previous Status:</strong> ${oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1)}</p>
            <p><strong>New Status:</strong> ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</p>
            <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
          </div>

          ${newStatus === "quoted" ? `
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Quote Sent:</strong> A personalized quote has been sent to your email. Please check your inbox for details.</p>
          </div>
          ` : ""}

          ${newStatus === "completed" ? `
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Work Completed:</strong> Your assignment has been completed. Please contact us if you have any questions.</p>
          </div>
          ` : ""}

          <p>If you have any questions about this status update, please contact us with your Inquiry ID: <strong>${inquiry.inquiryId}</strong></p>
          
          <p>Best regards,<br>The TutorGoat Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent for ${inquiry.inquiryId}`);
    return true;
  } catch (error) {
    console.error("Error sending status update email:", error);
    throw error;
  }
};

module.exports = {
  sendInquiryEmail,
  sendQuoteEmail,
  sendStatusUpdateEmail,
};
