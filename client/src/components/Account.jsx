import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchUserAccount,
  fetchUserEvents,
  fetchUpdateUser,
  fetchCreateEvent,
  fetchUpdateEvent,
  fetchDeleteEvent,
  fetchUserFavorites,
  fetchUserBookings,
  fetchCancelBooking,
  fetchUnfavorite,
} from "../api";
import EventForm from "./EventForm";
import "../Account.css";

const Account = ({ token }) => {
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [bookedEvents, setBookedEvents] = useState([]);
  const [favoriteEvents, setFavoriteEvents] = useState([]);
  const [newUserEvent, setNewUserEvent] = useState(null);
  const [updateEvent, setUpdateEvent] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("manageEvents");
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editUserForm, setEditUserForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "" });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await fetchUserAccount(token);
        setUser(userData);
        setFormData({ name: userData.name, username: userData.username });

        if (!userData?.id) return;

        const userEventsData = await fetchUserEvents(userData.id);
        setUserEvents(userEventsData);

        const favorites = await fetchUserFavorites(token);
        setFavoriteEvents(favorites);

        const bookings = await fetchUserBookings(token);
        setBookedEvents(bookings);
      } catch (err) {
        setError("Error fetching account details.");
      }
    }
    fetchUserData();
  }, [token]);

  async function handleUserUpdate(e) {
    e.preventDefault();
    try {
      const updateUserData = await fetchUpdateUser(formData, token);
      setUser(updateUserData);
      setSuccess("User updated successfully.");
      setEditUserForm(false);
    } catch (err) {
      setError("Failed to update user.");
    }
  }

  async function handleCreateEvent(formData) {
    try {
      const { event: createEventData } = await fetchCreateEvent(formData, token);
  
      setUserEvents((prev) => [...prev, createEventData]);
      setNewUserEvent(createEventData);
      setSuccess("Event created successfully.");
      setShowCreateForm(false);
    } catch (err) {
      setError("Failed to create event.");
    }
  }
  

  const handleEventUpdate = async (eventId, formData) => {
    try {
      const updated = await fetchUpdateEvent(eventId, formData, token);

      setUserEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === eventId ? updated : event))
      );

      setEditingEvent(null); // Hide form
      setSuccess("Event updated successfully.");
    } catch (err) {
      setError("Failed to update event.");
    }
  };

  async function handleRemoveEvent(eventId) {
    try {
      const deleted = await fetchDeleteEvent(eventId, token);
      if (deleted?.event) {
        setUserEvents((prev) => prev.filter((event) => event.id !== eventId));
        setSuccess("Event deleted successfully.");
      } else {
        throw new Error("Delete failed.");
      }
    } catch (err) {
      setError("Failed to delete event.");
    }
  }

  async function handleCancelBooking(eventId) {
    try {
      await fetchCancelBooking(eventId, token);
      setBookedEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSuccess("Booking canceled.");
    } catch (err) {
      setError("Failed to cancel booking.");
    }
  }

  async function handleRemoveFavorite(eventId) {
    try {
      await fetchUnfavorite(eventId, token);
      setFavoriteEvents((prev) => prev.filter((e) => e.id !== eventId));
      setSuccess("Favorite removed.");
    } catch (err) {
      setError("Failed to remove favorite.");
    }
  }

  function handleSortBookings(option) {
    const sorted = [...bookedEvents].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return option === "past" ? dateB - dateA : dateA - dateB;
    });
    setBookedEvents(sorted);
  }

  const formatEventDate = (dateString, timeString) => {
    const eventDate = new Date(dateString);
    if (isNaN(eventDate)) return "Invalid Date";

    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const [hours, minutes] = timeString?.split(":")?.map(Number) || [];
    if (isNaN(hours) || isNaN(minutes)) return formattedDate;

    const hours12 = hours % 12 || 12;
    const amPm = hours >= 12 ? "PM" : "AM";
    return `${formattedDate} ${hours12}:${minutes
      .toString()
      .padStart(2, "0")} ${amPm}`;
  };

  const filteredBookedEvents = bookedEvents.filter((event) =>
    event.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token) return <p>Please log in or create an account.</p>;
  if (!user) return <p>Loading account details...</p>;

  return (
    <div className="account-container">
      <div className="sidebar">
        <h3>Account</h3>
        <button
          className={activeTab === "accountInfo" ? "active" : ""}
          onClick={() => setActiveTab("accountInfo")}
        >
          Account Info
        </button>
        <button
          className={activeTab === "manageEvents" ? "active" : ""}
          onClick={() => setActiveTab("manageEvents")}
        >
          Manage Events
        </button>
        <button
          className={activeTab === "bookedEvents" ? "active" : ""}
          onClick={() => setActiveTab("bookedEvents")}
        >
          Booked Events
        </button>
        <button
          className={activeTab === "favoriteEvents" ? "active" : ""}
          onClick={() => setActiveTab("favoriteEvents")}
        >
          Favorite Events
        </button>
      </div>

      <div className="content">
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {activeTab === "accountInfo" && (
          <div className="account-info">
            <h2>Welcome, {user.name}!</h2>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>

            {editUserForm ? (
              <form onSubmit={handleUserUpdate}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Username:
                  <input
                    type="text"
                    value={formData.username || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
                </label>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditUserForm(false)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <button onClick={() => setEditUserForm(true)}>Edit Info</button>
              </>
            )}
          </div>
        )}

        {activeTab === "manageEvents" && (
          <div className="manage-events">
            <h3>Your Events</h3>
            <button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "Cancel" : "Create New Event"}
            </button>
            {showCreateForm && <EventForm onSubmit={handleCreateEvent} />}
            {editingEvent && (
              <EventForm
                key={editingEvent.id} // forces re-render on update
                initialData={editingEvent}
                onSubmit={(formData) =>
                  handleEventUpdate(editingEvent.id, formData)
                }
              />
            )}

            <ul className="event-list">
              {userEvents.map((event) => (
                <li key={event.id}>
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
                  <div>
                    <button
                      onClick={() =>
                        (window.location.href = `/event/${event.id}`)
                      }
                    >
                      View
                    </button>
                    <button onClick={() => setEditingEvent(event)}>Edit</button>
                    <button onClick={() => handleRemoveEvent(event.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "bookedEvents" && (
          <div className="booked-events">
            <h3>Your Booked Events</h3>
            <input
              type="text"
              placeholder="Search booked events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select onChange={(e) => handleSortBookings(e.target.value)}>
              <option value="upcoming">Upcoming First</option>
              <option value="past">Past First</option>
            </select>
            <ul>
              {filteredBookedEvents.map((event) => (
                <li key={event.id}>
                  <h4>{event.event_name}</h4>
                  <p>{formatEventDate(event.date, event.start_time)}</p>
                  <button
                    onClick={() =>
                      (window.location.href = `/event/${event.id}`)
                    }
                  >
                    View
                  </button>
                  <button onClick={() => handleCancelBooking(event.id)}>
                    Cancel Booking
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "favoriteEvents" && (
          <div className="favorite-events">
            <h3>Your Favorite Events</h3>
            <ul>
              {favoriteEvents.map((event) => (
                <li key={event.id}>
                  <Link to={`/event/${event.id}`}>
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
                    <p>{formatEventDate(event.date, event.start_time)}</p>
                  </Link>
                  <button onClick={() => handleRemoveFavorite(event.id)}>
                    Remove Favorite
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
