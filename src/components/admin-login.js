import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // instantiate useNavigate here

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5050/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      // Handle successful login
      const result = await response.json();
      console.log("Token:", result.token);
      console.log("Login successful! Redirecting to view members...");

      // Redirect to view members page
      navigate("/view-member");
      sessionStorage.setItem('admin',result.token)
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-container">
      <img src="/img7.png" alt="Descriptive Alt Text" className="form-image" />
      <form className="form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        {error && <p className="error">{error}</p>}
        <label>
          Email:
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="Password"
            value={formData.Password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
