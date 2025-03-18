require("dotenv").config({ path: "./.env" });
const {
  client,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  createEvent,
  updateEvent,
  getAllEvents,
  getEventById,
  bookEvent,
  getUserBookings,
  cancelBooking,
  getEventReviews,
  addReview,
  editReview,
  deleteReview,
  addFavorite,
  getUserFavorites,
  removeFavorite,
} = require("./index");

// 🔹 Drop existing tables
async function dropTables() {
  try {
    console.log("Dropping tables...");

    await client.query(`
        DROP TABLE IF EXISTS favorites CASCADE;
        DROP TABLE IF EXISTS reviews CASCADE;
        DROP TABLE IF EXISTS bookings CASCADE;
        DROP TABLE IF EXISTS events CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);

    console.log(" Finished dropping tables!");
  } catch (error) {
    console.error(" Error dropping tables:", error);
    throw error;
  }
}

// 🔹 Create new tables
async function createTables() {
  try {
    console.log("Creating tables...");

    await client.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          password TEXT NOT NULL,
          location VARCHAR(255) NOT NULL,
          picture TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
  
        CREATE TABLE events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          event_name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          event_type VARCHAR(50),
          address VARCHAR(255) NOT NULL, 
          price DECIMAL(10,2) DEFAULT 0.00,
          capacity INT NOT NULL CHECK (capacity > 0), 
          date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL CHECK (end_time > start_time), 
          picture TEXT, 
          created_at TIMESTAMP DEFAULT NOW()
        );
  
        CREATE TABLE bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          CONSTRAINT unique_booking UNIQUE(user_id, event_id)
        );
  
        CREATE TABLE reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE,
          rating INT CHECK (rating BETWEEN 1 AND 5),
          text_review TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          CONSTRAINT unique_review UNIQUE(user_id, event_id)
        );
  
        CREATE TABLE favorites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          event_id UUID REFERENCES events(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          CONSTRAINT unique_favorite UNIQUE(user_id, event_id)
        );
      `);

    console.log(" Finished creating tables!");
  } catch (error) {
    console.error(" Error creating tables:", error);
    throw error;
  }
}

// 🔹 Seed Users
async function createInitialUsers() {
  try {
    console.log("Seeding users...");

    const users = [
      {
        name: "Alice Johnson",
        username: "alicej",
        password: "password123",
        location: "New York, NY",
      },
      {
        name: "Bob Smith",
        username: "bobsmith",
        password: "password123",
        location: "Los Angeles, CA",
      },
      {
        name: "Charlie Brown",
        username: "charlieb",
        password: "password123",
        location: "Chicago, IL",
      },
    ];

    for (const user of users) {
      await createUser(user);
    }

    console.log(" Finished seeding users!");
  } catch (error) {
    console.error(" Error seeding users:", error);
    throw error;
  }
}

// 🔹 Seed Events
async function createInitialEvents() {
  try {
    console.log("Seeding events...");

    const users = await getAllUsers();
    if (users.length < 3) {
      throw new Error("Not enough users to create events");
    }

    const [alice, bob, charlie] = users;

    await createEvent({
      user_id: alice.id,
      event_name: "Tech Conference",
      description: "Annual tech conference with industry leaders",
      event_type: "Conference",
      address: "123 Tech St, San Francisco, CA",
      price: 99.99,
      capacity: 200,
      date: "2025-06-15",
      start_time: "09:00",
      end_time: "17:00",
      picture: "tech_conf.jpg",
    });

    await createEvent({
      user_id: bob.id,
      event_name: "Music Festival",
      description: "Outdoor music festival with live bands",
      event_type: "Festival",
      address: "456 Music Rd, Austin, TX",
      price: 49.99,
      capacity: 500,
      date: "2025-07-20",
      start_time: "14:00",
      end_time: "23:00",
      picture: "music_fest.jpg",
    });

    console.log(" Finished seeding events!");
  } catch (error) {
    console.error(" Error seeding events:", error);
    throw error;
  }
}

// 🔹 Run Tests
async function testDB() {
  try {
    console.log("Testing database functions...");

    // Users
    const users = await getAllUsers();
    console.log("Users:", users);

    // 🔹 Test updateUser
    console.log("\n➡️ Updating user information...");
    const updatedUser = await updateUser(users[0].id, {
      location: "San Francisco, CA",
    });
    console.log(" Updated User:", updatedUser);

    // 🔹 Test getUserById
    console.log("\n Fetching user by ID...");
    const userById = await getUserById(users[0].id);
    console.log(" User by ID:", userById);

    // Events
    const events = await getAllEvents();
    console.log("Events:", events);

    // 🔹 Test updateEvent
    console.log("\n Updating event...");
    const updatedEvent = await updateEvent(events[0].id, { price: 79.99 });
    console.log(" Updated Event:", updatedEvent);

    // 🔹 Test getEventById
    console.log("\n Fetching event by ID...");
    const eventById = await getEventById(events[0].id);
    console.log(" Event by ID:", eventById);

    // Book an event
    await bookEvent(users[0].id, events[0].id);
    console.log(` User ${users[0].id} booked Event ${events[0].id}`);

    // Get user bookings
    const userBookings = await getUserBookings(users[0].id);
    console.log("User Bookings:", userBookings);

    // Cancel a booking
    await cancelBooking(users[0].id, events[0].id);
    console.log(" Booking canceled");

    // Add a review
    await addReview(users[0].id, events[0].id, 5, "Amazing event!");
    console.log(" Review added");

    // Edit review
    await editReview(users[0].id, events[0].id, {
      rating: 4,
      text_review: "Updated review!",
    });
    console.log(" Review updated");

    // Get event reviews
    const reviews = await getEventReviews(events[0].id);
    console.log("Event Reviews:", reviews);

    // Delete review
    await deleteReview(reviews[0].id, users[0].id);
    console.log(" Review deleted");

    // Add a favorite
    await addFavorite(users[1].id, events[1].id);
    console.log(" Favorite added");

    // Get user favorites
    const favorites = await getUserFavorites(users[1].id);
    console.log("User Favorites:", favorites);

    // Remove a favorite
    await removeFavorite(users[1].id, events[1].id);
    console.log(" Favorite removed");

    console.log(" Database testing complete!");
  } catch (error) {
    console.error(" Error testing database:", error);
  }
}

// 🔹 Rebuild DB
async function rebuildDB() {
  try {
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialEvents();
  } catch (error) {
    console.error(" Error rebuilding database:", error);
    throw error;
  }
}

// 🔹 Start Seeding Process
async function start() {
  try {
    await client.connect();
    console.log(" Connected to database");

    await rebuildDB();
    await testDB();
  } catch (error) {
    console.error(" Error in start():", error);
  } finally {
    await client.end();
    console.log(" Database connection closed.");
  }
}

// Run script
start();
