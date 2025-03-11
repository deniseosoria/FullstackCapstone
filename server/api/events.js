const express = require("express");
const eventsRouter = express.Router();


const { requireUser } = require("./utils");

const {
  createEvent,
  getAllEvents,
  updateEvent,
  getEventById,
  deleteEvent,
} = require("../db");

eventsRouter.get("/", async (req, res, next) => {
  try {
    res.send(await getAllEvents());
  } catch ({ name, message }) {
    next({ name, message });
  }
});

eventsRouter.post("/", requireUser, async (req, res, next) => {
  const { event_name,
    description,
    event_type,
    address,
    price,
    capacity,
    date,
    start_time,
    end_time,
    picture } = req.body;

  const eventData = {};

  try {
    eventData.user_id = req.user.id;
    eventData.event_name = event_name;
    eventData.description = description;
    eventData.event_type = event_type;
    eventData.address = address;
    eventData.price = price;
    eventData.capacity = capacity;
    eventData.date = date;
    eventData.start_time = start_time;
    eventData.end_time = end_time;
    eventData.picture = picture;


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
});

eventsRouter.patch("/:event_id", requireUser, async (req, res, next) => {
  const { event_id } = req.params;
  const { event_name,
    description,
    event_type,
    address,
    price,
    capacity,
    date,
    start_time,
    end_time,
    picture } = req.body;

  const updateFields = {};

  if (event_name) {
    updateFields.event_name = event_name;
  }

  if (description) {
    updateFields.description = description;
  }

  if (event_type) {
    updateFields.event_type = event_type;
  }

  if (address) {
    updateFields.address = address;
  }

  if (price) {
    updateFields.price = price;
  }

  if (capacity) {
    updateFields.capacity = capacity;
  }

  if (date) {
    updateFields.date = date;
  }

  if (start_time) {
    updateFields.start_time = start_time;
  }

  if (end_time) {
    updateFields.end_time = end_time;
  }

  if (picture) {
    updateFields.picture = picture;
  }

  try {
    const originalEvent = await getEventById(event_id);

    if (originalEvent.user_id === req.user.id) {
      const updatedEvent = await updateEvent(event_id, updateFields);
      res.send({ event: updatedEvent });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a event that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

eventsRouter.delete("/:event_id", async (req, res, next) => {
  try {
    const { event_id } = req.params;

    const deletedEvent = await deleteEvent(event_id);

    if (deletedEvent) {
      res.send({ event: deletedEvent });
    } else {
      next({
        name: "EventNotFoundError",
        message: "Event not found.",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = eventsRouter;
