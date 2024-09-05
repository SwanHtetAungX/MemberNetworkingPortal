import React, { useState, useEffect } from 'react';
import { Calendar } from 'antd';
import '../css/eventCalendar.css';

const EventCalendar = ({ onDateSelect }) => {
  const [eventDates, setEventDates] = useState(new Set());

  // Function to fetch event dates
  const fetchEventDates = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:5050/event/dates', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      setEventDates(new Set(result.dates)); // Assuming result.dates is an array of date strings
    } catch (error) {
      console.error('Error fetching event dates:', error.message);
    }
  };

  useEffect(() => {
    fetchEventDates();
  }, []);

  const handleDateClick = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    onDateSelect(formattedDate);  // Notify parent (NotificationPage)
  };

  //to highlight dates that have events
  const dateCellRender = (value) => {
    const formattedDate = value.format('YYYY-MM-DD');
    if (eventDates.has(formattedDate)) {
      return <div className='highlight-date' />;
    }
    return null;
  };

  return (
    <div>
      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender}
        onSelect={handleDateClick}
      />
    </div>
  );
};

export default EventCalendar;
