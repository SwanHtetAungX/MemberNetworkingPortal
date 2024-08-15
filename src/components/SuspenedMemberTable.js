import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Avatar, Input } from 'antd';
import axios from "axios";
import { SearchOutlined } from '@ant-design/icons';

const SuspendedMembersTable = () => {
  const [suspendedMembers, setSuspendedMembers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchSuspendedMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5050/members/suspended');
        setSuspendedMembers(response.data);
        setFilteredData(response.data);
      } catch (error) {
        message.error('Failed to fetch suspended members.');
      }
    };

    fetchSuspendedMembers();
  }, []);

  useEffect(() => {
    const filtered = suspendedMembers.filter(member => {
      return (
        member.Email.toLowerCase().includes(searchText.toLowerCase()) ||
        member.FirstName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.LastName.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, suspendedMembers]);

  const handleUnsuspend = async (id) => {
    try {
      await axios.patch(`http://localhost:5050/members/${id}/suspend`);  // Toggles suspend status
      message.success('Member unsuspended.');
      setSuspendedMembers(suspendedMembers.filter(member => member._id !== id));
    } catch (error) {
      message.error('Failed to unsuspend member.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/members/${id}`);
      message.success('Member deleted.');
      setSuspendedMembers(suspendedMembers.filter(member => member._id !== id));
    } catch (error) {
      message.error('Failed to delete member.');
    }
  };

  const columns = [
    {
      title: 'No.',
      key: 'index',
      render: (text, record, index) => index + 1,
      width: 10
    },
    {
      title: 'Profile Image',
      dataIndex: 'ProfilePic',
      key: 'ProfilePic',
      width: 10,
      render: imageUrl => (<Avatar src={imageUrl} size={40} />)
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
      width: 40
    },
    {
      title: 'Last Name',
      dataIndex: 'LastName',
      key: 'LastName',
      width: 40,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 20,
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <Popconfirm
            title="Are you sure you want to unsuspend this member?"
            onConfirm={() => handleUnsuspend(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="default" style={{ marginRight: 8, backgroundColor: 'green', color: 'white' }}>
              Unsuspend
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to delete this member?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="default" style={{ backgroundColor: 'red', color: 'white' }}>
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
      style={{ margin: '20px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}
      scroll={{x:800}}
      bordered
      rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
    />
    </>
  );
};

export default SuspendedMembersTable;
