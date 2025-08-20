import React from 'react';
import { AlertIcon } from './icons';

const AlertBox = ({ message, setMessage }) => {
    if (!message) return null;
    return (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-4 flex items-center z-50 animate-fade-in-down">
            <AlertIcon />
            <p className="text-sm text-gray-700">{message}</p>
            <button onClick={() => setMessage('')} className="ml-4 text-gray-500 hover:text-gray-800">&times;</button>
        </div>
    );
};

export default AlertBox;