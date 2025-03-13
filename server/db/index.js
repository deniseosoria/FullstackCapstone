const { Client } = require("pg"); // imports the pg module
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

require("dotenv").config({ path: "./.env" });

const client = new Client({
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), // Ensure it's a string
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * USER Methods
 */

// Create a new user
async function createUser({ name, username, password, location, picture }) {
    try {
      console.log("Inside createUser - received:", { name, username, password, location, picture });
  
      if (!password) {
        throw new Error("Password is missing in createUser");
      }
  
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      console.log("Hashed password:", hashedPassword);
  
      const { rows: [user] } = await client.query(
        `INSERT INTO users (name, username, password, location, picture)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *;`,
        [name, username, hashedPassword, location, picture]
      );
  
      console.log("User created:", user);
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `UPDATE users SET ${setString} WHERE id=$${
        Object.keys(fields).length + 1
      } RETURNING *;`,
      [...Object.values(fields), id]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
    try {
      const { rows } = await client.query(`
        SELECT id, name, username, location 
        FROM users;
      `);
    
      return rows;
    } catch (error) {
      throw error;
    }
  }

// Get user by username (for login)
const getUserByUsername = async (username) => {
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw new Error("Database error");
  }
};

// Get user by ID
const getUserById = async (id) => {
  const result = await client.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

/**
 * EVENTS Methods
 */

// Create a new event
async function createEvent({
    user_id,
    event_name,
    description,
    event_type,
    address,
    price,
    capacity,
    date,
    start_time,
    end_time,
    picture
  }) {
    try {
      const { rows: [event] } = await client.query(
        `
        INSERT INTO events (user_id, event_name, description, event_type, address, price, capacity, date, start_time, end_time, picture)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
        `,
        [user_id, event_name, description, event_type, address, price, capacity, date, start_time, end_time, picture]
      );
  
      return event;
    } catch (error) {
      console.error("Error in createEvent:", error);
      throw error;
    }
  }
  

async function updateEvent(event_id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    // update any fields that need to be updated
    if (setString.length > 0) {
      await client.query(
        `
          UPDATE events
          SET ${setString}
          WHERE id=$${Object.keys(fields).length + 1} RETURNING *;`,
        [...Object.values(fields), event_id]
      );
    }

    return await getEventById(event_id);
  } catch (error) {
    throw error;
  }
}

// Get all events
const getAllEvents = async (limit = 10, offset = 0) => {
    const result = await client.query(
      "SELECT * FROM events ORDER BY date ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  };
  

// Get event by ID
const getEventById = async (id) => {
  const result = await client.query("SELECT * FROM events WHERE id = $1", [id]);
  return result.rows[0];
};

// Delete an event
const deleteEvent = async (id, userId) => {
  const result = await client.query(
    "DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId]
  );
  return result.rows[0];
};

/**
 * BOOKINGS Methods
 */

// Book an event
const bookEvent = async (userId, eventId) => {
  const result = await client.query(
    "INSERT INTO bookings (user_id, event_id) VALUES ($1, $2) RETURNING *",
    [userId, eventId]
  );
  return result.rows[0];
};

// Get user's booked events
const getUserBookings = async (userId) => {
  const result = await client.query(
    "SELECT events.* FROM bookings JOIN events ON bookings.event_id = events.id WHERE bookings.user_id = $1",
    [userId]
  );
  return result.rows;
};

// Cancel a booking
const cancelBooking = async (userId, eventId) => {
  const result = await client.query(
    "DELETE FROM bookings WHERE user_id = $1 AND event_id = $2 RETURNING *",
    [userId, eventId]
  );
  return result.rows[0];
};

/**
 * REVIEWS Methods
 */

// Add a review
const addReview = async (userId, event_id, rating, text_review) => {
  const result = await client.query(
    "INSERT INTO reviews (user_id, event_id, rating, text_review) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, event_id, rating, text_review]
  );
  return result.rows[0];
};

// Get reviews for an event
const getEventReviews = async (event_id) => {
  const result = await client.query(
    "SELECT * FROM reviews WHERE event_id = $1",
    [event_id]
  );
  return result.rows;
};

// Edit a review
const editReview = async (userId, event_id, fields = {}) => {
    // Build the set string
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");
  
    try {
      // Update fields only if there are fields to update
      if (setString.length > 0) {
        await client.query(
          `
          UPDATE reviews
          SET ${setString}
          WHERE user_id=$${Object.keys(fields).length + 1} AND event_id=$${Object.keys(fields).length + 2}
          RETURNING *;
        `,
          [...Object.values(fields), userId, event_id]
        );
      }
      return await getEventReviews(event_id);
    } catch (error) {
      throw error;
    }
  };
  

// Delete a review
const deleteReview = async (reviewId, userId) => {
  const result = await client.query(
    "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
    [reviewId, userId]
  );
  return result.rows[0];
};

/**
 * FAVORITES Methods
 */

// Add an event to favorites
const addFavorite = async (userId, eventId) => {
  try {
    const result = await client.query(
      "INSERT INTO favorites (user_id, event_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
      [userId, eventId]
    );
    if (result.rows.length === 0) {
      console.log(`⚠️ User ${userId} already favorited Event ${eventId}`);
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error adding favorite:", error.message);
    throw error;
  }
};

// Get user's favorite events
const getUserFavorites = async (userId) => {
  const result = await client.query(
    "SELECT events.* FROM favorites JOIN events ON favorites.event_id = events.id WHERE favorites.user_id = $1",
    [userId]
  );
  return result.rows;
};

// Remove an event from favorites
const removeFavorite = async (userId, eventId) => {
  const result = await client.query(
    "DELETE FROM favorites WHERE user_id = $1 AND event_id = $2 RETURNING *",
    [userId, eventId]
  );
  return result.rows[0];
};

module.exports = {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserByUsername,
  getUserById,
  createEvent,
  updateEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
  bookEvent,
  getUserBookings,
  cancelBooking,
  addReview,
  getEventReviews,
  editReview,
  deleteReview,
  addFavorite,
  getUserFavorites,
  removeFavorite,
};
