const {
  pool,
  query,
  createUser,
  getAllUsers,
  createEvent,
} = require("./db");

// 🔹 Drop existing tables
async function dropTables() {
  try {
    console.log("🔸 Dropping existing tables...");
    await query(`
      DROP TABLE IF EXISTS favorites CASCADE;
      DROP TABLE IF EXISTS reviews CASCADE;
      DROP TABLE IF EXISTS bookings CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("✅ Tables dropped successfully.");
  } catch (error) {
    console.error("❌ Error dropping tables:", error);
    throw error;
  }
}

// 🔹 Create new tables
async function createTables() {
  try {
    console.log("🔸 Creating tables...");
    await query(`
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
    console.log("✅ Tables created successfully.");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
}

// 🔹 Seed Users
async function createInitialUsers() {
  try {
    console.log("🔸 Seeding users...");
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
      console.log(`✅ Created user: ${user.username}`);
    }
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

// 🔹 Seed Events
async function createInitialEvents() {
  try {
    console.log("🔸 Seeding events...");
    const users = await getAllUsers();
    const [alice, bob, charlie] = users;

    const events = [
      {
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
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116635/evently_uploads/yrnuacq4t4ey5m0aoh2d.jpg",
      },
      {
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
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116878/evently_uploads/ajtyzsbvkw3jehxktsvz.jpg",
      },
      {
        user_id: alice.id,
        event_name: "Tech & Brunch Meetup",
        description: "A networking event for tech professionals over brunch.",
        event_type: "Networking",
        address: "123 Tech Street, San Francisco, CA",
        price: 20,
        capacity: 50,
        date: "2025-04-15",
        start_time: "10:00",
        end_time: "13:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116430/evently_uploads/kmoxadudoryzkwj77fpl.jpg",
      },
      {
        user_id: alice.id,
        event_name: "Yoga in the Park",
        description: "Relax and unwind with a guided yoga session in the park.",
        event_type: "Wellness",
        address: "Central Park, New York, NY",
        price: 10,
        capacity: 30,
        date: "2025-04-20",
        start_time: "07:00",
        end_time: "08:30",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116458/evently_uploads/feffdtko6aeec5zb3pz6.jpg",
      },
      {
        user_id: alice.id,
        event_name: "Coding Bootcamp for Beginners",
        description: "A hands-on workshop introducing coding fundamentals.",
        event_type: "Education",
        address: "456 Code Lane, Austin, TX",
        price: 50,
        capacity: 40,
        date: "2025-05-10",
        start_time: "09:00",
        end_time: "16:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116612/evently_uploads/obdl3mrhopqhpbhlxcp2.jpg",
      },
      {
        user_id: bob.id,
        event_name: "Art & Wine Evening",
        description: "Sip wine and paint with local artists.",
        event_type: "Entertainment",
        address: "789 Art District, Los Angeles, CA",
        price: 35,
        capacity: 25,
        date: "2025-04-25",
        start_time: "18:00",
        end_time: "21:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116766/evently_uploads/q5ivp7bh9oxttcqv0pov.jpg",
      },
      {
        user_id: bob.id,
        event_name: "Live Jazz Night",
        description: "Enjoy live jazz performances by emerging artists.",
        event_type: "Music",
        address: "Jazz Club, Chicago, IL",
        price: 25,
        capacity: 100,
        date: "2025-05-01",
        start_time: "20:00",
        end_time: "23:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116788/evently_uploads/tlqrxehwzxihn6koq0jc.jpg",
      },
      {
        user_id: bob.id,
        event_name: "Startup Pitch Competition",
        description: "Watch startups pitch their ideas to investors.",
        event_type: "Business",
        address: "500 Innovation Blvd, San Jose, CA",
        price: 15,
        capacity: 200,
        date: "2025-05-15",
        start_time: "14:00",
        end_time: "18:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116833/evently_uploads/bqsrbzmkjumibvldq0oi.jpg",
      },
      {
        user_id: bob.id,
        event_name: "Cultural Food Festival",
        description: "A festival celebrating international cuisine and culture.",
        event_type: "Food & Drink",
        address: "City Center Plaza, Miami, FL",
        price: 5,
        capacity: 500,
        date: "2025-05-20",
        start_time: "12:00",
        end_time: "20:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116859/evently_uploads/tyirgsisypdccpb79yjl.jpg",
      },
      {
        user_id: charlie.id,
        event_name: "Photography Walk & Workshop",
        description: "Learn photography skills on a guided city walk.",
        event_type: "Education",
        address: "Downtown District, Seattle, WA",
        price: 30,
        capacity: 15,
        date: "2025-06-05",
        start_time: "15:00",
        end_time: "18:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746116313/evently_uploads/f6rk6vdfejgbmhqyqri5.jpg",
      },
      {
        user_id: charlie.id,
        event_name: "Self-Care & Wellness Retreat",
        description: "A weekend retreat focused on mindfulness and self-care.",
        event_type: "Wellness",
        address: "Retreat Center, Sedona, AZ",
        price: 150,
        capacity: 20,
        date: "2025-06-15",
        start_time: "08:00",
        end_time: "17:00",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746068564/evently_uploads/syxbdl3lgf7dg6glwlq7.jpg",
      },
      {
        user_id: charlie.id,
        event_name: "Outdoor Movie Night",
        description: "Enjoy a classic movie under the stars.",
        event_type: "Entertainment",
        address: "Community Park, Denver, CO",
        price: 10,
        capacity: 80,
        date: "2025-06-25",
        start_time: "20:00",
        end_time: "22:30",
        picture: "https://res.cloudinary.com/dufbdy0z0/image/upload/v1746068667/evently_uploads/h7adm8ogobu1a9xpqph5.jpg",
      },
    ];

    for (const event of events) {
      await createEvent(event);
      console.log(`✅ Created event: ${event.event_name}`);
    }

    console.log("✅ Events seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding events:", error);
    throw error;
  }
}

// 🔹 Seed Reviews, Favorites, Bookings
async function createInitialRelations() {
  try {
    const { rows: allUsers } = await query(`SELECT id FROM users`);
    const { rows: allEvents } = await query(`SELECT id FROM events`);

    // Reviews
    for (let i = 0; i < 10; i++) {
      const user = allUsers[i % allUsers.length];
      const event = allEvents[i];
      await query(
        `INSERT INTO reviews (user_id, event_id, rating, text_review)
         VALUES ($1, $2, $3, $4)`,
        [user.id, event.id, Math.floor(Math.random() * 5) + 1, `Great event #${i + 1}`]
      );
    }

    // Favorites (3 per user)
    for (const user of allUsers) {
      const events = allEvents.slice(0, 3);
      for (const event of events) {
        await query(`INSERT INTO favorites (user_id, event_id) VALUES ($1, $2)`, [user.id, event.id]);
      }
    }

    // Bookings (3 per user)
    for (const user of allUsers) {
      const events = allEvents.slice(3, 6);
      for (const event of events) {
        await query(`INSERT INTO bookings (user_id, event_id) VALUES ($1, $2)`, [user.id, event.id]);
      }
    }

    console.log("✅ Reviews, Favorites, and Bookings seeded.");
  } catch (error) {
    console.error("❌ Error seeding reviews/bookings/favorites:", error);
    throw error;
  }
}

// 🔹 Rebuild DB
async function rebuildDB() {
  try {
    console.log("🔸 Rebuilding database...");
    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialEvents();
    await createInitialRelations();
    console.log("✅ Database rebuilt successfully.");
  } catch (error) {
    console.error("❌ Error rebuilding database:", error);
    throw error;
  }
}

// 🔹 Start Seeding Process
async function start() {
  try {
    console.log("🚀 Starting database seeding...");
    await rebuildDB();
  } catch (error) {
    console.error("❌ Error during seed startup:", error);
    throw error;
  } finally {
    await pool.end();
    console.log("🔚 Seeding process complete.");
  }
}

start();
