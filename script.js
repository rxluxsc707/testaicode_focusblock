const timerDisplay = document.querySelector("#timer-display");
const timerRing = document.querySelector("#timer-ring");
const timerCaption = document.querySelector("#timer-caption");
const timerHint = document.querySelector("#timer-hint");
const toggleButton = document.querySelector("#toggle-timer");
const toggleLabel = document.querySelector("#toggle-label");
const durationButtons = document.querySelectorAll(".duration-button");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const addTaskForm = document.querySelector("#add-task-form");
const newTaskInput = document.querySelector("#new-task");

let durationMinutes = 25;
let remainingSeconds = durationMinutes * 60;
let timerInterval = null;
let completedSessions = 0;
let focusedMinutes = 0;
let tasks = [
  { text: "Clear the desk", done: false },
  { text: "Draft the opening paragraph", done: false },
  { text: "Reply to Maya", done: false }
];

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(remainingSeconds);
  const elapsed = durationMinutes * 60 - remainingSeconds;
  const progress = Math.max(0, Math.min(100, (elapsed / (durationMinutes * 60)) * 100));
  timerRing.style.setProperty("--progress", `${progress}%`);
  timerRing.setAttribute("aria-label", `${Math.ceil(remainingSeconds / 60)} minutes remaining`);
}

function setTimerRunning(isRunning) {
  toggleButton.classList.toggle("is-running", isRunning);
  toggleLabel.textContent = isRunning ? "Pause focus" : "Begin focus";
  timerCaption.textContent = isRunning ? "YOU'RE IN IT" : "A FRESH START";
  timerHint.textContent = isRunning ? "Stay with this moment." : "One thing at a time. You've got this.";
}

function stopTimer() {
  window.clearInterval(timerInterval);
  timerInterval = null;
  setTimerRunning(false);
}

function finishSession() {
  stopTimer();
  remainingSeconds = 0;
  renderTimer();
  timerCaption.textContent = "WELL DONE";
  timerHint.textContent = "You showed up. Take a breath before the next thing.";
  completedSessions += 1;
  focusedMinutes += durationMinutes;
  document.querySelector("#session-count").textContent = completedSessions.toString().padStart(2, "0");
  document.querySelector("#minutes-count").textContent = focusedMinutes.toString().padStart(2, "0");
}

toggleButton.addEventListener("click", () => {
  if (timerInterval) {
    stopTimer();
    return;
  }
  if (remainingSeconds === 0) remainingSeconds = durationMinutes * 60;
  setTimerRunning(true);
  timerInterval = window.setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();
    if (remainingSeconds <= 0) finishSession();
  }, 1000);
});

document.querySelector("#reset-timer").addEventListener("click", () => {
  stopTimer();
  remainingSeconds = durationMinutes * 60;
  renderTimer();
});

durationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    stopTimer();
    durationMinutes = Number(button.dataset.duration);
    remainingSeconds = durationMinutes * 60;
    durationButtons.forEach((option) => {
      const isSelected = option === button;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });
    renderTimer();
  });
});

function renderTasks() {
  taskList.replaceChildren();
  tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.id = `task-${index}`;
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Mark ${task.text} ${task.done ? "incomplete" : "complete"}`);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      updateTaskCount();
    });

    const checkboxVisual = document.createElement("label");
    checkboxVisual.className = "task-checkbox";
    checkboxVisual.htmlFor = checkbox.id;
    checkboxVisual.setAttribute("aria-hidden", "true");
    checkboxVisual.textContent = "✓";

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-task";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Remove ${task.text}`);
    deleteButton.title = "Remove task";
    deleteButton.textContent = "×";
    deleteButton.addEventListener("click", () => {
      tasks.splice(index, 1);
      renderTasks();
    });

    item.append(checkbox, checkboxVisual, text, deleteButton);
    taskList.append(item);
  });
  updateTaskCount();
}

function updateTaskCount() {
  const doneCount = tasks.filter((task) => task.done).length;
  taskCount.textContent = `${doneCount} / ${tasks.length}`;
}

addTaskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = newTaskInput.value.trim();
  if (!text) {
    newTaskInput.focus();
    return;
  }
  tasks.push({ text, done: false });
  newTaskInput.value = "";
  renderTasks();
  newTaskInput.focus();
});

const dateLabel = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric"
}).format(new Date());
document.querySelector("#today-date").textContent = dateLabel.toUpperCase() + "  /  A QUIETER KIND OF PRODUCTIVITY";

renderTimer();
renderTasks();