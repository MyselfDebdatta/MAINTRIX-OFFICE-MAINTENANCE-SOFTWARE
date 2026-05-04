import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, LogOut, CheckCircle, XCircle, UserCheck, TrendingUp,
  Clock, AlertTriangle, Users, Filter, Search, Send, Eye,
  BarChart3, Calendar, MessageSquare, ArrowRight, Star, Edit, Trash2
} from 'lucide-react';

import api from '../api';
import Inbox from './Inbox';
import ConfirmModal from './ConfirmModal';

const ManagerDashboard = ({ user, onLogout, tickets, updateTicketStatus, rateTicket, clearChat, hideTicket, hideAllResolvedTickets }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [toast, setToast] = useState(null);

  const [showRateModal, setShowRateModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [ticketToRemove, setTicketToRemove] = useState(null);

  // User Management State
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({ name: '', role: '', department: '', specialization: '' });

  const [allUsers, setAllUsers] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityUser, setActivityUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setAllUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  const availableTechnicians = allUsers
    .filter(u => u.role === 'Technician')
    .map(tech => ({
      id: tech.employeeId,
      name: tech.name,
      type: tech.specialization?.[0] || 'General',
      available: true
    }));

  const teamSize = allUsers.length > 0 ? allUsers.length - 1 : 0;

  const pendingTickets = tickets.filter(t => t.status === 'Ticket Raised');
  const approvedTickets = tickets.filter(t => 
    t.status === 'Manager Approved' || 
    t.status === 'Technician Assigned' || 
    t.status === 'In Progress'
  );
  const completedTickets = tickets.filter(t => t.status === 'Resolved');
  const rejectedTickets = tickets.filter(t => t.status === 'Rejected');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
  };

  const handleReject = (ticket) => {
    setSelectedTicket(ticket);
    setShowRejectModal(true);
  };

  const confirmApproval = () => {
    if (!selectedTechnician) {
      showToast('Please select a technician', 'error');
      return;
    }

    const technician = availableTechnicians.find(t => t.id === selectedTechnician);
    const updatedTimeline = [...selectedTicket.timeline];
    updatedTimeline[1] = {
      stage: 'Manager Approved',
      completed: true,
      timestamp: new Date().toLocaleString()
    };

    updateTicketStatus(selectedTicket.id, {
      status: 'Manager Approved',
      technicianId: technician.id,
      technicianName: technician.name,
      timeline: updatedTimeline,
      messages: [...(selectedTicket.messages || []), {
        from: 'Manager',
        text: `Ticket approved and assigned to ${technician.name}.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    });

    showToast(`Ticket ${selectedTicket.id} approved and assigned to ${technician.name}!`, 'success');
    setShowAssignModal(false);
    setSelectedTechnician('');
    setSelectedTicket(null);
  };

  const confirmRejection = () => {
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    updateTicketStatus(selectedTicket.id, {
      status: 'Rejected',
      messages: [...(selectedTicket.messages || []), {
        from: 'Manager',
        text: `Ticket rejected: ${rejectReason}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    });

    showToast(`Ticket ${selectedTicket.id} rejected`, 'success');
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedTicket(null);
  };

  const handleRateSubmit = () => {
    rateTicket(selectedTicket.id, { rating, feedback, role: user.role });
    setShowRateModal(false);
    setRating(0);
    setFeedback('');
    setSelectedTicket(null);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setAllUsers(allUsers.filter(u => u._id !== userId));
      showToast('User deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting user', err);
      showToast('Failed to delete user', 'error');
    }
  };

  const openEditUser = (u) => {
    setEditingUser(u);
    setEditUserData({
      name: u.name,
      role: u.role,
      department: u.department || '',
      specialization: u.specialization ? u.specialization.join(', ') : ''
    });
    setShowEditUserModal(true);
  };

  const submitEditUser = async () => {
    try {
      const payload = {
        ...editUserData,
        specialization: editUserData.specialization ? editUserData.specialization.split(',').map(s => s.trim()) : []
      };
      const res = await api.put(`/users/${editingUser._id}`, payload);
      setAllUsers(allUsers.map(u => u._id === editingUser._id ? res.data : u));
      setShowEditUserModal(false);
      setEditingUser(null);
      showToast('User updated successfully', 'success');
    } catch (err) {
      console.error('Error updating user', err);
      showToast('Failed to update user', 'error');
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-blue-100 text-blue-700 border-blue-300',
      'Medium': 'bg-amber-100 text-amber-700 border-amber-300',
      'High': 'bg-orange-100 text-orange-700 border-orange-300',
      'Critical': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[severity] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Ticket Raised': 'bg-blue-100 text-blue-700 border-blue-200',
      'Manager Approved': 'bg-purple-100 text-purple-700 border-purple-200',
      'Technician Assigned': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
      'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredTickets = (ticketList) => {
    return ticketList.filter(ticket => {
      const matchesSearch = (ticket.id && ticket.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (ticket.section && ticket.section.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSeverity = filterSeverity === 'all' || ticket.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            } text-white font-semibold flex items-center space-x-2`}>
              <CheckCircle className="w-5 h-5" />
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manager Portal</h1>
                <p className="text-slate-600 text-sm">Welcome, {user.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 text-slate-700" />
              <span className="text-slate-700 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-100">Pending Review</h3>
              <Clock className="w-8 h-8 text-blue-200" />
            </div>
            <p className="text-4xl font-bold">{pendingTickets.length}</p>
            <p className="text-sm text-blue-100 mt-1">Awaiting approval</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-100">Approved</h3>
              <UserCheck className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-4xl font-bold">{approvedTickets.length}</p>
            <p className="text-sm text-purple-100 mt-1">In progress</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-emerald-100">Completed</h3>
              <CheckCircle className="w-8 h-8 text-emerald-200" />
            </div>
            <p className="text-4xl font-bold">{completedTickets.length}</p>
            <p className="text-sm text-emerald-100 mt-1">Resolved tickets</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-slate-100">Team Size</h3>
              <Users className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-4xl font-bold">{teamSize}</p>
            <p className="text-sm text-slate-100 mt-1">Total Members</p>
          </motion.div>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 border border-slate-200 mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Manager Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Manager ID</p>
              <p className="font-semibold text-slate-900">{user.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Level</p>
              <p className="font-semibold text-slate-900">{user.managementLevel || user.role}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Department</p>
              <p className="font-semibold text-slate-900">{user.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-semibold text-slate-900">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tickets by ID, description, or section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              >
                <option value="all">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm overflow-x-auto">
          {['pending', 'approved', 'completed', 'rejected', 'team', 'inbox'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'pending' ? `Pending (${pendingTickets.length})` :
               tab === 'approved' ? `Approved (${approvedTickets.length})` :
               tab === 'completed' ? `Completed (${completedTickets.length})` :
               tab === 'rejected' ? `Rejected (${rejectedTickets.length})` :
               tab === 'team' ? `Team (${allUsers.length})` : 'Inbox'}
            </button>
          ))}
        </div>

        {/* Pending Tickets */}
        {activeTab === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {filteredTickets(pendingTickets).length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Pending Tickets</h3>
                <p className="text-slate-600">All tickets have been reviewed</p>
              </div>
            ) : (
              filteredTickets(pendingTickets).map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(ticket.severity)}`}>
                            {ticket.severity}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-3">{ticket.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Reporter</p>
                            <p className="font-semibold text-slate-900">{ticket.employeeName}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Section</p>
                            <p className="font-semibold text-slate-900">{ticket.section}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Location</p>
                            <p className="font-semibold text-slate-900">Floor {ticket.floor}, Chamber {ticket.chamber}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Duration</p>
                            <p className="font-semibold text-slate-900">{ticket.duration}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleApprove(ticket)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md font-semibold"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Approve & Assign</span>
                      </button>
                      <button
                        onClick={() => handleReject(ticket)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold border-2 border-slate-200"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Approved Tickets */}
        {activeTab === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {filteredTickets(approvedTickets).length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Approved Tickets</h3>
                <p className="text-slate-600">Approved tickets will appear here</p>
              </div>
            ) : (
              filteredTickets(approvedTickets).map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{ticket.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Assigned To</p>
                          <p className="font-semibold text-slate-900">{ticket.technicianName || 'Unassigned'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Section</p>
                          <p className="font-semibold text-slate-900">{ticket.section}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Location</p>
                          <p className="font-semibold text-slate-900">Floor {ticket.floor}, #{ticket.chamber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Completed Tickets */}
        {activeTab === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Completed Tickets</h3>
              {filteredTickets(completedTickets).length > 0 && (
                <button
                  onClick={() => setShowClearHistoryConfirm(true)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors"
                >
                  Clear All History
                </button>
              )}
            </div>
            {filteredTickets(completedTickets).length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Completed Tickets</h3>
                <p className="text-slate-600">Completed tickets will appear here</p>
              </div>
            ) : (
              filteredTickets(completedTickets).map((ticket) => (
                <ManagerHistoryTicketCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  onRemove={() => setTicketToRemove(ticket)}
                  setSelectedTicket={setSelectedTicket}
                  setShowRateModal={setShowRateModal}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Rejected Tickets */}
        {activeTab === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {filteredTickets(rejectedTickets).length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                <XCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Rejected Tickets</h3>
                <p className="text-slate-600">Rejected tickets will appear here</p>
              </div>
            ) : (
              filteredTickets(rejectedTickets).map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-md border border-red-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          Rejected
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{ticket.description}</p>
                      {ticket.messages && ticket.messages.length > 0 && (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">
                            {ticket.messages[ticket.messages.length - 1].text}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Team View */}
        {activeTab === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {allUsers.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-slate-100 p-3 rounded-full">
                    <UserCheck className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => openEditUser(member)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(member._id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm flex-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID:</span>
                    <span className="font-medium">{member.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dept:</span>
                    <span className="font-medium">{member.department || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-medium truncate ml-2 text-right">{member.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-medium">{member.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Status:</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Active</span>
                  </div>
                </div>
                <button
                  onClick={() => { setActivityUser(member); setShowActivityModal(true); }}
                  className="mt-4 w-full py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Profile & Activity</span>
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Inbox View */}
        {activeTab === 'inbox' && (
          <Inbox user={user} tickets={tickets} updateTicketStatus={updateTicketStatus} clearChat={clearChat} />
        )}
      </div>

      {/* Assign Technician Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white rounded-t-2xl">
                <h2 className="text-2xl font-bold">Approve & Assign Ticket</h2>
                <p className="text-sm opacity-90 mt-1">{selectedTicket?.id}</p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">Ticket Details:</p>
                  <p className="font-semibold text-slate-900">{selectedTicket?.description}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedTicket?.section} - Floor {selectedTicket?.floor}, Chamber {selectedTicket?.chamber}
                  </p>
                </div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assign to Technician <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all mb-2"
                >
                  <option value="">Select a technician</option>
                  {availableTechnicians.map((tech) => (
                    <option key={tech.id} value={tech.id} disabled={!tech.available}>
                      {tech.name} - {tech.type} {!tech.available && '(Unavailable)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Choose an available technician for this task</p>

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproval}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg font-semibold"
                  >
                    <Send className="w-5 h-5" />
                    <span>Approve & Assign</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white rounded-t-2xl">
                <h2 className="text-2xl font-bold">Reject Ticket</h2>
                <p className="text-sm opacity-90 mt-1">{selectedTicket?.id}</p>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a clear reason for rejecting this ticket..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
                />

                <div className="flex items-center space-x-3 mt-6">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejection}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-semibold"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate Technician Modal */}
      <AnimatePresence>
        {showRateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowRateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white rounded-t-2xl">
                <h2 className="text-2xl font-bold">Rate Technician</h2>
                <p className="text-sm opacity-90 mt-1">{selectedTicket?.technicianName}</p>
              </div>

              <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${i < (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-slate-500 text-sm">Select a star rating</p>
                </div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Leave some feedback about the work..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none mb-4"
                />

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRateSubmit}
                    disabled={rating === 0}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg font-semibold disabled:opacity-50"
                  >
                    <Star className="w-5 h-5 fill-white" />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit User</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editUserData.name}
                    onChange={e => setEditUserData({...editUserData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={editUserData.role}
                    onChange={e => setEditUserData({...editUserData, role: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Technician">Technician</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editUserData.department}
                    onChange={e => setEditUserData({...editUserData, department: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specialization (comma separated)</label>
                  <input
                    type="text"
                    value={editUserData.specialization}
                    onChange={e => setEditUserData({...editUserData, specialization: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEditUser}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile & Activity Modal */}
      <AnimatePresence>
        {showActivityModal && activityUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowActivityModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white rounded-t-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{activityUser.name}</h2>
                  <p className="text-sm opacity-90 mt-1">{activityUser.role} - {activityUser.employeeId}</p>
                </div>
                <button onClick={() => setShowActivityModal(false)} className="text-white hover:text-blue-200">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Department</p>
                    <p className="font-semibold text-slate-900">{activityUser.department || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Specialization</p>
                    <p className="font-semibold text-slate-900">
                      {activityUser.specialization?.length > 0 ? activityUser.specialization.join(', ') : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-semibold text-slate-900">{activityUser.email}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-500 mb-1">Phone</p>
                    <p className="font-semibold text-slate-900">{activityUser.phone || 'N/A'}</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Activity Logs
                </h3>

                <div className="space-y-4">
                  {activityUser.auditTrails && activityUser.auditTrails.length > 0 ? (
                    [...activityUser.auditTrails].reverse().map((audit, idx) => (
                      <div key={idx} className="flex items-start space-x-4">
                        <div className="mt-1">
                          {audit.action === 'Login' ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <LogOut className="w-4 h-4 text-emerald-600 transform rotate-180" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <LogOut className="w-4 h-4 text-slate-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-900">{audit.action}</span>
                            <span className="text-sm text-slate-500">{new Date(audit.timestamp).toLocaleString()}</span>
                          </div>
                          {audit.action === 'Logout' && audit.sessionDuration && (
                            <p className="text-sm text-slate-600 mt-1">
                              Session Duration: {Math.round(audit.sessionDuration / 60)} minutes
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">No recent activity found for this user.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showClearHistoryConfirm}
        title="Clear All History?"
        message="Are you sure you want to hide all resolved tickets from your history?"
        type="warning"
        onConfirm={() => hideAllResolvedTickets()}
        onCancel={() => setShowClearHistoryConfirm(false)}
      />

      <ConfirmModal
        isOpen={!!ticketToRemove}
        title="Remove Ticket from History?"
        message={`Are you sure you want to hide ticket ${ticketToRemove?.id} from your history?`}
        type="warning"
        onConfirm={() => hideTicket(ticketToRemove?.id)}
        onCancel={() => setTicketToRemove(null)}
      />
    </div>
  );
};

const ManagerHistoryTicketCard = ({ ticket, onRemove, setSelectedTicket, setShowRateModal }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden mb-4">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                Completed
              </span>
            </div>
            <p className="text-slate-600 mb-3">{ticket.description}</p>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <span>Resolved by <span className="font-semibold text-slate-900">{ticket.technicianName}</span> on {ticket.resolvedAt}</span>
              <span>Section: <span className="font-semibold text-slate-900">{ticket.section}</span></span>
              <span>Floor {ticket.floor}, Chamber {ticket.chamber}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onRemove && (
              <button
                onClick={() => onRemove()}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-semibold"
            >
              {expanded ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>

        {(ticket.employeeRating || ticket.managerRating || (!ticket.managerRating)) && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col space-y-2">
            {!ticket.managerRating && setSelectedTicket && setShowRateModal && (
              <button
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowRateModal(true);
                }}
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-semibold text-sm mb-2"
              >
                <Star className="w-4 h-4" />
                <span>Rate Technician</span>
              </button>
            )}
            {ticket.employeeRating && (
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold text-slate-700 w-32">Employee Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < ticket.employeeRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
                {ticket.employeeFeedback && (
                  <p className="text-sm text-slate-600 pl-[136px] italic">"{ticket.employeeFeedback}"</p>
                )}
              </div>
            )}
            {ticket.managerRating && (
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold text-slate-700 w-32">Manager Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < ticket.managerRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
                {ticket.managerFeedback && (
                  <p className="text-sm text-slate-600 pl-[136px] italic">"{ticket.managerFeedback}"</p>
                )}
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-slate-200"
            >
              {/* Timeline */}
              <h4 className="font-bold text-slate-900 mb-4">Progress Timeline</h4>
              <div className="space-y-4 mb-6">
                {ticket.timeline && ticket.timeline.map((stage, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stage.completed ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}>
                        {stage.completed ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <div className="w-3 h-3 bg-slate-400 rounded-full" />
                        )}
                      </div>
                      {index < ticket.timeline.length - 1 && (
                        <div className={`absolute left-1/2 transform -translate-x-1/2 w-0.5 h-8 ${stage.completed ? 'bg-emerald-500' : 'bg-slate-200'
                          }`} style={{ top: '40px' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${stage.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                        {stage.stage}
                      </p>
                      {stage.timestamp && (
                        <p className="text-sm text-slate-500">{stage.timestamp}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Messages & feedback */}
              {ticket.ratingFeedback && (
                <div className="mb-4 bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-2">Feedback</h4>
                  <p className="text-amber-800">{ticket.ratingFeedback}</p>
                </div>
              )}

              {ticket.messages && ticket.messages.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Communication History
                  </h4>
                  <div className="space-y-3">
                    {ticket.messages.map((msg, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">{msg.from}</span>
                          <span className="text-slate-500 text-sm">{msg.time}</span>
                        </div>
                        <p className="text-slate-700">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManagerDashboard;