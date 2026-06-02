const express = require("express");
const transporter = require("../config/mail");
const router = express.Router();

const {
  testMail,
  sendMail
} = require("../controllers/mailController");



router.get('/',testMail)// testing purpose only 


router.post('/',sendMail)


module.exports = router;