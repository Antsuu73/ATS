import { auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    sanitizeUrl,
    getDefaultAvatar
} from "./security.js";

const loginBtn = document.getElementById("loginBtn");
const userBox = document.getElementById("userBox");
const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

function renderLoggedInUser(user) {
    if (!loginBtn || !userBox || !userDisplay) return;

    loginBtn.style.display = "none";
    userBox.style.display = "flex";
    userDisplay.textContent = "";

    const name = user.displayName || user.email || "User";
    const photo = sanitizeUrl(user.photoURL, getDefaultAvatar(80));

    const link = document.createElement("a");
    link.href = "profile.html";
    link.className = "user-profile-link";
    link.title = "Xem hồ sơ";

    const img = document.createElement("img");
    img.src = photo;
    img.alt = name;
    img.className = "user-avatar";
    img.referrerPolicy = "no-referrer";

    const span = document.createElement("span");
    span.className = "user-name";
    span.textContent = name;

    link.append(img, span);
    userDisplay.append(link);
}

function renderLoggedOut() {
    if (!loginBtn || !userBox || !userDisplay) return;

    loginBtn.style.display = "";
    userBox.style.display = "none";
    userDisplay.textContent = "";
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        renderLoggedInUser(user);
    } else {
        renderLoggedOut();
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error("Logout error:", err);
        }
    });
}

export function waitForAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}
