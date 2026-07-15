import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mockhireai-b11f0.firebaseapp.com",
  projectId: "mockhireai-b11f0",
  storageBucket: "mockhireai-b11f0.firebasestorage.app",
  messagingSenderId: "124086401385",
  appId: "1:124086401385:web:dbb5417bfe27131938e5f8"
};

const app = initializeApp(firebaseConfig);

const auth=getAuth(app)

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

export {auth,provider}

