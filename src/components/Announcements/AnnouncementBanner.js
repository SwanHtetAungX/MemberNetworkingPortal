
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import './announcement.css';
import io from 'socket.io-client'

const socket = io('http://localhost:8900');

const AnnouncementBanner = ({ onAcknowledged}) => {
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [acknowledged, setAcknowledged] = useState(false);
  const userId = sessionStorage.getItem('id'); 
  useEffect(() => {
    fetchLatestAnnouncement();

    
    socket.on('newAnnouncement', () => {
      fetchLatestAnnouncement(); 
    });

    return () => {
      socket.off('newAnnouncement'); 
    };
  }, []);



  useEffect(() => {
    if (latestAnnouncement && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [latestAnnouncement, countdown]);

  const fetchLatestAnnouncement = async () => {
    try {
      const response = await axios.get('http://localhost:5050/announcement');
      if (response.data.length > 0) {
        const sortedAnnouncements = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const latest = sortedAnnouncements[0];

        if (latest.readBy && latest.readBy.includes(userId)) {
          setAcknowledged(true);
        } else {
          setLatestAnnouncement(latest);
        }
      }
    } catch (error) {
      console.error('Error fetching latest announcement:', error);
    }
  };

  const handleClose = () => {
    setLatestAnnouncement(null)
  }

  const handleAcknowledge = async () => {
    try {
      await axios.patch('http://localhost:5050/announcement/mark-as-read', {
        announcementId: latestAnnouncement._id,
        userId,
      });
      setAcknowledged(true);
      setLatestAnnouncement(null);

      socket.emit('announcementAcknowledged');

      
      if (onAcknowledged) {
        onAcknowledged();
      }
    } catch (error) {
      console.error('Error acknowledging announcement:', error);
    }
  };

  if (!latestAnnouncement || countdown <= 0 || acknowledged) {
    return null; // Hide the banner if the countdown is over or user acknowledged
  }

  return (
    <div className="announcement-banner">
      <Alert
        message={
          <div className="banner-content">
            <h3>{latestAnnouncement.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: latestAnnouncement.content }} />
          </div>
        }
        description={
          <div className="banner-footer">
            <span className="countdown">
              <ClockCircleOutlined /> Closing in {countdown} seconds
            </span>
            <Button
              type="primary"
              size="small"
              onClick={handleAcknowledge}
              className="acknowledge-button"
            >
              Acknowledge
            </Button>
          </div>
        }
        type="info"
        showIcon
        closable
        onClick={handleClose}
      />
    </div>
  );
};

export default AnnouncementBanner;
