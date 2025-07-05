let todos = [];
let currentFilter = 'all';
let todoId = 0;

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text === '') return;

    const todo = {
        id: todoId++,
        text: text,
        completed: false
    };

    todos.push(todo);
    input.value = '';
    renderTodos();
    updateItemsCount();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
        updateItemsCount();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
    updateItemsCount();
}

function filterTodos(filter) {
    currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderTodos();
}

function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    renderTodos();
    updateItemsCount();
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <button class="${todo.completed ? 'checked-icon' : 'unchecked-icon'}" onclick="toggleTodo(${todo.id})">
            ${todo.completed ? '<img src="./images/icon-check.svg" alt="Check Icon" class="check-icon">' : ''}
          </button>
          <span class="todo-text">${todo.text}</span>
          <button class="delete-btn" onclick="deleteTodo(${todo.id})">
            <img src="./images/icon-cross.svg" alt="Delete" class="delete-icon">
          </button>
        </div>
      `).join('');
}

function updateItemsCount() {
    const activeCount = todos.filter(t => !t.completed).length;
    document.getElementById('itemsCount').textContent = activeCount;
}

document.addEventListener('DOMContentLoaded', function () {
    renderTodos();
    updateItemsCount();
});