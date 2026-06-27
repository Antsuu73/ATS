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
        minIdx = 0;
        quickIdx = 0;
        mergeIdx = 0;
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

    const stepFn = algorithm === "insertion" ? insertionStep
        : algorithm === "selection" ? selectionStep
        : algorithm === "quick" ? quickStep
        : algorithm === "merge" ? mergeStep
        : bubbleStep;

    // --- Selection Sort ---
    let minIdx = 0;

    async function selectionStep() {
        if (i >= arr.length - 1) {
            render([], arr.length);
            log("Hoàn thành! Mảng đã được sắp xếp.");
            running = false;
            return false;
        }
        if (j <= i) {
            minIdx = i;
            j = i + 1;
            render([i], i);
            log(`Vòng ${i + 1}: tìm min từ index ${i}`);
            return true;
        }
        if (j < arr.length) {
            render([j, minIdx], i);
            log(`So sánh arr[${j}]=${arr[j]} với min arr[${minIdx}]=${arr[minIdx]}`);
            if (arr[j] < arr[minIdx]) minIdx = j;
            j++;
            return true;
        }
        if (minIdx !== i) {
            phase = "swap";
            log(`Đổi arr[${i}] ↔ arr[${minIdx}]`);
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        } else {
            log(`arr[${i}] đã đúng vị trí`);
        }
        i++;
        j = i;
        phase = "compare";
        render([i - 1], i);
        return true;
    }

    // --- Quick Sort (bước định sẵn) ---
    const quickSteps = buildQuickSortSteps([64, 34, 25, 12, 22, 11, 90, 45]);
    let quickIdx = 0;

    function quickStep() {
        if (quickIdx >= quickSteps.length) {
            log("Hoàn thành Quick Sort!");
            running = false;
            return false;
        }
        const s = quickSteps[quickIdx++];
        arr = [...s.arr];
        phase = s.swap ? "swap" : "compare";
        render(s.highlight || [], s.sortedFrom ?? arr.length);
        log(s.msg);
        return quickIdx < quickSteps.length;
    }

    // --- Merge Sort (bước định sẵn) ---
    const mergeSteps = buildMergeSortSteps([38, 27, 43, 3, 9, 82, 10]);
    let mergeIdx = 0;

    function mergeStep() {
        if (mergeIdx >= mergeSteps.length) {
            log("Hoàn thành Merge Sort!");
            running = false;
            return false;
        }
        const s = mergeSteps[mergeIdx++];
        arr = [...s.arr];
        render(s.highlight || [], s.sortedFrom ?? 0);
        log(s.msg);
        return mergeIdx < mergeSteps.length;
    }

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

function buildQuickSortSteps(initial) {
    const steps = [];
    const a = [...initial];

    function record(arr, highlight, msg, swap = false, sortedFrom = arr.length) {
        steps.push({ arr: [...arr], highlight, msg, swap, sortedFrom });
    }

    function partition(arr, lo, hi) {
        const pivot = arr[hi];
        record(arr, [hi], `Chọn pivot = ${pivot} tại index ${hi}`, false, lo);
        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
            record(arr, [j, hi], `So sánh arr[${j}]=${arr[j]} với pivot ${pivot}`);
            if (arr[j] < pivot) {
                i++;
                if (i !== j) {
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    record(arr, [i, j], `Đổi chỗ arr[${i}] ↔ arr[${j}]`, true, lo);
                }
            }
        }
        [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
        record(arr, [i + 1, hi], `Đặt pivot vào vị trí ${i + 1}`, true, lo);
        return i + 1;
    }

    function qs(arr, lo, hi) {
        if (lo >= hi) return;
        const p = partition(arr, lo, hi);
        qs(arr, lo, p - 1);
        qs(arr, p + 1, hi);
    }

    record(a, [], "Bắt đầu Quick Sort");
    qs(a, 0, a.length - 1);
    record(a, [], "Hoàn thành!", false, 0);
    return steps;
}

