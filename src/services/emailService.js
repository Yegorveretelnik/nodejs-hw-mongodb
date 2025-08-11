import nodemailer from 'nodemailer';
import process from 'process';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendResetPasswordEmail = async (toEmail, resetLink) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Password Reset Request',
    html: `<p>To reset your password, please click on the link below:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link will expire in 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
