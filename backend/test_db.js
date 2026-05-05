const mongoose = require('mongoose');
require('dotenv').config();

// Use environment variable for URI
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/maintrix";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:");
    console.error(err);
    process.exit(1);
  });
