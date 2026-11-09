const STORAGE_KEY = "my-tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyMessage = document.querySelector("#empty-message");
const storageMessage = document.querySelector("#storage-message");

let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (
      !Array.isArray(parsedTasks) ||
      !parsedTasks.every(
        (task) =>
          task &&
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean",
      )
    ) {
      throw new Error("Saved tasks have an unexpected format.");
    }

    return parsedTasks;
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    storageMessage.textContent =
      "Saved tasks could not be loaded. You can still add tasks for this visit.";
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    storageMessage.textContent = "";
    return true;
  } catch (error) {
    console.error("Could not save tasks:", error);
    storageMessage.textContent =
      "Tasks could not be saved. Check your browser's storage settings.";
    return false;
  }
}

function renderTasks() {
  taskList.replaceChildren();

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.classList.toggle("is-completed", task.completed);

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      task.completed
        ? `Mark "${task.text}" as incomplete`
        : `Mark "${task.text}" as complete`,
    );
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  }

  const remainingTasks = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remainingTasks} ${
    remainingTasks === 1 ? "task" : "tasks"
  } left`;
  emptyMessage.hidden = tasks.length > 0;
}

function addTask(text) {
  tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  );

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  addTask(text);
  taskForm.reset();
  taskInput.focus();
});

renderTasks();
