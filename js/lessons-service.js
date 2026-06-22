import { auth, db } from "./firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { ensureUserDocument, getFirestoreErrorMessage } from "./user-service.js";

export async function getCompletedLessonIds(uid) {
    if (!uid) return new Set();

    try {
        const snap = await getDocs(collection(db, "users", uid, "lessons"));
        return new Set(
            snap.docs
                .filter((d) => d.data().completed === true)
                .map((d) => d.id)
        );
    } catch (err) {
        console.error("Lessons load error:", err);
        return new Set();
    }
}

export async function isLessonCompleted(uid, lessonId) {
    if (!uid) return false;

    try {
        const snap = await getDoc(doc(db, "users", uid, "lessons", String(lessonId)));
        return snap.exists() && snap.data().completed === true;
    } catch (err) {
        return false;
    }
}

export async function markLessonCompleted(uid, lessonId) {
    if (!uid || !lessonId) {
        throw new Error("Thiếu thông tin người dùng hoặc bài học.");
    }

    try {
        await ensureUserDocument(uid, auth.currentUser);
        await setDoc(doc(db, "users", uid, "lessons", String(lessonId)), {
            completed: true,
            time: Date.now()
        });
    } catch (err) {
        console.error("Mark lesson error:", err);
        throw new Error(getFirestoreErrorMessage(err));
    }
}
