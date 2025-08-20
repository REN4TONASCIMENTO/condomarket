import React, { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../../firebase/firebase';
import { translateAuthError, isPasswordStrong } from '../../utils/authHelpers';
import { StoreIcon, GoogleIcon, ArrowLeftIcon } from '../Shared/icons';

const createUserProfile = async (user, role, name, location, phone) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: name || user.displayName || '',
        role: role,
        location: location || '',
        phone: phone || ''
    });

    if (role === 'vendor') {
        const vendorRef = doc(db, 'vendors', user.uid);
        await setDoc(vendorRef, {
            ownerId: user.uid,
            name: `${name || user.displayName || 'Nova Loja'}`,
            description: 'Descreva a sua loja aqui.',
            location: location || 'Bloco X, Ap Y',
            phone: phone || '',
            rating: 0,
            reviews: 0,
            category: 'Serviços', // Categoria padrão
            loyaltyEnabled: true // Padrão
        });
    }
};


const AuthScreen = ({ setScreen, screen }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleEmailPasswordAuth = async () => {
        setError(''); setMessage('');
        if (screen === 'register') {
            if (!name || !location || !phone) {
                setError('Todos os campos são obrigatórios.');
                return;
            }
            if (!isPasswordStrong(password)) {
                setError('A senha deve ter 8 ou mais caracteres: letras maiúsculas, minúsculas, números e caracteres especiais.');
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                await createUserProfile(userCredential.user, role, name, location, phone);
            } catch (err) { setError(translateAuthError(err.code)); }
        } else {
            try { await signInWithEmailAndPassword(auth, email, password); } catch (err) { setError(translateAuthError(err.code)); }
        }
    };

    const handleGoogleAuth = async () => {
        setError(''); setMessage('');
        try { await signInWithPopup(auth, googleProvider); } catch (err) { setError(translateAuthError(err.code)); }
    };

    const handlePasswordReset = async () => {
        setError(''); setMessage('');
        if (!email) {
            setError('Por favor, insira o seu e-mail.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('E-mail de redefinição enviado! Verifique a sua caixa de entrada.');
        } catch (err) {
            setError(translateAuthError(err.code));
        }
    };

    if (screen === 'resetPassword') {
        return (
            <div className="flex flex-col justify-center p-8 flex-grow animate-fade-in">
                <div className="flex items-center mb-8">
                    <button onClick={() => setScreen('login')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2"><ArrowLeftIcon /></button>
                    <h1 className="text-2xl font-bold text-gray-800 ml-4">Redefinir Senha</h1>
                </div>
                <p className="text-gray-600 mb-4">Insira o seu e-mail para receber um link de redefinição de senha.</p>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500" placeholder="E-mail" />
                {message && <p className="text-green-600 text-sm mt-4 text-center">{message}</p>}
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                <button onClick={handlePasswordReset} className="w-full bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-600 transition mt-6">Enviar E-mail</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center p-8 flex-grow animate-fade-in">
            {screen === 'login' ? (
                <div className="text-center mb-10"><StoreIcon /><h1 className="text-3xl font-bold text-gray-800">Bem-vindo(a)!</h1><p className="text-gray-600 mt-2">Faça login para continuar.</p></div>
            ) : (
                <div className="flex items-center mb-8"><button onClick={() => setScreen('login')} className="text-gray-600 hover:text-gray-900 p-2 -ml-2"><ArrowLeftIcon /></button><h1 className="text-2xl font-bold text-gray-800 ml-4">Crie a sua Conta</h1></div>
            )}
            <button onClick={handleGoogleAuth} className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center mb-4"><GoogleIcon />Continuar com Google</button>
            <div className="flex items-center my-4"><hr className="w-full border-gray-300" /><span className="px-2 text-gray-400 text-sm">OU</span><hr className="w-full border-gray-300" /></div>
            <div className="space-y-4">
                {screen === 'register' && <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500" placeholder="Nome completo" />}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500" placeholder="E-mail" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500" placeholder={screen === 'login' ? "Senha" : "Senha forte (8+ caracteres)"} />
                {screen === 'register' && <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500" placeholder="Bloco e Apto (ex: 10/201)" />}
                {screen === 'register' && <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500" placeholder="Telefone (11999998888)" />}
                
                {screen === 'login' && <a href="#" onClick={(e) => { e.preventDefault(); setScreen('resetPassword'); }} className="text-sm text-right block text-indigo-600 hover:underline">Esqueci minha senha</a>}

                {screen === 'register' && (
                    <div>
                        <label className="text-sm font-medium text-gray-700">Eu sou:</label>
                        <div className="flex mt-2 rounded-lg border border-gray-300">
                            <button onClick={() => setRole('customer')} className={`w-1/2 py-2 rounded-l-md ${role === 'customer' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>Cliente</button>
                            <button onClick={() => setRole('vendor')} className={`w-1/2 py-2 rounded-r-md ${role === 'vendor' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}>Vendedor</button>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            <button onClick={handleEmailPasswordAuth} className="w-full bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-600 transition mt-6">{screen === 'register' ? 'Criar Conta' : 'Entrar'}</button>
            <p className="text-sm text-center text-gray-600 mt-8">{screen === 'login' ? "Não tem uma conta? " : "Já tem uma conta? "}<a href="#" onClick={(e) => { e.preventDefault(); setScreen(screen === 'login' ? 'register' : 'login'); }} className="font-semibold text-indigo-600 hover:underline">{screen === 'login' ? "Cadastre-se" : "Entrar"}</a></p>
        </div>
    );
};

export default AuthScreen;