const ORDER_STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

function buildOrderDocument({ userId, addressId, items, totalAmount, paymentRef = null }) {
  return { userId, addressId, status: 'Pending', totalAmount, paymentRef, createdAt: new Date(), items };
}

// nameSnapshot/priceSnapshot protect past orders from later product edits
function buildOrderItem({ productId, nameSnapshot, quantity, priceSnapshot }) {
  return { productId, nameSnapshot, quantity, priceSnapshot };
}

module.exports = { ORDER_STATUSES, buildOrderDocument, buildOrderItem };
