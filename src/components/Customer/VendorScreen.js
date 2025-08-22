import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { ArrowLeftIcon, LoyaltyIcon } from '../Shared/icons.js';

const VendorScreen = ({
    setScreen,
    vendor,
    cart,
    setCart,
    activeCartVendor,
    setActiveCartVendor,
    setAlertMessage
}) => {
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loyaltySettings, setLoyaltySettings] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    const addToCart = useCallback((productToAdd) => {
        if (activeCartVendor && activeCartVendor.id !== vendor.id) {
            setAlertMessage("Só pode adicionar itens de um vendedor por vez. Esvazie o carrinho para iniciar um novo pedido.");
            setTimeout(() => setAlertMessage(''), 3000);
            return;
        }
        if (!activeCartVendor) setActiveCartVendor(vendor);
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === productToAdd.id);
            if (existingItem) {
                return currentCart.map(item =>
                    item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...currentCart, { ...productToAdd, price: Number(productToAdd.price) || 0, quantity: 1 }];
        });
    }, [activeCartVendor, setCart, vendor, setActiveCartVendor, setAlertMessage]);

    const removeFromCart = useCallback((productId) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.id === productId);
            if (!existingItem) {
                return currentCart;
            }

            if (existingItem.quantity > 1) {
                return currentCart.map(item =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                );
            } else {
                const newCart = currentCart.filter(item => item.id !== productId);
                if (newCart.length === 0) {
                    setActiveCartVendor(null);
                }
                return newCart;
            }
        });
    }, [setCart, setActiveCartVendor]);

    useEffect(() => {
        if (!vendor) return;

        const fetchVendorData = async () => {
            setLoadingProducts(true);
            try {
                const productsCollectionRef = collection(db, 'vendors', vendor.id, 'products');
                const productSnapshot = await getDocs(productsCollectionRef);
                const loadedProducts = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(loadedProducts);

                const uniqueCategories = [...new Set(loadedProducts.map(item => item.category).filter(Boolean))];
                setCategories(uniqueCategories);

                if (vendor.loyaltyEnabled) {
                    const loyaltyConfigRef = doc(db, 'vendors', vendor.id, 'loyaltySettings', 'config');
                    const loyaltySnap = await getDoc(loyaltyConfigRef);
                    setLoyaltySettings(loyaltySnap.exists() ? loyaltySnap.data() : null);
                }

            } catch (error) {
                console.error("Erro ao buscar dados do vendedor:", error);
                setAlertMessage("Erro ao carregar os produtos do vendedor.");
            }
            setLoadingProducts(false);
        };

        fetchVendorData();
    }, [vendor, setAlertMessage]);

    if (!vendor) return (
        <div className="p-8">
            Vendedor não encontrado.
            <button onClick={() => setScreen('home')} className="ml-2 underline text-indigo-600">Voltar</button>
        </div>
    );

    const getAvailabilityClass = (availability) => {
        switch (availability) {
            case 'Pronta Entrega': return 'bg-green-100 text-green-800';
            case 'Apenas por Encomenda': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatPrice = (price) => {
        if (!price) return 'R$ 0,00';
        const numericPrice = Number(price);
        if (!isNaN(numericPrice)) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericPrice);
        }
        return `R$ ${price}`;
    };

    const vendorLogo = vendor.logoUrl || `https://placehold.co/80x80/FBBF24/854D0E?text=${(vendor.name || '?').charAt(0)}`;
    const filteredProducts = selectedCategory
        ? products.filter(item => item.category === selectedCategory)
        : products;

    return (
        <div className="flex-grow animate-fade-in">
            {/* Cabeçalho */}
            <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: vendor.headerUrl ? `url(${vendor.headerUrl})` : 'none' }}
            >
                {!vendor.headerUrl && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-yellow-300"></div>
                )}
                <div className="relative p-4 z-10">
                    <button
                        onClick={() => setScreen('home')}
                        aria-label="Voltar"
                        className="bg-white/80 backdrop-blur-sm h-10 w-10 rounded-full flex items-center justify-center text-gray-700 shadow-md"
                    >
                        <ArrowLeftIcon />
                    </button>
                </div>
            </div>

            <div className="relative p-6 -mt-12">
                <div className="flex items-end space-x-4">
                    <img
                        src={vendorLogo}
                        className="rounded-full border-4 border-white shadow-lg w-20 h-20 flex-shrink-0"
                        alt={`Logo ${vendor.name || 'Vendedor'}`}
                    />
                    <div className="flex-grow flex flex-col justify-end">
                        <h2 className="text-2xl font-bold text-gray-800">{vendor.name || 'Nome não disponível'}</h2>
                        <p className="text-gray-600">{vendor.owner || 'Proprietário não informado'} - {vendor.location || 'Localização não informada'}</p>
                    </div>
                </div>

                <p className="text-gray-600 mt-4">{vendor.description || 'Descrição não disponível.'}</p>

                {vendor.loyaltyEnabled && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <div className="flex items-center text-amber-700">
                            <LoyaltyIcon className="h-5 w-5 mr-2" />
                            <h4 className="font-bold ml-2">Programa de Fidelidade</h4>
                        </div>
                        {loyaltySettings?.pointsNeeded && loyaltySettings?.rewardDescription ? (
                            <p className="text-sm text-amber-600 mt-1">
                                Junte <strong>{loyaltySettings.pointsNeeded}</strong> pontos e troque por: <strong>{loyaltySettings.rewardDescription}</strong>!
                            </p>
                        ) : (
                            <p className="text-sm text-amber-600 mt-1">Configuração de fidelidade não disponível.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="px-6 pb-24">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-t pt-4">Cardápio & Serviços</h3>

                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-3 py-1 rounded-full ${selectedCategory === '' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Todas
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1 rounded-full ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {loadingProducts ? (
                    <p className="text-gray-500">Carregando produtos...</p>
                ) : filteredProducts.length > 0 ? (
                    <div className="space-y-3">
                        {filteredProducts.map(product => {
                            const itemInCart = cart.find(item => item.id === product.id);
                            const quantity = itemInCart ? itemInCart.quantity : 0;

                            return (
                                <div key={product.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-4">
                                    <img
                                        src={product.imageUrl || 'https://placehold.co/80x80/gray/white?text=Item'}
                                        className="rounded-md w-20 h-20 object-cover flex-shrink-0"
                                        alt={product.name || 'Produto sem imagem'}
                                    />
                                    <div className="flex-grow flex flex-col justify-center">
                                        <h4 className="font-semibold text-gray-800">{product.name || 'Produto sem nome'}</h4>
                                        <p className="text-sm text-gray-500 mb-2">{product.description || 'Descrição não disponível'}</p>
                                        {product.availability && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getAvailabilityClass(product.availability)}`}>
                                                {product.availability}
                                            </span>
                                        )}
                                        <p className="font-bold text-indigo-600 mt-2">{formatPrice(product.price)}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {quantity === 0 ? (
                                            <button
                                                onClick={() => addToCart(product)}
                                                aria-label={`Adicionar ${product.name || 'produto'} ao carrinho`}
                                                className="bg-indigo-100 text-indigo-600 h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl hover:bg-indigo-200 transition"
                                            >
                                                +
                                            </button>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => removeFromCart(product.id)}
                                                    aria-label={`Remover uma unidade de ${product.name || 'produto'}`}
                                                    className="bg-gray-200 text-gray-700 h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg hover:bg-gray-300 transition"
                                                >
                                                    -
                                                </button>
                                                <span className="font-semibold text-gray-800 text-lg w-6 text-center">{quantity}</span>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    aria-label={`Adicionar uma unidade de ${product.name || 'produto'}`}
                                                    className="bg-indigo-600 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg hover:bg-indigo-700 transition"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">Este vendedor ainda não adicionou produtos.</p>
                )}
            </div>
        </div>
    );
};

export default VendorScreen;