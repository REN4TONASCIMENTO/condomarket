import React, { useEffect } from 'react';
import { AlertIcon } from '../Shared/icons.js';

const AlertBox = ({ message, type = 'error', setMessage }) => { // Adicionado 'type' para cores dinâmicas
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    if (!message) return null;

    // Define a cor com base no tipo de alerta
    const alertStyles = {
        error: {
            bg: 'bg-red-50',
            iconColor: 'text-red-500',
            textColor: 'text-red-700'
        },
        success: {
            bg: 'bg-green-50',
            iconColor: 'text-green-500',
            textColor: 'text-green-700'
        }
    };

    const styles = alertStyles[type] || alertStyles.error;

    return (
        <div
            role="alert"
            className={`fixed top-5 left-1/2 -translate-x-1/2 ${styles.bg} shadow-lg rounded-lg p-4 flex items-center z-50 animate-fade-in-down`}
        >
            <AlertIcon className={`mr-3 ${styles.iconColor}`} />
            <p className={`text-sm font-medium ${styles.textColor}`}>{message}</p>
            <button onClick={() => setMessage('')} className="ml-4 text-gray-500 hover:text-gray-800">&times;</button>
        </div>
    );
};

export default AlertBox;
