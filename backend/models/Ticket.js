const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  completed: { type: Boolean, default: false },
  timestamp: { type: String }
});

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true }
});

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true }, // e.g. TKT-001
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  chamber: { type: String, required: true },
  floor: { type: String, required: true },
  section: { type: String, required: true },
  severity: { type: String, required: true },
  duration: { type: String },
  description: { type: String, required: true },
  status: { type: String, default: 'Ticket Raised' },
  timeline: [TimelineSchema],
  technicianId: { type: String },
  technicianName: { type: String },
  messages: [MessageSchema],
  resolvedAt: { type: String },
  managerRating: { type: Number },
  managerFeedback: { type: String },
  employeeRating: { type: Number },
  employeeFeedback: { type: String },
  hiddenFor: [{ type: String }],
  clearedChatFor: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
