import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Edit3, KeyRound, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const EditProfileModal = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setIsOtpSent(false);
            setOtp('');
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSave = async (e) => {
        e.preventDefault();
        
        const phoneChanged = phone && phone !== user?.phone;
        
        if (phoneChanged && !isOtpSent) {
            setLoading(true);
            try {
                await api.post('/auth/otp/send', { phone });
                toast.success('OTP sent to your new mobile number');
                setIsOtpSent(true);
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Failed to send OTP.');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (phoneChanged && isOtpSent && !otp) {
            toast.error('Please enter the OTP sent to your new number.');
            return;
        }

        setLoading(true);
        try {
            await updateProfile({ 
                name, 
                phone: phoneChanged ? phone : undefined,
                otp: phoneChanged ? otp : undefined
            });
            toast.success('Profile updated successfully!');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up relative">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Edit3 size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isOtpSent}
                            className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow ${isOtpSent ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-white border-gray-200'}`}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <Smartphone size={18} />
                            </div>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    setIsOtpSent(false);
                                }}
                                disabled={isOtpSent}
                                className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow ${isOtpSent ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-white border-gray-200'}`}
                                placeholder="e.g. 9876543210"
                            />
                        </div>
                    </div>

                    {isOtpSent && (
                        <div className="animate-fade-in pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Verification OTP</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                    <KeyRound size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow tracking-widest text-lg font-semibold text-gray-800 text-center"
                                    placeholder="• • • • • •"
                                    required={isOtpSent}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 text-center text-balance">
                                We sent an OTP to {phone}. Check the backend console to view it.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || (!name)}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none shadow-md shadow-blue-500/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>{phone && phone !== user?.phone && !isOtpSent ? 'Verify Phone' : 'Save Changes'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EditProfileModal;
