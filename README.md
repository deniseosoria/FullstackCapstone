# Evently
Delployed url: https://eventbookie.netlify.app

# Evently

**Evently** is a full-stack event planning web application where users can create, browse, favorite, and book unique events. Inspired by **Airbnb Experiences** for its aesthetic and **Eventbrite** for functionality, Evently helps people find and host unforgettable events.

## Features

### 🌟 User-Focused Features
- **Authentication**: Secure user registration and login
- **Browse Events**: Discover all events with search, city, and category filters
- **Sort Events**: Organize by date or price
- **Event Details**: View full event information, reviews, and average ratings
- **Book Events**: Reserve your spot with a single click
- **Favorite Events**: Save experiences for later
- **Leave Reviews**: Rate and review events you've attended

### 👤 User Account Dashboard
- **My Profile**: View and edit personal information
- **My Events**: Manage created events
- **My Bookings**: View, search, and cancel bookings
- **My Favorites**: Manage saved events
- **Dynamic Search**: Filter bookings and favorites by name or date
- **Cancel & Remove**: Cancel bookings or delete favorites

### 🛠 Event Creator Tools
- **Create Events**: Add events with title, description, date, price, and image
- **Image Uploads**: Upload event images using Cloudinary integration
- **Edit Events**: Modify existing events with a pre-filled form
- **Delete Events**: Remove events from the platform
- **Responsive UI**: Clean and intuitive design for all devices

## Tech Stack

**Frontend:**
- React
- React Router
- CSS

**Backend:**
- Node.js
- Express
- PostgreSQL (raw SQL)

**Authentication:**
- JSON Web Tokens (JWT)
- bcrypt

**Image Uploads:**
- Cloudinary (via REST API)

## Getting Started

### Prerequisites
- Node.js and npm
- PostgreSQL
- Cloudinary Account

### Installation

1. Clone the repo:
   ```bash
   git clone git@github.com:deniseosoria/FullstackCapstone.git
   cd evently
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
PORT=5000
DATABASE_URL=postgres://username:password@localhost:5432/evently_db
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Folder Structure

```
evently/
├── client/          # React frontend
├── server/          # Express backend
│   ├── api/ (controllers and routes)
│   ├── db/ (models)
│   ├── utils/
│   ├── utils/
|   ├── middleware/
|   └──server.js
├── .env
└── README.md
```

## Future Improvements

- Add event tags
- Google Maps or location services integration
- Stripe or PayPal for paid events
- Email or in-app notifications
- Admin dashboard for moderation
- User messaging or Q&A for events

## Video Demo
https://www.youtube.com/watch?v=VF_X1pjiIWM

## Screenshots

- **Homepage**:
![Homepage](./client/src/assets/imgs/Screenshot%202025-04-02%20131525.png)

- **Create Event Page**:
![Create Event Page](./client/src/assets/imgs/Screenshot%202025-04-02%20131547.png)

- **Account Page**:
![Account Page](./client/src/assets/imgs/Screenshot%202025-04-02%20131620.png)

- **Event Details**:
![Event Details](./client/src/assets/imgs/Screenshot%202025-04-02%20131725.png)


