import { auth, db } from "./firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { PROBLEMS } from "./problems-data.js";
import { ensureUserDocument, getFirestoreErrorMessage } from "./user-service.js";

function normalizeProblem(raw, docId) {
    const id = String(raw.id ?? docId ?? "");
    return {
        id,
        title: raw.title || "Untitled",
        topic: raw.topic || "graph",
        tag: raw.tag || "",
        difficulty: raw.difficulty || "Easy",
        rating: Number(raw.rating) || 0,
        description: raw.description || "",
        examples: Array.isArray(raw.examples) ? raw.examples : [],
        constraints: raw.constraints || ""
    };
}

export async function loadProblems() {
    try {
        const snap = await getDocs(collection(db, "problems"));

        if (!snap.empty) {
            return snap.docs
                .map((d) => normalizeProblem(d.data(), d.id))
                .sort((a, b) => Number(a.id) - Number(b.id));
        }
    } catch (err) {
        console.warn("Firestore problems unavailable, using local data:", err);
    }

    return PROBLEMS.map((p) => normalizeProblem(p, p.id));
}

export async function loadProblemById(id) {
    if (!id) return null;

    try {
        const snap = await getDoc(doc(db, "problems", String(id)));
        if (snap.exists()) {
            return normalizeProblem(snap.data(), snap.id);
        }
    } catch (err) {
        console.warn("Firestore problem load failed:", err);
    }

    const local = PROBLEMS.find((p) => String(p.id) === String(id));
    return local ? normalizeProblem(local, local.id) : null;
}

export async function getSolvedIds(uid) {
    if (!uid) return new Set();

    try {
        const snap = await getDocs(collection(db, "users", uid, "solved"));
        return new Set(snap.docs.map((d) => String(d.id)));
    } catch (err) {
        console.error("Solved list load error:", err);
        return new Set();
    }
}

export async function isProblemSolved(uid, problemId) {
    if (!uid) return false;

    try {
        const snap = await getDoc(doc(db, "users", uid, "solved", String(problemId)));
        return snap.exists() && snap.data().solved === true;
    } catch (err) {
        console.error("Solved check error:", err);
        return false;
    }
}

export async function markProblemSolved(uid, problemId) {
    if (!uid || !problemId) {
        throw new Error("Thiếu thông tin người dùng hoặc bài tập.");
    }

    try {
        await ensureUserDocument(uid, auth.currentUser);
        await setDoc(doc(db, "users", uid, "solved", String(problemId)), {
            solved: true,
            time: Date.now()
        });
    } catch (err) {
        console.error("Mark solved error:", err);
        throw new Error(getFirestoreErrorMessage(err));
    }
}
