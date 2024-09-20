import React, { useState } from 'react';
import { Form, Input, Select, Button, Row, Col } from 'antd';

const { Option } = Select;

const AdvancedSearch = ({ onSearch }) => {
  const [form] = Form.useForm();

  const handleSearch = (values) => {
    onSearch(values);
  };

  return (
    <Form form={form} onFinish={handleSearch}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="name" label="Name">
            <Input placeholder="Search by name" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="jobTitle" label="Job Title">
            <Input placeholder="Search by job title" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="department" label="Department">
            <Select placeholder="Select department">
              <Option value="IT">IT</Option>
              <Option value="HR">HR</Option>
              <Option value="Finance">Finance</Option>
              {/* Add more departments as needed */}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="location" label="Location">
            <Input placeholder="Search by location" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="skills" label="Skills">
            <Select mode="tags" placeholder="Enter skills">
              <Option value="javascript">JavaScript</Option>
              <Option value="react">React</Option>
              <Option value="node">Node.js</Option>
              {/* Add more skills as needed */}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default AdvancedSearch;