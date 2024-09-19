import React from "react";
import { List, message, Button, Modal } from "antd";
import { DeleteFilled } from "@ant-design/icons";

const RemoveModal = ({
  id,
  modalContext,
  profileData,
  setProfileData,
  removeModalOpen,
  setRemoveModalOpen,
  token,
}) => {
  const renderList = () => {
    const handleDelete = async (item) => {
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
          `http://localhost:5050/members/${id}/remove`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              field: modalContext,
              details: item,
            }),
          }
        );

        if (response.ok) {
          const updatedData = await response.json();
          message.success("Item deleted successfully");
          setProfileData((prevData) => ({
            ...prevData,
            ...updatedData,
          }));
        } else {
          console.log(response);
          throw new Error("Failed to delete item");
        }
      } catch (error) {
        message.error("Error deleting item: " + error.message);
      }
    };

    switch (modalContext) {
      case "Skills":
        return (
          <List
            dataSource={profileData.Skills}
            renderItem={(item) => (
              <List.Item
                className="listItem"
                actions={[
                  <Button
                    type="text"
                    icon={<DeleteFilled />}
                    onClick={() => handleDelete(item)}
                  />,
                ]}
              >
                {item.Name}
              </List.Item>
            )}
          />
        );
      case "Positions":
        return (
          <List
            dataSource={profileData.Positions}
            renderItem={(position) => (
              <List.Item
                className="listItem"
                actions={[
                  <Button
                    type="text"
                    icon={<DeleteFilled />}
                    onClick={() => handleDelete(position)}
                  />,
                ]}
              >
                {position["Company Name"]}, {position.Title} (
                {position["Started On"]} -{" "}
                {position["Finished On"] || "Present"})
              </List.Item>
            )}
          />
        );
      case "Education":
        return (
          <List
            dataSource={profileData.Education}
            renderItem={(edu) => (
              <List.Item
                className="listItem"
                actions={[
                  <Button
                    type="text"
                    icon={<DeleteFilled />}
                    onClick={() => handleDelete(edu)}
                  />,
                ]}
              >
                {edu["School Name"]}, {edu["Degree Name"]} ({edu["Start Date"]}{" "}
                - {edu["End Date"]})
              </List.Item>
            )}
          />
        );
      case "Certifications":
        return (
          <List
            dataSource={profileData.Certifications}
            renderItem={(cert) => (
              <List.Item
                className="listItem"
                actions={[
                  <Button
                    type="text"
                    icon={<DeleteFilled />}
                    onClick={() => handleDelete(cert)}
                  />,
                ]}
              >
                {cert.Name}, {cert.Authority} ({cert["Started On"]})
              </List.Item>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={modalContext}
      open={removeModalOpen}
      onCancel={() => setRemoveModalOpen(false)}
      footer={null}
    >
      {renderList()}
    </Modal>
  );
};

export default RemoveModal;
