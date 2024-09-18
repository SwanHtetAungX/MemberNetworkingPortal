import React from 'react';
import { useLocation } from 'react-router-dom';

const RSVPConfirmation = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const eventTitle = queryParams.get('event');

    const renderMessage = () => {
        if (status === 'success') {
            return <h2>Thank you for RSVP'ing to {eventTitle}!</h2>;
        } else if (status === 'declined') {
            return <h2>You have successfully declined the invite for {eventTitle}.</h2>;
        } else {
            return <h2>Sorry, there was an issue processing your request. Please try again.</h2>;
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            {renderMessage()}
        </div>
    );
};

export default RSVPConfirmation;
