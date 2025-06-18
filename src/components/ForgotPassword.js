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

  // Use environment variable for API base URL. It MUST be set in the deployment environment.
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  // Helper function to parse error responses
  async function parseErrorResponse(response) {
    const responseText = await response.text();
    try {
      const errorData = JSON.parse(responseText);
      return errorData.error || errorData.message || `Server responded with status: ${response.status}`;
    } catch (jsonError) {
      console.error("Error response was not JSON. Raw response:", responseText);
      // Return a snippet of the non-JSON response for better debugging
      return `Server error: ${response.status} - ${response.statusText}. Response: ${responseText.substring(0, 150)}...`;
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage(null); // Clear previous message object
    setLoading(true);

    try {
      if (!apiBaseUrl) {
        setMessage({ text: 'API URL not configured. Please check deployment settings.', type: 'danger' });
        return;
      }

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
        const errorMessage = await parseErrorResponse(res);
        setMessage({ text: errorMessage, type: 'danger' });
      }
    } catch (err) {
      console.error('Send OTP request failed:', err);
      setMessage({ text: 'An error occurred. Please check your connection and try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
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
      if (!apiBaseUrl) {
        setMessage({ text: 'API URL not configured. Please check deployment settings.', type: 'danger' });
        return;
      }

      const verifyOtpRes = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!verifyOtpRes.ok) {
        const errorMessage = await parseErrorResponse(verifyOtpRes);
        setMessage({ text: errorMessage, type: 'danger' });
        return;
      }

      const verifyOtpData = await verifyOtpRes.json();
      if (verifyOtpData && !verifyOtpData.success) { // Check if verifyOtpData itself is defined
        setMessage({ text: verifyOtpData.message || 'OTP verification failed.', type: 'danger' });
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
        const errorMessage = await parseErrorResponse(resetPasswordRes);
        setMessage({ text: errorMessage, type: 'danger' });
        return;
      }

      const resetPasswordData = await resetPasswordRes.json();
      setMessage({ text: resetPasswordData.message || 'Password has been reset successfully!', type: 'success' });
      setStage('completed'); // Or redirect to login
    } catch (err) {
      console.error('OTP verification or Password reset failed:', err);
      setMessage({ text: 'An error occurred during the process. Please try again.', type: 'danger' });
    } finally {
      setLoading(false);
    }
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
                      autoComplete="new-password"
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
                      autoComplete="new-password"
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
