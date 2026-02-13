// ===== التحكم في الواجهة - شغال فعلياً =====

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

function loadDashboard() {
  updateStats();
  showMainContent();
}

// تحديث الإحصائيات
function updateStats() {
  const carsStats = getCarsStats();
  const total3m = calculateTotal3M();
  const heatsNeedingLab = getHeatsNeedingLab().length;
  const attendanceStats = getAttendanceStats();
  
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">🚗</div>
      <div class="stat-info">
        <h3>السيارات</h3>
        <div class="stat-value">${carsStats.totalCars}</div>
        <small>اليوم: ${carsStats.todayCars}</small>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">📦</div>
      <div class="stat-info">
        <h3>البيليت (3م)</h3>
        <div class="stat-value">${total3m}</div>
        <small>جاهز للشحن</small>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">🔬</div>
      <div class="stat-info">
        <h3>يحتاج فحص</h3>
        <div class="stat-value">${heatsNeedingLab}</div>
        <small>معمل</small>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">👷</div>
      <div class="stat-info">
        <h3>الحضور</h3>
        <div class="stat-value">${attendanceStats.present}</div>
        <small>من ${attendanceStats.total}</small>
      </div>
    </div>
  `;
}

// المحتوى الرئيسي
function showMainContent() {
  document.getElementById('mainContent').innerHTML = `
    <div class="section">
      <div class="section-header">
        <h2>العمليات الرئيسية</h2>
      </div>
      <div class="actions-grid">
        <button class="btn btn-primary" onclick="showAddCarForm()">
          🚗 إضافة سيارة
        </button>
        <button class="btn btn-secondary" onclick="showAllCars()">
          📋 عرض السيارات
        </button>
        <button class="btn btn-success" onclick="showReadyToShip()">
          🚢 الجاهز للشحن
        </button>
        <button class="btn btn-warning" onclick="showAttendancePage()">
          👷 الحضور
        </button>
        <button class="btn" onclick="showPurchasesPage()">
          🛒 طلبات الشراء
        </button>
        <button class="btn" onclick="showLabTests()">
          🔬 فحص المعمل
        </button>
        <button class="btn btn-secondary" onclick="showShippingSheet()">
          📊 شيت الشحن
        </button>
        <button class="btn btn-warning" onclick="showOvertimePage()">
          ⏰ Over Time
        </button>
      </div>
    </div>
  `;
}

// ===== نماذج الإضافة =====

function showAddCarForm() {
  openModal('إضافة سيارة', `
    <div class="form">
      <div class="input-group">
        <label>رقم السيارة</label>
        <input type="text" id="carNumber" placeholder="س ر ق 1234">
      </div>
      
      <div class="input-group">
        <label>اسم الشركة</label>
        <input type="text" id="company" placeholder="شركة الحديد">
      </div>
      
      <div class="input-group">
        <label>الوزن (طن)</label>
        <input type="number" id="weight" placeholder="25" step="0.01">
      </div>
      
      <h4>الهيتات</h4>
      <div id="heatsContainer">
        <div class="heat-item">
          <input type="text" placeholder="رقم الهيت (0126-088-45)" class="heat-number">
          <select class="heat-length">
            <option value="3">3 متر</option>
            <option value="6">6 متر</option>
            <option value="12">12 متر</option>
          </select>
        </div>
      </div>
      
      <button class="btn btn-sm" onclick="addHeatRow()">+ هيت آخر</button>
      
      <div class="form-actions">
        <button class="btn btn-primary" onclick="submitCar()">حفظ</button>
        <button class="btn" onclick="closeModal()">إلغاء</button>
      </div>
    </div>
  `);
}

function addHeatRow() {
  const container = document.getElementById('heatsContainer');
  const div = document.createElement('div');
  div.className = 'heat-item';
  div.innerHTML = `
    <input type="text" placeholder="رقم الهيت" class="heat-number">
    <select class="heat-length">
      <option value="3">3 متر</option>
      <option value="6">6 متر</option>
      <option value="12">12 متر</option>
    </select>
  `;
  container.appendChild(div);
}

function submitCar() {
  const carNumber = document.getElementById('carNumber').value;
  const company = document.getElementById('company').value;
  const weight = document.getElementById('weight').value;
  
  if (!carNumber || !company || !weight) {
    alert('الرجاء إدخال جميع البيانات');
    return;
  }
  
  const heatItems = document.querySelectorAll('.heat-item');
  const heats = [];
  
  heatItems.forEach(item => {
    const heatNumber = item.querySelector('.heat-number').value;
    const length = item.querySelector('.heat-length').value;
    
    if (heatNumber) {
      heats.push({ heatNumber, length });
    }
  });
  
  if (heats.length === 0) {
    alert('الرجاء إضافة هيت واحد على الأقل');
    return;
  }
  
  const result = addCar({ carNumber, company, weight, heats });
  
  if (result.success) {
    alert('✅ تم إضافة السيارة بنجاح!');
    closeModal();
    updateStats();
  }
}

// عرض السيارات
function showAllCars() {
  const cars = getAllCars();
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>السيارات المسجلة (${cars.length})</h2>
        <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>رقم السيارة</th>
            <th>الشركة</th>
            <th>الوزن</th>
            <th>التاريخ</th>
            <th>الهيتات</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  cars.forEach((car, i) => {
    const heats = getCarHeats(car.id);
    const date = new Date(car.createdAt).toLocaleDateString('ar-EG');
    
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${car.carNumber}</td>
        <td>${car.company}</td>
        <td>${car.weight} طن</td>
        <td>${date}</td>
        <td>${heats.length}</td>
        <td>
          <button class="btn btn-sm" onclick="viewCarDetails('${car.id}')">تفاصيل</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteCar('${car.id}')">حذف</button>
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('mainContent').innerHTML = html;
}

function viewCarDetails(carId) {
  const car = getItemById('cars', carId);
  const heats = getCarHeats(carId);
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>تفاصيل سيارة ${car.carNumber}</h2>
        <button class="btn btn-sm" onclick="showAllCars()">رجوع</button>
      </div>
      
      <div style="background:#1a1f2e;padding:15px;border-radius:8px;margin-bottom:20px;">
        <p><strong>الشركة:</strong> ${car.company}</p>
        <p><strong>الوزن:</strong> ${car.weight} طن</p>
        <p><strong>عدد الهيتات:</strong> ${heats.length}</p>
      </div>
      
      <h3>الهيتات:</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>الهيت</th>
            <th>الطول</th>
            <th>العدد</th>
            <th>الحالة</th>
            <th>المعمل</th>
            <th>القص</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  heats.forEach(h => {
    const statusBadge = h.status === 'accepted' ? 'badge-accepted' : 
                       h.status === 'rejected' ? 'badge-rejected' : 'badge-pending';
    
    const labBadge = h.labStatus === 'accepted' ? 'badge-accepted' : 
                     h.labStatus === 'rejected' ? 'badge-rejected' : 'badge-pending';
    
    const cutStatus = h.isCut ? '✅ تم القص' : (h.length === 3 ? '-' : '⏳ لم يُقص');
    
    html += `
      <tr>
        <td>${h.heatNumber}</td>
        <td>${h.length}م</td>
        <td>${h.count}</td>
        <td><span class="badge ${statusBadge}">${h.status}</span></td>
        <td><span class="badge ${labBadge}">${h.labStatus}</span></td>
        <td>${cutStatus}</td>
        <td>
    `;
    
    // زر القص (فقط للـ 6م و 12م المقبولة)
    if ((h.length === 6 || h.length === 12) && h.status === 'accepted' && !h.isCut) {
      html += `<button class="btn btn-sm btn-warning" onclick="cutHeat('${h.id}')">✂️ قص</button>`;
    }
    
    html += `
        </td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('mainContent').innerHTML = html;
}

