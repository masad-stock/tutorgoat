import React, { useState } from "react";
import "./AdminLogin.css";
import PasswordChange from "./PasswordChange";

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [breachedAdmin, setBreachedAdmin] = useState(null);
  const [breachedTokens, setBreachedTokens] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.passwordBreached) {
          // Password was breached, show password change form
          setBreachedAdmin(data.data.admin);
          setBreachedTokens({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          });
          setShowPasswordChange(true);
        } else {
          // Normal login flow
          // Store tokens in localStorage
          // Set secure HTTP-only cookies through backend API
          await fetch('/api/auth/set-cookies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.data.accessToken}`
            },
            body: JSON.stringify({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              adminData: data.data.admin
            })
          });

          onLogin(data.data.admin, data.data.accessToken, data.data.refreshToken);
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    // Store tokens and proceed to dashboard
    localStorage.setItem("admin", JSON.stringify(breachedAdmin));
    localStorage.setItem("accessToken", breachedTokens.accessToken);
    localStorage.setItem("refreshToken", breachedTokens.refreshToken);
    onLogin(breachedAdmin, breachedTokens.accessToken);
  };

  const handleCancelPasswordChange = () => {
    setShowPasswordChange(false);
    setBreachedAdmin(null);
    setBreachedTokens(null);
  };

  if (showPasswordChange) {
    return (
      <PasswordChange
        onPasswordChanged={handlePasswordChanged}
        onCancel={handleCancelPasswordChange}
      />
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>Admin Login</h2>
          <p>Access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Default credentials:</p>
          <p>
            <strong>Email:</strong> admin@tutorgoat.com
          </p>
          <p>
            <strong>Password:</strong> admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
