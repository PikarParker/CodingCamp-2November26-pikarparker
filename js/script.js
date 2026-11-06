const STORAGE_KEYS = {
  name: 'todoLifeDashboard.name',
  tasks: 'todoLifeDashboard.tasks',
  sort: 'todoLifeDashboard.sort',
  links: 'todoLifeDashboard.links',
  theme: 'todoLifeDashboard.theme'
};

const DEFAULT_NAME = 'Guest';
const DEFAULT_SORT = 'default';
const DEFAULT_THEME = 'light';
const FOCUS_MINUTES = 25;
const FOCUS_SECONDS = FOCUS_MINUTES * 60;

const state = {
  name: '',
  tasks: [],
  links: [],
  sort: DEFAULT_SORT,
  theme: DEFAULT_THEME,
  storageAvailable: true,
  editTaskId: null,
  timerRemaining: FOCUS_SECONDS,
  timerIntervalId: null,
  timerRunning: false,
  timerHasEnded: false
};

const elements = {
  dateLabel: document.getElementById('dateLabel'),
  greetingText: document.getElementById('greetingText'),
  timeDisplay: document.getElementById('timeDisplay'),
  nameForm: document.getElementById('nameForm'),
  nameInput: document.getElementById('nameInput'),
  taskForm: document.getElementById('taskForm'),
  taskInput: document.getElementById('taskInput'),
  taskValidation: document.getElementById('taskValidation'),
  taskList: document.getElementById('taskList'),
  taskSort: document.getElementById('taskSort'),
  linkForm: document.getElementById('linkForm'),
  linkLabelInput: document.getElementById('linkLabelInput'),
  linkUrlInput: document.getElementById('linkUrlInput'),
  linkValidation: document.getElementById('linkValidation'),
  quickLinks: document.getElementById('quickLinks'),
  themeToggle: document.getElementById('themeToggle'),
  timerDisplay: document.getElementById('timerDisplay'),
  startTimerBtn: document.getElementById('startTimerBtn'),
  stopTimerBtn: document.getElementById('stopTimerBtn'),
  resetTimerBtn: document.getElementById('resetTimerBtn'),
  timerNotification: document.getElementById('timerNotification'),
  storageNotice: document.getElementById('storageNotice'),
  dismissNotice: document.getElementById('dismissNotice')
};

function isStorageBlocked() {
  try {
    const probe = '__dashboard_probe__';
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return false;
  } catch (error) {
    return true;
  }
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    state.storageAvailable = false;
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    state.storageAvailable = false;
    return false;
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    state.storageAvailable = false;
  }
}

function hideMessage(element) {
  element.hidden = true;
  element.textContent = '';
}

function showMessage(element, message) {
  element.textContent = message;
  element.hidden = false;
}

function getGreetingByHour(hour) {
  if (hour >= 5 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  if (hour >= 18 && hour <= 20) return 'Good evening';
  return 'Good night';
}

function updateGreeting() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = getGreetingByHour(hour);
  const displayName = state.name && state.name.trim().length > 0 && state.name.length <= 50 ? state.name.trim() : DEFAULT_NAME;
  const greetingText = `${greeting}, ${displayName}`;
  elements.greetingText.textContent = greetingText;

  const timeValue = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  elements.timeDisplay.textContent = timeValue;

  const dateValue = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(now);
  elements.dateLabel.textContent = dateValue;
}

function loadName() {
  const savedName = safeStorageGet(STORAGE_KEYS.name);
  if (!savedName) {
    state.name = '';
    return;
  }

  try {
    const parsed = JSON.parse(savedName);
    if (typeof parsed === 'string' && parsed.length <= 50) {
      state.name = parsed;
      return;
    }
  } catch (error) {
    safeStorageRemove(STORAGE_KEYS.name);
  }

  state.name = '';
}

function saveName() {
  const hasStorage = safeStorageSet(STORAGE_KEYS.name, JSON.stringify(state.name));
  if (!hasStorage && state.storageAvailable === false) {
    showStorageNotice();
  }
}

