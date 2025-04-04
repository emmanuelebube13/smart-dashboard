// Clock
setInterval(() => {
    document.getElementById("clock").textContent = new Date().toLocaleTimeString();
  }, 1000);
  
  // Theme toggle
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }
  
  // Task System
  let tasks = JSON.parse(localStorage.getItem('myTasks') || '[]');
  
  function addTask() {
    const task = {
      text: taskInput.value,
      type: taskType.value,
      priority: priority.value,
      deadline: deadline.value,
      notes: notes.value,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      completed: false
    };
    tasks.push(task);
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
    taskInput.value = notes.value = deadline.value = '';
  }
  
  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = t.completed ? 'complete' : '';
      li.innerHTML = `${t.text}<br><small>${t.type} | ${t.priority} | ${t.deadline || 'No deadline'}</small>
      <br><button onclick="toggleTask(${i})">✔</button> <button onclick="deleteTask(${i})">🗑</button>`;
      taskList.appendChild(li);
    });
  }
  
  function toggleTask(i) {
    tasks[i].completed = !tasks[i].completed;
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    renderTasks();
  }
  
  function deleteTask(i) {
    if (confirm("Delete this task?")) {
      tasks.splice(i, 1);
      localStorage.setItem('myTasks', JSON.stringify(tasks));
      renderTasks();
    }
  }
  
  renderTasks();
  
  // Quiz
  function checkQuiz(i) {
    document.getElementById("quizResult").textContent =
      i === 1 ? "✅ Correct!" : "❌ Try again.";
  }
  
  // Ideas / Later Goals
  let ideas = JSON.parse(localStorage.getItem("myIdeas") || "[]");
  
  function saveIdea() {
    const input = document.getElementById("ideas");
    const text = input.value.trim();
    if (text) {
      ideas.push(text);
      localStorage.setItem("myIdeas", JSON.stringify(ideas));
      input.value = '';
      renderIdeas();
    }
  }
  
  function renderIdeas() {
    const list = document.getElementById("ideaList");
    list.innerHTML = '';
    ideas.forEach(i => {
      const li = document.createElement("li");
      li.textContent = i;
      list.appendChild(li);
    });
  }
  
  renderIdeas();
  
  // Study Topics from JSON
  async function loadTopics() {
    try {
      const res = await fetch("detailed_data_science_topics.json");
      const data = await res.json();
      const topic = data[Math.floor(Math.random() * data.length)];
      document.getElementById("studyTopic").innerHTML =
        `<strong>${topic.Category}</strong>: ${topic.Topic}<br><em>${topic.Description}</em>`;
    } catch (err) {
      document.getElementById("studyTopic").textContent =
        "⚠️ Couldn't load topics. Ensure JSON is in the same folder.";
    }
  }
  
  loadTopics();
  setInterval(loadTopics, 7200000); // every 2 hours
  
  // Charts
  const ctx1 = document.getElementById('taskChart').getContext('2d');
  const ctx2 = document.getElementById('taskHeat').getContext('2d');
  const byType = {}, byHour = Array(24).fill(0);
  
  tasks.forEach(t => {
    byType[t.type] = (byType[t.type] || 0) + 1;
    const h = parseInt(t.time.split(":")[0]);
    byHour[h]++;
  });
  
  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(byType),
      datasets: [{
        label: 'Tasks by Type',
        data: Object.values(byType),
        backgroundColor: '#1976d2'
      }]
    }
  });
  
  new Chart(ctx2, {
    type: 'line',
    data: {
      labels: [...Array(24).keys()].map(h => `${h}:00`),
      datasets: [{
        label: 'Hourly Activity',
        data: byHour,
        borderColor: '#4caf50',
        fill: false
      }]
    }
  });
  
  // CSV Export
  function exportCSV() {
    const range = document.getElementById("exportRange").value;
    const now = new Date();
    const start = new Date(now);
    if (range === 'week') start.setDate(start.getDate() - 7);
    else if (range === 'month') start.setMonth(start.getMonth() - 1);
    const filtered = tasks.filter(t => new Date(t.date) >= start);
  
    const csv = "Task,Type,Priority,Date,Time,Deadline,Notes\n" + filtered.map(t =>
      [t.text, t.type, t.priority, t.date, t.time, t.deadline, t.notes].join(",")
    ).join("\n");
  
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
  }
  
  // Initialize time grid for daily planner
  function initPlanner() {
    const timeGrid = document.getElementById("timeGrid");
    const stored = JSON.parse(localStorage.getItem("dailyPlanner") || "{}");
  
    timeGrid.innerHTML = '';
  
    for (let h = 6; h <= 23; h++) {
      const display = h < 12 ? `${h} AM` : (h === 12 ? '12 PM' : `${h - 12} PM`);
      const slot = document.createElement("div");
      slot.className = "timeSlot";
      slot.id = `hour-${h}`;
      slot.ondrop = dropTask;
      slot.ondragover = (e) => e.preventDefault();
  
      const label = document.createElement("h4");
      label.textContent = display;
  
      const taskList = document.createElement("div");
      taskList.className = "taskList";
  
      const tasks = stored[h] || [];
      tasks.forEach((taskText, index) => {
        const task = document.createElement("div");
        task.className = "taskItem";
        task.draggable = true;
        task.textContent = taskText;
        task.dataset.hour = h;
        task.dataset.index = index;
  
        task.ondragstart = (e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify({ text: taskText, fromHour: h, index }));
        };
  
        taskList.appendChild(task);
      });
  
      slot.appendChild(label);
      slot.appendChild(taskList);
      timeGrid.appendChild(slot);
    }
  }
  
  function dropTask(e) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const toHour = parseInt(e.currentTarget.id.split("-")[1]);
  
    const stored = JSON.parse(localStorage.getItem("dailyPlanner") || "{}");
  
    // Remove from original slot
    stored[data.fromHour].splice(data.index, 1);
    if (!stored[toHour]) stored[toHour] = [];
    stored[toHour].push(data.text);
  
    localStorage.setItem("dailyPlanner", JSON.stringify(stored));
    initPlanner();
  }
  

  function addPlannerTask() {
    const task = document.getElementById("plannerTask").value.trim();
    let hour = document.getElementById("plannerHour").value;
  
    if (!task) return alert("Please enter a task.");
  
    const stored = JSON.parse(localStorage.getItem("dailyPlanner") || "{}");
  
    // 🧠 Auto-select first empty hour if none is picked
    if (!hour) {
      for (let h = 6; h <= 23; h++) {
        if (!stored[h] || stored[h].length === 0) {
          hour = h;
          break;
        }
      }
      if (!hour) return alert("No available time slots left today.");
    }
  
    stored[hour] = stored[hour] || [];
    stored[hour].push(task);
  
    localStorage.setItem("dailyPlanner", JSON.stringify(stored));
    document.getElementById("plannerTask").value = '';
    document.getElementById("plannerHour").value = '';
    initPlanner();
  }

  const closedCards = JSON.parse(localStorage.getItem("closedCards") || "[]");

