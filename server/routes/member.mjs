import express from "express";
import db from "../db/conn.mjs";
import multer from "multer";
import { ObjectId } from "mongodb";
import Papa from "papaparse";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", async (req, res) => {
  let collection = await db.collection("members");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// Upload and process LinkedIn data
router.patch("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    // Check if file uploaded
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // Convert CSV file to JSON
    const jsonData = convertCSVtoJSON(req.file.buffer);
    const field = req.file.originalname.split(".")[0];

    const update = {
      $set: {
        [field]: jsonData,
      },
    };

    let result = await collection.updateOne(query, update);

    res.status(200).send(result);
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).send("Internal Server Error");
  }
});

//function to convert CSV to JSON
const convertCSVtoJSON = (csvBuffer) => {
  try {
    const csvData = csvBuffer.toString("utf8");
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    return result.data;
  } catch (error) {
    console.error("Error reading CSV file:", error);
    throw error;
  }
};

export default router;
