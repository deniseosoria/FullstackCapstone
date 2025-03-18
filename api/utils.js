// Import required modules
const jwt = require("jsonwebtoken"); // JWT library for verifying and decoding tokens
const { getUserById } = require("../db"); // Function to fetch a user by ID from the database

// Load environment variables from .env file
require('dotenv').config({ path: "./.env" });

/**
 * Middleware: requireUser
 * This function checks if the user is authenticated using a JWT token.
 * If valid, it attaches the user to `req.user` and allows the request to proceed.
 * If invalid or missing, it returns a 401 Unauthorized error.
 */
async function requireUser(req, res, next) {
  // Get the Authorization header from the incoming request
  const authHeader = req.headers.authorization;

  // Step 1: Check if Authorization header is missing or incorrectly formatted
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No valid token provided" });
  }

  // Step 2: Extract the JWT token (remove "Bearer " prefix)
  const token = authHeader.replace("Bearer ", "");

  try {
    // Step 3: Verify the JWT token using the secret key
    const payload = jwt.verify(token, process.env.JWT_SECRET || "shhh");

    // Step 4: Fetch user details from the database using the token's payload (user ID)
    const user = await getUserById(payload.id);

    // If the user does not exist, return an Unauthorized error
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Step 5: Attach user details to `req.user`
    req.user = user;

    // Step 6: Move to the next middleware or route
    next();
  } catch (error) {
    // If JWT verification fails (expired or tampered token), return an error
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}

// Export the middleware function for use in other parts of the API
module.exports = { requireUser };