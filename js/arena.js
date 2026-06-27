import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { escapeHtml } from "./security.js";
import {
    loadCustomProblems,
    loadCustomProblemById,
    createCustomProblem,
    deleteCustomProblem,
    markCustomProblemSolved,
    isLocalSolvedCustomProblem,
    addLocalSolvedCustomProblem,
    normalizeCustomProblem,
    timeAgo
} from "./arena-service.js";

let allProblems = [];
let filtered = [];
let currentUser = null;
let currentDetailId = null;

const listEl = document.getElementById("arenaList");
const detailEl = document.getElementById("arenaDetail");
const statsEl = document.getElementById("arenaStats");
const searchEl = document.getElementById("arenaSearch");
const filterBtns = document.querySelectorAll("[data-filter]");

const btnCreate = document.getElementById("btnCreate");
const createModal = document.getElementById("createModal");
const btnCloseCreate = document.getElementById("btnCloseCreate");
const btnCancelCreate = document.getElementById("btnCancelCreate");
const createModalBackdrop = document.getElementById("createModalBackdrop");
const createForm = document.getElementById("createForm");

let filters = {
    difficulty: "all",
    status: "all",
    search: ""
};

function getDifficultyClass(difficulty) {
    const key = String(difficulty || "").toLowerCase();
    if (key === "easy") return "easy";
    if (key === "hard") return "hard";
    return "medium";
}

function getDifficultyLabel(difficulty) {
    const key = String(difficulty || "").toLowerCase();
    if (key === "easy") return "Easy";
    if (key === "hard") return "Hard";
    return "Medium";
}

function applyFilters() {
    const q = filters.search.trim().toLowerCase();

    filtered = allProblems.filter((p) => {
        const matchDiff = filters.difficulty === "all" ||
            String(p.difficulty || "").toLowerCase() === filters.difficulty.toLowerCase();

        const isSolved = currentUser && isLocalSolvedCustomProblem(currentUser.uid, p.id);
        const matchStatus = filters.status === "all" ||
            (filters.status === "solved" && isSolved) ||
            (filters.status === "unsolved" && !isSolved);

        const matchSearch = !q ||
            p.title.toLowerCase().includes(q) ||
            (p.authorName || "").toLowerCase().includes(q) ||
            String(p.rating || "").includes(q);

        return matchDiff && matchStatus && matchSearch;
    });

    render();
}

function renderStats() {
    if (!statsEl) return;

    const solvedCount = filtered.filter((p) => {
        if (!currentUser) return false;
        return isLocalSolvedCustomProblem(currentUser.uid, p.id);
    }).length;

    statsEl.innerHTML = `
        <span><strong>${filtered.length}</strong> bài tập</span>
        <span>Đã giải: <strong>${solvedCount}</strong></span>
        <span>Tác giả: <strong>${new Set(filtered.map((p) => p.authorId)).size}</strong></span>
    `;
}

