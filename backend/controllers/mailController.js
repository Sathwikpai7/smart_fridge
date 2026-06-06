
const transporter = require("../config/mail");
const emailQueue = require("../queues/emailQueue");

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
    await emailQueue.add("sendEmail",{
      from: 'sathwik11112005@gmail.com',
      to: 'sathwik11112005@gmail.com',
      subject: 'Smart Fridge Test',
      text: 'Email system working'
    });
   
   // without the bull mq  user directly sends the acess to express server to send mail
   //Request comes
   //   ↓
   //Server sends mail directly
    //   ↓
     //Server waits until mail completes
 //     ↓
    //Then response sent
    

   

    res.send("Email added to queue");

  } catch (err) {

    console.log(err);

    res.send("Mail failed");

  }

};


module.exports = {
    sendMail, 
    testMail
};