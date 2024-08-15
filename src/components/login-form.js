import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/form.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal } from 'react-bootstrap';
import TwoFactorAuth from './twoFA';

function Login() {
    const [formData, setFormData] = useState({ Email: '', Password: '' });
    const [error, setError] = useState('');
    const [show2FA, setShow2FA] = useState(false); // State to control 2FA modal visibility

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5050/members/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token); // Store token
                console.log('Token:', data.token);
                setShow2FA(true); // Show 2FA modal
            } else {
                const errorData = await response.text();
                setError(errorData);
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    const handleClose2FA = () => setShow2FA(false); // Close 2FA modal

    return (
        <div className="form-container d-flex align-items-center justify-content-center min-vh-100">
            <div className="form-content d-flex flex-column flex-md-row align-items-center">
                <img src="/img7.png" alt="Descriptive Alt Text" className="form-image img-fluid" />
                <form className="form p-4 p-md-5" onSubmit={handleSubmit}>
                    <h2>Member Login</h2>
                    {error && <p className="error">{error}</p>}
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
                    <button type="submit">Login</button>
                    <p className="link mt-3">
                        Not a member? <Link to="/signup">Sign Up here.</Link>
                    </p>
                </form>
            </div>

            <Modal show={show2FA} onHide={handleClose2FA}>
                <Modal.Header closeButton>
                    <Modal.Title>Two-Factor Authentication</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TwoFactorAuth email={formData.Email} />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Login;
