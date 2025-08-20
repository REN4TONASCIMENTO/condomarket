import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeftIcon } from '../Shared/icons';

const MyOrdersScreen = ({ user, setScreen, cart = [], orderSent = false, handleWhatsAppCheckout }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [filterYear, setFilterYear] = useState('Todos');
  const [filterMonth, setFilterMonth] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = mais recentes, 'asc' = mais antigos

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('customerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(ordersQuery);
        const userOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(userOrders);
      } catch (error) {
        console.error("Erro ao buscar histórico de pedidos:", error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  // Filtragem e ordenação
  useEffect(() => {
    let tempOrders = [...orders];

    if (filterYear !== 'Todos') {
      tempOrders = tempOrders.filter(order => new Date(order.createdAt?.toDate()).getFullYear() === parseInt(filterYear));
    }

    if (filterMonth !== 'Todos') {
      tempOrders = tempOrders.filter(order => new Date(order.createdAt?.toDate()).getMonth() + 1 === parseInt(filterMonth));
    }

    tempOrders.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(tempOrders);
  }, [orders, filterYear, filterMonth, sortOrder]);

  const getStatusClass = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const displayedOrders = showAll ? filteredOrders : filteredOrders.slice(0, 5);

  // Extrair anos disponíveis
  const availableYears = [...new Set(orders.map(order => new Date(order.createdAt?.toDate()).getFullYear()))];

  return (
    <div className="flex-grow p-6 animate-fade-in">
      <div className="flex items-center mb-8">
        <button onClick={() => setScreen('userProfile')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2"><ArrowLeftIcon /></button>
        <h1 className="text-2xl font-bold text-gray-800 ml-4">Meus Pedidos</h1>
      </div>

      {/* Pedido em andamento */}
      {cart.length > 0 && !orderSent && (
        <div className="bg-white p-4 rounded-lg border border-indigo-300 mb-6">
          <h2 className="font-bold text-indigo-700 mb-2">Pedido em andamento</h2>
          <ul className="text-sm text-gray-600 list-disc list-inside my-2 ml-2">
            {cart.map(item => (
              <li key={item.id}>{item.quantity}x {item.name}</li>
            ))}
          </ul>
          <p className="text-md font-bold text-right text-indigo-600">
            Total: R$ {cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}
          </p>
          <button
            className="mt-3 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            onClick={handleWhatsAppCheckout}
          >
            Finalizar pedido no WhatsApp
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border rounded-md p-1 bg-white">
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>

        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border rounded-md p-1 bg-white">
          <option value="Todos">Ano</option>
          {availableYears.map(year => <option key={year}>{year}</option>)}
        </select>

        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border rounded-md p-1 bg-white">
          <option value="Todos">Mês</option>
          {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Carregando histórico...</p>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {displayedOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-2xl border border-gray-200 shadow hover:shadow-2xl transition-all transform hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{order.vendorName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt?.toDate()).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusClass(order.status)}`}>
                  {order.status === 'completed' ? 'Concluído' : 'Pendente'}
                </span>
              </div>
              <ul className="text-sm text-gray-600 list-disc list-inside my-2 ml-2">
                {order.items.map(item => <li key={item.id}>{item.quantity}x {item.name}</li>)}
              </ul>
              <p className="text-md font-bold text-right text-indigo-600">
                Total: R$ {order.total.toFixed(2)}
              </p>
            </div>
          ))}

          {/* Botões Ver mais / Ver menos */}
          {!showAll && filteredOrders.length > 5 && (
            <button
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              onClick={() => setShowAll(true)}
            >
              Ver mais
            </button>
          )}
          {showAll && filteredOrders.length > 5 && (
            <button
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              onClick={() => setShowAll(false)}
            >
              Ver menos
            </button>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">Você ainda não fez nenhum pedido.</p>
      )}
    </div>
  );
};

export default MyOrdersScreen;
