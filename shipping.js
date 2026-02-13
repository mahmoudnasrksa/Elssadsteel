// ===== نظام الشحن =====

// شحن بيليت
function shipBillets(heatIds) {
  const heats = getData('heats');
  const shipments = getData('shipments');
  
  const shipmentId = generateId();
  const shippedItems = [];
  let totalCount = 0;
  
  heatIds.forEach(heatId => {
    const heat = heats.find(h => h.id === heatId);
    if (!heat) return;
    
    heat.isShipped = true;
    heat.shippedAt = new Date().toISOString();
    heat.shipmentId = shipmentId;
    
    // حساب الكمية بـ 3م
    let count3m = 0;
    if (heat.length === 3) {
      count3m = heat.count;
    } else if (heat.length === 6 && heat.isCut) {
      count3m = heat.count * 2;
    } else if (heat.length === 12 && heat.isCut) {
      count3m = heat.count * 4;
    }
    
    shippedItems.push({
      heatNumber: heat.heatNumber,
      count: count3m,
      originalLength: heat.length
    });
    
    totalCount += count3m;
  });
  
  const shipment = {
    id: shipmentId,
    items: shippedItems,
    totalCount: totalCount,
    shippedAt: new Date().toISOString()
  };
  
  shipments.push(shipment);
  saveData('shipments', shipments);
  saveData('heats', heats);
  
  logActivity('ship', `شحن ${totalCount} قطعة 3م`);
  
  return { success: true, shipment: shipment };
}

// شحنات اليوم
function getTodayShipments() {
  const shipments = getData('shipments');
  const today = new Date().toISOString().split('T')[0];
  
  return shipments.filter(s => s.shippedAt.startsWith(today));
}

// شحنات بالتاريخ
function getShipmentsByDate(date) {
  const shipments = getData('shipments');
  const dateStr = new Date(date).toISOString().split('T')[0];
  
  return shipments.filter(s => s.shippedAt.startsWith(dateStr));
}

// إحصائيات الشحن
function getShippingStats() {
  const shipments = getData('shipments');
  const today = getTodayShipments();
  
  return {
    totalShipments: shipments.length,
    todayShipments: today.length,
    totalCount: shipments.reduce((sum, s) => sum + s.totalCount, 0),
    todayCount: today.reduce((sum, s) => sum + s.totalCount, 0)
  };
}
