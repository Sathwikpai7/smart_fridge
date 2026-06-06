// Load environment variables from backend/.env
// Worker runs inside /workers folder,
// so dotenv needs the correct relative path
require("dotenv").config({ path: "../.env" });
const { Worker } = require("bullmq");
const connection = require("../config/redis");
const transporter = require("../config/mail");

console.log(process.env.GMAIL_USER);
console.log(process.env.GMAIL_PASS);
const worker = new Worker(
  "emailQueue",
  async (job) => {
    try {

      console.log("================================");
      console.log("WORKER PICKED JOB");
      console.log("Job Name:", job.name);
      console.log("Job Data:", job.data);

      const { from, to, subject, text } = job.data;

      console.log("Before sendMail");

      await transporter.sendMail({
        from,
        to,
        subject,
        text,
      });

      console.log("MAIL SENT SUCCESSFULLY");
      console.log("================================");

    } catch (err) {

      console.log("WORKER ERROR");
      console.log(err);

    }
  },
  { connection }
);

console.log("Email worker started...");