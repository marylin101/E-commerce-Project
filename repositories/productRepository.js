const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildAddressDocument } = require('../models/Address');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('addresses');
}

async function createProduct({ categoryId, name, sku, price, stockQty, images = [], description = '' }) {
 //create product function
}

async function findProductById(id) {
  //find product by id function
}

async function getProduct() {
 //get products function
}

async function updateProduct(id, updates) {
 //update product function
}

async function deleteProduct(id) {
  //delete product function
}

module.exports = { createProduct, findProductById, getProduct, updateProduct, deleteProduct };
