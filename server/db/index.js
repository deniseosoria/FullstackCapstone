const { Client } = require("pg"); // imports the pg module
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
const createUser = async (name, email, password, location, phone, picture) => {
  const result = await client.query(
    "INSERT INTO users (name, email, password, location, phone, picture) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, email, password, location, phone, picture]
  );
  return result.rows[0];
};

async function updateUser(id, fields = {}) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ user ] } = await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return user;
    } catch (error) {
      throw error;
    }
  }

// Get user by email (for login)
const getUserByEmail = async (email) => {
  const result = await client.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
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
const createEvent = async (
  userId,
  event_name,
  description,
  event_type,
  address,
  price,
  capacity,
  date,
  startTime,
  endTime,
  picture
) => {
  const result = await client.query(
    "INSERT INTO events (user_id, event_name, description, event_type, address, price, capacity, date, start_time, end_time, picture) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
    [
      userId,
      event_name,
      description,
      event_type,
      address,
      price,
      capacity,
      date,
      startTime,
      endTime,
      picture,
    ]
  );
  return result.rows[0];
};

// Get all events
const getAllEvents = async () => {
  const result = await client.query("SELECT * FROM events ORDER BY date ASC");
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
const addReview = async (userId, eventId, rating, textReview) => {
  const result = await client.query(
    "INSERT INTO reviews (user_id, event_id, rating, text_review) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, eventId, rating, textReview]
  );
  return result.rows[0];
};

// Get reviews for an event
const getEventReviews = async (eventId) => {
  const result = await client.query(
    "SELECT * FROM reviews WHERE event_id = $1",
    [eventId]
  );
  return result.rows;
};

// Edit a review
const editReview = async (reviewId, userId, rating, textReview) => {
  const result = await client.query(
    "UPDATE reviews SET rating = $1, text_review = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
    [rating, textReview, reviewId, userId]
  );
  return result.rows[0];
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
  const result = await client.query(
    "INSERT INTO favorites (user_id, event_id) VALUES ($1, $2) RETURNING *",
    [userId, eventId]
  );
  return result.rows[0];
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
  getUserByEmail,
  getUserById,
  createEvent,
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
