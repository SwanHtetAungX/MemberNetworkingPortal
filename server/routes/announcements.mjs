import express from "express";
import db from "../db/conn.mjs";
import nodemailer from 'nodemailer';
import { ObjectId } from "mongodb";
import cron from 'node-cron';
const router = express.Router();

const sendEmail = async (to, subject, text, html) => {
    try {
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'membernetworkingportal@gmail.com',
          pass: 'fklb cbjd ebxd wbfz',
        },
      });
  
      await transporter.sendMail({
        from: 'membernetworkingportal@gmail.com',
        to,
        subject,
        text,
        html
      });
  
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  cron.schedule('* * * * *', async () => {
    const now = new Date();
    try {
      const announcementCollection = db.collection('announcements');
      const membersCollection = db.collection('members');
  
      // Find announcements that are scheduled to be sent and have not been sent yet
      const scheduledAnnouncements = await announcementCollection.find({
        scheduleDate: { $lte: now },
        sent:  {$ne:true}
      }).toArray();
  
      for (const announcement of scheduledAnnouncements) {
        const approvedMembers = await membersCollection.find({ status: 'Approved' }).toArray();
        const emails = approvedMembers.map(member => member.Email);
  
        // Send emails to all approved members
        for (const email of emails) {
          await sendEmail(email, announcement.title, announcement.content, `<p>${announcement.content}</p>`);
        }
  
        // Mark the announcement as sent
        await announcementCollection.updateOne(
          { _id: new ObjectId(announcement._id) },
          { $set: {sent:true}}

        );
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
  

  

router.post('/', async(req, res) => {

    const {title, content, scheduleDate, expiryDate, priority, style} = req.body;

 try {
    const collection = db.collection('announcements');

    const announcement = {
        title,
        content,
        scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate): null,
        priority: priority || 'Medium',
        style: style || {},
        createdAt: new Date(),
        readBy: [],
        sent: false



    }

    const result = await collection.insertOne(announcement);

    if(!scheduleDate) {

        sendEmail('swanhtetaung403@gmail.com',title,content, `<p>${content}</p>`);

        await collection.updateOne(
            { _id: result.insertedId },
            { $set: { sent: true } }
        );


    }
    

    // if (!scheduleDate) {
  
    //     const membersCollection = db.collection('members');
    //     const approvedMembers = await membersCollection.find({ status: 'Approved' }).toArray();
    //     const emails = approvedMembers.map(member => member.Email);
  
        
    //     for (const email of emails) {
    //       await sendEmail(email, title, content, `<p>${content}</p>`);
    //     }
    //   }

    res.status(200).json(result);
    
 } catch(err){
    res.status(500).json(err)

 }

})

//Get all announcements
router.get("/", async(req, res) => {

    try {
        const collection = db.collection("announcements");

        const result = await collection.find().toArray();
        res.status(200).json(result);

    } catch(err){
        res.status(500).json({message: 'Failed to fetch announcements'});

    }
})

// Update Announcement (Acknowledgment)

router.patch('/mark-as-read', async (req, res) => {
    const { announcementId, userId } = req.body;
  
    try {
      await db.collection('announcements').updateOne(
        { _id: new ObjectId(announcementId) },
        { $addToSet: { readBy: userId } } 
      );
      res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ message: 'Failed to update announcement' });
    }
  });


router.delete('/:id', async (req,res) => {
    const {id} = req.params;
    const result = await db.collection('announcements').deleteOne({_id: new ObjectId(id)});

    res.status(200).send(result);

})

export default router;