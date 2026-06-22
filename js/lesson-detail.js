import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getLessonById, TOPIC_LABELS, LESSONS } from "./lessons-data.js";
import {
    isLessonCompleted,
    markLessonCompleted
} from "./lessons-service.js";
import { refreshUserProgress } from "./progress.js";
import { getVisualizerByLessonId } from "./visualizers-data.js";

const params = new URLSearchParams(window.location.search);
const lessonId = params.get("id");

const loadingEl = document.getElementById("lessonLoading");
const contentEl = document.getElementById("lessonContent");
const notFoundEl = document.getElementById("lessonNotFound");

let currentLesson = null;
let currentUser = null;
let completed = false;

function getDifficultyClass(d) {
    const key = String(d).toLowerCase();
    if (key === "easy") return "difficulty-easy";
    if (key === "hard") return "difficulty-hard";
    return "difficulty-medium";
}

function renderSection(section) {
    if (section.code) {
        return `
            <section class="lesson-section">
                <h2>${section.title}</h2>
                <pre class="lesson-code"><code>${section.code}</code></pre>
            </section>
        `;
    }

    return `
        <section class="lesson-section">
            <h2>${section.title}</h2>
            <p>${section.content}</p>
        </section>
    `;
}

function getAdjacentLessons(lesson) {
    const sameTopic = LESSONS.filter((l) => l.topic === lesson.topic);
    const idx = sameTopic.findIndex((l) => l.id === lesson.id);
    return {
        prev: idx > 0 ? sameTopic[idx - 1] : null,
        next: idx < sameTopic.length - 1 ? sameTopic[idx + 1] : null
    };
}

function renderActions() {
    const actionsEl = document.getElementById("lessonActions");
    if (!actionsEl || !currentLesson) return;

    let html = "";

    const viz = getVisualizerByLessonId(currentLesson.id);
    if (viz) {
        html += `
            <a href="visualizer.html?id=${viz.id}" class="btn-lesson btn-lesson-viz">
                Xem visualizer: ${viz.title}
            </a>
        `;
    }

    if (currentLesson.relatedProblemId) {
        html += `
            <a href="problem.html?id=${currentLesson.relatedProblemId}" class="btn-lesson btn-lesson-outline">
                Luyện tập bài liên quan
            </a>
        `;
    }

    if (currentLesson.roadmapId) {
        html += `
            <a href="roadmap.html?id=${currentLesson.roadmapId}" class="btn-lesson btn-lesson-outline">
                Xem roadmap
            </a>
        `;
    }

    if (!currentUser) {
        html += `<p class="login-hint"><a href="login.html">Đăng nhập</a> để đánh dấu đã học.</p>`;
        actionsEl.innerHTML = html;
        return;
    }

    if (completed) {
        html += `<div class="lesson-completed-banner">✓ Bạn đã hoàn thành bài học này</div>`;
    } else {
        html += `<button id="completeBtn" class="btn-lesson btn-lesson-success" type="button">Đánh dấu đã học xong</button>`;
    }

    actionsEl.innerHTML = html;

    const btn = document.getElementById("completeBtn");
    if (btn) btn.addEventListener("click", handleComplete);
}

async function handleComplete() {
    const btn = document.getElementById("completeBtn");
    if (!currentUser || !currentLesson || completed) return;

    btn.disabled = true;
    btn.textContent = "Đang lưu...";

    try {
        await markLessonCompleted(currentUser.uid, currentLesson.id);
        completed = true;
        renderActions();
        await refreshUserProgress(currentUser.uid);
    } catch (err) {
        console.error("Complete lesson error:", err);
        btn.disabled = false;
        btn.textContent = "Đánh dấu đã học xong";
        alert(err.message || "Không thể lưu. Vui lòng thử lại.");
    }
}

function renderLesson(lesson) {
    const { prev, next } = getAdjacentLessons(lesson);

    document.title = `${lesson.title} - ATS`;

    contentEl.innerHTML = `
        <a href="lessons.html${lesson.topic ? `?topic=${lesson.topic}` : ""}" class="lesson-back">
            ← Tất cả bài học
        </a>

        <article class="lesson-article">
            <header class="lesson-article-head">
                <span class="topic-badge">${TOPIC_LABELS[lesson.topic]}</span>
                <h1>${lesson.title}</h1>
                <p class="lesson-article-summary">${lesson.summary}</p>
                <div class="lesson-article-meta">
                    <span class="difficulty-badge ${getDifficultyClass(lesson.difficulty)}">${lesson.difficulty}</span>
                    <span>${lesson.duration}</span>
                </div>
            </header>

            ${lesson.sections.map(renderSection).join("")}

            <div class="lesson-actions" id="lessonActions"></div>
        </article>

        <div class="lesson-sidebar">
            <div class="lesson-nav-card">
                <h3>Bài học liên quan</h3>
                <div class="lesson-nav-links">
                    ${prev ? `<a href="lesson.html?id=${prev.id}">← ${prev.title}</a>` : ""}
                    ${next ? `<a href="lesson.html?id=${next.id}">${next.title} →</a>` : ""}
                    ${!prev && !next ? `<span class="login-hint">Không có bài liền kề.</span>` : ""}
                </div>
            </div>
        </div>
    `;

    loadingEl.style.display = "none";
    notFoundEl.style.display = "none";
    contentEl.style.display = "block";
    renderActions();
}

async function init() {
    if (!lessonId) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    currentLesson = getLessonById(lessonId);

    if (!currentLesson) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    renderLesson(currentLesson);
}

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user && currentLesson) {
        completed = await isLessonCompleted(user.uid, currentLesson.id);
        renderActions();
    } else {
        completed = false;
        renderActions();
    }
});

init();
