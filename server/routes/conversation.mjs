import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// New conversation route
router.post("/", async (req, res) => {
    const newConversation = {
        members: [req.body.senderId, req.body.receiverId],
    };

    try {
        
        const collection = db.collection('conversations');
        const result = await collection.insertOne(newConversation);
        res.status(200).json(result); 
    } catch (err) {
        res.status(500).json(err);
    }
});


// get conv of a user

router.get("/:userId", async(req,res) => {
    try{
        let collection = await db.collection("conversations");
        let result = await collection.find({

            members: {$in: [req.params.userId] }
        }).toArray();

        res.status(200).json(result)

    }
    catch(err){
        res.status(500).json(err);
    }
})


// get conv inlcudes two userId


router.get("/find/:firstUserId/:secondUserId", async(req, res) => {
    try {

        let collection = await db.collection("conversations");
        let result = await collection.findOne({

            members:{ $all : [req.params.firstUserId, req.params.secondUserId]}



        })

        res.status(200).json(result);


    } catch(err){
        res.status(500).json(err)
    }
})
export default router;