function cutHeat(heatId) {
  const result = markAsCut(heatId);
  
  if (result.success) {
    alert(`✅ تم القص! النتيجة: ${result.resulting} قطعة (3م)`);
    updateStats();
    // إعادة عرض نفس الصفحة
    const heats = getData('heats');
    const heat = heats.find(h => h.id === heatId);
    viewCarDetails(heat.carId);
  } else {
    alert('❌ ' + result.message);
  }
}

function confirmDeleteCar(carId) {
  if (confirm('هل تريد حذف هذه السيارة؟')) {
    deleteCar(carId);
    showAllCars();
    updateStats();
  }
}

// الجاهز للشحن
function showReadyToShip() {
  const ready = getReadyForShipping();
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>جاهز للشحن (${ready.length})</h2>
        <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
      </div>
  `;
  
  if (ready.length === 0) {
    html += '<p>لا يوجد بيليت جاهز للشحن</p>';
  } else {
    html += `
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="selectAll" onchange="toggleSelectAll()"></th>
            <th>الهيت</th>
            <th>الطول</th>
            <th>العدد</th>
            <th>3م</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    ready.forEach(h => {
      let count3m = h.length === 3 ? h.count : (h.length === 6 ? h.count * 2 : h.count * 4);
      
      html += `
        <tr>
          <td><input type="checkbox" class="ship-check" value="${h.id}"></td>
          <td>${h.heatNumber}</td>
          <td>${h.length}م</td>
          <td>${h.count}</td>
          <td>${count3m}</td>
        </tr>
      `;
    });
    
    html += `
        </tbody>
      </table>
      <button class="btn btn-success" onclick="shipSelected()">شحن المحدد</button>
    `;
  }
  
  html += '</div>';
  document.getElementById('mainContent').innerHTML = html;
}

