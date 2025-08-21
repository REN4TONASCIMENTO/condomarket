import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/firebase.js';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Componentes de tela
import AuthScreen from './components/Auth/AuthScreen.js';
import HomeScreen from './components/Customer/HomeScreen.js';
import VendorScreen from './components/Customer/VendorScreen.js';
import CartScreen from './components/Customer/CartScreen.js';
import EditUserProfileScreen from './components/Customer/EditUserProfileScreen.js';
import LoyaltyPointsScreen from './components/Customer/LoyaltyPointsScreen.js';
import MyOrdersScreen from './components/Customer/MyOrdersScreen.js';
import UserProfileScreen from './components/Customer/UserProfileScreen.js';
import AddItemScreen from './components/Vendor/AddItemScreen.js';
import EditVendorProfileScreen from './components/Vendor/EditVendorProfileScreen.js';
import VendorDashboardScreen from './components/Vendor/VendorDashboardScreen.js';
import VendorProfileScreen from './components/Vendor/VendorProfileScreen.js';
import BottomNav from './components/Shared/BottomNav.js';
import AlertBox from './components/Shared/AlertBox.js';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const App = () => {
  // --- Hooks de Estado ---
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [screen, setScreen] = useState('login');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCartVendor, setActiveCartVendor] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [orderSent, setOrderSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);

  // --- Monitorar Autenticação ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const profileData = userSnap.data();
          setUserProfile(profileData);

          if (profileData.role === 'vendor') {
            const vendorRef = doc(db, 'vendors', currentUser.uid);
            const vendorSnap = await getDoc(vendorRef);
            if (vendorSnap.exists()) {
                setVendorProfile(vendorSnap.data());
            }
            setScreen('vendorDashboard');
          } else if (!profileData.displayName) {
            setScreen('editUserProfile');
          } else {
            setScreen('home');
          }
        } else {
          setScreen('selectRole');
        }
        
        const vendorsCollection = collection(db, 'vendors');
        const vendorsSnapshot = await getDocs(vendorsCollection);
        const vendorsList = vendorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVendors(vendorsList);
      } else {
        setUserProfile(null);
        setVendorProfile(null);
        setCart([]);
        setActiveCartVendor(null);
        setScreen('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Lógica de Checkout ---
  const handleWhatsAppCheckout = async () => {
    if (!user || !userProfile || !activeCartVendor || !activeCartVendor.phone) {
        setAlertMessage("Não foi possível enviar o pedido. Verifique os dados.");
        setAlertType('error');
        return;
    }
    const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
    if (total <= 0) {
        setAlertMessage("O valor do pedido não pode ser zero.");
        setAlertType('error');
        return;
    }
    try {
        const orderDoc = await addDoc(collection(db, 'orders'), {
            customerId: user.uid, customerName: userProfile.displayName, customerLocation: userProfile.location,
            vendorId: activeCartVendor.id, vendorName: activeCartVendor.name, items: cart, total: total,
            status: 'pending', createdAt: serverTimestamp()
        });
        const orderId = orderDoc.id.substring(0, 6).toUpperCase();
        const orderSummary = cart.map(item => `${item.quantity}x ${item.name}`).join('\n');
        const phoneNumber = activeCartVendor.phone.replace(/\D/g, '');
        const message = `Olá, ${activeCartVendor.name}! Gostaria de fazer o seguinte pedido (Nº ${orderId}):\n\n${orderSummary}\n\n*Total: R$ ${total.toFixed(2)}*`;
        const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setOrderSent(true);
    } catch (e) {
        console.error("Erro ao criar pedido:", e);
        setAlertMessage("Não foi possível enviar o seu pedido.");
        setAlertType('error');
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Função para Renderizar a Tela Ativa (com Segurança) ---
  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full">Carregando...</div>;
    }

    if (!user || !userProfile || ['login', 'register', 'resetPassword', 'selectRole'].includes(screen)) {
      return <AuthScreen screen={screen} setScreen={setScreen} />;
    }
    
    const userRole = userProfile.role;
    const customerScreens = ['home', 'vendor', 'cart', 'userProfile', 'editUserProfile', 'myOrders', 'loyaltyPoints'];
    const vendorScreens = ['vendorDashboard', 'addItem', 'editVendorProfile', 'vendorProfile'];

    if (userRole === 'customer' && vendorScreens.includes(screen)) {
        setScreen('home');
        return null;
    }

    if (userRole === 'vendor' && customerScreens.includes(screen)) {
        setScreen('vendorDashboard');
        return null;
    }

    const showAlert = (message, type = 'error') => {
        setAlertMessage(message);
        setAlertType(type);
    };

    switch (screen) {
      case 'home':
        return <HomeScreen userProfile={userProfile} setScreen={setScreen} vendors={vendors} setSelectedVendor={(vendor) => { setSelectedVendor(vendor); setScreen('vendor'); }} />;
      case 'vendor':
        if (selectedVendor) {
          return <VendorScreen setScreen={setScreen} vendor={selectedVendor} cart={cart} setCart={setCart} activeCartVendor={activeCartVendor} setActiveCartVendor={setActiveCartVendor} setAlertMessage={showAlert} />;
        }
        setScreen('home');
        return null;
      case 'cart':
        return <CartScreen user={user} userProfile={userProfile} setScreen={setScreen} cart={cart} setCart={setCart} activeCartVendor={activeCartVendor} setActiveCartVendor={setActiveCartVendor} orderSent={orderSent} setOrderSent={setOrderSent} handleWhatsAppCheckout={handleWhatsAppCheckout} />;
      case 'userProfile':
        return <UserProfileScreen userProfile={userProfile} setScreen={setScreen} />;
      case 'editUserProfile':
        return <EditUserProfileScreen user={user} userProfile={userProfile} setScreen={setScreen} />;
      case 'myOrders':
        return <MyOrdersScreen userProfile={userProfile} setScreen={setScreen} cart={cart} orderSent={orderSent} handleWhatsAppCheckout={handleWhatsAppCheckout} />;
      case 'loyaltyPoints':
        return <LoyaltyPointsScreen userProfile={userProfile} setScreen={setScreen} />;
      // Telas de Vendedor
      case 'vendorDashboard':
        return <VendorDashboardScreen user={user} setScreen={setScreen} setEditingItem={setEditingItem} />;
      case 'addItem':
        return <AddItemScreen user={user} setScreen={setScreen} editingItem={editingItem} setEditingItem={setEditingItem} />;
      case 'editVendorProfile':
        return <EditVendorProfileScreen user={user} vendorProfile={vendorProfile} setScreen={setScreen} />;
      case 'vendorProfile':
        return <VendorProfileScreen vendorProfile={vendorProfile} setScreen={setScreen} />;
      default:
        if (userRole === 'vendor') {
            return <VendorDashboardScreen user={user} setScreen={setScreen} setEditingItem={setEditingItem} />;
        }
        return <HomeScreen userProfile={userProfile} setScreen={setScreen} vendors={vendors} setSelectedVendor={(vendor) => { setSelectedVendor(vendor); setScreen('vendor'); }} />;
    }
  };
  
  return (
    <div className="bg-gray-200 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md h-screen bg-white shadow-lg flex flex-col relative">
        
        {user && userProfile?.role === 'customer' && screen !== 'cart' && (
          <button 
            onClick={() => cartItemCount > 0 && setScreen('cart')}
            className={`absolute top-4 right-4 z-50 p-3 rounded-full shadow-lg transition ${cartItemCount > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            title="Ver carrinho"
            aria-label="Carrinho de compras"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">{cartItemCount}</span>
            )}
          </button>
        )}

        {/* --- CORREÇÃO APLICADA AQUI --- */}
        <main className="flex-grow overflow-y-auto">
          {renderContent()}
        </main>
        
        {user && userProfile && (
          <BottomNav 
            screen={screen} 
            setScreen={setScreen} 
            userRole={userProfile?.role}
            cartItemCount={cartItemCount}
          />
        )}

        <AlertBox message={alertMessage} type={alertType} setMessage={setAlertMessage} />
      </div>
    </div>
  );
};

export default App;
