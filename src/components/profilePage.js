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
} from "antd";
import {
  EditFilled,
  PlusOutlined,
  MoreOutlined,
  HomeFilled,
  UserOutlined,
  UsergroupDeleteOutlined,
  BellOutlined,
} from "@ant-design/icons";
import AddModal from "./addModal";
import UploadModal from "./uploadModal";
import RemoveModal from "./removeModal";
import ConnectBtn from "./connectBtn";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const ProfilePage = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState("");
  const [isOwner, setIsOwner] = useState(false); // New state for ownership check

  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const sessionId = sessionStorage.getItem("id");
    if (sessionId === id) {
      setIsOwner(true);
    }
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
    {
      key: "2",
      label: (
        <Button
          type="text"
          onClick={() => {
            setModalContext("Profile");
            setAddModalOpen(true);
          }}
        >
          Edit Profile
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
        <Card
          style={{
            marginTop: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Avatar size={64} icon={<img alt="profile" />} />
            {isOwner && (
              <Dropdown
                menu={{
                  items,
                }}
                placement="bottomRight"
                arrow
              >
                <Button type="text" icon={<MoreOutlined />}></Button>
              </Dropdown>
            )}
            {!isOwner && (
              <Row gutter={8}>
                <Col>
                  <Button type="text">Message</Button>
                </Col>
                <Col>
                  <ConnectBtn />
                </Col>
              </Row>
            )}
          </Row>
          <Title className="title3" level={3}>
            {profileData.FirstName} {profileData.LastName}
          </Title>
          <Paragraph className="paragraph">
            {profileData.JobTitle} in {profileData.Department}
          </Paragraph>
        </Card>

        <Card
          style={{
            marginTop: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                About
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                {isOwner && (
                  <Button
                    type="text"
                    icon={<EditFilled />}
                    onClick={() => {
                      setModalContext("Bio");
                      setAddModalOpen(true);
                    }}
                  ></Button>
                )}
              </Row>
            </Col>
          </Row>
          <Paragraph className="paragraph">{profileData.Bio}</Paragraph>
        </Card>

        <Card
          style={{
            marginTop: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Skills
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                {isOwner && (
                  <Button
                    type="text"
                    icon={<EditFilled />}
                    onClick={() => {
                      setModalContext("Skills");
                      setAddModalOpen(true);
                    }}
                  ></Button>
                )}
                {isOwner && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setModalContext("Skills");
                      setAddModalOpen(true);
                    }}
                  ></Button>
                )}
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

        <Card
          style={{
            marginTop: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Experience
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                {isOwner && (
                  <Button
                    type="text"
                    icon={<EditFilled />}
                    onClick={() => {
                      setModalContext("Experience");
                      setRemoveModalOpen(true);
                    }}
                  ></Button>
                )}

                {isOwner && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setModalContext("Experience");
                      setAddModalOpen(true);
                    }}
                  ></Button>
                )}
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

        <Card
          style={{
            marginTop: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Education
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                {isOwner && (
                  <Button
                    type="text"
                    icon={<EditFilled />}
                    onClick={() => {
                      setModalContext("Education");
                      setRemoveModalOpen(true);
                    }}
                  ></Button>
                )}

                {isOwner && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setModalContext("Education");
                      setAddModalOpen(true);
                    }}
                  ></Button>
                )}
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

        <Card
          style={{
            marginTop: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title className="title4" level={4}>
                Certifications
              </Title>
            </Col>
            <Col>
              <Row justify="space-between" align="middle">
                {isOwner && (
                  <Button
                    type="text"
                    icon={<EditFilled />}
                    onClick={() => {
                      setModalContext("Certifications");
                      setRemoveModalOpen(true);
                    }}
                  ></Button>
                )}

                {isOwner && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setModalContext("Certifications");
                      setAddModalOpen(true);
                    }}
                  ></Button>
                )}
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
      <RemoveModal
        id={id}
        modalContext={modalContext}
        profileData={profileData}
        removeModalOpen={removeModalOpen}
        setRemoveModalOpen={setRemoveModalOpen}
      />

      <UploadModal
        id={id}
        uploadModalOpen={uploadModalOpen}
        setUploadModalOpen={setUploadModalOpen}
        fileList={fileList}
        setUploading={setUploading}
        uploading={uploading}
        setFileList={setFileList}
      />

      <AddModal
        id={id}
        modalContext={modalContext}
        addModalOpen={addModalOpen}
        setAddModalOpen={setAddModalOpen}
        profileData={profileData}
      />
    </Layout>
  );
};

export default ProfilePage;
