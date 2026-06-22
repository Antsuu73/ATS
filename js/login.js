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
   GOOGLE LOGIN
========================= */

const googleBtn = document.getElementById("googleLogin");

googleBtn.addEventListener("click", async () => {

    const provider = new GoogleAuthProvider();

    try {

        document.getElementById("status").textContent = "Đang đăng nhập...";

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            loginType: "google"
        });

        document.getElementById("status").textContent = "Thành công";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } catch (err) {

        document.getElementById("status").textContent = err.message;

    }

});

/* =========================
   NORMAL LOGIN (FAKE)
========================= */

const normalBtn = document.getElementById("normalLogin");

normalBtn.addEventListener("click", () => {

    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const cls = document.getElementById("class").value;
    const pass = document.getElementById("password").value;

    const status = document.getElementById("status");

    if (!name || !username || !cls || !pass) {
        status.textContent = "Nhập đủ thông tin";
        return;
    }

    // lưu tạm local
    const userData = {
        name,
        username,
        class: cls,
        loginType: "normal"
    };

    localStorage.setItem("user", JSON.stringify(userData));

    status.textContent = "Đăng nhập thành công";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 800);

});