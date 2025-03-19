// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { fetchRegister } from "../api";

const Register = ({ setToken }) => {
  // const [formData, setFormData] = useState({
  //   name: "",
  //   username: "",
  //   password: "",
  //   location: "",
  //   picture: "",
  // });

  // const [error, setError] = useState(null);
  // const [token, setLocalToken] = useState(null); // Store the token locally
  // const navigate = useNavigate(); // Hook to navigate programmatically

  // async function handleSubmit(event) {
  //   event.preventDefault();
  //   setError(null); // Clear previous errors

  //   try {
  //     const registerData = await fetchRegister(formData);

  //     if (registerData?.error) {
  //       throw new Error(registerData.error);
  //     }

  //     if (registerData.token) {
  //       setToken(registerData.token); // Update App.js state
  //       setLocalToken(registerData.token); // Store locally for the Link button
  //       localStorage.setItem("token", registerData.token); // Persist login
  //       navigate("/users/account"); // Auto-redirect to Account page
  //       window.location.reload(); // Refresh page to update navigation
  //     } else {
  //       throw new Error("Registration failed. Please try again.");
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // }

  // return(
  //   <div>
  //     <h2>Sign Up</h2>
  //     {error && <p style={{ color: "red" }}>{error}</p>}

  //     <form onSubmit={handleSubmit}>
  //         <div className="input-container">
  //             <label>
  //               <input
  //                 type="text"
  //                 value={formData.name}
  //                 placeholder="Name"
  //                 onChange={(e) => {
  //                   setFormData((prev) => ({
  //                     ...prev,
  //                     name: e.target.value,
  //                   }));
  //                 }}
  //               />
  //             </label>
  //         </div>

  //         <div className="input-container">
  //             <label>
  //               <input
  //                 type="text"
  //                 value={formData.username}
  //                 placeholder="Username"
  //                 onChange={(e) => {
  //                   setFormData((prev) => ({
  //                     ...prev,
  //                     username: e.target.value,
  //                   }));
  //                 }}
  //               />
  //             </label>
  //         </div>

  //         <div className="input-container">
  //             <label>
  //               <input
  //                 type="text"
  //                 value={formData.name}
  //                 placeholder="Name"
  //                 onChange={(e) => {
  //                   setFormData((prev) => ({
  //                     ...prev,
  //                     name: e.target.value,
  //                   }));
  //                 }}
  //               />
  //             </label>
  //         </div>

  //         <div className="input-container">
  //             <label>
  //               <input
  //                 type="text"
  //                 value={formData.name}
  //                 placeholder="Name"
  //                 onChange={(e) => {
  //                   setFormData((prev) => ({
  //                     ...prev,
  //                     name: e.target.value,
  //                   }));
  //                 }}
  //               />
  //             </label>
  //         </div>

  //         <div className="input-container">
  //             <label>
  //               <input
  //                 type="text"
  //                 value={formData.name}
  //                 placeholder="Name"
  //                 onChange={(e) => {
  //                   setFormData((prev) => ({
  //                     ...prev,
  //                     name: e.target.value,
  //                   }));
  //                 }}
  //               />
  //             </label>
  //         </div>

  //         <button className="form-button" type="submit">
  //           Register
  //         </button>
  //       </form>
  //   </div>
  // )
};

export default Register;
