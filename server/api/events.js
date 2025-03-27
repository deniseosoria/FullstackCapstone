const express = require("express");
const eventsRouter = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const upload = require("../middleware/upload");

const { requireUser } = require("./utils");
const {
  createEvent,
  getAllEvents,
  updateEvent,
  getEventById,
  getUserEvents,
  deleteEvent,
} = require("../db/db");

// Multer config for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

/* ========= ROUTES ========= */

// GET all events
eventsRouter.get("/", async (req, res, next) => {
  try {
    const events = await getAllEvents();
    res.send(events);
  } catch (err) {
    next(err);
  }
});

// GET a single event by ID
eventsRouter.get("/:event_id", async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const event = await getEventById(event_id);
    res.send(event);
  } catch (err) {
    next(err);
  }
});

// GET all events for a specific user
eventsRouter.get("/user/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const events = await getUserEvents(user_id);
    res.send(events || []);
  } catch (err) {
    next(err);
  }
});

// CREATE event (with image upload)
eventsRouter.post(
  "/",
  requireUser,
  upload.single("picture"),
  async (req, res, next) => {
    try {
      const {
        event_name,
        description,
        event_type,
        address,
        price,
        capacity,
        date,
        start_time,
        end_time,
      } = req.body;

      const picture = req.file ? req.file.filename : null;

      const event = await createEvent({
        event_name,
        description,
        event_type,
        address,
        price,
        capacity,
        date,
        start_time,
        end_time,
        picture,
        user_id: req.user.id,
      });

      res.status(201).send({ event });
    } catch (err) {
      next(err);
    }
  }
);

// UPDATE event (with image upload)
eventsRouter.patch(
  "/:id",
  requireUser,
  upload.single("picture"),
  async (req, res, next) => {
    try {
      const eventId = req.params.id;
      const existingEvent = await getEventById(eventId);

      if (!existingEvent) {
        return res.status(404).send({ error: "Event not found" });
      }

      if (existingEvent.user_id !== req.user.id) {
        return res.status(403).send({ error: "Unauthorized" });
      }

      const {
        event_name,
        description,
        event_type,
        address,
        price,
        capacity,
        date,
        start_time,
        end_time,
      } = req.body;

      const updateFields = {};

      if (event_name) updateFields.event_name = event_name;
      if (description) updateFields.description = description;
      if (event_type) updateFields.event_type = event_type;
      if (address) updateFields.address = address;
      if (price !== undefined) updateFields.price = parseFloat(price);
      if (capacity !== undefined) updateFields.capacity = parseInt(capacity);
      if (date) updateFields.date = date;
      if (start_time) updateFields.start_time = start_time;
      if (end_time) updateFields.end_time = end_time;

      if (req.file) {
        if (existingEvent.picture) {
          const oldPath = path.join(
            __dirname,
            "../uploads",
            existingEvent.picture
          );
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        updateFields.picture = req.file.filename;
      }

      const updatedEvent = await updateEvent(eventId, updateFields);
      res.send({ event: updatedEvent });
    } catch (err) {
      res
        .status(500)
        .send({ error: "Internal Server Error", details: err.message });

      next(err);
    }
  }
);

// DELETE an event
eventsRouter.delete("/:event_id", requireUser, async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const { id: user_id } = req.user;

    // First, fetch the event to check ownership and access picture filename
    const event = await getEventById(event_id);

    if (!event || event.user_id !== user_id) {
      return res.status(403).send({ error: "Not authorized or event not found." });
    }

    // Delete the image file if it exists
    if (event.picture) {
      const imagePath = path.join(__dirname, "../uploads", event.picture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the event from the database
    const deletedEvent = await deleteEvent(event_id, user_id);

    if (deletedEvent) {
      res.send({ event: deletedEvent, message: "Event successfully deleted." });
    } else {
      res.status(404).send({ error: "Event not found." });
    }
  } catch (err) {
    console.error("Error deleting event:", err.message);
    res.status(500).send({ error: "Internal Server Error", details: err.message });
  }
});


module.exports = eventsRouter;
