const express = require("express");
const bookingsRouter = express.Router();

const { requireUser } = require("./utils");

const { bookEvent, getUserBookings, cancelBooking } =
  require("../db/db");

// Create a booking
bookingsRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const { id: user_id } = req.user;
    const { event_id } = req.body;

    // Check if the values are actually UUIDs
    if (!user_id || !event_id) {
      return res.status(400).json({ error: "Missing user_id or event_id." });
    }

    // Log to see the actual values being sent
    console.log("Creating booking with:", { user_id, event_id });

    // Ensure both are treated as UUIDs when passed to bookEvent
    const booking = await bookEvent(user_id, event_id);

    if (booking) {
      res.status(201).json(booking);
    } else {
      next({
        name: "CreationError",
        message: "There was an error creating your booking. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error in /bookings route:", error);
    next(error);
  }
});

// Get a user's bookings
bookingsRouter.get("/", requireUser, async (req, res, next) => {
  try {
    const { id: user_id } = req.user;
    const bookings = await getUserBookings(user_id);
    res.send(bookings);
  } catch (error) {
    next(error);
  }
});


// Cancel a booking
bookingsRouter.delete("/:event_id", requireUser, async (req, res, next) => {
  try {
    const { id: user_id } = req.user;
    const { event_id } = req.params;

    const canceled = await cancelBooking(user_id, event_id); // You likely already have this function

    if (canceled) {
      res.send({ message: "Booking canceled", booking: canceled });
    } else {
      res.status(404).send({ error: "Booking not found" });
    }
  } catch (err) {
    next(err);
  }
});


module.exports = bookingsRouter;
