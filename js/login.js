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

function showStatus(message, isError = false) {
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#dc2626" : "#16a34a";
}

if (window.location.protocol === "file:") {
    showStatus("Hãy chạy qua local server (Live Server), không mở file HTML trực tiếp.", true);
    if (btn) btn.disabled = true;
} else if (!btn) {
    showStatus("Không tìm thấy nút đăng nhập.", true);
} else {
    btn.addEventListener("click", async () => {
        if (btn.disabled) return;

        btn.disabled = true;
        showStatus("Đang đăng nhập...");

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
                    // Auth vẫn thành công dù lưu profile lỗi
                }
            }

            showStatus("Đăng nhập thành công");

            setTimeout(() => {
                window.location.replace(redirectTarget);
            }, 600);
        } catch (err) {
            console.error("Login error:", err);
            showStatus(getSafeAuthErrorMessage(err), true);
            btn.disabled = false;
        }
    });
}
