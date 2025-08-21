import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase/firebase.js';

/**
 * Cria automaticamente perfil do usuário no Firestore.
 * Se for vendedor, cria também um documento em 'vendors'.
 * @param {Object} user - Objeto do usuário do Firebase Auth
 * @param {string} role - 'vendor' ou 'customer'
 * @param {Object} [userDefaults] - Valores opcionais para o perfil do usuário
 * @param {Object} [vendorDefaults] - Valores opcionais para o perfil do vendedor
 * @returns {Promise<{userRef: DocumentReference, vendorRef?: DocumentReference}>}
 */
export const createUserProfile = async (user, role, userDefaults = {}, vendorDefaults = {}) => {
    try {
        // Perfis default do usuário
        const defaultUserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            role: role,
            location: '',
            phone: '',
            ...userDefaults, // Sobrescreve defaults se fornecido
        };

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, defaultUserData, { merge: true });

        let vendorRef;
        if (role === 'vendor') {
            // Perfis default do vendedor
            const defaultVendorData = {
                ownerId: user.uid,
                name: user.displayName || 'Nova Loja',
                description: 'Descreva a sua loja aqui.',
                location: 'Bloco X, Ap Y',
                phone: '',
                rating: 0,
                reviews: 0,
                category: 'Serviços',
                loyaltyEnabled: true,
                ...vendorDefaults // Sobrescreve defaults se fornecido
            };

            vendorRef = doc(db, 'vendors', user.uid);
            await setDoc(vendorRef, defaultVendorData, { merge: true });
        }

        return { userRef, vendorRef };
    } catch (error) {
        console.error('Erro ao criar perfil do usuário:', error);
        throw error; // Permite tratar erro externamente
    }
};
