import React, { useState } from "react";
import { Modal, Typography, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG files!");
  }
  return isJpgOrPng;
};

const ProfilePicModal = ({
  id,
  profilePicModalOpen,
  setProfilePicModalOpen,
}) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleUpload = () => {
    if (!file) {
      message.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);

    setUploading(true);

    fetch(`http://localhost:5050/members/${id}/ProfilePic`, {
      method: "PATCH",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        message.success("Profile picture uploaded successfully.");
        setProfilePicModalOpen(false);
      })
      .catch(() => {
        message.error("Profile picture upload failed.");
      })
      .finally(() => {
        setUploading(false);
        window.location.reload();
      });
  };

  const handleFileChange = ({ file }) => {
    setFile(file.originFileObj); // Use originFileObj to get the actual file

    // FileReader to set the preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file.originFileObj);

    return false; // Prevent automatic upload
  };
  const onCancel = () => {
    setFile(null);
    setPreview(null);
    setProfilePicModalOpen(false);
  };

  const uploadProps = {
    beforeUpload,
    onChange: handleFileChange,
    showUploadList: false,
  };

  return (
    <Modal
      title="Upload Profile Picture"
      open={profilePicModalOpen}
      onOk={handleUpload}
      confirmLoading={uploading}
      onCancel={onCancel}
      okButtonProps={{
        style: { backgroundColor: "#5D4A7C", borderColor: "#5D4A7C" },
      }}
    >
      <Title level={4}>Upload your new profile picture</Title>
      <Paragraph>Select an image to use as your profile picture.</Paragraph>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>

      {preview && (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <img
            src={preview}
            alt="Profile Preview"
            style={{ width: 150, height: 150, borderRadius: "50%" }}
          />
        </div>
      )}
    </Modal>
  );
};

export default ProfilePicModal;
