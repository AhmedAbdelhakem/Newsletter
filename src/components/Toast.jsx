import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

function Toast({ message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, 1000); // 1 second duration
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-2000 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full shadow-lg border border-gray-800">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-black">
                    <Check size={10} strokeWidth={4} />
                </div>
                <span>{message}</span>
            </div>
        </div>
    );
}

export default Toast;
