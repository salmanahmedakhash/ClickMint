import React, { useEffect } from 'react';
import { XCircleIcon } from './IconComponents';

interface ToastProps {
    title: string;
    body: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ title, body, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000); // Auto-close after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 w-full max-w-sm bg-surface-light p-4 rounded-xl shadow-3d z-50 animate-fadeIn"
             style={{ animationName: 'slideInRight' }}
        >
            <style>
                {`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                `}
            </style>
            <div className="flex items-start">
                <div className="flex-grow">
                    <p className="font-bold text-textPrimary">{title}</p>
                    <p className="text-sm text-textSecondary mt-1">{body}</p>
                </div>
                <button onClick={onClose} className="ml-2 p-1 -mt-1 -mr-1">
                    <XCircleIcon className="w-5 h-5 text-textSecondary hover:text-textPrimary transition-colors" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
