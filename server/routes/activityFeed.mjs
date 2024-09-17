import express from "express";
import { GridFSBucket, ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import multer from "multer";
import db from "../db/conn.mjs";

const router = express.Router();
const bucket = new GridFSBucket(db, { bucketName: "uploads" });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "membernetworkingportal@gmail.com",
    pass: "fklb cbjd ebxd wbfz",
  },
});

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "membernetworkingportal@gmail.com",
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

const following = async (userId) => {
  let collection = db.collection("connections");
  let results = await collection
    .aggregate([
      {
        $match: {
          $or: [{ userID1: userId }, { userID2: userId }],
          status: "Accept",
        },
      },
      {
        $project: {
          followingId: {
            $cond: {
              if: { $eq: ["$userID1", userId] },
              then: "$userID2",
              else: "$userID1",
            },
          },
        },
      },
    ])
    .toArray();
  const following = results.map((doc) => doc.followingId);
  return following;
};

const likeChecker = async (postId, userId) => {
  let collection = db.collection("posts");
  let query = { _id: new ObjectId(postId) };
  let result = await collection.findOne(query, { projection: { likes: 1 } });

  if (result && result.likes) {
    // Check if the likes array contains the userId
    return result.likes.includes(userId);
  }

  return false;
};

const authorMetadata = async (authorId) => {
  let collection = db.collection("members");
  let query = { _id: new ObjectId(authorId) };
  let result = await collection.findOne(query, {
    projection: { FirstName: 1, LastName: 1, Email: 1, ProfilePic: 1 },
  });

  return result;
};

const reportChecker = async (postId, authorId, authorEmail) => {
  try {
    let collection = db.collection("posts");
    let notificationCollection = db.collection("notifications");
    let query = { _id: new ObjectId(postId) };
    let result = await collection.findOne(query, {
      projection: { reports: 1 },
    });

    const reports = result.reports;
    if (reports.length === 10) {
      await collection.deleteOne(query);
      let notification = {
        userID: authorId,
        type: "Post",
        message: `Your post has been removed by the system.`,
        createdAt: new Date(),
      };
      await notificationCollection.insertOne(notification);

      // Send email notification

      const recipientEmail = authorEmail;

      sendEmail(
        recipientEmail,
        "Post Status",
        `Your Post has been removed due to excessive reports by users.`
      );
    }
  } catch (error) {
    console.log("Error retrieving activity feed", error);
  }
};

