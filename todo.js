// Global variables
let todos = [];
let currentFilter = 'all';
let todoId = 0;

// Add todo function
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
    saveTodos();
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTodo();
    }
}

// Toggle todo completion
function toggleTodo(id) {
    console.log(`Toggling todo with id: ${id}`);
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
        updateItemsCount();
        saveTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
    updateItemsCount();
    saveTodos();
}

// Filter todos
function filterTodos(filter) {
    currentFilter = filter;

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Update both desktop and mobile filter buttons
    document.querySelectorAll(`.filter-btn`).forEach(btn => {
        if (btn.textContent.toLowerCase() === filter.toLowerCase()) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// Clear completed todos
function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    renderTodos();
    updateItemsCount();
    saveTodos();
}

// Save todos to localStorage
function saveTodos() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('todoId', todoId.toString());
    } catch (error) {
        console.warn('Could not save todos to localStorage:', error);
    }
}

// Load todos from localStorage
function loadTodos() {
    try {
        const savedTodos = localStorage.getItem('todos');
        const savedTodoId = localStorage.getItem('todoId');

        if (savedTodos) {
            todos = JSON.parse(savedTodos);
        }

        if (savedTodoId) {
            todoId = parseInt(savedTodoId, 10);
        }
    } catch (error) {
        console.warn('Could not load todos from localStorage:', error);
        todos = [];
        todoId = 0;
    }
}

// Render todos
function renderTodos() {
    const todoList = document.getElementById('todoList');
    let filteredTodos = todos;

    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    todoList.innerHTML = filteredTodos.map((todo, index) => `
        <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}" data-index="${index}" draggable="true">
          <div class="drag-handle" title="Drag to reorder"></div>
          <button class="${todo.completed ? 'checked-icon' : 'unchecked-icon'}" >
            ${todo.completed ? '<img src="./images/icon-check.svg" alt="Check Icon" class="check-icon">' : ''}
          </button>
          <span class="todo-text">${todo.text}</span>
          <button class="delete-btn" onclick="deleteTodo(${todo.id})">
            <img src="./images/icon-cross.svg" alt="Delete" class="delete-icon">
          </button>
        </div>
      `).join('');

    // Attach drag and drop handlers after rendering
    setTimeout(() => {
        attachDragHandlers();
        // Notify any listening systems that todos were updated
        document.dispatchEvent(new CustomEvent('todosUpdated'));
    }, 0);
}

// Attach drag and drop handlers
function attachDragHandlers() {
    const todoItems = document.querySelectorAll('.todo-item');

    todoItems.forEach((item, index) => {
        // Remove existing event listeners by cloning
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);

        // Update reference
        const currentItem = newItem;
        currentItem.dataset.index = index;

        // Add drag event listeners
        currentItem.addEventListener('dragstart', handleDragStart);
        currentItem.addEventListener('dragend', handleDragEnd);
        currentItem.addEventListener('dragover', handleDragOver);
        currentItem.addEventListener('drop', handleDrop);

        // Re-attach click handlers for buttons
        const toggleBtn = currentItem.querySelector('.unchecked-icon, .checked-icon');
        const deleteBtn = currentItem.querySelector('.delete-btn');

        if (toggleBtn) {
            const todoId = parseInt(currentItem.dataset.id);
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTodo(todoId);
            });
        }

        if (deleteBtn) {
            const todoId = parseInt(currentItem.dataset.id);
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTodo(todoId);
            });
        }
    });
}

// Drag and drop event handlers
let draggedElement = null;
let draggedIndex = null;

function handleDragStart(e) {
    draggedElement = e.target.closest('.todo-item');
    draggedIndex = parseInt(draggedElement.dataset.index);

    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.outerHTML);

    console.log('Drag started:', draggedIndex);
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }

    // Remove all drag-over classes
    document.querySelectorAll('.drag-over').forEach(item => {
        item.classList.remove('drag-over');
    });

    draggedElement = null;
    draggedIndex = null;

    console.log('Drag ended');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const targetItem = e.target.closest('.todo-item');
    if (targetItem && targetItem !== draggedElement) {
        targetItem.classList.add('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();

    const targetItem = e.target.closest('.todo-item');
    if (targetItem && targetItem !== draggedElement && draggedElement) {
        const targetIndex = parseInt(targetItem.dataset.index);

        console.log(`Reordering from ${draggedIndex} to ${targetIndex}`);

        // Reorder the todos array
        const item = todos.splice(draggedIndex, 1)[0];
        todos.splice(targetIndex, 0, item);

        // Re-render
        renderTodos();
        updateItemsCount();
        saveTodos();
    }

    // Remove drag-over class
    document.querySelectorAll('.drag-over').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// Update items count
function updateItemsCount() {
    const activeCount = todos.filter(t => !t.completed).length;
    document.getElementById('itemsCount').textContent = activeCount;
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    loadTodos();
    renderTodos();
    updateItemsCount();
});