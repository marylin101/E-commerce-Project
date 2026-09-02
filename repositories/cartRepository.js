const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { buildAddressDocument } = require('../models/Address');
const { requireFields, requireValidObjectId } = require('../utils/validators');

function collection() {
  return getDb().collection('addresses');
}

async function getCart() {
  //martin to implement the get carts function
}

async function addItem() {
  //add item to cart
}

async function updateQuantity() {
  //update quantity
}

async function removeItem() {
//remove item from cart
}


module.exports = { getCart, addItem, updateQuantity, removeItem };
