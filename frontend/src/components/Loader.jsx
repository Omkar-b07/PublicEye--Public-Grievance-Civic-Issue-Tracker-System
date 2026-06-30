import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ className = "" }) => {
    return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );
};

export default Loader;
