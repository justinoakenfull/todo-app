class TodoDragDrop {
    constructor() {
        this.draggedElement = null;
        this.draggedIndex = null;
        this.placeholder = null;
        this.isDragging = false;
        this.touchStartY = 0;
        this.touchCurrentY = 0;
        this.scrollContainer = null;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDragAndDrop());
        } else {
            this.setupDragAndDrop();
        }
    }

    setupDragAndDrop() {
        this.scrollContainer = document.querySelector('.todo-list') || document.body;
        this.createPlaceholder();
        this.attachEventListeners();
    }

    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'todo-placeholder';
        this.placeholder.innerHTML = '<div class="placeholder-content">Drop here</div>';

        const style = document.createElement('style');
        style.textContent = `
      .todo-placeholder {
        background-color: var(--very-dark-desaturated-blue);
        border: 2px dashed var(--dark-grayish-blue-dark);
        border-radius: 5px;
        padding: 20px 24px;
        margin: 2px 0;
        transition: all 0.2s ease;
        opacity: 0.7;
      }
      
      .light-theme .todo-placeholder {
        background-color: var(--very-light-grayish-blue);
        border-color: var(--light-grayish-blue);
      }
      
      .placeholder-content {
        text-align: center;
        color: var(--dark-grayish-blue-dark);
        font-size: 14px;
        font-style: italic;
      }
      
      .light-theme .placeholder-content {
        color: var(--dark-grayish-blue);
      }
      
      .todo-item.dragging {
        opacity: 0.5;
        transform: rotate(5deg);
        z-index: 1000;
        pointer-events: none;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }
      
      .todo-item.drag-over {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      .todo-item {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        cursor: grab;
      }
      
      .todo-item:active {
        cursor: grabbing;
      }
      
      .todo-item.dragging {
        cursor: grabbing;
      }
      
      .drag-handle {
        cursor: grab;
        padding: 4px;
        margin-right: 8px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .todo-item:hover .drag-handle {
        opacity: 0.6;
      }
      
      .drag-handle:hover {
        opacity: 1 !important;
      }
      
      .drag-handle::before {
        content: "⋮⋮";
        color: var(--dark-grayish-blue-dark);
        font-size: 16px;
        line-height: 1;
        letter-spacing: -2px;
      }
      
      .light-theme .drag-handle::before {
        color: var(--dark-grayish-blue);
      }
    `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        document.addEventListener('todosUpdated', () => {
            this.attachDragHandlers();
        });

        this.attachDragHandlers();
    }

    attachDragHandlers() {
        const todoItems = document.querySelectorAll('.todo-item');

        todoItems.forEach((item, index) => {
            this.removeDragHandlers(item);

            this.addDragHandle(item);

            item.draggable = true;
            item.dataset.index = index;

            item.addEventListener('dragstart', this.handleDragStart.bind(this));
            item.addEventListener('dragend', this.handleDragEnd.bind(this));
            item.addEventListener('dragover', this.handleDragOver.bind(this));
            item.addEventListener('dragenter', this.handleDragEnter.bind(this));
            item.addEventListener('dragleave', this.handleDragLeave.bind(this));
            item.addEventListener('drop', this.handleDrop.bind(this));

            item.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            item.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            item.addEventListener('touchend', this.handleTouchEnd.bind(this));
        });
    }

    addDragHandle(item) {
        if (item.querySelector('.drag-handle')) return;

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.setAttribute('aria-label', 'Drag to reorder');

        const checkbox = item.querySelector('.unchecked-icon, .checked-icon');
        if (checkbox) {
            checkbox.insertAdjacentElement('afterend', dragHandle);
        } else {
            item.insertBefore(dragHandle, item.firstChild);
        }
    }

    removeDragHandlers(item) {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
    }

    handleDragStart(e) {
        this.draggedElement = e.target.closest('.todo-item');
        this.draggedIndex = parseInt(this.draggedElement.dataset.index);
        this.isDragging = true;

        this.draggedElement.classList.add('dragging');

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.draggedElement.outerHTML);

        this.createDragImage(e);

        this.dispatchDragEvent('dragStarted', { index: this.draggedIndex });
    }

    handleDragEnd(e) {
        this.cleanupDrag();
    }

    handleDragOver(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const targetItem = e.target.closest('.todo-item');
        if (targetItem && targetItem !== this.draggedElement) {
            this.showPlaceholder(targetItem, e.clientY);
        }
    }

    handleDragEnter(e) {
        if (!this.isDragging) return;

        const targetItem = e.target.closest('.todo-item');
        if (targetItem && targetItem !== this.draggedElement) {
            targetItem.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const targetItem = e.target.closest('.todo-item');
        if (targetItem) {
            targetItem.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        if (!this.isDragging) return;

        e.preventDefault();

        const targetItem = e.target.closest('.todo-item');
        if (targetItem && targetItem !== this.draggedElement) {
            const targetIndex = parseInt(targetItem.dataset.index);
            this.reorderTodos(this.draggedIndex, targetIndex);
        }

        this.cleanupDrag();
    }

    handleTouchStart(e) {
        const target = e.target;
        if (target.closest('.delete-btn') || target.closest('.unchecked-icon') || target.closest('.checked-icon')) {
            return;
        }

        this.touchStartY = e.touches[0].clientY;
        this.draggedElement = e.target.closest('.todo-item');
        this.draggedIndex = parseInt(this.draggedElement.dataset.index);

        this.touchStartTimeout = setTimeout(() => {
            this.startTouchDrag(e);
        }, 150);
    }

    startTouchDrag(e) {
        this.isDragging = true;
        this.draggedElement.classList.add('dragging');

        document.body.style.overflow = 'hidden';

        this.dispatchDragEvent('dragStarted', { index: this.draggedIndex });
    }

    handleTouchMove(e) {
        if (this.touchStartTimeout) {
            clearTimeout(this.touchStartTimeout);
            this.touchStartTimeout = null;
        }

        if (!this.isDragging) {
            const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
            if (deltaY > 10) {
                this.startTouchDrag(e);
            }
            return;
        }

        e.preventDefault();

        this.touchCurrentY = e.touches[0].clientY;

        const elementBelow = document.elementFromPoint(
            e.touches[0].clientX,
            e.touches[0].clientY
        );

        const targetItem = elementBelow?.closest('.todo-item');
        if (targetItem && targetItem !== this.draggedElement) {
            this.showPlaceholder(targetItem, this.touchCurrentY);
        }
    }

    handleTouchEnd(e) {
        if (this.touchStartTimeout) {
            clearTimeout(this.touchStartTimeout);
            this.touchStartTimeout = null;
        }

        if (!this.isDragging) return;

        const elementBelow = document.elementFromPoint(
            e.changedTouches[0].clientX,
            e.changedTouches[0].clientY
        );

        const targetItem = elementBelow?.closest('.todo-item');
        if (targetItem && targetItem !== this.draggedElement) {
            const targetIndex = parseInt(targetItem.dataset.index);
            this.reorderTodos(this.draggedIndex, targetIndex);
        }

        this.cleanupDrag();

        document.body.style.overflow = '';
    }

    showPlaceholder(targetItem, yPosition) {
        const rect = targetItem.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }

        if (yPosition < midpoint) {
            targetItem.parentNode.insertBefore(this.placeholder, targetItem);
        } else {
            targetItem.parentNode.insertBefore(this.placeholder, targetItem.nextSibling);
        }
    }

    reorderTodos(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;

        if (window.todos && Array.isArray(window.todos)) {
            const item = window.todos.splice(fromIndex, 1)[0];
            window.todos.splice(toIndex, 0, item);

            if (typeof window.renderTodos === 'function') {
                window.renderTodos();
            }

            this.saveTodosToStorage();

            this.dispatchDragEvent('todosReordered', {
                fromIndex,
                toIndex,
                item
            });
        }
    }

    saveTodosToStorage() {
        try {
            if (window.todos) {
                localStorage.setItem('todos', JSON.stringify(window.todos));
            }
        } catch (error) {
            console.warn('Could not save todos to localStorage:', error);
        }
    }

    cleanupDrag() {
        this.isDragging = false;

        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }

        if (this.placeholder && this.placeholder.parentNode) {
            this.placeholder.parentNode.removeChild(this.placeholder);
        }

        document.querySelectorAll('.drag-over').forEach(item => {
            item.classList.remove('drag-over');
        });

        this.draggedElement = null;
        this.draggedIndex = null;

        document.body.style.overflow = '';

        this.dispatchDragEvent('dragEnded');
    }

    createDragImage(e) {
        const dragImage = this.draggedElement.cloneNode(true);
        dragImage.style.transform = 'rotate(5deg)';
        dragImage.style.opacity = '0.8';

        document.body.appendChild(dragImage);

        e.dataTransfer.setDragImage(dragImage, e.offsetX, e.offsetY);

        setTimeout(() => {
            if (dragImage.parentNode) {
                dragImage.parentNode.removeChild(dragImage);
            }
        }, 0);
    }

    dispatchDragEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    enable() {
        this.attachDragHandlers();
    }

    disable() {
        const todoItems = document.querySelectorAll('.todo-item');
        todoItems.forEach(item => {
            item.draggable = false;
            this.removeDragHandlers(item);
        });
    }

    updateHandlers() {
        this.attachDragHandlers();
    }
}

window.todoDragDrop = new TodoDragDrop();

window.TodoDragDropUtils = {
    enable: () => window.todoDragDrop?.enable(),
    disable: () => window.todoDragDrop?.disable(),
    updateHandlers: () => window.todoDragDrop?.updateHandlers(),

    onDragStart: (callback) => {
        document.addEventListener('dragStarted', (e) => callback(e.detail));
    },

    onDragEnd: (callback) => {
        document.addEventListener('dragEnded', (e) => callback(e.detail));
    },

    onReorder: (callback) => {
        document.addEventListener('todosReordered', (e) => callback(e.detail));
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const originalRenderTodos = window.renderTodos;

    if (originalRenderTodos) {
        window.renderTodos = function () {
            originalRenderTodos.apply(this, arguments);

            setTimeout(() => {
                window.todoDragDrop?.updateHandlers();

                document.dispatchEvent(new CustomEvent('todosUpdated'));
            }, 0);
        };
    }
});

console.log('Todo Drag & Drop initialized');
console.log('Touch and desktop drag support enabled');