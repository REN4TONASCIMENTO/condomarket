import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase/firebase';
import { ArrowLeftIcon } from '../Shared/icons';

const EditUserProfileScreen = ({ user, userProfile, setScreen }) => {
    const [profileData, setProfileData] = useState({ displayName: '', phone: '', location: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setProfileData({
            displayName: userProfile.displayName || '',
            phone: userProfile.phone || '',
            location: userProfile.location || ''
        });
        setLoading(false);
    }, [userProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, profileData);
            await updateProfile(auth.currentUser, { displayName: profileData.displayName });
            setMessage('Perfil salvo com sucesso!');
            setTimeout(() => setScreen('userProfile'), 1500);
        } catch (error) {
            console.error("Erro ao salvar o perfil:", error);
            setMessage('Não foi possível salvar. Tente novamente.');
        }
        setSaving(false);
    };

    if (loading) return <div className="flex-grow flex items-center justify-center"><p>Carregando perfil...</p></div>;

    return (
        <div className="flex-grow p-6 animate-fade-in">
            <div className="flex items-center mb-8">
                <button onClick={() => setScreen('userProfile')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2"><ArrowLeftIcon /></button>
                <h1 className="text-2xl font-bold text-gray-800 ml-4">Editar Meu Perfil</h1>
            </div>
            <div className="space-y-4">
                <div><label className="text-sm font-medium">Nome Completo</label><input name="displayName" value={profileData.displayName} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" /></div>
                <div><label className="text-sm font-medium">Localização (Bloco, Apto)</label><input name="location" value={profileData.location} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" /></div>
                <div><label className="text-sm font-medium">Telefone</label><input name="phone" value={profileData.phone} onChange={handleChange} className="mt-1 w-full border rounded-lg p-2" placeholder="11999998888" /></div>
            </div>
            {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
            <button onClick={handleSave} disabled={saving} className="mt-8 w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
    );
};

export default EditUserProfileScreen;