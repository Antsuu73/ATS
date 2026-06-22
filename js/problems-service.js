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
import {
    addLocalSolved,
    getLocalSolvedIds,
    isPermissionError,
    mergeSets
} from "./progress-storage.js";

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
        if (!isPermissionError(err)) {
            console.warn("Firestore problems unavailable, using local data:", err);
        }
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
        if (!isPermissionError(err)) {
            console.warn("Firestore problem load failed:", err);
        }
    }

    const local = PROBLEMS.find((p) => String(p.id) === String(id));
    return local ? normalizeProblem(local, local.id) : null;
}

export async function getSolvedIds(uid) {
    if (!uid) return new Set();

    const local = getLocalSolvedIds(uid);

    try {
        const snap = await getDocs(collection(db, "users", uid, "solved"));
        const remote = new Set(snap.docs.map((d) => String(d.id)));
        return mergeSets(local, remote);
    } catch (err) {
        if (isPermissionError(err)) {
            return local;
        }
        console.error("Solved list load error:", err);
        return local;
    }
}

export async function isProblemSolved(uid, problemId) {
    if (!uid) return false;

    const id = String(problemId);
    if (getLocalSolvedIds(uid).has(id)) return true;

    try {
        const snap = await getDoc(doc(db, "users", uid, "solved", id));
        return snap.exists() && snap.data().solved === true;
    } catch (err) {
        if (isPermissionError(err)) {
            return getLocalSolvedIds(uid).has(id);
        }
        console.error("Solved check error:", err);
        return false;
    }
}

export async function markProblemSolved(uid, problemId) {
    if (!uid || !problemId) {
        throw new Error("Thiếu thông tin người dùng hoặc bài tập.");
    }

    if (!auth.currentUser || auth.currentUser.uid !== uid) {
        throw new Error("Vui lòng đăng nhập để lưu tiến độ.");
    }

    const id = String(problemId);

    try {
        await ensureUserDocument(uid, auth.currentUser);
        await setDoc(doc(db, "users", uid, "solved", id), {
            solved: true,
            time: Date.now()
        });
        addLocalSolved(uid, id);
    } catch (err) {
        if (isPermissionError(err)) {
            console.warn(
                "Firestore từ chối quyền ghi — lưu tạm trên trình duyệt. " +
                "Deploy firestore.rules: firebase deploy --only firestore:rules --project ats-2f1b4"
            );
            addLocalSolved(uid, id);
            return;
        }
        console.error("Mark solved error:", err);
        throw new Error(getFirestoreErrorMessage(err));
    }
}
