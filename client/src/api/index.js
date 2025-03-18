const API_URL = "http://localhost:3000/api"; // Base API URL

export async function fetchEvents() {
    try {
        const response = await fetch(`${API_URL}/events/`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!Array.isArray(result)) {
            throw new Error("Invalid data format received.");
        }
        return result;
        
    } catch (err) {
        console.error("Error fetching events:", err.message);
        return []; // Return an empty array on error
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
