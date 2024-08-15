import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Avatar, Card, Spin, Alert, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ConnectionPage = ({ userId }) => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:5050/connection/connections/66a2f5616db33fb748f0c8d3`) 
            .then(res => {
                setConnections(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching connections:', err);
                setError('Failed to fetch connections');
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', margin: '20px' }} />;
    if (error) return <Alert message={error} type="error" style={{ margin: '20px' }} />;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <Card bordered={false}>
                <Title level={2}>Connections</Title>
                <List
                    itemLayout="horizontal"
                    dataSource={connections}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={item.connectedUser?.ProfilePic || undefined} icon={!item.connectedUser?.ProfilePic ? <UserOutlined /> : undefined} />}
                                title={item.connectedUser ? `${item.connectedUser.FirstName} ${item.connectedUser.LastName}` : "User not found"}
                                description={item.connectedUser ? item.connectedUser.Email : "No details available"}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};

export default ConnectionPage;
