import React, { useState } from 'react';
import { Form, Input, Button, message, Row, Col, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const AddMemberPage = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const handleFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:5050/members/', {
        Email: values.email,
        Password: values.password,
        FirstName: values.firstName,
        LastName: values.lastName,
      });
      message.success('Member added successfully and email sent!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to add member.');
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please upload an Excel file.');
      return;
    }

    const file = fileList[0].originFileObj;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        
        try {
          await axios.post('http://localhost:5050/members/bulk', jsonData);
          message.success('Members added successfully!');
          setFileList([]);
        } catch (error) {
          message.error('Failed to add members in bulk.');
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      message.error('Failed to process the file.');
      console.log("B",error)
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '30px' }}>Add New Member</h2>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input type="email" placeholder="Email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Member
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Bulk Upload Members</h2>
        <Upload
          beforeUpload={() => false}
          fileList={fileList}
          onChange={handleFileChange}
        >
          <Button icon={<UploadOutlined />}>Upload Excel File</Button>
        </Upload>
        <Button
          type="primary"
          onClick={handleUpload}
          style={{ marginTop: '20px' }}
        >
          Add Members from Excel
        </Button>
      </div>
    </div>
  );
};

export default AddMemberPage;
