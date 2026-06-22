import { auth } from "./firebase-config.js";

import {
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

const loginBtn =
    document.getElementById("googleLogin");

const status =
    document.getElementById("status");

loginBtn.addEventListener("click", async () => {

    try {

        status.textContent =
            "Đang đăng nhập...";

        const result =
            await signInWithPopup(auth, provider);

        status.textContent =
            `Xin chào ${result.user.displayName}`;

        setTimeout(() => {

            window.location.href =
                "../index.html";

        }, 1000);

    } catch (error) {

        console.error(error);

        status.textContent =
            "Đăng nhập thất bại";

    }

});