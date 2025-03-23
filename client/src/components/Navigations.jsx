import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchUserAccount } from "../api";

const Navigations = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    async function getUser() {
      const data = await fetchUserAccount();
      if (data) {
        setUser(data);
      } else {
        setUser(null); // clear if fetch failed
      }
    }

    getUser();
  }, [location]); //  re-run when route changes (important after login)

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
    window.location.href = "/"; // force refresh
  };

  return (
    <div className="nav">
      {location.pathname !== "/" && (
        <Link to="/">
          <button className="nav-link">Home</button>
        </Link>
      )}

      {!user ? (
        <Link to="/users/login">
          <button className="nav-link">Login</button>
        </Link>
      ) : (
        <>
          <Link to="/users/account">
            <button className="nav-link">Account</button>
          </Link>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default Navigations;

