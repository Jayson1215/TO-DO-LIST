// Get DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const archiveList = document.getElementById('archiveList');
const archiveCount = document.getElementById('archiveCount');
const activeTab = document.getElementById('activeTab');
const archiveTab = document.getElementById('archiveTab');
const activeView = document.getElementById('activeView');
const archiveView = document.getElementById('archiveView');

// Load tasks and archived tasks from localStorage when page loads
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let archivedTasks = JSON.parse(localStorage.getItem('archivedTasks')) || [];

// Render tasks on page load
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    renderArchive();
});

// Tab switching
activeTab.addEventListener('click', () => {
    activeView.classList.remove('hidden');
    archiveView.classList.add('hidden');
    activeTab.classList.add('active');
    archiveTab.classList.remove('active');
});

archiveTab.addEventListener('click', () => {
    activeView.classList.add('hidden');
    archiveView.classList.remove('hidden');
    activeTab.classList.remove('active');
    archiveTab.classList.add('active');
});

// Add task when button is clicked
addBtn.addEventListener('click', addTask);

// Add task when Enter key is pressed
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Add new task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    // Create task object
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    // Add to tasks array
    tasks.push(task);

    // Save to localStorage
    saveTasks();

    // Clear input field
    taskInput.value = '';
    taskInput.focus();

    // Render tasks
    renderTasks();
}

// Render all tasks
function renderTasks() {
    taskList.innerHTML = '';

    tasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        taskList.appendChild(li);
    });

    updateTaskCount();
}

// Toggle task completion status
function toggleTask(id) {
    tasks = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskToArchive = tasks.find((task) => task.id === id);
        if (taskToArchive) {
            archivedTasks.push(taskToArchive);
        }
        tasks = tasks.filter((task) => task.id !== id);
        saveTasks();
        saveArchive();
        renderTasks();
        renderArchive();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Save archived tasks to localStorage
function saveArchive() {
    localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks));
}

// Render archived tasks
function renderArchive() {
    archiveList.innerHTML = '';

    if (archivedTasks.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = 'No archived tasks';
        archiveList.appendChild(emptyMsg);
        updateArchiveCount();
        return;
    }

    archivedTasks.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item archived';
        li.innerHTML = `
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="restore-btn" onclick="restoreTask(${task.id})">Restore</button>
            <button class="permanent-delete-btn" onclick="permanentlyDeleteTask(${task.id})">Remove</button>
        `;
        archiveList.appendChild(li);
    });

    updateArchiveCount();
}

// Restore task from archive
function restoreTask(id) {
    const taskToRestore = archivedTasks.find((task) => task.id === id);
    if (taskToRestore) {
        tasks.push(taskToRestore);
        archivedTasks = archivedTasks.filter((task) => task.id !== id);
        saveTasks();
        saveArchive();
        renderTasks();
        renderArchive();
    }
}

// Permanently delete task from archive
function permanentlyDeleteTask(id) {
    if (confirm('Are you sure? This cannot be undone.')) {
        archivedTasks = archivedTasks.filter((task) => task.id !== id);
        saveArchive();
        renderArchive();
    }
}

// Update task count
function updateTaskCount() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;

    if (totalTasks === 0) {
        taskCount.textContent = 'No tasks yet. Add one to get started!';
    } else {
        taskCount.textContent = `${completedTasks}/${totalTasks} tasks completed`;
    }
}

// Update archived task count
function updateArchiveCount() {
    const archivedCount = archivedTasks.length;

    if (archivedCount === 0) {
        archiveCount.textContent = '0 archived tasks';
    } else {
        archiveCount.textContent = `${archivedCount} archived task${archivedCount > 1 ? 's' : ''}`;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