function toggleSelectAll() {
  const checkboxes = document.querySelectorAll('.ship-check');
  const selectAll = document.getElementById('selectAll').checked;
  checkboxes.forEach(cb => cb.checked = selectAll);
}

function shipSelected() {
  const checked = Array.from(document.querySelectorAll('.ship-check:checked'));
  
  if (checked.length === 0) {
    alert('الرجاء تحديد هيتات للشحن');
    return;
  }
  
  const heatIds = checked.map(cb => cb.value);
  const result = shipBillets(heatIds);
  
  if (result.success) {
    alert(`✅ تم شحن ${result.shipment.totalCount} قطعة (3م)`);
    updateStats();
    showReadyToShip();
  }
}

// صفحة الحضور الكاملة
function showAttendancePage() {
  const today = getTodayAttendance();
  const workers = getWorkersList();
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>حضور اليوم (${today.length})</h2>
        <div>
          <button class="btn btn-success btn-sm" onclick="showAddAttendanceForm()">+ تسجيل حضور</button>
          <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
        </div>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>اسم العامل</th>
            <th>الحالة</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (today.length === 0) {
    html += `<tr><td colspan="4" style="text-align:center;padding:30px;">لم يتم تسجيل حضور اليوم</td></tr>`;
  } else {
    today.forEach((a, i) => {
      const statusText = a.status === 'present' ? 'حاضر' :
                        a.status === 'absent' ? 'غائب' : 'متأخر';
      const statusClass = a.status === 'present' ? 'badge-accepted' :
                         a.status === 'absent' ? 'badge-rejected' : 'badge-pending';
      
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${a.workerName}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
          <td>${new Date(a.createdAt).toLocaleString('ar-EG')}</td>
        </tr>
      `;
    });
  }
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('mainContent').innerHTML = html;
}

function showAddAttendanceForm() {
  const workers = getWorkersList();
  
  let workersOptions = '<option value="">-- اختر عامل --</option>';
  workers.forEach(w => {
    workersOptions += `<option value="${w}">${w}</option>`;
  });
  
  openModal('تسجيل حضور', `
    <div class="form">
      <div class="input-group">
        <label>اسم العامل</label>
        <input type="text" id="workerName" placeholder="أحمد محمد" list="workersList">
        <datalist id="workersList">
          ${workers.map(w => `<option value="${w}">`).join('')}
        </datalist>
      </div>
      
      <div class="input-group">
        <label>الحالة</label>
        <select id="attendanceStatus">
          <option value="present">حاضر ✅</option>
          <option value="absent">غائب ❌</option>
          <option value="late">متأخر ⏰</option>
        </select>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-success" onclick="submitAttendance()">تسجيل</button>
        <button class="btn" onclick="closeModal()">إلغاء</button>
      </div>
    </div>
  `);
}

function submitAttendance() {
  const name = document.getElementById('workerName').value;
  const status = document.getElementById('attendanceStatus').value;
  
  if (!name) {
    alert('الرجاء إدخال اسم العامل');
    return;
  }
  
  recordAttendance(name, status);
  alert('✅ تم تسجيل الحضور');
  closeModal();
  updateStats();
  showAttendancePage();
}

// صفحة Over Time
function showOvertimePage() {
  const today = getTodayAttendance();
  const todayOT = getTodayOvertime();
  
  // العمال الحاضرون فقط
  const presentWorkers = today.filter(a => a.status === 'present');
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>Over Time اليوم</h2>
        <div>
          <button class="btn btn-warning btn-sm" onclick="showAddOvertimeForm()">+ إضافة OT</button>
          <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
        </div>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>اسم العامل</th>
            <th>الساعات</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (todayOT.length === 0) {
    html += `<tr><td colspan="4" style="text-align:center;padding:30px;">لا يوجد Over Time اليوم</td></tr>`;
  } else {
    let totalHours = 0;
    todayOT.forEach((ot, i) => {
      totalHours += ot.hours;
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${ot.workerName}</td>
          <td>${ot.hours} ساعة</td>
          <td>${new Date(ot.createdAt).toLocaleString('ar-EG')}</td>
        </tr>
      `;
    });
    
    html += `
      <tr style="background:#1a1f2e;font-weight:bold;">
        <td colspan="2">الإجمالي</td>
        <td>${totalHours} ساعة</td>
        <td></td>
      </tr>
    `;
  }
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('mainContent').innerHTML = html;
}

