import './announcement.css';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, message, Card, Row, Col, Popconfirm, Tag, List, Avatar, Tooltip } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import moment from 'moment';
import io from 'socket.io-client';
import { ClockCircleOutlined, DeleteOutlined, UserOutlined, SmileOutlined,BulbOutlined } from '@ant-design/icons';
import Openai from 'openai';

const { TextArea } = Input;




const socket = io('http://localhost:8900');


const openai = new Openai({
  apiKey:process.env.REACT_APP_CHATGPT_API_KEY ,
  dangerouslyAllowBrowser: true

})

const AnnouncementForm = ({ refreshFlag}) => {
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState({}); 
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [refreshFlag]);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:5050/announcement');
      setAnnouncements(response.data);
      fetchAcknowledgedUsers(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  // Fetch user details based on user IDs in the readBy array
  const fetchAcknowledgedUsers = async (announcements) => {
    const userIds = new Set();
    announcements.forEach((announcement) => {
      announcement.readBy.forEach((userId) => userIds.add(userId));
    });

    try {
      const userResponses = await Promise.all(
        Array.from(userIds).map((userId) =>
          axios.get(`http://localhost:5050/members/${userId}`)
        )
      );

      const userMap = {};
      userResponses.forEach((response) => {
        const user = response.data;
        userMap[user._id] = user;
      });

      setUsers(userMap);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/announcement/${id}`);
      message.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      message.error('Failed to delete announcement');
    }
  };

  const handleSubmit = async (values) => {
    const announcement = {
      ...values,
      content: content,
    };

    try {
      await axios.post('http://localhost:5050/announcement', announcement);
      message.success('Announcement created successfully');
      fetchAnnouncements();

      socket.emit("newAnnouncementCreated");
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'High':
        return <Tag color="red">High</Tag>;
      case 'Medium':
        return <Tag color="orange">Medium</Tag>;
      case 'Low':
        return <Tag color="green">Low</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const handleAISuggestion = async () => {
    setLoadingAI(true);

    try{
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates professional announcement content.' },
          { role: 'user', content: `Provide a professional announcement content based on the following content: ${content}` }
        ],
        max_tokens: 100,
      });

    

      console.log('Received response from OpenAI:', response);

    if (response && response.choices && response.choices.length > 0) {
      const suggestion = response.choices[0].message.content.trim();
      setContent((prevContent) => `${prevContent}\n\n${suggestion}`);
    } else {
      throw new Error('Unexpected response format from OpenAI');
    }

    } catch(err){
      console.log('Error Fetching AI suggestion:' , err);
      message.error('Failed to get content suggestion from AI. ');
    } finally {
      setLoadingAI(false);
    }
  }

  return (
    <div className="announcement-container">
      <Row gutter={[16, 16]} justify="center">
        {/* Announcement Form */}
        <Col xs={24} lg={10}>
          <Card title="Create Announcement" className="create-announcement-card">
            <Form onFinish={handleSubmit} layout="vertical">
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="priority" label="Priority">
                <Select>
                  <Select.Option value="High">High</Select.Option>
                  <Select.Option value="Medium">Medium</Select.Option>
                  <Select.Option value="Low">Low</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="scheduleDate" label="Schedule Date">
                <DatePicker showTime />
              </Form.Item>
              <Form.Item name="expiryDate" label="Expiry Date">
                <DatePicker />
              </Form.Item>
              <Form.Item label="Content">
                <ReactQuill value={content} onChange={setContent} />
                <Button
                  type="default"
                  icon={<BulbOutlined />}
                  onClick={handleAISuggestion}
                  loading={loadingAI}
                  style={{ marginTop: '10px' }}
                  block
                >
                  Get AI Suggestion
                </Button>
              </Form.Item>
              <Button type="primary" htmlType="submit" block>
                Create Announcement
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Past Announcements */}
        <Col xs={24} lg={14}>
          <Card title="Past Announcements" className="past-announcements-card">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <Card
                  key={announcement._id}
                  className={`announcement-card announcement-${announcement.priority.toLowerCase()}`}
                  style={{ marginBottom: '16px' }}
                  hoverable
                >
                  <div className="announcement-header">
                    <h3>{announcement.title}</h3>
                    {getPriorityTag(announcement.priority)}
                  </div>
                  <p><ClockCircleOutlined /> <strong>Scheduled:</strong> {announcement.scheduleDate ? moment(announcement.scheduleDate).format('YYYY-MM-DD HH:mm') : 'N/A'}</p>
                  <p><ClockCircleOutlined /> <strong>Expiry:</strong> {announcement.expiryDate ? moment(announcement.expiryDate).format('YYYY-MM-DD') : 'N/A'}</p>
                  <div dangerouslySetInnerHTML={{ __html: announcement.content }} className="announcement-content" />

                  {/* Acknowledged Users */}
                  <div className="acknowledged-users">
                    <h4>Acknowledged by:</h4>
                    {announcement.readBy.length > 0 ? (
                      <div className="user-badges">
                        {announcement.readBy.map((userId) => (
                          <Tooltip key={userId} title={users[userId] ? `${users[userId].FirstName} ${users[userId].LastName}` : 'Unknown User'}>
                            <Avatar
                              style={{ backgroundColor: '#87d068', margin: '5px' }}
                              icon={<UserOutlined />}
                            >
                            </Avatar>
                          </Tooltip>
                        ))}
                      </div>
                    ) : (
                      <div className="no-acknowledgements">
                        <SmileOutlined style={{ fontSize: '24px', color: '#bfbfbf' }} />
                        <p>No acknowledgements yet</p>
                      </div>
                    )}
                  </div>

                  <div className="actions">
                    <Popconfirm
                      title="Are you sure you want to delete this announcement?"
                      onConfirm={() => deleteAnnouncement(announcement._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="danger" className="delete-button" size="small" icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                  </div>
                </Card>
              ))
            ) : (
              <p>No past announcements found.</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnnouncementForm;
