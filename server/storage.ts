import { db } from "./db";
import { 
  users, products, customers, bills, bill_items, inventory_transactions,
  type User, type InsertUser, type Product, type InsertProduct,
  type Customer, type InsertCustomer, type Bill, type InsertBill,
  type BillItem, type InsertBillItem, type InventoryTransaction, type InsertInventoryTransaction
} from "@shared/schema";
import { eq, desc, gte, lt, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Bill methods
  getBills(): Promise<Bill[]>;
  getBillsForToday(): Promise<Bill[]>;
  getBill(id: string): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  
  // Bill item methods
  getBillItems(billId: string): Promise<BillItem[]>;
  createBillItem(billItem: InsertBillItem): Promise<BillItem>;
  
  // Inventory transaction methods
  getInventoryTransactions(productId?: string): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
}

export class DrizzleStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer).returning();
    return result[0];
  }

  // Bill methods
  async getBills(): Promise<Bill[]> {
    return await db.select().from(bills).orderBy(desc(bills.created_at));
  }

  async getBillsForToday(): Promise<Bill[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return await db.select().from(bills)
      .where(and(
        gte(bills.created_at, startOfDay),
        lt(bills.created_at, endOfDay)
      ))
      .orderBy(desc(bills.created_at));
  }

  async getBill(id: string): Promise<Bill | undefined> {
    const result = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
    return result[0];
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const result = await db.insert(bills).values(bill).returning();
    return result[0];
  }

  // Bill item methods
  async getBillItems(billId: string): Promise<BillItem[]> {
    return await db.select().from(bill_items).where(eq(bill_items.bill_id, billId));
  }

  async createBillItem(billItem: InsertBillItem): Promise<BillItem> {
    const result = await db.insert(bill_items).values(billItem).returning();
    return result[0];
  }

  // Inventory transaction methods
  async getInventoryTransactions(productId?: string): Promise<InventoryTransaction[]> {
    if (productId) {
      return await db.select().from(inventory_transactions)
        .where(eq(inventory_transactions.product_id, productId))
        .orderBy(desc(inventory_transactions.created_at));
    }
    return await db.select().from(inventory_transactions)
      .orderBy(desc(inventory_transactions.created_at));
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const result = await db.insert(inventory_transactions).values(transaction).returning();
    return result[0];
  }
}

export const storage = new DrizzleStorage();
