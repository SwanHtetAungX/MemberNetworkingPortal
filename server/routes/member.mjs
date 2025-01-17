import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import multer from "multer";
import Papa from "papaparse";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "membernetworkingportal@gmail.com",
    pass: "fklb cbjd ebxd wbfz",
  },
});

// Function to send 2FA code
const send2FACode = async (email, code) => {
  await transporter.sendMail({
    from: "membernetworkingportal@gmail.com",
    to: email,
    subject: "Networking Portal OTP",
    text: `Your OTP is: ${code}`,
  });
};

// Function to send general emails
const sendEmail = async (email, subject, text) => {
  const mailOptions = {
    from: "membernetworkingportal@gmail.com",
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ID format");
  }
  return new ObjectId(id);
}



router.post('/bulk', async (req, res) => {
  const members = req.body;

  try {
    const collection = db.collection('members');

    for (const member of members) {
      member.Password = await bcrypt.hash(member.Password, 10);

      member.ProfilePic = ""; 
      member.JobTitle = ""; 
      member.Department = ""; 
      member.Location = ""; 
      member.Bio = ""; 
      member.Contact = ""; 
      member.Skills = []; 
      member.Positions = []; 
      member.Education = []; 
      member.Certifications = []; 
      member.Projects = []; 
      member.linkedInData = null; 
      member.status = "Approved"; 
    }

    
    await collection.insertMany(members);
    
    
    for (const member of members) {
      await sendEmail(member.Email, 'Welcome to the platform!', 'Your account has been created.');
    }

    res.status(200).json({ message: 'Members added successfully' });
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({ message: 'Failed to add members in bulk.' });
  }
});



router.get("/search", async (req, res) => {
  try {
    const { query, name, jobTitle, department, location, skills } = req.query;
    
    

    let searchQuery = { status: "Approved" };

    if (query) {
      // Simple search
      searchQuery.$or = [
        { FirstName: { $regex: query, $options: "i" } },
        { LastName: { $regex: query, $options: "i" } },
        { JobTitle: { $regex: query, $options: "i" } },
        { Department: { $regex: query, $options: "i" } },
        { Location: { $regex: query, $options: "i" } },
        { "Skills.Name": { $regex: query, $options: "i" } },
      ];
    } else {
      // Advanced search
      if (name) {
        searchQuery.$or = [
          { FirstName: { $regex: name, $options: "i" } },
          { LastName: { $regex: name, $options: "i" } },
        ];
      }

      if (jobTitle) {
        searchQuery.JobTitle = { $regex: jobTitle, $options: "i" };
      }

      if (department) {
        searchQuery.Department = { $regex: department, $options: "i" };
      }

      if (location) {
        searchQuery.Location = { $regex: location, $options: "i" };
      }

      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        searchQuery["Skills.Name"] = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
      }
    }

    

    let collection = await db.collection("members");
    let results = await collection
      .find(searchQuery)
      .project({ FirstName: 1, LastName: 1, ProfilePic: 1, JobTitle: 1, Department: 1, Location: 1, Skills: 1 })
      .toArray();

   

    res.status(200).send(results);
  } catch (error) {
    console.error("Error searching members:", error);
    res.status(500).send("Internal Server Error");
  }
});

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
      status: "Pending",
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
router.post("/login", async (req, res) => {
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
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/authenticate", async (req, res) => {
  try {
    const token = req.headers["authorization"];
    jwt.verify(token, JWT_SECRET);
    res.status(200).send(true);
  } catch (error) {
    res.status(401).send(false);
  }
});

// Storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// PATCH /:id/ProfilePic - Upload Profile Picture
router.patch(
  "/:id/ProfilePic",
  upload.single("profilePic"),
  async (req, res) => {
    try {
      let collection = await db.collection("members");
      const query = { _id: new ObjectId(req.params.id) };

      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }

      const base64Image = req.file.buffer.toString("base64");
      const imageType = req.file.mimetype; // e.g., 'image/png'
      const base64String = `data:${imageType};base64,${base64Image}`;

      const update = {
        $set: {
          ProfilePic: base64String,
        },
      };

      let result = await collection.updateOne(query, update);

      res.status(200).send(result);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Function to convert CSV to JSON
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

// Route: To get all members
router.get("/", async (req, res) => {
  let collection = await db.collection("members");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// Route: To get pending members
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

// Route: To get suspended members
router.get("/suspended", async (req, res) => {
  let collection = await db.collection("members");
  let results = await collection.find({ status: "Suspended" }).toArray();
  if (results.length === 0) {
    res.status(404).send({ message: "No suspended members found." });
  } else {
    res.status(200).send(results);
  }
});

// Route: Fetch a specific member by ID
router.get("/:id", async (req, res) => {
  let collection = await db.collection("members");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);
  res.send(result).status(200);
});

// Route: Reject the member / Delete user account
router.delete("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("members");
  const user = await collection.findOne({ _id: new ObjectId(req.params.id) });

  let result = await collection.deleteOne(query);
  if (result.deletedCount === 1) {
    sendEmail(
      user.Email,
      "Account Status",
      "Your account has been rejected and deleted."
    );
  }

  res.send(result).status(200);
});

// Route: Approve the member by admin
router.patch("/:id/approve", async (req, res) => {
  let collection = await db.collection("members");

  const query = { _id: new ObjectId(req.params.id) };
  const update = { $set: { status: "Approved" } };
  let result = await collection.updateOne(query, update);
  if (result.modifiedCount === 1) {
    const user = await collection.findOne(query);
    sendEmail(
      user.Email,
      "Account Status",
      "Congratulations! Your account has been approved."
    );
  }

  res.send(result).status(200);
});

// Route: Suspend member by Admin
router.patch("/:id/suspend", async (req, res) => {
  let collection = await db.collection("members");

  const query = { _id: new ObjectId(req.params.id) };

  const user = await collection.findOne(query);

  const newStatus = user.status === "Suspended" ? "Approved" : "Suspended";

  const update = { $set: { status: newStatus } };

  let result = await collection.updateOne(query, update);
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
    Skills: "",
    Experience: "",
    Education: "",
    Certificates: "",
    status: "Approved",
    LinkedInData: "",
    Contact: "",
  };

  let collection = await db.collection("members");
  try {
    let result = await collection.insertOne(newMember);
    let insertedId = result.insertedId;

    // Send welcome email after successful insertion
    sendEmail(
      req.body.email,
      "Welcome to Our Platform",
      `Hi ${req.body.firstName}, welcome to our platform. Your account has been created successfully by admin.`
    );

    res.send({ id: insertedId }).status(201);
  } catch (error) {
    console.log("Error creating connection:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Upload and process LinkedIn data
//postman usage: form-data, key: files, type: file
router.patch("/:id/upload", upload.array("files[]"), async (req, res) => {
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

// Update/add new user details
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
router.patch("/:id/update", upload.single("ProfilePic"), async (req, res) => {
  console.log("HIII");
  try {
    let collection = await db.collection("members");
    const query = { _id: new ObjectId(req.params.id) };

    const { field, details } = req.body;

    if (field === "Password") {
      const hashedPassword = await bcrypt.hash(details.newPassword, 10);
      const update = {
        $set: {
          [field]: hashedPassword,
        },
      };
      let result = await collection.updateOne(query, update);
      res.status(200).send(result);
    } else if (field === "ProfilePic") {
      console.log("1");
      if (req.file) {
        const update = {
          $set: {
            [field]: req.file.buffer, // Store as binary data
          },
        };
        console.log("Update Object:", update);
        console.log("File Buffer Length:", req.file.buffer.length); // Check buffer length
        let result = await collection.updateOne(query, update);
        res.status(200).send(result);
      } else {
        res.status(400).send("No file uploaded for ProfilePic.");
      }
    } else if (field === "Profile" || field === "Bio") {
      console.log("2");
      const update = {
        $set: details,
      };
      let result = await collection.updateOne(query, update);
      res.status(200).send(result);
    } else {
      console.log("3");
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
