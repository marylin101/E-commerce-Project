require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'studydesk';

if (!uri) {
  throw new Error('MONGODB_URI is not set. Copy .env.example to .env and add your connection string.');
}

let client;
let db;
let connectingPromise = null;

async function connectDB() {
  if (db) return db;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB database: ${dbName}`);
    await ensureIndexes(db);
    return db;
  })();

  return connectingPromise;
}

function getDb() {
  if (!db) throw new Error('Database not connected yet. Call connectDB() first.');
  return db;
}

async function ensureIndexes(database) {
  await database.collection('users').createIndex({ email: 1 }, { unique: true });
  await database.collection('products').createIndex({ sku: 1 }, { unique: true });
  await database.collection('reviews').createIndex({ productId: 1, userId: 1 }, { unique: true });
  await database.collection('carts').createIndex({ userId: 1 }, { unique: true });
  await database.collection('products').createIndex({ categoryId: 1 });
  await database.collection('orders').createIndex({ userId: 1 });
  await database.collection('addresses').createIndex({ userId: 1 });
  console.log('Indexes verified.');
}

async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    connectingPromise = null;
    console.log('MongoDB connection closed.');
  }
}

module.exports = { connectDB, getDb, closeDB };
