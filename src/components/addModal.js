import React from "react";
import { Modal, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";

const AddModal = ({ id, modalContext, addModalOpen, setAddModalOpen }) => {
  const [form] = useForm();

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        field: modalContext,
        details: values,
      };

      await fetch(`http://localhost:5050/members/${id}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      message.success("Data added successfully.");
      setAddModalOpen(false);
      form.resetFields();
      window.location.reload();
    } catch (error) {
      console.error("Failed to add data:", error);
    }
  };

  const renderFormFields = () => {
    switch (modalContext) {
      case "Skills":
        return (
          <Form.Item
            name="Name"
            label="Skill Name"
            rules={[{ required: true, message: "Please enter the skill name" }]}
          >
            <Input />
          </Form.Item>
        );
      case "Experience":
        return (
          <>
            <Form.Item
              name="Company Name"
              label="Company Name"
              rules={[
                { required: true, message: "Please enter the company name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Title"
              label="Title"
              rules={[{ required: true, message: "Please enter the title" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Description"
              label="Description"
              rules={[
                { required: true, message: "Please enter the description" },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="Location"
              label="Location"
              rules={[{ required: true, message: "Please enter the location" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Started On"
              label="Started On"
              rules={[
                { required: true, message: "Please enter the start date" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="Finished On" label="Finished On">
              <Input />
            </Form.Item>
          </>
        );
      case "Education":
        return (
          <>
            <Form.Item
              name="School Name"
              label="School Name"
              rules={[
                { required: true, message: "Please enter the school name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Degree Name"
              label="Degree Name"
              rules={[
                { required: true, message: "Please enter the degree name" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Start Date"
              label="Start Date"
              rules={[
                { required: true, message: "Please enter the start date" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="End Date" label="End Date">
              <Input />
            </Form.Item>
          </>
        );
      case "Certifications":
        return (
          <>
            <Form.Item
              name="Name"
              label="Certification Name"
              rules={[
                {
                  required: true,
                  message: "Please enter the certification name",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Authority"
              label="Authority"
              rules={[
                { required: true, message: "Please enter the authority" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Started On"
              label="Started On"
              rules={[
                { required: true, message: "Please enter the start date" },
              ]}
            >
              <Input />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={modalContext}
      open={addModalOpen}
      onOk={() => handleAdd(form)}
      onCancel={() => setAddModalOpen(false)}
      okButtonProps={{
        style: { backgroundColor: "#5D4A7C", borderColor: "#5D4A7C" },
      }}
    >
      <Form form={form} layout="vertical">
        {renderFormFields()}
      </Form>
    </Modal>
  );
};

export default AddModal;
