import React, { useEffect, useState } from "react";
import { Table, Button, message, Popconfirm, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const ReportedPostsTable = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchPendingPosts = async () => {
      try {
        const response = await fetch("http://localhost:5050/posts/reported");
        if (!response.ok) {
          throw new Error("Failed to fetch pending posts");
        }
        const data = await response.json();
        const postsWithMedia = await Promise.all(
          data.map(async (post) => {
            if (post.mediaId) {
              try {
                const mediaResponse = await fetch(
                  `http://localhost:5050/posts/media/${post.mediaId}`
                );
                if (!mediaResponse.ok) {
                  throw new Error(
                    `Error fetching media: ${mediaResponse.statusText}`
                  );
                }

                const mediaBlob = await mediaResponse.blob();
                const mediaType = mediaBlob.type;
                const mediaUrl = URL.createObjectURL(mediaBlob);

                return { ...post, mediaUrl, mediaType };
              } catch (error) {
                console.error("Error fetching media:", error);
                return post;
              }
            }
            return post;
          })
        );
        setReportedPosts(postsWithMedia);
        setFilteredData(postsWithMedia);
      } catch (error) {
        message.error(error.message);
      }
    };

    fetchPendingPosts();
  }, []);

  useEffect(() => {
    const filtered = reportedPosts.filter((post) => {
      return post.Author.toLowerCase().includes(searchText.toLowerCase());
    });
    setFilteredData(filtered);
  }, [searchText, reportedPosts]);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5050/posts/${id}/approve`,
        {
          method: "PATCH",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to approve post");
      }
      message.success("Post approved.");
      setReportedPosts(reportedPosts.filter((post) => post._id !== id));
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`http://localhost:5050/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to reject post");
      }
      message.success("Post rejected.");
      setReportedPosts(reportedPosts.filter((post) => post._id !== id));
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 10,
    },
    {
      title: "Author",
      dataIndex: "Author",
      key: "Author",
      width: 40,
    },
    {
      title: "Amount of reports",
      dataIndex: "reports",
      key: "reports",
      width: 10,
      render: (reports) => (reports ? reports.length : 0),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      width: 150,
      render: (text) => (
        <div
          style={{
            maxHeight: "50px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Media",
      dataIndex: "mediaUrl",
      key: "mediaUrl",
      width: 80,
      render: (_, record) => (
        <>
          {record.mediaUrl && record.mediaType.startsWith("image") && (
            <img
              alt="media"
              src={record.mediaUrl}
              style={{
                width: "100%",
                marginTop: 10,
                borderRadius: 10,
              }}
            />
          )}
          {record.mediaUrl && record.mediaType.startsWith("video") && (
            <video
              controls
              style={{
                width: "100%",
                marginTop: 10,
                borderRadius: 10,
              }}
            >
              <source src={record.mediaUrl} />
              Your browser does not support the video tag.
            </video>
          )}
        </>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 20,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Popconfirm
            title="Are you sure you want to approve this post?"
            onConfirm={() => handleApprove(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" style={{ marginRight: 8 }}>
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Are you sure you want to reject this post?"
            onConfirm={() => handleReject(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Reject</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <Input
        placeholder="Search by title or author"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, width: "100%" }}
        prefix={<SearchOutlined />}
      />
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
        style={{ margin: "20px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}
        bordered
        rowClassName={(record, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
      />
    </>
  );
};

export default ReportedPostsTable;
