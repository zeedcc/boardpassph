import { sendRecoveryEmail } from '../lib/recovery-email.mjs';

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

    await sendRecoveryEmail(recipient_email, otp);
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Recovery email delivery failed', error);
    const message = error instanceof Error ? error.message : 'Could not send recovery email.';
    return res.status(500).json({ error: message });
  }
};

export default handler;
