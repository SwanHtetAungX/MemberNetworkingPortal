import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Card, Avatar, Spin, Alert, Typography } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';

const { Title } = Typography;

const NotificationPage = () => {
  const userId = sessionStorage.getItem('id');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    </div>
  );
};

export default NotificationPage;
