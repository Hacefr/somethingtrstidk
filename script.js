let currentData = new Date();
let selectedDateKey = "";
let events = JSON.parse(localStorage.getItem("soul_events")) || {};

function toggleTheme() {
    const doc = document.documentElement;
    const isDark = doc.getAttribute("data-theme") === "dark";
    doc.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("soul_theme", isDark ? "light" : "dark");
}

if (localStorage.getItem("soul_theme") === "dark") document.documentElement.setAttribute("data-theme", "dark");

// Notification System
function showToast(message) {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Check schedule on startup
window.onload = () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const todayTasks = events[key] || [];
    
    if (todayTasks.length > 0) {
        showToast(`YOU HAVE ${todayTasks.length} TASKS SCHEDULED FOR TODAY`);
    } else {
        showToast("WELCOME BACK. YOUR SCHEDULE IS CLEAR TODAY.");
    }
    render();
};

function render() {
    const grid = document.getElementById("calendarGrid");
    const display = document.getElementById("monthDisplay");
    grid.innerHTML = "";

    const year = currentData.getFullYear();
    const month = currentData.getMonth();
    display.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentData).toUpperCase();

    ['SUN','MON','TUE','WED','THU','FRI','SAT'].forEach(d => grid.innerHTML += `<div class="weekday">${d}</div>`);

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    for (let i = 1; i <= lastDate; i++) {
        const dateKey = `${year}-${month}-${i}`;
        const isToday = new Date().toDateString() === new Date(year, month, i).toDateString() ? "today" : "";
        const dayEvents = events[dateKey] || [];
        
        let flags = "";
        if (dayEvents.length > 4) { flags = `<div class="multi-flag">4+</div>`; }
        else { dayEvents.forEach(() => flags += `<div class="flag"></div>`); }

        grid.innerHTML += `
            <div class="day ${isToday}" onclick="openSidebar('${dateKey}')">
                <span class="day-num">${i}</span>
                <div class="flag-container">${flags}</div>
            </div>`;
    }
}

function changeMonth(diff) {
    currentData.setMonth(currentData.getMonth() + diff);
    render();
}

// Sidebar & Task Logic
function openSidebar(key) {
    selectedDateKey = key;
    document.getElementById("sideDate").innerText = key.replace(/-/g, ' / ');
    document.getElementById("sidebar").classList.add("active");
    updateTaskList();
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("active");
}

function updateTaskList() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    (events[selectedDateKey] || []).forEach((task, index) => {
        list.innerHTML += `
            <div class="task-item">
                <div class="task-top">
                    <span class="task-title">${task.title}</span>
                    <div>
                        <button class="action-btn" onclick="editTask(${index})">EDIT</button>
                        <button class="action-btn" onclick="deleteTask(${index})">X</button>
                    </div>
                </div>
                ${task.desc ? `<span class="task-desc">${task.desc}</span>` : ''}
            </div>`;
    });
}

function saveTask() {
    const title = document.getElementById("taskInput").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    if (!title) return;

    if (!events[selectedDateKey]) events[selectedDateKey] = [];
    events[selectedDateKey].push({ title, desc });
    
    localStorage.setItem("soul_events", JSON.stringify(events));
    document.getElementById("taskInput").value = "";
    document.getElementById("taskDesc").value = "";
    updateTaskList();
    render();
    showToast("TASK RECORDED");
}

function deleteTask(index) {
    events[selectedDateKey].splice(index, 1);
    if (events[selectedDateKey].length === 0) delete events[selectedDateKey];
    localStorage.setItem("soul_events", JSON.stringify(events));
    updateTaskList();
    render();
    showToast("TASK REMOVED");
}

function editTask(index) {
    const task = events[selectedDateKey][index];
    document.getElementById("taskInput").value = task.title;
    document.getElementById("taskDesc").value = task.desc;
    deleteTask(index);
}
