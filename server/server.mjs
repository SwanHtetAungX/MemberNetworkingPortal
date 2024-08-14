// Import required modules and components
import express from 'express';
import cors from 'cors';
import testing from './routes/member.mjs';
import admin from './routes/admin.mjs';
import dotenv from "dotenv";
dotenv.config(); 

// Define the port number
const PORT = process.env.PORT || 3000;


// Create an instance of the Express application
const app = express();

//Enable CORS to allow cross-origin requests
app.use(cors());

//Parse incoming JSON requests
app.use(express.json());

// Use the '/members' route module for handling member-related requests
app.use("/testing", testing);
app.use("/admin", admin);
// Start the server and listen on the port
app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}'`);
    console.log(process.env.EMAIL_USER); 
});

// Export the Express app 
export default app;
