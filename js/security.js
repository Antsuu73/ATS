/**
 * Tiện ích bảo mật phía client — chống XSS, redirect an toàn, lỗi auth an toàn.
 */

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar?d=mp&s=80";

export function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function sanitizeUrl(url, fallback = "") {
    if (!url || typeof url !== "string") return fallback;

    try {
        const parsed = new URL(url, window.location.origin);
        if (parsed.protocol === "https:") return parsed.href;
    } catch {
        return fallback;
    }

    return fallback;
}

export function safeRedirect(path, fallback = "index.html") {
    if (!path || typeof path !== "string") return fallback;

    if (/^https?:\/\//i.test(path)) return fallback;

    const normalized = path.startsWith("/") ? path : `/${path}`;
    const resolved = new URL(normalized, window.location.origin);

    if (resolved.origin !== window.location.origin) return fallback;

    return `${resolved.pathname}${resolved.search}${resolved.hash}`.replace(/^\//, "") || fallback;
}

export function getSafeAuthErrorMessage(err) {
    const code = err?.code || "";

    const messages = {
        "auth/popup-closed-by-user": "Đã hủy đăng nhập.",
        "auth/cancelled-popup-request": "Vui lòng thử lại.",
        "auth/popup-blocked": "Trình duyệt chặn popup. Hãy cho phép popup cho trang này.",
        "auth/network-request-failed": "Lỗi mạng. Kiểm tra kết nối và thử lại.",
        "auth/too-many-requests": "Quá nhiều lần thử. Vui lòng đợi vài phút.",
        "auth/user-disabled": "Tài khoản đã bị vô hiệu hóa.",
        "auth/operation-not-allowed": "Phương thức đăng nhập chưa được bật.",
        "auth/internal-error": "Lỗi xác thực. Hãy tải lại trang (Ctrl+F5) và thử lại."
    };

    return messages[code] || "Đăng nhập thất bại. Vui lòng thử lại.";
}

export function sanitizeUserProfile(user) {
    if (!user) return null;

    const name = String(user.displayName || "").slice(0, 120);
    const email = String(user.email || "").slice(0, 254);
    const photo = sanitizeUrl(user.photoURL, DEFAULT_AVATAR);

    return {
        name: name || "User",
        email: email || "",
        photo: photo.length > 500 ? photo.slice(0, 500) : photo,
        lastLogin: Date.now(),
        loginType: "google"
    };
}

export function getDefaultAvatar(size = 80) {
    return `https://www.gravatar.com/avatar?d=mp&s=${size}`;
}

export { DEFAULT_AVATAR };
