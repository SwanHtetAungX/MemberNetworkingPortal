import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

//get connections requests
router.get("/:id", async (req, res) => {
  try {
    let collection = await db.collection("connections");

    let results = await collection.find({ userID2: req.params.id }).toArray();
    res.send(results).status(200);
  } catch (error) {}
});

//request connection
router.post("/", async (req, res) => {
  try {
    let newConnection = {
      userID1: req.body.userID1,
      userID2: req.body.userID2,
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

router.get("/suggestions/:id", async (req, res) => {
  try {
    let collection = await db.collection("members");
    const userId = req.params.id;
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    const { Education, Certifications, Positions } = user;
    const criteria = { Education, Certifications, Positions };
    const projection = { _id: 1, FirstName: 1, LastName: 1, ProfilePic: 1 };

    let suggestions = await collection
      .find({
        $or: [
          { Education: { $in: criteria.Education } },
          { Certifications: { $in: criteria.Certifications } },
          { Positions: { $in: criteria.Positions } },
        ],
        _id: { $ne: new ObjectId(userId) },
      })
      .project(projection)
      .limit(8)
      .toArray();

    res.status(200).send(suggestions);
  } catch (error) {
    console.log("Error fetching recommendations:", error);
    res.status(500).send("Internal Server Error");
  }
});
export default router;
