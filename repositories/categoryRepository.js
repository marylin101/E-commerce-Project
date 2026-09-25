const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildCategoryDocument } = require('../models/Category');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('categories');
}

async function createCategory({ name, slug, description = '' }) {
  requireFields({ name }, ['name']);
  const doc = buildCategoryDocument({ name, slug });
  if (description) doc.description = description;
  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function getAllCategories() {
  return collection().find({}).sort({ name: 1 }).toArray();
}

async function findCategoryById(id) {
  requireValidObjectId(id, 'categoryId');
  return collection().findOne({ _id: new ObjectId(id) });
}

async function findCategoryBySlug(slug) {
  return collection().findOne({ slug });
}

async function updateCategory(id, updates) {
  requireValidObjectId(id, 'categoryId');
  const setDoc = { updatedAt: new Date() };
  if (updates.name) setDoc.name = updates.name.trim();
  if (updates.slug) setDoc.slug = updates.slug.trim();
  if (updates.description !== undefined) setDoc.description = updates.description.trim();

  const result = await collection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: setDoc },
    { returnDocument: 'after' }
  );
  return result.value || result;
}

async function deleteCategory(id) {
  requireValidObjectId(id, 'categoryId');
  const catObjId = new ObjectId(id);

  // Safely unassign categoryId from products using this category
  try {
    await getDb().collection('products').updateMany(
      { $or: [{ categoryId: catObjId }, { categoryId: id }] },
      { $set: { categoryId: null } }
    );
  } catch (e) {
    console.warn('Error clearing category from products on delete:', e.message);
  }

  const result = await collection().deleteOne({ _id: catObjId });
  return result.deletedCount > 0;
}

module.exports = {createCategory, getAllCategories, findCategoryById, findById: findCategoryById, findCategoryBySlug, updateCategory, deleteCategory,};
