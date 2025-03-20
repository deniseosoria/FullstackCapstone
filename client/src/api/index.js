/** API Link */
export const API_URL = `http://localhost:3001/api`;

// ================================
// Log in/Register fetch
// ================================

export async function fetchLogin(formData) {
  try {
    console.log("Sending login request:", formData); // Debugging
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "IncorrectCredentialsError") {
        throw new Error("Username or password is incorrect");
      }
      throw new Error(result.message || "Login failed. Please try again.");
    }

    return result; // Expected { token, message }
  } catch (err) {
    return { error: err.message }; // Ensure the frontend receives an error
  }
}

export async function fetchRegister(formData) {
  try {
    console.log("Sending register request:", formData); // Debugging
    const response = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        username: formData.username,
        location: formData.location,
        password: formData.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "UserExistsError") {
        throw new Error("Account already exists. Please log in.");
      }
      throw new Error(result.message || "Registration failed.");
    }

    return result; // Expected { token, message }
  } catch (err) {
    return { error: err.message }; // Ensure the frontend receives an error
  }
}

// ================================
// Users fetch
// ================================

export async function fetchUserAccount() {
  try {
    const token = localStorage.getItem("token"); // Retrieve token from storage

    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    const response = await fetch(`${API_URL}/users/account`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Send token in header
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch account details");
    }

    const userData = await response.json();
    console.log("User Account:", userData);
    return userData; // Return user data if needed elsewhere
  } catch (error) {
    console.error("Error fetching account:", error.message);
    return null; // Return null if there's an error
  }
}

export async function fetchUpdateUser(userId, formData, token) {
  try {
    const formDataToSend = new FormData();

    if (formData.username) formDataToSend.append("username", formData.username);
    if (formData.password) formDataToSend.append("password", formData.password);
    if (formData.name) formDataToSend.append("name", formData.name);
    if (formData.location) formDataToSend.append("location", formData.location);

    if (formData.picture) {
      formDataToSend.append("picture", formData.picture); // Append image file if updated
    }

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
      body: formDataToSend, // FormData auto-sets correct headers
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.message.includes("You cannot update another user's profile")) {
        throw new Error(
          "You are not allowed to update another user's profile."
        );
      }
      throw new Error(result.message || "User update failed.");
    }

    return result; // Expected { message: "User updated successfully", user: updatedUser }
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchAllUsers() {
  try {
    const response = await fetch(`${API_URL}/users/`, {
      method: "GET",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch users.");
    }

    return result.users; // Expected { users: [...] }
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchDeleteUser(userId, token) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.message.includes("not allowed")) {
        throw new Error(
          "You are not allowed to delete another user's account."
        );
      }
      if (result.message.includes("User not found")) {
        throw new Error("User not found or already deleted.");
      }
      throw new Error(result.message || "User deletion failed.");
    }

    return result; // Expected { message: "User deleted successfully", user: deletedUser }
  } catch (err) {
    return { error: err.message };
  }
}

// ================================
// Events fetch
// ================================

export async function fetchEvents() {
  try {
    const response = await fetch(`${API_URL}/events/`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("API Response:", result); // Log to confirm format

    if (!Array.isArray(result)) {
      throw new Error("Invalid data format received.");
    }
    console.log(result);
    return result; // Directly return the array
  } catch (err) {
    console.error("Error fetching events:", err.message);
    return []; // Return an empty array on error
  }
}

export async function fetchUserEvents() {
  try {
    const response = await fetch(`/api/events/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const events = await response.json();
    console.log("User Events:", events);
    return events;
  } catch (error) {
    console.error("Failed to fetch user events:", error);
    return [];
  }
}

export async function fetchCreateEvent(formData, token) {
  try {
    const formDataToSend = new FormData();
    formDataToSend.append("event_name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("event_type", formData.category);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("price", formData.price); // Fixed
    formDataToSend.append("capacity", formData.capacity);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("start_time", formData.start_time);
    formDataToSend.append("end_time", formData.end_time);

    if (formData.picture) {
      formDataToSend.append("picture", formData.picture); // Append image file
    }

    const response = await fetch(`${API_URL}/events/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Ensure token is passed correctly
      },
      body: formDataToSend, // FormData auto-sets correct headers
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "EventExistsError") {
        throw new Error("Event already exists. Please log in.");
      }
      throw new Error(result.message || "Event creation failed.");
    }

    return result;
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchUpdateEvent(eventId, formData, token) {
  try {
    const formDataToSend = new FormData();

    if (formData.name) formDataToSend.append("event_name", formData.name);
    if (formData.description)
      formDataToSend.append("description", formData.description);
    if (formData.category)
      formDataToSend.append("event_type", formData.category);
    if (formData.address) formDataToSend.append("address", formData.address);
    if (formData.price) formDataToSend.append("price", formData.price);
    if (formData.capacity) formDataToSend.append("capacity", formData.capacity);
    if (formData.date) formDataToSend.append("date", formData.date);
    if (formData.start_time)
      formDataToSend.append("start_time", formData.start_time);
    if (formData.end_time) formDataToSend.append("end_time", formData.end_time);

    if (formData.picture) {
      formDataToSend.append("picture", formData.picture); // Append image file if updated
    }

    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
      body: formDataToSend, // FormData auto-sets correct headers
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "UnauthorizedUserError") {
        throw new Error("You cannot update an event that is not yours.");
      }
      throw new Error(result.message || "Event update failed.");
    }

    return result; // Expected { event: updatedEvent }
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchDeleteEvent(eventId, token) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "EventNotFoundError") {
        throw new Error(
          "Event not found or you don't have permission to delete it."
        );
      }
      throw new Error(result.message || "Event deletion failed.");
    }

    return result; // Expected { event: deletedEvent, message: "Event successfully deleted." }
  } catch (err) {
    return { error: err.message };
  }
}