function buildMergeSortSteps(initial) {
    const steps = [];
    const arr = [...initial];

    function record(a, highlight, msg) {
        steps.push({ arr: [...a], highlight, msg });
    }

    function merge(a, l, m, r) {
        const left = a.slice(l, m + 1);
        const right = a.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        record(a, [l, r], `Merge đoạn [${l}..${m}] và [${m + 1}..${r}]`);
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                a[k] = left[i++];
                record(a, [k], `Lấy ${a[k]} từ nửa trái → pos ${k}`);
            } else {
                a[k] = right[j++];
                record(a, [k], `Lấy ${a[k]} từ nửa phải → pos ${k}`);
            }
            k++;
        }
        while (i < left.length) { a[k] = left[i++]; record(a, [k], `Copy ${a[k]}`); k++; }
        while (j < right.length) { a[k] = right[j++]; record(a, [k], `Copy ${a[k]}`); k++; }
    }

    function sort(a, l, r) {
        if (l >= r) return;
        const m = Math.floor((l + r) / 2);
        record(a, [l, r], `Chia [${l}..${r}] tại m=${m}`);
        sort(a, l, m);
        sort(a, m + 1, r);
        merge(a, l, m, r);
    }

    record(arr, [], "Bắt đầu Merge Sort");
    sort(arr, 0, arr.length - 1);
    record(arr, [], "Hoàn thành!", false);
    return steps;
}

export function createLinearSearchEngine(container, logEl) {
    const data = [14, 27, 8, 19, 31, 5, 23, 11];
    let idx = 0;
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
        const arrEl = container.querySelector(".viz-array") || container;
        arrEl.innerHTML = data.map((val, i) => {
            let cls = "viz-cell-value";
            if (found && i === idx) cls += " found";
            else if (i === idx && !done) cls += " active";
            else if (i < idx) cls += " range";
            return `
                <div class="viz-cell">
                    <span class="viz-cell-pointer">${i === idx && !done ? "→" : ""}</span>
                    <span class="${cls}">${val}</span>
                </div>
            `;
        }).join("");
    }

    function reset() {
        idx = 0;
        found = false;
        done = false;
        render();
        log("Linear Search: duyệt tuần tự. Nhập giá trị cần tìm rồi nhấn Step.");
    }

    function step() {
        if (done) return false;
        const target = getTarget();

        if (idx >= data.length) {
            done = true;
            render();
            log(`Không tìm thấy ${target}.`);
            return false;
        }

        log(`Kiểm tra index ${idx}: arr[${idx}]=${data[idx]}`);
        if (data[idx] === target) {
            found = true;
            done = true;
            render();
            log(`Tìm thấy ${target} tại index ${idx}!`);
            return false;
        }

        idx++;
        render();
        return idx < data.length;
    }

    reset();
    return { reset, step };
}

export function createKnapsackEngine(container, logEl) {
    const weights = [2, 3, 4];
    const values = [3, 4, 5];
    const W = 5;
    const steps = [];
    let stepIdx = 0;

    const dp = Array.from({ length: weights.length + 1 }, () => Array(W + 1).fill(0));

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function buildSteps() {
        const s = [];
        for (let i = 1; i <= weights.length; i++) {
            for (let w = 0; w <= W; w++) {
                dp[i][w] = dp[i - 1][w];
                let msg = `dp[${i}][${w}]=${dp[i][w]} (không lấy vật ${i})`;
                if (weights[i - 1] <= w) {
                    const withItem = dp[i - 1][w - weights[i - 1]] + values[i - 1];
                    if (withItem > dp[i][w]) {
                        dp[i][w] = withItem;
                        msg = `dp[${i}][${w}]=${dp[i][w]} (lấy vật ${i}: +${values[i - 1]})`;
                    }
                }
                s.push({ i, w, val: dp[i][w], msg });
            }
        }
        return s;
    }

    const allSteps = buildSteps();

    function render(curI, curW) {
        let html = `<div class="viz-dp-table"><table><thead><tr><th></th>`;
        for (let w = 0; w <= W; w++) html += `<th>W=${w}</th>`;
        html += `</tr></thead><tbody>`;
        for (let i = 0; i <= weights.length; i++) {
            html += `<tr><th>${i === 0 ? "∅" : `v${i}`}</th>`;
            for (let w = 0; w <= W; w++) {
                let show = i === 0 ? "0" : "·";
                if (i > 0 && (i < curI || (i === curI && w <= curW))) {
                    show = String(dp[i][w]);
                }
                const cls = i === curI && w === curW ? "viz-dp-active" : "";
                html += `<td class="${cls}">${show}</td>`;
            }
            html += `</tr>`;
        }
        html += `</tbody></table></div>`;
        html += `<p class="viz-dp-info">Vật: w=[${weights}] v=[${values}], W=${W}</p>`;
        container.innerHTML = html;
    }

    function reset() {
        stepIdx = 0;
        for (let i = 0; i <= weights.length; i++)
            for (let w = 0; w <= W; w++) dp[i][w] = 0;
        render(0, 0, 0);
        log("0/1 Knapsack DP. Nhấn Step để điền bảng.");
    }

    function step() {
        if (stepIdx >= allSteps.length) {
            log(`Hoàn thành! Giá trị tối đa = ${dp[weights.length][W]}`);
            render(weights.length, W, dp[weights.length][W]);
            return false;
        }
        const s = allSteps[stepIdx++];
        log(s.msg);
        render(s.i, s.w, s.val);
        return stepIdx < allSteps.length;
    }

    reset();
    return { reset, step };
}

