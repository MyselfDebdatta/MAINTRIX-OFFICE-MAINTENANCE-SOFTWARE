const mongoose = require('mongoose');

const uri = "mongodb+srv://Debdatta:MyselfDeb11@cluster0.9nhecdn.mongodb.net/maintrix?appName=Cluster0";

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
