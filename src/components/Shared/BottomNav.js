import React from 'react';
import { HomeIcon, ReceiptIcon, UserIcon, DashboardIcon } from './icons';

const BottomNav = ({ screen, setScreen, cartItemCount, userRole }) => (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 grid grid-cols-3 text-center py-2 z-10">
        <div onClick={() => setScreen('home')} className={`cursor-pointer p-2 rounded-lg ${screen === 'home' ? 'text-indigo-600' : 'text-gray-400'}`}><HomeIcon /><p className="text-xs font-semibold">Início</p></div>
        {userRole === 'customer' ? (
            <div onClick={() => setScreen('myOrders')} className={`relative cursor-pointer p-2 rounded-lg ${screen === 'myOrders' ? 'text-indigo-600' : 'text-gray-400'}`}>
                {cartItemCount > 0 && <span className="absolute top-1 right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                <ReceiptIcon className={`h-6 w-6 mx-auto`} /><p className="text-xs font-semibold">Pedidos</p>
            </div>
        ) : (
            <div onClick={() => setScreen('vendorDashboard')} className={`cursor-pointer p-2 rounded-lg ${screen === 'vendorDashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>
                <DashboardIcon /><p className="text-xs font-semibold">Painel</p>
            </div>
        )}
        <div onClick={() => setScreen(userRole === 'vendor' ? 'editVendorProfile' : 'userProfile')} className={`cursor-pointer p-2 rounded-lg ${['editVendorProfile', 'userProfile', 'editUserProfile', 'myOrders'].includes(screen) ? 'text-indigo-600' : 'text-gray-400'}`}><UserIcon /><p className="text-xs font-semibold">Perfil</p></div>
    </div>
);

export default BottomNav;