function showAddOvertimeForm() {
  const today = getTodayAttendance();
  const presentWorkers = today.filter(a => a.status === 'present');
  
  if (presentWorkers.length === 0) {
    alert('لا يوجد عمال حاضرون اليوم! سجل الحضور أولاً.');
    return;
  }
  
  let workersOptions = '';
  presentWorkers.forEach(w => {
    workersOptions += `<option value="${w.workerName}">${w.workerName}</option>`;
  });
  
  openModal('إضافة Over Time', `
    <div class="form">
      <div class="input-group">
        <label>اختر العامل (من الحاضرين اليوم)</label>
        <select id="otWorkerName">
          <option value="">-- اختر --</option>
          ${workersOptions}
        </select>
      </div>
      
      <div class="input-group">
        <label>عدد الساعات</label>
        <input type="number" id="otHours" placeholder="3" step="0.5" min="0.5">
      </div>
      
      <div class="form-actions">
        <button class="btn btn-warning" onclick="submitOvertime()">إضافة</button>
        <button class="btn" onclick="closeModal()">إلغاء</button>
      </div>
    </div>
  `);
}

function submitOvertime() {
  const name = document.getElementById('otWorkerName').value;
  const hours = document.getElementById('otHours').value;
  
  if (!name || !hours) {
    alert('الرجاء إدخال جميع البيانات');
    return;
  }
  
  recordOvertime(name, hours);
  alert('✅ تم تسجيل Over Time');
  closeModal();
  updateStats();
  showOvertimePage();
}