// ================================
// Reviews fetch
// ================================

export async function fetchEventReviews(eventId) {
  try {
    const response = await fetch(`${API_URL}/reviews/${eventId}`, {
      method: "GET",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch reviews.");
    }

    return result; // Expected array of reviews
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchAddReview(eventId, rating, textReview, token) {
  try {
    const response = await fetch(`${API_URL}/reviews/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Authentication token
      },
      body: JSON.stringify({ rating, text_review: textReview }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "MissingFieldsError") {
        throw new Error(
          "All fields (event_id, rating, text_review) are required."
        );
      }
      throw new Error(result.message || "Failed to add review.");
    }

    return result; // Expected review object
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchEditReview(eventId, updatedData, token) {
  try {
    const response = await fetch(`${API_URL}/reviews/${eventId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Authentication token
      },
      body: JSON.stringify(updatedData),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "MissingFieldsError") {
        throw new Error(
          "At least one field (rating or text_review) is required to update."
        );
      }
      throw new Error(result.message || "Failed to update review.");
    }

    return result; // Expected updated review object
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchDeleteReview(reviewId, token) {
  try {
    const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    if (!response.ok) {
      const result = await response.json();
      if (result.name === "ReviewNotFoundError") {
        throw new Error(
          "Review not found or you don't have permission to delete it."
        );
      }
      throw new Error(result.message || "Failed to delete review.");
    }

    return { message: "Review deleted successfully" }; // No content expected in response
  } catch (err) {
    return { error: err.message };
  }
}

// ================================
// Bookings fetch
// ================================

export async function fetchCreateBooking(eventId, token) {
  try {
    const response = await fetch(`${API_URL}/bookings/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Authentication token
      },
      body: JSON.stringify({ event_id: eventId }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.error.includes("Missing user_id or event_id")) {
        throw new Error("Invalid request. User ID or Event ID is missing.");
      }
      throw new Error(result.message || "Booking creation failed.");
    }

    return result; // Expected booking object
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchUserBookings(token) {
  try {
    const response = await fetch(`${API_URL}/bookings/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch user bookings.");
    }

    return result; // Expected array of bookings
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchCancelBooking(eventId, token) {
  try {
    const response = await fetch(`${API_URL}/bookings/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "BookingNotFoundError") {
        throw new Error("No booking found for this event or user.");
      }
      throw new Error(result.message || "Booking cancellation failed.");
    }

    return result; // Expected { message: "Booking canceled successfully.", booking: canceledBooking }
  } catch (err) {
    return { error: err.message };
  }
}

// ================================
// Favorites fetch
// ================================

export async function fetchAddFavorite(eventId, token) {
  try {
    const response = await fetch(`${API_URL}/favorites/${eventId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.error.includes("Missing user_id or event_id")) {
        throw new Error("Invalid request. User ID or Event ID is missing.");
      }
      throw new Error(result.message || "Failed to add favorite event.");
    }

    return result; // Expected favorite event object
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchUserFavorites(token) {
  try {
    const response = await fetch(`${API_URL}/favorites/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch user favorites.");
    }

    return result; // Expected array of favorite events
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchRemoveFavorite(eventId, token) {
  try {
    const response = await fetch(`${API_URL}/favorites/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // Authentication token
      },
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.name === "FavoriteNotFoundError") {
        throw new Error("No favorite found for this event or user.");
      }
      throw new Error(result.message || "Failed to remove favorite event.");
    }

    return result; // Expected { message: "Favorite removed successfully.", favorite: removedFav }
  } catch (err) {
    return { error: err.message };
  }
}
