import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getSolvedIds } from "./problems-service.js";
import {
    ROADMAPS,
    getPracticeSteps,
    computeRoadmapProgress
} from "./roadmaps-data.js";

const gridEl = document.getElementById("roadmapsGrid");
let solvedIds = new Set();

function renderCard(roadmap) {
    const practice = getPracticeSteps(roadmap);
    const progress = computeRoadmapProgress(roadmap, solvedIds);
    const solvedCount = practice.filter((s) => solvedIds.has(String(s.problemId))).length;

    const skills = roadmap.skills
        .slice(0, 4)
        .map((s) => `<span class="roadmap-skill">${s}</span>`)
        .join("");

    return `
        <a href="roadmap.html?id=${roadmap.id}" class="roadmap-card">
            <span class="badge ${roadmap.levelClass}">${roadmap.level}</span>
            <h3>${roadmap.title}</h3>
            <p>${roadmap.description}</p>
            <div class="roadmap-card-meta">${skills}</div>
            <div class="roadmap-progress-wrap">
                <div class="roadmap-progress-label">
                    <span>Tiến độ</span>
                    <strong>${progress}%</strong>
                </div>
                <div class="roadmap-progress-bar">
                    <div class="roadmap-progress-fill" style="width:${progress}%"></div>
                </div>
                <div class="roadmap-card-footer">
                    ${solvedCount}/${practice.length} bài đã giải →
                </div>
            </div>
        </a>
    `;
}

function render() {
    if (!gridEl) return;
    gridEl.innerHTML = ROADMAPS.map(renderCard).join("");
    window.refreshATSAnimations?.(gridEl);
}

onAuthStateChanged(auth, async (user) => {
    solvedIds = user ? await getSolvedIds(user.uid) : new Set();
    render();
});

render();
