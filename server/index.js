/*******************************************************
 *      Server Starts From Here                        *
 *******************************************************/
"use strict";

require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDatabase } = require("./helper/database.helper");
const port = process.env.PORT || 4000;
const env = process.env.ENV || "Development";
const server = http.createServer(app);

app.set("PORT_NUMBER", port);

//  Start the app on the specific interface (and port).
server.listen(port, async () => {
  const data = new Date();
  console.log("|--------------------------------------------");
  console.log("| Environment  : " + env);
  console.log("| Port         : " + port);
  console.log("| Date         : " + data.toJSON().split("T").join(" "));
  console.log("|--------------------------------------------");
  
  // Connect to MongoDB
  await connectDatabase();
  
  console.log("|--------------------------------------------");
  console.log("| Server is running successfully! ");
});

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});

module.exports = server;
