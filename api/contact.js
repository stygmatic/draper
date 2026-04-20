const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, company, email, role, message, intent } = req.body;

  if (!name || !email || !company) {
    return res.status(400).json({ error: 'Name, email, and company are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const subject = intent === 'sponsor'
    ? `Headline Sponsor Inquiry — ${company}`
    : `Co-Host Inquiry — ${company}`;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem;background:#050a12;color:#e8eaf0;border-radius:8px;">
      <h2 style="color:#c9a84c;margin-bottom:1.5rem;">New Inquiry — Deep Tech & Dual Use Mixer</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:0.5rem 0;color:#7a8499;width:120px;">Type</td><td style="color:#fff;font-weight:600;">${intent === 'sponsor' ? 'Headline Sponsor' : 'Co-Host Partner'}</td></tr>
        <tr><td style="padding:0.5rem 0;color:#7a8499;">Name</td><td style="color:#fff;">${name}</td></tr>
        <tr><td style="padding:0.5rem 0;color:#7a8499;">Company</td><td style="color:#fff;">${company}</td></tr>
        <tr><td style="padding:0.5rem 0;color:#7a8499;">Email</td><td style="color:#fff;"><a href="mailto:${email}" style="color:#c9a84c;">${email}</a></td></tr>
        <tr><td style="padding:0.5rem 0;color:#7a8499;">Role</td><td style="color:#fff;">${role || '—'}</td></tr>
      </table>
      ${message ? `<div style="margin-top:1.5rem;padding:1rem;background:rgba(255,255,255,0.05);border-radius:4px;border-left:2px solid #c9a84c;"><p style="color:#7a8499;margin:0 0 0.5rem;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.1em;">Message</p><p style="margin:0;color:#e8eaf0;">${message}</p></div>` : ''}
      <p style="margin-top:2rem;font-size:0.8rem;color:#7a8499;">Sent via draper-mixer.vercel.app</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Draper Mixer <onboarding@resend.dev>',
      to: ['meddybayed@gmail.com'],
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || JSON.stringify(error) });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend exception:', err);
    return res.status(500).json({ error: 'Failed to send. Please try again or email us directly.' });
  }
};
