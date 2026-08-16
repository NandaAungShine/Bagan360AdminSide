/*
const user = (() => {
  try { return JSON.parse(localStorage.getItem('user')); } 
  catch { return null; }
})();
const admin = user?.role === 'admin';
const userId = user?.id;

const myCarIds = cars.filter(c => c.createdBy === userId).map(c => c.id);

const filteredOrders = orders.filter((order) => {
  if (admin) return true;
  return myCarIds.includes(order.carId);
});
*/