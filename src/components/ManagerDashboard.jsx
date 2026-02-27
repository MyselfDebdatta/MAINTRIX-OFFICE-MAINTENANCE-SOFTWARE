import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, LogOut, CheckCircle, XCircle, UserCheck, TrendingUp,
  Clock, AlertTriangle, Users, Filter, Search, Send, Eye,
  BarChart3, Calendar, MessageSquare, ArrowRight
} from 'lucide-react';

const ManagerDashboard = ({ onLogout, tickets, updateTicketStatus }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [toast, setToast] = useState(null);

  const managerProfile = {
    name: 'Debdatta Panda',
    id: 'MGR-2026-001',
    level: 'Director of Operations',
    department: 'Facilities Management',
    email: 'deb.company@gmail.com',
    phone: '+91 9854712648',
    teamSize: 50,
    yearsOfService: 10
  };

  // Available technicians for assignment
  const availableTechnicians = [
    { id: 'TECH-001', name: 'DEBDATTA PANDA', type: 'IT & HVAC Specialist', available: true },
    { id: 'TECH-002', name: 'DEBDATTA PANDA', type: 'Electrical Specialist', available: true },
    { id: 'TECH-003', name: 'DEBDATTA PANDA', type: 'Hardware Specialist', available: true },
    { id: 'TECH-004', name: 'DEBDATTA PANDA', type: 'General Maintenance', available: false },
    { id: 'TECH-005', name: 'DEBDATTA PANDA', type: 'Plumbing Specialist', available: true }
  ];

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
      const matchesSearch = ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.section.toLowerCase().includes(searchQuery.toLowerCase());
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
                <p className="text-slate-600 text-sm">Welcome, {managerProfile.name}</p>
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
            <p className="text-4xl font-bold">{managerProfile.teamSize}</p>
            <p className="text-sm text-slate-100 mt-1">Technicians</p>
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
              <p className="font-semibold text-slate-900">{managerProfile.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Level</p>
              <p className="font-semibold text-slate-900">{managerProfile.level}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Department</p>
              <p className="font-semibold text-slate-900">{managerProfile.department}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Experience</p>
              <p className="font-semibold text-slate-900">{managerProfile.yearsOfService} years</p>
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
        <div className="flex items-center space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {['pending', 'approved', 'completed', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'pending' ? `Pending (${pendingTickets.length})` :
               tab === 'approved' ? `Approved (${approvedTickets.length})` :
               tab === 'completed' ? `Completed (${completedTickets.length})` :
               `Rejected (${rejectedTickets.length})`}
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
            {filteredTickets(completedTickets).map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                        Resolved
                      </span>
                    </div>
                    <p className="text-slate-600 mb-2">{ticket.description}</p>
                    <p className="text-sm text-slate-500">
                      Resolved by {ticket.technicianName} on {ticket.resolvedAt}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default ManagerDashboard;