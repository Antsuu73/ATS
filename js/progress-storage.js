/**
 * Lưu tạm tiến độ trên localStorage khi Firestore chưa sẵn sàng (rules chưa deploy).
 */

const PREFIX = "ats_";

function key(uid, type) {
    return `${PREFIX}${type}_${uid}`;
}

function readSet(uid, type) {
    if (!uid) return new Set();
    try {
        const raw = localStorage.getItem(key(uid, type));
        return new Set(JSON.parse(raw || "[]").map(String));
    } catch {
        return new Set();
    }
}

function writeSet(uid, type, set) {
    if (!uid) return;
    localStorage.setItem(key(uid, type), JSON.stringify([...set]));
}

export function getLocalSolvedIds(uid) {
    return readSet(uid, "solved");
}

export function addLocalSolved(uid, problemId) {
    const set = readSet(uid, "solved");
    set.add(String(problemId));
    writeSet(uid, "solved", set);
}

export function getLocalCompletedLessonIds(uid) {
    return readSet(uid, "lessons");
}

export function addLocalCompletedLesson(uid, lessonId) {
    const set = readSet(uid, "lessons");
    set.add(String(lessonId));
    writeSet(uid, "lessons", set);
}

export function mergeSets(...sets) {
    const merged = new Set();
    sets.forEach((s) => s.forEach((id) => merged.add(String(id))));
    return merged;
}

export function isPermissionError(err) {
    return err?.code === "permission-denied" || err?.code === "unauthenticated";
}
