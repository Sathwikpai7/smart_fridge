const cron = require("node-cron");

const FoodItem = require("../models/FoodItem");
const Settings = require("../models/Settings");
const transporter = require("../config/mail");

cron.schedule("0 8 * * *", async () => {// 8 in the morning
  console.log("Running daily expiry check...");

  try {
    const settings = await Settings.findOne();

    if (!settings || !settings.email) {
      console.log("No email configured");
      return;
    }

    const today = new Date();

    const twoDaysLater = new Date();
    twoDaysLater.setDate(today.getDate() + 2);

    const items = await FoodItem.find();

    const expiringItems = items.filter((item) => {
      const expiry = new Date(item.expiryDate);

      return expiry <= twoDaysLater;
    });

    if (expiringItems.length === 0) {
      console.log("No expiring items");
      return;
    }

    let message = "These items are expiring soon:\n\n";

    expiringItems.forEach((item) => {
      message += `- ${item.name} expires on ${item.expiryDate}\n`;
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: settings.email,
      subject: "Smart Fridge Expiry Alert",
      text: message,
    });
    console.log(message);
    console.log("Expiry email sent");
  } catch (err) {
    console.error(err);
  }
});