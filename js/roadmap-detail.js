import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getSolvedIds, loadProblems } from "./problems-service.js";
import { getCompletedLessonIds } from "./lessons-service.js";
import {
    getRoadmapById,
    getPracticeSteps,
    computeRoadmapProgress
} from "./roadmaps-data.js";

const params = new URLSearchParams(window.location.search);
const roadmapId = params.get("id");

const loadingEl = document.getElementById("roadmapLoading");
const contentEl = document.getElementById("roadmapContent");
const notFoundEl = document.getElementById("roadmapNotFound");

let solvedIds = new Set();
let completedLessonIds = new Set();
let problemsMap = new Map();
let currentRoadmap = null;

function getProblemTitle(problemId) {
    const p = problemsMap.get(String(problemId));
    return p ? p.title : `Bài #${problemId}`;
}

function renderStep(step, index, total) {
    const isPractice = step.type === "practice";
    const isDone = isPractice && solvedIds.has(String(step.problemId));
    const stepClass = isDone ? "step-done" : `step-${step.type}`;
    const typeLabel = isPractice ? "Luyện tập" : "Lý thuyết";
    const typeClass = isPractice ? "type-practice" : "type-learn";
    const dotContent = isDone ? "✓" : String(index + 1);

    let actions = "";

    if (isPractice) {
        const status = isDone
            ? `<span class="step-status">✓ Đã hoàn thành</span>`
            : `<span class="step-status" style="color:var(--muted)">Chưa giải</span>`;

        actions = `
            <div class="roadmap-step-actions">
                <a href="problem.html?id=${step.problemId}" class="btn-step">
                    Làm bài: ${getProblemTitle(step.problemId)}
                </a>
                ${status}
            </div>
        `;
    } else if (step.lessonId) {
        const lessonDone = completedLessonIds.has(step.lessonId);
        const status = lessonDone
            ? `<span class="step-status">✓ Đã học</span>`
            : `<span class="step-status" style="color:var(--muted)">Chưa học</span>`;

        actions = `
            <div class="roadmap-step-actions">
                <a href="lesson.html?id=${step.lessonId}" class="btn-step">
                    Đọc bài học
                </a>
                ${status}
            </div>
        `;
    } else if (index < total - 1) {
        const next = currentRoadmap.steps[index + 1];
        if (next?.type === "practice") {
            actions = `
                <div class="roadmap-step-actions">
                    <a href="problem.html?id=${next.problemId}" class="btn-step btn-step-outline">
                        Tiếp theo: làm bài tập
                    </a>
                </div>
            `;
        }
    }

    return `
        <div class="roadmap-step ${stepClass}">
            <div class="roadmap-step-dot">${dotContent}</div>
            <div class="roadmap-step-card">
                <span class="roadmap-step-type ${typeClass}">${typeLabel}</span>
                <h3>${step.title}</h3>
                <p>${step.content}</p>
                ${actions}
            </div>
        </div>
    `;
}

function renderRoadmap(roadmap) {
    const practice = getPracticeSteps(roadmap);
    const progress = computeRoadmapProgress(roadmap, solvedIds);
    const solvedCount = practice.filter((s) => solvedIds.has(String(s.problemId))).length;
    const learnCount = roadmap.steps.filter((s) => s.type === "learn").length;

    document.title = `${roadmap.title} - Roadmap ATS`;

    contentEl.innerHTML = `
        <a href="roadmaps.html" class="roadmap-back">← Tất cả roadmaps</a>

        <div class="roadmap-hero">
            <span class="badge ${roadmap.levelClass}">${roadmap.level}</span>
            <h1>${roadmap.title}</h1>
            <p class="roadmap-hero-desc">${roadmap.description}</p>

            <div class="roadmap-hero-stats">
                <span><strong>${learnCount}</strong> bước lý thuyết</span>
                <span><strong>${practice.length}</strong> bài luyện tập</span>
                <span>Đã giải: <strong>${solvedCount}/${practice.length}</strong></span>
                <span>Tiến độ: <strong>${progress}%</strong></span>
            </div>

            <div class="roadmap-progress-wrap" style="margin-top:20px;max-width:400px">
                <div class="roadmap-progress-bar">
                    <div class="roadmap-progress-fill" style="width:${progress}%"></div>
                </div>
            </div>
        </div>

        <div class="roadmap-steps">
            <h2>Lộ trình học</h2>
            <div class="roadmap-timeline">
                ${roadmap.steps.map((step, i) => renderStep(step, i, roadmap.steps.length)).join("")}
            </div>
        </div>
    `;

    loadingEl.style.display = "none";
    notFoundEl.style.display = "none";
    contentEl.style.display = "block";
}

async function init() {
    if (!roadmapId) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    currentRoadmap = getRoadmapById(roadmapId);

    if (!currentRoadmap) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    const problems = await loadProblems();
    problemsMap = new Map(problems.map((p) => [String(p.id), p]));

    renderRoadmap(currentRoadmap);
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        solvedIds = await getSolvedIds(user.uid);
        completedLessonIds = await getCompletedLessonIds(user.uid);
    } else {
        solvedIds = new Set();
        completedLessonIds = new Set();
    }
    if (currentRoadmap) renderRoadmap(currentRoadmap);
});

init();
