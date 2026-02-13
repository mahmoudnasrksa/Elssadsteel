// Dashboard Controller

// تسجيل دخول تلقائي كمدير
const user = {
  userId: 1,
  username: 'admin',
  name: 'المدير العام',
  role: 'admin',
  department: 'الإدارة',
  permissions: {
    cars: ['view', 'add', 'edit', 'delete'],
    heats: ['view', 'add', 'edit', 'delete'],
    billets: ['view', 'add', 'edit', 'delete'],
    attendance: ['view', 'add', 'edit', 'delete'],
    overtime: ['view', 'add', 'edit', 'delete'],
    shipping: ['view', 'add', 'edit', 'delete'],
    purchases: ['view', 'add', 'edit', 'delete'],
    lab_tests: ['view', 'add', 'edit', 'delete'],
    reports: ['view', 'export']
  }
};

// حفظ في LocalStorage
localStorage.setItem('currentUser', JSON.stringify(user));
localStorage.setItem('isLoggedIn', 'true');

// تحميل Dashboard عند بدء الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

// تهيئة Dashboard
function initDashboard() {
  updateUserInfo();
  loadStats();
  loadContentByRole();
}

// تحديث معلومات المستخدم في الـ Navbar
function updateUserInfo() {
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userRole').textContent = user.department;
}

// تحميل الإحصائيات حسب الدور
function loadStats() {
  const statsGrid = document.getElementById('statsGrid');
  let statsHTML = '';
  
  if (user.role === 'admin') {
    // المدير يشوف كل شيء
    const carsStats = getCarsStats();
    const labStats = getLabStats();
    const purchasesStats = getPurchasesStats();
    const total3m = calculateTotal3M();
    
    statsHTML = `
      <div class="stat-card primary">
        <div class="stat-icon">🚗</div>
        <div class="stat-info">
          <h3>إجمالي السيارات</h3>
          <div class="stat-value">${carsStats.totalCars}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>هيتات مقبولة</h3>
          <div class="stat-value">${carsStats.acceptedHeats}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <h3>إجمالي البيليت (3م)</h3>
          <div class="stat-value">${total3m}</div>
        </div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <h3>مرفوض</h3>
          <div class="stat-value">${carsStats.rejectedHeats}</div>
        </div>
      </div>
    `;
  } else if (user.role === 'scale_supervisor') {
    const carsStats = getCarsStats();
    const today = new Date().toISOString().split('T')[0];
    const attendanceStats = getAttendanceStats(today);
    const overtimeStats = getOvertimeStats(today);
    
    statsHTML = `
      <div class="stat-card primary">
        <div class="stat-icon">🚗</div>
        <div class="stat-info">
          <h3>سيارات اليوم</h3>
          <div class="stat-value">${carsStats.todayCars}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">👷</div>
        <div class="stat-info">
          <h3>العمال الحاضرون</h3>
          <div class="stat-value">${attendanceStats.present}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">⏰</div>
        <div class="stat-info">
          <h3>Over Time (ساعات)</h3>
          <div class="stat-value">${overtimeStats.totalHours}</div>
        </div>
      </div>
      <div class="stat-card secondary">
        <div class="stat-icon">⚖️</div>
        <div class="stat-info">
          <h3>وزن اليوم (طن)</h3>
          <div class="stat-value">${carsStats.todayWeight.toFixed(1)}</div>
        </div>
      </div>
    `;
  } else if (user.role === 'billet_supervisor') {
    const total3m = calculateTotal3M();
    const needsTest = getHeatsNeedingLabTest().length;
    const today = new Date().toISOString().split('T')[0];
    const attendanceStats = getAttendanceStats(today);
    const shippingStats = getShippingStats(today);
    
    statsHTML = `
      <div class="stat-card primary">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <h3>جاهز للشحن (3م)</h3>
          <div class="stat-value">${total3m}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">🔬</div>
        <div class="stat-info">
          <h3>يحتاج فحص معمل</h3>
          <div class="stat-value">${needsTest}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">👷</div>
        <div class="stat-info">
          <h3>العمال الحاضرون</h3>
          <div class="stat-value">${attendanceStats.present}</div>
        </div>
      </div>
      <div class="stat-card secondary">
        <div class="stat-icon">🚢</div>
        <div class="stat-info">
          <h3>مشحون اليوم</h3>
          <div class="stat-value">${shippingStats.totalCount}</div>
        </div>
      </div>
    `;
  } else if (user.role === 'general_supervisor') {
    const today = new Date().toISOString().split('T')[0];
    const attendanceStats = getAttendanceStats(today);
    const overtimeStats = getOvertimeStats(today);
    const purchasesStats = getPurchasesStats();
    const total3m = calculateTotal3M();
    
    statsHTML = `
      <div class="stat-card success">
        <div class="stat-icon">👷</div>
        <div class="stat-info">
          <h3>العمال الحاضرون</h3>
          <div class="stat-value">${attendanceStats.present}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">⏰</div>
        <div class="stat-info">
          <h3>Over Time (ساعات)</h3>
          <div class="stat-value">${overtimeStats.totalHours}</div>
        </div>
      </div>
      <div class="stat-card primary">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <h3>طلبات الشراء</h3>
          <div class="stat-value">${purchasesStats.pending}</div>
        </div>
      </div>
      <div class="stat-card secondary">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <h3>البيليت (3م)</h3>
          <div class="stat-value">${total3m}</div>
        </div>
      </div>
    `;
  } else if (user.role === 'sales') {
    const purchasesStats = getPurchasesStats();
    
    statsHTML = `
      <div class="stat-card warning">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <h3>قيد الانتظار</h3>
          <div class="stat-value">${purchasesStats.pending}</div>
        </div>
      </div>
      <div class="stat-card primary">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <h3>تم الطلب</h3>
          <div class="stat-value">${purchasesStats.ordered}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>تم التسليم</h3>
          <div class="stat-value">${purchasesStats.delivered}</div>
        </div>
      </div>
      <div class="stat-card secondary">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <h3>إجمالي الطلبات</h3>
          <div class="stat-value">${purchasesStats.total}</div>
        </div>
      </div>
    `;
  } else if (user.role === 'lab') {
    const labStats = getLabStats();
    
    statsHTML = `
      <div class="stat-card warning">
        <div class="stat-icon">🔬</div>
        <div class="stat-info">
          <h3>يحتاج فحص</h3>
          <div class="stat-value">${labStats.needsTest}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>مقبول</h3>
          <div class="stat-value">${labStats.accepted}</div>
        </div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon">❌</div>
        <div class="stat-info">
          <h3>مرفوض</h3>
          <div class="stat-value">${labStats.rejected}</div>
        </div>
      </div>
      <div class="stat-card secondary">
        <div class="stat-icon">⏸️</div>
        <div class="stat-info">
          <h3>معلق</h3>
          <div class="stat-value">${labStats.hold}</div>
        </div>
      </div>
    `;
  }
  
  statsGrid.innerHTML = statsHTML;
}

