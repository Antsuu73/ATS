import { VISUALIZERS, TOPIC_LABELS } from "./visualizers-data.js";

const gridEl = document.getElementById("visualizersGrid");
let filters = { topic: "all", search: "" };

const searchEl = document.getElementById("visualizersSearch");
const filterBtns = document.querySelectorAll("[data-filter]");

function getPreview(viz) {
    if (viz.engine === "bar-sort") {
        const heights = [40, 70, 30, 55, 60];
        return `<div class="preview-bars">${heights.map((h) => `<span style="height:${h}px"></span>`).join("")}</div>`;
    }
    if (viz.engine === "binary-search" || viz.engine === "linear-search") {
        return `<div class="preview-array">${[2, 5, 8, 12, 16].map((n, i) => `<span class="${i === 2 ? "on" : ""}">${n}</span>`).join("")}</div>`;
    }
    if (viz.engine === "stack") {
        return `<div class="preview-stack"><span style="height:28px"></span><span style="height:40px"></span><span style="height:52px"></span></div>`;
    }
    if (viz.engine === "queue") {
        return `<div class="preview-array">${[1, 2, 3].map((n) => `<span>${n}</span>`).join("")}</div>`;
    }
    if (viz.topic === "dp") {
        return `<div class="preview-dp">DP</div>`;
    }
    return `<div class="preview-graph">●──●──●</div>`;
}

function getFiltered() {
    const q = filters.search.trim().toLowerCase();
    return VISUALIZERS.filter((v) => {
        const matchTopic = filters.topic === "all" || v.topic === filters.topic;
        const matchSearch = !q ||
            v.title.toLowerCase().includes(q) ||
            v.description.toLowerCase().includes(q) ||
            (TOPIC_LABELS[v.topic] || "").toLowerCase().includes(q);
        return matchTopic && matchSearch;
    });
}

function renderCard(viz) {
    return `
        <a href="visualizer.html?id=${viz.id}" class="viz-card">
            <div class="viz-card-preview">${getPreview(viz)}</div>
            <span class="topic-badge">${TOPIC_LABELS[viz.topic] || viz.topic}</span>
            <h3>${viz.title}</h3>
            <p>${viz.description}</p>
            <div class="viz-card-meta">
                <span class="difficulty-badge difficulty-medium">${viz.complexity}</span>
            </div>
        </a>
    `;
}

function render() {
    if (!gridEl) return;
    const items = getFiltered();
    gridEl.innerHTML = items.length
        ? items.map(renderCard).join("")
        : `<div class="problems-empty">Không tìm thấy visualizer phù hợp.</div>`;
}

function setActiveFilters() {
    filterBtns.forEach((btn) => {
        btn.classList.toggle("active", filters[btn.dataset.filter] === btn.dataset.value);
    });
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

render();
