// ===== إدارة البيليت والهيتات =====

// البحث عن هيت
function searchHeat(heatNumber) {
  const heats = getData('heats');
  const found = heats.find(h => h.heatNumber === heatNumber);
  
  if (found) {
    return {
      success: true,
      heat: found,
      message: found.needsLabTest ? 'يحتاج فحص معمل' : `الحالة: ${found.status}`
    };
  }
  
  return { success: false, message: 'الهيت غير موجود' };
}

// تحديد "تم القص"
function markAsCut(heatId) {
  const heats = getData('heats');
  const heat = heats.find(h => h.id === heatId);
  
  if (!heat) return { success: false, message: 'الهيت غير موجود' };
  if (heat.status !== 'accepted') return { success: false, message: 'يجب أن يكون مقبول أولاً' };
  if (heat.length === 3) return { success: false, message: '3 متر لا يحتاج قص' };
  
  heat.isCut = true;
  heat.cutAt = new Date().toISOString();
  
  // حساب القطع الناتجة
  const multiplier = heat.length === 6 ? 2 : 4;
  const resulting = heat.count * multiplier;
  
  saveData('heats', heats);
  logActivity('cut_heat', `قص ${heat.heatNumber}: ${heat.length}م → ${resulting} قطعة 3م`);
  
  return { success: true, resulting: resulting };
}

// الحصول على الجاهز للشحن
function getReadyForShipping() {
  const heats = getData('heats');
  
  return heats.filter(h => {
    if (h.isShipped) return false;
    if (h.status !== 'accepted') return false;
    
    if (h.length === 3) return true;
    if ((h.length === 6 || h.length === 12) && h.isCut) return true;
    
    return false;
  });
}

// حساب الإجمالي على أساس 3م
function calculateTotal3M() {
  const heats = getData('heats');
  let total = 0;
  
  heats.forEach(h => {
    if (h.isShipped || h.status !== 'accepted') return;
    
    if (h.length === 3) {
      total += h.count;
    } else if (h.length === 6 && h.isCut) {
      total += h.count * 2;
    } else if (h.length === 12 && h.isCut) {
      total += h.count * 4;
    }
  });
  
  return total;
}

// فحص معملي
function labTest(heatId, result) {
  const heats = getData('heats');
  const heat = heats.find(h => h.id === heatId);
  
  if (!heat) return { success: false };
  
  heat.labStatus = result;
  heat.status = result;
  heat.needsLabTest = false;
  heat.labTestedAt = new Date().toISOString();
  
  saveData('heats', heats);
  logActivity('lab_test', `فحص ${heat.heatNumber}: ${result}`);
  
  return { success: true };
}

// الهيتات التي تحتاج فحص
function getHeatsNeedingLab() {
  return getData('heats').filter(h => h.needsLabTest);
}
