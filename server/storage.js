import { getDatabase, fromMongo, toMongo } from './db.js';
import { ObjectId } from 'mongodb';

// MongoDB Storage Implementation
export class MongoStorage {
  async getDatabase() {
    return await getDatabase();
  }

  // Helper method to parse ID (accepts both string and ObjectId)
  parseId(id) {
    try {
      return new ObjectId(id);
    } catch {
      return id; // Return as-is if not a valid ObjectId
    }
  }

  // Products
  async getProducts() {
    const db = await this.getDatabase();
    const products = await db.collection('products').find({}).toArray();
    return products.map(fromMongo);
  }

  async getProduct(id) {
    const db = await this.getDatabase();
    const product = await db.collection('products').findOne({ _id: this.parseId(id) });
    return product ? fromMongo(product) : null;
  }

  async createProduct(data) {
    const db = await this.getDatabase();
    const now = new Date();
    const productData = {
      ...toMongo(data),
      created_at: now,
      updated_at: now,
    };
    
    const result = await db.collection('products').insertOne(productData);
    const product = await db.collection('products').findOne({ _id: result.insertedId });
    return fromMongo(product);
  }

  async updateProduct(id, data) {
    const db = await this.getDatabase();
    const updateData = {
      ...toMongo(data),
      updated_at: new Date(),
    };
    
    const result = await db.collection('products').findOneAndUpdate(
      { _id: this.parseId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value ? fromMongo(result.value) : null;
  }

  async deleteProduct(id) {
    const db = await this.getDatabase();
    const result = await db.collection('products').deleteOne({ _id: this.parseId(id) });
    return result.deletedCount > 0;
  }

  // Customers
  async getCustomers() {
    const db = await this.getDatabase();
    const customers = await db.collection('customers').find({}).toArray();
    return customers.map(fromMongo);
  }

  async getCustomer(id) {
    const db = await this.getDatabase();
    const customer = await db.collection('customers').findOne({ _id: this.parseId(id) });
    return customer ? fromMongo(customer) : null;
  }

  async createCustomer(data) {
    const db = await this.getDatabase();
    const now = new Date();
    const customerData = {
      ...toMongo(data),
      created_at: now,
      updated_at: now,
    };
    
    const result = await db.collection('customers').insertOne(customerData);
    const customer = await db.collection('customers').findOne({ _id: result.insertedId });
    return fromMongo(customer);
  }

  async updateCustomer(id, data) {
    const db = await this.getDatabase();
    const updateData = {
      ...toMongo(data),
      updated_at: new Date(),
    };
    
    const result = await db.collection('customers').findOneAndUpdate(
      { _id: this.parseId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value ? fromMongo(result.value) : null;
  }

  // Bills
  async getBills() {
    const db = await this.getDatabase();
    const bills = await db.collection('bills').find({}).sort({ created_at: -1 }).toArray();
    return bills.map(fromMongo);
  }

  async getBill(id) {
    const db = await this.getDatabase();
    const bill = await db.collection('bills').findOne({ _id: this.parseId(id) });
    return bill ? fromMongo(bill) : null;
  }

  async getBillsForToday() {
    const db = await this.getDatabase();
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const bills = await db.collection('bills').find({
      created_at: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    }).sort({ created_at: -1 }).toArray();
    
    return bills.map(fromMongo);
  }

  async createBill(data) {
    const db = await this.getDatabase();
    const now = new Date();
    const billData = {
      ...toMongo(data),
      created_at: now,
      updated_at: now,
    };
    
    const result = await db.collection('bills').insertOne(billData);
    const bill = await db.collection('bills').findOne({ _id: result.insertedId });
    return fromMongo(bill);
  }

  async updateBill(id, data) {
    const db = await this.getDatabase();
    const updateData = {
      ...toMongo(data),
      updated_at: new Date(),
    };
    
    const result = await db.collection('bills').findOneAndUpdate(
      { _id: this.parseId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value ? fromMongo(result.value) : null;
  }

  // Bill Items
  async getBillItems(billId) {
    const db = await this.getDatabase();
    const items = await db.collection('bill_items').find({ bill_id: billId }).toArray();
    return items.map(fromMongo);
  }

  async createBillItem(data) {
    const db = await this.getDatabase();
    const now = new Date();
    const itemData = {
      ...toMongo(data),
      created_at: now,
    };
    
    const result = await db.collection('bill_items').insertOne(itemData);
    const item = await db.collection('bill_items').findOne({ _id: result.insertedId });
    return fromMongo(item);
  }

  // Inventory Transactions
  async getInventoryTransactions(productId = null) {
    const db = await this.getDatabase();
    const filter = productId ? { product_id: productId } : {};
    const transactions = await db.collection('inventory_transactions')
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();
    return transactions.map(fromMongo);
  }

  async createInventoryTransaction(data) {
    const db = await this.getDatabase();
    const now = new Date();
    const transactionData = {
      ...toMongo(data),
      created_at: now,
    };
    
    const result = await db.collection('inventory_transactions').insertOne(transactionData);
    const transaction = await db.collection('inventory_transactions').findOne({ _id: result.insertedId });
    return fromMongo(transaction);
  }

  // Dashboard stats
  async getDashboardStats() {
    const db = await this.getDatabase();
    
    // Get total products
    const totalProducts = await db.collection('products').countDocuments();
    
    // Get low stock products
    const lowStockProducts = await db.collection('products').countDocuments({
      $expr: { $lte: ['$quantity_in_stock', '$min_stock_level'] }
    });
    
    // Get today's bills
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todaysBills = await db.collection('bills').countDocuments({
      created_at: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    // Get today's revenue
    const todaysRevenue = await db.collection('bills').aggregate([
      {
        $match: {
          created_at: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$final_amount' }
        }
      }
    ]).toArray();
    
    return {
      totalProducts,
      lowStock: lowStockProducts,
      todaysBills,
      todaysRevenue: todaysRevenue[0]?.total || 0
    };
  }
}

// Create and export storage instance
export const storage = new MongoStorage();