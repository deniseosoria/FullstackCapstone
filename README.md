# Evently

**Evently** is a full-stack event planning web application where users can create, browse, favorite, and book unique events. Inspired by **Airbnb Experiences** for its design and **Eventbrite** for functionality, Evently helps people find exciting events and experiences in different cities.

## Features

### 🌟 User-Focused Features
- **Authentication**: Secure login and registration
- **Browse Events**: View all events with filters for city, category, and search by name
- **Sort Events**: Sort by date or price
- **Event Details**: View full details, average ratings, and reviews
- **Book Events**: Easily book your favorite experiences
- **Favorite Events**: Save events to your personal favorites list
- **Leave Reviews**: Rate and review events you’ve attended

### 👤 User Account
- **Profile Management**: View and edit account information
- **My Events**: Manage events you’ve created
- **My Bookings**: View and cancel booked events
- **My Favorites**: Manage favorited events
- **Search & Sort Bookings**: Filter your bookings by date or event name
- **Cancel & Delete**: Cancel bookings or remove from favorites

### 🛠 Event Creator Tools
- **Create Events**: Post new events with image upload
- **Edit Events**: Update event details with a pre-filled form
- **Delete Events**: Remove your events from the platform
- **Responsive UI**: Clean and modern user interface inspired by Airbnb

## Tech Stack

**Frontend:**
- React
- React Router


**Backend:**
- Node.js
- Express
- PostgreSQL
- Cloudinary (for image uploads)

**Authentication:**
- JSON Web Tokens (JWT)
- bcrypt

## Getting Started

### Prerequisites
- Node.js and npm
- PostgreSQL

### Installation

1. Clone the repo:
   ```bash
   git clone git@github.com:deniseosoria/FullstackCapstone.git
   cd FullstackCapstone
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```

3. Set up your PostgreSQL database and `.env` files.

4. Run the server:
   ```bash
   npm run server
   ```

5. Run the client:
   ```bash
   cd client
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with:

```env
PORT=3001
DATABASE_URL=postgres://username:password@localhost:5432/evently_db
JWT_SECRET=your_jwt_secret
```


## Folder Structure

```
evently/
├── client/          # React frontend
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── .env
└── README.md
```

## Future Improvements

- Add event categories and tags
- Google Maps integration
- User messaging or Q&A under events
- Stripe or PayPal integration for paid events
- Notifications (email or in-app)
- Admin dashboard

## Screenshots

_Coming soon..._


Made with ❤️ for event lovers everywhere.
