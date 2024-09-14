import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();



//add message

router.post("/", async(req,res) => {


    try{
        const collection = db.collection('messages')

        const message = {
            ...req.body,
            createdAt: new Date() 
          };
      
        const result = await collection.insertOne(message);

        res.status(200).json({
            _id: result.insertedId,
            ...message
        })
    }
    catch(err){
        res.status(500).json(err)

    }
})

//get message


router.get('/:conversationId', async (req, res) => {
    try {
        let collection = await db.collection("messages");

        let query = {
            conversationId: req.params.conversationId
        };

        let result = await collection.find(query).toArray(); 

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages", error: err.message });
    }
});





export default router;
