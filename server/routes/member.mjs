import express from "express";
import db from "../db/conn.mjs";
import multer from "multer";
import { ObjectId } from "mongodb";
import Papa from "papaparse";
import nodemailer from "nodemailer";


const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("files");

//function to convert csv to json
const convertCSVtoJSON = async (csvBuffer) => {
  try {
    const csvData = csvBuffer.toString("utf8");
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    return result.data;
  } catch (error) {
    console.log("Error reading CSV file:", error);
    throw error;
  }
};
 

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

// Route: To get all approved members
router.get("/approved", async (req, res) => {
  const collection = await db.collection("members");
  const results = await collection.find({ status: "Approved" }).toArray();
  if (results.length === 0) {
    res.status(404).send({ message: "No approved members found." });
  } else {
    res.status(200).send(results);
  }
});

//Route: To get suspened members
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

  const newStatus = user.status === "Suspended" ? "Approved" : "Suspended";

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








// Route: Add member by admins
router.post("/", async (req, res) => {
  let newMember = {
    Email: req.body.email,
    Password: req.body.password,
    FirstName: req.body.firstName,
    LastName: req.body.lastName,
    ProfilePic: "", 
// The remaining fields must be filled out/updated by users after the admin creates their accounts.
    Skills: '',
    Experience: '',
    Education: '',
    Certificates: '',
    status: "Approved",
    LinkedInData: "",
    Contact: ""
  };

  let collection = await db.collection("members");
  try {
    let result = await collection.insertOne(newMember);
    let insertedId = result.insertedId;

    // Send welcome email after successful insertion
    sendEmail(req.body.email, "Welcome to Our Platform", `Hi ${req.body.firstName}, welcome to our platform. Your account has been created successfully by admin.`);

    res.send({id: insertedId}).status(201);
  } catch (error) {
    console.log("Error creating connection:", error);
    res.status(500).send("Internal Server Error");
  }
});



// Upload and process LinkedIn data
//postman usage: form-data, key: files, type: file
router.patch("/:id/upload", upload, async (req, res) => {
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    // Check if file uploaded
    if (!req.files) {
      return res.status(400).send("No file uploaded");
    }

    const update = { $set: {} };
    // Convert CSV file to JSON
    // loop for multiple files
    for (const file of req.files) {
      const jsonData = await convertCSVtoJSON(file.buffer);
      const field = file.originalname.split(".")[0];

      // Set the field with the JSON data
      update.$set[field] = jsonData;
    }

    let result = await collection.updateOne(query, update);

    res.status(200).send(result);
  } catch (error) {
    console.log("Error processing upload:", error);
    res.status(500).send("Internal Server Error");
  }
});

// update/add new user details
/*
postman usage: {
    "field": "Positions",
    "details": {
      "Company Name": "New Company",
      "Title": "New Title",
      "Description": "New Description",
      "Location": "New Location",
      "Started On": "Jul 2024",
      "Finished On": null
    }
}
*/
router.patch("/:id/update", async (req, res) => {
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    const { field, details } = req.body;

    if (field === "Password" || field === "ProfilePic") {
      const update = {
        $set: {
          [field]: details,
        },
      };
      let result = await collection.updateOne(query, update);

      res.status(200).send(result);
    } else {
      const update = {
        $push: {
          [field]: details,
        },
      };
      let result = await collection.updateOne(query, update);

      res.status(200).send(result);
    }
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

// update/remove user details

/*
Postman
{
    "field": "Positions",
    "details": {
        "Company Name": "New Company"
    }
}
*/
router.patch("/:id/remove", async (req, res) => {
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    const { field, details } = req.body;

    const update = {
      $pull: {
        [field]: details,
      },
    };

    let result = await collection.updateOne(query, update);

    res.status(200).send(result);
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).send("Internal Server Error");
  }
});












  export default router;


