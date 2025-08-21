// CartScreen.jsx
import React from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { ArrowLeftIcon, WhatsappIcon, TrashIcon } from '../Shared/icons.js';

const CartScreen = ({ user, userProfile, setScreen, cart, setCart, activeCartVendor, setActiveCartVendor, orderSent, setOrderSent }) => {

    // Atualiza quantidade de itens
    const updateQuantity = (productId, amount) => setCart(currentCart =>
        currentCart.map(item => item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item)
    );

    // Remove item do carrinho
    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        if (newCart.length === 0) {
            setActiveCartVendor(null);
            setOrderSent(false);
        }
    };

    // Limpa todo o carrinho
    const clearCart = () => {
        setCart([]);
        setActiveCartVendor(null);
        setOrderSent(false);
    };

    // Envia pedido via WhatsApp e salva no Firestore
    const handleWhatsAppCheckout = async () => {
        if (!user || !userProfile) {
            alert("Você precisa estar logado para enviar pedidos.");
            return;
        }
        if (!activeCartVendor || !activeCartVendor.phone) {
            alert("Não foi possível encontrar o número de telemóvel do vendedor.");
            return;
        }

        const total = cart.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price : 0) * item.quantity, 0);

        try {
            const orderDoc = await addDoc(collection(db, 'orders'), {
                customerId: user.uid,
                customerName: userProfile.displayName,
                customerLocation: userProfile.location,
                vendorId: activeCartVendor.id,
                vendorName: activeCartVendor.name,
                items: cart,
                total: total,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            const orderId = orderDoc.id;
            const orderSummary = cart.map(item => `${item.quantity}x ${item.name}`).join('\n');
            const phoneNumber = activeCartVendor.phone.replace(/\D/g, '');
            const message = `Olá, ${activeCartVendor.name}! Gostaria de fazer o seguinte pedido (Nº ${orderId}):\n\n${orderSummary}\n\n*Total: R$ ${total.toFixed(2)}*`;
            const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            setOrderSent(true);
        } catch (e) {
            console.error("Erro ao criar pedido:", e);
            alert("Não foi possível enviar o seu pedido. Tente novamente.");
        }
    };

    const total = cart.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price : 0) * item.quantity, 0);

    return (
        <div className="flex-grow p-6 animate-fade-in">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button onClick={() => setScreen('home')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2">
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 ml-4">Meu Pedido</h1>
                </div>
                {cart.length > 0 && !orderSent && (
                    <button onClick={clearCart} className="text-sm text-red-500 font-semibold">Esvaziar</button>
                )}
            </div>

            {/* Estado do carrinho */}
            {orderSent ? (
                <div className="text-center text-gray-600 mt-16">
                    <h2 className="text-xl font-bold mb-2">Pedido Enviado!</h2>
                    <p>O seu pedido foi enviado para {activeCartVendor.name}.</p>
                    <p className="mt-4 text-sm">Você receberá seu ponto de fidelidade assim que a venda for confirmada pelo vendedor.</p>
                    <button onClick={clearCart} className="mt-6 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition">Voltar ao Início</button>
                </div>
            ) : cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-16">
                    <p>O seu carrinho está vazio.</p>
                    <button onClick={() => setScreen('home')} className="mt-4 text-indigo-600 font-semibold">Ver vendedores</button>
                </div>
            ) : (
                <>
                    {/* Lista de produtos */}
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center space-x-3">
                                <img src={item.imageUrl || 'https://placehold.co/64x64/gray/white?text=Item'} className="rounded-md w-16 h-16 object-cover" alt={item.name} />
                                <div className="flex-grow">
                                    <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                                    <p className="font-bold text-indigo-600 text-sm">{typeof item.price === 'number' ? `R$ ${item.price.toFixed(2)}` : item.price}</p>
                                    <div className="flex items-center mt-2">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-200 h-6 w-6 rounded-full font-bold hover:bg-gray-300 transition">-</button>
                                        <span className="px-3 font-semibold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-200 h-6 w-6 rounded-full font-bold hover:bg-gray-300 transition">+</button>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </div>
                        ))}
                    </div>

                    {/* Total e botão WhatsApp */}
                    <div className="mt-8 border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleWhatsAppCheckout}
                            disabled={cart.length === 0}
                            className="mt-6 w-full bg-green-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center z-20 disabled:bg-green-300"
                        >
                            <WhatsappIcon />Finalizar pedido no WhatsApp
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartScreen;
