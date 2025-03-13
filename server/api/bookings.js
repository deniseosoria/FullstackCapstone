const express = require("express");
const eventsRouter = express.Router();

const { requireUser } = require("./utils");

const {
  deleteEvent,
  bookEvent,
  getUserBookings,
  cancelBooking,
} = require("../db");
