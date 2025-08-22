import React from 'react';
import { HomeIcon, ReceiptIcon, UserIcon, DashboardIcon } from './icons.js';

const BottomNav = ({ screen, setScreen, cartItemCount, userRole }) => (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 grid grid-cols-3 text-center py-2 z-10">
        {/* Ícone de Início (Leva o vendedor para o Painel) */}
        <div 
            onClick={() => setScreen(userRole === 'vendor' ? 'vendorHome' : 'home')} 
            role="button" 
            aria-current={screen === 'home' || screen === 'vendorDashboard' ? 'page' : undefined}
            className={`cursor-pointer p-2 rounded-lg ${screen === 'home' || screen === 'vendorDashboard' ? 'text-indigo-600' : 'text-gray-400'} hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
            <HomeIcon />
            <p className="text-xs font-semibold">Início</p>
        </div>

        {/* Ícone do Meio */}
        {userRole === 'customer' ? (
            <div 
                onClick={() => setScreen('myOrders')} 
                role="button" 
                aria-current={screen === 'myOrders' ? 'page' : undefined}
                className={`relative cursor-pointer p-2 rounded-lg ${screen === 'myOrders' ? 'text-indigo-600' : 'text-gray-400'} hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
            >
                {/* A contagem do carrinho foi removida daqui */}
                <ReceiptIcon className="h-6 w-6 mx-auto" />
                <p className="text-xs font-semibold">Pedidos</p>
            </div>
        ) : (
            // Para o vendedor, o ícone do meio também leva ao Painel
            <div 
                onClick={() => setScreen('vendorDashboard')} 
                role="button" 
                aria-current={screen === 'vendorDashboard' ? 'page' : undefined}
                className={`cursor-pointer p-2 rounded-lg ${screen === 'vendorDashboard' ? 'text-indigo-600' : 'text-gray-400'} hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-ring-indigo-300`}
            >
                <DashboardIcon />
                <p className="text-xs font-semibold">Painel</p>
            </div>
        )}

        {/* Ícone de Perfil */}
        <div 
            onClick={() => setScreen(userRole === 'vendor' ? 'vendorProfile' : 'userProfile')} 
            role="button" 
            aria-current={['vendorProfile', 'editVendorProfile', 'userProfile', 'editUserProfile', 'myOrders', 'loyaltyPoints'].includes(screen) ? 'page' : undefined}
            className={`cursor-pointer p-2 rounded-lg ${['vendorProfile', 'editVendorProfile', 'userProfile', 'editUserProfile', 'myOrders', 'loyaltyPoints'].includes(screen) ? 'text-indigo-600' : 'text-gray-400'} hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
        >
            <UserIcon />
            <p className="text-xs font-semibold">Perfil</p>
        </div>
    </div>
);

export default BottomNav;