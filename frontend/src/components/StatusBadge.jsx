import React from 'react';

const STATUS_CONFIG = {
    // New statuses
    PENDING: { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    VERIFIED: { label: 'Verified', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
    RESOLVED: { label: 'Resolved', cls: 'bg-green-100 text-green-800 border-green-200' },
    REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border-red-200' },
    // Legacy / aliases
    OPEN: { label: 'Open', cls: 'bg-gray-100 text-gray-800 border-gray-200' },
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'in progress': { label: 'In Progress', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
    resolved: { label: 'Resolved', cls: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border-red-200' },
    pending_admin: { label: 'Pending Admin', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    assigned_to_dept: { label: 'Assigned to Dept', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    late_remark: { label: 'Late Remark', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || {
        label: status || 'Unknown',
        cls: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.cls} whitespace-nowrap`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
