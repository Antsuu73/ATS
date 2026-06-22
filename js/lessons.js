import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getCompletedLessonIds } from "./lessons-service.js";
import { LESSONS, TOPIC_LABELS } from "./lessons-data.js";

let completedIds = new Set();
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

    return `
        <a href="lesson.html?id=${lesson.id}" class="lesson-card${done ? " done" : ""}">
            <div class="lesson-card-top">
                <span class="topic-badge">${TOPIC_LABELS[lesson.topic]}</span>
                ${done ? `<span class="lesson-done-badge">✓ Đã học</span>` : ""}
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
    completedIds = user ? await getCompletedLessonIds(user.uid) : new Set();
    render();
});

initFromUrl();
setActiveFilters();
render();
