/// Required Imports
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { client } = require("./db/db.js");

// Initialize App
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// CORS Setup for Frontend Access
app.use(
  cors({
    origin: ["http://localhost:5173"], // Adjust if your frontend is hosted elsewhere
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/// Multer Storage for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Optional: Restrict to images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed."));
  }
};

// 5MB max file size
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

//  Export Multer to use in routers
module.exports.upload = upload;

//  Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

//  Mount API Routes
const api = require("./api/index.js");
app.use("/api", api);

//  Serve Frontend (for production builds if using Vite or similar)
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);
app.use(
  "/assets",
  express.static(path.join(__dirname, "../client/dist/assets"))
);

app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err.stack || err.message || err);
  res.status(err.status || 500).send({
    name: err.name || "ServerError",
    message: err.message || "Something went wrong on the server.",
  });
});



//  Start the Server
const init = async () => {
  const port = process.env.PORT || 3001;
  try {
    await client.connect();
    app.listen(port, () => {
      console.log(` Server listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(" Failed to start server:", err);
  }
};

init();
