
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

const testMail= async (req, res) => {

  try {

    await transporter.sendMail({
      from: 'sathwik11112005@gmail.com',
      to: 'sathwik11112005@gmail.com',
      subject: 'Smart Fridge Test',
      text: 'Email system working'
    });

    console.log("Test mail sent");

    res.send("Mail sent successfully");

  } catch (err) {

    console.log(err);

    res.send("Mail failed");

  }

};


module.exports = {
    sendMail, 
    testMail
};