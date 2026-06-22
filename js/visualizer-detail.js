import { getVisualizerById, TOPIC_LABELS } from "./visualizers-data.js";
import { LESSONS } from "./lessons-data.js";
import {
    createBarSortEngine,
    createBinarySearchEngine,
    createLinearSearchEngine,
    createBfsEngine,
    createDfsEngine,
    createDijkstraEngine,
    createTopoSortEngine,
    createKnapsackEngine,
    createCoinChangeEngine,
    createLisEngine,
    createStackEngine,
    createQueueEngine,
    createTreeBfsEngine,
    clampSpeed,
    sleep
} from "./visualizer-engines.js";

const params = new URLSearchParams(window.location.search);
const vizId = params.get("id");

const loadingEl = document.getElementById("vizLoading");
const contentEl = document.getElementById("vizContent");
const notFoundEl = document.getElementById("vizNotFound");

function getRelatedProblemLink(lessonId) {
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (!lesson?.relatedProblemId) return "";

    return `<a href="problem.html?id=${lesson.relatedProblemId}">✏️ Luyện tập bài liên quan</a>`;
}

let engine = null;
let playing = false;

const ENGINE_MAP = {
    "bar-sort": (stage, logEl, viz) => createBarSortEngine(stage, logEl, viz.algo || "bubble"),
    "binary-search": createBinarySearchEngine,
    "linear-search": createLinearSearchEngine,
    bfs: createBfsEngine,
    dfs: createDfsEngine,
    dijkstra: createDijkstraEngine,
    "topo-sort": createTopoSortEngine,
    knapsack: createKnapsackEngine,
    "coin-change": createCoinChangeEngine,
    lis: createLisEngine,
    stack: createStackEngine,
    queue: createQueueEngine,
    "tree-bfs": createTreeBfsEngine
};

function mountControls(options = {}) {
    const { showTarget = false, showSpeed = true } = options;

    return `
        <div class="viz-controls">
            <button type="button" class="viz-btn" id="vizPlay">▶ Play</button>
            <button type="button" class="viz-btn viz-btn-outline" id="vizStep">Step</button>
            <button type="button" class="viz-btn viz-btn-outline" id="vizReset">Reset</button>
            ${showTarget ? `<label>Tìm: <input class="viz-target-input" type="number" value="23"></label>` : ""}
            ${showSpeed ? `
                <div class="viz-speed">
                    <span>Tốc độ</span>
                    <input id="vizSpeed" type="range" min="100" max="1000" value="400">
                </div>
            ` : ""}
        </div>
        <div class="viz-log" id="vizLog">Sẵn sàng.</div>
    `;
}

function bindControls(initEngine) {
    const playBtn = document.getElementById("vizPlay");
    const stepBtn = document.getElementById("vizStep");
    const resetBtn = document.getElementById("vizReset");
    const speedEl = document.getElementById("vizSpeed");
    const logEl = document.getElementById("vizLog");

    engine = initEngine(logEl);

    async function doStep() {
        if (engine.stepFn) return engine.stepFn();
        if (engine.step) return engine.step();
        return false;
    }

    stepBtn?.addEventListener("click", async () => {
        playing = false;
        engine.setRunning?.(false);
        await doStep();
    });

    resetBtn?.addEventListener("click", () => {
        playing = false;
        engine.setRunning?.(false);
        engine.reset();
        if (playBtn) playBtn.textContent = "▶ Play";
    });

    playBtn?.addEventListener("click", async () => {
        if (engine.runLoop && engine.setRunning) {
            if (playing) {
                playing = false;
                engine.setRunning(false);
                playBtn.textContent = "▶ Play";
                return;
            }
            playing = true;
            engine.setRunning(true);
            playBtn.textContent = "⏸ Pause";
            await engine.runLoop(() => speedEl?.value || 400);
            playing = false;
            engine.setRunning(false);
            playBtn.textContent = "▶ Play";
            return;
        }

        playing = true;
        playBtn.textContent = "⏸ Pause";
        while (playing) {
            const cont = await doStep();
            if (!cont) {
                playing = false;
                playBtn.textContent = "▶ Play";
                break;
            }
            await sleep(clampSpeed(speedEl?.value || 500));
        }
    });
}

function getStageType(engineType) {
    if (engineType === "bar-sort") return "bars";
    if (["binary-search", "linear-search", "lis"].includes(engineType)) return "array";
    if (["knapsack", "coin-change", "stack", "queue"].includes(engineType)) return "custom";
    return "graph";
}

function renderVisualizer(viz) {
    document.title = `${viz.title} - Visualizer ATS`;
    const stageType = getStageType(viz.engine);
    const showTarget = viz.engine === "binary-search" || viz.engine === "linear-search";

    let stageHtml = "";
    if (stageType === "bars") stageHtml = `<div class="viz-stage"><div class="viz-bars"></div></div>`;
    else if (stageType === "array") stageHtml = `<div class="viz-stage" style="align-items:center"><div class="viz-array"></div></div>`;
    else if (stageType === "custom") stageHtml = `<div class="viz-stage viz-stage-custom" id="customMount"></div>`;
    else stageHtml = `<div class="viz-stage graph-stage" id="graphMount"></div>`;

    contentEl.innerHTML = `
        <a href="visualizers.html" class="viz-back">← Tất cả visualizers</a>
        <div class="viz-panel">
            <header class="viz-panel-head">
                <span class="topic-badge">${TOPIC_LABELS[viz.topic] || viz.topic}</span>
                <h1>${viz.title}</h1>
                <p>${viz.description}</p>
            </header>
            ${stageHtml}
            ${mountControls({ showTarget, showSpeed: true })}
            ${viz.relatedLessonId ? `
                <div class="viz-related">
                    <a href="lesson.html?id=${viz.relatedLessonId}">📖 Đọc bài học liên quan</a>
                    ${getRelatedProblemLink(viz.relatedLessonId)}
                </div>
            ` : ""}
        </div>
    `;

    const factory = ENGINE_MAP[viz.engine];
    if (!factory) return;

    let stage;
    if (stageType === "bars") stage = contentEl.querySelector(".viz-stage");
    else if (stageType === "array") stage = contentEl.querySelector(".viz-stage");
    else if (stageType === "custom") stage = contentEl.querySelector("#customMount");
    else stage = contentEl.querySelector("#graphMount");

    bindControls((logEl) => {
        if (viz.engine === "bar-sort") return factory(stage, logEl, viz);
        return factory(stage, logEl);
    });

    loadingEl.style.display = "none";
    notFoundEl.style.display = "none";
    contentEl.style.display = "block";
}

function init() {
    if (!vizId) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    const viz = getVisualizerById(vizId);
    if (!viz) {
        loadingEl.style.display = "none";
        notFoundEl.style.display = "block";
        return;
    }

    renderVisualizer(viz);
}

init();
