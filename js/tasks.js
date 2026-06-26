import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { initStreak } from "./streak.js";

const STORAGE_KEY = "ats_tasks";
const STREAK_KEY = "ats_tasks_streak";
const LAST_COMPLETION_KEY = "ats_tasks_last_completion";

const tabs = document.querySelectorAll(".tasks-tab");
const panels = document.querySelectorAll(".tasks-panel");

const dailyGrid = document.getElementById("dailyGrid");
const weeklyGrid = document.getElementById("weeklyGrid");
const monthlyGrid = document.getElementById("monthlyGrid");

const countdownCycle = document.getElementById("countdownCycle");
const countdownDays = document.getElementById("countdownDays");
const countdownHours = document.getElementById("countdownHours");
const countdownMinutes = document.getElementById("countdownMinutes");
const countdownSeconds = document.getElementById("countdownSeconds");
const streakValue = document.getElementById("streakValue");

let currentTab = "daily";

function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekKey() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-W${getWeekNumber(monday)}`;
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getNextDailyReset() {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d;
}

function getNextWeeklyReset() {
    const d = new Date();
    const day = d.getDay();
    const daysUntilMonday = day === 0 ? 1 : (8 - day);
    d.setDate(d.getDate() + daysUntilMonday);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getNextMonthlyReset() {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 1);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getCountdownInfo(tab) {
    const now = new Date();
    switch (tab) {
        case "daily":
            return { label: "Daily Reset", next: getNextDailyReset() };
        case "weekly":
            return { label: "Weekly Reset", next: getNextWeeklyReset() };
        case "monthly":
            return { label: "Monthly Reset", next: getNextMonthlyReset() };
        default:
            return { label: "Daily Reset", next: getNextDailyReset() };
    }
}

function pad(n) {
    return String(n).padStart(2, "0");
}

function updateCountdown() {
    const info = getCountdownInfo(currentTab);
    const now = new Date();
    const diff = info.next - now;

    if (diff <= 0) {
        countdownDays.textContent = "00";
        countdownHours.textContent = "00";
        countdownMinutes.textContent = "00";
        countdownSeconds.textContent = "00";
        countdownCycle.textContent = info.label;
        return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    countdownDays.textContent = pad(days);
    countdownHours.textContent = pad(hours);
    countdownMinutes.textContent = pad(minutes);
    countdownSeconds.textContent = pad(seconds);
    countdownCycle.textContent = info.label;
}

function updateStreak() {
    const last = localStorage.getItem(LAST_COMPLETION_KEY);
    const today = getTodayKey();
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (last === today) {
        streakValue.textContent = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0;
    } else if (last === yesterdayKey) {
        streakValue.textContent = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0;
    } else {
        streakValue.textContent = "0";
    }
}

function calculateStreak() {
    const last = localStorage.getItem(LAST_COMPLETION_KEY);
    const today = getTodayKey();
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (last === today) {
        return parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0;
    } else if (last === yesterdayKey) {
        return parseInt(localStorage.getItem(STREAK_KEY) || "0", 10) || 0;
    }
    return 0;
}

function incrementStreak() {
    const current = calculateStreak();
    const next = current + 1;
    localStorage.setItem(STREAK_KEY, String(next));
    localStorage.setItem(LAST_COMPLETION_KEY, getTodayKey());
}

function loadProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getProgressKey(tab) {
    switch (tab) {
        case "daily":
            return `daily_${getTodayKey()}`;
        case "weekly":
            return `weekly_${getWeekKey()}`;
        case "monthly":
            return `monthly_${getMonthKey()}`;
        default:
            return `daily_${getTodayKey()}`;
    }
}

function getChallenges(tab) {
    const today = new Date();
    const dayIndex = today.getDate();
    const monthIndex = today.getMonth();
    const yearMod = today.getFullYear() % 100;

    const pool = {
        daily: [
            { id: "d1", title: "Two Sum", topic: "sorting-search", difficulty: "Easy", desc: "Tìm hai số trong mảng có tổng bằng target.", xp: 50 },
            { id: "d2", title: "Valid Parentheses", topic: "data-structure", difficulty: "Easy", desc: "Kiểm tra chuỗi ngoặc có hợp lệ không.", xp: 50 },
            { id: "d3", title: "Merge Sorted Array", topic: "sorting-search", difficulty: "Easy", desc: "Trộn hai mảng đã sắp xếp.", xp: 60 },
            { id: "d4", title: "Best Time to Buy and Sell Stock", topic: "dp", difficulty: "Easy", desc: "Tìm lợi nhuận lớn nhất từ một giao dịch.", xp: 60 },
            { id: "d5", title: "Number of 1 Bits", topic: "math", difficulty: "Easy", desc: "Đếm số bit 1 trong biểu diễn nhị phân của n.", xp: 40 },
            { id: "d6", title: "Reverse Linked List", topic: "data-structure", difficulty: "Easy", desc: "Đảo ngược danh sách liên kết.", xp: 50 },
            { id: "d7", title: "Palindrome Number", topic: "math", difficulty: "Easy", desc: "Kiểm tra số có đối xứng không.", xp: 40 },
            { id: "d8", title: "Climbing Stairs", topic: "dp", difficulty: "Easy", desc: "Số cách leo n bậc thang, mỗi lần leo 1 hoặc 2 bậc.", xp: 50 }
        ],
        weekly: [
            { id: "w1", title: "Longest Substring Without Repeating Characters", topic: "string", difficulty: "Medium", desc: "Tìm xâu con dài nhất không có ký tự lặp.", xp: 150 },
            { id: "w2", title: "3Sum", topic: "sorting-search", difficulty: "Medium", desc: "Tìm tất cả bộ 3 số có tổng bằng 0.", xp: 200 },
            { id: "w3", title: "Binary Tree Level Order Traversal", topic: "tree", difficulty: "Medium", desc: "Duyệt cây theo từng tầng.", xp: 150 },
            { id: "w4", title: "Coin Change", topic: "dp", difficulty: "Medium", desc: "Số đồng xu ít nhất để đổi amount.", xp: 200 }
        ],
        monthly: [
            { id: "m1", title: "Median of Two Sorted Arrays", topic: "sorting-search", difficulty: "Hard", desc: "Tìm trung vị của hai mảng đã sắp xếp.", xp: 500 },
            { id: "m2", title: "Regular Expression Matching", topic: "string", difficulty: "Hard", desc: "So khớp xâu với pattern chứa '.' và '*'.", xp: 600 },
            { id: "m3", title: " trapping Rain Water", topic: "dp", difficulty: "Hard", desc: "Tính lượng nước mưa có thể chứa sau các cột.", xp: 500 }
        ]
    };

    const seed = tab === "daily" ? dayIndex : tab === "weekly" ? yearMod : monthIndex;
    const items = pool[tab] || pool.daily;

    return items.map((ch, i) => {
        const idx = (seed + i) % items.length;
        return { ...items[idx], id: `${tab}_${i}_${seed}` };
    });
}

function renderChallenge(challenge, tab, progress) {
    const key = getProgressKey(tab);
    const state = progress[key];
    const completed = state && state.completed;
    const attemptCount = state ? (state.attempts || 0) : 0;

    const difficultyClass = challenge.difficulty.toLowerCase();

    return `
        <div class="challenge-card ${completed ? "challenge-done" : ""}">
            <div class="challenge-header">
                <span class="challenge-topic">${escapeHtml(challenge.topic)}</span>
                <span class="challenge-difficulty ${difficultyClass}">${escapeHtml(challenge.difficulty)}</span>
            </div>
            <h3 class="challenge-title">${escapeHtml(challenge.title)}</h3>
            <p class="challenge-desc">${escapeHtml(challenge.desc)}</p>
            <div class="challenge-footer">
                <span class="challenge-xp">+${challenge.xp} XP</span>
                <span class="challenge-status">${completed ? "✓ Đã hoàn thành" : "Chưa hoàn thành"}</span>
            </div>
            <div class="challenge-actions">
                <button class="btn-challenge ${completed ? "btn-done" : ""}" data-challenge-id="${challenge.id}" data-tab="${tab}">
                    ${completed ? "Hoàn thành rồi" : "Đánh dấu hoàn thành"}
                </button>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    if (text == null) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderGrid(tab) {
    const progress = loadProgress();
    const challenges = getChallenges(tab);
    const grid = tab === "daily" ? dailyGrid : tab === "weekly" ? weeklyGrid : monthlyGrid;

    if (!grid) return;
    grid.innerHTML = challenges.map((ch) => renderChallenge(ch, tab, progress)).join("");

    grid.querySelectorAll(".btn-challenge").forEach((btn) => {
        btn.addEventListener("click", () => {
            const challengeId = btn.dataset.challengeId;
            const tabName = btn.dataset.tab;

            const key = getProgressKey(tabName);
            const current = loadProgress();
            if (!current[key]) current[key] = {};
            current[key].completed = true;
            current[key].completedAt = Date.now();
            current[key].attempts = (current[key].attempts || 0) + 1;
            saveProgress(current);

            incrementStreak();
            renderAll();
        });
    });
}

function renderAll() {
    renderGrid("daily");
    renderGrid("weekly");
    renderGrid("monthly");
    updateCountdown();
    updateStreak();
}

function switchTab(tab) {
    currentTab = tab;
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    panels.forEach((p) => p.classList.toggle("active", p.id === `panel${tab.charAt(0).toUpperCase() + tab.slice(1)}`));
    updateCountdown();
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        switchTab(tab.dataset.tab);
    });
});

function init() {
    renderAll();
    updateStreak();
    initStreak("streakContainer");
    setInterval(() => {
        updateCountdown();
    }, 1000);
}

init();
