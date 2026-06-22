function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampSpeed(val) {
    return Math.max(100, Math.min(1200, Number(val) || 400));
}

export function createBarSortEngine(container, logEl, algorithm) {
    const initial = [64, 34, 25, 12, 22, 11, 90, 45];
    let arr = [...initial];
    let running = false;
    let i = 0;
    let j = 0;
    let phase = "compare";

    const stage = container.querySelector(".viz-bars") || container;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render(compare = [], sortedFrom = arr.length) {
        stage.innerHTML = arr.map((val, idx) => {
            let cls = "viz-bar";
            if (compare.includes(idx)) cls += phase === "swap" ? " swap" : " compare";
            if (idx >= sortedFrom) cls += " sorted";
            const h = Math.max(24, val * 2);
            return `
                <div class="viz-bar-wrap">
                    <div class="${cls}" style="height:${h}px" data-i="${idx}"></div>
                    <span class="viz-bar-label">${val}</span>
                </div>
            `;
        }).join("");
    }

    function reset() {
        running = false;
        arr = [...initial];
        i = 0;
        j = 0;
        phase = "compare";
        render();
        log("Nhấn Play hoặc Step để bắt đầu.");
    }

    async function bubbleStep() {
        if (i >= arr.length - 1) {
            render([], arr.length);
            log("Hoàn thành! Mảng đã được sắp xếp.");
            running = false;
            return false;
        }

        render([j, j + 1], arr.length - i);
        log(`So sánh arr[${j}]=${arr[j]} và arr[${j + 1}]=${arr[j + 1]}`);

        if (arr[j] > arr[j + 1]) {
            phase = "swap";
            render([j, j + 1], arr.length - i);
            log(`Đổi chỗ ${arr[j]} ↔ ${arr[j + 1]}`);
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            render([j, j + 1], arr.length - i);
            phase = "compare";
        }

        j++;
        if (j >= arr.length - i - 1) {
            i++;
            j = 0;
        }
        return true;
    }

    async function insertionStep() {
        if (i >= arr.length) {
            render([], arr.length);
            log("Hoàn thành! Mảng đã được sắp xếp.");
            running = false;
            return false;
        }

        let key = arr[i];
        let k = i - 1;
        render([i], i);

        while (k >= 0 && arr[k] > key) {
            render([k, k + 1], i + 1);
            log(`Chèn ${key}: dịch ${arr[k]} sang phải`);
            arr[k + 1] = arr[k];
            k--;
            await sleep(0);
        }

        arr[k + 1] = key;
        render([k + 1], i + 1);
        log(`Đặt ${key} vào vị trí ${k + 1}`);
        i++;
        return true;
    }

    const stepFn = algorithm === "insertion" ? insertionStep : bubbleStep;

    async function runLoop(getSpeed) {
        while (running) {
            const cont = await stepFn();
            if (!cont) break;
            await sleep(clampSpeed(getSpeed()));
        }
    }

    reset();
    return { reset, stepFn, runLoop, setRunning: (v) => { running = v; } };
}

export function createBinarySearchEngine(container, logEl) {
    const data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    let low = 0;
    let high = data.length - 1;
    let mid = -1;
    let found = false;
    let done = false;

    function getTarget() {
        const input = container.closest(".viz-panel")?.querySelector(".viz-target-input");
        return Number(input?.value) || 23;
    }

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render() {
        const target = getTarget();
        const arrEl = container.querySelector(".viz-array") || container;
        arrEl.innerHTML = data.map((val, idx) => {
            let cls = "viz-cell-value";
            if (found && idx === mid) cls += " found";
            else if (idx === mid) cls += " active";
            else if (idx >= low && idx <= high) cls += " range";

            let pointer = "";
            if (idx === low && !done) pointer = "L";
            if (idx === mid && mid >= 0) pointer = pointer ? pointer + "/M" : "M";
            if (idx === high && !done) pointer = pointer ? pointer + "/H" : "H";

            return `
                <div class="viz-cell">
                    <span class="viz-cell-pointer">${pointer}</span>
                    <span class="${cls}">${val}</span>
                </div>
            `;
        }).join("");

        if (!done) {
            log(`Tìm ${target} | low=${low}, high=${high}${mid >= 0 ? `, mid=${mid} (arr[${mid}]=${data[mid]})` : ""}`);
        }
    }

    function reset() {
        low = 0;
        high = data.length - 1;
        mid = -1;
        found = false;
        done = false;
        render();
        log(`Mảng đã sắp xếp. Nhập giá trị cần tìm (mặc định 23) rồi nhấn Step.`);
    }

    function step() {
        if (done) return false;

        const target = getTarget();
        mid = Math.floor((low + high) / 2);

        if (data[mid] === target) {
            found = true;
            done = true;
            render();
            log(`Tìm thấy ${target} tại index ${mid}!`);
            return false;
        }

        if (data[mid] < target) {
            log(`arr[${mid}]=${data[mid]} < ${target} → tìm bên phải`);
            low = mid + 1;
        } else {
            log(`arr[${mid}]=${data[mid]} > ${target} → tìm bên trái`);
            high = mid - 1;
        }

        if (low > high) {
            done = true;
            mid = -1;
            render();
            log(`Không tìm thấy ${target} trong mảng.`);
            return false;
        }

        render();
        return true;
    }

    reset();
    return { reset, step };
}

