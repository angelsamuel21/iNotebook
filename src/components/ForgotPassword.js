import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null); // { text: '', type: '' }
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('enterEmail'); // 'enterEmail', 'enterOtp', 'enterNewPassword'

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous message object
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json(); // Assuming successful responses are always JSON
        setMessage({ text: data.message || 'OTP has been sent to your email.', type: 'success' });
        setStage('enterOtp'); // Move to OTP entry stage
      } else {
        // Attempt to parse error response as JSON, but handle cases where it might not be
        const responseText = await res.text(); // Read the body as text ONCE
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText); // Try to parse the text as JSON
          errorMessage = errorData.error || errorData.message || `Server responded with status: ${res.status}`;
        } catch (jsonError) {
          // If parsing as JSON fails, it means the response was not valid JSON (e.g., HTML error page)
          // Use the raw responseText or a more generic error message.
          errorMessage = `Server error: ${res.status} - ${res.statusText}. Response: ${responseText.substring(0, 100)}...`; // Show a snippet
          console.error("Response was not JSON. Raw response:", responseText);
        }
        setMessage({ text: errorMessage, type: 'danger' });
      }
    } catch (err) {
      console.error('Send OTP request failed:', err);
      setMessage({ text: 'An error occurred. Please check your connection and try again.', type: 'danger' });
    }
    setLoading(false);
  };

  const handleVerifyOtpAndSetPassword = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'danger' });
      return;
    }
    if (newPassword.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters long.', type: 'danger' });
        return;
    }

    setLoading(true);

    // Step 1: Verify OTP
    try {
      const verifyOtpRes = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!verifyOtpRes.ok) {
        const responseText = await verifyOtpRes.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || `OTP Verification failed: ${verifyOtpRes.status}`;
        } catch (jsonError) {
          errorMessage = `Server error during OTP verification: ${verifyOtpRes.status} - ${verifyOtpRes.statusText}. Response: ${responseText.substring(0,100)}...`;
          console.error("OTP Verification response was not JSON:", responseText);
        }
        setMessage({ text: errorMessage, type: 'danger' });
        setLoading(false);
        return;
      }

      const verifyOtpData = await verifyOtpRes.json();
      if (!verifyOtpData.success) {
        setMessage({ text: verifyOtpData.message || 'OTP verification failed.', type: 'danger' });
        setLoading(false);
        return;
      }
      
      // If OTP is verified, proceed to reset password
      setMessage({ text: 'OTP verified successfully. Resetting password...', type: 'info' });

      const resetPasswordRes = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!resetPasswordRes.ok) {
        const responseText = await resetPasswordRes.text();
        let errorMessage;
        try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || `Password reset failed: ${resetPasswordRes.status}`;
        } catch (jsonError) {
            errorMessage = `Server error during password reset: ${resetPasswordRes.status} - ${resetPasswordRes.statusText}. Response: ${responseText.substring(0,100)}...`;
            console.error("Password reset response was not JSON:", responseText);
        }
        setMessage({ text: errorMessage, type: 'danger' });
        setLoading(false);
        return;
      }

      const resetPasswordData = await resetPasswordRes.json();
      setMessage({ text: resetPasswordData.message || 'Password has been reset successfully!', type: 'success' });
      setStage('completed'); // Or redirect to login

    } catch (err) {
      console.error('OTP verification or Password reset failed:', err);
      setMessage({ text: 'An error occurred during the process. Please try again.', type: 'danger' });
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5 my-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4 ">
              <h2 className="text-center mb-4">Forgot Password</h2>

              {message && (
                <div className={`alert alert-${message.type} mt-3`} role="alert">
                  {message.text}
                </div>
              )}

              {stage === 'enterEmail' && (
                <form onSubmit={handleSendOtp}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              )}

              {stage === 'enterOtp' && (
                <form onSubmit={handleVerifyOtpAndSetPassword}>
                  <p className="text-muted">An OTP has been sent to {email}. Please enter it below along with your new password.</p>
                  <div className="mb-3">
                    <label htmlFor="otp" className="form-label">OTP</label>
                    <input
                      type="text"
                      className="form-control"
                      id="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required minLength={6}
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required minLength={6}
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Processing...' : 'Verify OTP & Reset Password'}
                  </button>
                </form>
              )}
              {stage === 'completed' && (
                <div className="text-center">
                    <p>Your password has been successfully reset. You can now log in with your new password.</p>
                    {/* Optionally, add a link to the login page */}
                     <Link to="/login" className="btn btn-success">Go to Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
