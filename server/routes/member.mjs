import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb"; 

const router = express.Router();

//Route: To get all members
router.get("/", async (req, res) => {
    let collection = await db.collection("members");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
  });

//Route: Fetch a specific member by ID
router.get("/:id", async (req , res) => {
  let collection = await db.collection("members");
  let query = {_id: new ObjectId(req.params.id)};
  let result = await collection.findOne(query);
  res.send(result).status(200);
});



//Route: Reject the member / Delete user account
router.delete("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id)};

  const collection = db.collection("members");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

//Route: Approve the member by admin
router.patch("/:id/approve", async (req, res) =>{
  let collection = await db.collection("members");

  const query = { _id: new ObjectId(req.params.id) };
  const update = { $set: { status: "Approved" } };
  
  let result = await collection.updateOne(query, update)
  res.send(result).status(200);


});
//Route: Suspend member by Admin
router.patch("/:id/suspend", async (req, res) =>{
  let collection = await db.collection("members");

  const query = { _id: new ObjectId(req.params.id)};

  const user = await collection.findOne(query);

  const newStatus = user.status === "Suspended" ? "Unsuspended" : "Suspended";

  const update = { $set: { status: newStatus } };

  let result = await collection.updateOne(query, update)
  res.send(result).status(200);

});


// add member by admins
router.post("/", async (req , res) => {
  let newMember = {
  Email: req.body.email,
  Password : req.body.password,
  FirstName : req.body.firstName,
  LastName : req.body.lastName,
  ProfilePic : "", // work on this later

 // The remaining fields must be filled out by users after the admin creates their accounts.
  Skills : '',
  Experience: '',
  Education: '',
  Certificates: '',
  Status: "Approved",
  LinkedInData: "",
  Contact: ""

  };

  let collection = await db.collection("members");

  let result = await collection.insertOne(newMember);
  let insertedId = result.insertedId

  res.send({id: insertedId}).status(200);

})








  export default router;

