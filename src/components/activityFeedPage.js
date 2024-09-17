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
} from "antd";
import { EllipsisOutlined, MessageOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import LikeBtn from "./likeBtn";
import CommentModal from "./commentsModal";
import NewPostCard from "./newPostCard";

const { Title, Paragraph } = Typography;

const ActivityFeedPage = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`http://localhost:5050/members/${id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    const fetchPostsData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5050/posts/activityFeed/${id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const postsData = await response.json();
        console.log(postsData);

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
        console.error("Error fetching posts data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    fetchPostsData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profileData) {
    return <div>Error: Profile data not found</div>;
  }

  const handleDeletePost = async (postId) => {
    try {
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
      label: <Button type="text">Report</Button>,
    },
  ];

  const handleOpenComments = (comments, postId) => {
    setSelectedComments(comments);
    setSelectedPostId(postId);
    setCommentModalOpen(true);
  };

  return (
    <div>
      <Title level={2}>Activity Feed</Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <NewPostCard profileData={profileData} />
        </Col>
        {profileData &&
          activityFeed.map((post) => (
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
                    src={post.ProfilePic || ""}
                  />,
                  `${post.FirstName || ""} ${post.LastName || ""}`,
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
                />
                <Button
                  type="text"
                  icon={<MessageOutlined />}
                  onClick={() => handleOpenComments(post.comments, post._id)}
                />
                <Row>
                  <Paragraph>
                    {post.FirstName || "Unknown User"} {post.content}
                  </Paragraph>
                </Row>
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
        username={`${profileData.FirstName || ""} ${
          profileData.LastName || ""
        }`}
      />
    </div>
  );
};

export default ActivityFeedPage;
