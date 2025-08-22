import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase.js';
import { LoyaltyIcon, ReceiptIcon } from '../Shared/icons.js';

const UserProfileScreen = ({ userProfile, setScreen }) => {
    // Mostra uma mensagem de carregamento se o perfil ainda não foi carregado
    if (!userProfile) {
        return <div className="flex-grow p-6 text-center flex items-center justify-center">Carregando perfil...</div>;
    }

    // Função para fazer logout
    const handleLogout = () => {
        signOut(auth).catch(err => console.error('Erro ao sair:', err));
        // O App.jsx irá detetar a mudança de autenticação e redirecionar para a tela de login.
    };

    return (
        <div className="flex-grow p-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Meu Perfil</h1>
            
            {/* Cartão com as informações do usuário */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4 mb-6">
                <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-semibold text-lg">{userProfile.displayName || 'Não informado'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="font-semibold text-lg">{userProfile.email || 'Não informado'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-semibold text-lg">{userProfile.location || 'Não informado'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-semibold text-lg">{userProfile.phone || 'Não informado'}</p>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
                <button 
                    onClick={() => setScreen('myOrders')} 
                    className="w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg shadow-sm hover:bg-gray-200 transition flex items-center justify-center"
                >
                    <ReceiptIcon className="h-5 w-5 mr-3" />
                    <span>Meus Pedidos</span>
                </button>

                {/* Este botão só aparece se o 'role' do usuário for 'customer' */}
                {userProfile.role === 'customer' && (
                    <button 
                        onClick={() => setScreen('loyaltyPoints')} 
                        className="w-full bg-amber-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-amber-600 transition flex items-center justify-center"
                    >
                        <LoyaltyIcon className="h-5 w-5 mr-3" />
                        <span>Pontos de Fidelidade</span>
                    </button>
                )}

                <button 
                    onClick={() => setScreen('editUserProfile')} 
                    className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center"
                >
                    Editar Perfil
                </button>

                <button 
                    onClick={handleLogout} 
                    className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-red-600 transition flex items-center justify-center"
                >
                    Sair
                </button>
            </div>
        </div>
    );
};

export default UserProfileScreen;