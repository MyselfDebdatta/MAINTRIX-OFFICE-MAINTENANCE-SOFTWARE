import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Wrench, Shield, Users, ArrowRight, Building2, Mail, Phone, Briefcase, Award, Code, AlertCircle } from 'lucide-react';
import api from '../api';

const LoginPage = ({ onLogin }) => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [signUpData, setSignUpData] = useState({
        // Common fields
        fullName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        // Employee specific
        jobRole: '',
        department: '',
        techStack: '',
        // Manager specific
        managementLevel: '',
        teamSize: '',
        // Technician specific
        specialization: '',
        certifications: '',
        // Staff specific
        staffType: '',
        workLocation: ''
    });

    const roles = [
        {
            id: 'Employee',
            title: 'Employee',
            description: 'Report issues and track maintenance requests',
            icon: User,
            color: 'indigo',
            gradient: 'from-indigo-500 to-indigo-600'
        },
        {
            id: 'Manager',
            title: 'Manager',
            description: 'Review and approve maintenance tickets',
            icon: Shield,
            color: 'emerald',
            gradient: 'from-emerald-500 to-emerald-600'
        },
        {
            id: 'Technician',
            title: 'Technician',
            description: 'Receive and resolve maintenance tasks',
            icon: Wrench,
            color: 'amber',
            gradient: 'from-amber-500 to-amber-600'
        },
        {
            id: 'Staff',
            title: 'Staff',
            description: 'General staff access and monitoring',
            icon: Users,
            color: 'purple',
            gradient: 'from-purple-500 to-purple-600'
        }
    ];

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setIsSignUp(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', {
                email: credentials.username, // Using username field as email
                password: credentials.password,
                role: selectedRole
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onLogin(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Validation
        if (!signUpData.fullName || !signUpData.email || !signUpData.username || !signUpData.password) {
            setError('Please fill in all required fields');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (signUpData.password !== signUpData.confirmPassword) {
            setError('Passwords do not match');
            setTimeout(() => setError(''), 5000);
            return;
        }

        if (signUpData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setTimeout(() => setError(''), 5000);
            return;
        }

        try {
            const payload = {
                name: signUpData.fullName,
                email: signUpData.email,
                password: signUpData.password,
                role: selectedRole,
                employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
                phone: signUpData.phone,
                jobRole: signUpData.jobRole,
                department: signUpData.department,
                techStack: signUpData.techStack ? signUpData.techStack.split(',').map(s => s.trim()) : [],
                managementLevel: signUpData.managementLevel,
                teamSize: signUpData.teamSize ? parseInt(signUpData.teamSize) : 0,
                specialization: signUpData.specialization ? [signUpData.specialization] : [],
                certifications: signUpData.certifications ? signUpData.certifications.split(',').map(s => s.trim()) : [],
                staffType: signUpData.staffType,
                workLocation: signUpData.workLocation
            };

            const res = await api.post('/auth/register', payload);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onLogin(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setTimeout(() => setError(''), 5000);
        }
    };

    const resetForm = () => {
        setSelectedRole(null);
        setIsSignUp(false);
        setCredentials({ username: '', password: '' });
        setSignUpData({
            fullName: '',
            email: '',
            phone: '',
            username: '',
            password: '',
            confirmPassword: '',
            jobRole: '',
            department: '',
            techStack: '',
            managementLevel: '',
            teamSize: '',
            specialization: '',
            certifications: '',
            staffType: '',
            workLocation: ''
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
        >
            <div className="w-full max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 rounded-2xl shadow-lg">
                            <Building2 className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-slate-900 mb-3">
                        MAINTRIX
                    </h1>
                    <p className="text-slate-600 text-lg">
                        Office Maintenance & Profile Management System
                    </p>
                </motion.div>

                {/* Role Selection */}
                {!selectedRole ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {roles.map((role, index) => {
                            const Icon = role.icon;
                            return (
                                <motion.div
                                    key={role.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    onClick={() => handleRoleSelect(role.id)}
                                    className="cursor-pointer"
                                >
                                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-indigo-200">
                                        <div className={`bg-gradient-to-br ${role.gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                            {role.title}
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            {role.description}
                                        </p>
                                        <div className="mt-6 flex items-center text-indigo-600 font-semibold">
                                            <span>Continue</span>
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    /* Login/Sign Up Form */
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200">
                            <button
                                onClick={resetForm}
                                className="text-slate-600 hover:text-slate-900 m-6 flex items-center text-sm font-medium"
                            >
                                ← Back to role selection
                            </button>

                            <div className="px-8 pb-8">
                                <div className="text-center mb-8">
                                    {(() => {
                                        const role = roles.find(r => r.id === selectedRole);
                                        const Icon = role.icon;
                                        return (
                                            <>
                                                <div className={`bg-gradient-to-br ${role.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                                    <Icon className="w-10 h-10 text-white" />
                                                </div>
                                                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                                    {selectedRole} {isSignUp ? 'Registration' : 'Login'}
                                                </h2>
                                                <p className="text-slate-600">
                                                    {isSignUp ? 'Create your account to get started' : 'Enter your credentials to continue'}
                                                </p>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Toggle between Login and Sign Up */}
                                <div className="flex items-center justify-center mb-8 bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setIsSignUp(false)}
                                        className={`flex-1 px-6 py-2 rounded-md font-semibold transition-all ${!isSignUp ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                                            }`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => setIsSignUp(true)}
                                        className={`flex-1 px-6 py-2 rounded-md font-semibold transition-all ${isSignUp ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
                                            }`}
                                    >
                                        Sign Up
                                    </button>
                                </div>

                                {/* Error Message Display */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-800">{error}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Login Form */}
                                {!isSignUp ? (
                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={credentials.username}
                                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                value={credentials.password}
                                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                placeholder="Enter your password"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Sign In
                                        </button>

                                        <div className="text-center text-sm text-slate-600 mt-4">
                                            
                                        </div>
                                    </form>
                                ) : (
                                    /* Sign Up Form */
                                    <form onSubmit={handleSignUp} className="space-y-6">
                                        {/* Common Fields for All Roles */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        value={signUpData.fullName}
                                                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                        placeholder="Debdatta Panda"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        value={signUpData.email}
                                                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                        placeholder="debdatta.panda@company.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        value={signUpData.phone}
                                                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                        placeholder="+91 9587412568"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Username <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={signUpData.username}
                                                    onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                    placeholder="myselfDeb11"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Password <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={signUpData.password}
                                                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                    placeholder="Min. 6 characters"
                                                    required
                                                    minLength={6}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Confirm Password <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={signUpData.confirmPassword}
                                                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                    placeholder="Re-enter password"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Role-Specific Fields */}
                                        <div className="pt-4 border-t border-slate-200">
                                            <h3 className="text-lg font-bold text-slate-900 mb-4">
                                                {selectedRole} Specific Information
                                            </h3>

                                            {selectedRole === 'Employee' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Job Role
                                                        </label>
                                                        <div className="relative">
                                                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                value={signUpData.jobRole}
                                                                onChange={(e) => setSignUpData({ ...signUpData, jobRole: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                                placeholder="e.g., Frontend Developer"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Department
                                                        </label>
                                                        <select
                                                            value={signUpData.department}
                                                            onChange={(e) => setSignUpData({ ...signUpData, department: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                        >
                                                            <option value="">Select Department</option>
                                                            <option value="Engineering">Engineering</option>
                                                            <option value="Design">Design</option>
                                                            <option value="Marketing">Marketing</option>
                                                            <option value="Sales">Sales</option>
                                                            <option value="HR">Human Resources</option>
                                                            <option value="Finance">Finance</option>
                                                            <option value="Operations">Operations</option>
                                                        </select>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Tech Stack / Skills
                                                        </label>
                                                        <div className="relative">
                                                            <Code className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                                            <textarea
                                                                value={signUpData.techStack}
                                                                onChange={(e) => setSignUpData({ ...signUpData, techStack: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                                                                placeholder="e.g., React, TypeScript, Node.js"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRole === 'Manager' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Management Level
                                                        </label>
                                                        <select
                                                            value={signUpData.managementLevel}
                                                            onChange={(e) => setSignUpData({ ...signUpData, managementLevel: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                        >
                                                            <option value="">Select Level</option>
                                                            <option value="Team Lead">Team Lead</option>
                                                            <option value="Senior Manager">Senior Manager</option>
                                                            <option value="Director">Director</option>
                                                            <option value="VP">Vice President</option>
                                                            <option value="C-Level">C-Level Executive</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Department
                                                        </label>
                                                        <select
                                                            value={signUpData.department}
                                                            onChange={(e) => setSignUpData({ ...signUpData, department: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                        >
                                                            <option value="">Select Department</option>
                                                            <option value="Engineering">Engineering</option>
                                                            <option value="Design">Design</option>
                                                            <option value="Marketing">Marketing</option>
                                                            <option value="Sales">Sales</option>
                                                            <option value="HR">Human Resources</option>
                                                            <option value="Finance">Finance</option>
                                                            <option value="Operations">Operations</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Team Size
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={signUpData.teamSize}
                                                            onChange={(e) => setSignUpData({ ...signUpData, teamSize: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                            placeholder="Number of direct reports"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRole === 'Technician' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Specialization
                                                        </label>
                                                        <div className="relative">
                                                            <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                            <select
                                                                value={signUpData.specialization}
                                                                onChange={(e) => setSignUpData({ ...signUpData, specialization: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                            >
                                                                <option value="">Select Specialization</option>
                                                                <option value="IT & Hardware">IT & Hardware</option>
                                                                <option value="HVAC">HVAC (Air Conditioning)</option>
                                                                <option value="Electrical">Electrical</option>
                                                                <option value="Plumbing">Plumbing</option>
                                                                <option value="Carpentry">Carpentry</option>
                                                                <option value="General Maintenance">General Maintenance</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Certifications
                                                        </label>
                                                        <div className="relative">
                                                            <Award className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                                            <textarea
                                                                value={signUpData.certifications}
                                                                onChange={(e) => setSignUpData({ ...signUpData, certifications: e.target.value })}
                                                                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                                                                placeholder="e.g., CompTIA A+, HVAC Certified"
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedRole === 'Staff' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Staff Type
                                                        </label>
                                                        <select
                                                            value={signUpData.staffType}
                                                            onChange={(e) => setSignUpData({ ...signUpData, staffType: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="Administrative">Administrative</option>
                                                            <option value="Reception">Reception</option>
                                                            <option value="Security">Security</option>
                                                            <option value="Facilities">Facilities</option>
                                                            <option value="Support">Support</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                            Work Location
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={signUpData.workLocation}
                                                            onChange={(e) => setSignUpData({ ...signUpData, workLocation: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                                            placeholder="e.g., Main Office - Floor 1"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            Create Account
                                        </button>

                                        <div className="text-center text-sm text-slate-600">
                                            <p>Already have an account? Click "Login" above</p>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-12 text-slate-500 text-sm"
                >
                    <p>© 2025 MAINTRIX. All rights reserved.</p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginPage;