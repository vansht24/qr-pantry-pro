import { db } from './db.js';
import { 
  products, 
  customers, 
  bills, 
  billItems, 
  inventoryTransactions,
  type Product, 
  type Customer, 
  type Bill, 
  type BillItem, 
  type InventoryTransaction,
  type InsertProduct, 
  type InsertCustomer, 
  type InsertBill, 
  type InsertBillItem, 
  type InsertInventoryTransaction 
} from "@shared/schema";
import { eq, desc, asc, sql, ilike } from "drizzle-orm";

// Helper functions for ID parsing and validation
function parseId(id: string | number): number | null {
  const parsed = typeof id === 'string' ? parseInt(id, 10) : id;
  return isNaN(parsed) ? null : parsed;
}

function assertValidId(id: string | number): number {
  const parsed = parseId(id);
  if (parsed === null) {
    throw new Error(`Invalid ID: ${id}`);
  }
  return parsed;
}

// PostgreSQL Storage Implementation with proper type safety
export class PostgresStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(asc(products.name));
  }

  async getProduct(id: string): Promise<Product | null> {
    const productId = parseId(id);
    if (productId === null) return null;
    
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    return product || null;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(data)
      .returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | null> {
    const productId = parseId(id);
    if (productId === null) return null;
    
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();
    return product || null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const productId = parseId(id);
    if (productId === null) return false;
    
    const result = await db.delete(products).where(eq(products.id, productId));
    return (result.rowCount || 0) > 0;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(asc(customers.name));
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const customerId = parseId(id);
    if (customerId === null) return null;
    
    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));
    return customer || null;
  }

  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(data)
      .returning();
    return customer;
  }

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | null> {
    const customerId = parseId(id);
    if (customerId === null) return null;
    
    const [customer] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, customerId))
      .returning();
    return customer || null;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customerId = parseId(id);
    if (customerId === null) return false;
    
    const result = await db.delete(customers).where(eq(customers.id, customerId));
    return (result.rowCount || 0) > 0;
  }

  // Bills
  async getBills(): Promise<Bill[]> {
    return await db.select().from(bills).orderBy(desc(bills.createdAt));
  }

  async getBill(id: string): Promise<Bill | null> {
    const billId = parseId(id);
    if (billId === null) return null;
    
    const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
    return bill || null;
  }

  async createBill(data: InsertBill): Promise<Bill> {
    const [bill] = await db
      .insert(bills)
      .values(data)
      .returning();
    return bill;
  }

  async updateBill(id: string, data: Partial<InsertBill>): Promise<Bill | null> {
    const billId = parseId(id);
    if (billId === null) return null;
    
    const [bill] = await db
      .update(bills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bills.id, billId))
      .returning();
    return bill || null;
  }

  async deleteBill(id: string): Promise<boolean> {
    const billId = parseId(id);
    if (billId === null) return false;
    
    // First delete bill items
    await db.delete(billItems).where(eq(billItems.billId, billId));
    
    const result = await db.delete(bills).where(eq(bills.id, billId));
    return (result.rowCount || 0) > 0;
  }

  // Bill Items
  async getBillItems(billId: string): Promise<BillItem[]> {
    const id = parseId(billId);
    if (id === null) return [];
    
    return await db.select().from(billItems).where(eq(billItems.billId, id));
  }

  async createBillItem(data: InsertBillItem): Promise<BillItem> {
    const [billItem] = await db
      .insert(billItems)
      .values(data)
      .returning();
    return billItem;
  }

  async deleteBillItem(id: string): Promise<boolean> {
    const billItemId = parseId(id);
    if (billItemId === null) return false;
    
    const result = await db.delete(billItems).where(eq(billItems.id, billItemId));
    return (result.rowCount || 0) > 0;
  }

  // Inventory Transactions
  async getInventoryTransactions(productId?: string): Promise<InventoryTransaction[]> {
    if (productId) {
      const id = parseId(productId);
      if (id === null) return [];
      return await db.select().from(inventoryTransactions)
        .where(eq(inventoryTransactions.productId, id))
        .orderBy(desc(inventoryTransactions.createdAt));
    }
    return await db.select().from(inventoryTransactions)
      .orderBy(desc(inventoryTransactions.createdAt));
  }

  async createInventoryTransaction(data: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [transaction] = await db
      .insert(inventoryTransactions)
      .values(data)
      .returning();
    return transaction;
  }

  // Low Stock Products
  async getLowStockProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(sql`${products.quantityInStock} <= ${products.minStockLevel}`)
      .orderBy(asc(products.quantityInStock));
  }

  // Expiring Products
  async getExpiringProducts(days: number = 30): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db.select().from(products)
      .where(sql`${products.expiryDate} IS NOT NULL AND ${products.expiryDate} <= ${futureDate.toISOString().split('T')[0]}`)
      .orderBy(asc(products.expiryDate));
  }

  // Search Products
  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(sql`LOWER(${products.name}) LIKE LOWER(${'%' + query + '%'}) 
                 OR LOWER(${products.category}) LIKE LOWER(${'%' + query + '%'})
                 OR ${products.barcode} = ${query}
                 OR ${products.qrCode} = ${query}`)
      .orderBy(asc(products.name));
  }
}

export const storage = new PostgresStorage();