function loadTasks() {
  const savedTasks = safeStorageGet(STORAGE_KEYS.tasks);
  if (!savedTasks) {
    state.tasks = [];
    return;
  }

  try {
    const parsed = JSON.parse(savedTasks);
    state.tasks = Array.isArray(parsed) ? parsed.filter((task) => task && typeof task.title === 'string') : [];
  } catch (error) {
    state.tasks = [];
    showMessage(elements.taskValidation, 'Saved tasks could not be loaded.');
    safeStorageRemove(STORAGE_KEYS.tasks);
  }
}

function saveTasks() {
  safeStorageSet(STORAGE_KEYS.tasks, JSON.stringify(state.tasks));
}

function getSortedTasks() {
  const tasks = [...state.tasks];

  if (state.sort === 'alphabetical') {
    return tasks.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  }

  if (state.sort === 'completed-last') {
    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return Number(a.completed) - Number(b.completed);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  return tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function renderTasks() {
  const tasks = getSortedTasks();
  elements.taskList.innerHTML = '';

  if (!tasks.length) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'task-item';
    emptyItem.textContent = 'No tasks yet. Add one to get started.';
    elements.taskList.appendChild(emptyItem);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-item';
    item.dataset.taskId = task.id;

    if (state.editTaskId === task.id) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.maxLength = 200;
      editInput.value = task.title;
      editInput.className = 'task-edit-input';
      editInput.setAttribute('aria-label', 'Edit task title');

      const actionWrap = document.createElement('div');
      actionWrap.className = 'task-edit-actions';

      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.textContent = 'Save';
      saveButton.dataset.action = 'save-edit';

      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'ghost';
      cancelButton.textContent = 'Cancel';
      cancelButton.dataset.action = 'cancel-edit';

      actionWrap.append(saveButton, cancelButton);
      item.append(editInput, actionWrap);
      item.querySelector('.task-edit-input').focus();
      item.querySelector('.task-edit-input').select();
    } else {
      const taskMain = document.createElement('div');
      taskMain.className = 'task-main';

      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = task.completed;
      toggle.className = 'task-toggle';
      toggle.setAttribute('aria-label', `Mark ${task.title} complete`);

      const label = document.createElement('span');
      label.className = `task-text${task.completed ? ' completed' : ''}`;
      label.textContent = task.title;

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'edit-btn';
      editButton.textContent = 'Edit';
      editButton.dataset.action = 'edit';

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'delete-btn';
      deleteButton.textContent = 'Delete';
      deleteButton.dataset.action = 'delete';

      taskMain.append(toggle, label);
      actions.append(editButton, deleteButton);
      item.append(taskMain, actions);
    }

    elements.taskList.appendChild(item);
  });
}

function updateSortPreference() {
  const validSort = ['default', 'completed-last', 'alphabetical'].includes(state.sort) ? state.sort : DEFAULT_SORT;
  state.sort = validSort;
  elements.taskSort.value = validSort;
  safeStorageSet(STORAGE_KEYS.sort, validSort);
}

function loadSortPreference() {
  const savedSort = safeStorageGet(STORAGE_KEYS.sort);
  const value = savedSort || DEFAULT_SORT;
  state.sort = ['default', 'completed-last', 'alphabetical'].includes(value) ? value : DEFAULT_SORT;
  elements.taskSort.value = state.sort;
}

function loadLinks() {
  const savedLinks = safeStorageGet(STORAGE_KEYS.links);
  if (!savedLinks) {
    state.links = [];
    return;
  }

  try {
    const parsed = JSON.parse(savedLinks);
    state.links = Array.isArray(parsed) ? parsed.filter((link) => link && typeof link.label === 'string' && typeof link.url === 'string') : [];
  } catch (error) {
    state.links = [];
    safeStorageRemove(STORAGE_KEYS.links);
  }
}

function saveLinks() {
  safeStorageSet(STORAGE_KEYS.links, JSON.stringify(state.links));
}

