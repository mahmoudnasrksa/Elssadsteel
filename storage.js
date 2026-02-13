// ===== نظام التخزين الكامل =====

// الحصول من LocalStorage
function getData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`خطأ في قراءة ${key}:`, error);
    return [];
  }
}

// الحفظ في LocalStorage
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`خطأ في حفظ ${key}:`, error);
    return false;
  }
}

// توليد ID فريد
function generateId() {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// تحليل رقم الهيت
function parseHeatNumber(heatNumber) {
  heatNumber = heatNumber.trim();
  
  // النوع الأول: 0126-088-4
  const pattern1 = /^(\d+)-(\d+)-(\d+)$/;
  const match1 = heatNumber.match(pattern1);
  
  if (match1) {
    return {
      full: heatNumber,
      batch: match1[1],
      heat: match1[2],
      count: parseInt(match1[3]),
      identifier: `${match1[1]}-${match1[2]}`
    };
  }
  
  // النوع الثاني: 11B-26-05-89
  const pattern2 = /^([A-Z0-9]+)-(\d+)-(\d+)-(\d+)$/i;
  const match2 = heatNumber.match(pattern2);
  
  if (match2) {
    return {
      full: heatNumber,
      batch: match2[1],
      heat: `${match2[2]}-${match2[3]}`,
      count: parseInt(match2[4]),
      identifier: `${match2[1]}-${match2[2]}-${match2[3]}`
    };
  }
  
  return null;
}

// البحث عن هيتات مطابقة
function findMatchingHeat(heatNumber) {
  const parsed = parseHeatNumber(heatNumber);
  if (!parsed) return null;
  
  const allHeats = getData('heats');
  return allHeats.find(h => {
    const existingParsed = parseHeatNumber(h.heatNumber);
    if (!existingParsed) return false;
    return existingParsed.identifier === parsed.identifier;
  });
}

// حذف عنصر
function deleteItem(key, id) {
  const data = getData(key);
  const filtered = data.filter(item => item.id !== id);
  return saveData(key, filtered);
}

// تحديث عنصر
function updateItem(key, id, updates) {
  const data = getData(key);
  const index = data.findIndex(item => item.id === id);
  
  if (index !== -1) {
    data[index] = { ...data[index], ...updates };
    return saveData(key, data);
  }
  
  return false;
}

// الحصول على عنصر بالـ ID
function getItemById(key, id) {
  const data = getData(key);
  return data.find(item => item.id === id);
}
