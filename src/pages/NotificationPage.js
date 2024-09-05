import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Card, Avatar, Spin, Alert, Typography } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';
import EventCalendar from '../components/eventCalendar';
import EventCardList from '../components/eventCardList';

const { Title } = Typography;

const NotificationPage = () => {
  const userId = sessionStorage.getItem('id');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);  // Default to current date
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5050/connection/notifications/${userId}`);
        setNotifications(response.data);
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const fetchEvents = async (date) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:5050/event/?date=${date}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      setEvents(result);
    } catch (error) {
      console.error('Error fetching events:', error.message);
    }
  };

  useEffect(() => {
    fetchEvents(selectedDate);  // Fetch events for the default selected date (current date)
  }, [selectedDate]);

  // Handle date selection from EventCalendar using native JS
  const handleDateSelect = (date) => {
    const formattedDate = new Date(date).toISOString().split('T')[0];  // Format to 'YYYY-MM-DD'
    setSelectedDate(formattedDate);
    fetchEvents(formattedDate);  // Fetch events for the new selected date
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }} />;
  }

  if (error) {
    return <Alert message={error} type="error" style={{ margin: '20px' }} />;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '10px' }}>
      <Card
        title={<Title level={2} style={{ marginBottom: '0' }}>Notifications</Title>}
        bordered={false}
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px', backgroundColor: '#f9f9f9' }}
        headStyle={{ borderBottom: 'none' }}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={item => (
            <List.Item
              style={{
                padding: '15px 20px',
                borderRadius: '8px',
                marginBottom: '10px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <List.Item.Meta
                avatar={<Avatar size="large" style={{ backgroundColor: '#1890ff' }} icon={<NotificationOutlined />} />}
                title={
                  <Typography.Text strong style={{ fontSize: '16px' }}>
                    {`${item.type} from ${item.userName}`}
                  </Typography.Text>
                }
                description={
                  <Typography.Text style={{ fontSize: '14px', color: '#595959' }}>
                    {item.message}
                  </Typography.Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <div className="mt-5">
        <Title level={3}>Event Planning</Title>
        <div className="row">
          <div className="col-md-7">
            {/* Pass handleDateSelect to EventCalendar */}
            <EventCalendar onDateSelect={handleDateSelect} />
          </div>

          {/* Render EventCardList for the selected date */}
          {selectedDate && (
            <div className="col-md-5">
              <EventCardList
                selectedDate={selectedDate}
                events={events}
                setIsModalVisible={() => { }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
