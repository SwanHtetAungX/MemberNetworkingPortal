import express from "express";
import { ObjectId } from "mongodb";
import db from "../db/conn.mjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET="your-jwt-secret-key"
// POST /admin/login - Admin Login route
router.post('/login', async (req, res) => {
    try {
        let collection = await db.collection("admin");
        const { Email, Password } = req.body;

        // Find admin by email
        const admin = await collection.findOne({ Email });
        if (!admin) {
            return res.status(400).send("Invalid email or password");
        }

        // Check password directly
        if (Password !== admin.Password) {
            return res.status(400).send("Invalid email or password");
        }

        // Generate JWT token for admin
        const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// GET /admin/:id - Get admin by ID route
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
