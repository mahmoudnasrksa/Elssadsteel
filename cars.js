// ===== إدارة السيارات - شغال فعلياً =====

// إضافة سيارة مع هيتات
function addCar(carData) {
  const cars = getData('cars');
  const heats = getData('heats');
  
  // إنشاء السيارة
  const newCar = {
    id: generateId(),
    carNumber: carData.carNumber,
    company: carData.company,
    weight: parseFloat(carData.weight),
    createdAt: new Date().toISOString()
  };
  
  cars.push(newCar);
  saveData('cars', cars);
  
  // إضافة الهيتات
  carData.heats.forEach(heatData => {
    const parsed = parseHeatNumber(heatData.heatNumber);
    if (!parsed) return;
    
    const matching = findMatchingHeat(heatData.heatNumber);
    
    const newHeat = {
      id: generateId(),
      carId: newCar.id,
      heatNumber: heatData.heatNumber,
      batch: parsed.batch,
      heat: parsed.heat,
      count: parsed.count,
      length: parseInt(heatData.length),
      status: matching ? matching.status : 'pending',
      labStatus: matching ? matching.labStatus : 'pending',
      needsLabTest: !matching,
      isCut: false,
      isShipped: false,
      createdAt: new Date().toISOString()
    };
    
    heats.push(newHeat);
  });
  
  saveData('heats', heats);
  logActivity('add_car', `إضافة سيارة: ${newCar.carNumber}`);
  
  return { success: true, car: newCar };
}

// الحصول على كل السيارات
function getAllCars() {
  return getData('cars').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// الحصول على هيتات سيارة
function getCarHeats(carId) {
  return getData('heats').filter(h => h.carId === carId);
}

// حذف سيارة
function deleteCar(carId) {
  const heats = getData('heats').filter(h => h.carId !== carId);
  saveData('heats', heats);
  deleteItem('cars', carId);
  logActivity('delete_car', 'حذف سيارة');
  return true;
}

// إحصائيات
function getCarsStats() {
  const cars = getData('cars');
  const heats = getData('heats');
  
  const today = new Date().toISOString().split('T')[0];
  const todayCars = cars.filter(c => c.createdAt.startsWith(today));
  
  return {
    totalCars: cars.length,
    todayCars: todayCars.length,
    totalWeight: cars.reduce((sum, c) => sum + c.weight, 0),
    totalHeats: heats.length,
    acceptedHeats: heats.filter(h => h.status === 'accepted').length,
    rejectedHeats: heats.filter(h => h.status === 'rejected').length
  };
}
