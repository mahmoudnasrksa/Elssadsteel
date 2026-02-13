// نظام بسيط بدون تسجيل دخول

function getCurrentUser() {
  return {
    name: 'المدير العام',
    role: 'admin',
    department: 'الإدارة'
  };
}

function hasPermission() {
  return true; // كل الصلاحيات متاحة
}

function logActivity(action, description) {
  const activities = getData('activities');
  activities.push({
    id: generateId(),
    action: action,
    description: description,
    timestamp: new Date().toISOString()
  });
  saveData('activities', activities);
}
