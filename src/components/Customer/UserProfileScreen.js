import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { LoyaltyIcon, ReceiptIcon } from '../Shared/icons';

const UserProfileScreen = ({ userProfile, setScreen }) => {
    const handleLogout = () => signOut(auth);

    return (
        <div className="flex-grow p-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-semibold text-lg">{userProfile.displayName}</p>
                <p className="text-sm text-gray-500 mt-4">E-mail</p>
                <p className="font-semibold text-lg">{userProfile.email}</p>
                <p className="text-sm text-gray-500 mt-4">Localização</p>
                <p className="font-semibold text-lg">{userProfile.location || 'Não informado'}</p>
                <p className="text-sm text-gray-500 mt-4">Telefone</p>
                <p className="font-semibold text-lg">{userProfile.phone || 'Não informado'}</p>
            </div>
            <div className="mt-6 space-y-3">
                 <button onClick={() => setScreen('myOrders')} className="w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-200 transition flex items-center justify-center"><ReceiptIcon className="h-5 w-5 mr-3" /> Meus Pedidos</button>
                 <button onClick={() => setScreen('loyaltyPoints')} className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-amber-600 transition flex items-center justify-center"><LoyaltyIcon /> Pontos de Fidelidade</button>
                 <button onClick={() => setScreen('editUserProfile')} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition">Editar Perfil</button>
                <button onClick={handleLogout} className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-red-600 transition">Sair</button>
            </div>
        </div>
    );
};

export default UserProfileScreen;