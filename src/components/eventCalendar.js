//Event Calendar component displays the Calendar
//It allows user to create events and retreive
//events in a table/list.
import React, { useState } from 'react';
import { Calendar, theme, Modal, Form, Input, Button, Typography } from 'antd';

//const { Title } = Typography;

const EventCalendar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [form] = Form.useForm();
  const { token } = theme.useToken();

  const cardStyle = {
    width: '100%',
    marginTop: '1rem',
    padding: '1rem',
  };

  const wrapperStyle = {
    width: '100%',
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
  };

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
    const formatDate = date.format('YYYY-MM-DD');
    setSelectedDate(date.format('YYYY-MM-DD'));
    fetchEvents(formatDate);
  };

  const handleSaveEvent = async (values) => {
    try {
        // Retrieve token from local storage
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No authentication token found');
        }

        const { title, location, description, isPublic } = values;

        const response = await fetch('http://localhost:5050/event/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Use retrieved token
            },
            body: JSON.stringify({
                title,
                date: selectedDate,
                location,
                description,
                isPublic
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Event created:', result);

        setEvents([...events, { title, date: selectedDate }]);
        setIsModalVisible(false);
        form.resetFields();
    } catch (error) {
        console.error('Error creating event:', error.message);
        // Optionally show user-friendly error message
        alert('An error occurred while creating the event. Please try again.');
    }
};

  return (
    <div style={wrapperStyle}>
      <Calendar
        fullscreen={false}
        onPanelChange={(value, mode) => console.log(value.format('YYYY-MM-DD'), mode)}
        onSelect={handleDateClick}
      />
       {selectedDate && (
        <Card
          title={`Events for ${selectedDate}`}
          extra={<PlusOutlined onClick={() => setIsModalVisible(true)} style={{ fontSize: '20px', cursor: 'pointer' }} />}
          style={cardStyle}
        >
          {events.length > 0 ? (
            <ul>
              {events.map((event) => (
                <li key={event._id}>{event.title} - {event.location}</li>
              ))}
            </ul>
          ) : (
            <p>No events for this date.</p>
          )}
        </Card>
      )}
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
    </div>
  );
};

export default EventCalendar;