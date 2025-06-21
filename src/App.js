import "./App.css";
import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import {
  Routes, // Changed from Switch
  Route,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import { Home } from "./components/Home";
import About from "./components/About";
import NoteState from "./context/notes/NoteState"; // Changed 'Context' to 'context' (lowercase)
import { Alert } from "./components/Alert";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword"; // Import the new component
import UserProfile from "./components/UserProfile"; // Import UserProfile
import Footer from "./components/Footer"; // Import the Footer component

function App() {
  const [alert, setAlert] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const showAlert = useCallback((message, type) => {
    setAlert({
      message: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 3000); // Alert disappears after 3 seconds
  }, []); // No dependencies, so it's created once

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  const fetchUserDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/getuser`, {
          method: "GET", // Corrected: Was implicitly POST if method not specified, now explicitly GET
          headers: {
            // 'Content-Type': 'application/json', // Not strictly needed for GET if no body
            "auth-token": token,
          }, // No body for GET request
        });
        if (response.ok) {
          const userData = await response.json();
          console.log("App.js: Fetched user data from /getuser:", userData); // Debug log
          // Ensure userData.user exists and is a valid object
          if (userData && userData.user && typeof userData.user === "object") {
            setUser(userData.user); // Set the nested user object to the state
            console.log("App.js: User state updated with:", userData.user); // Debug log
          } else {
            // If response is OK but user data is malformed, treat as invalid session
            localStorage.removeItem("token");
            setUser(null);
            showAlert(
              "Invalid user data received. Please login again.",
              "warning"
            );
            navigate("/login");
          }
        } else {
          // Invalid token or other server-side error
          localStorage.removeItem("token");
          setUser(null);
          console.log("App.js: Invalid token or server error, logging out."); // Debug log
          showAlert(
            "Session expired or invalid. Please login again.",
            "warning"
          );
          navigate("/login"); // Redirect to login
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        localStorage.removeItem("token"); // Ensure token is removed on fetch error
        setUser(null);
        console.log("App.js: Fetch user details failed, logging out."); // Debug log
        showAlert("Could not verify session. Please login.", "danger");
        navigate("/login"); // Redirect to login
      }
    } else {
      setUser(null);
      console.log("App.js: No token found, user is logged out."); // Debug log
      // No token, so user is not logged in.
      // Protected routes will handle their own redirection if accessed directly.
    }
  }, [navigate, showAlert, apiBaseUrl]); // navigate and showAlert are now stable dependencies

  useEffect(() => {
    // Only attempt to fetch user details if a token exists
    if (localStorage.getItem("token")) {
      fetchUserDetails();
    }
    // Since fetchUserDetails is now memoized, it can be included in the dependency array
    // if there are scenarios where App.js itself might need to re-trigger it based on its own state/prop changes.
    // For an initial load, an empty array is fine, or [fetchUserDetails] if it should re-run if its own deps change.
    // For this specific effect (initial load check), [] is common.
  }, [fetchUserDetails]); // Added fetchUserDetails as it's now memoized

  const handleUserLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    showAlert("Logged out successfully!", "success");
    // Navigation to /login will be handled by Navbar component
  };

  return (
    <>
      <NoteState>
        {/* This outer div will be the main flex container for the app layout */}
        <div className="d-flex flex-column min-vh-100">
          {" "}
          {/* Bootstrap classes for flex column and min viewport height */}
          <Navbar user={user} handleLogout={handleUserLogout} />{" "}
          {/* Pass user and new logout handler */}
          <Alert alertDetails={alert} /> {/* Pass alertDetails object */}
          {/* This div is the main content area that should grow */}
          <main className="container flex-grow-1">
            {" "}
            {/* Bootstrap class for grow, and 'main' semantic tag */}
            <Routes>
              <Route exact path="/" element={<Home showAlert={showAlert} />} />
              <Route exact path="/about" element={<About />} />
              <Route
                exact
                path="/login"
                element={
                  <Login
                    showAlert={showAlert}
                    fetchUserDetails={fetchUserDetails}
                  />
                }
              />{" "}
              {/* Pass showAlert and fetchUserDetails */}
              <Route
                exact
                path="/signup"
                element={
                  <Signup
                    showAlert={showAlert}
                    fetchUserDetails={fetchUserDetails}
                  />
                }
              />{" "}
              {/* Pass showAlert and fetchUserDetails */}
              <Route
                exact
                path="/forgot-password"
                element={<ForgotPassword />}
              />{" "}
              {/* Add the route */}
              <Route
                exact
                path="/profile"
                element={
                  <UserProfile
                    showAlert={showAlert}
                    fetchUserDetails={fetchUserDetails}
                    user={user}
                  />
                }
              />
            </Routes>
          </main>
          <Footer />{" "}
          {/* Footer will be pushed down by mt-auto because its parent is a flex column */}
        </div>
      </NoteState>
    </>
  );
}
export default App;