export function createCoinChangeEngine(container, logEl) {
    const coins = [1, 2, 5];
    const amount = 11;
    const dp = Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    let stepIdx = 0;
    const steps = [];

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    for (const c of coins) {
        for (let a = c; a <= amount; a++) {
            const nv = dp[a - c] + 1;
            steps.push({ coin: c, a, before: dp[a], after: nv, updated: nv < dp[a] });
            if (nv < dp[a]) dp[a] = nv;
        }
    }

    function render(activeA = -1) {
        container.innerHTML = `
            <div class="viz-dp-row">
                ${dp.slice(0, amount + 1).map((v, i) => `
                    <div class="viz-dp-cell ${i === activeA ? "viz-dp-active" : ""}">
                        <span class="viz-dp-label">${i}</span>
                        <span class="viz-dp-val">${v === Infinity ? "∞" : v}</span>
                    </div>
                `).join("")}
            </div>
            <p class="viz-dp-info">coins=[${coins}], amount=${amount}</p>
        `;
    }

    function reset() {
        stepIdx = 0;
        dp.fill(Infinity);
        dp[0] = 0;
        render();
        log("Coin Change DP. Nhấn Step.");
    }

    function step() {
        if (stepIdx >= steps.length) {
            log(`Hoàn thành! Min coins = ${dp[amount]}`);
            render(amount);
            return false;
        }
        const s = steps[stepIdx++];
        if (s.updated) {
            dp[s.a] = s.after;
            log(`coin=${s.coin}: dp[${s.a}] = min(${s.before}, dp[${s.a - s.coin}]+1) = ${s.after}`);
        } else {
            log(`coin=${s.coin}: dp[${s.a}] không cải thiện`);
        }
        render(s.a);
        return stepIdx < steps.length;
    }

    reset();
    return { reset, step };
}

