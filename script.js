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
    t.className = "toast";
    t.innerText = msg;
    document.getElementById("toastContainer").appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 500);
    }, 4000);
}

function checkDailyBriefing() {
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const todayTasks = events[key] || [];
    
    if (todayTasks.length > 0) {
        todayTasks.forEach((task, index) => {
            setTimeout(() => {
                showToast(task.title.toUpperCase());
            }, (index) * 1000);
        });
    }
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
        if (dayTasks.length > 4) {
            flags = `<div class="multi-flag">4+</div>`;
        } else {
            dayTasks.forEach(t => flags += `<div class="flag ${t.priority}"></div>`);
        }

        grid.innerHTML += `
            <div class="day ${isToday} ${isSelected}" id="day-${key}" onclick="openSidebar('${key}')">
                <span class="day-num">${i}</span>
                <div class="flag-container">${flags}</div>
            </div>`;
    }
}

function openSidebar(key) {
    if(selectedDateKey) {
        const prev = document.getElementById(`day-${selectedDateKey}`);
        if(prev) prev.classList.remove('active-day');
    }
    
    selectedDateKey = key;
    const currentDayEl = document.getElementById(`day-${key}`);
    if(currentDayEl) currentDayEl.classList.add('active-day');
    
    const dateDisplay = key.replace(/-/g, ' . ');
    document.getElementById("sideDate").innerText = dateDisplay;
    document.getElementById("sidebar").classList.add("active");
    updateTaskList();
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("active");
    if(selectedDateKey) {
        const active = document.getElementById(`day-${selectedDateKey}`);
        if(active) active.classList.remove('active-day');
        selectedDateKey = "";
    }
}

function saveTask() {
    const title = document.getElementById("taskInput").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    const priority = document.getElementById("taskPriority").value;
    if (!title) return;

    if (!events[selectedDateKey]) events[selectedDateKey] = [];
    events[selectedDateKey].push({ title, desc, priority });
    
    localStorage.setItem("soul_events", JSON.stringify(events));
    document.getElementById("taskInput").value = "";
    document.getElementById("taskDesc").value = "";
    updateTaskList();
    render();
    showToast("SAVED");
}

function updateTaskList() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    (events[selectedDateKey] || []).forEach((t, i) => {
        list.innerHTML += `
            <div class="task-item">
                <div style="display:flex; align-items:center">
                    <div class="task-tag tag-${t.priority}"></div>
                    <div>
                        <div style="font-weight:900; font-size:0.9rem">${t.title}</div>
                        <div style="font-size:0.75rem; opacity:0.5">${t.desc}</div>
                    </div>
                </div>
                <button class="close-icon" onclick="deleteTask(${i})" style="font-size:0.7rem; opacity:0.4">X</button>
            </div>`;
    });
}

function deleteTask(i) {
    events[selectedDateKey].splice(i, 1);
    if(events[selectedDateKey].length === 0) delete events[selectedDateKey];
    localStorage.setItem("soul_events", JSON.stringify(events));
    updateTaskList();
    render();
}

function changeMonth(d) { currentData.setMonth(currentData.getMonth() + d); render(); }

window.addEventListener('load', () => {
    render();
    checkDailyBriefing();
});
