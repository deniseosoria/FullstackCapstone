import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Navigation from "./components/Navigations";
import Events from "./components/Events";
import SingleEvent from "./components/SingleEvent";
import Login from "./components/Login";
import Register from "./components/Register";
import Account from "./components/Account";
import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Function to handle setting & persisting the token
  const handleSetToken = (newToken) => {
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("token", newToken); // Store token in localStorage
    } else {
      setToken(null);
      localStorage.removeItem("token"); // Remove token on logout
    }
  };

  return (
    <>
      <div className="app">
        <header>
          <h1>
            <Link to="/">Evently</Link>
          </h1>
          <nav>
            <Navigation />
          </nav>
        </header>
        <div>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Events />
                </>
              }
            />
            <Route path="/event/:id" element={<SingleEvent token={token} />} />
            <Route
              path="/users/login"
              element={<Login setToken={handleSetToken} token={token} />}
            />
            <Route
              path="/users/register"
              element={<Register setToken={handleSetToken} token={token} />}
            />
            <Route
              path="/users/account"
              element={
                token ? (
                  <Account token={token} />
                ) : (
                  <p>Please register or log in.</p>
                )
              }
            />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
