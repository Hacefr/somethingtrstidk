let currentData = new Date();
let selectedDateKey = "";
let events = JSON.parse(localStorage.getItem("soul_events")) || {};

function toggleTheme() {
    const doc = document.documentElement;
    const isDark = doc.getAttribute("data-theme") === "dark" || !doc.getAttribute("data-theme");
    doc.setAttribute("data-theme", isDark ? "light" : "dark");
}

function showToast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.innerText = msg;
    document.getElementById("toastContainer").appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);
}

function render() {
    const grid = document.getElementById("calendarGrid");
    const display = document.getElementById("monthDisplay");
    grid.innerHTML = "";
    const year = currentData.getFullYear();
    const month = currentData.getMonth();
    display.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentData).toUpperCase();
    ['S','M','T','W','T','F','S'].forEach(d => grid.innerHTML += `<div class="weekday">${d}</div>`);
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;
    for (let i = 1; i <= lastDate; i++) {
        const key = `${year}-${month}-${i}`;
        const isToday = new Date().toDateString() === new Date(year, month, i).toDateString() ? "today" : "";
        const isSelected = selectedDateKey === key ? "active-day" : "";
        const dayTasks = events[key] || [];
        let flags = "";
        dayTasks.slice(0, 4).forEach(t => flags += `<div class="flag ${t.priority}"></div>`);
        if (dayTasks.length > 4) flags = `<div class="multi-flag">4+</div>`;
        grid.innerHTML += `<div class="day ${isToday} ${isSelected}" id="day-${key}" onclick="openSidebar('${key}')"><span class="day-num">${i}</span><div class="flag-container">${flags}</div></div>`;
    }
}

function openSidebar(key) {
    if(selectedDateKey && document.getElementById(`day-${selectedDateKey}`)) document.getElementById(`day-${selectedDateKey}`).classList.remove('active-day');
    selectedDateKey = key;
    if(document.getElementById(`day-${key}`)) document.getElementById(`day-${key}`).classList.add('active-day');
    document.getElementById("sideDate").innerText = key.replace(/-/g, ' . ');
    document.getElementById("sidebar").classList.add("active");
    updateTaskList();
}

function exportData() {
    const blob = new Blob([JSON.stringify(events)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `soul_schedule_${Date.now()}.json`;
    a.click();
    showToast("EXPORTED");
}

function importData(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            events = JSON.parse(e.target.result);
            localStorage.setItem("soul_events", JSON.stringify(events));
            render(); showToast("IMPORTED");
        } catch(err) { showToast("INVALID FILE"); }
    };
    reader.readAsText(event.target.files);
}

function clearAllTime() {
    if (confirm("FACTORY RESET? EVERYTHING WILL BE DELETED.")) {
        events = {}; localStorage.clear(); location.reload();
    }
}

function clearDay() { if (confirm("CLEAR DAY?")) { delete events[selectedDateKey]; sync(); } }
function clearMonth() { if (confirm("CLEAR MONTH?")) { const [y, m] = selectedDateKey.split('-'); Object.keys(events).forEach(k => { if(k.startsWith(`${y}-${m}-`)) delete events[k]; }); sync(); } }
function sync() { localStorage.setItem("soul_events", JSON.stringify(events)); updateTaskList(); render(); showToast("SYNCED"); }

function saveTask() {
    const title = document.getElementById("taskInput").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const imgInput = document.getElementById("taskImageInput");
    if (!title) return;
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => addTaskToStorage({ title, desc, priority, image: e.target.result });
        reader.readAsDataURL(imgInput.files[0]);
    } else { addTaskToStorage({ title, desc, priority, image: null }); }
}

function addTaskToStorage(t) {
    if (!events[selectedDateKey]) events[selectedDateKey] = [];
    events[selectedDateKey].push(t); sync();
    document.getElementById("taskInput").value = ""; document.getElementById("taskDesc").value = ""; document.getElementById("taskImageInput").value = "";
}

function updateTaskList() {
    const list = document.getElementById("taskList"); list.innerHTML = "";
    (events[selectedDateKey] || []).forEach((t, i) => {
        list.innerHTML += `<div class="task-item"><div class="task-main"><div style="display:flex; align-items:center"><div class="task-tag tag-${t.priority}"></div><div style="font-weight:900; font-size:0.9rem">${t.title}</div></div><button class="close-icon" onclick="deleteTask(${i})" style="font-size:0.7rem; opacity:0.4">X</button></div><div style="font-size:0.75rem; opacity:0.5">${t.desc}</div>${t.image ? `<img src="${t.image}" class="task-img-preview" onclick="window.open(this.src)">` : ""}</div>`;
    });
}

function deleteTask(i) { events[selectedDateKey].splice(i, 1); if(events[selectedDateKey].length === 0) delete events[selectedDateKey]; sync(); }
function togglePanel(id) { ['actionPanel', 'creditPanel'].forEach(p => document.getElementById(p).style.display = (p === id && document.getElementById(p).style.display !== 'block') ? 'block' : 'none'); }
function closeSidebar() { document.getElementById("sidebar").classList.remove("active"); }
function changeMonth(d) { currentData.setMonth(currentData.getMonth() + d); render(); }
window.addEventListener('load', () => render());
