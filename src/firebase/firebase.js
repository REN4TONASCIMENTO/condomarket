// src/firebase/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseKeys } from '../firebaseKeys.js';

// 2. Usa o objeto importado diretamente
const firebaseConfig = firebaseKeys;

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Instâncias principais
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Exporta apenas o necessário
export { auth, db, storage, googleProvider };