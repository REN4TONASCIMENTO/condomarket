import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { ArrowLeftIcon, LoyaltyIcon } from '../Shared/icons';

const VendorScreen = ({ setScreen, vendor, cart, setCart, activeCartVendor, setActiveCartVendor, setAlertMessage }) => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loyaltySettings, setLoyaltySettings] = useState(null);

    const addToCart = (productToAdd) => {
        if (activeCartVendor && activeCartVendor.id !== vendor.id) {
            setAlertMessage("Só pode adicionar itens de um vendedor por vez. Esvazie o carrinho para começar um novo pedido.");
            return;
        }
        if (!activeCartVendor) setActiveCartVendor(vendor);
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === productToAdd.id);
            if (existingItem) return currentCart.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...currentCart, { ...productToAdd, quantity: 1 }];
        });
    };

    useEffect(() => {
        if (!vendor) return;
        const fetchVendorData = async () => {
            setLoadingProducts(true);
            try {
                const productsCollectionRef = collection(db, 'vendors', vendor.id, 'products');
                const productSnapshot = await getDocs(productsCollectionRef);
                setProducts(productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                if (vendor.loyaltyEnabled) {
                    const loyaltyConfigRef = doc(db, 'vendors', vendor.id, 'loyaltySettings', 'config');
                    const loyaltySnap = await getDoc(loyaltyConfigRef);
                    if (loyaltySnap.exists()) {
                        setLoyaltySettings(loyaltySnap.data());
                    }
                }

            } catch (error) { console.error("Erro ao buscar dados do vendedor:", error); }
            setLoadingProducts(false);
        };
        fetchVendorData();
    }, [vendor]);

    if (!vendor) return <div className="p-8">Vendedor não encontrado. <button onClick={() => setScreen('home')}>Voltar</button></div>;
    
    const getAvailabilityClass = (availability) => {
        switch (availability) {
            case 'Pronta Entrega': return 'bg-green-100 text-green-800';
            case 'Apenas por Encomenda': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return `R$ ${price.toFixed(2)}`;
        }
        return price;
    };

    return (
        <div className="flex-grow animate-fade-in">
            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${vendor.headerUrl || 'https://placehold.co/600x240/FEF3C7/F59E0B?text=Bem-vindo'})` }}><div className="p-4"><button onClick={() => setScreen('home')} className="bg-white/80 backdrop-blur-sm h-10 w-10 rounded-full flex items-center justify-center text-gray-700 shadow-md"><ArrowLeftIcon /></button></div></div>
            <div className="p-6 -mt-12">
                <div className="flex items-end space-x-4"><img src={vendor.logoUrl || `https://placehold.co/80x80/FBBF24/854D0E?text=${(vendor.name || '?').charAt(0)}`} className="rounded-full border-4 border-white shadow-lg w-20 h-20" alt={`Logo ${vendor.name || 'Vendedor'}`} /><div><h2 className="text-2xl font-bold text-gray-800">{vendor.name || 'Nome não disponível'}</h2><p className="text-gray-600">{vendor.owner} - {vendor.location}</p></div></div>
                <p className="text-gray-600 mt-4">{vendor.description}</p>
                
                {vendor.loyaltyEnabled && loyaltySettings && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <div className="flex items-center text-amber-700">
                             <LoyaltyIcon />
                             <h4 className="font-bold ml-2">Programa de Fidelidade</h4>
                        </div>
                        <p className="text-sm text-amber-600 mt-1">
                            Junte <strong>{loyaltySettings.pointsNeeded}</strong> pontos e troque por: <strong>{loyaltySettings.rewardDescription}</strong>!
                        </p>
                    </div>
                )}
            </div>
            <div className="px-6 pb-24">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-t pt-4">Cardápio & Serviços</h3>
                {loadingProducts ? <p className="text-gray-500">Carregando...</p> : products.length > 0 ? (
                    <div className="space-y-3">
                        {products.map(product => (
                            <div key={product.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-4">
                                <img src={product.imageUrl || 'https://placehold.co/80x80/gray/white?text=Item'} className="rounded-md w-20 h-20 object-cover" alt={product.name} />
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-gray-800">{product.name}</h4>
                                    <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                                    {product.availability && (<span className={`text-xs font-bold px-2 py-1 rounded-full ${getAvailabilityClass(product.availability)}`}>{product.availability}</span>)}
                                    <p className="font-bold text-indigo-600 mt-2">{formatPrice(product.price)}</p>
                                </div>
                                <button onClick={() => addToCart(product)} className="bg-indigo-100 text-indigo-600 h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl hover:bg-indigo-200 transition">+</button>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500">Este vendedor ainda não adicionou itens.</p>}
            </div>
        </div>
    );
};

export default VendorScreen;