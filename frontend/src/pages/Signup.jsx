import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/otp/send', { phone: formData.phone });
            setStep(2);
            toast.success(`OTP sent to ${formData.phone}! (Check console)`);
        } catch (error) {
            const msg = error?.response?.data?.detail || 'Failed to send OTP. Mobile number may already be registered.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (!otp) {
            toast.error('Please enter the OTP');
            return;
        }

        setLoading(true);
        try {
            // Verify OTP
            await api.post('/auth/otp/verify', { phone: formData.phone, otp: otp });

            // Register the new account
            await api.post('/auth/signup', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: 'citizen',
            });

            // Auto-login after successful registration
            const formBody = new URLSearchParams();
            formBody.append('username', formData.email);
            formBody.append('password', formData.password);
            const tokenRes = await api.post('/auth/login', formBody, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            const accessToken = tokenRes.data.access_token;
            const meRes = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            login(accessToken, meRes.data);

            toast.success('Account created! Welcome to PublicEye 🎉');
            navigate('/dashboard');
        } catch (error) {
            const msg = error?.response?.data?.detail || 'Error verifying OTP or creating account.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-transparent">
            {/* Background Orbs */}
            <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute top-[40%] right-[5%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute bottom-[0%] left-[30%] w-96 h-96 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
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
                    Create a new account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card py-8 px-4 sm:px-10 animate-slide-up">
                    {step === 1 ? (
                        <form className="space-y-5" onSubmit={handleRequestOTP}>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all duration-300"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

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
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Mobile Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm transition-all duration-300"
                                        placeholder="+1 234 567 8900"
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
                                        autoComplete="new-password"
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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm pr-10 transition-all duration-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
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
                                            Sending OTP...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <UserPlus size={18} />
                                            Send OTP to Mobile
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6 animate-fade-in" onSubmit={handleVerifyAndRegister}>
                            <div className="text-center mb-6">
                                <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">OTP Sent!</h3>
                                <p className="text-sm text-gray-600 mt-1">Please enter the 6-digit code sent to<br/><strong className="text-gray-900">{formData.phone}</strong></p>
                            </div>

                            <div>
                                <label htmlFor="otp" className="sr-only">One-Time Password</label>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="appearance-none block w-full px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] bg-white/50 border border-white/40 rounded-xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300"
                                    placeholder="••••••"
                                />
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${(loading || otp.length < 6) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Verifying & Creating Account...' : 'Verify OTP & Register'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    className="w-full flex justify-center py-2.5 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Back to edit details
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
