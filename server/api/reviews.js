const express = require("express");
const reviewsRouter = express.Router();
const { requireUser } = require("./utils");
const { addReview, getEventReviews, editReview, deleteReview } =
  require("../db/db");

// GET reviews for an event (No authentication required)
reviewsRouter.get("/event/:event_id", async (req, res, next) => {
  try {
    const reviews = await getEventReviews(req.params.event_id);
    res.status(200).send(reviews);
  } catch ({ name, message }) {
    next({ name, message });
  }
});

reviewsRouter.post("/event/:event_id", requireUser, async (req, res, next) => {
  const { event_id } = req.params;
  const { rating, text_review } = req.body;

  if (!event_id || !rating || !text_review) {
    return next({
      name: "MissingFieldsError",
      message: "All fields (event_id, rating, text_review) are required.",
    });
  }

  try {
    const review = await addReview(req.user.id, event_id, rating, text_review);

    if (review) {
      res.status(201).send(review);
    } else {
      next({
        name: "CreationError",
        message: "There was an error creating your review. Please try again.",
      });
    }
  } catch (error) {
    next(error);
  }
});

// PATCH (edit) a review (Requires authentication)
reviewsRouter.patch("/event/:event_id", requireUser, async (req, res, next) => {
  const { event_id } = req.params;
  const { rating, text_review } = req.body;
  const user_id = req.user.id;

  if (!rating && !text_review) {
    return next({
      name: "MissingFieldsError",
      message:
        "At least one field (rating or text_review) is required to update.",
    });
  }

  try {
    // Ensure the user can only edit their own review
    const updatedReview = await editReview(user_id, event_id, {
      rating,
      text_review,
    });

    if (updatedReview) {
      res.status(200).send(updatedReview);
    } else {
      next({
        name: "EditError",
        message:
          "Error updating review. Either review doesn't exist or you don't have permission.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

reviewsRouter.delete("/:review_id", requireUser, async (req, res, next) => {
  try {
    const { review_id } = req.params;
    const { id: user_id } = req.user; // Extract user_id from authenticated user

    const deletedReview = await deleteReview(review_id, user_id);

    if (deletedReview) {
      res.status(204).send(); // No content on successful deletion
    } else {
      next({
        name: "ReviewNotFoundError",
        message: "Review not found or you don't have permission to delete it.",
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = reviewsRouter;
