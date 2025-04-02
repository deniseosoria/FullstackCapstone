const express = require("express");
const eventsRouter = express.Router();

const cloudinary = require("cloudinary").v2;
const upload = require("../middleware/cloudinaryUpload");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const { requireUser } = require("./utils");
const {
  createEvent,
  getAllEvents,
  updateEvent,
  getEventById,
  getUserEvents,
  deleteEvent,
} = require("../db/db");

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

      const picture = req.file ? req.file.path : null; //  Cloudinary URL

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

      // 🔍 DEBUG IMAGE UPLOAD
      console.log("📷 Uploaded file (req.file):", req.file);

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
        updateFields.picture = req.file.path; //  Cloudinary URL
      }

      const updatedEvent = await updateEvent(eventId, updateFields);
      res.send({ event: updatedEvent });
    } catch (err) {
      console.error("❌ PATCH /api/events error:", err.message);
      res.status(500).send({ error: "Internal Server Error", details: err.message });
      next(err);
    }
  }
);

// DELETE an event
eventsRouter.delete("/:event_id", requireUser, async (req, res, next) => {
  try {
    const { event_id } = req.params;
    const { id: user_id } = req.user;

    // First, fetch the event to check ownership and image
    const event = await getEventById(event_id);

    if (!event || event.user_id !== user_id) {
      return res.status(403).send({ error: "Not authorized or event not found." });
    }

    // 🌩️ Delete the image from Cloudinary (if exists)
    if (event.picture && event.picture.includes("res.cloudinary.com")) {
      const segments = event.picture.split("/");
      const filenameWithExt = segments.pop().split(".")[0]; // removes extension
      const folder = segments.slice(segments.indexOf("upload") + 1).join("/");
      const publicId = `${folder}/${filenameWithExt}`;

      await cloudinary.uploader.destroy(publicId); // Deletes from Cloudinary
    }

    // Delete event from DB
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
