import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchEvents, fetchEventReviews } from "../api/index";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [reviewAverages, setReviewAverages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getData() {
      try {
        const eventsData = await fetchEvents();
        setEvents(eventsData);

        // Fetch reviews per event and calculate average
        const averages = {};
        for (const event of eventsData) {
          const reviews = await fetchEventReviews(event.id);
          if (reviews.length) {
            const avg = (
              reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            ).toFixed(1);
            averages[event.id] = avg;
          }
        }
        setReviewAverages(averages);
      } catch (err) {
        setError(
          err.message || "Failed to load events. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    }

    getData();
  }, []);

  const formatEventDate = (dateString, timeString) => {
    if (!dateString || !timeString) return "Unknown Date & Time";

    const eventDate = new Date(dateString);
    if (isNaN(eventDate)) return "Invalid Date";

    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return formattedDate;

    const hours12 = hours % 12 || 12;
    const amPm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${hours12}:${minutes
      .toString()
      .padStart(2, "0")} ${amPm}`;

    return `${formattedDate} ${formattedTime}`;
  };

  if (isLoading) return <h2>Loading events...</h2>;

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!events.length) return <h2>No events found.</h2>;

  return (
    <div className="events">
      <h2>Events</h2>
      <div className="grid-container">
        {events.map((event) => (
          <Link className="grid-item" key={event.id} to={`/event/${event.id}`}>
            <div>
              <h3>{event.event_name || "Unknown Event"}</h3>
              {reviewAverages[event.id] && (
                <h3>Average Rating: {reviewAverages[event.id]}⭐</h3>
              )}
              <h4>{formatEventDate(event.date, event.start_time)}</h4>
              <h4>
                {event.price !== null && event.price !== undefined
                  ? event.price === 0
                    ? "Free"
                    : `$${event.price}`
                  : "Price Unavailable"}
              </h4>
            </div>
            <img
              src={
                event.picture?.trim() ||
                "https://placehold.co/150x220/zzz/000?text=NoImage"
              }
              onError={(e) =>
                (e.currentTarget.src =
                  "https://placehold.co/150x220/zzz/000?text=NoImage")
              }
              alt={event.event_name || "Event Image"}
              style={{ maxWidth: "150px", height: "auto" }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Events;
