import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, runTransaction, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { PencilIcon, TrashIcon } from '../Shared/icons';

const VendorDashboardScreen = ({ user, setScreen, setEditingItem }) => {
    const [myProducts, setMyProducts] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [allCompletedOrders, setAllCompletedOrders] = useState([]);
    const [filteredCompletedOrders, setFilteredCompletedOrders] = useState([]);
    const [visibleOrdersCount, setVisibleOrdersCount] = useState(5);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterYear, setFilterYear] = useState('Todos');
    const [filterMonth, setFilterMonth] = useState('Todos');

    const fetchProductsAndOrders = useCallback(async () => {
        setLoading(true);
        try {
            const productsRef = collection(db, 'vendors', user.uid, 'products');
            const productSnapshot = await getDocs(productsRef);
            setMyProducts(productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const pendingQuery = query(
                collection(db, 'orders'),
                where('vendorId', '==', user.uid),
                where('status', '==', 'pending')
            );
            const pendingSnapshot = await getDocs(pendingQuery);
            setPendingOrders(pendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const completedQuery = query(
                collection(db, 'orders'),
                where('vendorId', '==', user.uid),
                where('status', '==', 'completed')
            );
            const completedSnapshot = await getDocs(completedQuery);
            setAllCompletedOrders(completedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
        setLoading(false);
    }, [user.uid]);

    useEffect(() => {
        fetchProductsAndOrders();
    }, [fetchProductsAndOrders]);

    useEffect(() => {
        let orders = [...allCompletedOrders];
        if (filterYear !== 'Todos') {
            orders = orders.filter(order => new Date(order.createdAt?.toDate()).getFullYear() === Number(filterYear));
        }
        if (filterMonth !== 'Todos') {
            orders = orders.filter(order => new Date(order.createdAt?.toDate()).getMonth() + 1 === Number(filterMonth));
        }
        orders.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        setFilteredCompletedOrders(orders);
        setVisibleOrdersCount(5);
    }, [allCompletedOrders, sortOrder, filterYear, filterMonth]);

    const handleConfirmSale = async (order) => {
        const orderRef = doc(db, 'orders', order.id);
        const vendorRef = doc(db, 'vendors', order.vendorId);
        const vendorSnap = await getDoc(vendorRef);
        const vendorData = vendorSnap.data();

        if (order.vendorId && order.customerId && vendorData.loyaltyEnabled) {
            try {
                const loyaltyRef = doc(db, 'users', order.customerId, 'loyaltyPoints', order.vendorId);
                await runTransaction(db, async (transaction) => {
                    const loyaltyDoc = await transaction.get(loyaltyRef);
                    if (!loyaltyDoc.exists()) {
                        transaction.set(loyaltyRef, { points: 1, vendorName: order.vendorName });
                    } else {
                        const newPoints = loyaltyDoc.data().points + 1;
                        transaction.update(loyaltyRef, { points: newPoints });
                    }
                });
            } catch (e) {
                console.error("Erro ao adicionar ponto de fidelidade: ", e);
            }
        }

        await updateDoc(orderRef, { status: 'completed' });
        fetchProductsAndOrders();
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const itemRef = doc(db, 'vendors', user.uid, 'products', itemToDelete);
            await deleteDoc(itemRef);
            setItemToDelete(null);
            fetchProductsAndOrders();
        } catch (error) {
            console.error("Erro ao remover item:", error);
            setItemToDelete(null);
        }
    };

    const availableYears = [...new Set(allCompletedOrders.map(order => new Date(order.createdAt?.toDate()).getFullYear()))];

    return (
        <div className="flex-grow p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Meu Painel</h1>
                <button 
                    onClick={() => { setEditingItem(null); setScreen('addItem'); }} 
                    className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition text-sm">
                    Adicionar Item
                </button>
            </div>

            {/* Pendentes */}
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Pedidos Pendentes</h2>
            {loading ? <p>Carregando...</p> : pendingOrders.length > 0 ? (
                <div className="space-y-3 mb-8">
                    {pendingOrders.map(order => (
                        <div key={order.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="font-semibold text-sm">Pedido de: {order.customerName} {order.customerLocation && `(${order.customerLocation})`}</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside my-1">
                                {order.items.map(item => <li key={item.id}>{item.quantity}x {item.name}</li>)}
                            </ul>
                            <button onClick={() => handleConfirmSale(order)} className="mt-2 w-full bg-green-500 text-white text-xs font-bold py-1 rounded-md">
                                Confirmar venda
                            </button>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-gray-500 mb-6">Não há pedidos pendentes.</p>}

            {/* Histórico */}
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-t pt-4">Histórico de Vendas</h2>
            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border rounded-md p-1 bg-white">
                    <option value="desc">Mais recentes</option>
                    <option value="asc">Mais antigos</option>
                </select>
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border rounded-md p-1 bg-white">
                    <option value="Todos">Ano</option>
                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border rounded-md p-1 bg-white">
                    <option value="Todos">Mês</option>
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                </select>
            </div>
            {loading ? <p>Carregando...</p> : filteredCompletedOrders.length > 0 ? (
                <div className="space-y-3 mb-8">
                    {filteredCompletedOrders.slice(0, visibleOrdersCount).map(order => (
                        <div key={order.id} className="bg-gray-50 p-3 rounded-lg border">
                            <p className="font-semibold text-sm">Venda para: {order.customerName} {order.customerLocation && `(${order.customerLocation})`}</p>
                            <p className="text-xs text-gray-500">Data: {new Date(order.createdAt?.toDate()).toLocaleString('pt-BR')}</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside my-1">
                                {order.items.map(item => <li key={item.id}>{item.quantity}x {item.name}</li>)}
                            </ul>
                            <p className="text-sm font-bold text-right">Total: R$ {order.total.toFixed(2)}</p>
                        </div>
                    ))}
                    {visibleOrdersCount < filteredCompletedOrders.length && (
                        <button onClick={() => setVisibleOrdersCount(c => c + 5)} className="w-full text-center text-indigo-600 font-semibold text-sm py-2">
                            Ver mais
                        </button>
                    )}
                </div>
            ) : <p className="text-sm text-gray-500 mb-6">Nenhuma venda encontrada para estes filtros.</p>}

            {/* Produtos */}
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-t pt-4">Meus Itens</h2>
            {loading ? <p>Carregando...</p> : myProducts.length > 0 ? (
                <div className="space-y-3">
                    {myProducts.map(product => (
                        <div key={product.id} className="bg-white p-3 rounded-lg border flex items-center space-x-4">
                            <img src={product.imageUrl || 'https://placehold.co/64x64/gray/white?text=Item'} className="rounded-md w-16 h-16 object-cover" alt={product.name} />
                            <div className="flex-grow">
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-600">{typeof product.price === 'number' ? `R$ ${product.price.toFixed(2)}` : product.price}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => { setEditingItem(product); setScreen('addItem'); }} className="text-gray-400 hover:text-indigo-600"><PencilIcon /></button>
                                <button onClick={() => setItemToDelete(product.id)} className="text-gray-400 hover:text-red-500"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-10 border-2 border-dashed rounded-lg p-8">
                    <p>Ainda não tem produtos ou serviços.</p>
                    <button onClick={() => setScreen('addItem')} className="mt-4 text-indigo-600 font-semibold">Adicionar o seu primeiro item</button>
                </div>
            )}

            {/* Modal de confirmação de exclusão */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl text-center">
                        <h3 className="font-bold text-lg mb-2">Confirmar Remoção</h3>
                        <p className="text-gray-600">Tem a certeza que quer remover este item?</p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button onClick={() => setItemToDelete(null)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleConfirmDelete} className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600">Remover</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboardScreen;
