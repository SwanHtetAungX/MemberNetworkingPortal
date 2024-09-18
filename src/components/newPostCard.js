import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Form,
  Input,
  Button,
  Upload,
  message,
  Checkbox,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const NewPostCard = ({ profileData, token }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [content, setContent] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!content && !file);
  }, [content, file]);

  const handlePost = async () => {
    try {
      const auth = await fetch(`http://localhost:5050/members/authenticate`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (auth === false) {
        message.error("Unauthorized access. Please log in again");
        return;
      }

      const values = await form.validateFields();
      console.log("Content:", values.content);
      console.log("File:", file);
      console.log("Allow Comments:", values.allowComments);

      const formData = new FormData();
      formData.append("content", values.content);
      formData.append("allowComments", values.allowComments.toString()); // Converting to string

      if (file) {
        formData.append("media", file);
      }

      const response = await fetch(
        `http://localhost:5050/posts/${profileData._id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        message.success("Post uploaded successfully!");
        form.resetFields();
        setFile(null);
        setContent("");
      } else {
        message.error("Failed to upload the post.");
      }
    } catch (error) {
      message.error("Validation failed or request error.");
    }
  };

  const handleFileChange = ({ fileList }) => {
    if (fileList && fileList.length > 0) {
      setFile(fileList[0].originFileObj);
    } else {
      setFile(null);
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  return (
    <Card
      style={{ borderRadius: 10 }}
      title={[
        <Avatar
          key="avatar"
          size={{
            xs: 32,
            sm: 40,
            md: 50,
            lg: 60,
            xl: 70,
            xxl: 80,
          }}
          src={profileData.ProfilePic}
        />,
        <span key="name">
          {profileData.FirstName} {profileData.LastName}
        </span>,
      ]}
      extra={[
        <Button
          key="post"
          type="primary"
          onClick={handlePost}
          disabled={isButtonDisabled}
        >
          Post
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ allowComments: true }}
      >
        <Form.Item name="content" label="What's on your mind?">
          <Input.TextArea onChange={handleContentChange} />
        </Form.Item>

        <Upload
          name="media"
          listType="picture"
          accept="image/*,video/*"
          beforeUpload={() => false} // Prevent automatic upload
          onChange={handleFileChange}
        >
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>

        <Form.Item name="allowComments" valuePropName="checked">
          <Checkbox>Allow comments</Checkbox>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default NewPostCard;
