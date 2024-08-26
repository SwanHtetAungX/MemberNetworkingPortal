import React, { useState } from "react";
import { Button, message } from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";

const LikeBtn = ({ likeStatus, userId, postId }) => {
  const [liked, setLiked] = useState(likeStatus);
  console.log(likeStatus);

  const handleLike = () => {
    fetch(`http://localhost:5050/posts/${userId}/${postId}/like`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then(() => {
        setLiked(true);
        message.success("Post Liked.");
      })
      .catch(() => {
        setLiked(false);
        message.error("Like failed.");
      })
      .finally(() => {});
  };

  const handleUnlike = () => {
    fetch(`http://localhost:5050/posts/${userId}/${postId}/unlike`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setLiked(false);
        message.success("Post unliked.");
      })
      .catch(() => {
        setLiked(true);
        message.error("Unlike failed.");
      })
      .finally(() => {});
  };

  return (
    <Button
      type="text"
      icon={liked ? <HeartFilled /> : <HeartOutlined />}
      onClick={liked ? handleUnlike : handleLike}
    />
  );
};

export default LikeBtn;
