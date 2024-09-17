import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Avatar,
  Dropdown,
  Button,
  message,
  Modal,
} from "antd";
import { EllipsisOutlined, MessageOutlined } from "@ant-design/icons";
import LikeBtn from "./likeBtn";
import CommentModal from "./commentsModal";
import NewPostCard from "../components/newPostCard";

const { Title, Paragraph } = Typography;

const YourActivity = ({ id, profileData, token }) => {
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");

  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        // Fetch posts data
        setLoading(true);
        const response = await fetch(
          `http://localhost:5050/posts/yourActivity/${id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const postsData = await response.json();

        // Fetch media for each post
        const postsWithMedia = await Promise.all(
          postsData.map(async (post) => {
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

        setActivityFeed(postsWithMedia);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleDeletePost = async (postId) => {
    try {
      const auth = await fetch(`http://localhost:5050/members/authenticate`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (auth === false) {
        message.error("Unauthorized access. Please log in again");
        return;
      }
      const response = await fetch(
        `http://localhost:5050/posts/${id}/${postId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        message.success("Post deleted.");

        setActivityFeed((prevFeed) =>
          prevFeed.filter((post) => post._id !== postId)
        );
      } else {
        message.error("Post Deletion failed.");
      }
    } catch (error) {
      message.error("Post Deletion failed.");
    }
  };

  const handleOpenUpdateModal = (content) => {
    setNewContent(content);
    setUpdateModalOpen(true);
  };

  const handleUpdatePost = async () => {
    try {
      const auth = await fetch(`http://localhost:5050/members/authenticate`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (auth === false) {
        message.error("Unauthorized access. Please log in again");
        return;
      }
      const response = await fetch(
        `http://localhost:5050/posts/${id}/${selectedPostId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ content: newContent }),
        }
      );

      if (response.ok) {
        message.success("Post updated.");

        setActivityFeed((prevFeed) =>
          prevFeed.map((post) =>
            post._id === selectedPostId
              ? { ...post, content: newContent }
              : post
          )
        );

        setUpdateModalOpen(false);
      } else {
        message.error("Failed to update post.");
      }
    } catch (error) {
      message.error("Failed to update post.");
    }
  };

  const items = [
    {
      key: "1",
      label: (
        <Button
          type="text"
          onClick={() => {
            handleDeletePost(selectedPostId);
          }}
        >
          Delete
        </Button>
      ),
    },
    {
      key: "2",
      label: (
        <Button
          type="text"
          onClick={() => {
            handleOpenUpdateModal(
              activityFeed.find((post) => post._id === selectedPostId)?.content
            );
          }}
        >
          Update
        </Button>
      ),
    },
  ];

  const handleOpenComments = (comments, postId) => {
    setSelectedComments(comments);
    setSelectedPostId(postId);
    setCommentModalOpen(true);
  };

  return (
    <div>
      <Title level={2}>Your Activity</Title>
      <Col span={24} style={{ marginBottom: 10 }}>
        <NewPostCard profileData={profileData} token={token} />
      </Col>
      <Row gutter={[16, 16]}>
        {activityFeed.map((post) => (
          <Col xs={24} key={post._id}>
            <Card
              style={{ borderRadius: 10 }}
              title={[
                <Avatar
                  size={{
                    xs: 32,
                    sm: 40,
                    md: 50,
                    lg: 60,
                    xl: 70,
                    xxl: 80,
                  }}
                  src={profileData.ProfilePic}
                />,
                profileData.FirstName + " " + profileData.LastName,
              ]}
              extra={[
                <Dropdown menu={{ items }} placement="bottomRight" arrow>
                  <Button
                    type="text"
                    icon={<EllipsisOutlined />}
                    onClick={() => {
                      setSelectedPostId(post._id);
                    }}
                  />
                </Dropdown>,
              ]}
            >
              {post.mediaUrl && post.mediaType.startsWith("image") && (
                <img
                  alt="media"
                  src={post.mediaUrl}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    borderRadius: 10,
                  }}
                />
              )}
              {post.mediaUrl && post.mediaType.startsWith("video") && (
                <video
                  controls
                  style={{
                    width: "100%",
                    marginTop: 10,
                    borderRadius: 10,
                  }}
                >
                  <source src={post.mediaUrl} />
                  Your browser does not support the video tag.
                </video>
              )}
              <LikeBtn
                likeStatus={post.likeStatus}
                userId={id}
                postId={post._id}
                token={token}
              />
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => handleOpenComments(post.comments, post._id)}
              />
              <Row>
                <Paragraph>
                  <strong>{profileData.FirstName}</strong> {post.content}
                </Paragraph>
              </Row>
              {post.comments.slice(0, 3).map((comment) => (
                <Row key={comment.commentID}>
                  <Col span={24}>
                    <Paragraph>
                      {comment.username || "Unknown User"}: {comment.content}
                    </Paragraph>
                  </Col>
                </Row>
              ))}
            </Card>
          </Col>
        ))}
      </Row>

      <CommentModal
        commentModalOpen={commentModalOpen}
        setCommentModalOpen={setCommentModalOpen}
        comments={selectedComments}
        id={id}
        postId={selectedPostId}
        username={`${profileData.FirstName} ${profileData.LastName}`}
        token={token}
      />
      <Modal
        title="Update Post"
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        onOk={handleUpdatePost}
      >
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          style={{ width: "100%" }}
        />
      </Modal>
    </div>
  );
};

export default YourActivity;
