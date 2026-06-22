import { auth, db } from "./firebase-config.js";
import { waitForAuth } from "./auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const profileCard = document.getElementById("profileCard");
const profileLoading = document.getElementById("profileLoading");

function formatDate(timestamp) {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleString("vi-VN");
}

function renderProfile(user, firestoreData) {
    const name = firestoreData?.name || user.displayName || "—";
    const email = firestoreData?.email || user.email || "—";
    const photo = firestoreData?.photo || user.photoURL || "https://www.gravatar.com/avatar?d=mp&s=200";
    const loginType = firestoreData?.loginType || "google";
    const lastLogin = formatDate(firestoreData?.lastLogin);

    profileCard.innerHTML = `
        <img src="${photo}" alt="${name}" class="profile-avatar" referrerpolicy="no-referrer">
        <h1 class="profile-name">${name}</h1>
        <p class="profile-email">${email}</p>

        <div class="profile-details">
            <div class="profile-detail">
                <span class="profile-label">Phương thức đăng nhập</span>
                <span class="profile-value">${loginType === "google" ? "Google" : loginType}</span>
            </div>
            <div class="profile-detail">
                <span class="profile-label">Lần đăng nhập gần nhất</span>
                <span class="profile-value">${lastLogin}</span>
            </div>
            <div class="profile-detail">
                <span class="profile-label">User ID</span>
                <span class="profile-value profile-uid">${user.uid}</span>
            </div>
        </div>

        <a href="index.html" class="profile-back-btn">← Về trang chủ</a>
    `;

    profileCard.style.display = "block";
    profileLoading.style.display = "none";
}

async function initProfile() {
    const user = await waitForAuth();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    let firestoreData = null;

    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            firestoreData = snap.data();
        }
    } catch (err) {
        console.error("Firestore read error:", err);
    }

    renderProfile(user, firestoreData);
}

initProfile();
