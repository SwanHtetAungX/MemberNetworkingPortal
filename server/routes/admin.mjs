import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

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

        // Check password
        const isMatch = await bcrypt.compare(Password, admin.Password);
        if (!isMatch) {
            return res.status(400).send("Invalid email or password");
        }

        // Generate JWT token for admin
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;
