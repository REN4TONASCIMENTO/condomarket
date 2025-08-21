import React, { useState } from 'react';

const RoleSelectionScreen = ({ user, onRoleSelected }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleSelection = async (role) => {
        setError('');
        try {
            setLoading(true);
            // Se futuramente for salvar no Firestore, coloque a função aqui
            await onRoleSelected(role);
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao selecionar o papel. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 flex-grow animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete o seu perfil</h1>
            <p className="text-gray-600 text-center mb-8">
                Para continuar, diga-nos se você é um cliente ou um vendedor.
            </p>
            <div className="w-full space-y-4">
                <button
                    onClick={() => handleRoleSelection('customer')}
                    disabled={loading}
                    className="w-full py-3 px-6 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition disabled:opacity-50"
                >
                    Sou um Cliente
                </button>
                <button
                    onClick={() => handleRoleSelection('vendor')}
                    disabled={loading}
                    className="w-full py-3 px-6 bg-teal-100 text-teal-700 font-semibold rounded-lg hover:bg-teal-200 transition disabled:opacity-50"
                >
                    Sou um Vendedor
                </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </div>
    );
};

export default RoleSelectionScreen;
