import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase.js';
import { ReceiptIcon, PencilIcon } from '../Shared/icons.js';

const VendorProfileScreen = ({ vendorProfile, setScreen }) => {
    if (!vendorProfile) return <p className="p-6 text-center">Carregando perfil...</p>;

    const handleLogout = () => {
        signOut(auth).catch(err => console.error('Erro ao sair:', err));
    };

    return (
        <div className="flex-grow p-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Perfil da Loja</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 mb-6">
                <div>
                    <p className="text-sm text-gray-500">Nome da Loja</p>
                    <p className="font-semibold text-lg">{vendorProfile.name || 'Não informado'}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500">Categoria</p>
                    <p className="font-semibold text-lg">{vendorProfile.category || 'Não informada'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-semibold text-lg">{vendorProfile.location || 'Não informada'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-semibold text-lg">{vendorProfile.phone || 'Não informado'}</p>
                </div>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={() => setScreen('vendorDashboard')} 
                    className="w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-200 transition flex items-center justify-center"
                >
                    <ReceiptIcon className="h-5 w-5 mr-3" /> Painel de Vendas
                </button>

                <button 
                    onClick={() => setScreen('editVendorProfile')} 
                    className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center"
                >
                    <PencilIcon className="h-5 w-5 mr-3" /> Editar Perfil da Loja
                </button>

                <button 
                    onClick={handleLogout} 
                    className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-red-600 transition"
                >
                    Sair
                </button>
            </div>
        </div>
    );
};

export default VendorProfileScreen;
