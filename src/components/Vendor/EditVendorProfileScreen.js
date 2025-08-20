import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { ArrowLeftIcon } from '../Shared/icons';

const EditVendorProfileScreen = ({ user, setScreen }) => {
  const [vendorData, setVendorData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    category: 'Serviços',
    loyaltyEnabled: false,
    loyaltySettings: { pointsNeeded: 10, rewardDescription: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch vendor data on mount
  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        const vendorRef = doc(db, 'vendors', user.uid);
        const loyaltyConfigRef = doc(db, 'vendors', user.uid, 'loyaltySettings', 'config');

        const [vendorSnap, loyaltySnap] = await Promise.all([getDoc(vendorRef), getDoc(loyaltyConfigRef)]);

        if (vendorSnap.exists()) {
          const baseData = vendorSnap.data();
          setVendorData({
            ...baseData,
            loyaltySettings: loyaltySnap.exists() ? loyaltySnap.data() : { pointsNeeded: 10, rewardDescription: '' },
            loyaltyEnabled: loyaltySnap.exists(),
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do vendor:', error);
      }
      setLoading(false);
    };

    if (user) fetchVendorData();
  }, [user]);

  // Input handlers
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'loyaltyEnabled') {
      setVendorData((prev) => ({ ...prev, loyaltyEnabled: checked }));
    } else {
      setVendorData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLoyaltyChange = (e) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({
      ...prev,
      loyaltySettings: {
        ...prev.loyaltySettings,
        [name]: name === 'pointsNeeded' ? Number(value) : value,
      },
    }));
  };

  // Save vendor data
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const vendorRef = doc(db, 'vendors', user.uid);
      const loyaltyConfigRef = doc(db, 'vendors', user.uid, 'loyaltySettings', 'config');

      const { loyaltySettings, ...baseVendorData } = vendorData;
      await updateDoc(vendorRef, baseVendorData);

      if (vendorData.loyaltyEnabled) {
        await setDoc(loyaltyConfigRef, loyaltySettings);
      }

      setMessage('Perfil salvo com sucesso!');
      setTimeout(() => setScreen('vendorDashboard'), 1500);
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      setMessage('Não foi possível salvar. Tente novamente.');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex-grow flex items-center justify-center"><p>Carregando perfil...</p></div>;

  return (
    <div className="flex-grow p-6 animate-fade-in pb-24">
      <div className="flex items-center mb-8">
        <button onClick={() => setScreen('vendorDashboard')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 ml-4">Editar Perfil da Loja</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome da Loja</label>
          <input
            name="name"
            value={vendorData.name}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Descrição</label>
          <textarea
            name="description"
            value={vendorData.description}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg p-2 h-24"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Categoria Principal</label>
          <select
            name="category"
            value={vendorData.category}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg p-2 bg-white"
          >
            <option>Alimentação</option>
            <option>Serviços</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Localização (Bloco, Apto)</label>
          <input
            name="location"
            value={vendorData.location}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Telefone</label>
          <input
            name="phone"
            value={vendorData.phone}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg p-2"
            placeholder="11999998888"
          />
        </div>

        {/* Seção de Fidelidade */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <label htmlFor="loyaltyEnabled" className="text-sm font-medium">Ativar Pontos de Fidelidade?</label>
            <input
              type="checkbox"
              name="loyaltyEnabled"
              id="loyaltyEnabled"
              checked={vendorData.loyaltyEnabled}
              onChange={handleChange}
              className="h-6 w-6 cursor-pointer"
            />
          </div>

          {vendorData.loyaltyEnabled && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 animate-fade-in">
              <div>
                <label className="text-sm font-medium">Pontos para recompensa</label>
                <input
                  type="number"
                  name="pointsNeeded"
                  value={vendorData.loyaltySettings.pointsNeeded}
                  onChange={handleLoyaltyChange}
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descrição da Recompensa</label>
                <input
                  type="text"
                  name="rewardDescription"
                  value={vendorData.loyaltySettings.rewardDescription}
                  onChange={handleLoyaltyChange}
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="Ex: Um café grátis"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}

      <div className="mt-8 space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>

        <button
          onClick={() => signOut(auth)}
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-red-600 transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default EditVendorProfileScreen;
