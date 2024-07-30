import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

//post register
router.post("/register", async (req, res) => {
    try {

        let collection = await db.collection("members");

        // Check if the email is already in use
        const existingUser = await collection.findOne({ Email: req.body.Email });
        if (existingUser) {
            return res.status(400).send("Email is already in use");
        }
              

        let newUser = {

            Email: req.body.Email,
            Password: req.body.Password,
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            ProfilePic: req.body.ProfilePic,
            JobTitle: req.body.JobTitle,
            Department: req.body.Department,
            Location: req.body.Location,
            Bio: req.body.Bio,
            Contact:req.body.Contact,
            Skills: [],
            Positions: [],
            Education: [],
            Certifications:[],
            Projects:[],
            LinkedInData:req.body.LinkedInData,
            status: "Pending"                      
        }


        await collection.insertOne(newUser);
        res.status(201).send("User Registered"); //may cause error
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

})

  export default router;