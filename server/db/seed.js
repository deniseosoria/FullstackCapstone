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
  } = require("./db");
  
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
  
      await createEvent({
        event_name: "Tech & Brunch Meetup",
        description: "A networking event for tech professionals over brunch.",
        event_type: "Networking",
        address: "123 Tech Street, San Francisco, CA",
        price: 20,
        capacity: 50,
        date: "2025-04-15",
        start_time: "10:00 AM",
        end_time: "1:00 PM",
        picture: "/uploads/tech-brunch.jpg",
        user_id: alice.id,
      });
  
      await createEvent({
        event_name: "Yoga in the Park",
        description: "Relax and unwind with a guided yoga session in the park.",
        event_type: "Wellness",
        address: "Central Park, New York, NY",
        price: 10,
        capacity: 30,
        date: "2025-04-20",
        start_time: "7:00 AM",
        end_time: "8:30 AM",
        picture: "/uploads/yoga-park.jpg",
        user_id: alice.id,
      });
  
      await createEvent({
        event_name: "Coding Bootcamp for Beginners",
        description: "A hands-on workshop introducing coding fundamentals.",
        event_type: "Education",
        address: "456 Code Lane, Austin, TX",
        price: 50,
        capacity: 40,
        date: "2025-05-10",
        start_time: "9:00 AM",
        end_time: "4:00 PM",
        picture: "/uploads/coding-bootcamp.jpg",
        user_id: alice.id,
      });
  
      await createEvent({
        event_name: "Art & Wine Evening",
        description: "Sip wine and paint with local artists.",
        event_type: "Entertainment",
        address: "789 Art District, Los Angeles, CA",
        price: 35,
        capacity: 25,
        date: "2025-04-25",
        start_time: "6:00 PM",
        end_time: "9:00 PM",
        picture: "/uploads/art-wine.jpg",
        user_id: bob.id,
      });
  
      await createEvent({
        event_name: "Live Jazz Night",
        description: "Enjoy live jazz performances by emerging artists.",
        event_type: "Music",
        address: "Jazz Club, Chicago, IL",
        price: 25,
        capacity: 100,
        date: "2025-05-01",
        start_time: "8:00 PM",
        end_time: "11:00 PM",
        picture: "/uploads/jazz-night.jpg",
        user_id: bob.id,
      });
  
      await createEvent({
        event_name: "Startup Pitch Competition",
        description: "Watch startups pitch their ideas to investors.",
        event_type: "Business",
        address: "500 Innovation Blvd, San Jose, CA",
        price: 15,
        capacity: 200,
        date: "2025-05-15",
        start_time: "2:00 PM",
        end_time: "6:00 PM",
        picture: "/uploads/startup-pitch.jpg",
        user_id: bob.id,
      });
  
      await createEvent({
        event_name: "Cultural Food Festival",
        description: "A festival celebrating international cuisine and culture.",
        event_type: "Food & Drink",
        address: "City Center Plaza, Miami, FL",
        price: 5,
        capacity: 500,
        date: "2025-05-20",
        start_time: "12:00 PM",
        end_time: "8:00 PM",
        picture: "/uploads/food-festival.jpg",
        user_id: bob.id,
      });
  
      await createEvent({
        event_name: "Photography Walk & Workshop",
        description: "Learn photography skills on a guided city walk.",
        event_type: "Education",
        address: "Downtown District, Seattle, WA",
        price: 30,
        capacity: 15,
        date: "2025-06-05",
        start_time: "3:00 PM",
        end_time: "6:00 PM",
        picture: "/uploads/photo-walk.jpg",
        user_id: charlie.id,
      });
  
      await createEvent({
        event_name: "Self-Care & Wellness Retreat",
        description: "A weekend retreat focused on mindfulness and self-care.",
        event_type: "Wellness",
        address: "Retreat Center, Sedona, AZ",
        price: 150,
        capacity: 20,
        date: "2025-06-15",
        start_time: "8:00 AM",
        end_time: "5:00 PM",
        picture: "/uploads/wellness-retreat.jpg",
        user_id: charlie.id,
      });
  
      await createEvent({
        event_name: "Outdoor Movie Night",
        description: "Enjoy a classic movie under the stars.",
        event_type: "Entertainment",
        address: "Community Park, Denver, CO",
        price: 10,
        capacity: 80,
        date: "2025-06-25",
        start_time: "8:00 PM",
        end_time: "10:30 PM",
        picture: "/uploads/movie-night.jpg",
        user_id: charlie.id,
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
  