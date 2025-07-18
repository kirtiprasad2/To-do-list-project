document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const remainingCount = document.getElementById('remaining-count');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTodoList();
        updateRemainingCount();
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTodo();
        });
        clearCompletedBtn.addEventListener('click', clearCompleted);
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => filterTodos(btn.dataset.filter));
        });
    }
    
    // Add a new todo
    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            const newTodo = {
                id: Date.now(),
                text,
                completed: false
            };
            todos.push(newTodo);
            saveTodos();
            renderTodoList();
            todoInput.value = '';
            updateRemainingCount();
        }
    }
    
    // Render the todo list based on current filter
    function renderTodoList() {
        todoList.innerHTML = '';
        
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });
        
        if (filteredTodos.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = currentFilter === 'all' 
                ? 'No tasks yet. Add one above!' 
                : currentFilter === 'active' 
                    ? 'No active tasks' 
                    : 'No completed tasks';
            todoList.appendChild(emptyMessage);
            return;
        }
        
        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.className = 'todo-item';
            todoItem.dataset.id = todo.id;
            
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            `;
            
            const checkbox = todoItem.querySelector('.todo-checkbox');
            const deleteBtn = todoItem.querySelector('.delete-btn');
            const todoText = todoItem.querySelector('.todo-text');
            
            checkbox.addEventListener('change', () => toggleTodoComplete(todo.id));
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
            todoText.addEventListener('dblclick', () => editTodo(todo.id, todoText));
            
            todoList.appendChild(todoItem);
        });
    }
    
    // Toggle todo completion status
    function toggleTodoComplete(id) {
        todos = todos.map(todo => 
            todo.id === id ? {...todo, completed: !todo.completed} : todo
        );
        saveTodos();
        updateRemainingCount();
        renderTodoList();
    }
    
    // Delete a todo
    function deleteTodo(id) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        updateRemainingCount();
        renderTodoList();
    }
    
    // Edit a todo
    function editTodo(id, todoTextElement) {
        const currentText = todoTextElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        todoTextElement.replaceWith(input);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText) {
                todos = todos.map(todo => 
                    todo.id === id ? {...todo, text: newText} : todo
                );
                saveTodos();
                renderTodoList();
            } else {
                deleteTodo(id);
            }
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveEdit();
        });
    }
    
    // Clear all completed todos
    function clearCompleted() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodoList();
    }
    
    // Filter todos
    function filterTodos(filter) {
        currentFilter = filter;
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        renderTodoList();
    }
    
    // Update the remaining tasks count
    function updateRemainingCount() {
        const count = todos.filter(todo => !todo.completed).length;
        remainingCount.textContent = `${count} ${count === 1 ? 'item' : 'items'} left`;
    }
    
    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    init();
});