const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Log environment variables (without sensitive data)
    console.log("Email Configuration:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.EMAIL_FROM,
      hasPassword: !!process.env.SMTP_PASS
    });

    // Validate environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      throw new Error("SMTP configuration incomplete. Please check your .env file.");
    }

    console.log("Creating email transporter...");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      },
      debug: true, // Enable debug logging
      logger: true // Enable logger
    });

    // Verify transporter configuration
    console.log("Verifying SMTP connection...");
    await transporter.verify();
    console.log("SMTP connection verified successfully");

    // Clean up HTML content to ensure proper URL formatting
    const cleanHtml = html.replace(/@https:\//g, 'https://');

    const mailOptions = {
      from: `"RetailEdge" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: cleanHtml,
    };

    console.log("Sending email to:", to);
    console.log("Email content preview:", cleanHtml.substring(0, 200) + "...");
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected
    });
    return info;
  } catch (error) {
    console.error("Error in sendEmail utility:", {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    
    if (error.code === 'EAUTH') {
      throw new Error("Email authentication failed. Please check your SMTP credentials.");
    } else if (error.code === 'ESOCKET') {
      throw new Error("Network error while sending email. Please check your internet connection.");
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error("Email sending timed out. Please try again later.");
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;