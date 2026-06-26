import { db } from "./firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { sanitizeUserProfile } from "./security.js";
import { addLocalActivityDate, getLocalActivityDates, isPermissionError } from "./progress-storage.js";

const DEFAULT_PROGRESS = { graph: 0, dp: 0, tree: 0, recursion: 0, "data-structure": 0, "sorting-search": 0, greedy: 0, math: 0, string: 0 };

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

export async function recordActivity(uid) {
    if (!uid) return;
    // Lấy ngày hiện tại theo giờ địa phương, không bị lệch múi giờ (YYYY-MM-DD)
    const date = new Date();
    const dateStr = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0');
    
    addLocalActivityDate(uid, dateStr);

    if (uid === "guest") return;

    try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            const activityDates = data.activityDates || [];
            if (!activityDates.includes(dateStr)) {
                activityDates.push(dateStr);
                await setDoc(ref, { activityDates }, { merge: true });
            }
        }
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("Record activity error:", err);
        }
    }
}

export async function getActivityDates(uid) {
    if (!uid) return new Set();
    const local = getLocalActivityDates(uid);
    if (uid === "guest") return local;

    try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().activityDates) {
            snap.data().activityDates.forEach(d => local.add(d));
        }
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("Get activity error:", err);
        }
    }
    return local;
}
