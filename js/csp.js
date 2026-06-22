/**
 * Content-Security-Policy dùng chung — cập nhật tại đây rồi copy vào meta tag các trang HTML.
 * Cần cho Firebase Auth (Google Sign-In popup).
 */
export const CSP_POLICY = [
    "default-src 'self'",
    "script-src 'self' https://www.gstatic.com https://apis.google.com https://www.google.com",
    "script-src-elem 'self' https://www.gstatic.com https://apis.google.com https://www.google.com",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https: data: blob:",
    "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.gstatic.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com wss://*.firebaseio.com",
    "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://www.google.com https://apis.google.com",
    "base-uri 'self'",
    "form-action 'self'"
].join("; ") + ";";
