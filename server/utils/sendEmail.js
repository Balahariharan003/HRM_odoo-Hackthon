const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development JSON transporter
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporter;
};

const sendEmail = async (to, subject, html) => {
  try {
    const transport = getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"DayFlow HRMS" <noreply@dayflow.com>',
      to,
      subject,
      html,
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[Email Delivered] To: ${to} | Subject: "${subject}"`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return null;
  }
};

const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const subject = 'DayFlow HRMS - Verify Your Email';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4F46E5;">Welcome to DayFlow HRMS!</h2>
      <p>Please click the button below to verify your email address and activate your account:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Verify Email</a>
      <p style="font-size: 12px; color: #666;">Or copy and paste this link in your browser:</p>
      <p style="font-size: 12px; color: #4F46E5; word-break: break-all;">${verificationUrl}</p>
    </div>
  `;

  return sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};
