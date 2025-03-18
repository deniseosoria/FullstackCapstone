import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../api/index"; // Adjust path if needed

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getData() {
      try {
        const eventsData = await fetchEvents();
        if (!Array.isArray(eventsData)) {
          throw new Error("Invalid events data received.");
        }
        setEvents(eventsData);
      } catch (err) {
        setError(err.message || "Failed to load events. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    getData();
  }, []);

  if (isLoading) return <h2>Loading events...</h2>;

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!isLoading && events.length === 0) {
    return <h2>No events found.</h2>;
  }

  const formatEventDate = (dateString, timeString) => {
    if (!dateString || !timeString) return "Unknown Date & Time";

    // Convert date string into a proper Date object
    const eventDate = new Date(dateString);

    // Format the date (e.g., "Saturday, March 25")
    const formattedDate = eventDate.toLocaleDateString("en-US", {
        weekday: "long", // Saturday
        month: "long",   // March
        day: "numeric",  // 25
    });

    // Convert 24-hour time to 12-hour format
    const [hours, minutes, seconds] = timeString.split(":");
    const hours12 = (parseInt(hours) % 12) || 12; // Convert 24h to 12h format
    const amPm = parseInt(hours) >= 12 ? "PM" : "AM";

    // Format time (e.g., "10:00 PM")
    const formattedTime = `${hours12}:${minutes} ${amPm}`;

    return `${formattedDate} ${formattedTime}`;
};


  return (
    <div className="events">
      <h2>Events</h2>
      <div className="grid-container">
        {events.map((event) => (
          <Link className="grid-item" key={event.id} to={`/event/${event.id}`}>
            <div>
              <h3>{event.event_name || "Unknown Event"}</h3>
              <h4>{formatEventDate(event.date, event.start_time)}</h4>
              <h4>{event.price ? `$${event.price}` : "Free or Unknown Price"}</h4>
            </div>
            <img
              src={event.picture || "https://placehold.co/150x220/zzz/000?text=NoImage"}
              onError={(e) => (e.currentTarget.src = "https://placehold.co/150x220/zzz/000?text=NoImage")}
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
