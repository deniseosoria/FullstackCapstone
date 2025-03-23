const { PORT = 5000 } = process.env;
const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path"); //  Import path for serving static files
const cors = require('cors');

//  Import API Router
const apiRouter = require("./api");

// // Middleware Setup
// server.use(cors());


server.use(bodyParser.json()); // Parse JSON bodies
server.use(morgan("dev")); // Log requests

//  Body Logger Middleware
server.use(express.json()); // Make sure JSON body parsing is enabled


//  Serve uploaded images statically
server.use("/uploads", express.static("uploads"));

//  Register API Router
server.use("/api", apiRouter);

//  Static File Serving (for Deployment)
server.use(express.static(path.join(__dirname, "../client/dist"))); // Adjust path based on build location

//  Ensure React/Vue frontend handles routing
server.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});



//  Global 404 Handler (Must Be Placed Last)
server.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

//  Global Error Handler
server.use((error, req, res, next) => {
  console.error(" ERROR:", error);
  res.status(500).json({
    name: error.name,
    message: error.message,
  });
});

//  Start Server
server.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});
