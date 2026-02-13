import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, LogOut, Star, Clock, Calendar, Mail, Phone, Code,
    AlertCircle, Plus, Send, CheckCircle, Search, Filter,
    Briefcase, Award, MessageSquare, ChevronRight, X
} from 'lucide-react';

const EmployeeDashboard = ({ onLogout, tickets, addTicket }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showTicketWizard, setShowTicketWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);

    const [newTicket, setNewTicket] = useState({
        employeeId: 'EMP-2026-001',
        employeeName: 'Debdatta Panda',
        chamber: '',
        floor: '',
        section: '',
        severity: '',
        duration: '',
        description: ''
    });

    const employeeProfile = {
        name: 'Debdatta Panda',
        id: 'EMP-2026-001',
        role: 'Senior Frontend Engineer',
        responsibility: 'UI/UX Development & Design Systems',
        currentProject: 'MAINTRIX - Office Management Platform',
        email: 'debdatta.panda@company.com',
        contact: '+91 5689742589',
        rating: 4.8,
        techStack: ['React.js', 'Tailwind CSS', 'Framer Motion', 'TypeScript', 'Figma'],
        workingHours: '10:00 AM - 6:00 PM',
        leaveBalance: '14 days',
        department: 'Engineering',
        joinDate: 'Jan 2026'
    };

    const myTickets = tickets.filter(t => t.employeeId === employeeProfile.id);
    const activeTickets = myTickets.filter(t => t.status !== 'Resolved');
    const resolvedTickets = myTickets.filter(t => t.status === 'Resolved');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleTicketSubmit = () => {
        if (!newTicket.chamber || !newTicket.floor || !newTicket.section ||
            !newTicket.severity || !newTicket.duration || !newTicket.description) {
            showToast('Please fill all fields', 'error');
            return;
        }

        const ticketId = addTicket(newTicket);
        showToast(`Ticket ${ticketId} created successfully!`, 'success');
        setShowTicketWizard(false);
        setWizardStep(1);
        setNewTicket({
            employeeId: 'EMP-2024-001',
            employeeName: 'Sarah Mitchell',
            chamber: '',
            floor: '',
            section: '',
            severity: '',
            duration: '',
            description: ''
        });
        setActiveTab('tickets');
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
            />
        ));
    };

    const getStatusColor = (status) => {
        const colors = {
            'Ticket Raised': 'bg-blue-100 text-blue-700 border-blue-200',
            'Manager Approved': 'bg-purple-100 text-purple-700 border-purple-200',
            'Technician Assigned': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
            'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
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
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-3 rounded-xl">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Employee Portal</h1>
                                <p className="text-slate-600 text-sm">Welcome back, {employeeProfile.name}</p>
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
                {/* Navigation Tabs */}
                <div className="flex items-center space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
                    {['profile', 'tickets', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Profile Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                        <User className="w-12 h-12 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold mb-1">{employeeProfile.name}</h2>
                                        <p className="text-indigo-200 text-lg">{employeeProfile.role}</p>
                                        <div className="flex items-center space-x-1 mt-2">
                                            {renderStars(employeeProfile.rating)}
                                            <span className="ml-2 text-white font-semibold">{employeeProfile.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <p className="text-indigo-200 text-sm">Employee ID</p>
                                    <p className="font-bold text-lg">{employeeProfile.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Briefcase className="w-5 h-5" />
                                        <p className="text-indigo-200 text-sm">Responsibility</p>
                                    </div>
                                    <p className="font-semibold">{employeeProfile.responsibility}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Award className="w-5 h-5" />
                                        <p className="text-indigo-200 text-sm">Current Project</p>
                                    </div>
                                    <p className="font-semibold">{employeeProfile.currentProject}</p>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-slate-500">Email</p>
                                            <p className="font-medium text-slate-900">{employeeProfile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-slate-500">Contact</p>
                                            <p className="font-medium text-slate-900">{employeeProfile.contact}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Work Schedule</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-slate-500">Working Hours</p>
                                            <p className="font-medium text-slate-900">{employeeProfile.workingHours}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-slate-500">Leave Balance</p>
                                            <p className="font-medium text-slate-900">{employeeProfile.leaveBalance}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 md:col-span-2">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                    <Code className="w-5 h-5 mr-2 text-indigo-600" />
                                    Tech Stack
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {employeeProfile.techStack.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium border border-indigo-200"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tickets Tab */}
                {activeTab === 'tickets' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Action Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Active Tickets</h2>
                                <p className="text-slate-600">Track your maintenance requests</p>
                            </div>
                            <button
                                onClick={() => setShowTicketWizard(true)}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg font-semibold"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Report Issue</span>
                            </button>
                        </div>

                        {/* Active Tickets List */}
                        {activeTickets.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Tickets</h3>
                                <p className="text-slate-600 mb-6">You don't have any ongoing maintenance requests</p>
                                <button
                                    onClick={() => setShowTicketWizard(true)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                                >
                                    Report Your First Issue
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeTickets.map((ticket) => (
                                    <TicketCard key={ticket.id} ticket={ticket} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Ticket History</h2>
                                <p className="text-slate-600">View all resolved issues</p>
                            </div>
                            <div className="relative">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {resolvedTickets.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No History Yet</h3>
                                <p className="text-slate-600">Resolved tickets will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {resolvedTickets
                                    .filter(ticket =>
                                        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        ticket.section.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((ticket) => (
                                        <div key={ticket.id} className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(ticket.status)}`}>
                                                            {ticket.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600">{ticket.description}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-500">Section</p>
                                                    <p className="font-semibold text-slate-900">{ticket.section}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Location</p>
                                                    <p className="font-semibold text-slate-900">Floor {ticket.floor}, Chamber {ticket.chamber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Resolved By</p>
                                                    <p className="font-semibold text-slate-900">{ticket.technicianName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Resolved On</p>
                                                    <p className="font-semibold text-slate-900">{ticket.resolvedAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Ticket Wizard Modal */}
            <AnimatePresence>
                {showTicketWizard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                        onClick={() => setShowTicketWizard(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Wizard Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white flex items-center justify-between rounded-t-2xl">
                                <div>
                                    <h2 className="text-2xl font-bold">Report Maintenance Issue</h2>
                                    <p className="text-indigo-200">Step {wizardStep} of 3</p>
                                </div>
                                <button
                                    onClick={() => setShowTicketWizard(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 bg-slate-200">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-300"
                                    style={{ width: `${(wizardStep / 3) * 100}%` }}
                                />
                            </div>

                            <div className="p-8">
                                {/* Step 1: Location */}
                                {wizardStep === 1 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6">Location Details</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Floor Number
                                                </label>
                                                <select
                                                    value={newTicket.floor}
                                                    onChange={(e) => setNewTicket({ ...newTicket, floor: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                >
                                                    <option value="">Select Floor</option>
                                                    {[...Array(10)].map((_, i) => (
                                                        <option key={i} value={i + 1}>{i + 1}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Chamber Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newTicket.chamber}
                                                    onChange={(e) => setNewTicket({ ...newTicket, chamber: e.target.value })}
                                                    placeholder="e.g., 305"
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Problem Details */}
                                {wizardStep === 2 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6">Problem Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Problem Section
                                                </label>
                                                <select
                                                    value={newTicket.section}
                                                    onChange={(e) => setNewTicket({ ...newTicket, section: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                >
                                                    <option value="">Select Section</option>
                                                    <option value="AC">Air Conditioning</option>
                                                    <option value="Hardware">Hardware</option>
                                                    <option value="Software">Software</option>
                                                    <option value="Furniture">Furniture</option>
                                                    <option value="Electrical">Electrical</option>
                                                    <option value="Plumbing">Plumbing</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Severity Level
                                                    </label>
                                                    <select
                                                        value={newTicket.severity}
                                                        onChange={(e) => setNewTicket({ ...newTicket, severity: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                    >
                                                        <option value="">Select Severity</option>
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Critical">Critical</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        Duration Faced
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newTicket.duration}
                                                        onChange={(e) => setNewTicket({ ...newTicket, duration: e.target.value })}
                                                        placeholder="e.g., 3 days"
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Description */}
                                {wizardStep === 3 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-6">Issue Description</h3>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Brief Description
                                            </label>
                                            <textarea
                                                value={newTicket.description}
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                placeholder="Describe the issue in detail..."
                                                rows={6}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                                            />
                                        </div>

                                        {/* Summary */}
                                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                            <h4 className="font-bold text-slate-900 mb-4">Ticket Summary</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-500">Location</p>
                                                    <p className="font-semibold text-slate-900">Floor {newTicket.floor}, Chamber {newTicket.chamber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Section</p>
                                                    <p className="font-semibold text-slate-900">{newTicket.section}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Severity</p>
                                                    <p className="font-semibold text-slate-900">{newTicket.severity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Duration</p>
                                                    <p className="font-semibold text-slate-900">{newTicket.duration}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                                    {wizardStep > 1 && (
                                        <button
                                            onClick={() => setWizardStep(wizardStep - 1)}
                                            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {wizardStep < 3 ? (
                                        <button
                                            onClick={() => setWizardStep(wizardStep + 1)}
                                            className="ml-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center space-x-2"
                                        >
                                            <span>Next</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleTicketSubmit}
                                            className="ml-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg font-semibold flex items-center space-x-2"
                                        >
                                            <Send className="w-5 h-5" />
                                            <span>Submit Ticket</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Ticket Card Component with Timeline
const TicketCard = ({ ticket }) => {
    const [expanded, setExpanded] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            'Ticket Raised': 'bg-blue-100 text-blue-700 border-blue-200',
            'Manager Approved': 'bg-purple-100 text-purple-700 border-purple-200',
            'Technician Assigned': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
            'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
        return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
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
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{ticket.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(ticket.status)}`}>
                                {ticket.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getSeverityColor(ticket.severity)}`}>
                                {ticket.severity}
                            </span>
                        </div>
                        <p className="text-slate-600 mb-3">{ticket.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                            <span>Section: <span className="font-semibold text-slate-900">{ticket.section}</span></span>
                            <span>Floor {ticket.floor}, Chamber {ticket.chamber}</span>
                            <span>Duration: {ticket.duration}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-semibold"
                    >
                        {expanded ? 'Hide Details' : 'View Details'}
                    </button>
                </div>

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
                                {ticket.timeline.map((stage, index) => (
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

                            {/* Messages */}
                            {ticket.messages && ticket.messages.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                                        <MessageSquare className="w-5 h-5 mr-2" />
                                        Communication
                                    </h4>
                                    <div className="space-y-3">
                                        {ticket.messages.map((message, index) => (
                                            <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-slate-900">{message.from}</span>
                                                    <span className="text-sm text-slate-500">{message.time}</span>
                                                </div>
                                                <p className="text-slate-700">{message.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technician Info */}
                            {ticket.technicianName && (
                                <div className="mt-4 bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                    <p className="text-sm text-indigo-700">
                                        Assigned Technician: <span className="font-semibold">{ticket.technicianName}</span>
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default EmployeeDashboard;