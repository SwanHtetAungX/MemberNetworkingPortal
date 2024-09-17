import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Layout } from "antd";
import SideNavigationBar from "./components/SideNavBar";
import AddMemberPage from "./pages/AddMemberPage";
import MembersPage from "./pages/MemberPage";
import AdminProfile from "./pages/AdminProfilePage";
import NotificationPage from "./pages/NotificationPage";
import ConnectionPage from "./pages/ConnectionPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../src/css/global.css";
import "./App.css";
import Landing from './components/landing';
import ProfilePage from "./components/profilePage";
import Navbar from './components/navbar';
import Footer from './components/footer';
import SignUp from './components/sign-up';
import Login from './components/login-form';
import TwoFactorAuth from './components/twoFA';
import AdminLogin from './components/admin-login';
import AdminEventsPage from './pages/AdminEventsPage';
import ActivityFeedPage from "./pages/activityFeedPage";
import PostsPage from "./pages/PostsPage";


const { Content } = Layout;

const AppLayout = () => {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <ConditionaNavBar />
        <ConditionalSidebar />
        <Layout>
          <Content style={{ padding: "24px", margin: 0, minHeight: 280 }}>
            <Routes>
              <Route path="/view-member" element={<MembersPage />} />
              <Route path="/add-member" element={<AddMemberPage />} />

              <Route path='/admin-profile' element={<AdminProfile/>} />
              <Route path='/approve-events' element={<AdminEventsPage />} />
              <Route path='/notification' element={<NotificationPage/>} />
              <Route path='/connection' element={<ConnectionPage/>} />
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/verify-2fa" element={<TwoFactorAuth />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profilePage/:id" element={<ProfilePage />} />
              <Route path="/activityFeed/:id" element={<ActivityFeedPage />} />
              <Route path="/view-posts" element={<PostsPage />} />
            </Routes>
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </Router>
  );
};

// Conditional sidebar component
const ConditionalSidebar = () => {
  const location = useLocation();

  // Conditionally render the sidebar based on the path

  if (location.pathname === '/admin-profile' || location.pathname=== '/view-member' || location.pathname==="/add-member" || location.pathname === '/approve-events') {

    return <SideNavigationBar />;
  }
  return null;
};

const ConditionaNavBar = () => {
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/admin-login' || location.pathname === '/admin-profile' || location.pathname === '/view-member' || location.pathname === '/add-member' || location.pathname === '/' || location.pathname === '/approve-events'){

    return null;
  }
  return <Navbar />;
};

export default AppLayout;
