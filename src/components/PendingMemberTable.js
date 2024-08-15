import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Avatar,Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from "axios";
const PendingMembersTable = () => {
  const [pendingMembers, setPendingMembers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchPendingMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5050/members/pending');
        setPendingMembers(response.data);
        setFilteredData(response.data);
      } catch (error) {
        message.error('Failed to fetch pending members.');
      }
    };

    fetchPendingMembers();
  }, []);

  useEffect(() => {
    const filtered = pendingMembers.filter(member => {
      return (
        member.Email.toLowerCase().includes(searchText.toLowerCase()) ||
        member.FirstName.toLowerCase().includes(searchText.toLowerCase()) ||
        member.LastName.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, pendingMembers]);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5050/members/${id}/approve`);
      message.success('Member approved.');
      setPendingMembers(pendingMembers.filter(member => member._id !== id));
    } catch (error) {
      message.error('Failed to approve member.');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:5050/members/${id}`);
      message.success('Member rejected.');
      setPendingMembers(pendingMembers.filter(member => member._id !== id));
    } catch (error) {
      message.error('Failed to reject member.');
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
        title:'Profile Image',
        dataIndex:'ProfilePic',
        key: 'ProfilePic',
        width:10,
        render: (imageUrl) => (
            <Avatar src = {imageUrl} size={40} />
        )
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
            title="Are you sure you want to approve this member?"
            onConfirm={() => handleApprove(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" style={{ marginRight: 8 }}>
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to reject this member?"
            onConfirm={() => handleReject(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>
              Reject
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
      scroll={{x:800}}
      style={{ margin: '20px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}
      bordered
      rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
    />
    </>
  );
};

export default PendingMembersTable;
