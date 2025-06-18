const nodemailer = require('nodemailer');
// dotenv.config() is already called in index.js, so it's not needed here.

const sendOtpEmail = async (toEmail, otp) => {
  // For production, it's recommended to use environment variables for all SMTP settings
  // to easily switch email providers (e.g., SendGrid, AWS SES, Mailgun).
  // Example .env variables:
  // EMAIL_HOST=smtp.example.com
  // EMAIL_PORT=587
  // EMAIL_SECURE=false (true for port 465, false for 587/TLS)
  // EMAIL_USER=your-email-username
  // EMAIL_PASS=your-email-password-or-api-key

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com' or your transactional email provider's host
    port: parseInt(process.env.EMAIL_PORT || '587', 10), // Default to 587 if not specified
    secure: process.env.EMAIL_SECURE === 'true', // true for 465 (SSL), false for other ports (TLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Optional: for self-signed certs or local SMTP, though usually not needed for major providers
    // tls: { rejectUnauthorized: false }
  });

 const mailOptions = {
  from: `"iNotebookPro Support" <${process.env.EMAIL_USER}>`,
  to: toEmail,
  subject: 'Your OTP Code for iNotebookPro Password Reset',

  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #4A90E2;">iNotebookPro Password Reset</h2>
        <p>Hi there,</p>
        <p>We received a request to reset the password for your <strong>iNotebookPro</strong> account.</p>
        <p>Please use the OTP below to proceed with resetting your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #333; background-color: #f0f0f0; padding: 10px 20px; border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
        <hr style="margin: 30px 0;">
        <p style="font-size: 14px; color: #777;">
          Regards,<br>
          <strong>The iNotebookPro Team</strong><br>
          <em>This is an automated message, please do not reply.</em>
        </p>
      </div>
    </div>
  `,
};

  try {
    // transporter.verify() can be useful for initial setup checks or diagnostics,
    // but calling it before every email in production might add unnecessary overhead.
    // Consider calling it once on app startup or conditionally.
    // const isVerified = await transporter.verify();
    // console.log("✅ SMTP Transporter Verified:", isVerified);

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendOtpEmail;
