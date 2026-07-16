document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const valOs = document.getElementById('val-os');
  const valArch = document.getElementById('val-arch');
  const valUptime = document.getElementById('val-uptime');
  const valNode = document.getElementById('val-node');
  const valMemPercent = document.getElementById('val-mem-percent');
  const valMemUsed = document.getElementById('val-mem-used');
  const valMemTotal = document.getElementById('val-mem-total');
  const memoryRadialBar = document.getElementById('memory-radial-bar');
  const dockerBadge = document.getElementById('docker-badge');
  const dockerStatusText = document.getElementById('docker-status-text');
  
  const newLocalTaskForm = document.getElementById('new-task-form');
  const taskInput = document.getElementById('task-input');
  const tasksListElement = document.getElementById('tasks-list-element');

  // Add gradient defs dynamically to the radial SVG
  const radialSvg = document.querySelector('.radial-svg');
  if (radialSvg) {
    radialSvg.insertAdjacentHTML('afterbegin', `
      <defs>
        <linearGradient id="radial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--color-accent-1)" />
          <stop offset="100%" stop-color="var(--color-accent-2)" />
        </linearGradient>
      </defs>
    `);
  }

  // Uptime state (frontend increments it every second for smooth update)
  let uptimeSeconds = 0;

  // Format Uptime (seconds -> DD hh:mm:ss)
  function formatUptime(seconds) {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    
    let parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h.toString().padStart(2, '0')}h`);
    parts.push(`${m.toString().padStart(2, '0')}m`);
    parts.push(`${s.toString().padStart(2, '0')}s`);
    
    return parts.join(' ');
  }

  // Uptime ticker
  setInterval(() => {
    if (uptimeSeconds > 0) {
      uptimeSeconds++;
      valUptime.textContent = formatUptime(uptimeSeconds);
    }
  }, 1000);

  // Fetch System Information
  async function fetchSystemInfo() {
    try {
      const res = await fetch('/api/system-info');
      const data = await res.json();
      
      // Update basic fields
      valOs.textContent = data.platform;
      valArch.textContent = data.architecture;
      valNode.textContent = data.nodeVersion;
      
      // Sync uptime
      uptimeSeconds = data.uptime;
      valUptime.textContent = formatUptime(uptimeSeconds);
      
      // Update Memory Circle
      const percent = parseFloat(data.memory.percentage);
      valMemPercent.textContent = `${percent}%`;
      valMemUsed.textContent = data.memory.used;
      valMemTotal.textContent = data.memory.total;
      
      // Circular progress logic: circumference is 314 (r=50)
      const circumference = 314;
      const offset = circumference - (percent / 100) * circumference;
      memoryRadialBar.style.strokeDashoffset = offset;
      
      // Update Docker status badge
      if (data.dockerized) {
        dockerBadge.classList.add('dockerized');
        dockerStatusText.textContent = 'DOCKER CONTAINER';
      } else {
        dockerBadge.classList.remove('dockerized');
        dockerStatusText.textContent = 'HOST LOCAL';
      }
    } catch (err) {
      console.error('Error fetching system info:', err);
    }
  }

  // Fetch Tasks
  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      const tasks = await res.json();
      renderTasks(tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      tasksListElement.innerHTML = `<li class="task-loading">Error al cargar tareas</li>`;
    }
  }

  // Render Tasks to DOM
  function renderTasks(tasks) {
    if (tasks.length === 0) {
      tasksListElement.innerHTML = `<li class="task-loading">No hay tareas creadas.</li>`;
      return;
    }

    tasksListElement.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = task.completed ? 'completed' : '';
      li.id = `task-row-${task.id}`;
      
      li.innerHTML = `
        <div class="task-left-section" id="task-toggle-${task.id}">
          <div class="task-checkbox" id="task-check-${task.id}">
            <i class="fas fa-check"></i>
          </div>
          <span class="task-text" id="task-text-${task.id}">${escapeHTML(task.title)}</span>
        </div>
        <button class="task-delete-btn" id="task-delete-${task.id}" title="Eliminar tarea">
          <i class="fas fa-trash-can"></i>
        </button>
      `;

      // Event listener for toggling completed state
      const toggleArea = li.querySelector('.task-left-section');
      toggleArea.addEventListener('click', () => toggleTask(task.id, !task.completed));

      // Event listener for delete button
      const deleteBtn = li.querySelector('.task-delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });

      tasksListElement.appendChild(li);
    });
  }

  // Toggle Task Completion State
  async function toggleTask(id, completed) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  }

  // Delete Task
  async function deleteTask(id) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }

  // Form Submit for Add Task
  newLocalTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      
      if (res.ok) {
        taskInput.value = '';
        fetchTasks();
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  });

  // Utility helper to prevent HTML injection
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial loads
  fetchSystemInfo();
  fetchTasks();

  // Poll system info every 10 seconds (keep dashboard updated)
  setInterval(fetchSystemInfo, 10000);
});
