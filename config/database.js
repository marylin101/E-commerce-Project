require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const dbName = process.env.DB_NAME || 'thestudydesk';


let client;
let db;
let connectingPromise = null;

async function connectDB() {
  if (db) return db;
  if (connectingPromise) return connectingPromise;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy .env.example to .env and add your connection string.');
  }
  
  connectingPromise = (async () => {
    client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB database: ${dbName}`);
    await ensureIndexes(db);
    await seedInitialData(db);
    return db;
  })();

  return connectingPromise;
}

function getDb() {
  if (!db) throw new Error('Database not connected yet. Call connectDB() first.');
  return db;
}

async function seedInitialData(database) {
  const adminExists = await database.collection('users').findOne({ email: 'admin@example.com' });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await database.collection('users').insertOne({
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      createdAt: new Date()
    });
    console.log('Seeded default admin user: admin@example.com');
  }

  const productsCount = await database.collection('products').countDocuments();
  if (productsCount > 0) return;

  console.log('Seeding initial stationery products and categories into MongoDB...');

  const catDocs = [
    { name: 'Notebooks & Journals', description: 'Hardcover, spiral, and dot grid journals.' },
    { name: 'Writing Instruments', description: 'Pens, mechanical pencils, and fountain pens.' },
    { name: 'Desk Organization', description: 'Wooden organizers, trays, and pen stands.' },
    { name: 'Study Essentials', description: 'Highlighters, sticky notes, and accessories.' }
  ];

  const catResult = await database.collection('categories').insertMany(catDocs);
  const catIds = Object.values(catResult.insertedIds);

  const initialProducts = [
    {
      categoryId: catIds[0],
      name: "Architect's Leather Notebook",
      sku: "SKU-NB-001",
      price: 249.99,
      stockQty: 50,
      images: ["../assets/product-placeholder.png"],
      description: "Premium refillable leather-bound notebook with 120gsm fountain-pen friendly paper."
    },
    {
      categoryId: catIds[1],
      name: "Precision Mechanical Pencil 0.5mm",
      sku: "SKU-PN-002",
      price: 129.50,
      stockQty: 80,
      images: ["../assets/product-placeholder.png"],
      description: "Ergonomic aluminum body mechanical pencil for detailed drafting and note-taking."
    },
    {
      categoryId: catIds[1],
      name: "Archival Gel Ink Pens (Set of 6)",
      sku: "SKU-PN-003",
      price: 189.00,
      stockQty: 100,
      images: ["../assets/product-placeholder.png"],
      description: "Smudge-proof quick-drying archival gel ink pens in rich black and navy."
    },
    {
      categoryId: catIds[2],
      name: "Minimalist Oak Desk Organizer",
      sku: "SKU-DK-004",
      price: 399.00,
      stockQty: 30,
      images: ["../assets/product-placeholder.png"],
      description: "Solid oak wooden desk organizer with phone stand and pen compartments."
    },
    {
      categoryId: catIds[3],
      name: "Pastel Aesthetic Highlighters (Pack of 5)",
      sku: "SKU-SE-005",
      price: 95.00,
      stockQty: 120,
      images: ["../assets/product-placeholder.png"],
      description: "Soft pastel highlighters with dual chisel tips for aesthetic study notes."
    },
    {
      categoryId: catIds[0],
      name: "Dot Grid Spiral Journal A5",
      sku: "SKU-NB-006",
      price: 159.00,
      stockQty: 65,
      images: ["../assets/product-placeholder.png"],
      description: "Hardcover dot grid notebook ideal for bullet journaling and study planning."
    }
  ];

  await database.collection('products').insertMany(initialProducts);
  console.log('Initial stationery products seeded successfully.');
}

async function ensureIndexes(database) {
  const tryIndex = async (col, spec, opts) => {
    try {
      await database.collection(col).createIndex(spec, opts);
    } catch (e) {
      console.warn(`Index creation warning for ${col}: ${e.message}`);
    }
  };
  await tryIndex('users', { email: 1 }, { unique: true });
  await tryIndex('products', { sku: 1 }, { unique: true, sparse: true });
  await tryIndex('reviews', { productId: 1, userId: 1 }, { unique: true });
  await tryIndex('carts', { userId: 1 }, { unique: true });
  await tryIndex('products', { categoryId: 1 });
  await tryIndex('orders', { userId: 1 });
  await tryIndex('addresses', { userId: 1 });
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
