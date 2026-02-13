// ===== طلبات الشراء =====

// إضافة طلب
function addPurchase(itemName, quantity) {
  const purchases = getData('purchases');
  
  const newPurchase = {
    id: generateId(),
    itemName: itemName,
    quantity: parseInt(quantity),
    status: 'pending', // pending, ordered, delivered
    createdAt: new Date().toISOString()
  };
  
  purchases.push(newPurchase);
  saveData('purchases', purchases);
  logActivity('add_purchase', `طلب: ${itemName}`);
  
  return { success: true, purchase: newPurchase };
}

// تحديث حالة الطلب
function updatePurchaseStatus(purchaseId, status) {
  const purchases = getData('purchases');
  const purchase = purchases.find(p => p.id === purchaseId);
  
  if (!purchase) return { success: false };
  
  purchase.status = status;
  purchase.updatedAt = new Date().toISOString();
  
  saveData('purchases', purchases);
  logActivity('update_purchase', `${purchase.itemName}: ${status}`);
  
  return { success: true };
}

// كل الطلبات
function getAllPurchases() {
  return getData('purchases').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// حذف طلب
function deletePurchase(purchaseId) {
  deleteItem('purchases', purchaseId);
  logActivity('delete_purchase', 'حذف طلب');
  return true;
}

// إحصائيات
function getPurchasesStats() {
  const purchases = getData('purchases');
  
  return {
    total: purchases.length,
    pending: purchases.filter(p => p.status === 'pending').length,
    ordered: purchases.filter(p => p.status === 'ordered').length,
    delivered: purchases.filter(p => p.status === 'delivered').length
  };
}
