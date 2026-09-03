const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('products');
}

async function createProduct({ categoryId, name, sku, price, stockQty, images = [], description = '' }) {
 requireFields({ categoryId, name, sku, price, stockQty });
 requireValidObjectId(categoryId, 'categoryId');
 requireNonNegativeNumber(price, 'price');
 requireNonNegativeNumber(stockQty, 'stockQty');

 const doc = buildProductDocument({ categoryId, name, sku, price, stockQty, images, description });

 try{
  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
 }catch (error) {
  handleDuplicateKeyError(error, 'Product with the same SKU already exists');
 }
}

async function findProductById(id) {
  requireValidObjectId(id, 'productId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findProducts({ categoryId, search, page = 1, limit = 20 }) {
  const filter = {};
  if (categoryId) {
    requireValidObjectId(categoryId, 'categoryId');
    filter.categoryId = new ObjectId(categoryId);
  }
  if (search){
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    collection().find(filter).skip(skip).limit(limit).toArray(),
    collection().countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

async function updateProduct(id, updates) {
 requireValidObjectId(id, 'productId');

 if (updates.price !== undefined) requireNonNegativeNumber(updates.price, 'price');
 if (updates.stockQty !== undefined) requireNonNegativeNumber(updates.stockQty, 'stockQty');
 if (updates.categoryId){
  requireValidObjectId(updates.categoryId, 'categoryId');
  updates.categoryId = new ObjectId(updates.categoryId);
 }

 try{
  return await collection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' }
  );
 } catch (error) {
  handleDuplicateKeyError(error, 'Product with the same SKU already exists');
 }
}

async function decreaseStock(productId, quantity) {
  requireValidObjectId(productId, 'productId');
  const result = await collection().findOneAndUpdate(
    { _id: new ObjectId(productId), stockQty: { $gte: quantity } },
    { $inc: { stockQty: -quantity } },
    { returnDocument: 'after' }
  );
  return result;
}

async function deleteProduct(id) {
  requireValidObjectId(id, 'productId');
  const result = await collection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = { createProduct, findProductById, findProducts, updateProduct, decreaseStock, deleteProduct };
