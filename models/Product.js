function buildProductDocument({ categoryId, name, sku, price, stockQty, images = [], description = '' }) {
  return { categoryId, name, sku, price, stockQty, images, description };
}

module.exports = { buildProductDocument };