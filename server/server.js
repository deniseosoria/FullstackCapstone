/// Required Imports
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { client } = require("./db/db.js");

// Initialize App
const app = express();

// Middleware
app.use(express.json());

// Parse JSON bodies
app.use(bodyParser.json()); 

// Middleware for printing information + errors:
app.use(require("morgan")("dev"));

app.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");

  next();
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://fullstackcapstone-1.onrender.com"
    ],
    credentials: true,
  })
);

//  Serve Uploaded Files
// app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

//  Mount API Routes
const api = require("./api/index.js");
app.use("/api", api);

app.get("/", (req, res) => {
  res.send("✅ Backend is live!");
});


//  Serve Frontend (for production builds if using Vite or similar)
// app.get("/", (req, res) =>
//   res.sendFile(path.join(__dirname, "../client/dist/index.html"))
// );
// app.use(
//   "/assets",
//   express.static(path.join(__dirname, "../client/dist/assets"))
//);


app.use((err, req, res, next) => {
  console.error("🔥 Global Error Handler:", err.stack || err.message || err);
  res.status(err.status || 500).send({
    name: err.name || "ServerError",
    message: err.message || "Something went wrong on the server.",
  });
});

//  Start the Server
const init = async () => {
  const port = process.env.PORT || 10000;
  try {
    await client.connect();
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  } catch (err) {
    console.error(" Failed to start server:", err);
  }
};

init();
