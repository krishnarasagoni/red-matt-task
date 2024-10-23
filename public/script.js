const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const clearTasksButton = document.getElementById('clearTasksButton');
const taskList = document.getElementById('taskList');
const modeToggle = document.getElementById('modeToggle');

let currentEditTaskId = null;

// Load tasks from JSON file on page load
window.onload = async () => {
    await loadTasks();
    modeToggle.checked = localStorage.getItem('darkMode') === 'true';
    toggleDarkMode();
};

// Add task event listener
addTaskButton.addEventListener('click', async () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const newTask = { id: Date.now(), text: taskText, completed: false };
        if (currentEditTaskId) {
            newTask.id = currentEditTaskId; // Use existing ID for editing
            await updateTask(newTask);
            currentEditTaskId = null; // Reset edit state
        } else {
            await saveTask(newTask);
        }
        taskInput.value = '';
        await loadTasks();
    }
});

// Clear all tasks event listener
clearTasksButton.addEventListener('click', async () => {
    await clearTasks();
});

// Toggle dark mode event listener
modeToggle.addEventListener('change', () => {
    toggleDarkMode();
});

// Function to load tasks from JSON file
async function loadTasks() {
    const response = await fetch('/getTasks');
    const tasks = await response.json();
    renderTasks(tasks);
}

// Function to render tasks in the UI
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text;

        if (task.completed) {
            li.classList.add('completed'); // Add class for completed tasks
        }

        // Create a complete button for each task
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent triggering other events on the li
            task.completed = true; // Mark as completed
            await updateTask(task); // Update task in JSON file
            await loadTasks(); // Reload tasks to reflect changes in UI
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering the click event on the li
            taskInput.value = task.text; // Set input to current task text for editing
            currentEditTaskId = task.id; // Store current editing task ID
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent triggering the click event on the li
            await deleteTask(task.id);
            await loadTasks();
        });

        li.appendChild(completeButton); // Append complete button to list item
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
}

// Function to save a new task to the server
async function saveTask(task) {
    await fetch('/saveTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

// Function to update an existing task on the server
async function updateTask(task) {
    await fetch('/updateTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

// Function to delete a task from the server
async function deleteTask(id) {
    await fetch(`/deleteTask/${id}`, { method: 'DELETE' });
}

// Function to clear all tasks from the server
async function clearTasks() {
    await fetch('/clearTasks', { method: 'DELETE' });
    // Clear UI immediately after clearing tasks in backend
    taskList.innerHTML = ''; 
}

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode', modeToggle.checked);
    localStorage.setItem('darkMode', modeToggle.checked);
}