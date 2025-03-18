const express = require('express');
const usersRouter = express.Router();
require('dotenv').config({path:"./.env"});
const jwt = require('jsonwebtoken');
const multer = require("multer");

const { 
  createUser,
  getAllUsers,
  getUserByUsername,
} = require('../db');

//  Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  },
});

//  Middleware to handle image uploads
const upload = multer({ storage });

//  Serve uploaded images as static files
usersRouter.use("/uploads", express.static("uploads"));

usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await getAllUsers();
  
    res.send({
      users
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  // request must have both
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password == password) {
      const token = jwt.sign({ 
        id: user.id, 
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });

      res.send({ 
        message: "you're logged in!",
        token 
      });
    } else {
      next({ 
        name: 'IncorrectCredentialsError', 
        message: 'Username or password is incorrect'
      });
    }
  } catch(error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);
  
    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign({ 
      id: user.id, 
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({ 
      message: "thank you for signing up",
      token 
    });
  } catch ({ name, message }) {
    next({ name, message });
  } 
});

// Update Event (with Image Upload)
usersRouter.patch("/:user_id", requireUser, upload.single("picture"), async (req, res, next) => {
    try {
        const { id: user_id } = req.user; //  Extract user_id from authenticated user

        if (!user_id) {
            return res.status(401).json({ message: "Unauthorized" });
          }
      const {
        username, password, name, location
      } = req.body;
  
      const updateFields = {};
  
      if (username) updateFields.username = username;
      if (password) updateFields.password = password;
      if (event_type) updateFields.event_type = event_type;
      if (address) updateFields.address = address;
      if (req.file) updateFields.picture = `/uploads/${req.file.filename}`; //  Handle image update
  
      const originalEvent = await getEventById(event_id);
  
      if (!originalEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      if (originalEvent.user_id === req.user.id) {
        const updatedEvent = await updateEvent(event_id, updateFields);
        res.send({ event: updatedEvent });
      } else {
        next({
          name: "UnauthorizedUserError",
          message: "You cannot update an event that is not yours",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

module.exports = usersRouter;