// utils/email.js
const nodemailer = require('nodemailer');
const logger = require('./logger'); // Optional for better logging

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.SMTP_PORT || 2525,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "fed575c3698283",
    pass: process.env.SMTP_PASS || "****748b" // Replace with actual password
  },
  tls: {
    rejectUnauthorized: false // For development only (remove in production)
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"TruckHub" <no-reply@truckhub.com>',
      to: options.email,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email failed to ${options.email}:`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = { sendEmail, transporter };