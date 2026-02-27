import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './components/LoginPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import StaffDashboard from './components/StaffDashboard';

function App() {
  const [currentRole, setCurrentRole] = useState(null);
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-001',
      employeeId: 'EMP-2026-001',
      employeeName: 'Debdatta Panda',
      chamber: '305',
      floor: '3',
      section: 'AC',
      severity: 'High',
      duration: '3 days',
      description: 'AC not cooling properly, temperature too high for comfortable work',
      status: 'Resolved',
      timeline: [
        { stage: 'Ticket Raised', completed: true, timestamp: '2025-02-10 09:30 AM' },
        { stage: 'Manager Approved', completed: true, timestamp: '2025-02-10 10:15 AM' },
        { stage: 'Technician Assigned', completed: true, timestamp: '2025-02-10 11:00 AM' },
        { stage: 'In Progress', completed: true, timestamp: '2025-02-10 02:30 PM' },
        { stage: 'Resolved', completed: true, timestamp: '2025-02-11 04:00 PM' }
      ],
      technicianId: 'TECH-001',
      technicianName: 'Debdatta Panda',
      messages: [
        { from: 'Manager', text: 'Ticket approved. Assigned to Debdatta Panda.', time: '10:15 AM' },
        { from: 'Technician', text: 'On my way to chamber 305. ETA 30 mins.', time: '02:30 PM' },
        { from: 'Technician', text: 'Issue resolved. Refrigerant refilled and filter cleaned.', time: '04:00 PM' }
      ],
      createdAt: '2025-02-10',
      resolvedAt: '2025-02-11'
    }
  ]);

  const handleLogin = (role) => {
    setCurrentRole(role);
  };

  const handleLogout = () => {
    setCurrentRole(null);
  };

  const addTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      status: 'Ticket Raised',
      timeline: [
        { stage: 'Ticket Raised', completed: true, timestamp: new Date().toLocaleString() },
        { stage: 'Manager Approved', completed: false },
        { stage: 'Technician Assigned', completed: false },
        { stage: 'In Progress', completed: false },
        { stage: 'Resolved', completed: false }
      ],
      messages: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTickets([...tickets, newTicket]);
    return newTicket.id;
  };

  const updateTicketStatus = (ticketId, updates) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatePresence mode="wait">
        {!currentRole ? (
          <LoginPage key="login" onLogin={handleLogin} />
        ) : currentRole === 'Employee' ? (
          <EmployeeDashboard 
            key="employee" 
            onLogout={handleLogout}
            tickets={tickets}
            addTicket={addTicket}
          />
        ) : currentRole === 'Technician' ? (
          <TechnicianDashboard 
            key="technician" 
            onLogout={handleLogout}
            tickets={tickets}
            updateTicketStatus={updateTicketStatus}
          />
        ) : currentRole === 'Manager' ? (
          <ManagerDashboard 
            key="manager" 
            onLogout={handleLogout}
            tickets={tickets}
            updateTicketStatus={updateTicketStatus}
          />
        ) : (
          <StaffDashboard 
            key="staff" 
            onLogout={handleLogout}
            tickets={tickets}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;