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

function validateUpdateProduct(body) {
  const errors = [];
  const { name, sku, price, stockQty, categoryId } = body;
  if(object.keys(body).length === 0) {
    errors.push('At least one field must be provided for update.');
  }
  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    errors.push('Product name must be a non-empty string.');
  }
  if (sku !== undefined && (typeof sku !== 'string' || sku.trim().length === 0)) {
    errors.push('SKU must be a non-empty string.');
  } 
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    errors.push('Price must be a number greater than or equal to 0.');
  }
  if (stockQty !== undefined && (typeof stockQty !== 'number' || stockQty < 0)) {
    errors.push('Stock quantity must be a number greater than or equal to 0.');
  }
  if (categoryId !== undefined && !categoryId) {
    errors.push('Category ID can not be empty.');
  }

  return errors;
} 

module.exports = { validateCreateProduct, validateUpdateProduct};
