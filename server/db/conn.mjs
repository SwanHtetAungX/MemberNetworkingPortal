// Import the MongoClient from the 'mongodb' library
import { MongoClient } from "mongodb";

// Create a new instance of the MongoClient
const client = new MongoClient("mongodb+srv://membernetworkingportal:RjR71cfMXUC8hhtA@member-networking-porta.t4goiaj.mongodb.net/");

// Declare a variable to hold the connection
let conn;

try {
  // Log a message to know that my database is running
  console.log("Connecting to Local MongoDB");

  //connect to the MongoDB instance
  conn = await client.connect();

} catch (e) {
  // If an error occurs during the  attempt, log the error
  console.error(e);
}


let db = conn.db('sample_mflix');

// Export the MongoDB database 
export default db;
