const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');

// Get all tickets (filtered by role later if needed, returning all for now)
router.get('/', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new ticket
router.post('/', auth, async (req, res) => {
  try {
    const ticketCount = await Ticket.countDocuments();
    const newTicketId = `TKT-${String(ticketCount + 1).padStart(3, '0')}`;
    
    const newTicket = new Ticket({
      ...req.body,
      ticketId: newTicketId,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      status: 'Ticket Raised',
      timeline: [
        { stage: 'Ticket Raised', completed: true, timestamp: new Date().toLocaleString() },
        { stage: 'Manager Approved', completed: false },
        { stage: 'Technician Assigned', completed: false },
        { stage: 'In Progress', completed: false },
        { stage: 'Resolved', completed: false }
      ],
      messages: []
    });

    const ticket = await newTicket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a ticket (status, messages, timeline)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, timeline, messages, technicianId, technicianName, resolvedAt } = req.body;
    
    // Build ticket object
    const ticketFields = {};
    if (status) ticketFields.status = status;
    let ticket = await Ticket.findOne({ ticketId: req.params.id });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const updates = { $set: req.body };
    if (req.body.messages) {
       updates.$set.clearedChatFor = [];
    }

    ticket = await Ticket.findOneAndUpdate(
      { ticketId: req.params.id },
      updates,
      { new: true }
    );

    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Clear Chat for a ticket
router.put('/:id/clear-chat', auth, async (req, res) => {
  try {
    let ticket = await Ticket.findOne({ ticketId: req.params.id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (!ticket.clearedChatFor) ticket.clearedChatFor = [];
    if (!ticket.clearedChatFor.includes(req.user.employeeId)) {
      ticket.clearedChatFor.push(req.user.employeeId);
      await ticket.save();
    }
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Rate a Ticket
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, feedback, role } = req.body;
    let ticket = await Ticket.findOne({ ticketId: req.params.id });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (role === 'Employee') {
      ticket.employeeRating = rating;
      if (feedback) ticket.employeeFeedback = feedback;
    } else if (role === 'Manager') {
      ticket.managerRating = rating;
      if (feedback) ticket.managerFeedback = feedback;
    }

    await ticket.save();

    // Update technician's overall rating
    if (ticket.technicianId) {
      const User = require('../models/User');
      const tech = await User.findOne({ employeeId: ticket.technicianId });
      
      if (tech) {
        // Find all tickets for this technician that have ratings
        const allRatedTickets = await Ticket.find({
          technicianId: tech.employeeId,
          $or: [{ employeeRating: { $exists: true } }, { managerRating: { $exists: true } }]
        });
        
        let totalScore = 0;
        let totalCount = 0;
        
        allRatedTickets.forEach(t => {
          if (t.employeeRating) { totalScore += t.employeeRating; totalCount++; }
          if (t.managerRating) { totalScore += t.managerRating; totalCount++; }
        });

        tech.rating = totalCount > 0 ? (totalScore / totalCount).toFixed(1) : 0;
        tech.ratingCount = totalCount;
        
        // Count resolved tasks
        const resolvedTasks = await Ticket.countDocuments({
          technicianId: tech.employeeId,
          status: 'Resolved'
        });
        tech.completedTasks = resolvedTasks;
        
        await tech.save();
      }
    }

    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Hide a specific ticket for the current user
router.put('/:id/hide', auth, async (req, res) => {
  try {
    let ticket = await Ticket.findOne({ ticketId: req.params.id });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    if (!ticket.hiddenFor.includes(req.user.employeeId)) {
      ticket.hiddenFor.push(req.user.employeeId);
      await ticket.save();
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Hide all resolved tickets for the current user
router.post('/hide-all', auth, async (req, res) => {
  try {
    // Find all resolved tickets that aren't already hidden for this user
    // and where the user is either the employee or technician
    const tickets = await Ticket.find({
      status: 'Resolved',
      hiddenFor: { $ne: req.user.employeeId },
      $or: [
        { employeeId: req.user.employeeId },
        { technicianId: req.user.employeeId }
      ]
    });

    const updatePromises = tickets.map(async (ticket) => {
      ticket.hiddenFor.push(req.user.employeeId);
      return ticket.save();
    });

    await Promise.all(updatePromises);

    res.json({ message: 'All resolved tickets hidden successfully', hiddenCount: tickets.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
