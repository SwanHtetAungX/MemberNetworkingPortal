import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/form.css'; // Make sure this CSS file is up-to-date

const Register = () => {
    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
        FirstName: '',
        LastName: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/testing/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert('User Registered');
                // Handle successful registration (e.g., redirect to login page)
            } else {
                alert('Error: ' + await response.text());
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        }
    };

    return (
        <div className="form-container">
            <img src="/img7.png" alt="Descriptive Alt Text" className="form-image" />
            
            <form className="form" onSubmit={handleSubmit}>
                <h2>Member Sign Up</h2>
                <div className="name-fields">
                    <label>First Name:
                        <input
                            type="text"
                            name="FirstName"
                            value={formData.FirstName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>Last Name:
                        <input
                            type="text"
                            name="LastName"
                            value={formData.LastName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <label>Email:
                    <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>Password:
                    <input
                        type="password"
                        name="Password"
                        value={formData.Password}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit">Register</button>
                <p className="link">
                    Already a Member? <Link to="/login">Login Here.</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;
