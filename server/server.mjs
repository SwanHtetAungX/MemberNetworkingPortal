import express from "express";
import cors from "cors";
import members from "./routes/member.mjs";
import connection from "./routes/connections.mjs";
import admin from "./routes/admin.mjs";
import posts from "./routes/activityFeed.mjs";
import dotenv from "dotenv";
dotenv.config();

// Define the port number
const PORT = process.env.PORT || 5050;

// Create an instance of the Express application
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Use the '/members' route module for handling member-related requests

app.use("/members", members);
app.use("/connection", connection);
app.use("/admin", admin);
app.use("/posts", posts);
// Start the server and listen on the port
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});

// Export the Express app
export default app;
