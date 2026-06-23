import { auth, db } from "./firebase-config.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
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
import { ensureUserDocument } from "./user-service.js";

/* ── DOM ── */
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const emailForm = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const confirmGroup = document.getElementById("confirmGroup");
const confirmPassword = document.getElementById("confirmPassword");
const nameGroup = document.getElementById("nameGroup");
const displayNameInput = document.getElementById("displayName");
const submitBtn = document.getElementById("submitBtn");
const googleBtn = document.getElementById("googleLogin");
const togglePasswordBtn = document.getElementById("togglePassword");
const statusEl = document.getElementById("status");

let mode = "login"; // "login" | "register"

const redirectTarget = safeRedirect(
    new URLSearchParams(window.location.search).get("redirect"),
    "index.html"
);

/* ── Status helpers ── */
function showStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = isError ? "status-error" : "status-success";
}

function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.className = "";
}

/* ── Tab switching ── */
function switchMode(newMode) {
    mode = newMode;
    clearStatus();

    if (mode === "register") {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        formTitle.textContent = "Tạo tài khoản";
        formSubtitle.textContent = "Đăng ký tài khoản mới để bắt đầu học";
        submitBtn.textContent = "Tạo tài khoản";
        nameGroup.style.display = "";
        confirmGroup.style.display = "";
        passwordInput.autocomplete = "new-password";
    } else {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        formTitle.textContent = "Đăng nhập";
        formSubtitle.textContent = "Đăng nhập để tiếp tục học";
        submitBtn.textContent = "Đăng nhập";
        nameGroup.style.display = "none";
        confirmGroup.style.display = "none";
        passwordInput.autocomplete = "current-password";
    }

    // Clear validation styles
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    if (confirmPassword) confirmPassword.classList.remove("input-error");
}

if (tabLogin) tabLogin.addEventListener("click", () => switchMode("login"));
if (tabRegister) tabRegister.addEventListener("click", () => switchMode("register"));

/* ── Toggle password visibility ── */
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordBtn.classList.toggle("is-visible", isPassword);
    });
}

/* ── Validation ── */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
    clearStatus();
    let valid = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    if (confirmPassword) confirmPassword.classList.remove("input-error");

    if (!email || !validateEmail(email)) {
        emailInput.classList.add("input-error");
        showStatus("Vui lòng nhập email hợp lệ.", true);
        return false;
    }

    if (!password || password.length < 6) {
        passwordInput.classList.add("input-error");
        showStatus("Mật khẩu phải có ít nhất 6 ký tự.", true);
        return false;
    }

    if (mode === "register") {
        const confirm = confirmPassword.value;
        if (password !== confirm) {
            confirmPassword.classList.add("input-error");
            showStatus("Mật khẩu nhập lại không khớp.", true);
            return false;
        }
    }

    return true;
}

/* ── Save user profile to Firestore ── */
async function saveUserProfile(user) {
    const profile = sanitizeUserProfile(user);
    if (!profile) return;

    // Override loginType for email users
    if (!user.providerData?.some(p => p.providerId === "google.com")) {
        profile.loginType = "email";
    }

    try {
        await ensureUserDocument(user.uid, user);
        await setDoc(doc(db, "users", user.uid), profile, { merge: true });
    } catch (err) {
        console.error("Firestore error:", err);
        showStatus("Đăng nhập OK nhưng lưu hồ sơ thất bại.", true);
    }
}

/* ── Redirect after success ── */
function redirectAfterLogin() {
    setTimeout(() => {
        window.location.replace(redirectTarget);
    }, 600);
}

/* ── Disable/Enable buttons ── */
function setLoading(loading) {
    if (submitBtn) submitBtn.disabled = loading;
    if (googleBtn) googleBtn.disabled = loading;
}

/* ── Email/Password Submit ── */
if (emailForm) {
    emailForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            if (mode === "register") {
                showStatus("Đang tạo tài khoản...");

                const result = await createUserWithEmailAndPassword(auth, email, password);
                const user = result.user;

                // Update display name if provided
                const name = displayNameInput?.value.trim();
                if (name) {
                    await updateProfile(user, { displayName: name });
                }

                await saveUserProfile(user);
                showStatus("Tạo tài khoản thành công!");
                redirectAfterLogin();

            } else {
                showStatus("Đang đăng nhập...");

                const result = await signInWithEmailAndPassword(auth, email, password);
                await saveUserProfile(result.user);

                showStatus("Đăng nhập thành công!");
                redirectAfterLogin();
            }

        } catch (err) {
            console.error("Auth error:", err);
            showStatus(getSafeAuthErrorMessage(err), true);
            setLoading(false);
        }
    });
}

/* ── Google Sign-In ── */
if (window.location.protocol === "file:") {
    showStatus("Hãy chạy qua local server (Live Server), không mở file HTML trực tiếp.", true);
    setLoading(true);
} else if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
        if (googleBtn.disabled) return;

        setLoading(true);
        showStatus("Đang đăng nhập với Google...");

        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });

            const result = await signInWithPopup(auth, provider);
            await saveUserProfile(result.user);

            showStatus("Đăng nhập thành công!");
            redirectAfterLogin();

        } catch (err) {
            console.error("Google login error:", err);
            showStatus(getSafeAuthErrorMessage(err), true);
            setLoading(false);
        }
    });
}
