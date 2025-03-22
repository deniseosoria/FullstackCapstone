import { useState, useEffect } from "react";
import {
  fetchUserAccount,
  fetchUserEvents,
  fetchUpdateUser,
  fetchCreateEvent,
  fetchUpdateEvent,
  fetchDeleteEvent,
} from "../api";
import EventForm from "./EventForm"; // adjust the path as needed

const Account = ({ token }) => {
  const [user, setUser] = useState(null);
  const [userEvents, setUserEvents] = useState([]);
  const [updateUser, setUpdateUser] = useState(null);
  const [newUserEvent, setNewUserEvent] = useState(null);
  const [updateEvent, setUpdateEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("accountInfo");
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!token) {
    return <p>Please log in or create an account.</p>;
  }

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await fetchUserAccount(token);
        console.log("User Account:", userData);
        setUser(userData);

        if (!userData?.id) {
          console.error("No user ID available yet.");
          return;
        }

        const userEventsData = await fetchUserEvents(userData.id);
        console.log("Fetched Events:", userEventsData);
        setUserEvents(userEventsData);
      } catch (err) {
        setError("Error fetching account details.");
      }
    }

    fetchUserData();
  }, [token]);

  async function handleUserUpdate(updatedData) {
    try {
      const updateUserData = await fetchUpdateUser(updatedData, token);
      setUpdateUser(updateUserData);
      setSuccess("User updated successfully.");
    } catch (err) {
      setError("Failed to update user.");
    }
  }

  async function handleCreateEvent(formData) {
    try {
      const createEventData = await fetchCreateEvent(formData, token);
      setNewUserEvent(createEventData);
      setUserEvents((prev) => [...prev, createEventData]);
      setSuccess("Event created successfully.");
      setShowCreateForm(false);
    } catch (err) {
      setError("Failed to create event.");
    }
  }

  async function handleEventUpdate(eventId, formData) {
    try {
      const updateEventData = await fetchUpdateEvent(eventId, formData, token);
      setUpdateEvent(updateEventData);
      setUserEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === eventId ? updateEventData : event))
      );
      setSuccess("Event updated successfully.");
      setEditingEvent(null);
    } catch (err) {
      setError("Failed to update event.");
    }
  }

  async function handleRemoveEvent(eventId) {
    try {
      const deleted = await fetchDeleteEvent(eventId, token);
      if (deleted?.event) {
        setUserEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        setDeleteEvent(deleted);
        setSuccess("Event deleted successfully.");
        setError(null);
      } else {
        throw new Error("Delete failed.");
      }
    } catch (err) {
      setError("Failed to delete event.");
      setSuccess(null);
    }
  }

  if (!user) {
    return <p>Loading account details...</p>;
  }

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
      </div>

      <div className="content">
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        {activeTab === "accountInfo" && (
          <div className="accountInfo">
            <h2>Welcome, {user.name || "User"}!</h2>
            <h3>User ID: {user.id || "Unknown ID"}</h3>
            <h3>First Name: {user.name || "Unknown"}</h3>
            <h3>Username: {user.username || "Unknown"}</h3>
          </div>
        )}

        {activeTab === "manageEvents" && (
          <div className="manageEvents">
            <h3>Your Events:</h3>

            <button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "Cancel" : "Create New Event"}
            </button>

            {showCreateForm && (
              <EventForm onSubmit={handleCreateEvent} />
            )}

            {editingEvent && (
              <EventForm
                initialData={editingEvent}
                onSubmit={(formData) => handleEventUpdate(editingEvent.id, formData)}
              />
            )}

            {Array.isArray(userEvents) && userEvents.length > 0 ? (
              <ul className="user-event-list">
                {userEvents.map((event) => (
                  <li key={event.id}>
                    <h4>{event.event_name}</h4>
                    <img
                      src={event.picture || "https://placehold.co/220x220/zzz/000?text=NoEventImage"}
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://placehold.co/220x220/zzz/000?text=NoEventImage")
                      }
                      alt={event.event_name}
                      style={{ maxWidth: "220px", height: "auto" }}
                    />
                    <div>
                      <button onClick={() => (window.location.href = `/event/${event.id}`)}>View</button>
                      <button onClick={() => setEditingEvent(event)}>Edit</button>
                      <button onClick={() => handleRemoveEvent(event.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You have no created events.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