function renderLinks() {
  elements.quickLinks.innerHTML = '';

  if (!state.links.length) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'task-item';
    emptyItem.textContent = 'No quick links saved yet.';
    elements.quickLinks.appendChild(emptyItem);
    return;
  }

  state.links.forEach((link) => {
    const item = document.createElement('div');
    item.className = 'link-item';

    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.className = 'link-button';
    anchor.textContent = link.label;

    const actions = document.createElement('div');
    actions.className = 'link-actions';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.dataset.linkId = link.id;

    actions.appendChild(deleteButton);
    item.append(anchor, actions);
    elements.quickLinks.appendChild(item);
  });
}

function loadTheme() {
  const savedTheme = safeStorageGet(STORAGE_KEYS.theme);
  const theme = savedTheme === 'dark' ? 'dark' : 'light';
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  elements.themeToggle.textContent = state.theme === 'dark' ? 'Light mode' : 'Dark mode';
}

function saveTheme() {
  safeStorageSet(STORAGE_KEYS.theme, state.theme);
}

function showStorageNotice() {
  elements.storageNotice.classList.remove('hidden');
}

function hideStorageNotice() {
  elements.storageNotice.classList.add('hidden');
}

function resetTimerDisplay() {
  state.timerRemaining = FOCUS_SECONDS;
  renderTimer();
  elements.timerNotification.hidden = true;
}

