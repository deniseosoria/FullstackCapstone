const express = require("express");
const usersRouter = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");

const { requireUser } = require("./utils");

const {
  createUser,
  getAllUsers,
  getUserByUsername,
  getUserById,
  updateUser,
  deleteUser,
} = require("../db/db");

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

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers();

    res.send({
      users,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }

    // Compare hashed password using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }

    const token = jwt.sign(
      { id: user.id, username },
      process.env.JWT_SECRET || "shhh",
      { expiresIn: "1w" }
    );
    res.send({ message: "You're logged in!", token });
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }

    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET || "shhh",
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Update User (with Image Upload)
usersRouter.patch(
  "/:user_id",
  requireUser,
  upload.single("picture"),
  async (req, res, next) => {
    try {
      const { user_id } = req.params;
      const { username, password, name, location } = req.body;

      if (req.user.id !== user_id) {
        return res
          .status(403)
          .json({ message: "You cannot update another user's profile" });
      }

      const updateFields = {};

      if (username) updateFields.username = username;
      if (password) updateFields.password = await bcrypt.hash(password, 10); //  Hash new password
      if (name) updateFields.name = name;
      if (location) updateFields.location = location;
      if (req.file) updateFields.picture = `/uploads/${req.file.filename}`; //  Store image path

      const updatedUser = await updateUser(user_id, updateFields);

      if (updatedUser) {
        res.send({ message: "User updated successfully", user: updatedUser });
      } else {
        next({ name: "UpdateError", message: "Failed to update user" });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

usersRouter.delete("/:user_id", requireUser, async (req, res, next) => {
  try {
    const { user_id } = req.params;

    // Ensure the user can only delete their own account
    if (req.user.id !== user_id) {
      return res
        .status(403)
        .json({
          message: "You are not allowed to delete another user's account.",
        });
    }

    const deletedUser = await deleteUser(user_id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ message: "User not found or already deleted." });
    }

    res.send({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    next(error);
  }
});

// Protected Route: Get User Account Details
usersRouter.get("/account", requireUser, async (req, res) => {
  try {
    // `requireUser` middleware ensures `req.user` is set
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      location: user.location,
      picture: user.picture,
      createdAt: user.created_at, // Adjust based on your DB structure
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = usersRouter;
