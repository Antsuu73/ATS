import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getCompletedLessonIds, getFavoriteLessonIds, toggleFavoriteLesson } from "./lessons-service.js";
import { LESSONS, TOPIC_LABELS } from "./lessons-data.js";
import { getVisualizerByLessonId } from "./visualizers-data.js";

let completedIds = new Set();
let favoriteIds = new Set();
let filters = { topic: "all", search: "" };

const gridEl = document.getElementById("lessonsGrid");
const searchEl = document.getElementById("lessonsSearch");
const filterBtns = document.querySelectorAll("[data-filter]");

function getDifficultyClass(d) {
    const key = String(d).toLowerCase();
    if (key === "easy") return "difficulty-easy";
    if (key === "hard") return "difficulty-hard";
    return "difficulty-medium";
}

function getFilteredLessons() {
    const q = filters.search.trim().toLowerCase();

    return LESSONS.filter((l) => {
        const matchTopic = filters.topic === "all" || l.topic === filters.topic;
        const matchSearch = !q ||
            l.title.toLowerCase().includes(q) ||
            l.summary.toLowerCase().includes(q) ||
            (TOPIC_LABELS[l.topic] || "").toLowerCase().includes(q);
        return matchTopic && matchSearch;
    });
}

function renderCard(lesson) {
    const done = completedIds.has(lesson.id);
    const fav = favoriteIds.has(String(lesson.id));
    const viz = getVisualizerByLessonId(lesson.id);

    return `
        <a href="lesson.html?id=${lesson.id}" class="lesson-card${done ? " done" : ""}">
            <div class="lesson-card-top" style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <span class="topic-badge">${TOPIC_LABELS[lesson.topic]}</span>
                    ${viz ? `<span class="lesson-viz-badge">Visualizer</span>` : ""}
                    ${done ? `<span class="lesson-done-badge" style="color:var(--green); font-weight:600; margin-left:8px;">✅ Đã học</span>` : ""}
                </div>
                <button class="btn-fav-lesson" data-id="${lesson.id}" style="background:transparent; border:none; cursor:pointer; font-size:18px;" title="${fav ? "Bỏ yêu thích" : "Yêu thích"}">
                    ${fav ? "📌" : "📍"}
                </button>
            </div>
            <h3>${lesson.title}</h3>
            <p>${lesson.summary}</p>
            <div class="lesson-card-meta">
                <span class="difficulty-badge ${getDifficultyClass(lesson.difficulty)}">${lesson.difficulty}</span>
                <span>${lesson.duration}</span>
            </div>
        </a>
    `;
}

function render() {
    if (!gridEl) return;

    const items = getFilteredLessons();

    if (!items.length) {
        gridEl.innerHTML = `<div class="problems-empty">Không tìm thấy bài học phù hợp.</div>`;
        return;
    }

    gridEl.innerHTML = items.map(renderCard).join("");
    window.refreshATSAnimations?.(gridEl);
    
    // Attach favorite events
    gridEl.querySelectorAll('.btn-fav-lesson').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const uid = auth.currentUser?.uid;
            // Allow favorite even without login by using local storage (which doesn't strictly need uid if we adapt it or we pass a dummy uid)
            // Wait, progress-storage methods need a uid, but we can use "local" or handle it.
            // Let's assume uid is handled in service or we pass "guest" if not logged in.
            const userId = uid || "guest"; 
            
            const id = btn.dataset.id;
            const isFav = await toggleFavoriteLesson(userId, id);
            
            if (isFav) {
                favoriteIds.add(String(id));
            } else {
                favoriteIds.delete(String(id));
            }
            render(); // re-render to update icon
        });
    });
}

function setActiveFilters() {
    filterBtns.forEach((btn) => {
        const isActive = filters[btn.dataset.filter] === btn.dataset.value;
        btn.classList.toggle("active", isActive);
    });
}

function initFromUrl() {
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (topic) filters.topic = topic;
}

if (searchEl) {
    searchEl.addEventListener("input", (e) => {
        filters.search = e.target.value;
        render();
    });
}

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filters[btn.dataset.filter] = btn.dataset.value;
        setActiveFilters();
        render();
    });
});

onAuthStateChanged(auth, async (user) => {
    const uid = user ? user.uid : "guest";
    completedIds = await getCompletedLessonIds(uid);
    favoriteIds = await getFavoriteLessonIds(uid);
    render();
});

initFromUrl();
setActiveFilters();
render();
