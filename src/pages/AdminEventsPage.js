import React, { useState, useEffect } from 'react';
import { Table, Button, Tabs, message } from 'antd';

const { TabPane } = Tabs;

const AdminEventApproval = () => {
    const [pendingEvents, setPendingEvents] = useState([]);
    const [approvedEvents, setApprovedEvents] = useState([]);

    // Fetch pending events from the backend
    const fetchPendingEvents = async () => {
        try {
            const response = await fetch('http://localhost:5050/event/pending', {
                method: 'GET',
            });
            const result = await response.json();
            if (Array.isArray(result)) {
                setPendingEvents(result);
            } else {
                throw new Error("Invalid data format for pending events");
            }
        } catch (error) {
            console.error('Error fetching pending events:', error);
            message.error("Failed to fetch pending events");
        }
    };

    // Fetch approved events from the backend
    const fetchApprovedEvents = async () => {
        try {
            const response = await fetch('http://localhost:5050/event/approved', {
                method: 'GET',
            });
            const result = await response.json();
            if (Array.isArray(result)) {
                setApprovedEvents(result);
            } else {
                throw new Error("Invalid data format for approved events");
            }
        } catch (error) {
            console.error('Error fetching approved events:', error);
            message.error("Failed to fetch approved events");
        }
    };

    // Approve event by Admin
    const handleApprove = async (eventId) => {
        try {
            await fetch(`http://localhost:5050/event/approve-or-cancel/${eventId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'approve' }),
            });
            message.success('Event approved');
            fetchPendingEvents();  // Refresh the pending list
            fetchApprovedEvents(); // Refresh the approved list
        } catch (error) {
            console.error('Error approving event:', error);
            message.error("Failed to approve event");
        }
    };

    // Cancel event by Admin
    const handleCancel = async (eventId) => {
        try {
            await fetch(`http://localhost:5050/event/approve-or-cancel/${eventId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'cancel' }),
            });
            message.success('Event canceled');
            fetchPendingEvents();  // Refresh the pending list
            fetchApprovedEvents(); // Refresh the approved list
        } catch (error) {
            console.error('Error canceling event:', error);
            message.error("Failed to cancel event");
        }
    };

    // Columns for Pending Events Table
    const pendingColumns = [
        { title: 'Event Title', dataIndex: 'title', key: 'title' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Location', dataIndex: 'location', key: 'location' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleApprove(record._id)}>Approve</Button>
                    <Button type="link" danger onClick={() => handleCancel(record._id)}>Cancel</Button>
                </>
            ),
        },
    ];

    // Columns for Approved Events Table
    const approvedColumns = [
        { title: 'Event Title', dataIndex: 'title', key: 'title' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Location', dataIndex: 'location', key: 'location' },
    ];

    // Fetch pending and approved events on component mount
    useEffect(() => {
        fetchPendingEvents();
        fetchApprovedEvents(); // Added fetch for approved events
    }, []);

    return (
        <Tabs defaultActiveKey="1">
            <TabPane tab="Pending Events" key="1">
                <Table columns={pendingColumns} dataSource={pendingEvents} rowKey="_id" />
            </TabPane>
            <TabPane tab="Approved Events" key="2">
                <Table columns={approvedColumns} dataSource={approvedEvents} rowKey="_id" />
            </TabPane>
        </Tabs>
    );
};

export default AdminEventApproval;