// تحميل المحتوى حسب الدور
function loadContentByRole() {
  const content = document.getElementById('mainContent');
  
  if (user.role === 'admin') {
    content.innerHTML = getAdminContent();
  } else if (user.role === 'scale_supervisor') {
    content.innerHTML = getScaleSupervisorContent();
  } else if (user.role === 'billet_supervisor') {
    content.innerHTML = getBilletSupervisorContent();
  } else if (user.role === 'general_supervisor') {
    content.innerHTML = getGeneralSupervisorContent();
  } else if (user.role === 'sales') {
    content.innerHTML = getSalesContent();
  } else if (user.role === 'lab') {
    content.innerHTML = getLabContent();
  }
}

// محتوى المدير
function getAdminContent() {
  return `
    <div class="section">
      <div class="section-header">
        <h2>لوحة تحكم المدير</h2>
      </div>
      <p>مرحباً ${user.name}، أنت لديك صلاحيات كاملة على النظام.</p>
      <div class="mt-2">
        <button class="btn btn-primary" onclick="showAllCars()">عرض كل السيارات</button>
        <button class="btn btn-secondary" onclick="showAllAttendance()">حضور العمال</button>
        <button class="btn btn-success" onclick="showShippingSheet()">شيت الشحن</button>
      </div>
    </div>
  `;
}

