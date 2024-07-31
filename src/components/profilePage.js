import React from "react";
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

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const ProfilePage = () => {
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
            <Button type="text" icon={<MoreOutlined />}></Button>
          </Row>

          <Title className="title3" level={3}>
            {profileData.FirstName + " " + profileData.LastName}
          </Title>
          <Paragraph className="paragraph">{profileData.role}</Paragraph>
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
                <Button type="text" icon={<PlusOutlined />}></Button>
              </Row>
            </Col>
          </Row>
          <Paragraph className="paragraph">{profileData.about}</Paragraph>
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
            renderItem={(item) => <List.Item>{item}</List.Item>}
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
            dataSource={profileData.Education.map(
              (edu) =>
                `${edu["School Name"]}, ${edu["Degree Name"]} (${edu["Start Date"]} - ${edu["End Date"]})`
            )}
            renderItem={(item) => <List.Item>{item}</List.Item>}
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
            dataSource={profileData.Certifications.map(
              (cert) =>
                `${cert.Name}, ${cert.Authority} (${cert["Started On"]})`
            )}
            renderItem={(item) => <List.Item>{item}</List.Item>}
          />
        </Card>
      </Content>
    </Layout>
  );
};

const profileData = {
  _id: {
    $oid: "66a35c5377cfb437d4cc7e15",
  },
  Email: "user3@example.com",
  Password: "dog",
  about:
    "The first known use of “John Doe” dates back to the 16th century,\
     but its use became common in 18th century in British legal terminology for a fictitious plaintiff",
  FirstName: "Alice",
  LastName: "Johanson",
  ProfilePic: "www.example.com",
  Skills: "",
  Experience: "",
  Education: [
    {
      "School Name": "Temasek Polytechnic",
      "Start Date": 2022,
      "End Date": 2025,
      Notes: null,
      "Degree Name": "Common ict",
      Activities: null,
    },
    {
      "School Name": "Damai Secondary School",
      "Start Date": "Jan 2018",
      "End Date": "Nov 2021",
      Notes: null,
      "Degree Name": "O levels",
      Activities: null,
    },
  ],
  LinkedInData: "",
  Contact: "",
  Certifications: [
    {
      Name: "Python Quick Start",
      Url: "https://www.linkedin.com/learning/certificates/98e645c2b910659189c92067e3edd09e34ca41df38da603810bf5d07aae31000",
      Authority: "LinkedIn",
      "Started On": "Nov 2022",
      "Finished On": null,
      "License Number": null,
    },
    {
      Name: "Windows 10: Security",
      Url: "https://www.linkedin.com/learning/certificates/37df7c8402b374b5c4c2d7edd074ac809b58a8feb99a6cb647ff25945ee0d773",
      Authority: "LinkedIn",
      "Started On": "Jan 2023",
      "Finished On": null,
      "License Number": null,
    },
    {
      Name: "NDG Linux Unhatched English 1221a ",
      Url: null,
      Authority: "Cisco Networking Academy",
      "Started On": "Jan 2023",
      "Finished On": null,
      "License Number": null,
    },
    {
      Name: "AWS Certified Cloud Practitioner (CLF-C01) Cert Prep: 1 Cloud Concepts",
      Url: "https://www.linkedin.com/learning/certificates/e85d2802a2f03459410b222125a37a3efc28e126e43474980bbfd8c7194356fa",
      Authority: "LinkedIn",
      "Started On": "Apr 2023",
      "Finished On": null,
      "License Number": null,
    },
    {
      Name: "JavaScript Essential Training",
      Url: "https://www.linkedin.com/learning/certificates/1d73a2a9df8a59bf6c3f7d142ceb359dfc9636988ba63a394d9c933fd810a490",
      Authority: "LinkedIn",
      "Started On": "Oct 2022",
      "Finished On": null,
      "License Number": null,
    },
    {
      Name: "HTML Essential Training",
      Url: "https://www.linkedin.com/learning/certificates/c6102bdbdec8df536c3e95dd42520162a2b980f0b142583cfb0d03b04b950fcd",
      Authority: "LinkedIn",
      "Started On": "Oct 2022",
      "Finished On": null,
      "License Number": null,
    },
    {
      Name: "MySQL Essential Training (2019)",
      Url: "https://www.linkedin.com/learning/certificates/d018da955e13f4feeb089ae2a383ed075a9752d67be6a307ab1369fee42bfc7d",
      Authority: "LinkedIn",
      "Started On": "Oct 2022",
      "Finished On": null,
      "License Number": null,
    },
    {
      Name: "Node.js Essential Training",
      Url: "https://www.linkedin.com/learning/certificates/3d321d6ed84ff5f244ea1cded8b96e2accf03bbd3b6549798d4b0f17aaa747fc",
      Authority: "LinkedIn",
      "Started On": "Oct 2022",
      "Finished On": null,
      "License Number":
        "94a45469e0b6c51c53eb811f635b4b1bcf3b0842d70c0483ab5628869a2496a5",
    },
  ],
  Positions: {
    "Company Name": "New Company",
    Title: "New Title",
    Description: "New Description",
    Location: "New Location",
    "Started On": "Jul 2024",
    "Finished On": null,
  },
  status: "Approved",
};

export default ProfilePage;
