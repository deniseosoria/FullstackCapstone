/// Required Imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { client } = require("./db/db.js");

// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

//  CORS Setup for Frontend Access
app.use(
  cors({
    origin: ["http://localhost:5173"], // Frontend origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

const multer = require("multer");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports.upload = upload; // Export to use in your event routes


//  Serve Static Files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));


//  Mount API Routes
const api = require("./api/index.js");
app.use("/api", api);

//  Serve Client for Production Builds (if using Vite/React)
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);
app.use(
  "/assets",
  express.static(path.join(__dirname, "../client/dist/assets"))
);

//  Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(" Error:", err);
  res.status(err.status || 500).send({
    name: err.name || "ServerError",
    message: err.message || "An unexpected error occurred.",
  });
});

//  Init & Listen
const init = async () => {
  const port = process.env.PORT || 3001;
  try {
    await client.connect();
    app.listen(port, () => {
      console.log(` Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error(" Failed to start server:", err);
  }
};

init();
