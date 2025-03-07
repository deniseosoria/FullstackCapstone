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
    getUserBookings,
    getEventReviews,
    editReview,
    getUserFavorites
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
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        location VARCHAR(255) NOT NULL
        phone VARCHAR(20),
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
        UNIQUE(user_id, event_id) -- Prevent duplicate favorites
        );
    `);
    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!", error);
    throw error;
  }
}

async function createInitialUsers() {
    try{
        console.log("Starting to create users...");

        await createUser({
            name: "denise",
            email: "denise@gmail.com",
            password: "localoca",
            location: "Brooklyn, New York",
        })

        await createUser({
            name: "lucas",
            email: "lucas@gmail.com",
            password: "casycasy",
            location: "Queens, New York",
        })

        await createUser({
            name: "jeffrey",
            email: "jeffrey@gmail.com",
            password: "jeff2000",
            location: "New York City, New York",
        })

        console.log("Finished creating users!");

    } catch (error) {
        console.error("Error creating users!", error);
        throw error;
      }
}

async function createInitialEvents() {
    try{
        const [denise, lucas, jeffrey] = await getAllUsers();

        console.log("Starting to create events ...");

        await createEvent({
            user_id: denise.id, // Assign the user who created the event
            event_name: "Tech Networking Night",
            description: "A networking event for software engineers and tech professionals.",
            event_type: "Networking",
            address: "123 Tech Hub, New York, NY",
            price: 20.00,
            capacity: 100,
            date: "2025-04-15",
            start_time: "18:00:00",
            end_time: "21:00:00"
        });

        await createEvent({
            user_id: lucas.id,
            event_name: "React.js Workshop",
            description: "A hands-on workshop to learn React.js and hooks.",
            event_type: "Workshop",
            address: "456 Code Avenue, San Francisco, CA",
            price: 50.00,
            capacity: 50,
            date: "2025-04-20",
            start_time: "14:00:00",
            end_time: "17:00:00"
        });

        await createEvent({
            user_id: jeffrey.id,
            event_name: "Music Festival 2025",
            description: "An outdoor festival featuring live performances from top artists.",
            event_type: "Concert",
            address: "789 Music Park, Miami, FL",
            price: 75.00,
            capacity: 500,
            date: "2025-05-10",
            start_time: "15:00:00",
            end_time: "23:00:00"
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

}

// Start the database setup process
async function start() {
    try {
      await client.connect(); // Ensure DB connection is established before running anything
      console.log("Connected to database");
  
      await rebuildDB();
      await testDB();
    } catch (error) {
      console.error("Error in start()", error);
    } finally {
      client.end(); // Close connection after running everything
    }
  }
  
  start();
  