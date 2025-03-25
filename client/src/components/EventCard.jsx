// src/components/EventCard.jsx
import React from "react";
import "../EventCard.css";

const IMAGE_BASE_URL = "http://localhost:3001/uploads/";

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

  const imageUrl = event.picture?.trim()
    ? `${IMAGE_BASE_URL}${event.picture}`
    : "https://placehold.co/150x220/zzz/000?text=No+Image";

  return (
    <div className="event-card">
      <h4>{event.event_name}</h4>
      <img
        src={imageUrl}
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/150x220/zzz/000?text=Image+Unavailable")
        }
        alt={event.event_name || "Event"}
      />
      <p>{formatDate(event.date, event.start_time)}</p>

      <div className="event-buttons">
        {showView && <button onClick={() => onView?.(event.id)}>View</button>}
        {showEdit && <button onClick={() => onEdit?.(event)}>Edit</button>}
        {showDelete && (
          <button onClick={() => onDelete?.(event.id)}>Delete</button>
        )}
        {showCancel && (
          <button onClick={() => onCancelBooking?.(event.id)}>
            Cancel Booking
          </button>
        )}
        {showRemoveFavorite && (
          <button onClick={() => onRemoveFavorite?.(event.id)}>
            Remove Favorite
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
