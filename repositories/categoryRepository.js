const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildCategoryDocument } = require('../models/Category');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('categories');
}

async function createCategory({ name, slug }) {
  requireFields({ name }, ['name']);
  const doc = buildCategoryDocument({ name, slug });
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

module.exports = { createCategory, getAllCategories, findCategoryById, findCategoryBySlug };
