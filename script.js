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
  