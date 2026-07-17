import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mockhireai-8f59c.firebaseapp.com",
  projectId: "mockhireai-8f59c",
  storageBucket: "mockhireai-8f59c.firebasestorage.app",
  messagingSenderId: "92409906452",
  appId: "1:92409906452:web:59b4bdf8b79fedbc7fae01"
};

const app = initializeApp(firebaseConfig);

const auth=getAuth(app)

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

export {auth,provider}

