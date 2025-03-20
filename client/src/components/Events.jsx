import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAllEvents } from "../api/index"; // Adjust path if needed

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getData() {
      try {
        const eventsData = await fetchEvents();
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

    // Convert date string into a Date object
    const eventDate = new Date(dateString);
    if (isNaN(eventDate)) return "Invalid Date";

    // Format the date (e.g., "Saturday, March 25")
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long", // Saturday
      month: "long", // March
      day: "numeric", // 25
    });

    // Handle time properly
    const [hours, minutes] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return formattedDate; // If time is invalid, return only the date

    const hours12 = (hours % 12) || 12; // Convert 24h to 12h format
    const amPm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${hours12}:${minutes.toString().padStart(2, "0")} ${amPm}`;

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
              <h4>{event.price !== null && event.price !== undefined ? (event.price === 0 ? "Free" : `$${event.price}`) : "Price Unavailable"}</h4>
            </div>
            <img
              src={event.picture && event.picture.trim() ? event.picture : "https://placehold.co/150x220/zzz/000?text=NoImage"}
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