function toggleMinimize(button) {
  const card = button.closest(".card");
  card.classList.toggle("minimized");
}

function closeCard(button) {
  const card = button.closest(".card");
  const section = card.dataset.section;
  card.classList.add("hidden");

  if (!closedCards.includes(section)) {
    closedCards.push(section);
    localStorage.setItem("closedCards", JSON.stringify(closedCards));
  }

  renderRestoreButton();
}

function renderRestoreButton() {
  let restoreDiv = document.getElementById("restoreArea");
  if (!restoreDiv) {
    restoreDiv = document.createElement("div");
    restoreDiv.id = "restoreArea";
    document.body.appendChild(restoreDiv);
  }
  restoreDiv.innerHTML = '';
  closedCards.forEach(section => {
    const btn = document.createElement("button");
    btn.textContent = `Restore ${section}`;
    btn.onclick = () => restoreCard(section);
    restoreDiv.appendChild(btn);
  });
}

function restoreCard(section) {
  const card = document.querySelector(`.card[data-section='${section}']`);
  if (card) card.classList.remove("hidden");

  const index = closedCards.indexOf(section);
  if (index !== -1) closedCards.splice(index, 1);
  localStorage.setItem("closedCards", JSON.stringify(closedCards));
  renderRestoreButton();
}

// On load, hide cards already marked as closed
window.addEventListener('DOMContentLoaded', () => {
  closedCards.forEach(section => {
    const card = document.querySelector(`.card[data-section='${section}']`);
    if (card) card.classList.add("hidden");
  });
  renderRestoreButton();
});

  
  
