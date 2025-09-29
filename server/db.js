import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectToMongoDB() {
  if (db) {
    return db;
  }

  try {
    // Use environment variable or default to local MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGODB_DB || 'pantry_pal';

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);

    // Create indexes for better performance and uniqueness
    await createIndexes();
    
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Products collection indexes
    await db.collection('products').createIndex({ barcode: 1 }, { unique: true, sparse: true });
    await db.collection('products').createIndex({ qr_code: 1 }, { sparse: true });
    await db.collection('products').createIndex({ name: 1 });
    await db.collection('products').createIndex({ category: 1 });
    
    // Bills collection indexes
    await db.collection('bills').createIndex({ bill_number: 1 }, { unique: true });
    await db.collection('bills').createIndex({ created_at: -1 });
    await db.collection('bills').createIndex({ customer_id: 1 });
    
    // Customers collection indexes
    await db.collection('customers').createIndex({ phone: 1 }, { sparse: true });
    await db.collection('customers').createIndex({ email: 1 }, { sparse: true });
    
    // Bill items collection indexes
    await db.collection('bill_items').createIndex({ bill_id: 1 });
    await db.collection('bill_items').createIndex({ product_id: 1 });
    
    // Inventory transactions collection indexes
    await db.collection('inventory_transactions').createIndex({ product_id: 1 });
    await db.collection('inventory_transactions').createIndex({ created_at: -1 });
    
    console.log('MongoDB indexes created successfully');
  } catch (error) {
    console.log('Some indexes might already exist:', error.message);
  }
}

export async function getDatabase() {
  if (!db) {
    return await connectToMongoDB();
  }
  return db;
}

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Helper functions for MongoDB operations
export function toMongo(doc) {
  if (!doc) return doc;
  
  const result = { ...doc };
  
  // Convert string amounts to Decimal128 for precision
  if (result.mrp && typeof result.mrp === 'string') {
    result.mrp = parseFloat(result.mrp);
  }
  if (result.buying_cost && typeof result.buying_cost === 'string') {
    result.buying_cost = parseFloat(result.buying_cost);
  }
  if (result.total_amount && typeof result.total_amount === 'string') {
    result.total_amount = parseFloat(result.total_amount);
  }
  if (result.discount_amount && typeof result.discount_amount === 'string') {
    result.discount_amount = parseFloat(result.discount_amount);
  }
  if (result.tax_amount && typeof result.tax_amount === 'string') {
    result.tax_amount = parseFloat(result.tax_amount);
  }
  if (result.final_amount && typeof result.final_amount === 'string') {
    result.final_amount = parseFloat(result.final_amount);
  }
  if (result.unit_price && typeof result.unit_price === 'string') {
    result.unit_price = parseFloat(result.unit_price);
  }
  if (result.total_price && typeof result.total_price === 'string') {
    result.total_price = parseFloat(result.total_price);
  }
  
  // Convert date strings to Date objects
  if (result.manufacturing_date && typeof result.manufacturing_date === 'string') {
    result.manufacturing_date = new Date(result.manufacturing_date);
  }
  if (result.expiry_date && typeof result.expiry_date === 'string') {
    result.expiry_date = new Date(result.expiry_date);
  }
  
  return result;
}

export function fromMongo(doc) {
  if (!doc) return doc;
  
  const result = { ...doc };
  
  // Convert ObjectId to string
  if (result._id) {
    result.id = result._id.toString();
    delete result._id;
  }
  
  // Convert numeric amounts back to strings to maintain API compatibility
  if (typeof result.mrp === 'number') {
    result.mrp = result.mrp.toString();
  }
  if (typeof result.buying_cost === 'number') {
    result.buying_cost = result.buying_cost.toString();
  }
  if (typeof result.total_amount === 'number') {
    result.total_amount = result.total_amount.toString();
  }
  if (typeof result.discount_amount === 'number') {
    result.discount_amount = result.discount_amount.toString();
  }
  if (typeof result.tax_amount === 'number') {
    result.tax_amount = result.tax_amount.toString();
  }
  if (typeof result.final_amount === 'number') {
    result.final_amount = result.final_amount.toString();
  }
  if (typeof result.unit_price === 'number') {
    result.unit_price = result.unit_price.toString();
  }
  if (typeof result.total_price === 'number') {
    result.total_price = result.total_price.toString();
  }
  
  // Ensure dates are ISO strings
  if (result.manufacturing_date instanceof Date) {
    result.manufacturing_date = result.manufacturing_date.toISOString().split('T')[0];
  }
  if (result.expiry_date instanceof Date) {
    result.expiry_date = result.expiry_date.toISOString().split('T')[0];
  }
  if (result.created_at instanceof Date) {
    result.created_at = result.created_at.toISOString();
  }
  if (result.updated_at instanceof Date) {
    result.updated_at = result.updated_at.toISOString();
  }
  
  return result;
}