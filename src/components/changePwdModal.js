import React from "react";
import { Modal, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";

const ChangePwdModal = ({ changePwdModalOpen, setchangePwdModalOpen }) => {
  const [form] = useForm();

  const id = sessionStorage.getItem("id");
  const token = localStorage.getItem("authToken");

  const handleChangePwd = async () => {
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
      const values = await form.validateFields();

      const payload = {
        field: "Password",
        details: values,
      };

      const response = await fetch(
        `http://localhost:5050/members/${id}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await response.json();
      message.success("Password updated successfully.");
      setchangePwdModalOpen(false);
      form.resetFields();
      window.location.reload();
    } catch (error) {
      console.log("Failed to change password:", error);
      message.error("Failed to update password. Please try again.");
    }
  };

  return (
    <Modal
      title="Change Password"
      open={changePwdModalOpen}
      onOk={handleChangePwd}
      onCancel={() => setchangePwdModalOpen(false)}
      okButtonProps={{
        style: { backgroundColor: "#5D4A7C", borderColor: "#5D4A7C" },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ newPassword: "", confirmPassword: "" }}
      >
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[
            { required: true, message: "Please enter your new password" },
            { min: 6, message: "Password must be at least 6 characters long" },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePwdModal;
