import { db } from './db.js';
import { 
  products, 
  customers, 
  bills, 
  billItems, 
  inventoryTransactions
} from "@shared/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

export class PostgresStorage {
  // Products
  async getProducts(): Promise<any[]> {
    return await db.select().from(products).orderBy(asc(products.name));
  }

  async getProduct(id: string): Promise<Product | null> {
    const productId = parseInt(id);
    if (isNaN(productId)) return null;
    
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    return product || null;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...data,
        mrp: data.mrp || "0",
        buyingCost: data.buyingCost || "0",
      })
      .returning();
    return product;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | null> {
    const productId = parseInt(id);
    if (isNaN(productId)) return null;
    
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();
    return product || null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const productId = parseInt(id);
    if (isNaN(productId)) return false;
    
    const result = await db.delete(products).where(eq(products.id, productId));
    return result.rowCount > 0;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(asc(customers.name));
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const customerId = parseInt(id);
    if (isNaN(customerId)) return null;
    
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
    const customerId = parseInt(id);
    if (isNaN(customerId)) return null;
    
    const [customer] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, customerId))
      .returning();
    return customer || null;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customerId = parseInt(id);
    if (isNaN(customerId)) return false;
    
    const result = await db.delete(customers).where(eq(customers.id, customerId));
    return result.rowCount > 0;
  }

  // Bills
  async getBills(): Promise<Bill[]> {
    return await db.select().from(bills).orderBy(desc(bills.createdAt));
  }

  async getBill(id: string): Promise<Bill | null> {
    const billId = parseInt(id);
    if (isNaN(billId)) return null;
    
    const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
    return bill || null;
  }

  async createBill(data: InsertBill): Promise<Bill> {
    const [bill] = await db
      .insert(bills)
      .values({
        ...data,
        totalAmount: data.totalAmount || "0",
        discountAmount: data.discountAmount || "0",
        taxAmount: data.taxAmount || "0",
        finalAmount: data.finalAmount || "0",
      })
      .returning();
    return bill;
  }

  async updateBill(id: string, data: Partial<InsertBill>): Promise<Bill | null> {
    const billId = parseInt(id);
    if (isNaN(billId)) return null;
    
    const [bill] = await db
      .update(bills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bills.id, billId))
      .returning();
    return bill || null;
  }

  async deleteBill(id: string): Promise<boolean> {
    const billId = parseInt(id);
    if (isNaN(billId)) return false;
    
    // First delete bill items
    await db.delete(billItems).where(eq(billItems.billId, billId));
    
    const result = await db.delete(bills).where(eq(bills.id, billId));
    return result.rowCount > 0;
  }

  // Bill Items
  async getBillItems(billId: string): Promise<BillItem[]> {
    const id = parseInt(billId);
    if (isNaN(id)) return [];
    
    return await db.select().from(billItems).where(eq(billItems.billId, id));
  }

  async createBillItem(data: InsertBillItem): Promise<BillItem> {
    const [billItem] = await db
      .insert(billItems)
      .values({
        ...data,
        unitPrice: data.unitPrice || "0",
        totalPrice: data.totalPrice || "0",
      })
      .returning();
    return billItem;
  }

  async deleteBillItem(id: string): Promise<boolean> {
    const billItemId = parseInt(id);
    if (isNaN(billItemId)) return false;
    
    const result = await db.delete(billItems).where(eq(billItems.id, billItemId));
    return result.rowCount > 0;
  }

  // Inventory Transactions
  async getInventoryTransactions(productId?: string): Promise<InventoryTransaction[]> {
    if (productId) {
      const id = parseInt(productId);
      if (isNaN(id)) return [];
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