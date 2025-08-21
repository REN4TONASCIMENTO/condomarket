import React, { useState, useEffect, useCallback } from 'react';
import { getDoc, doc, collection, getDocs, updateDoc, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { ArrowLeftIcon } from '../Shared/icons.js';

const LoyaltyPointsScreen = ({ userProfile, setScreen }) => {
    const [loyaltyData, setLoyaltyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLoyaltyData = useCallback(async () => {
        setLoading(true);
        try {
            // Buscar todos os vendedores
            const vendorsRef = collection(db, 'vendors');
            const vendorsSnapshot = await getDocs(vendorsRef);
            const allVendors = vendorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Para cada vendedor, garantir registro de pontos do usuário
            const pointsPromises = allVendors.map(async (vendor) => {
                const userPointsRef = doc(db, 'users', userProfile.uid, 'loyaltyPoints', vendor.id);
                const userPointsSnap = await getDoc(userPointsRef);

                if (!userPointsSnap.exists()) {
                    await setDoc(userPointsRef, { points: 0 });
                }

                const loyaltyConfigRef = doc(db, 'vendors', vendor.id, 'loyaltySettings', 'config');
                const configSnap = await getDoc(loyaltyConfigRef);

                return {
                    vendorId: vendor.id,
                    vendorName: vendor.name || "Loja",
                    points: userPointsSnap.exists() ? userPointsSnap.data().points : 0,
                    settings: configSnap.exists() ? configSnap.data() : null
                };
            });

            const enrichedData = await Promise.all(pointsPromises);
            setLoyaltyData(enrichedData);
        } catch (error) {
            console.error("Erro ao carregar pontos de fidelidade:", error);
        }
        setLoading(false);
    }, [userProfile]);

    useEffect(() => {
        if (userProfile) fetchLoyaltyData();
    }, [userProfile, fetchLoyaltyData]);

    const handleRedeem = async (vendorId, requiredPoints, userPoints) => {
        if (userPoints < requiredPoints) return;

        try {
            const userPointsRef = doc(db, 'users', userProfile.uid, 'loyaltyPoints', vendorId);
            await updateDoc(userPointsRef, { points: userPoints - requiredPoints });

            const redemptionRef = collection(db, 'vendors', vendorId, 'redemptions');
            await addDoc(redemptionRef, {
                userId: userProfile.uid,
                redeemedAt: serverTimestamp(),
            });

            alert('Resgate realizado com sucesso!');
            fetchLoyaltyData();
        } catch (error) {
            console.error("Erro ao resgatar pontos:", error);
            alert('Erro ao realizar resgate. Tente novamente.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex items-center p-4 bg-white shadow">
                <button onClick={() => setScreen("home")} className="mr-2">
                    <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className="text-lg font-bold">Meus Pontos de Fidelidade</h1>
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    <p>Carregando...</p>
                ) : loyaltyData.length === 0 ? (
                    <p>Você ainda não possui pontos de fidelidade.</p>
                ) : (
                    loyaltyData.map((data, index) => (
                        <div key={index} className="bg-white shadow rounded-lg p-4">
                            <h2 className="text-md font-semibold">{data.vendorName}</h2>
                            <p className="text-sm text-gray-500">{data.points} pontos</p>
                            {data.settings ? (
                                <div>
                                    <p className="text-sm">
                                        Resgate disponível a cada {data.settings.pointsNeeded} pontos
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                                        <div
                                            className="bg-green-500 h-2.5 rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    (data.points / data.settings.pointsNeeded) * 100,
                                                    100
                                                )}%`
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRedeem(data.vendorId, data.settings.pointsNeeded, data.points)}
                                        disabled={data.points < data.settings.pointsNeeded}
                                        className={`mt-2 px-3 py-1 rounded ${
                                            data.points >= data.settings.pointsNeeded
                                                ? "bg-green-600 text-white"
                                                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        }`}
                                    >
                                        Resgatar
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    Nenhuma configuração de fidelidade disponível.
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LoyaltyPointsScreen;
