import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Card, Avatar, Spin, Alert } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';

const NotificationPage = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5050/connection/notifications/66a2f5616db33fb748f0c8d3`);// This will be hard coded for a while
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

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }} />;
  }

  if (error) {
    return <Alert message={error} type="error" style={{ margin: '20px' }} />;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <Card title="Notifications" bordered={false}>
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<NotificationOutlined />} />}
                title={`${item.type} from ${item.userName} `}
                description={item.message}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default NotificationPage;
