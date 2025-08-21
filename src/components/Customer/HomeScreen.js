import React, { useState, useEffect, useMemo } from 'react';
import { SearchIcon, StarIcon } from '../Shared/icons.js';

const HomeScreen = ({ userProfile, setScreen, vendors, setSelectedVendor }) => {
    const [filter, setFilter] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Garante que userProfile não seja nulo antes de acessar suas propriedades
    const firstName = userProfile?.displayName ? userProfile.displayName.split(' ')[0] : userProfile?.email;

    useEffect(() => {
        // Força o preenchimento do perfil se o nome ou o papel não estiverem definidos
        if (userProfile && (!userProfile.role || !userProfile.displayName)) {
            setScreen('editUserProfile');
        }
    }, [userProfile, setScreen]);

    const categories = useMemo(() => ['Todos', ...Array.from(new Set(vendors.map(v => v.category).filter(Boolean)))], [vendors]);

    const filteredVendors = useMemo(() => {
        return vendors.filter(vendor => {
            const categoryMatch = filter === 'Todos' || vendor.category === filter;
            const searchMatch = !searchTerm || 
                vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.category?.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && searchMatch;
        });
    }, [vendors, filter, searchTerm]);

    return (
        <div className="flex-grow p-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-sm text-gray-500">Bem-vindo(a)!</p>
                    <h2 className="text-2xl font-bold text-gray-800 truncate">{firstName}</h2>
                </div>
            </div>

            {/* Busca */}
            <div className="relative mb-6">
                <input 
                    type="text" 
                    placeholder="Buscar por produto, vendedor ou categoria..." 
                    className="w-full bg-gray-100 border-none rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Campo de busca"
                />
                <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            
            {/* Categorias */}
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Categorias</h3>
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2"> {/* Adicionado pb-2 para melhor visualização da rolagem */}
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${filter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        aria-label={`Filtrar por categoria ${cat}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Vendedores */}
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Vendedores</h3>
            {filteredVendors.length > 0 ? (
                <div className="space-y-4">
                    {filteredVendors.map(vendor => (
                        <div 
                            key={vendor.id} 
                            onClick={() => setSelectedVendor(vendor)}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4 cursor-pointer hover:shadow-md transition"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedVendor(vendor)}
                        >
                            <img 
                                src={vendor.logoUrl || `https://placehold.co/64x64/FBBF24/854D0E?text=${(vendor.name || '?').charAt(0)}`} 
                                className="rounded-lg w-16 h-16 object-cover" 
                                alt={`Logo ${vendor.name || 'Vendedor'}`} 
                            />
                            <div className="flex-grow">
                                <h4 className="font-bold text-gray-800">{vendor.name || 'Nome não disponível'}</h4>
                                <p className="text-sm text-gray-500">{vendor.location || 'Localização não informada'}</p>
                                <div className="flex items-center text-sm text-yellow-500 mt-1">
                                    <StarIcon className="w-4 h-4" />
                                    <span className="ml-1 font-semibold">{vendor.rating || 0}</span>
                                    <span className="text-gray-400 ml-1">({vendor.reviews || 0} avaliações)</span>
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
