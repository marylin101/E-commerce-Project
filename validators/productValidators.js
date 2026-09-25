function validateCreateProduct(body) {
  const errors = [];
  const { name, sku, price, stockQty, categoryId } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Product name is required.');
  }
  if (!sku || typeof sku !== 'string' || sku.trim().length === 0) {
    errors.push('SKU is required.');
  }
  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price must be a number greater than or equal to 0.');
  }
  if (stockQty === undefined || typeof stockQty !== 'number' || stockQty < 0) {
    errors.push('Stock quantity must be a number greater than or equal to 0.');
  }
  if (!categoryId) {
    errors.push('Category is required.');
  }

  return errors;
}

module.exports = { validateCreateProduct };
