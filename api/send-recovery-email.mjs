import nodemailer from 'nodemailer';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { recipient_email, otp } = body || {};

    if (!recipient_email || !otp) {
      return res.status(400).json({ error: 'recipient_email and otp are required.' });
    }

    const sender = process.env.MY_EMAIL;
    const password = process.env.MY_PASSWORD;

    if (!sender || !password) {
      console.error('Missing MY_EMAIL or MY_PASSWORD environment variables.');
      return res.status(500).json({ error: 'Email delivery is not configured. Please contact support.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: sender,
        pass: password,
      },
    });

    const mailConfigs = {
      from: sender,
      to: recipient_email,
      subject: 'BoardPassPH Password Recovery OTP',
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>BoardPassPH Password Recovery</title>
</head>
<body style="margin:0;padding:0;background:#071517;font-family:Inter,system-ui,sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;background:#071517;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(15,23,42,0.35);">
          <tr>
            <td style="padding:32px 32px 16px; background:linear-gradient(135deg,#14b8a6,#06b6d4);">
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#f8fafc;">BoardPassPH</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(248,250,252,0.8);">Password recovery request received.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 24px;color:#e2e8f0;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hi,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#cbd5e1;">Use the one-time code below to reset your BoardPassPH password. The OTP is valid for 5 minutes.</p>
              <div style="display:inline-block;padding:20px 28px;border-radius:18px;background:#0f172a;border:1px solid rgba(56,189,248,0.15);font-size:28px;font-weight:800;letter-spacing:0.15em;color:#38bdf8;">${otp}</div>
              <p style="margin:28px 0 0;font-size:14px;color:rgba(248,250,252,0.75);">If you did not request a password reset, you can safely ignore this message.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 32px;background:#020617;color:#94a3b8;font-size:13px;line-height:1.6;">
              <p style="margin:0;">BoardPassPH · Philippine Board Review</p>
              <p style="margin:8px 0 0;">Need help? Reply to this email or visit the BoardPassPH app.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    };

    await transporter.sendMail(mailConfigs);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Recovery email delivery failed', error);
    return res.status(500).json({ error: 'Could not send recovery email.' });
  }
};

export default handler;
