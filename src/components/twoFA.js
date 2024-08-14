import React, { useState } from 'react';

function TwoFactorAuth({ email }) {
    const [twofaCode, setTwofaCode] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/testing/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: email, twofaCode }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage('Login successful! Token: ' + data.token);
            } else {
                const errorData = await response.text();
                setError(errorData);
            }
        } catch (err) {
            setError('An error occurred during 2FA verification');
        }
    };

    return (
        <div className="twofa-container">
            <form onSubmit={handleSubmit}>
                <h2>Two-Factor Authentication</h2>
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
        </div>
    );
}

export default TwoFactorAuth;
