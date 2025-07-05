// Simple and reliable drag and drop implementation
class SimpleDragDrop {
    constructor() {
        this.draggedElement = null;
        this.draggedIndex = null;
        this.placeholder = null;
        this.isDragging = false;

        this.init();
    }

    init() {
        this.createStyles();

        // Override the global renderTodos function to add drag handlers
        const originalRenderTodos = window.renderTodos;
        if (originalRenderTodos) {
            window.renderTodos = () => {
                originalRenderTodos();
                setTimeout(() => this.attachDragHandlers(), 10);
            };
        }

        // If renderTodos already exists, attach handlers now
        if (window.renderTodos) {
            setTimeout(() => this.attachDragHandlers(), 100);
        }
    }

    createStyles() {
        if (document.getElementById('drag-drop-styles')) return;

        const style = document.createElement('style');
        style.id = 'drag-drop-styles';
        style.textContent = `
            .todo-item {
                cursor: grab;
                transition: all 0.2s ease;
            }
            
            .todo-item:active {
                cursor: grabbing;
            }
            
            .todo-item.dragging {
                opacity: 0.5;
                transform: rotate(2deg);
                cursor: grabbing;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }
            
            .todo-item.drag-over {
                border-top: 3px solid var(--bright-blue);
                background-color: rgba(255, 255, 255, 0.05);
            }
            
            .light-theme .todo-item.drag-over {
                background-color: rgba(0, 0, 0, 0.02);
            }
            
            .drag-placeholder {
                height: 4px;
                background: var(--bright-blue);
                border-radius: 2px;
                margin: 4px 24px;
                opacity: 0.8;
                animation: pulse 1s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 0.4; }
            }
        `;
        document.head.appendChild(style);
    }

    attachDragHandlers() {
        const todoItems = document.querySelectorAll('.todo-item');

        todoItems.forEach((item, index) => {
            // Remove any existing drag attributes to start fresh
            item.draggable = false;

            // Clone the item to remove all existing event listeners
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            // Set up the new item
            newItem.draggable = true;
            newItem.dataset.originalIndex = index;

            // Add drag event listeners
            newItem.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
            newItem.addEventListener('dragend', (e) => this.handleDragEnd(e));
            newItem.addEventListener('dragover', (e) => this.handleDragOver(e));
            newItem.addEventListener('drop', (e) => this.handleDrop(e, index));
            newItem.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            newItem.addEventListener('dragleave', (e) => this.handleDragLeave(e));

            // Re-attach click handlers for buttons (since we cloned the element)
            this.reattachButtonHandlers(newItem);
        });

        console.log(`Attached drag handlers to ${todoItems.length} items`);
    }

    reattachButtonHandlers(item) {
        const todoId = parseInt(item.dataset.id);

        // Toggle button
        const toggleBtn = item.querySelector('.unchecked-icon, .checked-icon');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                window.toggleTodo(todoId);
            });
        }

        // Delete button
        const deleteBtn = item.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                window.deleteTodo(todoId);
            });
        }
    }

    handleDragStart(e, index) {
        this.draggedElement = e.target.closest('.todo-item');
        this.draggedIndex = index;
        this.isDragging = true;

        this.draggedElement.classList.add('dragging');

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', ''); // Required for Firefox

        console.log('Drag started from index:', index);
    }

    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }

        // Clean up all drag states
        document.querySelectorAll('.todo-item').forEach(item => {
            item.classList.remove('drag-over');
        });

        this.removePlaceholder();

        this.draggedElement = null;
        this.draggedIndex = null;
        this.isDragging = false;

        console.log('Drag ended');
    }

    handleDragOver(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const item = e.target.closest('.todo-item');
        if (item && item !== this.draggedElement) {
            this.showPlaceholder(item, e.clientY);
        }
    }

    handleDragEnter(e) {
        if (!this.isDragging) return;

        const item = e.target.closest('.todo-item');
        if (item && item !== this.draggedElement) {
            item.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const item = e.target.closest('.todo-item');
        if (item) {
            item.classList.remove('drag-over');
        }
    }

    handleDrop(e, targetIndex) {
        if (!this.isDragging) return;

        e.preventDefault();

        if (targetIndex !== this.draggedIndex) {
            this.reorderTodos(this.draggedIndex, targetIndex);
        }

        console.log(`Dropped at index ${targetIndex} from ${this.draggedIndex}`);
    }

    showPlaceholder(targetItem, clientY) {
        this.removePlaceholder();

        if (!this.placeholder) {
            this.placeholder = document.createElement('div');
            this.placeholder.className = 'drag-placeholder';
        }

        const rect = targetItem.getBoundingClientRect();
        const middle = rect.top + rect.height / 2;

        if (clientY < middle) {
            targetItem.parentNode.insertBefore(this.placeholder, targetItem);
        } else {
            targetItem.parentNode.insertBefore(this.placeholder, targetItem.nextSibling);
        }
    }

    removePlaceholder() {
        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }
    }

    reorderTodos(fromIndex, toIndex) {
        if (!window.todos || fromIndex === toIndex) return;

        console.log(`Reordering: moving item from ${fromIndex} to ${toIndex}`);

        // Get the actual todos array (might be filtered)
        let workingTodos = [...window.todos];

        // Handle filtering - we need to map filtered indices back to original indices
        if (window.currentFilter && window.currentFilter !== 'all') {
            if (window.currentFilter === 'active') {
                workingTodos = window.todos.filter(t => !t.completed);
            } else if (window.currentFilter === 'completed') {
                workingTodos = window.todos.filter(t => t.completed);
            }

            // Find the actual indices in the main todos array
            const fromTodo = workingTodos[fromIndex];
            const toTodo = workingTodos[toIndex];

            const actualFromIndex = window.todos.findIndex(t => t.id === fromTodo.id);
            const actualToIndex = window.todos.findIndex(t => t.id === toTodo.id);

            // Reorder in the main array
            const [movedItem] = window.todos.splice(actualFromIndex, 1);
            window.todos.splice(actualToIndex, 0, movedItem);
        } else {
            // Simple reorder for 'all' filter
            const [movedItem] = window.todos.splice(fromIndex, 1);
            window.todos.splice(toIndex, 0, movedItem);
        }

        // Save and re-render
        if (window.saveTodos) {
            window.saveTodos();
        }

        if (window.renderTodos) {
            window.renderTodos();
        }

        console.log('Todos reordered successfully');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.simpleDragDrop = new SimpleDragDrop();
    console.log('Simple Drag & Drop initialized');
});

// Also initialize immediately if DOM is already ready
if (document.readyState !== 'loading') {
    window.simpleDragDrop = new SimpleDragDrop();
    console.log('Simple Drag & Drop initialized (immediate)');
}