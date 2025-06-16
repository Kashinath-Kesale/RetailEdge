const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Validate environment variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_HOST || !process.env.SMTP_PORT) {
      throw new Error("SMTP configuration incomplete. Please check your .env file.");
    }

    console.log("Creating email transporter...");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // false for TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
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
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error in sendEmail utility:", error);
    if (error.code === 'EAUTH') {
      throw new Error("Email authentication failed. Please check your SMTP credentials.");
    } else if (error.code === 'ESOCKET') {
      throw new Error("Network error while sending email. Please check your internet connection.");
    }
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;