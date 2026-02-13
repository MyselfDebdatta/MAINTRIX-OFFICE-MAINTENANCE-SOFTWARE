import React from 'react';
import { Shield, LogOut } from 'lucide-react';

const ManagerDashboard = ({ onLogout }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-xl">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Manager Portal</h1>
                                <p className="text-slate-600 text-sm">Review and approve maintenance tickets</p>
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
                    <Shield className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Manager Dashboard</h2>
                    <p className="text-slate-600">Manager functionality coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;