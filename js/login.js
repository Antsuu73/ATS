import { auth, db } from "./firebase-config.js";

import {
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const btn = document.getElementById("googleLogin");
const status = document.getElementById("status");

/* =========================
   GOOGLE LOGIN
========================= */

btn.addEventListener("click", async () => {

    // chống spam click
    if (btn.disabled) return;

    btn.disabled = true;
    status.textContent = "Đang đăng nhập...";

    try {

        const provider = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        /* =========================
           SAVE USER FIRESTORE
        ========================= */

        try {
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName,
                email: user.email,
                photo: user.photoURL,
                lastLogin: Date.now(),
                loginType: "google"
            });
        } catch (err) {
            console.log("Firestore error:", err);
        }

        status.textContent = "Đăng nhập thành công";

        // redirect an toàn
        setTimeout(() => {
            window.location.href = "index.html";
        }, 600);

    } catch (err) {

        console.log(err);

        status.textContent = err.message;

        btn.disabled = false;

    }

});