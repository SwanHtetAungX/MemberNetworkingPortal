import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

//get connections requests
router.get("/:id", async (req, res) => {
  try {
    let collection = await db.collection("connections");

    let results = await collection
      .find({ userID1: req.params.id, status: "Pending" })
      .toArray();
    res.send(results).status(200);
  } catch (error) {}
});

//request connection
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
    await collection.insertOne(newConnection);
    res.status(201).send("Request Sent");
  } catch (error) {
    console.log("Error creating connection:", error);
    res.status(500).send("Internal Server Error");
  }
});

//accept connection
router.patch("/:id", async (req, res) => {
  try {
    let collection = await db.collection("connections");
    const query = { userID1: req.body.userID1, userID2: req.params.id };

    const update = {
      $set: {
        status: "Accept",
        acceptedAt: formatDate(new Date()),
      },
    };

    let result = await collection.updateOne(query, update);
    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing upload:", error);
    res.status(500).send("Internal Server Error");
  }
});

//decline Connection
router.delete("/:id", async (req, res) => {
  try {
    const collection = await db.collection("connections");
    const query = { userID1: req.body.userID1, userID2: req.params.id };

    let result = await collection.deleteOne(query);
    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing upload:", error);
    res.status(500).send("Internal Server Error");
  }
});

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

export default router;
