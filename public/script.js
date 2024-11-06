const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const clearTasksButton = document.getElementById('clearTasksButton');
const taskList = document.getElementById('taskList');
const modeToggle = document.getElementById('modeToggle');

let currentEditTaskId = null;

window.onload = async () => {
    await loadTasks();
    modeToggle.checked = localStorage.getItem('darkMode') === 'true';
    toggleDarkMode();
};


addTaskButton.addEventListener('click', async () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const newTask = { id: Date.now(), text: taskText, completed: false };
        if (currentEditTaskId) {
            newTask.id = currentEditTaskId; 
            await updateTask(newTask);
            currentEditTaskId = null; 
        } else {
            await saveTask(newTask);
        }
        taskInput.value = '';
        await loadTasks();
    }
});

clearTasksButton.addEventListener('click', async () => {
    await clearTasks();
});


modeToggle.addEventListener('change', () => {
    toggleDarkMode();
});


async function loadTasks() {
    const response = await fetch('/getTasks');
    const tasks = await response.json();
    renderTasks(tasks);
}


function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.text;

        if (task.completed) {
            li.classList.add('completed'); 
        }

        
        const completeButton = document.createElement('button');
        completeButton.textContent = 'Complete';
        completeButton.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            task.completed = true; 
            await updateTask(task);
            await loadTasks(); 
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            taskInput.value = task.text; 
            currentEditTaskId = task.id; 
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation(); 
            await deleteTask(task.id);
            await loadTasks();
        });

        li.appendChild(completeButton); 
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
}


async function saveTask(task) {
    await fetch('/saveTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}


async function updateTask(task) {
    await fetch('/updateTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}


async function deleteTask(id) {
    await fetch(`/deleteTask/${id}`, { method: 'DELETE' });
}


async function clearTasks() {
    await fetch('/clearTasks', { method: 'DELETE' });
    
    taskList.innerHTML = ''; 
}


function toggleDarkMode() {
    document.body.classList.toggle('dark-mode', modeToggle.checked);
    localStorage.setItem('darkMode', modeToggle.checked);
}