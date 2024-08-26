import React, { useState } from "react";
import { Modal, List, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";

const CommentModal = ({
  commentModalOpen,
  setCommentModalOpen,
  comments,
  id,
  postId,
  username,
}) => {
  const [form] = useForm();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  const handleComment = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        content: values.Content,
        username: username,
      };
      const response = await fetch(
        `http://localhost:5050/posts/${id}/${postId}/comment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await response.json();
      message.success("Data added successfully.");
      setCommentModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.log("Failed to add data:", error);
      message.error("Failed to update data. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5050/posts/${id}/${postId}/${selectedComment.commentId}/comment`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await response.json();
      message.success("Comment deleted successfully.");
      setDeleteModalOpen(false);
      setCommentModalOpen(false);
    } catch (error) {
      console.log("Failed to delete comment:", error);
      message.error("Failed to delete comment. Please try again.");
    }
  };

  const openDeleteModal = (comment) => {
    setSelectedComment(comment);
    setDeleteModalOpen(true);
  };

  return (
    <>
      <Modal
        title="Comments"
        open={commentModalOpen}
        onOk={handleComment}
        onCancel={() => setCommentModalOpen(false)}
        okButtonProps={{
          style: { backgroundColor: "#5D4A7C", borderColor: "#5D4A7C" },
        }}
        style={{ maxHeight: "400px" }}
      >
        <List
          itemLayout="horizontal"
          dataSource={comments}
          style={{ maxHeight: "200px", overflowY: "auto" }}
          renderItem={(comment) => (
            <List.Item
              onContextMenu={(e) => {
                e.preventDefault();
                openDeleteModal(comment);
              }}
            >
              <List.Item.Meta
                title={
                  <a
                    href={`http://localhost:3000/profilePage/${comment.userId}`}
                  >
                    {comment.username}
                  </a>
                }
                description={
                  <span style={{ color: "rgba(0, 0, 0, 0.85)" }}>
                    {comment.content}
                  </span>
                }
              />
              <div>{comment.timestamp}</div>
            </List.Item>
          )}
        />
        <Form form={form} layout="vertical">
          <Form.Item name="Content" label="Your Comment">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Delete Comment"
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        okButtonProps={{
          style: { backgroundColor: "#FF4D4F", borderColor: "#FF4D4F" },
        }}
        okText="Delete"
      >
        <p>Are you sure you want to delete this comment?</p>
      </Modal>
    </>
  );
};

export default CommentModal;
