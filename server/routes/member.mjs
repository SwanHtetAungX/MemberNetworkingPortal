import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Function to send 2FA code
const send2FACode = async (email, code) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Networking Portal OTP',
        text: `Your OTP is: ${code}`,
    });
};

// POST /register - Registration route
router.post("/register", async (req, res) => {
    try {
        let collection = await db.collection("members");

        // Check if the email is already in use
        const existingUser = await collection.findOne({ Email: req.body.Email });
        if (existingUser) {
            return res.status(400).send("Email is already in use");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.Password, 10);

        // Create new user object
        let newUser = {
            Email: req.body.Email,
            Password: hashedPassword,
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            ProfilePic: req.body.ProfilePic,
            JobTitle: req.body.JobTitle,
            Department: req.body.Department,
            Location: req.body.Location,
            Bio: req.body.Bio,
            Contact: req.body.Contact,
            Skills: [],
            Positions: [],
            Education: [],
            Certifications: [],
            Projects: [],
            LinkedInData: req.body.LinkedInData,
            status: "Pending"
        };

        // Insert the new user into the database
        await collection.insertOne(newUser);
        res.status(201).send("User Registered");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// POST /login - Login route
router.post('/login', async (req, res) => {
    try {
        let collection = await db.collection("members");
        const { Email, Password } = req.body;

        // Find user by email
        const user = await collection.findOne({ Email });
        if (!user) {
            return res.status(400).send("Invalid email or password");
        }

        // Check password
        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) {
            return res.status(400).send("Invalid email or password");
        }

        // Check if the user is approved
        if (user.status !== "Approved") {
            return res.status(403).send(`User account is ${user.status}`);
        }

        // Generate a 2FA code
        const twofaCode = crypto.randomInt(100000, 999999).toString();
        user.twofaCode = twofaCode;
        user.twofaCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await collection.updateOne({ _id: user._id }, { $set: user });

        // Send 2FA code to user's email
        await send2FACode(Email, twofaCode);

        res.status(200).json({ message: "2FA Code sent to your email" });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// POST /verify-2fa - 2FA Verification route
router.post("/verify-2fa", async (req, res) => {
    try {
        let collection = await db.collection("members");
        const { Email, twofaCode } = req.body;

        // Find user by email
        const user = await collection.findOne({ Email });
        if (!user) {
            return res.status(400).send("Invalid email");
        }

        // Check 2FA code and expiration
        if (user.twofaCode !== twofaCode || Date.now() > user.twofaCodeExpires) {
            return res.status(400).send("Invalid or expired 2FA code");
        }

        // Clear the 2FA code and expiration
        user.twofaCode = undefined;
        user.twofaCodeExpires = undefined;
        await collection.updateOne({ _id: user._id }, { $set: user });

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;
