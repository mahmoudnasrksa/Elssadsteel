// ===== الحضور والـ Over Time =====

// تسجيل حضور
function recordAttendance(workerName, status) {
  const attendance = getData('attendance');
  const today = new Date().toISOString().split('T')[0];
  
  // حذف سجل اليوم إن وجد
  const filtered = attendance.filter(a => !(a.workerName === workerName && a.date === today));
  
  filtered.push({
    id: generateId(),
    workerName: workerName,
    date: today,
    status: status, // present, absent, late
    createdAt: new Date().toISOString()
  });
  
  saveData('attendance', filtered);
  logActivity('attendance', `${workerName}: ${status}`);
  
  return { success: true };
}

// حضور اليوم
function getTodayAttendance() {
  const attendance = getData('attendance');
  const today = new Date().toISOString().split('T')[0];
  
  return attendance.filter(a => a.date === today);
}

// إحصائيات الحضور
function getAttendanceStats() {
  const today = getTodayAttendance();
  
  return {
    total: today.length,
    present: today.filter(a => a.status === 'present').length,
    absent: today.filter(a => a.status === 'absent').length,
    late: today.filter(a => a.status === 'late').length
  };
}

// تسجيل Over Time
function recordOvertime(workerName, hours) {
  const overtime = getData('overtime');
  const today = new Date().toISOString().split('T')[0];
  
  overtime.push({
    id: generateId(),
    workerName: workerName,
    date: today,
    hours: parseFloat(hours),
    createdAt: new Date().toISOString()
  });
  
  saveData('overtime', overtime);
  logActivity('overtime', `${workerName}: ${hours} ساعة`);
  
  return { success: true };
}

// Over Time اليوم
function getTodayOvertime() {
  const overtime = getData('overtime');
  const today = new Date().toISOString().split('T')[0];
  
  return overtime.filter(o => o.date === today);
}

// إحصائيات Over Time
function getOvertimeStats() {
  const today = getTodayOvertime();
  
  return {
    workersCount: today.length,
    totalHours: today.reduce((sum, o) => sum + o.hours, 0)
  };
}

// قائمة العمال
function getWorkersList() {
  const attendance = getData('attendance');
  const workers = [...new Set(attendance.map(a => a.workerName))];
  return workers.sort();
}
