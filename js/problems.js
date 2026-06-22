import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { loadProblems, getSolvedIds } from "./problems-service.js";
import { TOPIC_LABELS, DIFFICULTY_ORDER } from "./problems-data.js";
import { escapeHtml } from "./security.js";

const PER_PAGE = 8;

let allProblems = [];
let filtered = [];
let solvedIds = new Set();
let page = 1;

let filters = {
    topic: "all",
    difficulty: "all",
    search: ""
};

const listEl = document.getElementById("problemsList");
const paginationEl = document.getElementById("problemsPagination");
const searchEl = document.getElementById("problemsSearch");
const statsEl = document.getElementById("problemsStats");
const filterBtns = document.querySelectorAll("[data-filter]");

function getDifficultyClass(difficulty) {
    const key = String(difficulty).toLowerCase();
    if (key === "easy") return "difficulty-easy";
    if (key === "hard") return "difficulty-hard";
    return "difficulty-medium";
}

function applyFilters() {
    const q = filters.search.trim().toLowerCase();

    filtered = allProblems.filter((p) => {
        const matchTopic = filters.topic === "all" || p.topic === filters.topic;
        const matchDiff = filters.difficulty === "all" ||
            p.difficulty.toLowerCase() === filters.difficulty.toLowerCase();
        const matchSearch = !q ||
            p.title.toLowerCase().includes(q) ||
            p.tag.toLowerCase().includes(q) ||
            String(p.id).includes(q) ||
            (TOPIC_LABELS[p.topic] || "").toLowerCase().includes(q);

        return matchTopic && matchDiff && matchSearch;
    });

    filtered.sort((a, b) => {
        const diff = (DIFFICULTY_ORDER[a.difficulty] || 2) - (DIFFICULTY_ORDER[b.difficulty] || 2);
        if (diff !== 0) return diff;
        return Number(a.id) - Number(b.id);
    });

    page = 1;
    render();
}

function renderStats() {
    if (!statsEl) return;

    const solvedCount = filtered.filter((p) => solvedIds.has(String(p.id))).length;

    statsEl.innerHTML = `
        <span><strong>${filtered.length}</strong> bài</span>
        <span>Đã giải: <strong>${solvedCount}</strong></span>
    `;
}

function renderList() {
    if (!listEl) return;

    if (!allProblems.length) {
        listEl.innerHTML = `<div class="problems-empty">Chưa có bài tập nào.</div>`;
        return;
    }

    if (!filtered.length) {
        listEl.innerHTML = `<div class="problems-empty">Không tìm thấy bài phù hợp.</div>`;
        return;
    }

    const start = (page - 1) * PER_PAGE;
    const items = filtered.slice(start, start + PER_PAGE);

    const rows = items.map((p) => {
        const isSolved = solvedIds.has(String(p.id));
        const statusClass = isSolved ? "status-solved" : "status-unsolved";
        const statusText = isSolved ? "Đã giải" : "Chưa giải";

        return `
            <tr class="problem-row" data-id="${escapeHtml(p.id)}">
                <td class="problem-id">${escapeHtml(p.id)}</td>
                <td class="problem-title-cell">${escapeHtml(p.title)}</td>
                <td><span class="topic-badge">${escapeHtml(TOPIC_LABELS[p.topic] || p.topic)}</span></td>
                <td><span class="difficulty-badge ${getDifficultyClass(p.difficulty)}">${escapeHtml(p.difficulty)}</span></td>
                <td>${escapeHtml(p.rating || "—")}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join("");

    listEl.innerHTML = `
        <table class="problems-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Tiêu đề</th>
                    <th>Chủ đề</th>
                    <th>Độ khó</th>
                    <th>Rating</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;

    listEl.querySelectorAll(".problem-row").forEach((row) => {
        row.addEventListener("click", () => {
            window.location.href = `problem.html?id=${row.dataset.id}`;
        });
    });
}

function renderPagination() {
    if (!paginationEl) return;

    const total = Math.ceil(filtered.length / PER_PAGE) || 1;
    paginationEl.innerHTML = "";

    if (total <= 1) return;

    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.textContent = "←";
    prev.disabled = page === 1;
    prev.onclick = () => {
        page -= 1;
        render();
    };
    paginationEl.appendChild(prev);

    for (let i = 1; i <= total; i++) {
        const btn = document.createElement("button");
        btn.className = `page-btn${i === page ? " active" : ""}`;
        btn.textContent = String(i);
        btn.onclick = () => {
            page = i;
            render();
        };
        paginationEl.appendChild(btn);
    }

    const next = document.createElement("button");
    next.className = "page-btn";
    next.textContent = "→";
    next.disabled = page === total;
    next.onclick = () => {
        page += 1;
        render();
    };
    paginationEl.appendChild(next);
}

function render() {
    renderStats();
    renderList();
    renderPagination();
}

function setActiveFilterButtons() {
    filterBtns.forEach((btn) => {
        const type = btn.dataset.filter;
        const value = btn.dataset.value;
        const isActive = filters[type] === value;
        btn.classList.toggle("active", isActive);
    });
}

function initFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    const difficulty = params.get("difficulty");

    if (topic) filters.topic = topic;
    if (difficulty) filters.difficulty = difficulty;
}

async function init() {
    if (listEl) {
        listEl.innerHTML = `<div class="problems-loading">Đang tải bài tập...</div>`;
    }

    initFiltersFromUrl();
    allProblems = await loadProblems();
    applyFilters();
    setActiveFilterButtons();
}

if (searchEl) {
    searchEl.addEventListener("input", (e) => {
        filters.search = e.target.value;
        applyFilters();
    });
}

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.filter;
        const value = btn.dataset.value;
        filters[type] = value;
        setActiveFilterButtons();
        applyFilters();
    });
});

onAuthStateChanged(auth, async (user) => {
    solvedIds = user ? await getSolvedIds(user.uid) : new Set();
    render();
});

init();
