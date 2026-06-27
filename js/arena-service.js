import { auth, db } from "./firebase-config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    deleteDoc,
    updateDoc,
    query,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { escapeHtml } from "./security.js";
import { isPermissionError } from "./progress-storage.js";

const COL = "customProblems";
const LOCAL_KEY = "ats_custom_problems";

function generateId() {
    return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function timeAgo(ts) {
    const diff = Date.now() - ts;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} giây trước`;
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    const months = Math.floor(days / 30);
    return `${months} tháng trước`;
}

export function normalizeCustomProblem(raw, docId) {
    return {
        id: String(raw.id ?? docId ?? ""),
        title: raw.title || "Không có tiêu đề",
        description: raw.description || "",
        difficulty: raw.difficulty || "Medium",
        rating: Number(raw.rating) || 0,
        input: raw.input || "",
        output: raw.output || "",
        authorId: raw.authorId || "",
        authorName: raw.authorName || "User",
        solvedBy: Array.isArray(raw.solvedBy) ? raw.solvedBy : [],
        createdAt: raw.createdAt || Date.now(),
        updatedAt: raw.updatedAt || Date.now()
    };
}

export async function createCustomProblem({ title, description, difficulty, rating, input, output }) {
    const user = auth.currentUser;
    if (!user) throw new Error("Vui lòng đăng nhập để tạo bài tập.");

    const problemDoc = {
        id: generateId(),
        title,
        description,
        difficulty,
        rating: Number(rating) || 0,
        input,
        output,
        authorId: user.uid,
        authorName: user.displayName || user.email || "User",
        solvedBy: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    let remoteId = null;
    try {
        const snap = await addDoc(collection(db, COL), {
            ...problemDoc,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        remoteId = snap.id;
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("createCustomProblem remote error:", err);
        }
    }

    const local = normalizeCustomProblem(problemDoc, remoteId || problemDoc.id);
    const existing = getLocalCustomProblems();
    existing.unshift(local);
    saveLocalCustomProblems(existing);

    return local;
}

export async function loadCustomProblems() {
    const local = getLocalCustomProblems();

    try {
        const q = query(collection(db, COL), orderBy("createdAt", "desc"), limit(200));
        const snap = await getDocs(q);
        const remote = snap.docs.map((d) => normalizeCustomProblem(d.data(), d.id));

        const merged = mergeCustomProblems(remote, local);
        saveLocalCustomProblems(merged);
        return merged;
    } catch (err) {
        if (isPermissionError(err)) {
            return local;
        }
        console.error("loadCustomProblems error:", err);
        return local;
    }
}

export async function loadCustomProblemById(id) {
    if (!id) return null;

    const local = getLocalCustomProblems().find((p) => p.id === id);
    if (local && !local._isRemote) return local;

    try {
        const ref = doc(db, COL, id);
        const snap = await getDoc(ref);
        if (!snap.exists()) return local || null;

        const remote = normalizeCustomProblem(snap.data(), snap.id);
        remote._isRemote = true;
        return remote;
    } catch (err) {
        if (isPermissionError(err)) return local || null;
        console.error("loadCustomProblemById error:", err);
        return local || null;
    }
}

export async function deleteCustomProblem(id) {
    const user = auth.currentUser;
    if (!user) throw new Error("Vui lòng đăng nhập.");

    try {
        await deleteDoc(doc(db, COL, id));
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("deleteCustomProblem remote error:", err);
        }
    }

    const existing = getLocalCustomProblems();
    const filtered = existing.filter((p) => p.id !== id);
    saveLocalCustomProblems(filtered);
    return true;
}

export async function markCustomProblemSolved(userId, problemId) {
    if (!userId || !problemId) throw new Error("Thiếu thông tin.");

    const id = String(problemId);

    try {
        const ref = doc(db, COL, id);
        await updateDoc(ref, {
            solvedBy: arrayUnion(userId),
            updatedAt: serverTimestamp()
        });
    } catch (err) {
        if (!isPermissionError(err)) {
            console.error("markCustomProblemSolved remote error:", err);
        }
    }

    const existing = getLocalCustomProblems();
    const problem = existing.find((p) => p.id === id);
    if (problem) {
        if (!problem.solvedBy.includes(userId)) {
            problem.solvedBy.push(userId);
        }
        problem.updatedAt = Date.now();
        saveLocalCustomProblems(existing);
    }

    return true;
}

export function getLocalSolvedCustomProblemIds(uid) {
    if (!uid) return new Set();
    try {
        const raw = localStorage.getItem(`ats_custom_solved_${uid}`);
        return new Set(JSON.parse(raw || "[]").map(String));
    } catch {
        return new Set();
    }
}

export function addLocalSolvedCustomProblem(uid, problemId) {
    if (!uid) return;
    const set = getLocalSolvedCustomProblemIds(uid);
    set.add(String(problemId));
    localStorage.setItem(`ats_custom_solved_${uid}`, JSON.stringify([...set]));
}

export function isLocalSolvedCustomProblem(uid, problemId) {
    return getLocalSolvedCustomProblemIds(uid).has(String(problemId));
}

/* Local helpers */

function getLocalCustomProblems() {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        return JSON.parse(raw || "[]");
    } catch {
        return [];
    }
}

function saveLocalCustomProblems(list) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

function mergeCustomProblems(remote, local) {
    const map = new Map();

    remote.forEach((p) => {
        map.set(p.id, { ...p, _isRemote: true });
    });

    local.forEach((p) => {
        if (!map.has(p.id)) {
            map.set(p.id, { ...p, _isRemote: false });
        } else {
            const existing = map.get(p.id);
            if (!existing._isRemote) {
                map.set(p.id, { ...existing, ...p, _isRemote: true });
            }
        }
    });

    return Array.from(map.values());
}