const GRAPH_NODES = {
    1: { x: 60, y: 140 },
    2: { x: 180, y: 60 },
    3: { x: 300, y: 140 },
    4: { x: 120, y: 220 },
    5: { x: 240, y: 220 }
};

const GRAPH_EDGES = [
    [1, 2, 1], [2, 3, 1], [1, 4, 1], [4, 5, 1], [2, 5, 1], [3, 5, 2]
];

function buildGraphSvg(visited = new Set(), current = null, activeEdges = new Set()) {
    const edges = GRAPH_EDGES.map(([a, b, w]) => {
        const na = GRAPH_NODES[a];
        const nb = GRAPH_NODES[b];
        const key = `${a}-${b}`;
        const cls = activeEdges.has(key) || activeEdges.has(`${b}-${a}`) ? "viz-graph-edge active" : "viz-graph-edge";
        const mx = (na.x + nb.x) / 2;
        const my = (na.y + nb.y) / 2;
        return `
            <line class="${cls}" x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}"/>
            <text x="${mx}" y="${my - 6}" font-size="10" fill="#94a3b8" text-anchor="middle">${w}</text>
        `;
    }).join("");

    const nodes = Object.entries(GRAPH_NODES).map(([id, pos]) => {
        let cls = "viz-graph-node";
        if (Number(id) === current) cls += " current";
        else if (visited.has(Number(id))) cls += " visited";
        return `
            <g class="${cls}" data-id="${id}">
                <circle cx="${pos.x}" cy="${pos.y}" r="22"/>
                <text x="${pos.x}" y="${pos.y}">${id}</text>
            </g>
        `;
    }).join("");

    return `<svg viewBox="0 0 360 280">${edges}${nodes}</svg>`;
}

export function createBfsEngine(container, logEl) {
    const adj = {
        1: [2, 4], 2: [1, 3, 5], 3: [2, 5], 4: [1, 5], 5: [2, 3, 4]
    };
    let queue = [1];
    let visited = new Set();
    let order = [];
    let done = false;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render(current = null, activeEdge = null) {
        const edges = new Set();
        if (activeEdge) edges.add(activeEdge);
        container.innerHTML = `<div class="viz-graph">${buildGraphSvg(visited, current, edges)}</div>`;
    }

    function reset() {
        queue = [1];
        visited = new Set();
        order = [];
        done = false;
        render();
        log("BFS từ đỉnh 1. Queue: [1]. Nhấn Step để duyệt.");
    }

    function step() {
        if (done || !queue.length) {
            done = true;
            log(`Hoàn thành BFS. Thứ tự: ${order.join(" → ")}`);
            render();
            return false;
        }

        const u = queue.shift();
        if (visited.has(u)) return step();

        visited.add(u);
        order.push(u);

        const next = [];
        for (const v of adj[u]) {
            if (!visited.has(v) && !queue.includes(v)) {
                queue.push(v);
                next.push(v);
            }
        }

        render(u);
        log(`Thăm ${u}. Thêm vào queue: [${queue.join(", ")}]. Thứ tự: ${order.join(" → ")}`);

        if (!queue.length && order.length === Object.keys(GRAPH_NODES).length) {
            done = true;
        }
        return !done;
    }

    reset();
    return { reset, step };
}