// محتوى مشرف الميزان
function getScaleSupervisorContent() {
  return `
    <div class="section">
      <div class="section-header">
        <h2>إضافة سيارة جديدة</h2>
      </div>
      <button class="btn btn-primary" onclick="showAddCarModal()">+ إضافة سيارة</button>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2>السيارات المسجلة</h2>
        <input type="date" id="filterDate" onchange="filterCarsByDate()" class="input-group" style="width:auto;">
      </div>
      <div id="carsTableContainer"></div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2>حضور العمال</h2>
      </div>
      <button class="btn btn-success" onclick="showAttendanceModal()">تسجيل الحضور</button>
      <button class="btn btn-warning" onclick="showOvertimeModal()">Over Time</button>
    </div>
  `;
}

// محتوى مشرف البيليت
function getBilletSupervisorContent() {
  return `
    <div class="section">
      <div class="section-header">
        <h2>بحث عن هيت</h2>
      </div>
      <div class="input-group">
        <input type="text" id="searchHeat" placeholder="أدخل رقم الهيت (مثال: 0126-088-4)" style="width:300px;">
        <button class="btn btn-primary" onclick="searchHeat()">بحث</button>
      </div>
      <div id="searchResults" class="mt-2"></div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2>جاهز للشحن</h2>
      </div>
      <button class="btn btn-success" onclick="showReadyForShipping()">عرض الجاهز للشحن</button>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2>حضور العمال</h2>
      </div>
      <button class="btn btn-success" onclick="showAttendanceModal()">تسجيل الحضور</button>
      <button class="btn btn-warning" onclick="showOvertimeModal()">Over Time</button>
    </div>
  `;
}

// محتوى المشرف العام
function getGeneralSupervisorContent() {
  return `
    <div class="section">
      <div class="section-header">
        <h2>حضور العمال</h2>
      </div>
      <button class="btn btn-success" onclick="showAttendanceModal()">تسجيل الحضور</button>
      <button class="btn btn-warning" onclick="showOvertimeModal()">Over Time</button>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2>طلبات الشراء</h2>
      </div>
      <button class="btn btn-primary" onclick="showAddPurchaseModal()">+ إضافة طلب شراء</button>
      <div id="purchasesContainer" class="mt-2"></div>
    </div>
    
    <div class="section">
      <div class="section-header">
        <h2>عرض البيليت</h2>
      </div>
      <button class="btn btn-secondary" onclick="showAllBillets()">عرض البيليت</button>
    </div>
  `;
}

// محتوى مندوب المبيعات
function getSalesContent() {
  return `
    <div class="section">
      <div class="section-header">
        <h2>طلبات الشراء</h2>
        <select id="filterStatus" onchange="filterPurchases()" style="padding:8px;border-radius:6px;">
          <option value="all">الكل</option>
          <option value="pending">قيد الانتظار</option>
          <option value="ordered">تم الطلب</option>
          <option value="delivered">تم التسليم</option>
        </select>
      </div>
      <div id="purchasesTableContainer"></div>
    </div>
  `;
}

// محتوى المعمل
function getLabContent() {
  return `
    <div class="section">
      <div class="section-header">
        <h2>هيتات تحتاج فحص</h2>
      </div>
      <div id="labTestsContainer"></div>
    </div>
  `;
}

// Helper Functions
function openModal() {
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function closeModalOnBackdrop(event) {
  if (event.target.id === 'modal') {
    closeModal();
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `alert ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    min-width: 300px;
    text-align: center;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Placeholder functions - سيتم تنفيذها
function showAddCarModal() {
  alert('سيتم فتح نافذة إضافة سيارة');
}

function showAllCars() {
  alert('عرض كل السيارات');
}

function showAttendanceModal() {
  alert('تسجيل الحضور');
}

function showOvertimeModal() {
  alert('تسجيل Over Time');
}

function searchHeat() {
  alert('البحث عن هيت');
}

function showReadyForShipping() {
  alert('عرض الجاهز للشحن');
}

function showAddPurchaseModal() {
  alert('إضافة طلب شراء');
}

function showAllBillets() {
  alert('عرض البيليت');
}

function showShippingSheet() {
  alert('شيت الشحن');
}

function filterCarsByDate() {
  alert('فلترة السيارات');
}

function filterPurchases() {
  alert('فلترة الطلبات');
}

function showAllAttendance() {
  alert('حضور العمال');
}
