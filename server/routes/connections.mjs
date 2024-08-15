import express from "express";
import db from "../db/conn.mjs";
import nodemailer from 'nodemailer';
import { ObjectId } from "mongodb";
const router = express.Router();

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'membernetworkingportal@gmail.com',
    pass: 'fklb cbjd ebxd wbfz'
  }
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'membernetworkingportal@gmail.com',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Get connection requests
router.get("/:id", async (req, res) => {
  try {
    let collection = await db.collection("connections");

    let results = await collection
      .find({ userID1: req.params.id, status: "Pending" })
      .toArray();
    res.send(results).status(200);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Request connection
router.post("/:id", async (req, res) => {
  try {
    let newConnection = {
      userID1: req.body.userID1,
      userID2: req.params.id,
      status: "Pending",
      requestedAt: formatDate(new Date()),
      acceptedAt: null,
    };

    let collection = await db.collection("connections");
    let notificationCollection = await db.collection('notifications');

    await collection.insertOne(newConnection);

    // Create notification for the recipient
    let notification = {
      userID: req.body.userID2,
      type: "request",
      message: `User ${req.body.userID1} has sent you a connection request.`,
      createdAt: new Date()
    };
    await notificationCollection.insertOne(notification);
    
    // Send email notification
    const user = await db.collection("members").findOne({ _id: new ObjectId(req.body.userID2) });
    const userEmail = user.Email;

    sendEmail(userEmail, "Connection Request", `${req.body.userID1} has sent you a connection request.`);

    res.status(201).send("Request Sent");
  } catch (error) {
    console.log("Error creating connection:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Accept connection
router.patch("/:id", async (req, res) => {
  try {
    let collection = await db.collection("connections");
    let notificationCollection = await db.collection('notifications');
    const query = { userID1: req.body.userID1, userID2: req.params.id };

    const update = {
      $set: {
        status: "Accept",
        acceptedAt: formatDate(new Date()),
      },
    };

    let result = await collection.updateOne(query, update);

    // Create notification for the requester
    let newNotification = {
      userID: req.body.userID1,
      type: "Accept",
      message: `${req.params.id} has accepted your connection request.`,
      createdAt: new Date()
    };

    await notificationCollection.insertOne(newNotification);

    const user = await db.collection("members").findOne({ _id: new ObjectId(req.body.userID1) });
    const userEmail = user.Email;
    sendEmail(userEmail, "Connection Accepted", `${req.params.id} has accepted your connection request.`);

    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing acceptance:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Decline Connection
router.delete("/:id", async (req, res) => {
  try {
    const collection = await db.collection("connections");
    const notificationCollection = await db.collection('notifications');
    const query = { userID1: req.body.userID1, userID2: req.params.id };

    let result = await collection.deleteOne(query);

    let newNotification = {
      userID: req.body.userID1,
      type: "Reject",
      message: `${req.params.id} has declined your connection request.`,
      createdAt: new Date(),
    };

    await notificationCollection.insertOne(newNotification);
    
    // Send email notification
    const user = await db.collection("members").findOne({ _id: new ObjectId(req.body.userID1) });
    const userEmail = user.Email;
    sendEmail(userEmail, "Connection Declined", `${req.params.id} has declined your connection request.`);

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
    const results = await collection.find({
      $or: [{ userID1: req.params.id }, { userID2: req.params.id }],
      status: "Accept"
    }).toArray();

    const users = await Promise.all(results.map(async (conn) => {
      const userId = conn.userID1 === req.params.id ? conn.userID2 : conn.userID1;
      const user = await db.collection("members").findOne({_id: new ObjectId(userId)});
      if (!user) {
        return { ...conn, connectedUser: null }; 
      }
      return {
        ...conn,
        connectedUser: {
          FirstName: user.FirstName || "Unknown",
          LastName: user.LastName || "Unknown",
          Email: user.Email || "No email",
          ProfilePic: user.ProfilePic || undefined
        }
      };
    }));

    res.status(200).send(users);
  } catch (error) {
    console.log("Error fetching connections with user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get notifications for a user
router.get("/notifications/:id", async (req, res) => {
  try {
    let notificationCollection = await db.collection('notifications');
    let notifications = await notificationCollection.find({ userID: req.params.id }).toArray();

    // Fetch each user's details and attach it to each notification
    const enhancedNotifications = await Promise.all(notifications.map(async (notification) => {
      const user = await db.collection("members").findOne({ _id: new ObjectId(notification.userID) });
      return {
        ...notification,
        userName: user ? `${user.FirstName} ${user.LastName}` : 'Unknown User'
      };
    }));

    res.status(200).send(enhancedNotifications);
  } catch (error) {
    console.log("Error fetching notifications:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
