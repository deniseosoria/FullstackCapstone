/** API Link */
export const API_URL = `http://localhost:3001/api`;

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
        const response = await fetch(`${API_URL}/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
            location: formData.location,
            password: formData.password,
          }),
        }
      );

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

// const fetchUserAccount = async () => {
//     try {
//         const token = localStorage.getItem("token"); // Retrieve token from storage

//         if (!token) {
//             throw new Error("No authentication token found. Please log in.");
//         }

//         const response = await fetch(`${API_URL}/users/account`, {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`, // Send token in header
//                 "Content-Type": "application/json",
//             },
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || "Failed to fetch account details");
//         }

//         const userData = await response.json();
//         console.log("User Account:", userData);
//         return userData; // Return user data if needed elsewhere
//     } catch (error) {
//         console.error("Error fetching account:", error.message);
//         return null; // Return null if there's an error
//     }
// };
