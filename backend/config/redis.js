const Redis = require("ioredis");
//  new ioredis is new version with max retires so do new redis this is better
const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
   maxRetriesPerRequest: null,//added for the sake of bull mq
});

connection.on("connect", () => {
  console.log("✅ Redis Connected");
});

connection.on("error", (err) => {
  console.log("❌ Redis Error:", err);
});

module.exports = connection;