import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, MapPin as MapPinIcon, LayoutList, AlignLeft, Info, Flag } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import ImageUploader from '../components/ImageUploader';
import { createIssue } from '../api/issuesApi';

const CATEGORIES = [
    'Roads & Sidewalks',
    'Sanitation & Waste',
    'Water & Plumbing',
    'Street Lighting',
    'Parks & Recreation',
    'Public Safety',
    'Other',
];

const PRIORITIES = [
    { value: 'HIGH', label: '🔴 High', desc: 'Urgent — safety risk or major disruption' },
    { value: 'MEDIUM', label: '🟡 Medium', desc: 'Moderate impact on daily life' },
    { value: 'LOW', label: '🟢 Low', desc: 'Minor inconvenience' },
];

const ReportIssue = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: CATEGORIES[0],
        priority: 'MEDIUM',
    });

    const [image, setImage] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category) {
            toast.error('Please fill in all required text fields.');
            return;
        }
        if (!location) {
            toast.error('Please select a location on the map.');
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('priority', formData.priority);
            submitData.append('latitude', location.lat);
            submitData.append('longitude', location.lng);
            if (address) submitData.append('address', address);
            if (image) submitData.append('image', image);

            await createIssue(submitData);
            toast.success('Issue reported successfully! It will be reviewed by admin.');
            navigate('/dashboard');
        } catch (error) {
            const msg = error?.response?.data?.detail || 'Failed to report issue. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
                <p className="text-gray-500 text-sm mt-1">Help us improve the community by reporting civic issues.</p>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
                <div className="md:flex">
                    {/* Form Section */}
                    <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <AlignLeft size={16} className="text-gray-400" />
                                    Issue Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" name="title" value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Deep pothole on Main St."
                                    className="w-full px-4 py-3 bg-white/60 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 placeholder-gray-400 shadow-sm"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <LayoutList size={16} className="text-gray-400" />
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category" value={formData.category} onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-white/60 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 shadow-sm text-gray-700"
                                    required
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Flag size={16} className="text-gray-400" />
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PRIORITIES.map(p => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                                            className={`p-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 text-center ${
                                                formData.priority === p.value
                                                    ? p.value === 'HIGH' ? 'border-red-500 bg-red-50 text-red-700'
                                                        : p.value === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                                        : 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 bg-white/60 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <div>{p.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Info size={16} className="text-gray-400" />
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description" value={formData.description} onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Provide more details about the issue..."
                                    className="w-full px-4 py-3 bg-white/60 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 resize-none placeholder-gray-400 shadow-sm"
                                    required
                                />
                            </div>

                            {/* Address (auto-filled from map click) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <MapPinIcon size={16} className="text-gray-400" />
                                    Address <span className="text-xs text-gray-400 font-normal">(auto-filled from map)</span>
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows="2"
                                    placeholder="Click on the map and press 'Upload Address', or type manually..."
                                    className="w-full px-4 py-3 bg-white/60 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-300 resize-none placeholder-gray-400 shadow-sm"
                                />
                            </div>

                            <ImageUploader onImageChange={setImage} selectedImage={image} />

                            {/* Desktop Submit */}
                            <div className="pt-4 mt-6 border-t border-gray-100 hidden md:block">
                                <button
                                    type="submit" disabled={loading}
                                    className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting to server...
                                        </span>
                                    ) : (
                                        <><Send size={18} />Submit Report</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Map Section */}
                    <div className="p-6 md:w-1/2 bg-gray-50/50 flex flex-col relative">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <MapPinIcon size={16} className={location ? 'text-blue-500' : 'text-gray-400'} />
                                Location <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                {location
                                    ? `✅ Selected: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                                    : 'Click anywhere on the map to pin the exact location.'}
                            </p>
                        </div>

                        <div className="flex-grow flex flex-col min-h-[300px] md:min-h-0">
                            <MapComponent
                                onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                                selectedPosition={location}
                                onAddressConfirm={(addr) => setAddress(addr)}
                                height="100%"
                            />
                        </div>

                        {/* Mobile Submit */}
                        <div className="mt-6 md:hidden">
                            <button
                                onClick={handleSubmit} disabled={loading}
                                className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
