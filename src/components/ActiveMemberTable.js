import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Avatar, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

const ActiveMembersTable = () => {
  const [activeMembers, setActiveMembers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchActiveMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5050/members/approved');
        setActiveMembers(response.data);
        setFilteredData(response.data); // initialize filtered data
      } catch (error) {
        message.error('Failed to fetch active members.');
      }
    };

    fetchActiveMembers();
  }, []);

  useEffect(() => {
    const filtered = activeMembers.filter(member => {
      return (
        member.Email.toLowerCase().includes(searchText.toLowerCase()) ||
        member.FirstName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.LastName.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, activeMembers]);

  const handleSuspend = async (id) => {
    try {
      await axios.patch(`http://localhost:5050/members/${id}/suspend`);
      message.success('Member suspended.');
      setActiveMembers(prev => prev.filter(member => member._id !== id));
    } catch (error) {
      message.error('Failed to suspend member.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/members/${id}`);
      message.success('Member deleted.');
      setActiveMembers(prev => prev.filter(member => member._id !== id));
    } catch (error) {
      message.error('Failed to delete member.');
    }
  };

  const columns = [
    {
      title: 'No.',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => index + 1,
      width:10
    },
    {
      title: 'Profile Image',
      dataIndex: 'ProfilePic',
      key: 'ProfilePic',
      width:10,
      render: imageUrl => <Avatar src={imageUrl} size={40} />,
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email'
    },
    {
      title: 'First Name',
      dataIndex: 'FirstName',
      key: 'FirstName',
      width:40
    },
    {
      title: 'Last Name',
      dataIndex: 'LastName',
      key: 'LastName',
      width:40
    },
    {
      title: 'Actions',
      key: 'actions',
      width:20,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <Popconfirm
            title="Are you sure you want to suspend this member?"
            onConfirm={() => handleSuspend(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="default" danger>
              Suspend
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to delete this member?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="default" style={{ backgroundColor: 'red', color: 'white',marginLeft:'10px' }}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Input
        placeholder="Search by email or name"
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{ marginBottom: 16, width: '100%' }}
        prefix={<SearchOutlined />}
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
        bordered
      />
    </>
  );
};

export default ActiveMembersTable;