// صفحة طلبات الشراء الكاملة
function showPurchasesPage() {
  const purchases = getAllPurchases();
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>طلبات الشراء (${purchases.length})</h2>
        <div>
          <button class="btn btn-primary btn-sm" onclick="showAddPurchaseForm()">+ طلب جديد</button>
          <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
        </div>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الصنف</th>
            <th>الكمية</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (purchases.length === 0) {
    html += `<tr><td colspan="6" style="text-align:center;padding:30px;">لا توجد طلبات</td></tr>`;
  } else {
    purchases.forEach((p, i) => {
      const statusText = p.status === 'pending' ? 'قيد الانتظار' :
                        p.status === 'ordered' ? 'تم الطلب' : 'تم التسليم';
      const statusClass = p.status === 'pending' ? 'badge-pending' :
                         p.status === 'ordered' ? 'badge-accepted' : 'badge-accepted';
      
      const date = new Date(p.createdAt).toLocaleDateString('ar-EG');
      
      html += `
        <tr>
          <td>${i + 1}</td>
          <td>${p.itemName}</td>
          <td>${p.quantity}</td>
          <td><span class="badge ${statusClass}">${statusText}</span></td>
          <td>${date}</td>
          <td>
      `;
      
      if (p.status === 'pending') {
        html += `<button class="btn btn-sm btn-success" onclick="updatePurchase('${p.id}', 'ordered')">تم الطلب</button>`;
      }
      
      if (p.status === 'ordered') {
        html += `<button class="btn btn-sm btn-success" onclick="updatePurchase('${p.id}', 'delivered')">تم التسليم</button>`;
      }
      
      html += `
            <button class="btn btn-sm btn-danger" onclick="deletePurchaseItem('${p.id}')">حذف</button>
          </td>
        </tr>
      `;
    });
  }
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('mainContent').innerHTML = html;
}

function updatePurchase(id, status) {
  updatePurchaseStatus(id, status);
  showPurchasesPage();
}

function deletePurchaseItem(id) {
  if (confirm('هل تريد حذف هذا الطلب؟')) {
    deletePurchase(id);
    showPurchasesPage();
  }
}

// فحص المعمل
function showLabTests() {
  const heats = getHeatsNeedingLab();
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>يحتاج فحص (${heats.length})</h2>
        <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
      </div>
  `;
  
  if (heats.length === 0) {
    html += '<p style="text-align:center;padding:30px;">لا توجد هيتات تحتاج فحص</p>';
  } else {
    html += '<table class="data-table"><thead><tr><th>الهيت</th><th>الطول</th><th>العدد</th><th>الفحص</th></tr></thead><tbody>';
    
    heats.forEach(h => {
      html += `
        <tr>
          <td>${h.heatNumber}</td>
          <td>${h.length}م</td>
          <td>${h.count}</td>
          <td>
            <button class="btn btn-sm btn-success" onclick="testHeat('${h.id}', 'accepted')">قبول</button>
            <button class="btn btn-sm btn-danger" onclick="testHeat('${h.id}', 'rejected')">رفض</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  html += '</div>';
  document.getElementById('mainContent').innerHTML = html;
}

function testHeat(heatId, result) {
  labTest(heatId, result);
  showLabTests();
  updateStats();
}

