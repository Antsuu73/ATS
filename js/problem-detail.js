import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    loadProblemById,
    isProblemSolved,
    markProblemSolved,
    getFavoriteProblemIds,
    toggleFavoriteProblem
} from "./problems-service.js";
import { TOPIC_LABELS } from "./problems-data.js";
import { refreshUserProgress } from "./progress.js";
import { getVisualizerForProblem } from "./visualizers-data.js";
import { escapeHtml } from "./security.js";

const params = new URLSearchParams(window.location.search);
const problemId = params.get("id");

function isValidId(id) {
    return id && /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

const loadingEl = document.getElementById("problemLoading");
const contentEl = document.getElementById("problemContent");
const notFoundEl = document.getElementById("problemNotFound");

let currentProblem = null;
let currentUser = null;
let solved = false;
let favorite = false;

function getDifficultyClass(difficulty) {
    const key = String(difficulty).toLowerCase();
    if (key === "easy") return "difficulty-easy";
    if (key === "hard") return "difficulty-hard";
    return "difficulty-medium";
}

function renderExamples(examples) {
    if (!examples.length) {
        return `<p class="login-hint">Chưa có ví dụ cho bài này.</p>`;
    }

    return examples.map((ex, i) => `
        <div class="example-box">
            <strong>Ví dụ ${i + 1}</strong>
            <code>Input: ${escapeHtml(ex.input)}</code><br>
            <code>Output: ${escapeHtml(ex.output)}</code>
        </div>
    `).join("");
}

function renderActions() {
    const actionsEl = document.getElementById("problemActions");
    if (!actionsEl) return;

    let html = "";

    if (currentProblem) {
        const viz = getVisualizerForProblem(currentProblem.id);
        if (viz) {
            html += `
                <a href="visualizer.html?id=${viz.id}" class="btn-solve btn-solve-outline">
                    Xem visualizer: ${escapeHtml(viz.title)}
                </a>
            `;
        }
    }

    if (!currentUser) {
        html += `
            <p class="login-hint">
                <a href="login.html">Đăng nhập</a> để đánh dấu bài đã giải và cập nhật tiến độ.
            </p>
        `;
        actionsEl.innerHTML = html;
        return;
    }

    if (solved) {
        html += `<div class="solved-banner">✓ Bạn đã giải bài này</div>`;
        actionsEl.innerHTML = html;
        return;
    }

    html += `<button id="solveBtn" class="btn-solve" type="button">Đánh dấu đã giải</button>`;
    actionsEl.innerHTML = html;

    document.getElementById("solveBtn").addEventListener("click", handleSolve);
}

async function handleSolve() {
    const btn = document.getElementById("solveBtn");
    if (!currentUser || !currentProblem || solved) return;

    btn.disabled = true;
    btn.textContent = "Đang lưu...";

    try {
        await markProblemSolved(currentUser.uid, currentProblem.id);
        solved = true;
        renderActions();
    } catch (err) {
        console.error("Mark solved error:", err);
        btn.disabled = false;
        btn.textContent = "Đánh dấu đã giải";
        alert(err.message || "Không thể lưu trạng thái. Vui lòng thử lại.");
        return;
    }

    try {
        await refreshUserProgress(currentUser.uid);
    } catch (err) {
        console.warn("Progress update after solve failed:", err);
    }
}

function renderProblem(problem) {
    document.title = `${problem.title} - ATS`;

    contentEl.innerHTML = `
        <a href="problems.html" class="problem-back">← Quay lại danh sách</a>

        <div class="problem-detail-card">
            <div class="problem-detail-head">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h1>${escapeHtml(problem.id)}. ${escapeHtml(problem.title)}</h1>
                    <button id="favBtn" class="btn-fav-problem" data-id="${escapeHtml(problem.id)}" style="background:transparent; border:none; cursor:pointer; font-size:24px;" title="${favorite ? "Bỏ yêu thích" : "Yêu thích"}">
                        ${favorite ? "📌" : "📍"}
                    </button>
                </div>
                <span class="topic-badge">${escapeHtml(TOPIC_LABELS[problem.topic] || problem.topic)}</span>
                <span class="difficulty-badge ${getDifficultyClass(problem.difficulty)}">${escapeHtml(problem.difficulty)}</span>
                ${problem.tag ? `<span class="topic-badge">${escapeHtml(problem.tag)}</span>` : ""}
            </div>

            <div class="problem-meta">
                <span>Rating: <strong>${escapeHtml(problem.rating || "—")}</strong></span>
            </div>

            <div class="problem-section">
                <h2>Đề bài</h2>
                <p>${escapeHtml(problem.description || "Chưa có mô tả.")}</p>
            </div>

            <div class="problem-section">
                <h2>Ví dụ</h2>
                ${renderExamples(problem.examples)}
            </div>

            ${problem.constraints ? `
                <div class="problem-section">
                    <h2>Ràng buộc</h2>
                    <p>${escapeHtml(problem.constraints)}</p>
                </div>
            ` : ""}

            <div class="problem-actions" id="problemActions"></div>
        </div>
    `;

    loadingEl.style.display = "none";
    notFoundEl.style.display = "none";
    contentEl.style.display = "block";
    renderActions();
    
    const favBtn = document.getElementById("favBtn");
    if (favBtn) {
        favBtn.addEventListener("click", async () => {
            const uid = currentUser?.uid || "guest";
            favorite = await toggleFavoriteProblem(uid, currentProblem.id);
            renderProblem(currentProblem); // re-render to update icon
        });
    }
}

async function init() {
    if (!isValidId(problemId)) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    currentProblem = await loadProblemById(problemId);

    if (!currentProblem) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    renderProblem(currentProblem);
}

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user && currentProblem) {
        solved = await isProblemSolved(user.uid, currentProblem.id);
        const favs = await getFavoriteProblemIds(user.uid);
        favorite = favs.has(String(currentProblem.id));
        renderProblem(currentProblem);
        renderActions();
    } else {
        solved = false;
        if (currentProblem) {
            const favs = await getFavoriteProblemIds("guest");
            favorite = favs.has(String(currentProblem.id));
            renderProblem(currentProblem);
        }
        renderActions();
    }
});

init();
