import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, LogOut, TrendingUp, Clock, CheckCircle, AlertTriangle,
  Calendar, BarChart3, PieChart, Activity, Download, Filter,
  FileText, UserCheck, Wrench, Eye, Search, MessageSquare
} from 'lucide-react';
import Inbox from './Inbox';

const StaffDashboard = ({ user, onLogout, tickets, updateTicketStatus }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('week');


  // Analytics Data
  const totalTickets = tickets?.length || 2;
  const pendingTickets = tickets?.filter(t => t.status === 'Ticket Raised').length || 0;
  const inProgressTickets = tickets?.filter(t => 
    t.status === 'Technician Assigned' || t.status === 'In Progress'
  ).length || 0;
  const resolvedTickets = tickets?.filter(t => t.status === 'Resolved').length || 1;
  const avgResolutionTime = '24 hours';

  // Department distribution
  const departmentStats = [
    { name: 'Engineering', tickets: 15, color: 'bg-blue-500' },
    { name: 'Design', tickets: 8, color: 'bg-purple-500' },
    { name: 'Marketing', tickets: 5, color: 'bg-pink-500' },
    { name: 'Operations', tickets: 12, color: 'bg-emerald-500' },
    { name: 'HR', tickets: 3, color: 'bg-amber-500' }
  ];

  // Issue types distribution
  const issueTypes = [
    { type: 'AC/HVAC', count: 12, percentage: 28, color: 'bg-blue-500' },
    { type: 'Hardware', count: 10, percentage: 23, color: 'bg-purple-500' },
    { type: 'Software', count: 8, percentage: 19, color: 'bg-indigo-500' },
    { type: 'Electrical', count: 7, percentage: 16, color: 'bg-amber-500' },
    { type: 'Furniture', count: 6, percentage: 14, color: 'bg-emerald-500' }
  ];

  // Recent activity
  const recentActivity = [
    {
      id: 1,
      action: 'Ticket Resolved',
      ticket: 'TKT-001',
      employee: 'Debdatta Panda',
      technician: 'Soumyashri Mahapatra',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-emerald-600'
    },
    {
      id: 2,
      action: 'New Ticket Created',
      ticket: 'TKT-045',
      employee: 'Debdatta Panda',
      time: '3 hours ago',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: 3,
      action: 'Ticket Assigned',
      ticket: 'TKT-042',
      technician: 'Debdatta Panda',
      time: '5 hours ago',
      icon: UserCheck,
      color: 'text-purple-600'
    },
    {
      id: 4,
      action: 'Ticket In Progress',
      ticket: 'TKT-038',
      technician: 'Debdatta Panda',
      time: '6 hours ago',
      icon: Wrench,
      color: 'text-amber-600'
    }
  ];

  // Performance metrics
  const performanceMetrics = [
    { label: 'Avg Response Time', value: '15 mins', trend: '+5%', up: false },
    { label: 'Avg Resolution Time', value: avgResolutionTime, trend: '-12%', up: true },
    { label: 'Customer Satisfaction', value: '4.6/5.0', trend: '+8%', up: true },
    { label: 'First-Time Fix Rate', value: '78%', trend: '+3%', up: true }
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-blue-100 text-blue-700',
      'Medium': 'bg-amber-100 text-amber-700',
      'High': 'bg-orange-100 text-orange-700',
      'Critical': 'bg-red-100 text-red-700'
    };
    return colors[severity] || 'bg-slate-100 text-slate-700';
  };

  const exportReport = () => {
    alert('Report export functionality - Would generate PDF/Excel report in production');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Staff Portal</h1>
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
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 border border-slate-200 mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Staff Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Staff ID</p>
              <p className="font-semibold text-slate-900">{user.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Role</p>
              <p className="font-semibold text-slate-900">{user.role}</p>
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

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {['overview', 'analytics', 'activity', 'reports', 'inbox'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-100">Total Tickets</h3>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
                <p className="text-4xl font-bold">{totalTickets}</p>
                <p className="text-sm text-blue-100 mt-1">All time</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-amber-100">Pending</h3>
                  <Clock className="w-8 h-8 text-amber-200" />
                </div>
                <p className="text-4xl font-bold">{pendingTickets}</p>
                <p className="text-sm text-amber-100 mt-1">Awaiting action</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-purple-100">In Progress</h3>
                  <Activity className="w-8 h-8 text-purple-200" />
                </div>
                <p className="text-4xl font-bold">{inProgressTickets}</p>
                <p className="text-sm text-purple-100 mt-1">Being resolved</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-emerald-100">Resolved</h3>
                  <CheckCircle className="w-8 h-8 text-emerald-200" />
                </div>
                <p className="text-4xl font-bold">{resolvedTickets}</p>
                <p className="text-sm text-emerald-100 mt-1">Completed</p>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <p className="text-sm text-slate-500 mb-2">{metric.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mb-2">{metric.value}</p>
                    <div className={`flex items-center justify-center space-x-1 text-sm font-semibold ${
                      metric.up ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${metric.up ? '' : 'transform rotate-180'}`} />
                      <span>{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={exportReport}
                className="flex items-center justify-center space-x-3 bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <Download className="w-6 h-6 text-purple-600" />
                <span className="font-semibold text-slate-900">Export Report</span>
              </button>

              <button className="flex items-center justify-center space-x-3 bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <Calendar className="w-6 h-6 text-blue-600" />
                <span className="font-semibold text-slate-900">Schedule Review</span>
              </button>

              <button className="flex items-center justify-center space-x-3 bg-white rounded-xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <Eye className="w-6 h-6 text-emerald-600" />
                <span className="font-semibold text-slate-900">View All Tickets</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Date Range Filter */}
            <div className="bg-white rounded-xl shadow-md p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Analytics Dashboard</h3>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* Issue Types Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Issue Types Distribution</h3>
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-4">
                {issueTypes.map((issue, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${issue.color}`} />
                        <span className="font-semibold text-slate-900">{issue.type}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-600">{issue.count} tickets</span>
                        <span className="font-bold text-slate-900">{issue.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`${issue.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Stats */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Tickets by Department</h3>
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-32 font-semibold text-slate-900">{dept.name}</div>
                    <div className="flex-1">
                      <div className="w-full bg-slate-200 rounded-full h-8 relative">
                        <div
                          className={`${dept.color} h-8 rounded-full flex items-center justify-end pr-3 text-white font-bold text-sm transition-all duration-500`}
                          style={{ width: `${(dept.tickets / 43) * 100}%` }}
                        >
                          {dept.tickets}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className={`p-3 rounded-lg bg-white border-2 ${activity.color.replace('text-', 'border-')}`}>
                        <Icon className={`w-6 h-6 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900">{activity.action}</h4>
                          <span className="text-sm text-slate-500">{activity.time}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          Ticket: <span className="font-semibold">{activity.ticket}</span>
                          {activity.employee && ` • Employee: ${activity.employee}`}
                          {activity.technician && ` • Technician: ${activity.technician}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Generate Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Report Type
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all">
                    <option>Daily Summary</option>
                    <option>Weekly Summary</option>
                    <option>Monthly Summary</option>
                    <option>Department Analysis</option>
                    <option>Technician Performance</option>
                    <option>Issue Type Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Format
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all">
                    <option>PDF</option>
                    <option>Excel (XLSX)</option>
                    <option>CSV</option>
                  </select>
                </div>
              </div>

              <button
                onClick={exportReport}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg font-semibold"
              >
                <Download className="w-5 h-5" />
                <span>Generate & Download Report</span>
              </button>
            </div>

            {/* Available Reports */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Available Reports</h3>
              <div className="space-y-3">
                {[
                  { name: 'Weekly Summary - Feb 20-27', date: 'Generated today', size: '245 KB' },
                  { name: 'Department Analysis - February', date: 'Generated 2 days ago', size: '1.2 MB' },
                  { name: 'Technician Performance - Q1', date: 'Generated 5 days ago', size: '890 KB' },
                  { name: 'Monthly Summary - January', date: 'Generated 1 month ago', size: '567 KB' }
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-purple-600" />
                      <div>
                        <h4 className="font-semibold text-slate-900">{report.name}</h4>
                        <p className="text-sm text-slate-500">{report.date} • {report.size}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Inbox View */}
        {activeTab === 'inbox' && (
          <Inbox user={user} tickets={tickets} updateTicketStatus={updateTicketStatus} />
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;