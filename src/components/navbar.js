import React, { useState } from "react";
import {
  Layout,
  Menu,
  Input,
  Row,
  Col,
  Typography,
  Drawer,
  Button,
  Modal
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  BellOutlined,
  SearchOutlined,
  MenuOutlined,
  LogoutOutlined,
  MessageOutlined,
  KeyOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchResults from "./SearchResult";
import AdvancedSearch from "./AdvancedSearch";
import ChangePwdModal from "../components/changePwdModal";

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [changePwdModalOpen, setChangePwdModalOpen] = useState(false);

  const handleSimpleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      try {
        const response = await axios.get(
          `http://localhost:5050/members/search`,
          { params: { query } }
        );
        setSearchResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleAdvancedSearch = async (values) => {
    try {
      const response = await axios.get(
        `http://localhost:5050/members/search`,
        { params: values }
      );
      setSearchResults(response.data);
      setShowResults(true);
      setIsAdvancedSearchVisible(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const toggleAdvancedSearch = () => {
    setIsAdvancedSearchVisible(!isAdvancedSearchVisible);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowResults(false);
      setSearchQuery("");
    }, 200);
  };

  const menu = (
    <Menu
      mode={screenSize <= 768 ? "vertical" : "horizontal"}
      defaultSelectedKeys={["2"]}
      style={{
        borderBottom: "none",
        width: screenSize <= 768 ? "100%" : "auto",
        margin: 0,
      }}
    >
      <Menu.Item
        key="1"
        icon={<HomeOutlined />}
        style={{ margin: 0, paddingLeft: "28px" }}
      >
        <Link to={`/activityFeed/${sessionStorage.getItem("id")}`} />
        Home
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={<UserOutlined />}
        style={{ margin: 0, paddingLeft: "28px" }}
      >
        <Link to={`/ProfilePage/${sessionStorage.getItem("id")}`} />
        Profile
      </Menu.Item>
      <Menu.Item
        key="3"
        icon={<TeamOutlined />}
        style={{ margin: 0, paddingLeft: "28px" }}
      >
        <Link to={"/connection"} />
        Connections
      </Menu.Item>
      <Menu.Item
        key="4"
        icon={<BellOutlined />}
        style={{ margin: 0, paddingLeft: "28px" }}
      >
        <Link to={"/notification"} />
        Notifications
      </Menu.Item>
      <Menu.Item
        key="5"
        icon={<MessageOutlined />}
        style={{ margin: 0, paddingLeft: "28px" }}
      >
        <Link to={"/chat"} />
      </Menu.Item>
      <Menu.SubMenu
        key="6"
        icon={<LogoutOutlined />}
        title="Account"
        style={{ margin: 0, paddingLeft: "28px" }}
      >
        <Menu.Item
          key="6-1"
          icon={<LogoutOutlined />}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Logout
        </Menu.Item>
        <Menu.Item
          key="6-2"
          icon={<KeyOutlined />}
          onClick={() => setChangePwdModalOpen(true)}
        >
          Change Password
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );

  return (
    <Header
      style={{
        backgroundColor: "white",
        padding: "0 20px",
        lineHeight: "64px",
        position: "relative",
        zIndex: 1000,
      }}
    >
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={4} style={{ marginBottom: 0, color: "#1890ff", fontSize: "20px" }}>
            Network.com
          </Title>
        </Col>
        <Col flex="auto" style={{ margin: "0 24px", position: "relative" }}>
          <Input
            prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSimpleSearch}
            onBlur={handleBlur}
            onFocus={() => setShowResults(true)}
            style={{ width: 'calc(100% - 40px)' }}
          />
          <Button 
            icon={<FilterOutlined />} 
            onClick={toggleAdvancedSearch}
            style={{ marginLeft: '8px' }}
          />
        </Col>
        {screenSize > 768 ? (
          <Col style={{ flex: "none" }}>{menu}</Col>
        ) : (
          <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} />
        )}
      </Row>
      <Drawer
        title="Menu"
        placement="right"
        onClick={onClose}
        onClose={onClose}
        visible={visible}
      >
        {menu}
      </Drawer>
      <Modal
        title="Advanced Search"
        visible={isAdvancedSearchVisible}
        onCancel={toggleAdvancedSearch}
        footer={null}
      >
        <AdvancedSearch onSearch={handleAdvancedSearch} />
      </Modal>
      <ChangePwdModal
        changePwdModalOpen={changePwdModalOpen}
        setChangePwdModalOpen={setChangePwdModalOpen}
      />
      {showResults && searchResults.length > 0 && (
        <SearchResults results={searchResults} />
      )}
    </Header>
  );
};

export default Navbar;
