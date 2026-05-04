import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from './components/LoginPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import StaffDashboard from './components/StaffDashboard';
import api from './api';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchTickets();
      const interval = setInterval(fetchTickets, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      // Map ticketId to id for frontend compatibility
      const fetchedTickets = res.data.map(t => ({ ...t, id: t.ticketId }));
      setTickets(fetchedTickets);
    } catch (err) {
      console.error('Error fetching tickets', err);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const addTicket = async (ticket) => {
    try {
      const res = await api.post('/tickets', ticket);
      const newTicket = { ...res.data, id: res.data.ticketId };
      setTickets([...tickets, newTicket]);
      return newTicket.id;
    } catch (err) {
      console.error('Error adding ticket', err);
    }
  };

  const updateTicketStatus = async (ticketId, updates) => {
    try {
      const res = await api.put(`/tickets/${ticketId}`, updates);
      const updatedTicket = { ...res.data, id: res.data.ticketId };
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
    } catch (err) {
      console.error('Error updating ticket', err);
    }
  };

  const rateTicket = async (ticketId, ratingData) => {
    try {
      const res = await api.post(`/tickets/${ticketId}/rate`, ratingData);
      const updatedTicket = { ...res.data, id: res.data.ticketId };
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
    } catch (err) {
      console.error('Error rating ticket', err);
    }
  };

  const hideTicket = async (ticketId) => {
    try {
      const res = await api.put(`/tickets/${ticketId}/hide`);
      const updatedTicket = { ...res.data, id: res.data.ticketId };
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
    } catch (err) {
      console.error('Error hiding ticket', err);
    }
  };

  const hideAllResolvedTickets = async () => {
    try {
      await api.post('/tickets/hide-all');
      await fetchTickets(); // Refresh tickets after hiding all
    } catch (err) {
      console.error('Error hiding all resolved tickets', err);
    }
  };

  const clearChat = async (ticketId) => {
    try {
      const res = await api.put(`/tickets/${ticketId}/clear-chat`);
      const updatedTicket = { ...res.data, id: res.data.ticketId };
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? updatedTicket : ticket
      ));
    } catch (err) {
      console.error('Error clearing chat', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <LoginPage key="login" onLogin={handleLogin} />
        ) : currentUser.role === 'Employee' ? (
          <EmployeeDashboard 
            key="employee" 
            user={currentUser}
            onLogout={handleLogout}
            tickets={tickets.filter(t => !t.hiddenFor?.includes(currentUser.employeeId))}
            addTicket={addTicket}
            rateTicket={rateTicket}
            updateTicketStatus={updateTicketStatus}
            hideTicket={hideTicket}
            hideAllResolvedTickets={hideAllResolvedTickets}
            clearChat={clearChat}
          />
        ) : currentUser.role === 'Technician' ? (
          <TechnicianDashboard 
            key="technician" 
            user={currentUser}
            onLogout={handleLogout}
            tickets={tickets.filter(t => !t.hiddenFor?.includes(currentUser.employeeId))}
            updateTicketStatus={updateTicketStatus}
            hideTicket={hideTicket}
            hideAllResolvedTickets={hideAllResolvedTickets}
            clearChat={clearChat}
          />
        ) : currentUser.role === 'Manager' ? (
          <ManagerDashboard 
            key="manager" 
            user={currentUser}
            onLogout={handleLogout}
            tickets={tickets.filter(t => !t.hiddenFor?.includes(currentUser.employeeId))}
            updateTicketStatus={updateTicketStatus}
            rateTicket={rateTicket}
            hideTicket={hideTicket}
            hideAllResolvedTickets={hideAllResolvedTickets}
            clearChat={clearChat}
          />
        ) : (
          <StaffDashboard 
            key="staff" 
            user={currentUser}
            onLogout={handleLogout}
            tickets={tickets.filter(t => !t.hiddenFor?.includes(currentUser.employeeId))}
            updateTicketStatus={updateTicketStatus}
            hideTicket={hideTicket}
            hideAllResolvedTickets={hideAllResolvedTickets}
            clearChat={clearChat}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;