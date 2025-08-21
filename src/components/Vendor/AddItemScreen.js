import React, { useState, useEffect } from 'react';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase.js';
import { ArrowLeftIcon } from '../Shared/icons.js';

const AddItemScreen = ({ user, setScreen, editingItem, setEditingItem }) => {
    const [itemType, setItemType] = useState('product');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [availability, setAvailability] = useState('Pronta Entrega');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const productAvailabilityOptions = ['Pronta Entrega', 'Apenas por Encomenda'];

    // Preencher campos se estiver editando
    useEffect(() => {
        if (editingItem) {
            setItemType(editingItem.type || 'product');
            setName(editingItem.name || '');
            setDescription(editingItem.description || '');
            setPrice(editingItem.price || '');
            setAvailability(editingItem.availability || 'Pronta Entrega');
            setImageUrl(editingItem.imageUrl || '');
        } else {
            // Resetar o formulário
            setItemType('product');
            setName('');
            setDescription('');
            setPrice('');
            setAvailability('Pronta Entrega');
            setImageUrl('');
            setImageFile(null);
            setUploadProgress(0);
        }
    }, [editingItem]);

    // Upload seguro da imagem
    const uploadImage = (file) => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `products/${user.uid}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                snapshot => {
                    setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                },
                error => reject(error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImageUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSaveItem = async () => {
        if (!name || (itemType === 'product' && (!price || isNaN(price)))) {
            setError('Nome e Preço são obrigatórios. Preço deve ser um número para produtos.');
            return;
        }

        setLoading(true);
        setError('');

        let finalImageUrl = editingItem ? editingItem.imageUrl : '';

        if (imageFile) {
            try {
                finalImageUrl = await uploadImage(imageFile);
            } catch (err) {
                setError('Falha no upload da imagem.');
                setLoading(false);
                return;
            }
        }

        const itemData = {
            type: itemType,
            name,
            description,
            price: itemType === 'product' ? parseFloat(price) : price,
            availability: itemType === 'product' ? availability : '',
            imageUrl: finalImageUrl
        };

        try {
            if (editingItem) {
                const itemRef = doc(db, 'vendors', user.uid, 'products', editingItem.id);
                await updateDoc(itemRef, itemData);
            } else {
                const itemsRef = collection(db, 'vendors', user.uid, 'products');
                await addDoc(itemsRef, itemData);
            }
            setEditingItem(null);
            setScreen('vendorDashboard');
        } catch (err) {
            setError('Não foi possível salvar o item. Tente novamente.');
        }

        setLoading(false);
    };

    return (
        <div className="flex-grow p-6 animate-fade-in">
            <div className="flex items-center mb-8">
                <button
                    onClick={() => { setEditingItem(null); setScreen('vendorDashboard'); }}
                    className="text-gray-600 hover:text-gray-900 p-2 -ml-2"
                    aria-label="Voltar"
                >
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-2xl font-bold text-gray-800 ml-4">{editingItem ? 'Editar Item' : 'Adicionar Novo Item'}</h1>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="itemType" className="text-sm font-medium">O que você está adicionando?</label>
                    <div id="itemType" className="flex mt-2 rounded-lg border border-gray-300">
                        <button
                            onClick={() => setItemType('product')}
                            className={`w-1/2 py-2 rounded-l-md ${itemType === 'product' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                        >Produto</button>
                        <button
                            onClick={() => setItemType('service')}
                            className={`w-1/2 py-2 rounded-r-md ${itemType === 'service' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                        >Serviço</button>
                    </div>
                </div>

                <div>
                    <label htmlFor="name" className="text-sm font-medium">Nome</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="mt-1 w-full border rounded-lg p-2"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="mt-1 w-full border rounded-lg p-2"
                    />
                </div>

                <div>
                    <label htmlFor="price" className="text-sm font-medium">{itemType === 'product' ? 'Preço (ex: 25.50)' : 'Preço (ex: 50 ou "Sob consulta")'}</label>
                    <input
                        id="price"
                        type={itemType === 'product' ? 'number' : 'text'}
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="mt-1 w-full border rounded-lg p-2"
                    />
                </div>

                {itemType === 'product' && (
                    <div>
                        <label htmlFor="availability" className="text-sm font-medium">Disponibilidade</label>
                        <select
                            id="availability"
                            value={availability}
                            onChange={e => setAvailability(e.target.value)}
                            className="mt-1 w-full border rounded-lg p-2 bg-white"
                        >
                            {productAvailabilityOptions.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="image" className="text-sm font-medium">Imagem (Opcional)</label>
                    <input
                        id="image"
                        type="file"
                        onChange={handleImageChange}
                        className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {imageUrl && <img src={imageUrl} alt="Pré-visualização" className="mt-2 rounded-lg w-32 h-32 object-cover"/>}
                    {loading && uploadProgress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div>
                        </div>
                    )}
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

            <button
                onClick={handleSaveItem}
                disabled={loading || (uploadProgress > 0 && uploadProgress < 100)}
                className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
                {loading ? 'Salvando...' : 'Salvar Item'}
            </button>
        </div>
    );
};

export default AddItemScreen;
