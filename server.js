const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'tasks.json');

// Utility functions to read and write to the JSON file
const readData = () => {
   if (!fs.existsSync(dataPath)) return { users: [] };
   const jsonData = fs.readFileSync(dataPath);
   return JSON.parse(jsonData);
};

const writeData = (data) => {
   fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// API Endpoints

// Get all tasks
app.get('/getTasks', (req, res) => {
   const data = readData();
   res.json(data.users);
});

// Save a new task
app.post('/saveTask', (req, res) => {
   const data = readData();
   data.users.push(req.body);
   writeData(data);
   res.status(201).send(req.body);
});

// Update an existing task
app.put('/updateTask', (req, res) => {
   const data = readData();
   const index = data.users.findIndex(task => task.id === req.body.id);
   
   if (index !== -1) {
       data.users[index] = req.body; // Update task
       writeData(data);
       res.send(req.body);
   } else {
       res.status(404).send({ message: "Task not found" });
   }
});

// Delete a specific task by ID
app.delete('/deleteTask/:id', (req, res) => {
   const data = readData();
   
   const filteredUsers = data.users.filter(task => task.id !== parseInt(req.params.id));
   
   if (filteredUsers.length !== data.users.length) { // Task was found and removed
       writeData({ users: filteredUsers });
       res.status(204).send(); // No content response for successful deletion
   } else {
       res.status(404).send({ message:"Task not found" });
   }
});

// Clear all tasks
app.delete('/clearTasks', (req, res) => {
   writeData({ users : [] }); // Clear all tasks by writing an empty array
   res.status(204).send(); // No content response for successful deletion of all tasks 
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));