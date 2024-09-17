import express from "express";
import db from "../db/conn.mjs";
import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";
const router = express.Router();

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "membernetworkingportal@gmail.com",
    pass: "fklb cbjd ebxd wbfz",
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "membernetworkingportal@gmail.com",
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Get connection requests
router.get("/:id", async (req, res) => {
  try {
    let collection = await db.collection("connections");
    let memberCollection = await db.collection("members");

    // Get all pending connection requests for the user
    let results = await collection
      .find({ userID2: req.params.id, status: "Pending" })
      .toArray();

    // Fetch the details of the users who sent the connection requests
    const requestsWithDetails = await Promise.all(
      results.map(async (request) => {
        const user = await memberCollection.findOne({
          _id: new ObjectId(request.userID1),
        });
        if (user) {
          return {
            ...request,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            ProfilePic: user.ProfilePic,
          };
        }
        return request;
      })
    );

    res.status(200).send(requestsWithDetails);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Request connection
router.post("/:id", async (req, res) => {
  try {
    // Fetch the details of the user who is sending the request
    const sender = await db
      .collection("members")
      .findOne({ _id: new ObjectId(req.body.userID1) });
    if (!sender) {
      return res.status(404).send("Sender not found");
    }

    const senderFullName = `${sender.FirstName} ${sender.LastName}`;

    let newConnection = {
      userID1: req.body.userID1,
      userID2: req.params.id,
      status: "Pending",
      requestedAt: formatDate(new Date()),
      acceptedAt: null,
    };

    let collection = await db.collection("connections");
    let notificationCollection = await db.collection("notifications");

    await collection.insertOne(newConnection);

    // Create notification for the recipient
    let notification = {
      userID: req.params.id,
      type: "request",
      message: `User ${senderFullName} has sent you a connection request.`,
      createdAt: new Date(),
    };
    await notificationCollection.insertOne(notification);

    // Send email notification
    const recipient = await db
      .collection("members")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!recipient) {
      return res.status(404).send("Recipient not found");
    }

    const recipientEmail = recipient.Email;

    sendEmail(
      recipientEmail,
      "Connection Request",
      `${senderFullName} has sent you a connection request.`
    );

    res.status(201).send("Request Sent");
  } catch (error) {
    console.log("Error creating connection:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Accept connection
router.patch("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const requesterId = req.body.userID1;

    // Find the user who accepted the connection request
    const accepter = await db
      .collection("members")
      .findOne({ _id: new ObjectId(userId) });
    if (!accepter) {
      return res.status(404).send("User not found");
    }

    // Find the user who sent the connection request
    const requester = await db
      .collection("members")
      .findOne({ _id: new ObjectId(requesterId) });
    if (!requester) {
      return res.status(404).send("Requester not found");
    }

    const collection = await db.collection("connections");
    const notificationCollection = await db.collection("notifications");
    const query = { userID1: requesterId, userID2: userId };

    const update = {
      $set: {
        status: "Accept",
        acceptedAt: formatDate(new Date()),
      },
    };

    const result = await collection.updateOne(query, update);

    // Create notification for the requester with names
    const notificationMessage = `${accepter.FirstName} ${accepter.LastName} has accepted your connection request.`;
    let newNotification = {
      userID: requesterId,
      type: "Accept",
      message: notificationMessage,
      createdAt: new Date(),
    };

    await notificationCollection.insertOne(newNotification);

    // Send email notification
    const requesterEmail = requester.Email;
    const emailSubject = "Connection Accepted";
    const emailBody = notificationMessage;
    sendEmail(requesterEmail, emailSubject, emailBody);

    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing acceptance:", error);
    res.status(500).send("Internal Server Error");
  }
});

// remove Connection
router.delete("/:id/remove", async (req, res) => {
  try {
    const collection = await db.collection("connections");
    const notificationCollection = await db.collection("notifications");
    const query = { _id: new ObjectId(req.params.id) };

    // Find the user who removed the connection request
    const remover = await db
      .collection("members")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!remover) {
      return res.status(404).send("User not found");
    }

    let result = await collection.deleteOne(query);

    let newNotification = {
      userID: req.body.userID1,
      type: "Reject",
      message: `${remover.FirstName} ${remover.LastName} has removed your connection`,
      createdAt: new Date(),
    };

    console.log(req.body.userID1);
    await notificationCollection.insertOne(newNotification);

    // Send email notification
    const user = await db
      .collection("members")
      .findOne({ _id: new ObjectId(req.body.userID1) });
    const userEmail = user.Email;
    sendEmail(
      userEmail,
      "Connection Removed",
      `${remover.FirstName} ${remover.LastName} has removed your connection request.`
    );

    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing rejection:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Decline Connection
router.delete("/:id", async (req, res) => {
  try {
    const collection = await db.collection("connections");
    const notificationCollection = await db.collection("notifications");
    const query = { userID1: req.body.userID1, userID2: req.params.id };

    // Find the user who declined the connection request
    const remover = await db
      .collection("members")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!remover) {
      return res.status(404).send("User not found");
    }

    let result = await collection.deleteOne(query);

    let newNotification = {
      userID: req.body.userID1,
      type: "Reject",
      message: `${remover.FirstName} ${remover.LastName} has declined your connection request.`,
      createdAt: new Date(),
    };

    await notificationCollection.insertOne(newNotification);

    // Send email notification
    const user = await db
      .collection("members")
      .findOne({ _id: new ObjectId(req.body.userID1) });
    const userEmail = user.Email;
    sendEmail(
      userEmail,
      "Connection Declined",
      `${remover.FirstName} ${remover.LastName} has declined your connection request.`
    );

    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing rejection:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Check if connection exists between two users
router.get("/:id/:userID1/checker", async (req, res) => {
  try {
    const userID1 = req.params.userID1;
    const userID2 = req.params.id;
    const collection = await db.collection("connections");

    // Find a connection between the two users
    const connection = await collection.findOne({
      $or: [
        { userID1, userID2 },
        { userID1: userID2, userID2: userID1 },
      ],
    });

    if (connection) {
      res.status(200).json({ status: connection.status });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking connection:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get connections for a user
router.get("/connections/:id", async (req, res) => {
  try {
    let collection = await db.collection("connections");
    const results = await collection
      .find({
        $or: [{ userID1: req.params.id }, { userID2: req.params.id }],
        status: "Accept",
      })
      .toArray();

    const users = await Promise.all(
      results.map(async (conn) => {
        const userId =
          conn.userID1 === req.params.id ? conn.userID2 : conn.userID1;
        const user = await db
          .collection("members")
          .findOne({ _id: new ObjectId(userId) });
        if (!user) {
          return { ...conn, connectedUser: null };
        }
        return {
          ...conn,
          connectedUser: {
            FirstName: user.FirstName || "Unknown",
            LastName: user.LastName || "Unknown",
            Email: user.Email || "No email",
            ProfilePic: user.ProfilePic || undefined,
            userId: user._id,
          },
        };
      })
    );

    res.status(200).send(users);
  } catch (error) {
    console.log("Error fetching connections with user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get notifications for a user
router.get("/notifications/:id", async (req, res) => {
  try {
    let notificationCollection = await db.collection("notifications");
    let notifications = await notificationCollection
      .find({ userID: req.params.id })
      .toArray();

    // Fetch each user's details and attach it to each notification
    const enhancedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const user = await db
          .collection("members")
          .findOne({ _id: new ObjectId(notification.userID) });
        return {
          ...notification,
          userName: user
            ? `${user.FirstName} ${user.LastName}`
            : "Unknown User",
        };
      })
    );

    res.status(200).send(enhancedNotifications);
  } catch (error) {
    console.log("Error fetching notifications:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
