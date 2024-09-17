import React from "react";
import { Typography, Modal, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

const UploadModal = ({
  id,
  uploadModalOpen,
  setUploadModalOpen,
  fileList,
  setUploading,
  uploading,
  setFileList,
  token,
}) => {
  //Uploading of csv
  const handleUpload = async () => {
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
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files[]", file);
    });

    setUploading(true);

    fetch(`http://localhost:5050/members/${id}/upload`, {
      method: "PATCH",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        setFileList([]);
        message.success("Upload successfully.");
        setUploadModalOpen(false);
      })
      .catch(() => {
        message.error("Upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  //Drag and drop upload options
  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <Modal
      title="Upload LinkedIn Data"
      open={uploadModalOpen}
      onOk={handleUpload}
      confirmLoading={uploading}
      onCancel={() => setUploadModalOpen(false)}
      okButtonProps={{
        style: { backgroundColor: "#5D4A7C", borderColor: "#5D4A7C" },
      }}
    >
      <Title className="title4" level={4}>
        Steps
      </Title>

      <Paragraph>
        1. Click the Me icon at the top of your LinkedIn homepage. 2. Select
        Settings & Privacy from the dropdown 3. Click the Data Privacy on
        theleft rail. 4. Under the How LinkedIn uses your data section, click
        Get a copy of your data. 5. Select Download larger data archive as the
        option and Request Archive. 6. Upload here, and let us handle the rest.
      </Paragraph>
      <Dragger {...uploadProps}>
        <Paragraph className="ant-upload-drag-icon">
          <UploadOutlined />
        </Paragraph>
        <Paragraph className="ant-upload-text">
          Click or drag file to this area to upload
        </Paragraph>
        <Paragraph className="ant-upload-hint">
          Only upload, Certifications, Educations, Positions and Skills
        </Paragraph>
      </Dragger>
    </Modal>
  );
};

export default UploadModal;
