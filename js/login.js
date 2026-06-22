import { auth, db } from "./firebase-config.js";
import {
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
    sanitizeUserProfile,
    safeRedirect,
    getSafeAuthErrorMessage
} from "./security.js";

const btn = document.getElementById("googleLogin");
const status = document.getElementById("status");

const redirectTarget = safeRedirect(
    new URLSearchParams(window.location.search).get("redirect"),
    "index.html"
);

btn.addEventListener("click", async () => {
    if (btn.disabled) return;

    btn.disabled = true;
    status.textContent = "Đang đăng nhập...";

    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });

        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const profile = sanitizeUserProfile(user);

        if (profile) {
            try {
                await setDoc(doc(db, "users", user.uid), profile, { merge: true });
            } catch (err) {
                console.error("Firestore error:", err);
            }
        }

        status.textContent = "Đăng nhập thành công";

        setTimeout(() => {
            window.location.replace(redirectTarget);
        }, 600);
    } catch (err) {
        console.error("Login error:", err);
        status.textContent = getSafeAuthErrorMessage(err);
        btn.disabled = false;
    }
});
