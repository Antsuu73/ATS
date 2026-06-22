import { auth, db } from "./firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { ensureUserDocument, getFirestoreErrorMessage } from "./user-service.js";
import {
    addLocalCompletedLesson,
    getLocalCompletedLessonIds,
    isPermissionError,
    mergeSets
} from "./progress-storage.js";

export async function getCompletedLessonIds(uid) {
    if (!uid) return new Set();

    const local = getLocalCompletedLessonIds(uid);

    try {
        const snap = await getDocs(collection(db, "users", uid, "lessons"));
        const remote = new Set(
            snap.docs
                .filter((d) => d.data().completed === true)
                .map((d) => d.id)
        );
        return mergeSets(local, remote);
    } catch (err) {
        if (isPermissionError(err)) {
            return local;
        }
        console.error("Lessons load error:", err);
        return local;
    }
}

export async function isLessonCompleted(uid, lessonId) {
    if (!uid) return false;

    const id = String(lessonId);
    if (getLocalCompletedLessonIds(uid).has(id)) return true;

    try {
        const snap = await getDoc(doc(db, "users", uid, "lessons", id));
        return snap.exists() && snap.data().completed === true;
    } catch (err) {
        if (isPermissionError(err)) {
            return getLocalCompletedLessonIds(uid).has(id);
        }
        return false;
    }
}

export async function markLessonCompleted(uid, lessonId) {
    if (!uid || !lessonId) {
        throw new Error("Thiếu thông tin người dùng hoặc bài học.");
    }

    if (!auth.currentUser || auth.currentUser.uid !== uid) {
        throw new Error("Vui lòng đăng nhập để lưu tiến độ.");
    }

    const id = String(lessonId);

    try {
        await ensureUserDocument(uid, auth.currentUser);
        await setDoc(doc(db, "users", uid, "lessons", id), {
            completed: true,
            time: Date.now()
        });
        addLocalCompletedLesson(uid, id);
    } catch (err) {
        if (isPermissionError(err)) {
            console.warn(
                "Firestore từ chối quyền ghi — lưu tạm trên trình duyệt. " +
                "Deploy firestore.rules: firebase deploy --only firestore:rules --project ats-2f1b4"
            );
            addLocalCompletedLesson(uid, id);
            return;
        }
        console.error("Mark lesson error:", err);
        throw new Error(getFirestoreErrorMessage(err));
    }
}
