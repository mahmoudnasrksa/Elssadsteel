// Tasks Management System

// Add task
function addTask(title, person, priority = 'medium') {
  if (!hasRole('manager')) {
    alert('ليس لديك صلاحية لإضافة مهام');
    return;
  }
  
  const tasks = getData('tasks');
  
  const newTask = {
    id: generateId(),
    title: title,
    person: person,
    priority: priority,
    done: false,
    createdAt: new Date().toISOString(),
    createdBy: getCurrentUser().username
  };
  
  tasks.push(newTask);
  saveData('tasks', tasks);
  
  logActivity('add_task', `إضافة مهمة: ${title}`);
  renderTasks();
  showNotification('تم إضافة المهمة بنجاح', 'success');
}

// Show add task modal
function showAddTaskModal() {
  if (!hasRole('manager')) {
    alert('ليس لديك صلاحية لإضافة مهام');
    return;
  }
  
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = 'إضافة مهمة جديدة';
  
  modalBody.innerHTML = `
    <div class="form-grid">
      <div class="input-group">
        <label>عنوان المهمة</label>
        <input type="text" id="taskTitle" placeholder="مثال: فحص المعدات">
      </div>
      <div class="input-group">
        <label>المسؤول</label>
        <input type="text" id="taskPerson" placeholder="اسم الموظف">
      </div>
      <div class="input-group">
        <label>الأولوية</label>
        <select id="taskPriority">
          <option value="low">منخفضة</option>
          <option value="medium" selected>متوسطة</option>
          <option value="high">عالية</option>
        </select>
      </div>
      <div class="input-group">
        <label>الحالة</label>
        <select id="taskStatus">
          <option value="false">قيد التنفيذ</option>
          <option value="true">مكتملة</option>
        </select>
      </div>
    </div>
    <div class="form-actions" style="margin-top: 20px;">
      <button class="btn-primary" onclick="saveTask()">إضافة</button>
      <button class="btn-outline" onclick="closeModal()">إلغاء</button>
    </div>
  `;
  
  openModal();
}

// Save task from modal
function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const person = document.getElementById('taskPerson').value.trim();
  const priority = document.getElementById('taskPriority').value;
  
  if (!title) {
    alert('الرجاء إدخال عنوان المهمة');
    return;
  }
  
  if (!person) {
    alert('الرجاء إدخال اسم المسؤول');
    return;
  }
  
  addTask(title, person, priority);
  closeModal();
}

// Render tasks table
function renderTasks() {
  const tasks = getData('tasks');
  const tbody = document.getElementById('tasksTable');
  
  if (!tbody) return;
  
  if (tasks.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #9ca3af;">لا توجد مهام</td></tr>';
    return;
  }
  
  tbody.innerHTML = tasks.map((task, index) => {
    const date = new Date(task.createdAt).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    const statusBadge = task.done 
      ? '<span class="status-badge accepted">مكتملة</span>'
      : '<span class="status-badge pending">قيد التنفيذ</span>';
    
    let priorityBadge = '';
    if (task.priority === 'high') {
      priorityBadge = '<span class="status-badge reject">عالية</span>';
    } else if (task.priority === 'medium') {
      priorityBadge = '<span class="status-badge pending">متوسطة</span>';
    } else {
      priorityBadge = '<span class="status-badge completed">منخفضة</span>';
    }
    
    return `
      <tr style="${task.done ? 'opacity: 0.6;' : ''}">
        <td>${index + 1}</td>
        <td>${task.title} ${priorityBadge}</td>
        <td>${task.person}</td>
        <td>${statusBadge}</td>
        <td>${date}</td>
        <td>
          <button class="action-btn ${task.done ? 'edit' : 'accept'}" onclick="toggleTaskStatus('${task.id}')">
            ${task.done ? 'إلغاء الإكتمال' : 'إكتمال'}
          </button>
          <button class="action-btn edit" onclick="editTask('${task.id}')">تعديل</button>
          <button class="action-btn delete" onclick="deleteTask('${task.id}')">حذف</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Toggle task status
function toggleTaskStatus(id) {
  const task = getItemById('tasks', id);
  if (!task) return;
  
  updateItem('tasks', id, {
    done: !task.done,
    completedAt: !task.done ? new Date().toISOString() : null
  });
  
  const action = !task.done ? 'إكتمال' : 'إعادة فتح';
  logActivity('update_task', `${action} مهمة: ${task.title}`);
  
  renderTasks();
  showNotification(`تم ${action} المهمة بنجاح`, 'success');
}

// Edit task
function editTask(id) {
  const task = getItemById('tasks', id);
  if (!task) return;
  
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = 'تعديل مهمة';
  
  modalBody.innerHTML = `
    <div class="form-grid">
      <div class="input-group">
        <label>عنوان المهمة</label>
        <input type="text" id="editTaskTitle" value="${task.title}">
      </div>
      <div class="input-group">
        <label>المسؤول</label>
        <input type="text" id="editTaskPerson" value="${task.person}">
      </div>
      <div class="input-group">
        <label>الأولوية</label>
        <select id="editTaskPriority">
          <option value="low" ${task.priority === 'low' ? 'selected' : ''}>منخفضة</option>
          <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>متوسطة</option>
          <option value="high" ${task.priority === 'high' ? 'selected' : ''}>عالية</option>
        </select>
      </div>
      <div class="input-group">
        <label>الحالة</label>
        <select id="editTaskStatus">
          <option value="false" ${!task.done ? 'selected' : ''}>قيد التنفيذ</option>
          <option value="true" ${task.done ? 'selected' : ''}>مكتملة</option>
        </select>
      </div>
    </div>
    <div class="form-actions" style="margin-top: 20px;">
      <button class="btn-primary" onclick="saveTaskEdit('${task.id}')">حفظ التعديلات</button>
      <button class="btn-outline" onclick="closeModal()">إلغاء</button>
    </div>
  `;
  
  openModal();
}

// Save task edit
function saveTaskEdit(id) {
  const title = document.getElementById('editTaskTitle').value;
  const person = document.getElementById('editTaskPerson').value;
  const priority = document.getElementById('editTaskPriority').value;
  const done = document.getElementById('editTaskStatus').value === 'true';
  
  updateItem('tasks', id, {
    title: title,
    person: person,
    priority: priority,
    done: done
  });
  
  logActivity('update_task', `تحديث مهمة: ${title}`);
  
  closeModal();
  renderTasks();
  showNotification('تم تحديث المهمة بنجاح', 'success');
}

// Delete task
function deleteTask(id) {
  if (!confirm('هل أنت متأكد من حذف المهمة؟')) {
    return;
  }
  
  const task = getItemById('tasks', id);
  
  if (deleteItem('tasks', id)) {
    logActivity('delete_task', `حذف مهمة: ${task.title}`);
    renderTasks();
    showNotification('تم حذف المهمة بنجاح', 'success');
  }
}
