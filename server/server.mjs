// Import required modules and components
import express from "express";
import cors from "cors";
import testing from "./routes/member.mjs";
import connection from "./routes/connections.mjs"; 

// Define the port number
const PORT = process.env.PORT || 5050;

// Create an instance of the Express application
const app = express();

// Enable CORS to allow cross-origin requests
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Use the '/members' route module for handling member-related requests
app.use("/testing", testing);
app.use("/connection", connection); // Make sure this route is used as added from Backend-Functions-Xiliang

// Start the server and listen on the port
app.listen(PORT, () => {
  console.log(`Server is running on port: http://localhost:${PORT}`);
});

// Export the Express app
export default app;
