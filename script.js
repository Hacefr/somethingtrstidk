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
    setTimeout(() => t.remove(), 3000);
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
        const dayTasks = events[key] || [];
        
        let flags = "";
        if (dayTasks.length > 4) {
            flags = `<div class="multi-flag">4+</div>`;
        } else {
            dayTasks.forEach(t => flags += `<div class="flag ${t.priority}"></div>`);
        }

        grid.innerHTML += `
            <div class="day ${isToday}" onclick="openSidebar('${key}')">
                <span class="day-num">${i}</span>
                <div class="flag-container">${flags}</div>
            </div>`;
    }
}

function openSidebar(key) {
    selectedDateKey = key;
    document.getElementById("sideDate").innerText = key.replace(/-/g, ' / ');
    document.getElementById("sidebar").classList.add("active");
    updateTaskList();
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("active");
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
    showToast("TASK SAVED");
}

function updateTaskList() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    (events[selectedDateKey] || []).forEach((t, i) => {
        list.innerHTML += `
            <div class="task-item">
                <div>
                    <span class="priority-tag tag-${t.priority}">${t.priority.toUpperCase()}</span>
                    <div style="font-weight:700">${t.title}</div>
                    <div style="font-size:0.8rem; opacity:0.6">${t.desc}</div>
                </div>
                <div>
                    <button class="action-btn" onclick="deleteTask(${i})">X</button>
                </div>
            </div>`;
    });
}

function deleteTask(i) {
    events[selectedDateKey].splice(i, 1);
    localStorage.setItem("soul_events", JSON.stringify(events));
    updateTaskList();
    render();
}

function changeMonth(d) { currentData.setMonth(currentData.getMonth() + d); render(); }

render();
