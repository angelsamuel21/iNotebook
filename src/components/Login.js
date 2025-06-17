// e:\FullStackProjects\iNotebook\inotebook\src\components\Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link

const Login = (props) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... your existing login logic ...
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });
      const json = await response.json();
      if (response.ok && json.authToken) { // Check response.ok and existence of authToken
        // Save the auth token and redirect
        localStorage.setItem("token", json.authToken); // Use authToken
        await props.fetchUserDetails(); // Fetch user details after login
        navigate("/");
        props.showAlert("Logged in Successfully", "success");
      } else {
        props.showAlert(json.error || "Invalid Credentials", "danger");
      }
    } catch (error) {
      props.showAlert("An error occurred during login.", "danger");
      console.error("Login error:", error);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-3">
      <h2>Login to continue to iNotebook</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={credentials.email}
            onChange={onChange}
            aria-describedby="emailHelp"
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="passwordInput" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="passwordInput" // Changed from "password" to avoid conflict if you have another element with id "password"
            name="password"
            value={credentials.password}
            onChange={onChange}
            required
            autoComplete="current-password"
            minLength={6} // Corrected minLength to match backend
          />
        </div>
        {/* Flex container to hold Login button and Forgot Password link inline */}
        <div className="d-flex align-items-center ">
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          <Link
            to="/forgot-password"
            className="btn btn-warning text-decoration-none mx-3" /* Removed mt-2 as alignment is handled by flex parent */
          >
            Forgot Password?
          </Link>
        </div>
      </form>
      <p className="mt-3">
        Don't have an account? <Link to="/signup" className="text-decoration-none">Sign up here</Link>
      </p>
    </div>
  );
};

export default Login;
