import React, { useState, useEffect, useRef, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase/firebase.js';
import { ArrowLeftIcon } from '../Shared/icons.js';

const EditVendorProfileScreen = ({ user, vendorProfile, setScreen }) => {
    const [profileData, setProfileData] = useState({
        name: '', phone: '', location: '', description: '', category: 'Serviços',
        loyaltyEnabled: true,
        loyaltySettings: { pointsNeeded: 10, rewardDescription: '' }
    });
    // Estados para as imagens
    const [logoFile, setLogoFile] = useState(null);
    const [headerFile, setHeaderFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [headerPreview, setHeaderPreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const timeoutRef = useRef(null);

    const categoryOptions = ['Serviços', 'Alimentação'];

    useEffect(() => {
        if (vendorProfile) {
            setProfileData({
                name: vendorProfile.name || '',
                phone: vendorProfile.phone || '',
                location: vendorProfile.location || '',
                description: vendorProfile.description || 'Descreva sua loja aqui.',
                category: vendorProfile.category || 'Serviços',
                loyaltyEnabled: vendorProfile.loyaltyEnabled ?? true,
                loyaltySettings: vendorProfile.loyaltySettings || { pointsNeeded: 10, rewardDescription: '' }
            });
            setLogoPreview(vendorProfile.logoUrl || '');
            setHeaderPreview(vendorProfile.headerUrl || '');
        }
        setLoading(false);
        return () => clearTimeout(timeoutRef.current);
    }, [vendorProfile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "pointsNeeded" || name === "rewardDescription") {
            setProfileData(prev => ({ ...prev, loyaltySettings: { ...prev.loyaltySettings, [name]: value } }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handleFileChange = (e, setFile, setPreview) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = (imageType) => {
        if (imageType === 'logo') {
            setLogoFile(null);
            setLogoPreview('');
        } else if (imageType === 'header') {
            setHeaderFile(null);
            setHeaderPreview('');
        }
    };

    // --- CORREÇÃO APLICADA AQUI: Função de upload mais robusta ---
    const uploadImage = useCallback((file, path) => {
        return new Promise((resolve, reject) => {
            if (!user?.uid) {
                return reject(new Error("Utilizador não autenticado."));
            }

            const uploadTimeout = setTimeout(() => {
                uploadTask.cancel();
                reject(new Error("O upload demorou muito. Verifique sua conexão e as regras de segurança do Firebase Storage."));
            }, 60000); // Timeout de 60 segundos

            const storageRef = ref(storage, `${path}/${user.uid}/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    clearTimeout(uploadTimeout);
                    console.error("Erro detalhado do Firebase Storage:", error);
                    let friendlyError = "Falha no upload da imagem. Tente novamente.";
                    if (error.code === 'storage/unauthorized') {
                        friendlyError = "Erro de permissão. Verifique as regras de segurança do seu Firebase Storage.";
                    }
                    reject(new Error(friendlyError));
                },
                async () => {
                    clearTimeout(uploadTimeout);
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (e) {
                        reject(e);
                    }
                }
            );
        });
    }, [user]);
    // --------------------------------------------------------------------

    const handleSave = async () => {
        setError('');
        if (!profileData.name.trim()) {
            setError('O nome da loja é obrigatório.');
            return;
        }
        setSaving(true);
        setUploadProgress(0);

        try {
            let logoUrl = logoPreview;
            let headerUrl = headerPreview;

            if (logoFile) {
                logoUrl = await uploadImage(logoFile, 'vendor_logos');
            }
            if (headerFile) {
                headerUrl = await uploadImage(headerFile, 'vendor_headers');
            }

            const dataToSave = {
                ...profileData,
                logoUrl,
                headerUrl
            };

            const vendorRef = doc(db, 'vendors', user.uid);
            await updateDoc(vendorRef, dataToSave);
            await updateProfile(auth.currentUser, { displayName: profileData.name });

            setMessage('Perfil salvo com sucesso!');
            timeoutRef.current = setTimeout(() => setScreen('vendorDashboard'), 1500);
        } catch (error) {
            console.error('Erro ao salvar o perfil:', error);
            setError(error.message || 'Não foi possível salvar. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex-grow flex items-center justify-center"><p>Carregando perfil...</p></div>;

    return (
        <div className="flex-grow p-6 animate-fade-in">
            <div className="flex items-center mb-8">
                <button onClick={() => setScreen('vendorDashboard')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2" aria-label="Voltar"><ArrowLeftIcon /></button>
                <h1 className="text-2xl font-bold text-gray-800 ml-4">Editar Perfil da Loja</h1>
            </div>

            <div className="space-y-4">
                {/* Campos de Perfil Padrão */}
                <div>
                    <label htmlFor="name" className="text-sm font-medium">Nome da Loja</label>
                    <input id="name" name="name" value={profileData.name} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" />
                </div>

                {/* UPLOADS DE IMAGEM COM BOTÃO DE REMOVER */}
                <div className="space-y-4 pt-4 border-t">
                    <div>
                        <label htmlFor="logo" className="text-sm font-medium">Logótipo da Loja</label>
                        <input id="logo" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview)} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        {logoPreview && (
                            <div className="mt-2 flex items-center space-x-4">
                                <img src={logoPreview} alt="Pré-visualização do logótipo" className="rounded-full w-24 h-24 object-cover"/>
                                <button onClick={() => handleRemoveImage('logo')} className="text-sm text-red-500 hover:underline">Remover</button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="header" className="text-sm font-medium">Imagem de Capa</label>
                        <input id="header" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setHeaderFile, setHeaderPreview)} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        {headerPreview && (
                            <div className="mt-2">
                                <img src={headerPreview} alt="Pré-visualização da capa" className="rounded-lg w-full h-32 object-cover"/>
                                <button onClick={() => handleRemoveImage('header')} className="text-sm text-red-500 hover:underline mt-1">Remover</button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div>
                    <label htmlFor="location" className="text-sm font-medium">Localização (Bloco, Apto)</label>
                    <input id="location" name="location" value={profileData.location} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" placeholder="Bloco X, Ap Y" />
                </div>
                <div>
                    <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
                    <input id="phone" name="phone" value={profileData.phone} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" placeholder="11999998888" />
                </div>
                <div>
                    <label htmlFor="description" className="text-sm font-medium">Descrição da Loja</label>
                    <textarea id="description" name="description" value={profileData.description} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" rows="3" />
                </div>
                <div>
                    <label htmlFor="category" className="text-sm font-medium">Categoria</label>
                    <select id="category" name="category" value={profileData.category} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2 bg-white">
                        {categoryOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                    </select>
                </div>

                {/* Seção de Fidelidade */}
                <div className="space-y-2 pt-2 border-t mt-4">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="loyaltyEnabled" name="loyaltyEnabled" checked={profileData.loyaltyEnabled} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <label htmlFor="loyaltyEnabled" className="text-sm font-medium">Habilitar Programa de Fidelidade</label>
                    </div>
                    
                    {profileData.loyaltyEnabled && (
                        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50 animate-fade-in">
                            <h3 className="font-semibold text-gray-700 text-sm">Configurar Fidelidade</h3>
                            <div>
                                <label htmlFor="pointsNeeded" className="text-sm font-medium">Pontos para Resgate</label>
                                <input id="pointsNeeded" name="pointsNeeded" type="number" value={profileData.loyaltySettings.pointsNeeded} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" placeholder="Ex: 10" />
                            </div>
                            <div>
                                <label htmlFor="rewardDescription" className="text-sm font-medium">Descrição da Recompensa</label>
                                <input id="rewardDescription" name="rewardDescription" type="text" value={profileData.loyaltySettings.rewardDescription} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" placeholder="Ex: Um café grátis" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Barra de Progresso do Upload */}
            {saving && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div>
                </div>
            )}

            {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

            <button onClick={handleSave} disabled={saving} className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
    );
};

export default EditVendorProfileScreen;
