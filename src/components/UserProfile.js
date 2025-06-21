import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = (props) => {
  const {
    showAlert,
    fetchUserDetails: appFetchUserDetails,
    user: appUser,
  } = props; // appUser is the user object from App.js
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
  // Use environment variable for API base URL. It MUST be set in the deployment environment.
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  // Effect to handle initial load and updates to appUser
  useEffect(() => {
    // If appUser is available, set the name for the input field.
    // This ensures the input field is populated with the current user's name
    // and updates if appUser changes (e.g., after a name update in App.js).
    if (appUser) {
      setName(appUser.name || "");
    }
    // The ProtectedRoute now handles redirection, so we don't need to do it here.
    // This effect's only job is to sync the 'name' state with the 'appUser' prop.
  }, [appUser]); // Only depends on appUser

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setLoadingName(true);
    setNameMessage({ text: "", type: "" });
    const token = localStorage.getItem("token");

    try {
      if (!apiBaseUrl) {
        setNameMessage({ text: "API URL not configured.", type: "danger" });
        setLoadingName(false);
        return;
      }

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
        // No local userData state to update, rely on appFetchUserDetails
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
      if (!apiBaseUrl) {
        setPasswordMessage({ text: "API URL not configured.", type: "danger" });
        setLoadingPassword(false);
        return;
      }

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

  return (
    <div className="container mt-5 mb-3">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          <h1 className="mb-4 text-center">User Profile</h1>

          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Account Information</h5>
              <p>
                <strong>Email:</strong> {appUser?.email}
              </p>
              <p>
                <strong>Joined:</strong> {appUser?.createdAt ? new Date(appUser.createdAt).toLocaleDateString() : 'N/A'}
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
