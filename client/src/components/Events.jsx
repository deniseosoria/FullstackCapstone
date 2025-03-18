import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../api";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getData() {
      try {
        const eventsData = await fetchEvents();
        if (!eventsData || eventsData.length === 0) {
          throw new Error("No events found.");
        }
        setEvents(eventsData);
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

  if (isLoading) return <h2>Loading events...</h2>;

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return <h2>No events found.</h2>;
  }

  return <div className="events">
    <h2>Events</h2>
    
    </div>;
};

export default Events;
