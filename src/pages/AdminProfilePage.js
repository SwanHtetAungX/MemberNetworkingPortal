import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Avatar, Spin, Alert, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setLoading(true);
        // Adjust this URL as necessary or maintain the hardcoded ID for testing
        const response = await axios.get(`http://localhost:5050/admin/66ba53ced25d47327a1be7e8`);
        setAdmin(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch admin data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchAdmin();
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }} />;
  }

  if (error) {
    return <Alert message={error} type="error" style={{ margin: '20px' }} />;
  }

  return (
    <Row justify="center" style={{ padding: '20px' }}>
      <Col xs={24} sm={18} md={12} lg={10} xl={8}>
        <Card
          bordered={false}
          style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}
          actions={[
            <div>Email: {admin?.Email}</div>
          ]}
        >
          <Card.Meta
            avatar={<Avatar size="large" icon={<UserOutlined />} />}
            title={`${admin?.FirstName} ${admin?.LastName}`}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AdminProfile;
