import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navigations = () => {
  return (
    <div className="nav">
      <Link to="/">
        <button className="nav-link">Home</button>
      </Link>
      <Link to="/users/login">
        <button className="nav-link">Login</button>
      </Link>
      <Link to="/users/account">
        <button className="nav-link">Account</button>
      </Link>
    </div>
  );
};

export default Navigations;