export function createDfsEngine(container, logEl) {
    const adj = {
        1: [2, 4], 2: [1, 3, 5], 3: [2, 5], 4: [1, 5], 5: [2, 3, 4]
    };
    let stack = [1];
    let visited = new Set();
    let order = [];
    let done = false;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render(current = null) {
        container.innerHTML = `<div class="viz-graph">${buildGraphSvg(visited, current, new Set())}</div>`;
    }

    function reset() {
        stack = [1];
        visited = new Set();
        order = [];
        done = false;
        render();
        log("DFS từ đỉnh 1. Stack: [1]. Nhấn Step để duyệt.");
    }

    function step() {
        if (done || !stack.length) {
            done = true;
            log(`Hoàn thành DFS. Thứ tự: ${order.join(" → ")}`);
            render();
            return false;
        }

        const u = stack.pop();
        if (visited.has(u)) return step();

        visited.add(u);
        order.push(u);

        const neighbors = [...adj[u]].reverse();
        for (const v of neighbors) {
            if (!visited.has(v)) stack.push(v);
        }

        render(u);
        log(`Thăm ${u}. Stack: [${stack.join(", ")}]. Thứ tự: ${order.join(" → ")}`);

        if (!stack.length) done = true;
        return !done;
    }

    reset();
    return { reset, step };
}

export function createDijkstraEngine(container, logEl) {
    const adj = {
        1: [[2, 1], [4, 4]],
        2: [[1, 1], [3, 2], [5, 6]],
        3: [[2, 2], [5, 2]],
        4: [[1, 4], [5, 1]],
        5: [[2, 6], [3, 2], [4, 1]]
    };
    const dist = { 1: 0, 2: Infinity, 3: Infinity, 4: Infinity, 5: Infinity };
    const visited = new Set();
    let current = 1;
    let done = false;
    const steps = [];
    let stepIdx = 0;

    function buildSteps() {
        const d = { 1: 0, 2: Infinity, 3: Infinity, 4: Infinity, 5: Infinity };
        const vis = new Set();
        const logSteps = [];

        while (vis.size < 5) {
            let u = null;
            let best = Infinity;
            for (const n of [1, 2, 3, 4, 5]) {
                if (!vis.has(n) && d[n] < best) {
                    best = d[n];
                    u = n;
                }
            }
            if (u === null) break;
            vis.add(u);
            logSteps.push({ u, dist: { ...d }, visited: new Set(vis) });

            for (const [v, w] of adj[u]) {
                if (d[u] + w < d[v]) {
                    d[v] = d[u] + w;
                    logSteps.push({ u, relax: [u, v, w], dist: { ...d }, visited: new Set(vis) });
                }
            }
        }
        return logSteps;
    }

    const allSteps = buildSteps();

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render(vis, cur, target = 5) {
        const visitedSet = vis || visited;
        container.innerHTML = `<div class="viz-graph">${buildGraphSvg(visitedSet, cur, new Set())}</div>`;
    }

    function reset() {
        visited.clear();
        Object.assign(dist, { 1: 0, 2: Infinity, 3: Infinity, 4: Infinity, 5: Infinity });
        current = 1;
        done = false;
        stepIdx = 0;
        render(new Set(), 1);
        log("Dijkstra từ đỉnh 1. dist[1]=0. Nhấn Step để relax các cạnh.");
    }

    function step() {
        if (stepIdx >= allSteps.length) {
            done = true;
            const d = allSteps[allSteps.length - 1]?.dist || dist;
            render(new Set([1, 2, 3, 4, 5]), 5, 5);
            log(`Hoàn thành. Khoảng cách ngắn nhất 1→5 = ${d[5]}. dist = {${Object.entries(d).map(([k, v]) => `${k}:${v}`).join(", ")}}`);
            return false;
        }

        const s = allSteps[stepIdx];
        stepIdx++;

        if (s.relax) {
            const [u, v, w] = s.relax;
            log(`Relax cạnh ${u}→${v} (w=${w}). dist[${v}] = ${s.dist[v]}`);
        } else {
            log(`Chọn đỉnh ${s.u} (dist=${s.dist[s.u]}). Đánh dấu đã xử lý.`);
        }

        render(s.visited, s.u || s.relax?.[1]);
        return stepIdx < allSteps.length;
    }

    reset();
    return { reset, step };
}

export { sleep, clampSpeed };
