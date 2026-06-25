import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getActivityDates } from "./user-service.js";

// Lấy 7 ngày gần nhất
function getLast7Dates() {
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = i === 0 ? "Hôm nay" : days[d.getDay()];
        
        dates.push({
            dateStr: `${yyyy}-${mm}-${dd}`,
            label: dayName
        });
    }
    return dates;
}

export function initStreak(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `<div class="streak-loading">Đang tải streak...</div>`;

    onAuthStateChanged(auth, async (user) => {
        const uid = user ? user.uid : "guest";
        const activitySet = await getActivityDates(uid);
        
        const last7 = getLast7Dates();
        
        let html = `<div class="streak-wrapper">
            <h3 class="streak-title" style="margin-bottom: 15px; font-size: 16px; color: var(--blue);">🔥 Chuỗi học tập (7 ngày qua)</h3>
            <div class="streak-days" style="display: flex; gap: 10px; justify-content: space-between; overflow-x: auto; padding-bottom: 10px;">`;
            
        let currentStreak = 0;
        
        for (let i = last7.length - 1; i >= 0; i--) {
            if (activitySet.has(last7[i].dateStr)) {
                currentStreak++;
            } else {
                if (i !== last7.length - 1) { // Bỏ qua nếu hôm nay chưa học, nhưng nếu hôm qua nghỉ thì ngắt
                    break;
                }
            }
        }
            
        last7.forEach(day => {
            const isActive = activitySet.has(day.dateStr);
            const circleStyle = isActive 
                ? "background: var(--green); color: white; border: 2px solid var(--green);" 
                : "background: var(--tag-bg); color: transparent; border: 2px solid var(--border);";
                
            html += `
                <div class="streak-day-item" title="${day.dateStr}" style="display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 40px;">
                    <div class="streak-circle" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: 0.3s; ${circleStyle}">
                        ${isActive ? '✓' : ''}
                    </div>
                    <span class="streak-label" style="font-size: 12px; color: var(--muted); font-weight: 500;">${day.label}</span>
                </div>
            `;
        });
        
        html += `</div>
            <p class="streak-count" style="margin-top: 15px; font-size: 14px; color: var(--text);">
                Bạn đã học liên tục <strong>${currentStreak}</strong> ngày!
            </p>
        </div>`;
        
        container.innerHTML = html;
    });
}
