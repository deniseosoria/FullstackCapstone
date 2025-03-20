/** Middleware and Listening Functionality */

// Functon imports:
const { client } = require("./db/db.js");

// Express imports:
const express = require("express");
const app = express();

// JSON parser:
app.use(express.json());

// Middleware for printing information + errors:
app.use(require("morgan")("dev"));

// Middleware for linking frontend to backend:
const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:5173"],
    method: "GET, POST, PUT, PATCH, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);
// BTW: double-quote strings aren't accepted as JSONs, so on line 20, you have to use single quotes

const api = require("./api/index.js");
app.use("/api", api);

//For deployment only:
const path = require("path");
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../client/dist/index.html"))
);
app.use(
  "/assets",
  express.static(path.join(__dirname, "../client/dist/assets"))
);

/**This little function produces a lovely print out of any error messages thrown by
 * any of the callback functions. It makes an object displayed in the console that
 * you can also grab and display on the client side:
 */
app.use((err, req, res, next) => {
  console.log(err);
  res
    .status(err.status || 500)
    .send({ error: err.message ? err.message : err });
});

// Init function declaration:
const init = async () => {
  // Client connection and port creation:
  const port = process.env.PORT || 3001;
  await client.connect();
  console.log("connected to database");

  //Setting listening functionality:
  app.listen(port, () => console.log(`listening on port ${port}`));
};

// Init function invocation:
init();
