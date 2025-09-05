class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
    this.currentFilter = "all";
    this.editingTaskId = null;

    this.initializeElements();
    this.attachEventListeners();
    this.setDefaultDate();
    this.renderTasks();
    this.updateCounter();
  }

  initializeElements() {
    this.taskForm = document.getElementById("taskForm");
    this.taskInput = document.getElementById("taskInput");
    this.dateInput = document.getElementById("dateInput");
    this.tasksContainer = document.getElementById("tasksContainer");
    this.deleteAllBtn = document.getElementById("deleteAllBtn");
    this.filterDropdown = document.getElementById("filterDropdown");
    this.currentFilterSpan = document.getElementById("currentFilter");
    this.taskCount = document.getElementById("taskCount");
  }

  attachEventListeners() {
    // Form submission
    this.taskForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.editingTaskId) {
        this.updateTask();
      } else {
        this.addTask();
      }
    });

    // Delete all button
    this.deleteAllBtn.addEventListener("click", () => this.deleteAllTasks());

    // Filter dropdown
    this.filterDropdown.addEventListener("click", () => this.toggleDropdown());

    // Filter options
    document.querySelectorAll(".dropdown-content a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.setFilter(e.target.dataset.filter, e.target.textContent);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown")) {
        this.closeDropdown();
      }
    });
  }

  setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    this.dateInput.value = today;
  }

  addTask() {
    const taskText = this.taskInput.value.trim();
    const taskDate = this.dateInput.value;

    if (taskText && taskDate) {
      const newTask = {
        id: Date.now(),
        text: taskText,
        date: taskDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      this.tasks.unshift(newTask);
      this.saveTasks();
      this.renderTasks();
      this.updateCounter();
      this.resetForm();
    }
  }

  updateTask() {
    const taskText = this.taskInput.value.trim();
    const taskDate = this.dateInput.value;

    if (taskText && taskDate) {
      const taskIndex = this.tasks.findIndex(
        (task) => task.id === this.editingTaskId
      );
      if (taskIndex !== -1) {
        this.tasks[taskIndex].text = taskText;
        this.tasks[taskIndex].date = taskDate;
        this.saveTasks();
        this.renderTasks();
        this.updateCounter();
        this.cancelEdit();
      }
    }
  }

  editTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      this.taskInput.value = task.text;
      this.dateInput.value = task.date;
      this.editingTaskId = id;

      // Update form button
      const submitBtn = this.taskForm.querySelector(".btn-primary");
      submitBtn.textContent = "💾 Update Tugas";
      submitBtn.style.background =
        "linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)";

      // Add cancel button
      if (!document.getElementById("cancelEditBtn")) {
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.id = "cancelEditBtn";
        cancelBtn.className = "btn btn-danger";
        cancelBtn.textContent = "❌ Batal";
        cancelBtn.addEventListener("click", () => this.cancelEdit());

        const btnGroup = this.taskForm.querySelector(".btn-group");
        btnGroup.insertBefore(cancelBtn, this.deleteAllBtn);
      }

      this.taskInput.focus();
    }
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.resetForm();

    // Reset form button
    const submitBtn = this.taskForm.querySelector(".btn-primary");
    submitBtn.textContent = "✨ Tambah Tugas";
    submitBtn.style.background =
      "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)";

    // Remove cancel button
    const cancelBtn = document.getElementById("cancelEditBtn");
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }

  deleteTask(id) {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      this.tasks = this.tasks.filter((task) => task.id !== id);
      this.saveTasks();
      this.renderTasks();
      this.updateCounter();
    }
  }

  deleteAllTasks() {
    if (this.tasks.length === 0) {
      alert("Tidak ada tugas untuk dihapus!");
      return;
    }

    if (confirm("Apakah Anda yakin ingin menghapus SEMUA tugas?")) {
      this.tasks = [];
      this.saveTasks();
      this.renderTasks();
      this.updateCounter();
      this.cancelEdit();
    }
  }

  toggleTask(id) {
    const task = this.tasks.find((task) => task.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.renderTasks();
      this.updateCounter();
    }
  }

  toggleDropdown() {
    document.querySelector(".dropdown").classList.toggle("show");
  }

  closeDropdown() {
    document.querySelector(".dropdown").classList.remove("show");
  }

  setFilter(filter, text) {
    this.currentFilter = filter;
    this.currentFilterSpan.textContent = text.replace(/[📋⏳✅] /, "");

    // Update active state
    document.querySelectorAll(".dropdown-content a").forEach((link) => {
      link.classList.remove("active");
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active");

    this.closeDropdown();
    this.renderTasks();
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "active":
        return this.tasks.filter((task) => !task.completed);
      case "completed":
        return this.tasks.filter((task) => task.completed);
      default:
        return this.tasks;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "🎯 Hari ini";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "⏭️ Besok";
    } else {
      return `📅 ${date.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      let emptyMessage = "";
      switch (this.currentFilter) {
        case "active":
          emptyMessage =
            this.tasks.length === 0
              ? "<h3>🌟 Belum ada tugas</h3><p>Tambahkan tugas pertama Anda!</p>"
              : "<h3>🎉 Semua tugas selesai!</h3><p>Anda telah menyelesaikan semua tugas. Hebat!</p>";
          break;
        case "completed":
          emptyMessage =
            "<h3>📋 Belum ada tugas selesai</h3><p>Selesaikan beberapa tugas untuk melihatnya di sini.</p>";
          break;
        default:
          emptyMessage =
            "<h3>🌟 Belum ada tugas</h3><p>Tambahkan tugas pertama Anda untuk memulai!<br>Gunakan form di atas untuk menambah tugas baru.</p>";
      }

      this.tasksContainer.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
      return;
    }

    const tasksHTML = filteredTasks
      .map(
        (task) => `
                    <div class="task-item ${task.completed ? "completed" : ""}">
                        <div class="task-content">
                            <input type="checkbox" 
                                   class="task-checkbox" 
                                   ${task.completed ? "checked" : ""} 
                                   onchange="todoApp.toggleTask(${task.id})">
                            <div class="task-details">
                                <div class="task-text ${
                                  task.completed ? "completed" : ""
                                }">${task.text}</div>
                                <div class="task-date">${this.formatDate(
                                  task.date
                                )}</div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="btn-small btn-edit" onclick="todoApp.editTask(${
                              task.id
                            })">
                                ✏️ Edit
                            </button>
                            <button class="btn-small btn-delete" onclick="todoApp.deleteTask(${
                              task.id
                            })">
                                🗑️ Hapus
                            </button>
                        </div>
                    </div>
                `
      )
      .join("");

    this.tasksContainer.innerHTML = tasksHTML;
  }

  updateCounter() {
    const total = this.tasks.length;
    const active = this.tasks.filter((task) => !task.completed).length;
    const completed = this.tasks.filter((task) => task.completed).length;

    let counterText = "";
    switch (this.currentFilter) {
      case "active":
        counterText = `${active} tugas aktif`;
        break;
      case "completed":
        counterText = `${completed} tugas selesai`;
        break;
      default:
        counterText = `${total} total (${active} aktif, ${completed} selesai)`;
    }

    this.taskCount.textContent = counterText;
  }

  resetForm() {
    this.taskInput.value = "";
    this.setDefaultDate();
    this.taskInput.focus();
  }

  saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(this.tasks));
  }
}

// Initialize the app
let todoApp;
document.addEventListener("DOMContentLoaded", () => {
  todoApp = new TodoApp();
});