function renderList() {
    if (!listEl) return;

    if (!allProblems.length) {
        listEl.innerHTML = `
            <div class="arena-empty">
                <h3>Chưa có bài tập nào</h3>
                <p>Hãy là người đầu tiên tạo bài tập để mọi người cùng giải!</p>
            </div>
        `;
        return;
    }

    if (!filtered.length) {
        listEl.innerHTML = `
            <div class="arena-empty">
                <h3>Không tìm thấy bài phù hợp</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map((p) => {
        const solved = currentUser ? isLocalSolvedCustomProblem(currentUser.uid, p.id) : false;
        const diffClass = getDifficultyClass(p.difficulty);
        const diffLabel = getDifficultyLabel(p.difficulty);

        return `
            <div class="arena-card" data-id="${escapeHtml(p.id)}">
                <div class="arena-card-header">
                    <span class="arena-topic">Tùy chỉnh</span>
                    <span class="arena-difficulty ${diffClass}">${escapeHtml(diffLabel)}</span>
                </div>
                <h3>${escapeHtml(p.title)}</h3>
                <div class="arena-card-meta">
                    <span>⭐ ${escapeHtml(String(p.rating || 0))}</span>
                    <span>👤 ${escapeHtml(p.authorName || "User")}</span>
                    <span>👥 ${escapeHtml(String((p.solvedBy || []).length))} đã giải</span>
                    ${solved ? '<span style="color:#16a34a; font-weight:700;">✓ Đã giải</span>' : ''}
                </div>
                <div class="arena-card-actions">
                    <button class="btn-secondary btn-view-arena" data-id="${escapeHtml(p.id)}" type="button">Xem chi tiết</button>
                    ${solved ? '' : `<button class="btn-solve btn-solve-quick" data-id="${escapeHtml(p.id)}" type="button">Đánh dấu đã giải</button>`}
                    ${currentUser && currentUser.uid === p.authorId ? `<button class="btn-secondary btn-delete-arena" data-id="${escapeHtml(p.id)}" type="button" style="color:#dc2626; border-color:#dc2626;">Xóa</button>` : ''}
                </div>
            </div>
        `;
    }).join("");

    listEl.querySelectorAll(".btn-view-arena").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            await openDetail(id);
        });
    });

    listEl.querySelectorAll(".btn-solve-quick").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            await handleMarkSolved(id);
        });
    });

    listEl.querySelectorAll(".btn-delete-arena").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm("Bạn có chắc muốn xóa bài tập này không?")) {
                await handleDelete(id);
            }
        });
    });

    listEl.querySelectorAll(".arena-card").forEach((card) => {
        card.addEventListener("click", async () => {
            const id = card.dataset.id;
            await openDetail(id);
        });
    });
}

function escapeCode(text) {
    if (text == null) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function openDetail(id) {
    if (!id) return;

    const problem = await loadCustomProblemById(id);
    if (!problem) {
        alert("Không tìm thấy bài tập.");
        return;
    }

    currentDetailId = id;

    const solved = currentUser ? isLocalSolvedCustomProblem(currentUser.uid, id) : false;
    const isOwner = currentUser && currentUser.uid === problem.authorId;
    const diffClass = getDifficultyClass(problem.difficulty);
    const diffLabel = getDifficultyLabel(problem.difficulty);

    let actionsHtml = "";

    if (!currentUser) {
        actionsHtml += `<p class="login-hint"><a href="login.html">Đăng nhập</a> để đánh dấu bài đã giải.</p>`;
    } else if (solved) {
        actionsHtml += `<div class="solved-banner">✓ Bạn đã giải bài này</div>`;
    } else {
        actionsHtml += `<button id="solveArenaBtn" class="btn-solve" type="button">Đánh dấu đã giải</button>`;
    }

    if (isOwner) {
        actionsHtml += `<button id="deleteArenaBtn" class="btn-secondary" type="button" style="color:#dc2626; border-color:#dc2626; margin-left:8px;">Xóa bài tập</button>`;
    }

    detailEl.innerHTML = `
        <a href="arena.html" class="btn-back">← Quay lại danh sách</a>

        <div class="arena-detail-card">
            <div class="arena-detail-head">
                <div>
                    <h1>${escapeHtml(problem.title)}</h1>
                    <div class="arena-detail-badges">
                        <span class="arena-topic">Tùy chỉnh</span>
                        <span class="arena-difficulty ${diffClass}">${escapeHtml(diffLabel)}</span>
                    </div>
                </div>
            </div>

            <div class="arena-meta">
                <span>Rating: <strong>${escapeHtml(String(problem.rating || 0))}</strong></span>
                <span>👥 <strong>${escapeHtml(String((problem.solvedBy || []).length))}</strong> đã giải</span>
            </div>

            <div class="arena-author">
                Tác giả: <strong>${escapeHtml(problem.authorName || "User")}</strong>
                · ${timeAgo(problem.createdAt)}
            </div>

            <div class="arena-section">
                <h2>Đề bài</h2>
                <p>${escapeHtml(problem.description || "Chưa có mô tả.")}</p>
            </div>

            <div class="arena-section">
                <div class="arena-io-label">Input mẫu</div>
                <div class="arena-io-box">${escapeCode(problem.input || "(trống)")}</div>
            </div>

            <div class="arena-section">
                <div class="arena-io-label">Output mẫu</div>
                <div class="arena-io-box">${escapeCode(problem.output || "(trống)")}</div>
            </div>

            <div class="arena-actions" id="arenaActions">
                ${actionsHtml}
            </div>
        </div>
    `;

    listEl.style.display = "none";
    detailEl.style.display = "block";

    const solveBtn = document.getElementById("solveArenaBtn");
    if (solveBtn) {
        solveBtn.addEventListener("click", async () => {
            await handleMarkSolved(id);
            if (currentDetailId === id) {
                await openDetail(id);
            }
            render();
        });
    }

    const deleteBtn = document.getElementById("deleteArenaBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
            if (confirm("Bạn có chắc muốn xóa bài tập này không?")) {
                await handleDelete(id);
                await showList();
            }
        });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleMarkSolved(id) {
    if (!currentUser) {
        alert("Vui lòng đăng nhập để đánh dấu bài đã giải.");
        return;
    }

    const problem = allProblems.find((p) => p.id === id);
    if (!problem) return;

    try {
        await markCustomProblemSolved(currentUser.uid, id);
        addLocalSolvedCustomProblem(currentUser.uid, id);
        render();
    } catch (err) {
        console.error("Mark solved error:", err);
        alert(err.message || "Không thể lưu trạng thái.");
    }
}

async function handleDelete(id) {
    try {
        await deleteCustomProblem(id);
        allProblems = allProblems.filter((p) => p.id !== id);
        filtered = filtered.filter((p) => p.id !== id);
        render();
        await showList();
    } catch (err) {
        console.error("Delete error:", err);
        alert(err.message || "Không thể xóa bài tập.");
    }
}

async function showList() {
    currentDetailId = null;
    detailEl.style.display = "none";
    listEl.style.display = "flex";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function openCreateModal() {
    if (!currentUser) {
        alert("Vui lòng đăng nhập để tạo bài tập.");
        return;
    }

    createModal.style.display = "flex";
    createForm.reset();
    document.getElementById("createTitle").focus();
}

function closeCreateModal() {
    createModal.style.display = "none";
}

async function handleCreateSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
        alert("Vui lòng đăng nhập.");
        return;
    }

    const title = document.getElementById("createTitle").value.trim();
    const description = document.getElementById("createDescription").value.trim();
    const difficulty = document.getElementById("createDifficulty").value;
    const rating = document.getElementById("createRating").value;
    const input = document.getElementById("createInput").value.trim();
    const output = document.getElementById("createOutput").value.trim();

    if (!title || !description || !input || !output) {
        alert("Vui lòng điền đầy đủ tiêu đề, đề bài, input và output.");
        return;
    }

    const btn = createForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Đang đăng...";

    try {
        const problem = await createCustomProblem({
            title,
            description,
            difficulty,
            rating,
            input,
            output
        });

        allProblems.unshift(problem);
        filtered = [...allProblems];
        closeCreateModal();
        render();
        await showList();
    } catch (err) {
        console.error("Create error:", err);
        alert(err.message || "Không thể tạo bài tập.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Đăng bài";
    }
}

function render() {
    renderStats();
    renderList();
}

async function init() {
    allProblems = await loadCustomProblems();
    applyFilters();
}

btnCreate.addEventListener("click", openCreateModal);
btnCloseCreate.addEventListener("click", closeCreateModal);
btnCancelCreate.addEventListener("click", closeCreateModal);
createModalBackdrop.addEventListener("click", closeCreateModal);
createForm.addEventListener("submit", handleCreateSubmit);

searchEl.addEventListener("input", () => {
    filters.search = searchEl.value;
    applyFilters();
});

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const filterType = btn.dataset.filter;
        const filterValue = btn.dataset.value;

        filters[filterType] = filterValue;

        const siblings = btn.parentElement.querySelectorAll(".filter-btn");
        siblings.forEach((s) => s.classList.remove("active"));
        btn.classList.add("active");

        applyFilters();
    });
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && createModal.style.display === "flex") {
        closeCreateModal();
    }
});

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        allProblems = await loadCustomProblems();
    }
    applyFilters();
});

init();