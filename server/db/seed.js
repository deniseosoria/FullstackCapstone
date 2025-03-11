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
  getEventReviews,
  addReview,
  editReview,
  getUserFavorites,
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS favorites CASCADE;
        DROP TABLE IF EXISTS reviews CASCADE;
        DROP TABLE IF EXISTS bookings CASCADE;
        DROP TABLE IF EXISTS events CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!", error);
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
        CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        picture TEXT,
        created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE events (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        event_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        event_type VARCHAR(50),
        address TEXT NOT NULL,
        price DECIMAL(10,2) DEFAULT 0.00,
        capacity INT NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        picture TEXT, 
        created_at TIMESTAMP DEFAULT NOW()
        );


        CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        event_id INT REFERENCES events(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, event_id)
        );

        CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        event_id INT REFERENCES events(id) ON DELETE CASCADE,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        text_review TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, event_id) 
        );

        CREATE TABLE favorites (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        event_id INT REFERENCES events(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, event_id)
        );
    `);
    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!", error);
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const users = [
      {
        name: "denise",
        username: "Denise The Great",
        password: "localoca",
        location: "Brooklyn, New York",
      },
      {
        name: "lucas",
        username: "Lucus Gomez.com",
        password: "casycasy",
        location: "Queens, New York",
      },
      {
        name: "jeffrey",
        username: "Jeffrey Dahmer",
        password: "jeff2000",
        location: "New York City, New York",
      },
    ];

    for (const user of users) {
      console.log("Creating user:", user); // Debugging: Ensure password exists
      await createUser(user);
    }

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!", error);
    throw error;
  }
}

async function createInitialEvents() {
  try {
    const users = await getAllUsers();
    if (users.length < 3) {
      throw new Error("Not enough users to create events");
    }
    const [denise, lucas, jeffrey] = users;

    console.log("Starting to create events ...");

    await createEvent({
      user_id: denise.id, // Assign the user who created the event
      event_name: "Tech Networking Night",
      description:
        "A networking event for software engineers and tech professionals.",
      event_type: "Networking",
      address: "123 Tech Hub, New York, NY",
      price: 20.0,
      capacity: 100,
      date: "2025-04-15",
      start_time: "18:00:00",
      end_time: "21:00:00",
    });

    await createEvent({
      user_id: lucas.id,
      event_name: "React.js Workshop",
      description: "A hands-on workshop to learn React.js and hooks.",
      event_type: "Workshop",
      address: "456 Code Avenue, San Francisco, CA",
      price: 50.0,
      capacity: 50,
      date: "2025-04-20",
      start_time: "14:00:00",
      end_time: "17:00:00",
    });

    await createEvent({
      user_id: jeffrey.id,
      event_name: "Music Festival 2025",
      description:
        "An outdoor festival featuring live performances from top artists.",
      event_type: "Concert",
      address: "789 Music Park, Miami, FL",
      price: 75.0,
      capacity: 500,
      date: "2025-05-10",
      start_time: "15:00:00",
      end_time: "23:00:00",
    });

    console.log("Finished creating events");
  } catch (error) {
    console.error(" Error creating events:", error);
  }
}

async function rebuildDB() {
  try {
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialEvents();
  } catch (error) {
    console.error("Error during rebuildDB!", error);
    throw error;
  }
}

async function testDB() {
  // getUserById,
  // updateEvent,
  // getAllEvents,
  // getEventById,
  // getUserBookings,
  // getEventReviews,
  // editReview,
  // getUserFavorites

  try {
    console.log("Starting to test database...");

    // Test getAllUsers
    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    // Test updateUser
    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

    // Test getUserById
    console.log("Calling gerUserById for user 1 ...");
    const user = await getUserById(1);
    console.log("Result: ", user);

    // Test getAllEvents
    console.log("Calling getAllEvents");
    const allEvents = await getAllEvents();
    console.log("Result:", allEvents);

    // 🔹 Test updateEvent
    console.log("\n➡️ Calling updateEvent on the first event...");
    const events = await getAllEvents();
    if (events.length === 0) {
      console.log("❌ No events available to update.");
    } else {
      const updatedEvent = await updateEvent(events[0].id, {
        event_name: "Updated Event Name",
        price: 30.0,
      });
      console.log("✅ Updated Event:", updatedEvent);
    }

    // 🔹 Test getEventById
    if (allEvents.length > 0) {
      console.log("\n➡️ Calling getEventById for the first event...");
      const eventById = await getEventById(allEvents[0].id);
      console.log("Result:", eventById);
    } else {
      console.log("❌ No events available to fetch by ID.");
    }

    // Book the first user for the first event
    await bookEvent(users[0].id, events[0].id);
    console.log(`✅ User ${users[0].id} booked Event ${events[0].id}`);

    // Book the second user for the second event (if available)
    if (users.length > 1 && events.length > 1) {
      await bookEvent(users[1].id, events[1].id);
      console.log(`✅ User ${users[1].id} booked Event ${events[1].id}`);
    }

    // 🔹 Test getUserBookings
    console.log("\n➡️ Calling getUserBookings for user 1...");
    const bookings = await getUserBookings(1);
    console.log("Result:", bookings);

    // Add a review for the first user on the first event
    await addReview(
      users[0].id,
      events[0].id,
      5,
      "Amazing event! Would highly recommend."
    );
    console.log(`✅ User ${users[0].id} reviewed Event ${events[0].id}`);

    // Add a review for the second user on the second event (if available)
    if (users.length > 1 && events.length > 1) {
      await addReview(
        users[1].id,
        events[1].id,
        4,
        "Great experience, but could use more networking time."
      );
      console.log(`✅ User ${users[1].id} reviewed Event ${events[1].id}`);
    }

    // 🔹 Test getEventReviews
    if (allEvents.length > 0) {
      console.log("\n➡️ Calling getEventReviews for the first event...");
      const reviews = await getEventReviews(allEvents[0].id);
      console.log("Result:", reviews);
    } else {
      console.log("❌ No events available to fetch reviews.");
    }

    // 🔹 Test editReview
    if (allEvents.length > 0) {
      console.log("\n➡️ Editing review for first event...");
      const editedReview = await editReview(1, allEvents[0].id, {
        rating: 4,
        text_review: "Updated review text.",
      });
      console.log("✅ Updated Review:", editedReview);
    } else {
      console.log("❌ No reviews available to edit.");
    }

    // 🔹 Test getEventReviews
    if (allEvents.length > 0) {
        console.log("\n➡️ Calling getEventReviews for the first event...");
        const reviews = await getEventReviews(allEvents[0].id);
        console.log("Result:", reviews);
      } else {
        console.log("❌ No events available to fetch reviews.");
      }

    // 🔹 Test getUserFavorites
    console.log("\n➡️ Calling getUserFavorites for user 1...");
    const favorites = await getUserFavorites(1);
    console.log("Result:", favorites);

    console.log("\n✅ Database tests completed successfully!");
  } catch (error) {
    console.error("Error testing database:", error);
  }
}

// Start the database setup process
async function start() {
  try {
    await client.connect();
    console.log("Connected to database");

    await rebuildDB();
    await testDB();
  } catch (error) {
    console.error("Error in start()", error);
  } finally {
    await client.end(); // Ensures DB connection closes properly
    console.log("Database connection closed.");
  }
}

start();
