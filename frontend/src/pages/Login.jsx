import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Forgot Password States
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // OAuth2PasswordRequestForm requires form-encoded data with 'username' field
            const formBody = new URLSearchParams();
            formBody.append('username', formData.email);
            formBody.append('password', formData.password);

            const tokenRes = await api.post('/auth/login', formBody, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const accessToken = tokenRes.data.access_token;

            // Fetch full user details with the new token
            const meRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            login(accessToken, meRes.data);
            toast.success('Logged in successfully!');
            
            const role = meRes.data.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'department') navigate('/department');
            else if (role === 'senior_authority') navigate('/senior-authority');
            else navigate('/dashboard');
            
        } catch (error) {
            const msg = error?.response?.data?.detail || 'Invalid email or password';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault();
        if (!forgotEmail) return toast.error('Please enter your email');
        setForgotLoading(true);
        try {
            await api.post('/auth/forgot-password/request', { email: forgotEmail });
            toast.success('OTP sent! Check your console/email.');
            setForgotStep(2);
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleForgotReset = async (e) => {
        e.preventDefault();
        if (!forgotOtp || !newPassword) return toast.error('Please fill all fields');
        setForgotLoading(true);
        try {
            await api.post('/auth/forgot-password/reset', { 
                email: forgotEmail, 
                otp: forgotOtp, 
                new_password: newPassword 
            });
            toast.success('Password reset successfully!');
            setShowForgotModal(false);
            setForgotStep(1);
            setForgotEmail('');
            setForgotOtp('');
            setNewPassword('');
        } catch (error) {
            toast.error(error?.response?.data?.detail || 'Failed to reset password');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-transparent">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
                <Link to="/" className="flex flex-col text-blue-600 hover:text-blue-700 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Home size={28} />
                        <span>PublicEye</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium ml-9">Public-Grievance-Civic-Issue-Tracker-System</span>
                </Link>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card py-8 px-4 sm:px-10 animate-slide-up">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all duration-300"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm pr-10 transition-all duration-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <button 
                                    type="button" 
                                    onClick={() => setShowForgotModal(true)} 
                                    className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <LogIn size={18} />
                                        Sign in
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <p className="text-xs text-center text-gray-500">
                            Use your registered account credentials.<br />
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">Sign up here</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up relative">
                        <button 
                            type="button" 
                            onClick={() => { setShowForgotModal(false); setForgotStep(1); }} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Reset Password</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {forgotStep === 1 ? 'Enter your registered email to receive a password reset OTP.' : 'Enter the OTP sent to your email and your new password.'}
                        </p>

                        {forgotStep === 1 ? (
                            <form onSubmit={handleForgotRequest} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                                    <input 
                                        type="email" 
                                        required 
                                        value={forgotEmail} 
                                        onChange={(e) => setForgotEmail(e.target.value)} 
                                        className="appearance-none block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={forgotLoading}
                                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-70"
                                >
                                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleForgotReset} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={forgotOtp} 
                                        onChange={(e) => setForgotOtp(e.target.value)} 
                                        className="appearance-none block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center font-bold"
                                        maxLength="6"
                                        placeholder="000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input 
                                        type="password" 
                                        required 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        className="appearance-none block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={forgotLoading}
                                    className="w-full py-2.5 px-4 bg-purple-600 text-white rounded-xl font-medium shadow-md hover:bg-purple-700 transition disabled:opacity-70"
                                >
                                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setForgotStep(1)}
                                    className="w-full py-2 px-4 text-sm text-gray-500 hover:text-gray-700 mt-2"
                                >
                                    Back
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
