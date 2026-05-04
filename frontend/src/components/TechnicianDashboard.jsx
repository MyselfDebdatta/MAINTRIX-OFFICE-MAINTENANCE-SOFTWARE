import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench, LogOut, Mail, Phone, CheckCircle, XCircle,
    Clock, MapPin, AlertTriangle, Send, MessageSquare,
    TrendingUp, Award, Calendar, Filter, Star
} from 'lucide-react';
import Inbox from './Inbox';
import ConfirmModal from './ConfirmModal';
import api from '../api';

const TechnicianDashboard = ({ user, onLogout, tickets, updateTicketStatus, hideTicket, hideAllResolvedTickets, clearChat }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [modalAction, setModalAction] = useState('');
    const [message, setMessage] = useState('');
    const [toast, setToast] = useState(null);
    const [techStats, setTechStats] = useState({ rating: user.rating, completedTasks: user.completedTasks });

    const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
    const [ticketToRemove, setTicketToRemove] = useState(null);

    useEffect(() => {
        const fetchTechStats = async () => {
            try {
                const res = await api.get(`/users/${user.employeeId}`);
                setTechStats({ rating: res.data.rating, completedTasks: res.data.completedTasks });
            } catch (err) {
                console.error("Failed to fetch tech stats", err);
            }
        };
        fetchTechStats();
    }, [user.employeeId, tickets]);

    // Filter tickets assigned to this technician
    const myTickets = tickets.filter(t =>
        t.technicianId === user.employeeId ||
        (t.status === 'Manager Approved' && !t.technicianId) // Keep manager approved visible here? Wait, usually we assign a specific technician in ManagerDashboard.
    );

    const pendingTickets = myTickets.filter(t =>
        t.status === 'Manager Approved' || t.status === 'Technician Assigned'
    );

    const inProgressTickets = myTickets.filter(t => t.status === 'Accepted' || t.status === 'In Progress');
    const completedTickets = myTickets.filter(t => t.status === 'Resolved');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAccept = (ticket) => {
        setSelectedTicket(ticket);
        setModalAction('accept');
        setShowMessageModal(true);
    };

    const handleReject = (ticket) => {
        setSelectedTicket(ticket);
        setModalAction('reject');
        setShowMessageModal(true);
    };

    const handleModalSubmit = () => {
        if (!message.trim()) {
            showToast('Please enter a message', 'error');
            return;
        }

        const updatedTimeline = [...selectedTicket.timeline];
        const addressedMessage = modalAction === 'resolve' 
            ? `@Manager @Employee - Task Completed: ${message}` 
            : modalAction === 'accept'
            ? `@Manager @Employee - Task Accepted: ${message}`
            : message;

        const newMessage = {
            from: 'Technician',
            text: addressedMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (modalAction === 'accept') {
            updatedTimeline[2] = {
                stage: 'Technician Assigned',
                completed: true,
                timestamp: new Date().toLocaleString()
            };
            updatedTimeline[3] = {
                stage: 'In Progress',
                completed: true,
                timestamp: new Date().toLocaleString()
            };

            updateTicketStatus(selectedTicket.id, {
                status: 'In Progress',
                technicianId: user.employeeId,
                technicianName: user.name,
                timeline: updatedTimeline,
                messages: [...(selectedTicket.messages || []), newMessage]
            });

            showToast('Ticket accepted successfully!', 'success');
        } else if (modalAction === 'resolve') {
            updatedTimeline[4] = {
                stage: 'Resolved',
                completed: true,
                timestamp: new Date().toLocaleString()
            };

            updateTicketStatus(selectedTicket.id, {
                status: 'Resolved',
                timeline: updatedTimeline,
                messages: [...(selectedTicket.messages || []), newMessage],
                resolvedAt: new Date().toISOString().split('T')[0]
            });

            showToast('Ticket marked as Completed!', 'success');
        } else {
            updateTicketStatus(selectedTicket.id, {
                messages: [...(selectedTicket.messages || []), {
                    ...newMessage,
                    text: `Ticket rejected: ${message}`
                }]
            });

            showToast('Ticket rejected', 'success');
        }

        setShowMessageModal(false);
        setMessage('');
        setSelectedTicket(null);
    };

    const updateWorkStatus = (ticket, newStatus) => {
        if (newStatus === 'Resolved') {
            setSelectedTicket(ticket);
            setModalAction('resolve');
            setShowMessageModal(true);
            return;
        }

        const updatedTimeline = [...ticket.timeline];
        const statusIndex = newStatus === 'In Progress' ? 3 : 4;

        updatedTimeline[statusIndex] = {
            stage: newStatus,
            completed: true,
            timestamp: new Date().toLocaleString()
        };

        const statusMessages = {
            'In Progress': 'Started working on the issue'
        };

        updateTicketStatus(ticket.id, {
            status: newStatus,
            timeline: updatedTimeline,
            messages: [...(ticket.messages || []), {
                from: 'Technician',
                text: statusMessages[newStatus],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]
        });

        showToast(`Ticket marked as ${newStatus}!`, 'success');
    };

    const getSeverityIcon = (severity) => {
        const icons = {
            'Low': <Clock className="w-5 h-5" />,
            'Medium': <AlertTriangle className="w-5 h-5" />,
            'High': <AlertTriangle className="w-5 h-5" />,
            'Critical': <AlertTriangle className="w-5 h-5" />
        };
        return icons[severity];
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
                        <div className={`px-6 py-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
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
                            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl">
                                <Wrench className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Technician Portal</h1>
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
                            <h3 className="text-blue-100">Pending Tasks</h3>
                            <Clock className="w-8 h-8 text-blue-200" />
                        </div>
                        <p className="text-4xl font-bold">{pendingTickets.length}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-amber-100">In Progress</h3>
                            <TrendingUp className="w-8 h-8 text-amber-200" />
                        </div>
                        <p className="text-4xl font-bold">{inProgressTickets.length}</p>
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
                        <p className="text-4xl font-bold">{techStats.completedTasks || 0}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-purple-100">Rating</h3>
                            <Award className="w-8 h-8 text-purple-200" />
                        </div>
                        <p className="text-4xl font-bold">{techStats.rating || 0}</p>
                    </motion.div>
                </div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md p-6 border border-slate-200 mb-8"
                >
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-amber-100 p-3 rounded-lg">
                                <Wrench className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Technician ID</p>
                                <p className="font-semibold text-slate-900">{user.employeeId}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                                <Award className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Role</p>
                                <p className="font-semibold text-slate-900">{user.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-emerald-100 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Avg Response</p>
                                <p className="font-semibold text-slate-900">15 mins</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex flex-wrap gap-2">
                            {user.specialization && user.specialization.length > 0 ? user.specialization.map((spec, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200"
                                >
                                    {spec}
                                </span>
                            )) : <span className="text-slate-500 text-sm">No specializations listed</span>}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex items-center space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
                    {['pending', 'active', 'history', 'inbox'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === tab
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {tab === 'pending' ? `Pending Tasks (${pendingTickets.length})` :
                                tab === 'active' ? `Active Tasks (${inProgressTickets.length})` :
                                tab === 'history' ? 'History' : 'Inbox'}
                        </button>
                    ))}
                </div>

                {/* Pending Tasks */}
                {activeTab === 'pending' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {pendingTickets.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                                <p className="text-slate-600">No pending tasks at the moment</p>
                            </div>
                        ) : (
                            pendingTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1 ${getSeverityColor(ticket.severity)}`}>
                                                        {getSeverityIcon(ticket.severity)}
                                                        <span>{ticket.severity}</span>
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 mb-3">{ticket.description}</p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="w-4 h-4 text-slate-400" />
                                                        <div>
                                                            <p className="text-slate-500">Location</p>
                                                            <p className="font-semibold text-slate-900">Floor {ticket.floor}, #{ticket.chamber}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Section</p>
                                                        <p className="font-semibold text-slate-900">{ticket.section}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Reporter</p>
                                                        <p className="font-semibold text-slate-900">{ticket.employeeName}</p>
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
                                                onClick={() => handleAccept(ticket)}
                                                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md font-semibold"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Accept Task</span>
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

                {/* Active Tasks */}
                {activeTab === 'active' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {inProgressTickets.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                                <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Tasks</h3>
                                <p className="text-slate-600">Accept tasks from your inbox to get started</p>
                            </div>
                        ) : (
                            inProgressTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden"
                                >
                                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <TrendingUp className="w-5 h-5" />
                                                <span className="font-bold">{ticket.id}</span>
                                            </div>
                                            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">In Progress</span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <p className="text-slate-700 mb-4">{ticket.description}</p>

                                        <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                                            <div>
                                                <p className="text-slate-500">Location</p>
                                                <p className="font-semibold text-slate-900">Floor {ticket.floor}, #{ticket.chamber}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Section</p>
                                                <p className="font-semibold text-slate-900">{ticket.section}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Severity</p>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(ticket.severity)}`}>
                                                    {ticket.severity}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
                                            <h4 className="font-semibold text-slate-900 mb-3">Update Status</h4>
                                            <div className="flex items-center space-x-3">
                                                {ticket.status !== 'In Progress' && (
                                                    <button
                                                        onClick={() => updateWorkStatus(ticket, 'In Progress')}
                                                        className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Working
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateWorkStatus(ticket, 'Resolved')}
                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-semibold"
                                                >
                                                    Mark Completed
                                                </button>
                                            </div>
                                        </div>

                                        {/* Communication */}
                                        {ticket.messages && ticket.messages.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                                    <MessageSquare className="w-5 h-5 mr-2 text-slate-600" />
                                                    Messages
                                                </h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {ticket.messages.slice(-3).map((msg, index) => (
                                                        <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-semibold text-slate-900">{msg.from}</span>
                                                                <span className="text-slate-500 text-xs">{msg.time}</span>
                                                            </div>
                                                            <p className="text-slate-700">{msg.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {/* History */}
                {activeTab === 'history' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-900">Completed Tasks</h3>
                                {completedTickets.length > 0 && (
                                    <button
                                        onClick={() => setShowClearHistoryConfirm(true)}
                                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors"
                                    >
                                        Clear All History
                                    </button>
                                )}
                            </div>
                            {completedTickets.length === 0 ? (
                                <div className="text-center py-8">
                                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600">No completed tasks yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {completedTickets.map((ticket) => (
                                        <TechHistoryTicketCard key={ticket.id} ticket={ticket} onRemove={() => setTicketToRemove(ticket)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Inbox View */}
                {activeTab === 'inbox' && (
                    <Inbox user={user} tickets={myTickets} updateTicketStatus={updateTicketStatus} clearChat={clearChat} />
                )}
            </div>

            {/* Message Modal */}
            <AnimatePresence>
                {showMessageModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowMessageModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                        >
                            <div className={`p-6 rounded-t-2xl ${modalAction === 'accept'
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700'
                                : 'bg-gradient-to-r from-red-600 to-red-700'
                                } text-white`}>
                                <h2 className="text-2xl font-bold">
                                    {modalAction === 'accept' ? 'Accept Task' : modalAction === 'resolve' ? 'Complete Task' : 'Reject Task'}
                                </h2>
                                <p className="text-sm opacity-90 mt-1">
                                    {selectedTicket?.id}
                                </p>
                            </div>

                            <div className="p-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Message to Employee
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={
                                        modalAction === 'accept'
                                            ? 'e.g., On my way to your location. ETA 30 minutes.'
                                            : modalAction === 'resolve'
                                            ? 'Detail the work completed and verify the fix...'
                                            : 'Please provide a reason for rejection...'
                                    }
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
                                />

                                <div className="flex items-center space-x-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowMessageModal(false);
                                            setMessage('');
                                        }}
                                        className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleModalSubmit}
                                        className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-all shadow-lg font-semibold ${
                                            (modalAction === 'accept' || modalAction === 'resolve')
                                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                                            }`}
                                    >
                                        <Send className="w-5 h-5" />
                                        <span>Send & {modalAction === 'accept' ? 'Accept' : modalAction === 'resolve' ? 'Resolve' : 'Reject'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modals */}
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

const TechHistoryTicketCard = ({ ticket, onRemove }) => {
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
                            <span>Section: <span className="font-semibold text-slate-900">{ticket.section}</span></span>
                            <span>Floor {ticket.floor}, Chamber {ticket.chamber}</span>
                            <span>Duration: {ticket.duration}</span>
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
                            className="px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-semibold"
                        >
                            {expanded ? 'Hide Details' : 'View Details'}
                        </button>
                    </div>
                </div>

                {(ticket.employeeRating || ticket.managerRating) && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col space-y-4">
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
                                        {ticket.messages.map((message, index) => (
                                            <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-slate-900">{message.from}</span>
                                                    <span className="text-sm text-slate-500">{message.time} {message.edited ? '(edited)' : ''}</span>
                                                </div>
                                                <p className="text-slate-700">{message.text}</p>
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

export default TechnicianDashboard;