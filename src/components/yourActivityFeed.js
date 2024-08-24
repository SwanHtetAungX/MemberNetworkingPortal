import React, { useEffect, useState } from "react";
import { Typography, Card, Row, Col, Avatar, Button } from "antd";
import {
  EllipsisOutlined,
  HeartOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const YourActivity = ({ id, profileData }) => {
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        // Fetch posts data
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
                console.log(mediaResponse);
                const mediaBlob = await mediaResponse.blob();
                const mediaType = mediaBlob.type;
                const mediaUrl = URL.createObjectURL(mediaBlob);
                console.log(mediaBlob);
                console.log(mediaType);
                console.log(mediaResponse.contentType);
                console.log(mediaBlob);

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

  return (
    <div>
      <Title level={2}>Your Activity</Title>
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
                <Button
                  type="text"
                  icon={<EllipsisOutlined />}
                  onClick={() => {}}
                />,
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
              <Button type="text" icon={<HeartOutlined />} onClick={() => {}} />
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => {}}
              />
              <Row>
                <Paragraph>
                  {profileData.FirstName} {post.content}
                </Paragraph>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default YourActivity;