function renderTimer() {
  const minutes = Math.floor(state.timerRemaining / 60);
  const seconds = state.timerRemaining % 60;
  elements.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
  if (state.timerIntervalId) {
    return;
  }

  state.timerRunning = true;
  elements.startTimerBtn.disabled = true;
  elements.stopTimerBtn.disabled = false;
  elements.timerNotification.hidden = true;

  state.timerIntervalId = setInterval(() => {
    state.timerRemaining -= 1;
    renderTimer();

    if (state.timerRemaining <= 0) {
      state.timerRemaining = 0;
      clearInterval(state.timerIntervalId);
      state.timerIntervalId = null;
      state.timerRunning = false;
      elements.startTimerBtn.disabled = false;
      elements.stopTimerBtn.disabled = true;
      elements.timerNotification.hidden = false;
      renderTimer();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerIntervalId) {
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }

  state.timerRunning = false;
  elements.startTimerBtn.disabled = false;
  elements.stopTimerBtn.disabled = true;
}

function resetTimer() {
  stopTimer();
  state.timerRemaining = FOCUS_SECONDS;
  renderTimer();
  elements.timerNotification.hidden = true;
}

function initializeTimer() {
  renderTimer();
  elements.startTimerBtn.disabled = false;
  elements.stopTimerBtn.disabled = true;
}

function handleNameSubmit(event) {
  event.preventDefault();
  const rawName = elements.nameInput.value.trim();

  if (!rawName) {
    elements.nameInput.value = state.name;
    return;
  }

  if (rawName.length > 50) {
    elements.nameInput.value = state.name;
    return;
  }

  state.name = rawName;
  elements.nameInput.value = state.name;
  saveName();
  updateGreeting();
}

function addTask(event) {
  event.preventDefault();
  const title = elements.taskInput.value.trim();

  if (!title) {
    showMessage(elements.taskValidation, 'Task title cannot be empty.');
    return;
  }

  hideMessage(elements.taskValidation);
  state.tasks.push({
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  renderTasks();
  elements.taskInput.value = '';
}

function toggleTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function startEditTask(taskId) {
  state.editTaskId = taskId;
  renderTasks();
}

function cancelEditTask() {
  state.editTaskId = null;
  renderTasks();
}

function saveEditTask(taskId) {
  const item = elements.taskList.querySelector(`[data-task-id="${taskId}"]`);
  const input = item ? item.querySelector('.task-edit-input') : null;
  const newTitle = input ? input.value.trim() : '';

  if (!newTitle) {
    cancelEditTask();
    return;
  }

  const task = state.tasks.find((entry) => entry.id === taskId);
  if (!task) {
    cancelEditTask();
    return;
  }

  task.title = newTitle;
  state.editTaskId = null;
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function handleTaskListClick(event) {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const taskItem = button.closest('.task-item');
  const taskId = taskItem ? taskItem.dataset.taskId : null;

  if (!taskId) {
    return;
  }

  const action = button.dataset.action;

  if (action === 'edit') {
    startEditTask(taskId);
  }

  if (action === 'delete') {
    deleteTask(taskId);
  }

  if (action === 'cancel-edit') {
    cancelEditTask();
  }

  if (action === 'save-edit') {
    saveEditTask(taskId);
  }
}

function handleTaskListKeydown(event) {
  const input = event.target.closest('.task-edit-input');
  if (!input) {
    return;
  }

  const taskId = input.closest('.task-item')?.dataset.taskId;

  if (event.key === 'Enter') {
    saveEditTask(taskId);
  }

  if (event.key === 'Escape') {
    cancelEditTask();
  }
}

function handleTaskListChange(event) {
  const toggle = event.target.closest('.task-toggle');
  if (!toggle) {
    return;
  }

  const taskItem = toggle.closest('.task-item');
  const taskId = taskItem ? taskItem.dataset.taskId : null;
  if (taskId) {
    toggleTask(taskId);
  }
}

function addQuickLink(event) {
  event.preventDefault();
  const label = elements.linkLabelInput.value.trim();
  const url = elements.linkUrlInput.value.trim();
  const isValidLabel = label.length > 0 && label.length <= 50;
  const isValidUrl = /^https?:\/\//i.test(url);

  if (!isValidLabel || !isValidUrl) {
    const reasons = [];
    if (!isValidLabel) reasons.push('Label must be 1-50 characters.');
    if (!isValidUrl) reasons.push('URL must start with http:// or https://.');
    showMessage(elements.linkValidation, reasons.join(' '));
    return;
  }

  hideMessage(elements.linkValidation);
  state.links.push({
    id: `link-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label,
    url
  });

  saveLinks();
  renderLinks();
  elements.linkForm.reset();
}

function deleteQuickLink(linkId) {
  state.links = state.links.filter((link) => link.id !== linkId);
  saveLinks();
  renderLinks();
}

function handleLinkClick(event) {
  const deleteButton = event.target.closest('.delete-btn');
  if (!deleteButton || !deleteButton.dataset.linkId) {
    return;
  }

  deleteQuickLink(deleteButton.dataset.linkId);
}

function handleThemeToggle() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  elements.themeToggle.textContent = state.theme === 'dark' ? 'Light mode' : 'Dark mode';
  saveTheme();
}

function loadApp() {
  state.storageAvailable = !isStorageBlocked();

  if (!state.storageAvailable) {
    showStorageNotice();
  }

  loadName();
  loadTasks();
  loadSortPreference();
  loadLinks();
  loadTheme();

  if (!safeStorageGet(STORAGE_KEYS.sort)) {
    safeStorageSet(STORAGE_KEYS.sort, DEFAULT_SORT);
  }

  updateGreeting();
  initializeTimer();
  renderTasks();
  renderLinks();

  elements.nameInput.value = state.name;
  elements.taskSort.value = state.sort;
  elements.themeToggle.textContent = state.theme === 'dark' ? 'Light mode' : 'Dark mode';

  setInterval(updateGreeting, 1000);
}

function bindEvents() {
  elements.nameForm.addEventListener('submit', handleNameSubmit);
  elements.taskForm.addEventListener('submit', addTask);
  elements.taskList.addEventListener('click', handleTaskListClick);
  elements.taskList.addEventListener('keydown', handleTaskListKeydown);
  elements.taskList.addEventListener('change', handleTaskListChange);
  elements.taskSort.addEventListener('change', (event) => {
    state.sort = event.target.value;
    updateSortPreference();
    renderTasks();
  });
  elements.linkForm.addEventListener('submit', addQuickLink);
  elements.quickLinks.addEventListener('click', handleLinkClick);
  elements.themeToggle.addEventListener('click', handleThemeToggle);
  elements.startTimerBtn.addEventListener('click', startTimer);
  elements.stopTimerBtn.addEventListener('click', stopTimer);
  elements.resetTimerBtn.addEventListener('click', resetTimer);
  elements.dismissNotice.addEventListener('click', hideStorageNotice);
}

bindEvents();
loadApp();
