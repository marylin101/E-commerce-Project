function buildCartDocument({ userId, items = [] }) {
  return { userId, items, updatedAt: new Date() };
}

function buildCartItem({ productId, quantity, priceAtAdd }) {
  return { productId, quantity, priceAtAdd };
}

module.exports = { buildCartDocument, buildCartItem };
