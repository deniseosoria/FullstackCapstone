// src/components/EventCard.jsx
import React from "react";
import "../EventCard.css";

const EventCard = ({
  event,
  onView,
  onEdit,
  onDelete,
  onCancelBooking,
  onRemoveFavorite,
  showView = true,
  showEdit = false,
  showDelete = false,
  showCancel = false,
  showRemoveFavorite = false,
}) => {
  const formatDate = (dateString, timeString) => {
    const date = new Date(dateString);
    const [hours, minutes] = timeString?.split(":").map(Number) || [];
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${date.toLocaleDateString("en-US")} ${hour12}:${String(
      minutes
    ).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="event-card">
      <h4>{event.event_name}</h4>
      <img
        src={
          event.picture?.trim()
            ? `http://localhost:3001/uploads/${event.picture}`
            : "https://placehold.co/150x220/zzz/000?text=NoImage"
        }
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/150x220/zzz/000?text=NoImage")
        }
        alt={event.event_name || "Event Image"}
      />
      <p>{formatDate(event.date, event.start_time)}</p>

      <div className="event-buttons">
        {showView && (
          <button onClick={() => onView?.(event.id)}>View</button>
        )}
        {showEdit && (
          <button onClick={() => onEdit?.(event)}>Edit</button>
        )}
        {showDelete && (
          <button onClick={() => onDelete?.(event.id)}>Delete</button>
        )}
        {showCancel && (
          <button onClick={() => onCancelBooking?.(event.id)}>Cancel Booking</button>
        )}
        {showRemoveFavorite && (
          <button onClick={() => onRemoveFavorite?.(event.id)}>Remove Favorite</button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
