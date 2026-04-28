let currentData = new Date();
let selectedDateKey = "";
let events = JSON.parse(localStorage.getItem("soul_events")) || {};

// Theme Logic
function toggleTheme() {
    const doc = document.documentElement;
    const isDark = doc.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    doc.setAttribute("data-theme", newTheme);
    localStorage.setItem("soul_theme", newTheme);
}

if (localStorage.getItem("soul_theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
}

// Calendar Rendering
function render() {
    const grid = document.getElementById("calendarGrid");
    const display = document.getElementById("monthDisplay");
    grid.innerHTML = "";

    const year = currentData.getFullYear();
    const month = currentData.getMonth();
    
    display.innerText = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentData);

    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
        grid.innerHTML += `<div class="weekday">${d[0]}</div>`;
    });

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    for (let i = 1; i <= lastDate; i++) {
        const dateKey = `${year}-${month}-${i}`;
        const isToday = new Date().toDateString() === new Date(year, month, i).toDateString() ? "today" : "";
        const dayEvents = events[dateKey] || [];
        
        let flags = "";
        if (dayEvents.length > 4) {
            flags = `<div class="multi-flag">4+</div>`;
        } else {
            dayEvents.forEach(() => flags += `<div class="flag"></div>`);
        }

        grid.innerHTML += `
            <div class="day ${isToday}" onclick="openModal('${dateKey}')">
                <span class="day-num">${i}</span>
                <div class="flag-container">${flags}</div>
            </div>`;
    }
}

function changeMonth(diff) {
    currentData.setMonth(currentData.getMonth() + diff);
    render();
}

// Task Management
function openModal(key) {
    selectedDateKey = key;
    const parts = key.split('-');
    const formattedDate = new Date(parts[0], parts[1], parts[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById("modalDate").innerText = formattedDate;
    document.getElementById("eventModal").style.display = "flex";
    updateTaskList();
}

function closeModal() {
    document.getElementById("eventModal").style.display = "none";
}

function updateTaskList() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    const dayEvents = events[selectedDateKey] || [];
    
    dayEvents.forEach((t, index) => {
        list.innerHTML += `
            <div class="task-item">
                <span>${t}</span>
                <span class="delete-task" onclick="deleteTask(${index})">&times;</span>
            </div>`;
    });
}

function saveTask() {
    const input = document.getElementById("taskInput");
    if (!input.value.trim()) return;

    if (!events[selectedDateKey]) events[selectedDateKey] = [];
    events[selectedDateKey].push(input.value.trim());
    
    localStorage.setItem("soul_events", JSON.stringify(events));
    input.value = "";
    updateTaskList();
    render();
}

function deleteTask(index) {
    events[selectedDateKey].splice(index, 1);
    if (events[selectedDateKey].length === 0) delete events[selectedDateKey];
    
    localStorage.setItem("soul_events", JSON.stringify(events));
    updateTaskList();
    render();
}

render();
