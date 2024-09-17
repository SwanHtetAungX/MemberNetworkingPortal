import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { List, Avatar, Card, Spin, Alert, Typography, Button } from "antd";
import {
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const ConnectionPage = () => {
  const userId = sessionStorage.getItem("id");
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch connections
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5050/connection/connections/${userId}`)
      .then((res) => {
        setConnections(res.data);
        console.log("Connections data:", res.data); // Logging the full connections data
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching connections:", err);
        setError("Failed to fetch connections");
        setLoading(false);
      });
  }, [userId]);

  // Fetch connection requests
  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5050/connection/${userId}`)
      .then((res) => {
        setRequests(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching connection requests:", err);
        setError("Failed to fetch connection requests");
        setLoading(false);
      });
  }, [userId]);

  const handleAccept = (requestId) => {
    axios
      .patch(`http://localhost:5050/connection/${userId}`, {
        userID1: requestId,
      })
      .then(() => {
        setRequests((prev) => prev.filter((req) => req.userID1 !== requestId));
        setConnections((prev) => [...prev, requestId]);
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error accepting connection request:", err);
        setError("Failed to accept connection request");
      });
  };

  const handleReject = (requestId) => {
    axios
      .delete(`http://localhost:5050/connection/${userId}`, {
        data: { userID1: requestId },
      })
      .then(() => {
        setRequests((prev) => prev.filter((req) => req.userID1 !== requestId));
      })
      .catch((err) => {
        console.error("Error rejecting connection request:", err);
        setError("Failed to reject connection request");
      });
  };

  const handleRemove = (connectionId, connectedUserId) => {
    axios
      .delete(`http://localhost:5050/connection/${connectionId}/remove`, {
        data: { userID1: connectedUserId },
      })
      .then(() => {
        setConnections((prev) =>
          prev.filter((conn) => conn.connectedUser._id !== connectedUserId)
        );
      })
      .catch((err) => {
        console.error("Error removing connection:", err);
        setError("Failed to remove connection");
      });
  };

  if (loading)
    return (
      <Spin
        size="large"
        style={{ display: "flex", justifyContent: "center", margin: "20px" }}
      />
    );
  if (error)
    return <Alert message={error} type="error" style={{ margin: "20px" }} />;

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Card bordered={false} style={{ marginBottom: "20px" }}>
        <Title level={2}>Connection Requests</Title>
        {requests.length === 0 ? (
          <p>No pending connection requests.</p>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={requests}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleAccept(item.userID1)}
                    shape="round"
                  >
                    Accept
                  </Button>,
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleReject(item.userID1)}
                    shape="round"
                  >
                    Reject
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={item.ProfilePic || undefined}
                      icon={!item.ProfilePic ? <UserOutlined /> : undefined}
                    />
                  }
                  title={
                    <Button
                      type="link"
                      onClick={() => navigate(`/profilePage/${item.userID1}`)}
                    >
                      {`${item.FirstName} ${item.LastName}`}
                    </Button>
                  }
                  description={item.Email}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card bordered={false}>
        <Title level={2}>Your Connections</Title>
        {connections.length === 0 ? (
          <p>You have no connections yet.</p>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={connections}
            renderItem={(item) => {
              console.log("Connection item:", item); // Log each connection item to see the structure
              console.log("Connected user:", item.connectedUser); // Log connectedUser to check its structure
              return (
                <List.Item
                  actions={[
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        handleRemove(item._id, item.connectedUser.userId)
                      }
                      shape="round"
                    >
                      Remove
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={item.connectedUser?.ProfilePic || undefined}
                        icon={
                          !item.connectedUser?.ProfilePic ? (
                            <UserOutlined />
                          ) : undefined
                        }
                      />
                    }
                    title={
                      <Button
                        type="link"
                        onClick={() => navigate(`/profilePage/${item.userID1}`)}
                      >
                        {item.connectedUser
                          ? `${item.connectedUser.FirstName} ${item.connectedUser.LastName}`
                          : "User not found"}
                      </Button>
                    }
                    description={
                      item.connectedUser
                        ? item.connectedUser.Email
                        : "No details available"
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default ConnectionPage;
