import express from "express";
import { ObjectId } from "mongodb";
import db from "../db/conn.mjs";

const router = express.Router();


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await db.collection("admin");
    const admin = await collection.findOne({ _id: new ObjectId(id) });

    if (!admin) {
      res.status(404).send({ message: "Admin not found" });
    } else {
      res.status(200).send(admin);
    }
  } catch (error) {
    console.error("Error retrieving admin by ID:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
