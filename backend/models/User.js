const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Employee', 'Technician', 'Manager', 'Staff'] },
  employeeId: { type: String, required: true, unique: true },
  phone: { type: String },
  jobRole: { type: String },
  department: { type: String },
  techStack: [{ type: String }],
  managementLevel: { type: String },
  teamSize: { type: Number },
  specialization: [{ type: String }],
  certifications: [{ type: String }],
  staffType: { type: String },
  workLocation: { type: String },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  auditTrails: [{ 
    action: { type: String, required: true }, 
    timestamp: { type: Date, default: Date.now } 
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
