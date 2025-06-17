import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = (props) => {
  // Accept props for showAlert
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true
    // Fallback showAlert if not provided via props
    const showAlert =
      props.showAlert || ((msg, type) => alert(`${type}: ${msg}`));

    const { name, email, password } = credentials;
    if (credentials.password !== credentials.cpassword) {
      showAlert("Passwords do not match!", "danger");
      setLoading(false); // Reset loading state
      return;
    }
    try {
      // API Call to your backend signup endpoint
      // Ensure your backend has a route like /api/auth/createuser
      // The "TypeError: Failed to fetch" would originate from this fetch call if connection fails
      // Use environment variable for API base URL. It MUST be set in the deployment environment.
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

      const response = await fetch(`${apiBaseUrl}/api/auth/createuser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!apiBaseUrl) {
        showAlert("API URL not configured. Please check deployment settings.", "danger");
        return;
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Invalid response from server" }));
        showAlert(
          errorData.error || errorData.message || `Error: ${response.status}`,
          "danger"
        );
        setLoading(false); // Reset loading state
        return;
      }

      const json = await response.json();
      if (json.authToken) {
        // Check for the presence of authToken as an indicator of success
        // Save the auth token and redirect
        localStorage.setItem("token", json.authToken);
        showAlert("Account created successfully!", "success");
        props.fetchUserDetails(); // Fetch user details after signup
        navigate("/");
      } else {
        showAlert(
          json.error || json.message || "Signup failed. Please try again.",
          "danger"
        );
      }
    } catch (error) {
      console.error("Signup failed:", error);
      showAlert(
        "Signup request failed. Could not connect to server. Please ensure the server is running and check your network connection.",
        "danger"
      );
    } finally {
      setLoading(false); // Reset loading state in all cases
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="container mt-3">
      <h2>Create an account to use iNotebook</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            aria-describedby="emailHelp"
            onChange={onChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            onChange={onChange}
            minLength={5}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="cpassword"
            name="cpassword"
            onChange={onChange}
            minLength={5}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
