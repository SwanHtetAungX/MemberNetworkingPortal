import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb"; 
import nodemailer from "nodemailer";

const router = express.Router();

// Set up email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'membernetworkingportal@gmail.com',
    pass: 'fklb cbjd ebxd wbfz'
  }
});

// Function to send emails
const sendEmail = async (email, subject, text) => {
  const mailOptions = {
    from: 'membernetworkingportal@gmail.com',
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


//Route: To get all members
router.get("/", async (req, res) => {
    let collection = await db.collection("members");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
  });

//Route: To get pending members
router.get("/pending", async (req, res) => {
  let collection = await db.collection("members");
  let results = await collection.find({ status: "Pending" }).toArray();
  if (results.length === 0) {
    res.status(404).send({ message: "No pending members found." });
  } else {
    res.status(200).send(results);
  }
});

//Route: To get pending members
router.get("/suspended", async (req, res) => {
  let collection = await db.collection("members");
  let results = await collection.find({ status: "Suspended" }).toArray();
  if (results.length === 0) {
    res.status(404).send({ message: "No suspended members found." });
  } else {
    res.status(200).send(results);
  }
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
  const user = await collection.findOne({ _id: new ObjectId(req.params.id) });

  let result = await collection.deleteOne(query);
  if (result.deletedCount === 1) {
    sendEmail(user.Email, "Account Status", "Your account has been rejected and deleted.");
  }

  res.send(result).status(200);
});

//Route: Approve the member by admin
router.patch("/:id/approve", async (req, res) =>{
  let collection = await db.collection("members");

  const query = { _id: new ObjectId(req.params.id) };
  const update = { $set: { status: "Approved" } };
  let result = await collection.updateOne(query, update)
  if (result.modifiedCount === 1) {
    const user = await collection.findOne(query);
    sendEmail(user.Email, "Account Status", "Congratulations! Your account has been approved.");
  }

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
  if (result.modifiedCount === 1) {
    // Prepare the email message based on the new status
    const emailSubject = `Account Status Change Notification`;
    const emailText = `Your account has been ${newStatus.toLowerCase()}.`;
    sendEmail(user.Email, emailSubject, emailText);
  }

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

 // The remaining fields must be filled out/updated by users after the admin creates their accounts.
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

