import React from 'react';
import { Users, LogOut } from 'lucide-react';

const StaffDashboard = ({ onLogout }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Staff Portal</h1>
                                <p className="text-slate-600 text-sm">General staff access and monitoring</p>
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
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200">
                    <Users className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Staff Dashboard</h2>
                    <p className="text-slate-600">Staff functionality coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;