import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = (props) => {
  const {
    showAlert,
    fetchUserDetails: appFetchUserDetails,
    user: appUser,
  } = props;
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [nameMessage, setNameMessage] = useState({ text: "", type: "" });
  const [passwordMessage, setPasswordMessage] = useState({
    text: "",
    type: "",
  });

  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const navigate = useNavigate();
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const fetchProfileDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // If appUser is null, App.js likely handled logout/session expiry.
      // Only show alert if not an immediate post-logout/session expiry scenario.
      if (appUser !== null) {
        showAlert("Please login to view your profile.", "warning");
      }
      navigate("/login");
      return;
    }

    // Optimistically set name from appUser for faster input field display,
    // but userData will be set by the fresh API call.
    if (appUser) {
      setName(appUser.name || "");
    }

    // Always attempt to fetch fresh data from the backend.
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/getuser`, {
        method: "GET",
        headers: { "auth-token": token },
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user); // Update with fresh data from the API
        setName(data.user.name || ""); // Update name from fresh data

        // If appFetchUserDetails is provided and the fetched user data
        // differs from appUser, call appFetchUserDetails to update App.js's state.
        if (appFetchUserDetails && data.user && (!appUser || appUser._id !== data.user._id || appUser.name !== data.user.name)) {
          appFetchUserDetails();
        }
      } else {
        // API call failed (e.g., 401 Unauthorized, token expired)
        localStorage.removeItem("token"); // Clear the invalid token
        showAlert("Session expired or invalid. Please login again.", "danger");
        navigate("/login"); // Redirect to login page
      }
    } catch (error) {
      console.error("Failed to fetch profile details:", error);
      // Avoid showing alert if navigation is about to happen due to token removal
      if (localStorage.getItem("token")) { // Only show if token wasn't just removed
        showAlert("Could not fetch profile details. Please try again later.", "danger");
      }
      // Consider removing token and navigating on critical fetch errors too,
      // or let App.js handle it if appFetchUserDetails fails.
    }
  }, [apiBaseUrl, navigate, showAlert, appUser, appFetchUserDetails]);

  useEffect(() => {
    fetchProfileDetails();
  }, [fetchProfileDetails]);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setLoadingName(true);
    setNameMessage({ text: "", type: "" });
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/updateprofile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (response.ok) {
        setNameMessage({
          text: data.message || "Name updated successfully!",
          type: "success",
        });
        setUserData(data.user); // Update local user data
        if (appFetchUserDetails) appFetchUserDetails(); // Re-fetch user details at App level
      } else {
        setNameMessage({
          text:
            data.message || data.errors?.[0]?.msg || "Failed to update name.",
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Name update error:", error);
      setNameMessage({
        text: "An error occurred while updating name.",
        type: "danger",
      });
    }
    setLoadingName(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: "", type: "" });

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({
        text: "New passwords do not match.",
        type: "danger",
      });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({
        text: "New password must be at least 6 characters.",
        type: "danger",
      });
      return;
    }

    setLoadingPassword(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/changepassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setPasswordMessage({
          text: data.message || "Password changed successfully!",
          type: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordMessage({
          text:
            data.message ||
            data.errors?.[0]?.msg ||
            "Failed to change password.",
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordMessage({
        text: "An error occurred while changing password.",
        type: "danger",
      });
    }
    setLoadingPassword(false);
  };

  // If there's a token, but we don't have userData yet (from the API fetch), show loading.
  // This allows appUser to provide initial values for controlled inputs like 'name'
  // without preventing the loading indicator while fresh data is fetched.
  if (!userData && localStorage.getItem("token")) {
    return <div className="container mt-5 text-center">Loading profile...</div>;
  }
  // If no token and no userData (e.g., navigated away after logout), render nothing or a placeholder.
  if (!userData && !localStorage.getItem("token")) {
    return null; // Or a message indicating user is logged out
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <h1 className="mb-4 text-center">User Profile</h1>

          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Account Information</h5>
              <p>
                <strong>Email:</strong> {userData?.email}
              </p>
              <p>
                <strong>Joined:</strong> {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Update Name</h5>
              {nameMessage.text && (
                <div className={`alert alert-${nameMessage.type} mt-2`}>
                  {nameMessage.text}
                </div>
              )}
              <form onSubmit={handleNameUpdate}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loadingName}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingName}
                >
                  {loadingName ? "Updating..." : "Update Name"}
                </button>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Change Password</h5>
              {passwordMessage.text && (
                <div className={`alert alert-${passwordMessage.type} mt-2`}>
                  {passwordMessage.text}
                </div>
              )}
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    disabled={loadingPassword}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loadingPassword}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmNewPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loadingPassword}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loadingPassword}
                >
                  {loadingPassword ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
