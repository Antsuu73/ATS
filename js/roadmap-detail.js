import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getSolvedIds, loadProblems } from "./problems-service.js";
import { getCompletedLessonIds } from "./lessons-service.js";
import {
    getRoadmapById,
    getPracticeSteps,
    computeRoadmapProgress
} from "./roadmaps-data.js";
import { getVisualizerById } from "./visualizers-data.js";

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

function renderStep(step, index) {
    const isPractice = step.type === "practice";
    const isVisualize = step.type === "visualize";

    let stepClass = `step-${step.type}`;
    let typeLabel = "Lý thuyết";
    let typeClass = "type-learn";
    let dotContent = String(index + 1);
    let actions = "";

    if (isPractice) {
        const isDone = solvedIds.has(String(step.problemId));
        typeLabel = "Luyện tập";
        typeClass = "type-practice";
        if (isDone) {
            stepClass = "step-done";
            dotContent = "✓";
        }

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
    } else if (isVisualize) {
        typeLabel = "Mô phỏng";
        typeClass = "type-visualize";
        const viz = getVisualizerById(step.visualizerId);
        const vizTitle = viz ? viz.title : step.title;

        actions = `
            <div class="roadmap-step-actions">
                <a href="visualizer.html?id=${step.visualizerId}" class="btn-step btn-step-viz">
                    Mở visualizer: ${vizTitle}
                </a>
            </div>
        `;
    } else if (step.lessonId) {
        const lessonDone = completedLessonIds.has(step.lessonId);
        if (lessonDone) {
            stepClass = "step-done";
            dotContent = "✓";
        }

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
    const vizCount = roadmap.steps.filter((s) => s.type === "visualize").length;

    document.title = `${roadmap.title} - Roadmap ATS`;

    contentEl.innerHTML = `
        <a href="roadmaps.html" class="roadmap-back">← Tất cả roadmaps</a>

        <div class="roadmap-hero">
            <span class="badge ${roadmap.levelClass}">${roadmap.level}</span>
            <h1>${roadmap.title}</h1>
            <p class="roadmap-hero-desc">${roadmap.description}</p>

            <div class="roadmap-hero-stats">
                <span><strong>${learnCount}</strong> bước lý thuyết</span>
                <span><strong>${vizCount}</strong> visualizers</span>
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
                ${roadmap.steps.map((step, i) => renderStep(step, i)).join("")}
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
