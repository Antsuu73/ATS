import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { ensureUserDocument } from "./user-service.js";
import { getSolvedIds, loadProblems } from "./problems-service.js";

const TOPICS = [
    { key: "graph", label: "Graph" },
    { key: "dp", label: "DP" },
    { key: "tree", label: "Tree" }
];

const DEFAULT_PROGRESS = { graph: 0, dp: 0, tree: 0 };

function clampPercent(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function computeOverall(progress) {
    const values = TOPICS.map((t) => clampPercent(progress[t.key]));
    if (values.every((v) => v === 0)) return 0;
    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function computeProgressFromSolved(solvedIds, allProblems) {
    const solvedSet = new Set([...solvedIds].map(String));
    const updated = {};

    TOPICS.forEach((topic) => {
        const inTopic = allProblems.filter((p) => p.topic === topic.key);
        const solvedCount = inTopic.filter((p) => solvedSet.has(String(p.id))).length;
        updated[topic.key] = inTopic.length
            ? clampPercent((solvedCount / inTopic.length) * 100)
            : 0;
    });

    return updated;
}

async function resolveProgress(uid) {
    try {
        const [solvedIds, allProblems, stored] = await Promise.all([
            getSolvedIds(uid),
            loadProblems(),
            fetchUserProgress(uid)
        ]);

        if (solvedIds.size > 0) {
            return computeProgressFromSolved(solvedIds, allProblems);
        }

        return stored;
    } catch (err) {
        console.error("Progress resolve error:", err);
        return fetchUserProgress(uid);
    }
}

async function fetchUserProgress(uid) {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) return { ...DEFAULT_PROGRESS };

        const stored = snap.data().progress;
        if (!stored || typeof stored !== "object") return { ...DEFAULT_PROGRESS };

        return {
            graph: clampPercent(stored.graph),
            dp: clampPercent(stored.dp),
            tree: clampPercent(stored.tree)
        };
    } catch (err) {
        console.error("Progress load error:", err);
        return { ...DEFAULT_PROGRESS };
    }
}

function animateBar(bar, percent) {
    if (!bar) return;

    const target = `${clampPercent(percent)}%`;
    bar.dataset.percent = String(clampPercent(percent));

    const runAnimation = () => {
        bar.style.width = "0%";
        requestAnimationFrame(() => {
            bar.style.transition = "width 1.5s ease";
            bar.style.width = target;
        });
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                runAnimation();
                observer.unobserve(bar);
            });
        }, { threshold: 0.3 });

        observer.observe(bar);
    } else {
        runAnimation();
    }
}

function renderProgress(progress) {
    const overall = computeOverall(progress);

    const heroPercent = document.getElementById("heroProgressPercent");
    const heroFill = document.getElementById("heroProgressFill");

    if (heroPercent) heroPercent.textContent = `${overall}%`;
    if (heroFill) animateBar(heroFill, overall);

    TOPICS.forEach((topic) => {
        const percent = clampPercent(progress[topic.key]);

        document.querySelectorAll(`[data-topic="${topic.key}"] .topic-percent`).forEach((el) => {
            el.textContent = `${percent}%`;
        });

        document.querySelectorAll(`[data-topic="${topic.key}"] .line-fill`).forEach((bar) => {
            animateBar(bar, percent);
        });
    });
}

onAuthStateChanged(auth, async (user) => {
    const progress = user
        ? await resolveProgress(user.uid)
        : { ...DEFAULT_PROGRESS };

    renderProgress(progress);
});

export async function updateTopicProgress(topicKey, percent) {
    const user = auth.currentUser;
    if (!user) return false;

    const key = String(topicKey);
    if (!TOPICS.some((t) => t.key === key)) return false;

    const current = await fetchUserProgress(user.uid);
    const updated = {
        ...current,
        [key]: clampPercent(percent)
    };

    try {
        await ensureUserDocument(user.uid, user);
        await setDoc(doc(db, "users", user.uid), {
            progress: updated
        }, { merge: true });

        renderProgress(updated);
        return true;
    } catch (err) {
        if (err?.code === "permission-denied") {
            console.warn("Không lưu được progress lên Firestore — deploy firestore.rules.");
            renderProgress(updated);
            return true;
        }
        console.error("Progress save error:", err);
        return false;
    }
}

export async function updateProgressFromSolved(solvedIds, allProblems) {
    const user = auth.currentUser;
    if (!user) return false;

    const updated = computeProgressFromSolved(solvedIds, allProblems);

    try {
        await ensureUserDocument(user.uid, user);
        await setDoc(doc(db, "users", user.uid), {
            progress: updated
        }, { merge: true });

        renderProgress(updated);
        return true;
    } catch (err) {
        if (err?.code === "permission-denied") {
            console.warn("Không lưu được progress lên Firestore — deploy firestore.rules.");
            renderProgress(updated);
            return true;
        }
        console.error("Progress sync error:", err);
        return false;
    }
}
