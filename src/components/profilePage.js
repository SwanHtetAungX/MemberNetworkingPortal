import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Avatar,
  Row,
  Col,
  Card,
  Button,
  Typography,
  Dropdown,
  Tooltip,
} from "antd";
import {
  EditFilled,
  PlusOutlined,
  MoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AddModal from "./addModal";
import UploadModal from "./uploadModal";
import RemoveModal from "./removeModal";
import ConnectBtn from "./connectBtn";
import ProfilePicModal from "./profilePicModal";
import YourActivity from "./yourActivityFeed";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const ProfilePage = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState("");
  const [profilePicModalOpen, setProfilePicModalOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

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

  const items = [
    {
      key: "1",
      label: (
        <Button type="text" onClick={() => setUploadModalOpen(true)}>
          Upload LinkedIn Data
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
    <Layout style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Content
        style={{ padding: "20px 50px", maxWidth: "1200px", margin: "auto" }}
      >
        <Card
          style={{
            marginTop: "20px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            padding: "20px",
          }}
          bodyStyle={{ padding: "0" }}
        >
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Button type="text" onClick={() => setProfilePicModalOpen(true)}>
                <Avatar
                  size={{
                    xs: 64,
                    sm: 80,
                    md: 100,
                    lg: 120,
                    xl: 140,
                    xxl: 160,
                  }}
                  src={profileData.ProfilePic}
                  icon={<UserOutlined />}
                  style={{
                    border: "2px solid #1890ff",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </Button>
            </Col>
            <Col flex="auto">
              <Title level={3} style={{ marginBottom: "8px" }}>
                {profileData.FirstName} {profileData.LastName}
              </Title>
              <Paragraph style={{ color: "#555", fontSize: "16px" }}>
                {profileData.JobTitle} in {profileData.Department}
              </Paragraph>
              <Paragraph style={{ color: "#555", fontSize: "14px" }}>
                {profileData.Contact}
              </Paragraph>
            </Col>
            <Col>
              {isOwner ? (
                <Dropdown menu={{ items }} placement="bottomRight" arrow>
                  <Button
                    shape="circle"
                    icon={<MoreOutlined />}
                    style={{
                      border: "none",
                      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </Dropdown>
              ) : (
                <Row gutter={8}>
                  <Col>
                    <Tooltip title="Message">
                      <Button type="primary">Message</Button>
                    </Tooltip>
                  </Col>
                  <Col>
                    <ConnectBtn />
                  </Col>
                </Row>
              )}
            </Col>
          </Row>
        </Card>

        {/* Sections */}
        {[
          { title: "About", content: profileData.Bio, context: "Bio" },
          {
            title: "Skills",
            content: profileData.Skills.map((skill) => skill.Name).join(", "),
            context: "Skills",
          },
          {
            title: "Experience",
            content: profileData.Positions.map((position) => (
              <p key={position["Company Name"]}>
                {position["Company Name"]}, {position.Title} (
                {position["Started On"]} -{" "}
                {position["Finished On"] || "Present"})
              </p>
            )),
            context: "Positions",
          },
          {
            title: "Education",
            content: profileData.Education.map((edu) => (
              <p key={edu["School Name"]}>
                {edu["School Name"]}, {edu["Degree Name"]} ({edu["Start Date"]}{" "}
                - {edu["End Date"]})
              </p>
            )),
            context: "Education",
          },
          {
            title: "Certifications",
            content: profileData.Certifications.map((cert) => (
              <p key={cert.Name}>
                {cert.Name}, {cert.Authority} ({cert["Started On"]})
              </p>
            )),
            context: "Certifications",
          },
        ].map((section, index) => (
          <Card
            key={index}
            style={{
              marginTop: "20px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={4}>{section.title}</Title>
              </Col>
              {isOwner && (
                <Col>
                  {section.context === "Bio" ? (
                    <Button
                      type="text"
                      icon={<EditFilled />}
                      onClick={() => {
                        setModalContext(section.context);
                        setAddModalOpen(true);
                      }}
                    />
                  ) : (
                    <>
                      <Button
                        type="text"
                        icon={<EditFilled />}
                        onClick={() => {
                          setModalContext(section.context);
                          setRemoveModalOpen(true);
                        }}
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setModalContext(section.context);
                          setAddModalOpen(true);
                        }}
                      />
                    </>
                  )}
                </Col>
              )}
            </Row>
            <Paragraph style={{ color: "#555", fontSize: "14px" }}>
              {section.content}
            </Paragraph>
          </Card>
        ))}
        <YourActivity id={id} profileData={profileData} />
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
      <ProfilePicModal
        id={id}
        setProfilePicModalOpen={setProfilePicModalOpen}
        profilePicModalOpen={profilePicModalOpen}
      />
    </Layout>
  );
};

export default ProfilePage;
