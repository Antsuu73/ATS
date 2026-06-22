import { db } from "./firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { sanitizeUserProfile } from "./security.js";

const DEFAULT_PROGRESS = { graph: 0, dp: 0, tree: 0 };

/**
 * Đảm bảo document users/{uid} tồn tại trước khi ghi subcollection hoặc progress.
 */
export async function ensureUserDocument(uid, authUser = null) {
    if (!uid) throw new Error("Missing user id");

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) return snap.data();

    const profile = authUser ? sanitizeUserProfile(authUser) : {
        name: "User",
        email: "",
        photo: null,
        lastLogin: Date.now(),
        loginType: "google"
    };

    await setDoc(ref, {
        ...profile,
        progress: { ...DEFAULT_PROGRESS }
    });

    return profile;
}

export function getFirestoreErrorMessage(err) {
    const code = err?.code || "";

    const messages = {
        "permission-denied":
            "Firestore chưa cho phép ghi dữ liệu. Tiến độ đã lưu tạm trên trình duyệt. " +
            "Admin cần deploy rules: firebase deploy --only firestore:rules --project ats-2f1b4",
        "unavailable": "Firestore tạm thời không khả dụng. Thử lại sau vài giây.",
        "failed-precondition": "Dữ liệu không hợp lệ. Vui lòng tải lại trang.",
        "unauthenticated": "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
    };

    return messages[code] || "Không thể lưu dữ liệu. Vui lòng thử lại.";
}
