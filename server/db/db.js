// ==============================
// IMPORTS & INITIAL SETUP
// ==============================

const pg = require("pg");
const bcrypt = require("bcrypt");


const SALT_ROUNDS = 10;

// ==============================
// DATABASE CONNECTION (PostgreSQL)
// ==============================

const client = new pg.Client(
  process.env.DATABASE_URL
);


/**
 * USER Methods
 */

async function createUser({ name, username, password, location, picture }) {
  try {
    console.log("Inside createUser - received:", {
      name,
      username,
      password,
      location,
      picture,
    });

    if (!password) {
      throw new Error("Password is missing in createUser");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("Hashed password:", hashedPassword);

    const {
      rows: [user],
    } = await client.query(
      `INSERT INTO users (name, username, password, location, picture)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [name, username, hashedPassword, location, picture]
    );

    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error(" Error in createUser:", error);
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  if (Object.keys(fields).length === 0) return;

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

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
    console.error(" Error in updateUser:", error);
    throw error;
  }
}

async function getAllUsers() {
  try {
    const { rows } = await client.query(
      `SELECT id, name, username, location FROM users;`
    );
    return rows;
  } catch (error) {
    console.error(" Error in getAllUsers:", error);
    throw error;
  }
}

const getUserByUsername = async (username) => {
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0];
  } catch (error) {
    console.error(" Error in getUserByUsername:", error);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const { rows } = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return rows[0];
  } catch (error) {
    console.error(" Error in getUserById:", error);
    throw error;
  }
};

async function deleteUser(user_id) {
  try {
    // Delete user and cascade delete any related data (bookings, events, etc.)
    const {
      rows: [deletedUser],
    } = await client.query(`DELETE FROM users WHERE id = $1 RETURNING *;`, [
      user_id,
    ]);

    return deletedUser;
  } catch (error) {
    throw error;
  }
}

/**
 * EVENTS Methods
 */
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
  picture,
}) {
  try {
    const {
      rows: [event],
    } = await client.query(
      `INSERT INTO events (user_id, event_name, description, event_type, address, price, capacity, date, start_time, end_time, picture)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *;`,
      [
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
        picture,
      ]
    );

    return event;
  } catch (error) {
    console.error(" Error in createEvent:", error);
    throw error;
  }
}

async function updateEvent(event_id, fields = {}) {
  if (Object.keys(fields).length === 0) return;

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    const {
      rows: [event],
    } = await client.query(
      `UPDATE events SET ${setString} WHERE id=$${
        Object.keys(fields).length + 1
      } RETURNING *;`,
      [...Object.values(fields), event_id]
    );

    return event;
  } catch (error) {
    console.error(" Error in updateEvent:", error);
    throw error;
  }
}

const getAllEvents = async (limit = 10, offset = 0) => {
  try {
    const result = await client.query(
      "SELECT * FROM events ORDER BY date ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  } catch (error) {
    console.error(" Error in getAllEvents:", error);
    throw error;
  }
};

const getEventById = async (id) => {
  try {
    const result = await client.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error(" Error in getEventById:", error);
    throw error;
  }
};

async function getUserEvents(user_id) {
  try {
    const result = await client.query(`
      SELECT * FROM events WHERE user_id = $1
    `, [user_id]);
    return result.rows;
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    throw error;
  }
}


const deleteEvent = async (id, user_id) => {
  try {
    const result = await client.query(
      `DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *;`,
      [id, user_id]
    );
    return result.rows[0]; // Returns the deleted event
  } catch (error) {
    console.error(" Error in deleteEvent:", error);
    throw error;
  }
};

/**
 * BOOKINGS Methods
 */
const bookEvent = async (user_id, event_id) => {
  try {
    console.log("Inserting into bookings:", { user_id, event_id }); // Debugging

    const { rows } = await client.query(
      "INSERT INTO bookings (user_id, event_id) VALUES ($1, $2) RETURNING *",
      [user_id, event_id]
    );

    return rows[0];
  } catch (error) {
    console.error("Error in bookEvent:", error);
    throw error;
  }
};

// Get user's booked events
const getUserBookings = async (userId) => {
  try {
    const result = await client.query(
      "SELECT events.* FROM bookings JOIN events ON bookings.event_id = events.id WHERE bookings.user_id = $1",
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error(" Error in getUserBookings:", error);
    throw error;
  }
};

// Cancel a booking
const cancelBooking = async (userId, eventId) => {
  try {
    const result = await client.query(
      "DELETE FROM bookings WHERE user_id = $1 AND event_id = $2 RETURNING *",
      [userId, eventId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(" Error in cancelBooking:", error);
    throw error;
  }
};

/**
 * REVIEWS Methods
 */
const addReview = async (userId, event_id, rating, text_review) => {
  try {
    const { rows } = await client.query(
      "INSERT INTO reviews (user_id, event_id, rating, text_review) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, event_id, rating, text_review]
    );
    return rows[0];
  } catch (error) {
    console.error(" Error in addReview:", error);
    throw error;
  }
};

// Get reviews for an event
const getEventReviews = async (event_id) => {
  try {
    const result = await client.query(
      "SELECT * FROM reviews WHERE event_id = $1",
      [event_id]
    );
    return result.rows;
  } catch (error) {
    console.error(" Error in getEventReviews:", error);
    throw error;
  }
};

const editReview = async (userId, event_id, fields = {}) => {
  if (Object.keys(fields).length === 0) return;

  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    const {
      rows: [review],
    } = await client.query(
      `UPDATE reviews SET ${setString} WHERE user_id=$${
        Object.keys(fields).length + 1
      } 
       AND event_id=$${Object.keys(fields).length + 2} RETURNING *;`,
      [...Object.values(fields), userId, event_id]
    );

    return review;
  } catch (error) {
    console.error(" Error in editReview:", error);
    throw error;
  }
};

// Delete a review
const deleteReview = async (reviewId, userId) => {
  try {
    const result = await client.query(
      "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
      [reviewId, userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(" Error in deleteReview:", error);
    throw error;
  }
};

/**
 * FAVORITES Methods
 */
const addFavorite = async ({ user_id, event_id }) => {
  try {
    const { rows } = await client.query(
      `INSERT INTO favorites (user_id, event_id) VALUES ($1, $2) RETURNING *;`,
      [user_id, event_id] // Ensure these are raw UUID strings
    );
    return rows[0];
  } catch (error) {
    console.error("Database error in addFavorite:", error);
    throw error;
  }
};

// Get user's favorite events
const getUserFavorites = async (userId) => {
  try {
    const result = await client.query(
      "SELECT events.* FROM favorites JOIN events ON favorites.event_id = events.id WHERE favorites.user_id = $1",
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error(" Error in getUserFavorites:", error);
    throw error;
  }
};

// Remove an event from favorites
const removeFavorite = async (userId, eventId) => {
  try {
    const result = await client.query(
      "DELETE FROM favorites WHERE user_id = $1 AND event_id = $2 RETURNING *",
      [userId, eventId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(" Error in removeFavorite:", error);
    throw error;
  }
};

module.exports = {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserByUsername,
  getUserById,
  deleteUser,
  createEvent,
  updateEvent,
  getAllEvents,
  getEventById,
  getUserEvents,
  deleteEvent,
  bookEvent,
  getUserBookings,
  cancelBooking,
  addReview,
  editReview,
  getEventReviews,
  deleteReview,
  addFavorite,
  getUserFavorites,
  removeFavorite,
};
