import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendCredentialsMail = async ({ to, role, email, password }) => {
  const roleLabel = role === "student" ? "Student" : "Staff";
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `PlaceMate – Your ${roleLabel} Account Credentials`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#002D62;margin-bottom:4px;">Welcome to PlaceMate</h2>
        <p style="color:#64748b;font-size:13px;margin-bottom:20px;">Your ${roleLabel.toLowerCase()} account has been created by the admin.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#334155;">Email</td>
            <td style="padding:8px 12px;border:1px solid #e2e8f0;color:#0f172a;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;font-weight:600;color:#334155;">Password</td>
            <td style="padding:8px 12px;border:1px solid #e2e8f0;color:#0f172a;">${password}</td>
          </tr>
        </table>
        <p style="color:#94a3b8;font-size:11px;margin-top:20px;">Please change your password after logging in for the first time.</p>
      </div>
    `,
  });
};
