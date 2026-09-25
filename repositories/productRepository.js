const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildProductDocument } = require('../models/Product');
const {
  requireFields,
  requireValidObjectId,
  requireNonNegativeNumber,
  handleDuplicateKeyError,
} = require('../utils/validators');

function collection() {
  return getDb().collection('products');
}

async function createProduct({ categoryId, name, sku, price, stockQty, images = [], description = '' }) {
  requireFields({ categoryId, name, price, stockQty }, ['categoryId', 'name', 'price', 'stockQty']);
  requireNonNegativeNumber(price, 'price');
  requireNonNegativeNumber(stockQty, 'stockQty');

  const formattedSku = sku || `SKU-${Date.now()}`;
  const doc = buildProductDocument({
    categoryId: ObjectId.isValid(categoryId) ? new ObjectId(categoryId) : categoryId,
    name,
    sku: formattedSku,
    price,
    stockQty,
    images,
    description,
  });

  try {
    const result = await collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  } catch (error) {
    handleDuplicateKeyError(error, 'Product with the same SKU already exists');
  }
}

async function findProductById(id) {
  requireValidObjectId(id, 'productId');
  const product = await collection().findOne({ _id: new ObjectId(id) });
  if (product) {
    if (product.categoryId) {
      const cat = await getDb().collection('categories').findOne({
        $or: [
          ...(ObjectId.isValid(product.categoryId) ? [{ _id: new ObjectId(product.categoryId) }] : []),
          { _id: String(product.categoryId) },
          { name: String(product.categoryId) }
        ]
      });
      if (cat) product.categoryName = cat.name;
    }
  }
  return product;
}

async function findProducts({ categoryId, category, search, page = 1, limit = 100 }) {
  const filter = {};
  const targetCategory = categoryId || category;

  if (targetCategory && targetCategory !== 'all') {
    let catFilterValues = [];
    if (ObjectId.isValid(targetCategory)) {
      catFilterValues.push(new ObjectId(targetCategory));
      catFilterValues.push(String(targetCategory));
    } else {
      catFilterValues.push(targetCategory);
    }

    try {
      const catRegex = new RegExp(`^${targetCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      const matchedCats = await getDb().collection('categories').find({
        $or: [
          ...(ObjectId.isValid(targetCategory) ? [{ _id: new ObjectId(targetCategory) }] : []),
          { name: catRegex },
          { slug: catRegex },
          { description: catRegex }
        ]
      }).toArray();

      matchedCats.forEach(c => {
        catFilterValues.push(c._id);
        catFilterValues.push(String(c._id));
        if (c.name) catFilterValues.push(c.name);
        if (c.slug) catFilterValues.push(c.slug);
      });
    } catch (e) {
      console.warn('Error fetching matching categories:', e.message);
    }

    const uniqueValues = Array.from(new Set(catFilterValues));
    filter.$or = [
      { categoryId: { $in: uniqueValues } },
      { category: { $in: uniqueValues } }
    ];
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const searchConditions = [
      { name: searchRegex },
      { description: searchRegex },
      { sku: searchRegex },
    ];
    if (filter.$or) {
      filter.$and = [
        { $or: filter.$or },
        { $or: searchConditions }
      ];
      delete filter.$or;
    } else {
      filter.$or = searchConditions;
    }
  }

  const skip = (page - 1) * limit;

  const [items, total, allCategories] = await Promise.all([
    collection().find(filter).skip(skip).limit(limit).toArray(),
    collection().countDocuments(filter),
    getDb().collection('categories').find({}).toArray()
  ]);

  const catMap = new Map();
  allCategories.forEach(c => {
    catMap.set(String(c._id), c.name);
    catMap.set(c.name.toLowerCase(), c.name);
  });

  items.forEach(p => {
    if (p.categoryId) {
      const name = catMap.get(String(p.categoryId)) || catMap.get(String(p.categoryId).toLowerCase());
      if (name) p.categoryName = name;
    } else if (p.category) {
      const name = catMap.get(String(p.category)) || catMap.get(String(p.category).toLowerCase());
      if (name) p.categoryName = name;
    }
  });

  return { items, total, page, limit };
}

async function updateProduct(id, updates) {
  requireValidObjectId(id, 'productId');

  if (updates.price !== undefined) requireNonNegativeNumber(updates.price, 'price');
  if (updates.stockQty !== undefined) requireNonNegativeNumber(updates.stockQty, 'stockQty');
  if (updates.categoryId && ObjectId.isValid(updates.categoryId)) {
    updates.categoryId = new ObjectId(updates.categoryId);
  }

  try {
    const result = await collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result.value || result;
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
  return result.value || result;
}

async function deleteProduct(id) {
  requireValidObjectId(id, 'productId');
  const result = await collection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

module.exports = {
  createProduct,
  findProductById,
  findProducts,
  updateProduct,
  decreaseStock,
  deleteProduct,
  findById: findProductById,
  getAllProducts: findProducts,
};

