import React, { useState } from 'react';
import { Form, Input, Button, message, Row, Col } from 'antd';
import axios from "axios";
const AddMemberPage = () => {
  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:5050/members/', {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
    
        message.success('Member added successfully and email sent!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to add member.');
    }
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
              <Input type='email' placeholder="Email" />
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
    </div>
  );
};

export default AddMemberPage;

