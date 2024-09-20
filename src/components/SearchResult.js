import React from "react";
import { List, Avatar, Button, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { UserAddOutlined } from "@ant-design/icons";

const SearchResults = ({ results }) => {
  const navigate = useNavigate();

  const handleRedirect = (id) => {
    navigate(`/ProfilePage/${id}`, { replace: true });
    window.location.reload(); 
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        width: "100%",
        background: "#fff",
        zIndex: 1000,
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        padding: "10px",
        maxWidth: "400px",
        marginTop: "8px",
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={results}
        renderItem={(item) => (
          <List.Item
            style={{
              borderBottom: "1px solid #f0f0f0",
              padding: "10px 0",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => handleRedirect(item._id)}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.ProfilePic} size="large" />}
              title={
                <span style={{ fontWeight: "500", color: "#333" }}>
                  {`${item.FirstName} ${item.LastName}`}
                </span>
              }
            />
            <Tooltip title="Connect">
              <Button
                shape="circle"
                icon={<UserAddOutlined />}
                style={{ color: "#1890ff", border: "none", boxShadow: "none" }}
                onClick={() => handleRedirect(item._id)}
              />
            </Tooltip>
          </List.Item>
        )}
      />
    </div>
  );
};

export default SearchResults;
