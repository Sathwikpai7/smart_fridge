
const transporter = require("../config/mail");

const sendMail=async (req, res) => {
  const { to, subject, text } = req.body;
  console.log('[Backend] /send-email called');
  console.log('[Backend] Sending email:', { to, subject });
  try {
    await transporter.sendMail({
      from: 'sathwik11112005@gmail.com',
      to,
      subject,
      text
    });
    console.log('[Backend] Email sent successfully to:', to);
    res.json({ success: true });
  } catch (err) {
    console.error('[Backend] Email send error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


module.exports = {
    sendMail
};