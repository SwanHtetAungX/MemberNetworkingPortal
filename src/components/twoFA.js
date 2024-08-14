import React, { useState } from 'react';
import '../css/form.css';
import { useNavigate } from 'react-router-dom';

function TwoFactorAuth({ email }) {
    const [twofaCode, setTwofaCode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting 2FA Code:", twofaCode); // Debugging line
        try {
            const response = await fetch('/testing/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: email, twofaCode }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                console.log("Verification Successful:", data.token); // Debugging line
                setMessage('Login successful!');
                sessionStorage.setItem('token', data.token);
                
            } else {
                const errorData = await response.text();
                console.log("Verification Failed:", errorData); // Debugging line
                setError(errorData);
            }
        } catch (err) {
            console.error("Error during 2FA verification:", err); // Debugging line
            setError('An error occurred during 2FA verification');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            <label>Enter the 2FA code sent to your email:
                <input
                    type="text"
                    value={twofaCode}
                    onChange={(e) => setTwofaCode(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Verify</button>
            {message && <p className="success">{message}</p>}
        </form>
    );
}

export default TwoFactorAuth;
