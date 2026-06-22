import { auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const userBox = document.getElementById("userBox");
const userDisplay = document.getElementById("userDisplay");
const logoutBtn = document.getElementById("logoutBtn");

function renderLoggedInUser(user) {
    if (!loginBtn || !userBox || !userDisplay) return;

    loginBtn.style.display = "none";
    userBox.style.display = "flex";

    const name = user.displayName || user.email || "User";
    const photo = user.photoURL || "https://www.gravatar.com/avatar?d=mp&s=80";

    userDisplay.innerHTML = `
        <a href="profile.html" class="user-profile-link" title="Xem hồ sơ">
            <img src="${photo}" alt="${name}" class="user-avatar" referrerpolicy="no-referrer">
            <span class="user-name">${name}</span>
        </a>
    `;
}

function renderLoggedOut() {
    if (!loginBtn || !userBox || !userDisplay) return;

    loginBtn.style.display = "";
    userBox.style.display = "none";
    userDisplay.innerHTML = "";
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
