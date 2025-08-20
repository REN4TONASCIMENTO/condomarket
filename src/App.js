import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';


import AuthScreen from './components/Auth/AuthScreen.js';
import RoleSelectionScreen from './components/Auth/RoleSelectionScreen.js';
import HomeScreen from './components/Customer/HomeScreen.js';
import VendorScreen from './components/Customer/VendorScreen.js';
import CartScreen from './components/Customer/CartScreen.js';
import UserProfileScreen from './components/Customer/UserProfileScreen.js';
import EditUserProfileScreen from './components/Customer/EditUserProfileScreen.js';
import LoyaltyPointsScreen from './components/Customer/LoyaltyPointsScreen.js';
import MyOrdersScreen from './components/Customer/MyOrdersScreen.js';
import VendorDashboardScreen from './components/Vendor/VendorDashboardScreen.js';
import AddItemScreen from './components/Vendor/AddItemScreen.js';
import EditVendorProfileScreen from './components/Vendor/EditVendorProfileScreen.js';
import BottomNav from './components/Shared/BottomNav.js';
import AlertBox from './components/Shared/AlertBox.js';

export default function App() {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [screen, setScreen] = useState('login');
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [cart, setCart] = useState([]);
    const [activeCartVendor, setActiveCartVendor] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [orderSent, setOrderSent] = useState(false);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const profile = userDocSnap.data();
                    setUserProfile(profile);
                    setScreen(profile.role === 'vendor' ? 'vendorDashboard' : 'home');
                } else {
                    const newProfile = {
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        role: 'needs_selection'
                    };
                    setUserProfile(newProfile);
                    setScreen('roleSelection');
                }
            } else {
                setUserProfile(null);
                setScreen('login');
            }
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (userProfile && (userProfile.role === 'customer' || userProfile.role === 'vendor')) {
            const fetchVendors = async () => {
                try {
                    const vendorSnapshot = await getDocs(collection(db, 'vendors'));
                    setVendors(vendorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch (error) { console.error("Erro ao buscar vendedores:", error); }
            };
            fetchVendors();
        }
    }, [userProfile]);

    const handleWhatsAppCheckout = () => {
    // Exemplo de mensagem
    const message = cart.map(item => ` Olá! Gostaria de pedir: ${item.quantity}x ${item.name}`).join('\n') +
        `\nTotal: R$ ${cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}`;
    const phone = '5592982529894'; // Coloque o número do WhatsApp do vendedor
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setOrderSent(true); // Opcional: marca como enviado
    setCart([]); // Limpa o carrinho após o envio
};

    const renderScreen = () => {
        if (loading) return <div className="flex-grow flex items-center justify-center"><p>Carregando...</p></div>;
        if (!user) return <AuthScreen screen={screen} setScreen={setScreen} />;
        if (userProfile && userProfile.role === 'needs_selection') return <RoleSelectionScreen user={user} setUserRole={(role) => setUserProfile({...userProfile, role})} />;

        if (!userProfile) return <div className="flex-grow flex items-center justify-center"><p>Carregando perfil...</p></div>;

        switch (screen) {
            case 'home': return <HomeScreen userProfile={userProfile} setScreen={setScreen} vendors={vendors} setSelectedVendor={setSelectedVendor} />;
            case 'vendor': return <VendorScreen setScreen={setScreen} vendor={selectedVendor} cart={cart} setCart={setCart} activeCartVendor={activeCartVendor} setActiveCartVendor={setActiveCartVendor} setAlertMessage={setAlertMessage} />;
            case 'cart': return <CartScreen user={user} userProfile={userProfile} setScreen={setScreen} cart={cart} setCart={setCart} activeCartVendor={activeCartVendor} setActiveCartVendor={setActiveCartVendor} orderSent={orderSent} setOrderSent={setOrderSent} />;
            case 'vendorDashboard': return <VendorDashboardScreen user={user} setScreen={setScreen} setEditingItem={setEditingItem} />;
            case 'addItem': return <AddItemScreen user={user} setScreen={setScreen} editingItem={editingItem} setEditingItem={setEditingItem} />;
            case 'editVendorProfile': return <EditVendorProfileScreen user={user} setScreen={setScreen} />;
            case 'userProfile': return <UserProfileScreen userProfile={userProfile} setScreen={setScreen} />;
            case 'editUserProfile': return <EditUserProfileScreen user={user} userProfile={userProfile} setScreen={setScreen} />;
            case 'loyaltyPoints': return <LoyaltyPointsScreen user={user} setScreen={setScreen} />;
            case 'myOrders': return <MyOrdersScreen user={user} setScreen={setScreen} cart={cart} orderSent={orderSent} handleWhatsAppCheckout={handleWhatsAppCheckout} />;
            case 'roleSelection': return <RoleSelectionScreen user={user} setUserRole={(role) => setUserProfile({...userProfile, role})} />;
            default: return userProfile.role === 'vendor' ? <VendorDashboardScreen user={user} setScreen={setScreen} setEditingItem={setEditingItem} /> : <HomeScreen userProfile={userProfile} setScreen={setScreen} vendors={vendors} setSelectedVendor={setSelectedVendor} />;
        }
    };

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="font-sans bg-gray-50">
            <AlertBox message={alertMessage} setMessage={setAlertMessage} />
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl flex flex-col">
                <main className="flex-grow flex flex-col">{renderScreen()}</main>
                {user && userProfile && userProfile.role !== 'needs_selection' && <BottomNav screen={screen} setScreen={setScreen} cartItemCount={cartItemCount} userRole={userProfile.role} />}
            </div>
        </div>
    );
}

