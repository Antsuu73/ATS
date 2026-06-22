import { getVisualizerById, TOPIC_LABELS } from "./visualizers-data.js";
import {
    createBarSortEngine,
    createBinarySearchEngine,
    createBfsEngine,
    createDfsEngine,
    createDijkstraEngine,
    clampSpeed,
    sleep
} from "./visualizer-engines.js";

const params = new URLSearchParams(window.location.search);
const vizId = params.get("id");

const loadingEl = document.getElementById("vizLoading");
const contentEl = document.getElementById("vizContent");
const notFoundEl = document.getElementById("vizNotFound");

let engine = null;
let playing = false;

function mountControls(panel, options = {}) {
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

function renderBubbleSort(viz) {
    const algo = viz.id === "insertion-sort" ? "insertion" : "bubble";
    contentEl.innerHTML = `
        <a href="visualizers.html" class="viz-back">← Tất cả visualizers</a>
        <div class="viz-panel">
            <header class="viz-panel-head">
                <span class="topic-badge">${TOPIC_LABELS[viz.topic]}</span>
                <h1>${viz.title}</h1>
                <p>${viz.description}</p>
            </header>
            <div class="viz-stage"><div class="viz-bars"></div></div>
            ${mountControls()}
        </div>
    `;
    const stage = contentEl.querySelector(".viz-stage");
    bindControls((logEl) => createBarSortEngine(stage, logEl, algo));
}

function renderBinarySearch(viz) {
    contentEl.innerHTML = `
        <a href="visualizers.html" class="viz-back">← Tất cả visualizers</a>
        <div class="viz-panel">
            <header class="viz-panel-head">
                <span class="topic-badge">${TOPIC_LABELS[viz.topic]}</span>
                <h1>${viz.title}</h1>
                <p>${viz.description}</p>
            </header>
            <div class="viz-stage" style="align-items:center"><div class="viz-array"></div></div>
            ${mountControls({ showTarget: true, showSpeed: true })}
        </div>
    `;
    const stage = contentEl.querySelector(".viz-stage");
    bindControls((logEl) => createBinarySearchEngine(stage, logEl));
}

function renderGraph(viz, factory) {
    contentEl.innerHTML = `
        <a href="visualizers.html" class="viz-back">← Tất cả visualizers</a>
        <div class="viz-panel">
            <header class="viz-panel-head">
                <span class="topic-badge">${TOPIC_LABELS[viz.topic]}</span>
                <h1>${viz.title}</h1>
                <p>${viz.description}</p>
            </header>
            <div class="viz-stage graph-stage" id="graphMount"></div>
            ${mountControls({ showSpeed: true })}
            ${viz.relatedLessonId ? `
                <div class="viz-related">
                    <a href="lesson.html?id=${viz.relatedLessonId}">📖 Đọc bài học liên quan</a>
                </div>
            ` : ""}
        </div>
    `;
    const stage = contentEl.querySelector("#graphMount");
    bindControls((logEl) => factory(stage, logEl));
}

function renderVisualizer(viz) {
    document.title = `${viz.title} - Visualizer ATS`;

    if (viz.id === "bubble-sort" || viz.id === "insertion-sort") {
        renderBubbleSort(viz);
    } else if (viz.id === "binary-search") {
        renderBinarySearch(viz);
    } else if (viz.id === "bfs") {
        renderGraph(viz, createBfsEngine);
    } else if (viz.id === "dfs") {
        renderGraph(viz, createDfsEngine);
    } else if (viz.id === "dijkstra") {
        renderGraph(viz, createDijkstraEngine);
    }

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