// Route: Approve the post by admin
router.patch("/:postId/approve", async (req, res) => {
  try {
    let collection = await db.collection("posts");
    let notificationCollection = await db.collection("notifications");

    const query = { _id: new ObjectId(req.params.postId) };
    const update = { $set: { status: "Approved" }, $unset: { reports: "" } };
    let result = await collection.updateOne(query, update);
    console.log(req.body);

    // Create notification for the recipient
    let notification = {
      userID: req.body.authorId,
      type: "Post",
      message: `Your post has been approved!`,
      createdAt: new Date(),
    };
    await notificationCollection.insertOne(notification);

    // Send email notification

    const recipientEmail = req.body.authorEmail;
    console.log(recipientEmail);

    sendEmail(recipientEmail, "Post Status", `Your Post has been approved!`);

    res.send(result).status(200);
  } catch (error) {
    console.log("Error retrieving activity feed", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route: deny the posts by admin
router.delete("/:postId/deny", async (req, res) => {
  try {
    let collection = await db.collection("posts");
    let notificationCollection = await db.collection("notifications");

    const query = { _id: new ObjectId(req.params.postId) };

    let result = await collection.deleteOne(query);

    // Create notification for the recipient
    let notification = {
      userID: req.headers["x-authorid"],
      type: "Post",
      message: `Your post has been denied!`,
      createdAt: new Date(),
    };
    await notificationCollection.insertOne(notification);

    // Send email notification

    const recipientEmail = req.headers["x-authoremail"];
    console.log(recipientEmail);

    sendEmail(
      recipientEmail,
      "Post Status",
      `Your Post has been denied! Reason: ${req.headers["x-reason"]}`
    );

    res.send(result).status(200);
  } catch (error) {
    console.log("Error retrieving activity feed", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route: To get pending posts
router.get("/pending", async (req, res) => {
  try {
    let collection = await db.collection("posts");
    let results = await collection.find({ status: "Pending" }).toArray();

    if (results.length === 0) {
      res.status(404).send({ message: "No pending posts found." });
    } else {
      const postsWithMetadata = await Promise.all(
        results.map(async (post) => {
          const authorDetails = await authorMetadata(post.authorId);
          return {
            ...post,
            author: authorDetails.FirstName + " " + authorDetails.LastName,
            authorEmail: authorDetails.Email,
          };
        })
      );
      console.log(postsWithMetadata);
      res.status(200).send(postsWithMetadata);
    }
  } catch (error) {
    console.log("Error retrieving pending posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route: To get reported posts
router.get("/reported", async (req, res) => {
  try {
    let collection = await db.collection("posts");
    let results = await collection
      .find({ reports: { $exists: true, $ne: [] } })
      .toArray();

    if (results.length === 0) {
      res.status(404).send({ message: "No reported posts found." });
    } else {
      const postsWithMetadata = await Promise.all(
        results.map(async (post) => {
          const authorDetails = await authorMetadata(post.authorId);
          return {
            ...post,
            author: authorDetails.FirstName + " " + authorDetails.LastName,
            authorEmail: authorDetails.Email,
          };
        })
      );

      res.status(200).send(postsWithMetadata);
    }
  } catch (error) {
    console.log("Error retrieving pending posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Upload post with media
router.post("/:authorId", upload.single("media"), async (req, res) => {
  const authorId = req.params.authorId;
  const media = req.file ? req.file.buffer : null;
  console.log(media);

  const newPost = {
    authorId,
    content: req.body.content,
    mediaId: null, // Will be set after storing the media
    status: "Pending",
    timestamp: new Date().toISOString(),
    likes: [],
    comments: [],
  };

  try {
    const postsCollection = db.collection("posts");
    const result = await postsCollection.insertOne(newPost);
    const postId = result.insertedId;

    if (media) {
      const uploadStream = bucket.openUploadStream(`post-${postId}`, {
        contentType: req.file.mimetype,
        metadata: { postId: postId },
      });

      uploadStream.end(media);

      uploadStream.on("finish", () => {
        postsCollection.updateOne(
          { _id: postId },
          { $set: { mediaId: uploadStream.id } }
        );
      });
    }

    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error adding post:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Retrieve media from GridFS
router.get("/media/:fileId", async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.fileId);
    const file = await bucket.find({ _id: fileId }).toArray();
    const downloadStream = bucket.openDownloadStream(fileId);

    const fileType = file[0].contentType;
    res.setHeader("Content-Type", fileType);

    downloadStream.on("error", () => {
      res.status(404).send("No file found");
    });

    return downloadStream.pipe(res);
  } catch (error) {
    console.log("Error retrieving media:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete post
router.delete("/:authorId/:postId", async (req, res) => {
  const postId = new ObjectId(req.params.postId);

  try {
    //find and delete media associated with the post
    const post = await db.collection("posts").findOne({ _id: postId });
    if (post && post.mediaId) {
      bucket.delete(post.mediaId, (err) => {
        if (err) {
          console.error("Error deleting media from GridFS:", err);
        }
      });
    }

    // Delete the post
    const result = await db.collection("posts").deleteOne({ _id: postId });
    if (result.deletedCount === 0) {
      return res.status(404).send("Post not found");
    }

    res.status(200).send("Post deleted");
  } catch (error) {
    console.log("Error deleting post:", error);
    res.status(500).send("Internal Server Error");
  }
});

//update content
router.patch("/:authorId/:postId", async (req, res) => {
  const { content } = req.body;
  try {
    const query = { _id: new ObjectId(req.params.postId) };
    const update = {
      $set: { content: content },
    };

    let result = await db.collection("posts").updateOne(query, update);
    res.status(200).send(result);
  } catch (error) {
    console.log("Error updating user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

//add comment
router.patch("/:userId/:postId/comment", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.postId) };
    const update = {
      $push: {
        comments: {
          commentId: new ObjectId(),
          userId: req.params.userId,
          content: req.body.content,
          timestamp: formatDate(new Date()),
          username: req.body.username,
        },
      },
    };
    let result = await db.collection("posts").updateOne(query, update);
    res.status(200).send(result);
  } catch (error) {
    console.log("Error updating user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

//delete comment
router.delete("/:userId/:postId/:commentId/comment", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.postId) };
    const update = {
      $pull: {
        comments: {
          commentId: new ObjectId(req.params.commentId),
        },
      },
    };
    let result = await db.collection("posts").updateOne(query, update);
    res.status(200).send(result);
  } catch (error) {
    console.log("Error deleting comments", error);
    res.status(500).send("Internal Server Error");
  }
});

//like
router.patch("/:userId/:postId/like", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.postId) };
    const update = {
      $push: {
        likes: req.params.userId,
      },
    };
    let result = await db.collection("posts").updateOne(query, update);
    res.status(200).send(result);
  } catch (error) {
    console.log("Error updating user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

//unlike
router.delete("/:userId/:id/unlike", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const update = {
      $pull: {
        likes: req.params.userId,
      },
    };
    let result = await db.collection("posts").updateOne(query, update);
    res.status(200).send(result);
  } catch (error) {
    console.log("Error deleting comments", error);
    res.status(500).send("Internal Server Error");
  }
});

//report posts
router.patch("/:userId/:postId/report", async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { authorId, authorEmail } = req.body;

    const query = { _id: new ObjectId(postId) };

    const post = await db.collection("posts").findOne(query);
    //checks if user already reported
    if (post.reports && post.reports.includes(userId)) {
      return res
        .status(400)
        .send({ message: "You have already reported this post." });
    }
    const update = {
      $push: { reports: userId },
    };

    const result = await db.collection("posts").updateOne(query, update);

    res.status(200).send(result);
    reportChecker(postId, authorId, authorEmail);
  } catch (error) {
    console.log("Error reporting post:", error);
    res.status(500).send("Internal Server Error");
  }
});

//get your activity
router.get("/yourActivity/:userId", async (req, res) => {
  try {
    const collection = await db.collection("posts");
    const results = await collection
      .find({
        status: "Approved", //only search approved posts
        authorId: req.params.userId,
      })
      .toArray();

    const activityWithLikeStatus = await Promise.all(
      results.map(async (post) => {
        const likeStatus = await likeChecker(post._id, req.params.userId);
        const authorDetails = await authorMetadata(post.authorId);

        return {
          ...post,
          likeStatus: likeStatus,
          FirstName: authorDetails.FirstName,
          LastName: authorDetails.LastName,
          ProfilePic: authorDetails.ProfilePic,
        };
      })
    );

    res.status(200).send(activityWithLikeStatus);
  } catch (error) {
    console.log("Error retrieving your activity", error);
    res.status(500).send("Internal Server Error");
  }
});

//get your activity feed
router.get("/activityFeed/:userId", async (req, res) => {
  try {
    const followingList = await following(req.params.userId);
    followingList.push(req.params.userId);
    console.log(followingList);

    const feedList = [];

    for (const userId of followingList) {
      const postsCollection = db.collection("posts");
      const results = postsCollection.find({
        status: "Approved", // Only search approved posts
        authorId: userId,
      });

      const postsArray = await results.toArray(); // Convert cursor to an array

      for (const post of postsArray) {
        const likeStatus = await likeChecker(post._id, req.params.userId);
        const authorDetails = await authorMetadata(post.authorId);
        feedList.push({
          ...post,
          likeStatus: likeStatus,
          FirstName: authorDetails.FirstName,
          LastName: authorDetails.LastName,
          ProfilePic: authorDetails.ProfilePic,
        });
      }
    }

    feedList.sort((a, b) => {
      const dateComparison = new Date(b.timestamp) - new Date(a.timestamp);
      if (dateComparison !== 0) return dateComparison; // Sort by timestamp first
      return b.likes.length - a.likes.length; // Then sort by number of likes
    });

    res.status(200).send(feedList);
  } catch (error) {
    console.log("Error retrieving activity feed", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
