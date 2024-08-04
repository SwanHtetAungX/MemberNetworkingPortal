import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Avatar,
  Row,
  Col,
  Input,
  Card,
  Button,
  Typography,
  List,
  Dropdown,
  Modal,
  Upload,
  message,
} from "antd";
import {
  EditFilled,
  PlusOutlined,
  MoreOutlined,
  HomeFilled,
  UserOutlined,
  UsergroupDeleteOutlined,
  BellOutlined,
  UploadOutlined,
} from "@ant-design/icons";
const { Dragger } = Upload;

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const ProfilePage = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:5050/members/${id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [id]);

  //Uploading of csv
  const handleUpload = () => {
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
        window.location.reload();
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

  if (!profileData) {
    return <div>Loading...</div>;
  }

  //dropdown menu
  const items = [
    {
      key: "1",
      label: (
        <Button type="text" onClick={() => setUploadModalOpen(true)}>
          Upload Linkedin Data
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <Header style={{ backgroundColor: "white", padding: "0 50px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title className="title2" level={2} style={{ margin: 0 }}>
              Network.com
            </Title>
          </Col>
          <Col flex="auto">
            <Input
              placeholder="Who are you looking for?"
              style={{ width: "100%" }}
            />
          </Col>
          <Button type="text" icon={<HomeFilled />}></Button>
          <Button type="text" icon={<UserOutlined />}></Button>
          <Button type="text" icon={<UsergroupDeleteOutlined />}></Button>
          <Button type="text" icon={<BellOutlined />}></Button>
        </Row>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <Card style={{ marginTop: "20px" }}>
          <Row justify="space-between" align="middle">
            <Avatar size={64} icon={<img alt="profile" />} />
            <Dropdown
              menu={{
                items,
              }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" icon={<MoreOutlined />}></Button>
            </Dropdown>
          </Row>
          <Title className="title3" level={3}>
            {profileData.FirstName + " " + profileData.LastName}
          </Title>
          <Paragraph className="paragraph">{profileData.JobTitle}</Paragraph>
        </Card>

        <Card style={{ marginTop: "20px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                About
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                <Button type="text" icon={<EditFilled />}></Button>
              </Row>
            </Col>
          </Row>
          <Paragraph className="paragraph">{profileData.Bio}</Paragraph>
        </Card>

        <Card style={{ marginTop: "20px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Skills
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                <Button type="text" icon={<EditFilled />}></Button>
                <Button type="text" icon={<PlusOutlined />}></Button>
              </Row>
            </Col>
          </Row>
          <List
            dataSource={profileData.Skills}
            renderItem={(item) => (
              <List.Item className="listItem">{item.Name}</List.Item>
            )}
          />
        </Card>

        <Card style={{ marginTop: "20px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Experience
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                <Button type="text" icon={<EditFilled />}></Button>
                <Button type="text" icon={<PlusOutlined />}></Button>
              </Row>
            </Col>
          </Row>
          <List
            dataSource={profileData.Positions}
            renderItem={(position) => (
              <List.Item className="listItem">
                {position["Company Name"]}, {position.Title} (
                {position["Started On"]} -{" "}
                {position["Finished On"] || "Present"})
              </List.Item>
            )}
          />
        </Card>

        <Card style={{ marginTop: "20px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Education
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                <Button type="text" icon={<EditFilled />}></Button>
                <Button type="text" icon={<PlusOutlined />}></Button>
              </Row>
            </Col>
          </Row>
          <List
            dataSource={profileData.Education}
            renderItem={(edu) => (
              <List.Item className="listItem">
                {edu["School Name"]}, {edu["Degree Name"]} ({edu["Start Date"]}{" "}
                - {edu["End Date"]})
              </List.Item>
            )}
          />
        </Card>

        <Card style={{ marginTop: "20px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Certifications
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                <Button type="text" icon={<EditFilled />}></Button>
                <Button type="text" icon={<PlusOutlined />}></Button>
              </Row>
            </Col>
          </Row>
          <List
            dataSource={profileData.Certifications}
            renderItem={(cert) => (
              <List.Item className="listItem">
                {cert.Name}, {cert.Authority} ({cert["Started On"]})
              </List.Item>
            )}
          />
        </Card>
      </Content>

      <Modal
        title="Upload LinkedIn Data"
        open={uploadModalOpen}
        onOk={handleUpload}
        confirmLoading={uploading}
        onCancel={() => setUploadModalOpen(false)}
      >
        <Title className="title4" level={4}>
          Steps
        </Title>
        <Paragraph>
          1. Click the Me icon at the top of your LinkedIn homepage. 2. Select
          Settings & Privacy from the dropdown 3. Click the Data Privacy on
          theleft rail. 4. Under the How LinkedIn uses your data section, click
          Get a copy of your data. 5. Select Download larger data archive as the
          option and Request Archive. 6. Upload here, and let us handle the
          rest.
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
    </Layout>
  );
};

export default ProfilePage;
