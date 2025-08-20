import React, { useState } from 'react';
import { SearchIcon, StarIcon } from '../Shared/icons';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const HomeScreen = ({ userProfile, setScreen, vendors, setSelectedVendor, cart }) => {
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const firstName = userProfile.displayName ? userProfile.displayName.split(' ')[0] : userProfile.email;

    const filteredVendors = vendors.filter(vendor => {
        const categoryMatch = filter === 'Todos' || vendor.category === filter;
        const searchMatch = searchTerm === '' || 
                            vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
        return categoryMatch && searchMatch;
    });

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="flex-grow p-6 animate-fade-in relative">
            {/* Ícone do carrinho fixo com badge */}
            <button 
                onClick={() => setScreen('cart')}
                className="fixed top-4 right-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition relative"
                title="Ver carrinho"
            >
                <ShoppingCartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                        {cartItemCount}
                    </span>
                )}
            </button>

            {/* Header com nome do usuário */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-sm text-gray-500">Bem-vindo(a)!</p>
                    <h2 className="text-2xl font-bold text-gray-800 truncate">{firstName}</h2>
                </div>
            </div>

            {/* Campo de busca */}
            <div className="relative mb-6">
                <input 
                    type="text" 
                    placeholder="Buscar por produto ou vendedor..." 
                    className="w-full bg-gray-100 border-none rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            
            {/* Filtros por categoria */}
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Categorias</h3>
            <div className="flex space-x-2 mb-6">
                {['Todos', 'Alimentação', 'Serviços'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Lista de vendedores */}
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Vendedores</h3>
            {filteredVendors.length > 0 ? (
                <div className="space-y-4">
                    {filteredVendors.map(vendor => (
                        <div 
                            key={vendor.id} 
                            onClick={() => { setSelectedVendor(vendor); setScreen('vendor'); }}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4 cursor-pointer hover:shadow-md transition"
                        >
                            <img 
                                src={vendor.logoUrl || `https://placehold.co/64x64/FBBF24/854D0E?text=${(vendor.name || '?').charAt(0)}`} 
                                className="rounded-lg w-16 h-16 object-cover" 
                                alt={`Logo ${vendor.name || 'Vendedor'}`} 
                            />
                            <div>
                                <h4 className="font-bold text-gray-800">{vendor.name || 'Nome não disponível'}</h4>
                                <p className="text-sm text-gray-500">{vendor.location}</p>
                                <div className="flex items-center text-sm text-yellow-500 mt-1">
                                    <StarIcon className="w-4 h-4" />
                                    <span className="ml-1 font-semibold">{vendor.rating}</span>
                                    <span className="text-gray-400 ml-1">({vendor.reviews} avaliações)</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-gray-500 text-center mt-4">Nenhum vendedor encontrado.</p>
            )}
        </div>
    );
};

export default HomeScreen;
