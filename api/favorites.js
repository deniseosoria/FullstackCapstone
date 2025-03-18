const express = require("express");
const favoritesRouter = express.Router();

const { requireUser } = require("./utils");

const { addFavorite, getUserFavorites, removeFavorite } = require("../db");

// Create a favotite event
favoritesRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const { id: user_id } = req.user;
    const { event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({ error: "Missing user_id or event_id." });
    }

    const favorite = await addFavorite({ user_id, event_id });
    if (favorite) {
      res.send(favorite);
    } else {
      next({
        name: "CreationError",
        message: "There was an error creating your favorite event. Please try again.",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// Get a user's favorites
favoritesRouter.get("/:id", requireUser, async (req, res, next) => {
    try {
        const { id: user_id } = req.user;
        res.send(await getUserFavorites(user_id));
      }catch (error) {
        console.error("Error fetching favorites:", error);
        next(error);
      }
})

// Cancel a favorite event
favoritesRouter.delete("/:event_id", requireUser, async (req, res, next) => {
    try {
      const { id: user_id } = req.user; // Extract user_id from authenticated user
      const { event_id } = req.params;
  
      const removedFav = await removeFavorite(user_id, event_id);
  
      if (removedFav) {
        res.status(200).json({
          message: "Favorite removed successfully.",
          favorite: removedFav
        });
      } else {
        res.status(404).json({
          name: "FavoriteNotFoundError",
          message: "No favorite found for this event or user.",
        });
      }
    } catch (error) {
      next(error);
    }
  });
  

module.exports = favoritesRouter;
