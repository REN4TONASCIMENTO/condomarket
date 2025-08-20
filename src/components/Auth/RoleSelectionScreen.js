import React from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const createUserProfile = async (user, role) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        role: role,
        location: '',
        phone: ''
    });

    if (role === 'vendor') {
        const vendorRef = doc(db, 'vendors', user.uid);
        await setDoc(vendorRef, {
            ownerId: user.uid,
            name: `${user.displayName || 'Nova Loja'}`,
            description: 'Descreva a sua loja aqui.',
            location: 'Bloco X, Ap Y',
            phone: '',
            rating: 0,
            reviews: 0,
            category: 'Serviços',
            loyaltyEnabled: true
        });
    }
};

const RoleSelectionScreen = ({ user, setUserRole }) => {
    const handleRoleSelection = async (role) => {
        await createUserProfile(user, role);
        setUserRole(role);
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 flex-grow animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Complete o seu perfil</h1>
            <p className="text-gray-600 text-center mb-8">Para continuar, diga-nos se você é um cliente ou um vendedor.</p>
            <div className="w-full space-y-4">
                <button onClick={() => handleRoleSelection('customer')} className="w-full py-3 px-6 bg-indigo-100 text-indigo-700 font-semibold rounded-lg">Sou um Cliente</button>
                <button onClick={() => handleRoleSelection('vendor')} className="w-full py-3 px-6 bg-teal-100 text-teal-700 font-semibold rounded-lg">Sou um Vendedor</button>
            </div>
        </div>
    );
};

export default RoleSelectionScreen;