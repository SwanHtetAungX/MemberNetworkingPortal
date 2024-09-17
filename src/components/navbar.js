import React, { useState } from "react";
import { Layout, Menu, Input, Row, Col, Typography, Drawer, Button } from "antd";
import { HomeOutlined, UserOutlined, TeamOutlined, BellOutlined, SearchOutlined, MenuOutlined,LogoutOutlined } from "@ant-design/icons";

import { Link } from "react-router-dom";
import axios from "axios";
import SearchResults from "./SearchResult";

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false); // State to manage the visibility of search results

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      try {
        const response = await axios.get(
          `http://localhost:5050/members/search`,
          {
            params: { query },
          }
        );
        setSearchResults(response.data);
        setShowResults(true); // Show results when there is a query
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setSearchResults([]);
      setShowResults(false); // Hide results if the query is cleared
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow click on the result
    setTimeout(() => {
      setShowResults(false);
      setSearchQuery(""); // Clear the search text after unfocus
    }, 200);
  };

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
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

      <Menu.Item key="1" icon={<HomeOutlined />} style={{ margin: 0,paddingLeft: "28px"}}>
        <Link to="/" />
        Home
      </Menu.Item>
      <Menu.Item key="2" icon={<UserOutlined />} style={{ margin: 0,paddingLeft: "28px"}}>
        <Link to={`/ProfilePage/${sessionStorage.getItem('id')}`} />
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
      
      <Menu.Item key="5" icon={<LogoutOutlined />}
       style={{ margin: 0,paddingLeft: "28px" }}
       onClick={() => {
        // Clear token/session
        localStorage.removeItem('token'); 
        window.location.href = "/login";
      }} >
        Logout
      </Menu.Item>
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
          <Title
            level={4}
            style={{ marginBottom: 0, color: "#1890ff", fontSize: "20px" }}
          >
            Network.com
          </Title>
        </Col>
        <Col flex="auto" style={{ margin: "0 24px", position: "relative" }}>
          <Input
            prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            onBlur={handleBlur} // Hide search results and clear text on blur
            onFocus={() => setShowResults(true)} // Show search results on focus
            onPressEnter={handleSearch}
          />
          {showResults && searchResults.length > 0 && (
            <SearchResults results={searchResults} />
          )}
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
    </Header>
  );
};

export default Navbar;
