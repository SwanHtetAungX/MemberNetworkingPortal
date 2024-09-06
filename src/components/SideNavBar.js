import React from 'react';
import { Layout, Menu } from 'antd';
import { UserAddOutlined, UserOutlined, ProfileOutlined, LogoutOutlined,  CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const SideNavigationBar = () => {

  const handleLogout = () => {

    console.log('Logging out...'); // will do the logout logic later

  };

  return (
    <Sider
      width={250}
      className="site-layout-background"
      breakpoint="lg"
      collapsedWidth="0"
      theme="dark"
    >
      <div className="logo" style={{ padding: '16px', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
        Admin Portal
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
      >
        <Menu.SubMenu
          key="members"
          title="Members"
          icon={<UserOutlined />}
        >
          <Menu.Item key="add-member">
            <Link to="/add-member">
              <UserAddOutlined />
              Add Member
            </Link>
          </Menu.Item>
          <Menu.Item key="view-member">
            <Link to="/view-member">
              <UserOutlined />
              View Members
            </Link>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.Item key="admin-profile" icon={<ProfileOutlined />}>
          <Link to="/admin-profile">
            Profile
          </Link>
        </Menu.Item>

        <Menu.Item key="events">
          <Link to="/approve-events">
            <CalendarOutlined />
            Events
          </Link>
        </Menu.Item>

        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideNavigationBar;
