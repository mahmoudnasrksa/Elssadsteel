// Export System - Excel and PDF Export

// Export to Excel using CSV format
function exportToExcel(dataType) {
  let data, headers, filename;
  
  if (dataType === 'cars') {
    data = getData('cars');
    headers = ['#', 'رقم السيارة', 'الوزن (طن)', 'التاريخ', 'المسؤول'];
    filename = 'cars_export';
    
    var csvContent = headers.join(',') + '\n';
    data.forEach((car, index) => {
      const date = new Date(car.createdAt).toLocaleDateString('ar-EG');
      csvContent += `${index + 1},"${car.carNumber}",${car.weight},"${date}","${car.createdBy || '-'}"\n`;
    });
    
  } else if (dataType === 'billets') {
    data = getData('billets');
    headers = ['#', 'رقم البيليت', 'الطول', 'العدد', 'الحالة', 'التاريخ'];
    filename = 'billets_export';
    
    var csvContent = headers.join(',') + '\n';
    data.forEach((billet, index) => {
      const date = new Date(billet.createdAt).toLocaleDateString('ar-EG');
      csvContent += `${index + 1},"${billet.billetNumber || '-'}",${billet.length},${billet.count},"${billet.status}","${date}"\n`;
    });
    
  } else if (dataType === 'purchases') {
    data = getData('purchases');
    headers = ['#', 'الصنف', 'الكمية', 'الحالة', 'التاريخ', 'المسؤول'];
    filename = 'purchases_export';
    
    var csvContent = headers.join(',') + '\n';
    data.forEach((purchase, index) => {
      const date = new Date(purchase.createdAt).toLocaleDateString('ar-EG');
      csvContent += `${index + 1},"${purchase.item}",${purchase.quantity},"${purchase.status}","${date}","${purchase.createdBy || '-'}"\n`;
    });
    
  } else if (dataType === 'tasks') {
    data = getData('tasks');
    headers = ['#', 'المهمة', 'المسؤول', 'الأولوية', 'الحالة', 'التاريخ'];
    filename = 'tasks_export';
    
    var csvContent = headers.join(',') + '\n';
    data.forEach((task, index) => {
      const date = new Date(task.createdAt).toLocaleDateString('ar-EG');
      const status = task.done ? 'مكتملة' : 'قيد التنفيذ';
      csvContent += `${index + 1},"${task.title}","${task.person}","${task.priority}","${status}","${date}"\n`;
    });
  }
  
  // Add BOM for UTF-8
  const BOM = '\uFEFF';
  csvContent = BOM + csvContent;
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  
  logActivity('export', `تصدير ${dataType} إلى Excel`);
  showNotification('تم التصدير بنجاح', 'success');
}

// Generate comprehensive report
function generateReport() {
  const stats = getStatistics();
  const billetStats = calculateBilletStats();
  const user = getCurrentUser();
  
  const report = `
تقرير مصنع السد للصناعة
==================================
التاريخ: ${new Date().toLocaleDateString('ar-EG', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
الوقت: ${new Date().toLocaleTimeString('ar-EG')}
المستخدم: ${user.name}

إحصائيات عامة:
----------------------------------
عدد السيارات: ${stats.totalCars}
إجمالي البيليت: ${stats.totalBillets}
الوزن الكلي: ${stats.totalWeight.toFixed(2)} طن
المرفوض: ${billetStats.reject}

توزيع البيليت:
----------------------------------
بيليت 3 متر: ${billetStats.billet3}
بيليت 6 متر: ${billetStats.billet6}
بيليت 12 متر: ${billetStats.billet12}

طلبات الشراء:
----------------------------------
إجمالي الطلبات: ${stats.totalPurchases}

المهام:
----------------------------------
إجمالي المهام: ${stats.totalTasks}
المكتملة: ${stats.completedTasks}
قيد التنفيذ: ${stats.totalTasks - stats.completedTasks}

==================================
تم إنشاء التقرير بواسطة نظام مصنع السد للصناعة
`;

  // Download as text file
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report_${new Date().toISOString().split('T')[0]}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  
  logActivity('report', 'إنشاء تقرير شامل');
  showNotification('تم إنشاء التقرير بنجاح', 'success');
}

// Print current page
function printPage() {
  window.print();
  logActivity('print', 'طباعة الصفحة');
}

// Export all data as JSON backup
function exportAllData() {
  backupData();
}

// Show reports modal
function showReportsModal() {
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = 'التقارير والتصدير';
  
  const stats = getStatistics();
  const billetStats = calculateBilletStats();
  
  modalBody.innerHTML = `
    <div style="margin-bottom: 24px;">
      <h4 style="margin-bottom: 16px; color: var(--text-primary);">إحصائيات سريعة</h4>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
        <div style="background: rgba(0, 255, 204, 0.1); padding: 12px; border-radius: 8px;">
          <div style="font-size: 12px; color: var(--text-secondary);">السيارات</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${stats.totalCars}</div>
        </div>
        <div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px;">
          <div style="font-size: 12px; color: var(--text-secondary);">البيليت</div>
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${stats.totalBillets}</div>
        </div>
        <div style="background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 8px;">
          <div style="font-size: 12px; color: var(--text-secondary);">الوزن الكلي</div>
          <div style="font-size: 24px; font-weight: 700; color: #f59e0b;">${stats.totalWeight.toFixed(1)}</div>
        </div>
        <div style="background: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 8px;">
          <div style="font-size: 12px; color: var(--text-secondary);">المرفوض</div>
          <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${billetStats.reject}</div>
        </div>
      </div>
    </div>
    
    <h4 style="margin-bottom: 16px; color: var(--text-primary);">تصدير البيانات</h4>
    <div style="display: grid; gap: 12px; margin-bottom: 20px;">
      <button class="btn-primary" onclick="exportToExcel('cars'); closeModal();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
        </svg>
        تصدير السيارات (Excel)
      </button>
      <button class="btn-primary" onclick="exportToExcel('billets'); closeModal();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
        </svg>
        تصدير البيليت (Excel)
      </button>
      <button class="btn-primary" onclick="exportToExcel('purchases'); closeModal();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
        </svg>
        تصدير طلبات الشراء (Excel)
      </button>
      <button class="btn-primary" onclick="exportToExcel('tasks'); closeModal();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
        </svg>
        تصدير المهام (Excel)
      </button>
    </div>
    
    <h4 style="margin-bottom: 16px; color: var(--text-primary);">التقارير</h4>
    <div style="display: grid; gap: 12px;">
      <button class="btn-secondary" onclick="generateReport(); closeModal();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        تقرير شامل
      </button>
      <button class="btn-secondary" onclick="exportAllData(); closeModal();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
        </svg>
        نسخة احتياطية كاملة
      </button>
      <button class="btn-outline" onclick="printPage(); closeModal();">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
        </svg>
        طباعة
      </button>
    </div>
  `;
  
  openModal();
}
