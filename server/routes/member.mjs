import express from "express";
import db from "../db/conn.mjs";
import multer from "multer";
import { ObjectId } from "mongodb";
import Papa from "papaparse";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("files");

//function to convert csv to json
const convertCSVtoJSON = async (csvBuffer) => {
  try {
    const csvData = csvBuffer.toString("utf8");
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    return result.data;
  } catch (error) {
    console.log("Error reading CSV file:", error);
    throw error;
  }
};

router.get("/", async (req, res) => {
  let collection = await db.collection("members");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// Upload and process LinkedIn data
router.patch("/:id/upload", upload, async (req, res) => {
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    // Check if file uploaded
    if (!req.files) {
      return res.status(400).send("No file uploaded");
    }

    const update = { $set: {} };
    // Convert CSV file to JSON
    // loop for multiple files
    for (const file of req.files) {
      const jsonData = await convertCSVtoJSON(file.buffer);
      const field = file.originalname.split(".")[0];

      // Set the field with the JSON data
      update.$set[field] = jsonData;
    }

    let result = await collection.updateOne(query, update);

    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing upload:", error);
    res.status(500).send("Internal Server Error");
  }
});

// update/add new user details
router.patch("/:id/update", async (req, res) => {
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    const { field, details } = req.body;

    if (field === "Password" || "ProfilePic") {
      const update = {
        $set: {
          [field]: details,
        },
      };
      let result = await collection.updateOne(query, update);

      res.status(200).send(result);
    } else {
      const update = {
        $push: {
          [field]: details,
        },
      };
      let result = await collection.updateOne(query, update);

      res.status(200).send(result);
    }
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

// update/remove user details
router.patch("/:id/remove", async (req, res) => {
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    const { field, details } = req.body;

    const update = {
      $pull: {
        [field]: details,
      },
    };

    let result = await collection.updateOne(query, update);

    res.status(200).send(result);
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
