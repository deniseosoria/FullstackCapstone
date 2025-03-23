const express = require("express");
const eventsRouter = express.Router();
const multer = require("multer");
const path = require("path");
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

const upload = multer({ storage });

// Serve uploaded images as static files
eventsRouter.use("/uploads", express.static("uploads"));

// GET all events
eventsRouter.get("/", async (req, res, next) => {
  try {
    const events = await getAllEvents();
    res.send(events);
  } catch (err) {
    next(err);
  }
});

// CREATE event (with image upload)
eventsRouter.post("/", requireUser, upload.single("picture"), async (req, res, next) => {
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

    res.send({ event });
  } catch (err) {
    next(err);
  }
});

// UPDATE event (with image upload)
eventsRouter.patch("/:id", upload.single("picture"), async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const existingEvent = await getEventById(eventId);

    if (!existingEvent) {
      return res.status(404).send({ error: "Event not found" });
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

    const updateFields = {
      ...(event_name && { event_name }),
      ...(description && { description }),
      ...(event_type && { event_type }),
      ...(address && { address }),
      ...(price && { price: Number(price) }),
      ...(capacity && { capacity: Number(capacity) }),
      ...(date && { date }),
      ...(start_time && { start_time }),
      ...(end_time && { end_time }),
    };

    if (req.file) {
      updateFields.picture = req.file.filename;
    }

    const updated = await updateEvent(eventId, updateFields);
    res.send({ event: updated });
  } catch (err) {
    next(err);
  }
});

eventsRouter.get("/:event_id", async (req, res, next) => {
  try{
    const { event_id } = req.params;

    const event = await getEventById(event_id);
    res.send(event);
  } catch ({ name, message }) {
    next({ name, message });
  }
})

eventsRouter.get("/user/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const events = await getUserEvents(user_id);
    res.send(events || []);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// DELETE an event
eventsRouter.delete("/:event_id", requireUser, async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const { id: user_id } = req.user;

    const deletedEvent = await deleteEvent(event_id, user_id);

    if (deletedEvent) {
      res.send({ event: deletedEvent, message: "Event successfully deleted." });
    } else {
      next({
        name: "EventNotFoundError",
        message: "Event not found or you don't have permission to delete it.",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = eventsRouter;