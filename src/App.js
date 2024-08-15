import React from 'react';
import { BrowserRouter as Router, Routes, Route,useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import SideNavigationBar from './components/SideNavBar';
import AddMemberPage from './pages/AddMemberPage';
import MembersPage from './pages/MemberPage';
import AdminProfile from './pages/AdminProfilePage';
import NotificationPage from './pages/NotificationPage';
import ConnectionPage from './pages/ConnectionPage';

const { Content } = Layout;

const AppLayout = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <ConditionalSidebar />
        <Layout>
          <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
            <Routes>
              <Route path="/view-member" element={<MembersPage />} />
              <Route path="/add-member" element={<AddMemberPage />} />
              <Route path='/admin-profile' element={<AdminProfile/>} />
              <Route path='/notification' element={<NotificationPage/>} />
              <Route path='/connection' element={<ConnectionPage/>} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

// Conditional sidebar component
const ConditionalSidebar = () => {
  const location = useLocation();  // Now useLocation is called within the Router context

  // Conditionally render the sidebar based on the path
  if (location.pathname === '/notification' || location.pathname=== '/connection') {
    return null;
  }
  return <SideNavigationBar />;
};

export default AppLayout;
