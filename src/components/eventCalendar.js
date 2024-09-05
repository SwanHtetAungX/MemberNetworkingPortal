import React, { useState, useEffect } from 'react';
import { Calendar } from 'antd';
import '../css/eventCalendar.css';

const EventCalendar = ({ onDateSelect }) => {
  const [eventDates, setEventDates] = useState(new Set());

  // Fetch event dates from the backend
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
      
      // Format dates to 'YYYY-MM-DD'
      const formattedDates = result.dates.map(date => new Date(date).toISOString().split('T')[0]);
      setEventDates(new Set(formattedDates));
    } catch (error) {
      console.error('Error fetching event dates:', error.message);
    }
  };

  useEffect(() => {
    fetchEventDates();
  }, []);

  // Convert date object to 'YYYY-MM-DD'
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date click and pass the selected date to the parent
  const handleDateClick = (date) => {
    const formattedDate = formatDate(date.toDate());
    onDateSelect(formattedDate);
  };

  // Render highlight for dates with events
  const dateCellRender = (value) => {
    const formattedDate = formatDate(value.toDate());
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