// شيت الشحن
function showShippingSheet() {
  const today = getTodayShipments();
  const stats = getShippingStats();
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>شيت الشحن اليومي</h2>
        <div>
          <input type="date" id="shippingDate" value="${new Date().toISOString().split('T')[0]}" 
                 onchange="filterShippingByDate(this.value)" style="padding:8px;border-radius:6px;">
          <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
        </div>
      </div>
      
      <div style="background:#1a1f2e;padding:15px;border-radius:8px;margin-bottom:20px;">
        <h3>إحصائيات اليوم:</h3>
        <p><strong>عدد الشحنات:</strong> ${today.length}</p>
        <p><strong>إجمالي القطع:</strong> ${stats.todayCount} قطعة (3م)</p>
      </div>
  `;
  
  if (today.length === 0) {
    html += '<p style="text-align:center;padding:30px;">لا توجد شحنات اليوم</p>';
  } else {
    today.forEach((shipment, idx) => {
      const date = new Date(shipment.shippedAt).toLocaleString('ar-EG');
      
      html += `
        <div style="background:#0f1115;padding:15px;border-radius:8px;margin-bottom:15px;border:1px solid rgba(0,212,170,0.3);">
          <h4>شحنة #${idx + 1} - ${date}</h4>
          <p><strong>الإجمالي:</strong> ${shipment.totalCount} قطعة (3م)</p>
          <table class="data-table" style="margin-top:10px;">
            <thead>
              <tr>
                <th>رقم الهيت</th>
                <th>العدد (3م)</th>
                <th>الطول الأصلي</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      shipment.items.forEach(item => {
        html += `
          <tr>
            <td>${item.heatNumber}</td>
            <td>${item.count}</td>
            <td>${item.originalLength}م</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    });
  }
  
  html += '</div>';
  document.getElementById('mainContent').innerHTML = html;
}

function filterShippingByDate(date) {
  const shipments = getShipmentsByDate(date);
  // نفس الكود بس مع الشحنات المفلترة
  // (يمكن تحسينه لاحقاً)
  showShippingSheet();
}

// نموذج إضافة طلب شراء
function showAddPurchaseForm() {
  openModal('طلب شراء جديد', `
    <div class="form">
      <div class="input-group">
        <label>اسم الصنف</label>
        <input type="text" id="itemName" placeholder="مواد خام / قطع غيار / أدوات">
      </div>
      
      <div class="input-group">
        <label>الكمية</label>
        <input type="number" id="quantity" placeholder="100" min="1">
      </div>
      
      <div class="form-actions">
        <button class="btn btn-primary" onclick="submitPurchase()">إضافة</button>
        <button class="btn" onclick="closeModal()">إلغاء</button>
      </div>
    </div>
  `);
}

function submitPurchase() {
  const itemName = document.getElementById('itemName').value;
  const quantity = document.getElementById('quantity').value;
  
  if (!itemName || !quantity) {
    alert('الرجاء إدخال جميع البيانات');
    return;
  }
  
  addPurchase(itemName, quantity);
  alert('✅ تم إضافة الطلب');
  closeModal();
  showPurchasesPage();
}
function showLabTests() {
  const heats = getHeatsNeedingLab();
  
  let html = `
    <div class="section">
      <div class="section-header">
        <h2>يحتاج فحص (${heats.length})</h2>
        <button class="btn btn-sm" onclick="showMainContent()">رجوع</button>
      </div>
  `;
  
  if (heats.length === 0) {
    html += '<p>لا توجد هيتات تحتاج فحص</p>';
  } else {
    html += '<table class="data-table"><thead><tr><th>الهيت</th><th>الطول</th><th>العدد</th><th>الفحص</th></tr></thead><tbody>';
    
    heats.forEach(h => {
      html += `
        <tr>
          <td>${h.heatNumber}</td>
          <td>${h.length}م</td>
          <td>${h.count}</td>
          <td>
            <button class="btn btn-sm btn-success" onclick="testHeat('${h.id}', 'accepted')">قبول</button>
            <button class="btn btn-sm btn-danger" onclick="testHeat('${h.id}', 'rejected')">رفض</button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
  }
  
  html += '</div>';
  document.getElementById('mainContent').innerHTML = html;
}

function testHeat(heatId, result) {
  labTest(heatId, result);
  showLabTests();
  updateStats();
}

// Modal
function openModal(title, content) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'modal') closeModal();
}
