import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
    loadProblemById,
    loadProblems,
    isProblemSolved,
    markProblemSolved,
    getSolvedIds
} from "./problems-service.js";
import { TOPIC_LABELS } from "./problems-data.js";
import { updateProgressFromSolved } from "./progress.js";

const params = new URLSearchParams(window.location.search);
const problemId = params.get("id");

const loadingEl = document.getElementById("problemLoading");
const contentEl = document.getElementById("problemContent");
const notFoundEl = document.getElementById("problemNotFound");

let currentProblem = null;
let currentUser = null;
let solved = false;

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
            <code>Input: ${ex.input}</code><br>
            <code>Output: ${ex.output}</code>
        </div>
    `).join("");
}

function renderActions() {
    const actionsEl = document.getElementById("problemActions");
    if (!actionsEl) return;

    if (!currentUser) {
        actionsEl.innerHTML = `
            <p class="login-hint">
                <a href="login.html">Đăng nhập</a> để đánh dấu bài đã giải và cập nhật tiến độ.
            </p>
        `;
        return;
    }

    if (solved) {
        actionsEl.innerHTML = `
            <div class="solved-banner">✓ Bạn đã giải bài này</div>
        `;
        return;
    }

    actionsEl.innerHTML = `
        <button id="solveBtn" class="btn-solve" type="button">Đánh dấu đã giải</button>
    `;

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

        const allProblems = await loadProblems();
        const solvedSet = await getSolvedIds(currentUser.uid);

        await updateProgressFromSolved(solvedSet, allProblems);
        renderActions();
    } catch (err) {
        console.error("Mark solved error:", err);
        btn.disabled = false;
        btn.textContent = "Đánh dấu đã giải";
        alert("Không thể lưu trạng thái. Vui lòng thử lại.");
    }
}

function renderProblem(problem) {
    document.title = `${problem.title} - ATS`;

    contentEl.innerHTML = `
        <a href="problems.html" class="problem-back">← Quay lại danh sách</a>

        <div class="problem-detail-card">
            <div class="problem-detail-head">
                <h1>${problem.id}. ${problem.title}</h1>
                <span class="topic-badge">${TOPIC_LABELS[problem.topic] || problem.topic}</span>
                <span class="difficulty-badge ${getDifficultyClass(problem.difficulty)}">${problem.difficulty}</span>
                ${problem.tag ? `<span class="topic-badge">${problem.tag}</span>` : ""}
            </div>

            <div class="problem-meta">
                <span>Rating: <strong>${problem.rating || "—"}</strong></span>
            </div>

            <div class="problem-section">
                <h2>Đề bài</h2>
                <p>${problem.description || "Chưa có mô tả."}</p>
            </div>

            <div class="problem-section">
                <h2>Ví dụ</h2>
                ${renderExamples(problem.examples)}
            </div>

            ${problem.constraints ? `
                <div class="problem-section">
                    <h2>Ràng buộc</h2>
                    <p>${problem.constraints}</p>
                </div>
            ` : ""}

            <div class="problem-actions" id="problemActions"></div>
        </div>
    `;

    loadingEl.style.display = "none";
    notFoundEl.style.display = "none";
    contentEl.style.display = "block";
    renderActions();
}

async function init() {
    if (!problemId) {
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
        renderActions();
    } else {
        solved = false;
        renderActions();
    }
});

init();
