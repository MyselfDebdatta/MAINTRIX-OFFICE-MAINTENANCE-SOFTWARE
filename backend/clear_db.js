const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Ticket = require('./models/Ticket');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('MongoDB connected...');
  await User.deleteMany({});
  console.log('Users cleared');
  await Ticket.deleteMany({});
  console.log('Tickets cleared');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
