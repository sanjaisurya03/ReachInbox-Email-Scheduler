import nodemailer from "nodemailer";

const smtpHost = process.env.ETHEREAL_HOST;
const smtpPort = Number(process.env.ETHEREAL_PORT || 587);
const smtpUser = process.env.ETHEREAL_USER;
const smtpPass = process.env.ETHEREAL_PASS;
const emailFrom = process.env.EMAIL_FROM;

if (!smtpHost || !smtpUser || !smtpPass || !emailFrom) {
  throw new Error("Ethereal SMTP environment variables are missing");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export interface SendEmailInput {
  recipient: string;
  subject: string;
  body: string;
}

export async function sendEmail({
  recipient,
  subject,
  body,
}: SendEmailInput) {
  const result = await transporter.sendMail({
    from: emailFrom,
    to: recipient,
    subject,
    text: body,
  });

  return {
    messageId: result.messageId,
    previewUrl: nodemailer.getTestMessageUrl(result),
  };
}