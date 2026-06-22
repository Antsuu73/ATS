import { db } from "./firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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
    await setDoc(doc(db, "users", uid, "lessons", String(lessonId)), {
        completed: true,
        time: Date.now()
    });
}
