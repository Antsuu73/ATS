import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBn4ClqOck2torfkDpbIFJLycKBagmiGw8",
    authDomain: "ats-2f1b4.firebaseapp.com",
    projectId: "ats-2f1b4",
    storageBucket: "ats-2f1b4.firebasestorage.app",
    messagingSenderId: "448832019093",
    appId: "1:448832019093:web:b04f8d736b489e084c599c",
    measurementId: "G-HQX6783Z35"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase loaded");