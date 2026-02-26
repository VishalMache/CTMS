// ============================================================
// CPMS – Email Config (src/config/email.js)
// Nodemailer + Gmail SMTP transporter
// ============================================================

const nodemailer = require('nodemailer');

// ── Create reusable transporter ──────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

/**
 * Send an email.
 * @param {Object} options
 * @param {string|string[]} options.to        - Recipient(s)
 * @param {string}          options.subject   - Email subject
 * @param {string}          options.html      - HTML body
 * @param {string}          [options.text]    - Plain-text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
    const mailOptions = {
        from: `"CPMS – Placement Cell" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
        text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Sent:', info.messageId);
    return info;
};

/**
 * Build a styled HTML email body.
 * @param {string} title
 * @param {string} body   - Inner HTML content
 */
const buildEmailHtml = (title, body) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f8fafc; color: #334155; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px;
                 border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d9488, #10b981); padding: 32px 24px; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 24px; }
    .footer { background: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>📋 ${title}</h1></div>
    <div class="body">${body}</div>
    <div class="footer">CPMS – College Placement Management System &bull; Do not reply to this email.</div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, buildEmailHtml };
