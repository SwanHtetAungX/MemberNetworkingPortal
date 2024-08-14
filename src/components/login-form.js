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
    const [show2FA, setShow2FA] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/testing/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setShow2FA(true);  // Show 2FA form if login is successful
            } else {
                const errorData = await response.text();
                setError(errorData);
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    const handleClose2FA = () => setShow2FA(false);

    return (
        <div className="form-container">
            <img src="/img7.png" alt="Descriptive Alt Text" className="form-image" />
            <form className="form" onSubmit={handleSubmit}>
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
                <p className="link">
                    Not a member? <Link to="/signup">Sign Up here.</Link>
                </p>
            </form>
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
