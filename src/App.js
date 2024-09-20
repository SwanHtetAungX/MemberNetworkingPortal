import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Layout } from "antd";
import SideNavigationBar from "./components/SideNavBar";
import AddMemberPage from "./pages/AddMemberPage";
import MembersPage from "./pages/MemberPage";
import AdminProfile from "./pages/AdminProfilePage";
import NotificationPage from "./pages/Notifications/NotificationPage";
import ConnectionPage from "./pages/ConnectionPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../src/css/global.css";
import "./App.css";
import Landing from "./components/landing";
import ProfilePage from "./pages/profilePage";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import SignUp from "./components/sign-up";
import Login from "./components/login-form";
import TwoFactorAuth from "./components/twoFA";
import AdminLogin from "./components/admin-login";
import AdminEventsPage from "./pages/AdminEventsPage";
import ActivityFeedPage from "./pages/activityFeedPage";
import PostsPage from "./pages/PostsPage";
import Chat from "./pages/Chat/Chat";
import Announcement from "./components/Announcements/Announcements";
import AnnouncementBanner from "./components/Announcements/AnnouncementBanner";
import RSVPConfirmation from "./components/RSVPConfirmation";
import io from "socket.io-client";
import { jwtDecode } from 'jwt-decode';

const { Content } = Layout;

const socket = io("http://localhost:8900");

const ProtectedRoute = ({ children, adminOnly }) => {
  const location = useLocation();
  const adminToken = sessionStorage.getItem("admin");
  const memberToken = sessionStorage.getItem("id");

  if (!adminToken && !memberToken) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (adminOnly) {
    try {
      const decodedToken = jwtDecode(adminToken);
      const isAdmin = decodedToken.role === "admin";
      if (!isAdmin) {
        return <Navigate to={location.pathname} />;
      }
      return children;
    } catch (error) {
      console.error("Error decoding token:", error);
      sessionStorage.removeItem("admin");
      return <Navigate to="/login" state={{ from: location }} />;
    }
  }

  if (memberToken) {
    return children;
  }

  return <Navigate to={location.pathname} />;
};

const AppLayout = () => {
  const [refreshAnnouncements, setRefreshAnnouncements] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    socket.on("refreshApp", () => {
      setRefreshKey((prevKey) => prevKey + 1);
    });

    return () => {
      socket.off("refreshApp");
    };
  }, []);

  const handleAcknowledged = () => {
    setRefreshAnnouncements((prev) => !prev);
  };

  useEffect(() => {
    socket.on("refreshAnnouncements", () => {
      setRefreshAnnouncements((prev) => !prev);
    });

    return () => {
      socket.off("refreshAnnouncements");
    };
  }, []);

  const id = sessionStorage.getItem("id");

  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }} key={refreshKey}>
        <AnnouncementBanner onAcknowledged={handleAcknowledged} />
        <ConditionaNavBar />
        <ConditionalSidebar />
        <Layout>
          <Content style={{ padding: "24px", margin: 0, minHeight: 280 }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/verify-2fa" element={<TwoFactorAuth />} />
              <Route path="/signup" element={<SignUp />} />

              {/* Protected member routes */}
              <Route path="/profilePage/:id" element={<ProtectedRoute adminOnly={false}><ProfilePage /></ProtectedRoute>} />
              <Route path="/activityFeed/:id" element={<ProtectedRoute adminOnly={false}><ActivityFeedPage /></ProtectedRoute>} />
              <Route path="/notification" element={<ProtectedRoute adminOnly={false}><NotificationPage /></ProtectedRoute>} />
              <Route path="/connection" element={<ProtectedRoute adminOnly={false}><ConnectionPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute adminOnly={false}><Chat /></ProtectedRoute>} />

              {/* Protected admin routes */}
              <Route path="/view-member" element={<ProtectedRoute adminOnly={true}><MembersPage /></ProtectedRoute>} />
              <Route path="/add-member" element={<ProtectedRoute adminOnly={true}><AddMemberPage /></ProtectedRoute>} />
              <Route path="/admin-profile" element={<ProtectedRoute adminOnly={true}><AdminProfile /></ProtectedRoute>} />
              <Route path="/approve-events" element={<ProtectedRoute adminOnly={true}><AdminEventsPage /></ProtectedRoute>} />
              <Route path="/announcement" element={<ProtectedRoute adminOnly={true}><Announcement refreshFlag={refreshAnnouncements} /></ProtectedRoute>} />
              <Route path="/view-posts" element={<ProtectedRoute adminOnly={true}><PostsPage /></ProtectedRoute>} />
              <Route path="/rsvp-confirmation" element={<RSVPConfirmation />} />
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

  if (
    location.pathname === "/admin-profile" ||
    location.pathname === "/view-member" ||
    location.pathname === "/add-member" ||
    location.pathname === "/approve-events" ||
    location.pathname === "/announcement" ||
    location.pathname === "/view-posts"
  ) {
    return <SideNavigationBar />;
  }
  return null;
};

const ConditionaNavBar = () => {
  const location = useLocation();

  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/admin-login" ||
    location.pathname === "/admin-profile" ||
    location.pathname === "/view-member" ||
    location.pathname === "/add-member" ||
    location.pathname === "/" ||
    location.pathname === "/approve-events" ||
    location.pathname === "/announcement" ||
    location.pathname === "/view-posts"
  ) {
    return null;
  }
  return <Navbar />;
};

export default AppLayout;
