// نظام المعمل - فحص الهيتات

// فحص هيت في المعمل
function labTestHeat(heatId, result, notes = '') {
  const user = getCurrentUser();
  
  if (!hasPermission('lab_tests', 'add')) {
    return { success: false, message: 'ليس لديك صلاحية فحص الهيتات' };
  }
  
  const heats = getData('heats');
  const heat = heats.find(h => h.id === heatId);
  
  if (!heat) {
    return { success: false, message: 'الهيت غير موجود' };
  }
  
  if (!heat.needsLabTest) {
    return { success: false, message: 'هذا الهيت لا يحتاج فحص معمل' };
  }
  
  // تحديث حالة الهيت
  heat.labStatus = result; // accepted, rejected, hold
  heat.status = result;    // نفس الحالة
  heat.needsLabTest = false;
  heat.labTestedAt = new Date().toISOString();
  heat.labTestedBy = user.username;
  heat.labTestedByName = user.name;
  heat.labNotes = notes;
  
  saveData('heats', heats);
  
  const resultAr = result === 'accepted' ? 'مقبول' : result === 'rejected' ? 'مرفوض' : 'معلق';
  logActivity('lab_test', `فحص معمل: ${heat.heatNumber} - ${resultAr}`);
  
  return { success: true, heat: heat };
}

// الحصول على الهيتات التي تحتاج فحص
function getHeatsForLabTesting() {
  const heats = getData('heats');
  return heats.filter(h => h.needsLabTest && h.labStatus === 'pending')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

// الحصول على سجل الفحوصات
function getLabTestsHistory(startDate = null, endDate = null) {
  let heats = getData('heats');
  
  // فقط الهيتات المفحوصة
  heats = heats.filter(h => h.labTestedAt);
  
  // فلترة حسب التاريخ
  if (startDate) {
    const start = new Date(startDate).toISOString().split('T')[0];
    heats = heats.filter(h => {
      const testDate = new Date(h.labTestedAt).toISOString().split('T')[0];
      return testDate >= start;
    });
  }
  
  if (endDate) {
    const end = new Date(endDate).toISOString().split('T')[0];
    heats = heats.filter(h => {
      const testDate = new Date(h.labTestedAt).toISOString().split('T')[0];
      return testDate <= end;
    });
  }
  
  return heats.sort((a, b) => new Date(b.labTestedAt) - new Date(a.labTestedAt));
}

// إحصائيات المعمل
function getLabStats() {
  const heats = getData('heats');
  
  const needsTest = heats.filter(h => h.needsLabTest).length;
  const tested = heats.filter(h => h.labTestedAt).length;
  const accepted = heats.filter(h => h.labStatus === 'accepted').length;
  const rejected = heats.filter(h => h.labStatus === 'rejected').length;
  const hold = heats.filter(h => h.labStatus === 'hold').length;
  
  return {
    needsTest: needsTest,
    tested: tested,
    accepted: accepted,
    rejected: rejected,
    hold: hold
  };
}
