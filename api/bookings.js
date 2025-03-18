const express = require("express");
const bookingsRouter = express.Router();

const { requireUser } = require("./utils");

const { bookEvent, getUserBookings, cancelBooking } = require("../db");

// Create a booking
bookingsRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const { id: user_id } = req.user;
    const { event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({ error: "Missing user_id or event_id." });
    }

    const booking = await bookEvent({ user_id, event_id });
    if (booking) {
      res.send(booking);
    } else {
      next({
        name: "CreationError",
        message: "There was an error creating your booking. Please try again.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Get a user's bookings
bookingsRouter.get("/:id", requireUser, async (req, res, next) => {
    try {
        const { id: user_id } = req.user;
        res.send(await getUserBookings(user_id));
      }catch (error) {
        console.error("Error fetching bookings:", error);
        next(error);
      }
})

// Cancel a booking
bookingsRouter.delete("/:event_id", requireUser, async (req, res, next) => {
    try {
      const { id: user_id } = req.user; // Extract user_id from authenticated user
      const { event_id } = req.params;
  
      if (!user_id || !event_id) {
        return res.status(400).json({ error: "Missing user_id or event_id." });
      }
  
      const canceledBooking = await cancelBooking(user_id, event_id);
  
      if (canceledBooking) {
        res.status(200).json({ message: "Booking canceled successfully.", booking: canceledBooking });
      } else {
        res.status(404).json({
          name: "BookingNotFoundError",
          message: "No booking found for this event or user.",
        });
      }
    } catch (error) {
      next(error);
    }
  });

module.exports = bookingsRouter;
