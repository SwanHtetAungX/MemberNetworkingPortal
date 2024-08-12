import React, { useState, useEffect, useCallback } from "react";
import { Button, message, Modal } from "antd";
import { useParams } from "react-router-dom";

const ConnectBtn = () => {
  const { id: userID2 } = useParams(); // userID2 from the URL
  const userID1 = sessionStorage.getItem("id"); // userID1 from session storage
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [confirmationModal, setconfirmationModal] = useState(false);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5050/connection/${userID2}/${userID1}/checker`
      );

      if (response.ok) {
        const result = await response.json();
        setConnectionStatus(result.status);
      } else {
        setConnectionStatus(false); //no connection found
      }
    } catch (error) {
      console.error("Failed to check connection status:", error);
      setConnectionStatus(false);
    }
  }, [userID1, userID2]);

  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  const handleRequestConnect = async () => {
    try {
      const payload = {
        userID1,
      };

      const response = await fetch(
        `http://localhost:5050/connection/${userID2}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        message.success("Connection request sent successfully.");
        setConnectionStatus("Pending"); // ppdate status to Pending after request
      } else {
        throw new Error("Failed to send connection request.");
      }
    } catch (error) {
      console.error("Failed to send connection request:", error);
      message.error("Failed to send connection request.");
    }
  };

  const handleDeleteConnection = async () => {
    try {
      const payload = {
        userID1,
      };
      const response = await fetch(
        `http://localhost:5050/connection/${userID2}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        message.success("Connection request sent successfully.");
        setconfirmationModal(false);
        setConnectionStatus(false); // update status to Pending after unfollow or remove request
      } else {
        throw new Error("Failed to remove connection request.");
      }
    } catch (error) {
      console.log("Failed to remove connection request:", error);
      message.error("Failed to remove connection request.");
    }
  };

  return (
    <>
      <Button
        type="text"
        style={{ backgroundColor: "#5D4A7C", color: "white" }}
        onClick={() => {
          if (connectionStatus === "Pending" || connectionStatus === "Accept") {
            setconfirmationModal(true);
          } else {
            handleRequestConnect();
          }
        }}
      >
        {connectionStatus === "Accept"
          ? "Connected"
          : connectionStatus === "Pending"
          ? "Pending"
          : "Connect"}
      </Button>
      <Modal
        title={
          connectionStatus === "Pending"
            ? "Undo connection request"
            : connectionStatus === "Accept"
            ? "Remove connection with user"
            : "Remove connection"
        }
        open={confirmationModal}
        onOk={handleDeleteConnection}
        onCancel={() => setconfirmationModal(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Do you want to delete this connection?</p>
      </Modal>
    </>
  );
};

export default ConnectBtn;
