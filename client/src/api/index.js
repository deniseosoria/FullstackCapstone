// const API_URL = "http://localhost:3001/api"; // Base API URL

export async function fetchAllEvents() {
    try {
        const response = await fetch("http://localhost:3000/api/events/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const events = await response.json();
        console.log("Fetched events:", events); // ✅ Log response
        return events;
    } catch (error) {
        console.error("Failed to fetch events:", error.message);
        return []; // Return an empty array to prevent errors in `map()`
    }
}


// export async function fetchLogin(formData) {
//     try {
//       const response = await fetch(
//         `${API_URL}/users/login`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             email: formData.username,
//             password: formData.password,
//           }),
//         }
//       );
  
//       const result = await response.json();
  
//       if (!response.ok) {
//         if (result.name === "IncorrectCredentialsErrorr") {
//           throw new Error("Username or password is incorrect");
//         }
//         throw new Error(result.message || "Login failed.");
//       }
  
//       return result; // Expected { token, message }
//     } catch (err) {
//       return { error: err.message }; // Ensure the frontend receives an error
//     }
//   }

//   export async function fetchRegister(formData) {
//     try {
//       const response = await fetch(
//         `${API_URL}/users/register`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             name: formData.name,
//             username: formData.username,
//             password: formData.password,
//             location: formData.location,
//             picture: formData.picture
//           }),
//         }
//       );
  
//       const result = await response.json();
  
//       if (!response.ok) {
//         if (result.name === "UserExistsError") {
//           throw new Error("Account already exists. Please log in.");
//         }
//         throw new Error(result.message || "Registration failed.");
//       }
  
//       return result; // Expected { token, message }
//     } catch (err) {
//       return { error: err.message }; // Ensure the frontend receives an error
//     }
//   }
  

// export async function fetchUserAccount {
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
