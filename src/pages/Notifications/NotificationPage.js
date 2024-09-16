import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Card, Avatar, Spin, Alert, Typography, Tag, Button, Tooltip, Badge } from 'antd';
import { NotificationOutlined, CheckOutlined, ExclamationCircleOutlined, SoundOutlined } from '@ant-design/icons';
import './notificationPage.css'; 

const { Title, Text } = Typography;

const NotificationPage = () => {
  const userId = sessionStorage.getItem('id');
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const notificationsResponse = await axios.get(`http://localhost:5050/connection/notifications/${userId}`);
        const announcementsResponse = await axios.get('http://localhost:5050/announcement');
        
        setNotifications(notificationsResponse.data);

        // Separate acknowledged and unacknowledged announcements
        const userAcknowledgedAnnouncements = announcementsResponse.data.map(announcement => ({
          ...announcement,
          acknowledged: announcement.readBy.includes(userId),
        }));

        setAnnouncements(userAcknowledgedAnnouncements);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleAcknowledge = async (announcementId) => {
    try {
      await axios.patch('http://localhost:5050/announcement/mark-as-read', {
        announcementId,
        userId,
      });

      // Update the announcements state to reflect the acknowledgment
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(announcement =>
          announcement._id === announcementId ? { ...announcement, acknowledged: true } : announcement
        )
      );
    } catch (error) {
      console.error('Error acknowledging announcement:', error);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }} />;
  }

  if (error) {
    return <Alert message={error} type="error" style={{ margin: '20px' }} />;
  }

  return (
    <div className="notification-container">
      <Card
        title={<Title level={2} style={{ marginBottom: '0' }}>Notifications & Announcements</Title>}
        bordered={false}
        className="notification-card"
        headStyle={{ borderBottom: 'none' }}
      >
        <List
          itemLayout="vertical"
          dataSource={[...notifications, ...announcements]}
          renderItem={item => (
            <List.Item
              className={`notification-item ${item.acknowledged ? 'acknowledged' : ''}`}
            >
              <Badge.Ribbon text={item.title ? "Announcement" : "Notification"} color={item.title ? "#ff9f43" : "#1890ff"}>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size="large"
                      style={{ backgroundColor: item.title ? '#ff9f43' : '#1890ff', marginTop:'5px', marginLeft:'10px' }}
                      icon={item.title ? <SoundOutlined /> : <NotificationOutlined />}
                    />
                  }
                  title={
                    item.title ? (
                      <Text strong style={{ fontSize: '16px', display: 'block' }}>
                        {item.title}
                        {item.acknowledged ? (
                          <Tag color="green" style={{ marginLeft: '10px' }}>Acknowledged</Tag>
                        ) : (
                          <Tag color="red" style={{ marginLeft: '10px' }}>Unacknowledged</Tag>
                        )}
                      </Text>
                    ) : (
                      <Text strong style={{ fontSize: '16px' }}>{`${item.type} from ${item.userName}`}</Text>
                    )
                  }
                  description={
                    <Text style={{ fontSize: '14px', color: '#595959' }}>
                      {item.title ? (
                        <span dangerouslySetInnerHTML={{ __html: item.content }} />
                      ) : (
                        item.message
                      )}
                    </Text>
                  }
                />
              </Badge.Ribbon>
              {item.title && !item.acknowledged && (
                <Tooltip title="Acknowledge Announcement">
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleAcknowledge(item._id)}
                    className="acknowledge-button"
                  >
                    Acknowledge
                  </Button>
                </Tooltip>
              )}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default NotificationPage;