export function createLisEngine(container, logEl) {
    const data = [10, 9, 2, 5, 3, 7, 101, 18];
    const dp = Array(data.length).fill(1);
    let i = 1, j = 0;
    let done = false;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render(hi = [], active = -1) {
        container.innerHTML = `
            <div class="viz-array" style="align-items:flex-end">
                ${data.map((val, idx) => `
                    <div class="viz-cell">
                        <span class="viz-cell-pointer">${dp[idx]}</span>
                        <span class="viz-cell-value ${hi.includes(idx) ? "active" : ""} ${idx === active ? "found" : ""}">${val}</span>
                    </div>
                `).join("")}
            </div>
            <p class="viz-dp-info">Số trên mỗi cột = độ dài LIS kết thúc tại đó</p>
        `;
    }

    function reset() {
        i = 1; j = 0; done = false;
        dp.fill(1);
        render();
        log("LIS DP O(n²). Nhấn Step.");
    }

    function step() {
        if (done) return false;
        if (i >= data.length) {
            done = true;
            const ans = Math.max(...dp);
            log(`Hoàn thành! LIS length = ${ans}`);
            render();
            return false;
        }
        if (j < i) {
            log(`i=${i}(${data[i]}), j=${j}(${data[j]}): ${data[j] < data[i] ? "có thể mở rộng" : "bỏ qua"}`);
            if (data[j] < data[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                log(`dp[${i}] = ${dp[i]}`);
            }
            render([i, j], i);
            j++;
            return true;
        }
        j = 0;
        i++;
        return true;
    }

    reset();
    return { reset, step };
}

export function createStackEngine(container, logEl) {
    const ops = [
        { type: "push", val: 10, msg: "push(10)" },
        { type: "push", val: 20, msg: "push(20)" },
        { type: "push", val: 30, msg: "push(30)" },
        { type: "peek", msg: "peek() → 30 (đỉnh stack)" },
        { type: "pop", msg: "pop() → 30" },
        { type: "pop", msg: "pop() → 20" },
        { type: "push", val: 5, msg: "push(5)" },
        { type: "pop", msg: "pop() → 5" }
    ];
    let stack = [];
    let idx = 0;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render() {
        const items = stack.length
            ? stack.map((v, i) => `<div class="viz-stack-item ${i === stack.length - 1 ? "top" : ""}">${v}</div>`).join("")
            : `<div class="viz-stack-empty">empty</div>`;
        container.innerHTML = `<div class="viz-stack">${items}<div class="viz-stack-base">STACK</div></div>`;
    }

    function reset() {
        stack = [];
        idx = 0;
        render();
        log("Stack LIFO. Nhấn Step.");
    }

    function step() {
        if (idx >= ops.length) {
            log("Hoàn thành demo Stack!");
            return false;
        }
        const op = ops[idx++];
        if (op.type === "push") stack.push(op.val);
        else if (op.type === "pop") stack.pop();
        log(op.msg);
        render();
        return idx < ops.length;
    }

    reset();
    return { reset, step };
}

export function createQueueEngine(container, logEl) {
    const ops = [
        { type: "enqueue", val: 1, msg: "enqueue(1)" },
        { type: "enqueue", val: 2, msg: "enqueue(2)" },
        { type: "enqueue", val: 3, msg: "enqueue(3)" },
        { type: "front", msg: "front() → 1" },
        { type: "dequeue", msg: "dequeue() → 1" },
        { type: "dequeue", msg: "dequeue() → 2" },
        { type: "enqueue", val: 4, msg: "enqueue(4)" },
        { type: "dequeue", msg: "dequeue() → 3" }
    ];
    let queue = [];
    let idx = 0;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render() {
        container.innerHTML = `
            <div class="viz-queue">
                <span class="viz-queue-label">front</span>
                <div class="viz-queue-track">
                    ${queue.length ? queue.map((v, i) => `
                        <div class="viz-queue-item ${i === 0 ? "front" : ""} ${i === queue.length - 1 ? "rear" : ""}">${v}</div>
                    `).join("") : `<span class="viz-stack-empty">empty</span>`}
                </div>
                <span class="viz-queue-label">rear</span>
            </div>
        `;
    }

    function reset() {
        queue = [];
        idx = 0;
        render();
        log("Queue FIFO. Nhấn Step.");
    }

    function step() {
        if (idx >= ops.length) {
            log("Hoàn thành demo Queue!");
            return false;
        }
        const op = ops[idx++];
        if (op.type === "enqueue") queue.push(op.val);
        else if (op.type === "dequeue") queue.shift();
        log(op.msg);
        render();
        return idx < ops.length;
    }

    reset();
    return { reset, step };
}

const DAG_NODES = {
    1: { x: 180, y: 40 },
    2: { x: 80, y: 130 },
    3: { x: 280, y: 130 },
    4: { x: 180, y: 220 }
};

const DAG_EDGES = [
    [1, 2, 1], [1, 3, 1], [2, 4, 1], [3, 4, 1]
];

function buildDagSvg(visited = new Set(), current = null) {
    const edges = DAG_EDGES.map(([a, b]) => {
        const na = DAG_NODES[a];
        const nb = DAG_NODES[b];
        return `<line class="viz-graph-edge" x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}"/>`;
    }).join("");
    const nodes = Object.entries(DAG_NODES).map(([id, pos]) => {
        let cls = "viz-graph-node";
        if (Number(id) === current) cls += " current";
        else if (visited.has(Number(id))) cls += " visited";
        return `<g class="${cls}"><circle cx="${pos.x}" cy="${pos.y}" r="22"/><text x="${pos.x}" y="${pos.y}">${id}</text></g>`;
    }).join("");
    return `<svg viewBox="0 0 360 280">${edges}${nodes}</svg>`;
}

export function createTopoSortEngine(container, logEl) {
    const adj = { 1: [2, 3], 2: [4], 3: [4], 4: [] };
    const inDeg = { 1: 0, 2: 1, 3: 1, 4: 2 };
    let queue = [1];
    let order = [];
    let done = false;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render(cur = null) {
        const visited = new Set(order);
        container.innerHTML = `<div class="viz-graph">${buildDagSvg(visited, cur)}</div>`;
    }

    function reset() {
        Object.assign(inDeg, { 1: 0, 2: 1, 3: 1, 4: 2 });
        queue = [1];
        order = [];
        done = false;
        render();
        log("Topological Sort (Kahn). Queue ban đầu: [1]");
    }

    function step() {
        if (done || !queue.length) {
            done = true;
            log(`Thứ tự topo: ${order.join(" → ") || "—"}`);
            render();
            return false;
        }
        const u = queue.shift();
        order.push(u);
        for (const v of adj[u]) {
            inDeg[v]--;
            if (inDeg[v] === 0) queue.push(v);
        }
        render(u);
        log(`Lấy ${u}. Queue: [${queue.join(", ")}]. Kết quả: ${order.join(" → ")}`);
        if (!queue.length && order.length < 4) done = true;
        return !done && (queue.length > 0 || order.length < 4);
    }

    reset();
    return { reset, step };
}

const TREE_NODES = {
    1: { x: 180, y: 40 },
    2: { x: 100, y: 120 },
    3: { x: 260, y: 120 },
    4: { x: 60, y: 200 },
    5: { x: 140, y: 200 }
};

const TREE_EDGES = [[1, 2], [1, 3], [2, 4], [2, 5]];

function buildTreeSvg(visited = new Set(), current = null) {
    const edges = TREE_EDGES.map(([a, b]) => {
        const na = TREE_NODES[a];
        const nb = TREE_NODES[b];
        return `<line class="viz-graph-edge" x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}"/>`;
    }).join("");
    const nodes = Object.entries(TREE_NODES).map(([id, pos]) => {
        let cls = "viz-graph-node";
        if (Number(id) === current) cls += " current";
        else if (visited.has(Number(id))) cls += " visited";
        return `<g class="${cls}"><circle cx="${pos.x}" cy="${pos.y}" r="20"/><text x="${pos.x}" y="${pos.y}">${id}</text></g>`;
    }).join("");
    return `<svg viewBox="0 0 360 260">${edges}${nodes}</svg>`;
}

export function createTreeBfsEngine(container, logEl) {
    const adj = { 1: [2, 3], 2: [4, 5], 3: [], 4: [], 5: [] };
    let queue = [1];
    let visited = new Set();
    let order = [];
    let done = false;

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function render(cur = null) {
        container.innerHTML = `<div class="viz-graph">${buildTreeSvg(visited, cur)}</div>`;
    }

    function reset() {
        queue = [1];
        visited = new Set();
        order = [];
        done = false;
        render();
        log("BFS level-order từ gốc 1. Queue: [1]");
    }

    function step() {
        if (done || !queue.length) {
            done = true;
            log(`Thứ tự duyệt: ${order.join(" → ")}`);
            render();
            return false;
        }
        const u = queue.shift();
        if (visited.has(u)) return step();
        visited.add(u);
        order.push(u);
        for (const v of adj[u]) {
            if (!visited.has(v) && !queue.includes(v)) queue.push(v);
        }
        render(u);
        log(`Thăm ${u}. Queue: [${queue.join(", ")}]`);
        if (!queue.length) done = true;
        return !done;
    }

    reset();
    return { reset, step };
}

// ==================== JUMP SEARCH ====================
export function createJumpSearchEngine(container, logEl) {
    const data = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    const block = Math.floor(Math.sqrt(data.length));
    let step = 0;
    let low = 0;
    let high = block;
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
            if (idx >= low && idx < high && !done) cls += " range";
            if (done && idx === low) cls += " found";

            let pointer = "";
            if (idx === low && !done) pointer = "L";
            if (idx === high && high <= data.length && !done) pointer = "H";

            return `
                <div class="viz-cell">
                    <span class="viz-cell-pointer">${pointer}</span>
                    <span class="${cls}">${val}</span>
                </div>
            `;
        }).join("");

        if (!done) {
            log(`Nhảy block=${block}. low=${low}, high=${Math.min(high, data.length)} | Tìm ${target}`);
        }
    }

    function reset() {
        step = 0; low = 0; high = block; done = false;
        render();
        log(`Jump Search (block=${block}). Nhập target (mặc định 23) rồi Step.`);
    }

    function doStep() {
        if (done) return false;
        const target = getTarget();

        if (step === 0) {
            log(`Nhảy đến block kết thúc tại index ${Math.min(high, data.length) - 1}`);
            step++;
            high = Math.min(high, data.length);
            render();
            if (high <= low) {
                low = high - 1;
                high = low + block;
                step++;
            }
            return true;
        }

        if (data[high - 1] < target && high < data.length) {
            low = high;
            high = low + block;
            high = Math.min(high, data.length);
            log(`Tăng low=${low}, high=${high}`);
            render();
            step++;
            return true;
        }

        done = true;
        render();
        log(`Trong khối [${low}..${high-1}], dùng linear search`);
        return true;
    }

    function linearStep() {
        if (done && low >= data.length) return false;
        if (low >= data.length) return false;

        if (data[low] === target) {
            done = true;
            render();
            log(`Tìm thấy ${target} tại index ${low}!`);
            return false;
        }
        log(`So sánh arr[${low}]=${data[low]} với ${target}`);
        low++;
        if (low >= high && low < data.length && data[low - 1] < target) {
            done = true;
            render();
            log(`Không tìm thấy ${target}`);
            return false;
        }
        render();
        return true;
    }

    let phase = "jump";
    const engine = {
        reset,
        step: () => {
            if (phase === "jump") {
                const cont = doStep();
                if (!cont) phase = "linear";
                return phase === "linear";
            } else {
                return linearStep();
            }
        }
    };

    reset();
    return engine;
}

