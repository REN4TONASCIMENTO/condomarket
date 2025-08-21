import React, { useState, useCallback } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../firebase/firebase.js';
import { translateAuthError, isPasswordStrong } from '../../utils/authHelpers.js';
import { StoreIcon, GoogleIcon, ArrowLeftIcon } from '../Shared/icons.js';
import RoleSelectionScreen from './RoleSelectionScreen.js';

// Função para criar perfil no Firestore
const createUserProfile = async (user, role, name) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: name || user.displayName || '',
        role: role,
        location: '',
        phone: ''
    });

    if (role === 'vendor') {
        const vendorRef = doc(db, 'vendors', user.uid);
        await setDoc(vendorRef, {
            ownerId: user.uid,
            name: name || user.displayName || 'Nova Loja',
            description: 'Descreva a sua loja aqui.',
            location: 'Bloco X, Ap Y',
            phone: '',
            rating: 0,
            reviews: 0,
            category: 'Serviços',
            loyaltyEnabled: true,
            loyaltySettings: { pointsNeeded: 10, rewardDescription: '' }
        });
    }
};

const AuthScreen = ({ setScreen, screen }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authUser, setAuthUser] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [role, setRole] = useState('customer'); // 1. Estado para a função do utilizador

    const handleEmailPasswordAuth = useCallback(async () => {
        setError('');
        setMessage('');

        if (screen === 'register') {
            if (!name) { setError('Digite seu nome'); return; }
            if (!isPasswordStrong(password)) {
                setError('A senha deve ter 8+ caracteres com letras maiúsculas, minúsculas, números e símbolos.');
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                // 2. Cria o perfil com a função selecionada imediatamente
                await createUserProfile(userCredential.user, role, name);
                // O App.jsx irá detetar o novo utilizador e redirecionar
            } catch (err) {
                setError(translateAuthError(err.code));
            }
        } else {
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (err) {
                setError(translateAuthError(err.code));
            }
        }
    }, [screen, name, email, password, role, setScreen, setError]);

    const handleGoogleAuth = useCallback(async () => {
        setError('');
        setMessage('');
        try {
            const userCredential = await signInWithPopup(auth, googleProvider);
            setAuthUser(userCredential.user);
            setScreen('selectRole'); // Para o Google, a seleção de função acontece depois
        } catch (err) {
            setError(translateAuthError(err.code));
        }
    }, [setAuthUser, setScreen, setError]);

    const handlePasswordReset = useCallback(async () => {
        setError('');
        setMessage('');
        if (!email) { setError('Insira seu e-mail'); return; }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('E-mail enviado!');
        } catch (err) {
            setError(translateAuthError(err.code));
        }
    }, [email, setError, setMessage]);

    const handleRoleSelected = useCallback(async (selectedRole) => {
        if (!authUser) return;
        await createUserProfile(authUser, selectedRole, authUser.displayName);
        // O App.jsx irá detetar a mudança e redirecionar
    }, [authUser]);

    if (screen === 'resetPassword') {
        return (
            <div className="flex flex-col justify-center p-8 flex-grow animate-fade-in">
                <div className="flex items-center mb-8">
                    <button onClick={() => setScreen('login')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2"><ArrowLeftIcon /></button>
                    <h1 className="text-2xl font-bold text-gray-800 ml-4">Redefinir Senha</h1>
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-2 mb-4" placeholder="E-mail" />
                {message && <p className="text-green-600 text-sm text-center">{message}</p>}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button onClick={handlePasswordReset} className="w-full bg-indigo-500 text-white py-3 rounded-lg">Enviar E-mail</button>
            </div>
        );
    }

    if (screen === 'selectRole' && authUser) {
        return <RoleSelectionScreen user={authUser} onRoleSelected={handleRoleSelected} />;
    }

    return (
        <div className="flex flex-col justify-center p-8 flex-grow animate-fade-in">
            {screen === 'login' ? (
                <div className="text-center mb-10"><StoreIcon /><h1 className="text-3xl font-bold text-gray-800">Bem-vindo(a)!</h1></div>
            ) : (
                <div className="flex items-center mb-8"><button onClick={() => setScreen('login')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2"><ArrowLeftIcon /></button><h1 className="text-2xl font-bold text-gray-800 ml-4">Crie a sua Conta</h1></div>
            )}
            <button onClick={handleGoogleAuth} className="w-full bg-indigo-600 text-white py-3 rounded-lg flex items-center justify-center mb-4"><GoogleIcon />Continuar com Google</button>
            <div className="flex items-center my-4"><hr className="w-full border-gray-300" /><span className="px-2 text-gray-400 text-sm">OU</span><hr className="w-full border-gray-300" /></div>
            <div className="space-y-4">
                {screen === 'register' && (
                    <>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" placeholder="Nome completo" />
                        
                        {/* --- CORREÇÃO APLICADA AQUI --- */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Eu sou:</label>
                            <div className="flex mt-2 rounded-lg border border-gray-300">
                                <button
                                    type="button"
                                    onClick={() => setRole('customer')}
                                    className={`w-1/2 py-2 rounded-l-md transition ${role === 'customer' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    Cliente
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('vendor')}
                                    className={`w-1/2 py-2 rounded-r-md transition ${role === 'vendor' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                                >
                                    Vendedor
                                </button>
                            </div>
                        </div>
                        {/* ----------------------------- */}
                    </>
                )}
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-2" placeholder="E-mail" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg p-2" placeholder={screen==='login' ? 'Senha' : 'Senha forte'} />
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            <button onClick={handleEmailPasswordAuth} className="w-full bg-indigo-500 text-white py-3 rounded-lg mt-6">{screen === 'register' ? 'Criar Conta' : 'Entrar'}</button>
            
            {screen === 'login' && (
                <p className="text-sm text-center mt-4">
                    <button onClick={() => setScreen('resetPassword')} className="bg-transparent border-none p-0 text-indigo-600 hover:underline cursor-pointer">
                        Esqueci minha senha
                    </button>
                </p>
            )}

            <p className="text-sm text-center mt-4 text-gray-600">
                {screen === 'login' ? (
                    <>
                        Não tem uma conta?{' '}
                        <button onClick={() => setScreen('register')} className="font-semibold text-indigo-600 hover:underline">
                            Cadastre-se
                        </button>
                    </>
                ) : (
                    <>
                        Já tem uma conta?{' '}
                        <button onClick={() => setScreen('login')} className="font-semibold text-indigo-600 hover:underline">
                            Entrar
                        </button>
                    </>
                )}
            </p>
        </div>
    );
};

export default AuthScreen;
