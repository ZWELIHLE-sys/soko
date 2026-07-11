import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await transporter.sendMail({
    from:    `"Vuna" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset your Vuna password',
    html: `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;background:#FAFAF9;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="background:#7C2D12;color:#FEF3C7;font-size:22px;font-weight:900;
                      width:44px;height:44px;border-radius:8px;display:inline-flex;
                      align-items:center;justify-content:center;">V</div>
          <div style="font-size:20px;font-weight:700;color:#1C0A00;margin-top:8px;">Vuna</div>
        </div>
        <h2 style="font-size:18px;color:#1C0A00;margin-bottom:8px;">Hi ${name},</h2>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
          We received a request to reset your Vuna password. Click the button below to choose a new password.
          This link expires in <strong>1 hour</strong>.
        </p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${resetUrl}"
             style="background:#7C2D12;color:#FEF3C7;text-decoration:none;padding:14px 32px;
                    border-radius:8px;font-size:15px;font-weight:600;display:inline-block;">
            Reset My Password
          </a>
        </div>
        <p style="color:#9CA3AF;font-size:12px;line-height:1.5;">
          If you did not request a password reset, you can safely ignore this email. Your password will not change.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
        <p style="color:#9CA3AF;font-size:11px;text-align:center;">
          Vuna &mdash; Where Local Is Celebrated And Cherished &mdash; Umzila-AfriRoute
        </p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from:    `"Vuna" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verify your Vuna account',
    html: `
      <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;background:#FAFAF9;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="background:#7C2D12;color:#FEF3C7;font-size:22px;font-weight:900;
                      width:44px;height:44px;border-radius:8px;display:inline-flex;
                      align-items:center;justify-content:center;">V</div>
          <div style="font-size:20px;font-weight:700;color:#1C0A00;margin-top:8px;">Vuna</div>
        </div>
        <h2 style="font-size:18px;color:#1C0A00;margin-bottom:8px;">Hi ${name},</h2>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
          Welcome to Vuna! Enter the code below to verify your email address and activate your account.
        </p>
        <div style="background:#7C2D12;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:36px;font-weight:900;letter-spacing:10px;color:#FEF3C7;">${otp}</div>
          <div style="font-size:12px;color:#A8A29E;margin-top:8px;">This code expires in 15 minutes</div>
        </div>
        <p style="color:#9CA3AF;font-size:12px;line-height:1.5;">
          If you did not create a Vuna account, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
        <p style="color:#9CA3AF;font-size:11px;text-align:center;">
          Vuna &mdash; Where Local Is Celebrated And Cherished &mdash; Umzila-AfriRoute
        </p>
      </div>
    `,
  })
}