// ==================== COUNTING SORT ====================
export function createCountingSortEngine(container, logEl) {
    const initial = [4, 2, 2, 8, 3, 3, 1, 5, 6, 4];
    let arr = [...initial];
    let i = 0;
    let phase = "count";

    function log(msg) {
        if (logEl) logEl.textContent = msg;
    }

    function renderBars(highlightIdx = -1, sortedFrom = arr.length) {
        const stage = container.querySelector(".viz-bars") || container;
        stage.innerHTML = arr.map((val, idx) => {
            let cls = "viz-bar";
            if (idx === highlightIdx) cls += " compare";
            if (idx >= sortedFrom) cls += " sorted";
            const h = Math.max(24, val * 18);
            return `
                <div class="viz-bar-wrap">
                    <div class="${cls}" style="height:${h}px" data-i="${idx}"></div>
                    <span class="viz-bar-label">${val}</span>
                </div>
            `;
        }).join("");
    }

    function renderCounts(counts) {
        const max = Math.max(...counts);
        container.innerHTML = `
            <div class="viz-counts">
                ${counts.map((c, i) => `
                    <div class="viz-count-item ${c > 0 ? "active" : ""}">
                        <span class="viz-count-val">${i}</span>
                        <div class="viz-count-bar" style="height:${Math.max(4, c * 16)}px"></div>
                        <span class="viz-count-num">${c}</span>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function reset() {
        arr = [...initial];
        i = 0;
        phase = "count";
        renderBars();
        log("Counting Sort. Nhấn Step.");
    }

    function step() {
        if (i >= arr.length) {
            if (phase === "count") {
                phase = "output";
                i = 0;
                arr = arr.map((_, idx) => idx + 1);
                renderBars(-1, 0);
                log("Đếm xong. Bắt đầu đưa về đúng vị trí.");
                return true;
            }
            log("Hoàn thành Counting Sort!");
            return false;
        }

        if (phase === "count") {
            renderBars(i);
            log(`Đếm: giá trị ${arr[i]} xuất hiện...`);
            i++;
            return true;
        }

        if (phase === "output") {
            renderBars(-1, i);
            log(`Đặt ${i + 1} vào vị trí ${i}`);
            i++;
            return true;
        }

        return false;
    }

    reset();
    return { reset, step };
}

