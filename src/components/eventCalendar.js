import React, { useState, useEffect } from 'react';
import { Calendar, Modal, Form, Input, Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import '../css/eventCalendar.css';

const EventCalendar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventDates, setEventDates] = useState(new Set()); // Set to track dates with events
  const [form] = Form.useForm();

  const wrapperStyle = {
    width: '100%',
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
  };

  const cardStyle = {
    width: '100%',
    marginTop: '1rem',
    padding: '1rem',
  };

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

  // Fetch event dates on component mount
  useEffect(() => {
    fetchEventDates();
  }, []);

  const fetchEvents = async (date) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:5050/event/?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      setEvents(result);
    } catch (error) {
      console.error('Error fetching events:', error.message);
      alert('An error occurred while fetching events. Please try again.');
    }
  };

  const handleDateClick = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    setSelectedDate(formattedDate);
    fetchEvents(formattedDate);
  };

  const handleSaveEvent = async (values) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const { title, location, description, isPublic } = values;

      const response = await fetch('http://localhost:5050/event/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          date: selectedDate,
          location,
          description,
          isPublic
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      console.log('Event created:', result);

      // Update events state
      setEvents([...events, { title, date: selectedDate }]);

      // Fetch updated event dates
      fetchEventDates();

      // Close modal and reset form
      setIsModalVisible(false);
      form.resetFields();
      
    } catch (error) {
      console.error('Error creating event:', error.message);
      alert('An error occurred while creating the event. Please try again.');
    }
  };

  const dateCellRender = (value) => {
    const formattedDate = value.format('YYYY-MM-DD');
    if (eventDates.has(formattedDate)) {
      return <div className='highlight-date' />;
    }
    return null;
  };

  return (
    <div style={wrapperStyle}>
      <Calendar
        fullscreen={false}
        dateCellRender={dateCellRender}
        onSelect={handleDateClick}
      />
      <Modal
        title="Create New Event"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEvent}
        >
          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: 'Please enter the event title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="isPublic"
            label="Public Event"
            valuePropName="checked"
          >
            <Input type="checkbox" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Event
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {selectedDate && (
        <Card
          title={`Events for ${selectedDate}`}
          style={cardStyle}
          extra={<Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Add Event</Button>}
        >
          <ul>
            {events.map((event, index) => (
              <li key={index}>{event.title}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default EventCalendar;
