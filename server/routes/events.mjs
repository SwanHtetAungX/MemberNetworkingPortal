import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Middleware to authenticate the user
const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).send("Unauthorized: Invalid or expired token");
    }
};

// Creating an event by user (POST)
//Uploading Image or Promo Video for event
router.post("/create", authenticateUser, async (req, res) => {
    try {
        const { title, date, location, time, description, isPublic } = req.body;

        if (!title || !date || !location) {
            return res.status(400).send("Title, date, and location are required");
        }

        let collection = await db.collection("events");

        let newEvent = {
            title,
            date: new Date(date),
            location,
            time,
            description,
            isPublic: isPublic || false,
            //attendeeNumber,
            createdBy: new ObjectId(req.userId),
            createdAt: new Date(),
            status: isPublic ? "Pending" : "Approved"
        };

        //- private events don't need approval, they cannot invite
        //- public events need admin approval, they can invite others

        let result = await collection.insertOne(newEvent);

        const message = isPublic 
            ? "Event created and pending approval" 
            : "Event added to calendar";
        
        res.status(201).send({ message, eventId: result.insertedId });
        console.log("New event:", newEvent);
        console.log("Response message:", message);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).send("Internal Server Error");
    }
});




//Get Events by User Id and Date To display on Calendar? Search?(GET)\
router.get("/", authenticateUser, async(req,res)=>{
    try{
        //variables
        const { date } = req.query;
        const userId = req.userId;
        
        if (!date) {
            return res.status(400).send("Date is required");
        }

        let collection = await db.collection("events");

        //filter to get all events in one day
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const events = await collection.find({
            createdBy: new ObjectId(userId), // Filter by user ID
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).toArray();

        res.status(200).json(events);
    } catch (error) {
        console.error("Failed to retreive Events.");
        res.status(500).send("Internal Server Error");
    }
});

//to GET an array of Dates to highlight events in calendar

router.get("/dates", authenticateUser, async(req,res)=>{
    try{
        //variables
        const userId = req.userId;
        let collection = await db.collection("events");

        const events = await collection.find({
            createdBy: new ObjectId(userId)}).toArray();

        // Extract unique dates
        const eventDates = new Set(events.map(event => {
            return new Date(event.date).toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'
        }));

        // Send unique dates as response
        res.status(200).json({ dates: Array.from(eventDates) });
    } catch (error) {
        console.error("Failed to retreive Event Dates.");
        res.status(500).send("Internal Server Error");
    }
});


//Editing an Event by user (PATCH)
router.patch("/update/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, location, time, description, isPublic } = req.body;
        const userId = req.userId;

        let collection = await db.collection("events");

        // update object
        let updateData = {};
        if (title) updateData.title = title;
        if (date) updateData.date = new Date(date);
        if (location) updateData.location = location;
        if (time) updateData.time = time;
        if (description) updateData.description = description;
        if (typeof isPublic !== 'undefined') updateData.isPublic = isPublic;

        //checking if event and user are valid
        const result = await collection.updateOne(
            { _id: new ObjectId(id), createdBy: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("Event not found or not authorized to update");
        }

        res.status(200).send("Event updated successfully");
    } catch (error) {
        console.error("Failed to update event", error);
        res.status(500).send("Internal Server Error");
    }
});

//Deleting an Event by user(DELETE)
router.delete("/delete/:id",authenticateUser, async(req,res)=>{
    try{
        const { id } = req.params;
        const userId = req.userId;

        let collection = await db.collection("events");
        // Log incoming request
        console.log(`Attempting to delete event with ID: ${id} for user ID: ${userId}`);

        // event and user are valid
        const result = await collection.deleteOne({
            _id: new ObjectId(id),
            createdBy: new ObjectId(userId)
        });

        // Log the result
        console.log(`Delete result: ${JSON.stringify(result)}`);

        if (result.deletedCount === 0) {
            return res.status(404).send("Event not found or not authorized to delete");
        }

        res.status(200).send("Event deleted successfully");
    } catch(error){
        console.error("Failed to delete Event");
        res.status(500).send("Internal Server Error");
    }
});

//Sending an Public Event invite to user
// router.post("/invite", async(req,res)=>{
//     try{

//     } catch(error){
//         console.error("Failed to send Event Invite");
//         res.status(500).send("Internal Server Error");
//     }
// });

//admin approval for events
//- admin can send a note to the user whilst approval (optional)

router.patch("/admin/approve-or-cancel/:id", authenticateUser, async (req, res) => {
    try {
        // Ensure the user is an admin (add admin check logic here if needed)
        const { id } = req.params;
        const { action } = req.body; // 'action' = 'approve' or 'cancel'

        if (!['approve', 'cancel'].includes(action)) {
            return res.status(400).send("Invalid action");
        }

        let collection = await db.collection("events");

        // Fetch the event to check its current status
        const event = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!event) {
            return res.status(404).send("Event not found");
        }

        if (event.status !== "Pending") {
            return res.status(400).send("Event is not pending approval");
        }

        let updateData = {};
        let responseMessage = "";

        if (action === 'approve') {
            updateData.status = "Approved";
            responseMessage = "Event approved successfully";
        } else if (action === 'cancel') {
            await collection.deleteOne({ _id: new ObjectId(id) });
            responseMessage = "Event canceled and removed successfully";
        }

        if (action === 'approve') {
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
        }  } catch (error) {
            console.error("Failed to approve or cancel event", error);
            res.status(500).send("Internal Server Error");
        }
    });

//RSVP for an event store [User Name, Accepted Time,]
//- only store attending people

//Share as Post

//Sending an Public Event invite to user

export default router;