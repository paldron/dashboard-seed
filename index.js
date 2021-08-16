const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const redis = require("redis");
const publisher = redis.createClient("redis://127.0.0.1:7071");
const subscriber = redis.createClient("redis://127.0.0.1:7071");
const db = require("./models"); // Contains DB configurations and Reference date default settings
global.db = db;
subscriber.del("SaReadings");
subscriber.del("Revenue");
global.publisher = publisher;
global.subscriber = subscriber;

// When no database connection is availble use "sample" as data set
// otherwise make sure your database is online and query statements are updated accordingly
global.dataMode = "db";

const errorHandler = require("./handlers/error");
const initializerRoutes = require("./routes/initializer");
const dashboardRoutes = require("./routes/dashboard");

const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

app.use("/api/initializer", initializerRoutes);

app.use("/api/dashboard", dashboardRoutes);

// Open this section on production
app.use(express.static(path.join(__dirname, "build")));

app.get("/*", function (req, res) {
  // The * supports client side routing
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

app.listen(PORT, function () {
  console.log(`Server is starting on port ${PORT}`);
});
