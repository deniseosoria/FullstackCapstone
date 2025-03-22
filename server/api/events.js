const express = require("express");
const eventsRouter = express.Router();
const multer = require("multer");
const path = require("path");

const { requireUser } = require("./utils");

const { createEvent, getAllEvents, updateEvent, getEventById, getUserEvents, deleteEvent } =
  require("../db/db");

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
eventsRouter.use("/uploads", express.static("uploads"));

//  Get All Events
eventsRouter.get("/", async (req, res, next) => {
  try {
    const events = await getAllEvents();
    res.send(events);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

//  Create Event (with Image Upload)
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

      const eventData = {
        user_id: req.user.id,
        event_name,
        description,
        event_type,
        address,
        price,
        capacity,
        date,
        start_time,
        end_time,
        picture: req.file ? `/uploads/${req.file.filename}` : null, //  Store file path
      };

      const event = await createEvent(eventData);

      if (event) {
        res.send(event);
      } else {
        next({
          name: "CreationError",
          message: "There was an error creating your event. Please try again.",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  }
);

// Update Event (with Image Upload)
eventsRouter.patch(
  "/:event_id",
  requireUser,
  upload.single("picture"),
  async (req, res, next) => {
    try {
      const { event_id } = req.params;
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
      if (price) updateFields.price = price;
      if (capacity) updateFields.capacity = capacity;
      if (date) updateFields.date = date;
      if (start_time) updateFields.start_time = start_time;
      if (end_time) updateFields.end_time = end_time;
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
  }
);

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
    console.log(" Fetching events for user_id:", user_id);
    const events = await getUserEvents(user_id);
    console.log(" Events found:", events);
    res.send(events || []);
  } catch ({ name, message }) {
    next({ name, message });
  }
});



// 🔹 Delete Event
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
