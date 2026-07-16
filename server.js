const express = require('express');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory tasks store
let tasks = [
  { id: 1, title: 'Construir la imagen de Docker', completed: true },
  { id: 2, title: 'Iniciar el contenedor con Docker Compose', completed: true },
  { id: 3, title: 'Explorar el Dashboard de estado', completed: false },
  { id: 4, title: 'Personalizar los estilos de la app', completed: false }
];

// Helper to format bytes
function formatBytes(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(2)} GB`;
}

// Endpoint: System Info
app.get('/api/system-info', (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  res.json({
    platform: os.platform() === 'linux' ? 'Linux (Inside Docker)' : os.platform(),
    architecture: os.arch(),
    uptime: os.uptime(),
    nodeVersion: process.version,
    memory: {
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(usedMem),
      percentage: ((usedMem / totalMem) * 100).toFixed(1)
    },
    dockerized: process.env.DOCKERIZED === 'true'
  });
});

// Endpoints: Tasks API
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title: title.trim(),
    completed: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { completed } = req.body;

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (completed !== undefined) {
    task.completed = !!completed;
  }

  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = tasks.length;
  tasks = tasks.filter(t => t.id !== id);

  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(204).end();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment DOCKERIZED: ${process.env.DOCKERIZED}`);
});
