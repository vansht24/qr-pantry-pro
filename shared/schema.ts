import { pgTable, text, serial, integer, boolean, decimal, timestamp, uuid, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  brand: text("brand"),
  barcode: text("barcode").unique(),
  qr_code: text("qr_code").unique(),
  mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
  buying_cost: decimal("buying_cost", { precision: 10, scale: 2 }).notNull(),
  manufacturing_date: date("manufacturing_date"),
  expiry_date: date("expiry_date"),
  quantity_in_stock: integer("quantity_in_stock").default(0),
  min_stock_level: integer("min_stock_level").default(5),
  unit: text("unit").default("piece"),
  description: text("description"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const bills = pgTable("bills", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bill_number: text("bill_number").notNull().unique(),
  customer_id: uuid("customer_id").references(() => customers.id),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discount_amount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  tax_amount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  final_amount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  payment_method: text("payment_method").default("cash"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const bill_items = pgTable("bill_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bill_id: uuid("bill_id").references(() => bills.id, { onDelete: 'cascade' }).notNull(),
  product_id: uuid("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const inventory_transactions = pgTable("inventory_transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  product_id: uuid("product_id").references(() => products.id).notNull(),
  transaction_type: text("transaction_type").notNull(), // 'in', 'out', 'adjustment'
  quantity: integer("quantity").notNull(),
  reference_type: text("reference_type"), // 'purchase', 'sale', 'adjustment', 'expired'
  reference_id: text("reference_id"),
  notes: text("notes"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products);
export const insertCustomerSchema = createInsertSchema(customers);
export const insertBillSchema = createInsertSchema(bills);
export const insertBillItemSchema = createInsertSchema(bill_items);
export const insertInventoryTransactionSchema = createInsertSchema(inventory_transactions);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type BillItem = typeof bill_items.$inferSelect;
export type InsertBillItem = z.infer<typeof insertBillItemSchema>;
export type InventoryTransaction = typeof inventory_transactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
