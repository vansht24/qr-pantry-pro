import { z } from "zod";
import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  integer, 
  decimal, 
  date, 
  timestamp, 
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  mrp: decimal("mrp", { precision: 10, scale: 2 }).notNull(),
  buyingCost: decimal("buying_cost", { precision: 10, scale: 2 }).notNull(),
  manufacturingDate: date("manufacturing_date"),
  expiryDate: date("expiry_date"),
  quantityInStock: integer("quantity_in_stock").notNull().default(0),
  minStockLevel: integer("min_stock_level").notNull().default(5),
  unit: varchar("unit", { length: 50 }).notNull().default("piece"),
  description: text("description"),
  barcode: varchar("barcode", { length: 255 }),
  qrCode: varchar("qr_code", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  barcodeIdx: uniqueIndex("products_barcode_idx").on(table.barcode),
  nameIdx: index("products_name_idx").on(table.name),
  categoryIdx: index("products_category_idx").on(table.category),
}));

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  phoneIdx: index("customers_phone_idx").on(table.phone),
  emailIdx: index("customers_email_idx").on(table.email),
}));

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  billNumber: varchar("bill_number", { length: 100 }).notNull().unique(),
  customerId: integer("customer_id"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  billNumberIdx: uniqueIndex("bills_bill_number_idx").on(table.billNumber),
  customerIdx: index("bills_customer_idx").on(table.customerId),
  createdAtIdx: index("bills_created_at_idx").on(table.createdAt),
}));

export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  billIdx: index("bill_items_bill_idx").on(table.billId),
  productIdx: index("bill_items_product_idx").on(table.productId),
}));

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  transactionType: varchar("transaction_type", { length: 20 }).notNull(),
  quantityChange: integer("quantity_change").notNull(),
  referenceId: varchar("reference_id", { length: 100 }),
  referenceType: varchar("reference_type", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("inventory_transactions_product_idx").on(table.productId),
  createdAtIdx: index("inventory_transactions_created_at_idx").on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bills: many(bills),
}));

export const productsRelations = relations(products, ({ many }) => ({
  billItems: many(billItems),
  inventoryTransactions: many(inventoryTransactions),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bills: many(bills),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  customer: one(customers, {
    fields: [bills.customerId],
    references: [customers.id],
  }),
  billItems: many(billItems),
}));

export const billItemsRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  product: one(products, {
    fields: [billItems.productId],
    references: [products.id],
  }),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  product: one(products, {
    fields: [inventoryTransactions.productId],
    references: [products.id],
  }),
}));

// Auto-generated Zod schemas from Drizzle tables
export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

export const productSelectSchema = createSelectSchema(products);
export const productInsertSchema = createInsertSchema(products);

export const customerSelectSchema = createSelectSchema(customers);
export const customerInsertSchema = createInsertSchema(customers);

export const billSelectSchema = createSelectSchema(bills);
export const billInsertSchema = createInsertSchema(bills);

export const billItemSelectSchema = createSelectSchema(billItems);
export const billItemInsertSchema = createInsertSchema(billItems);

export const inventoryTransactionSelectSchema = createSelectSchema(inventoryTransactions);
export const inventoryTransactionInsertSchema = createInsertSchema(inventoryTransactions);

// TypeScript Types derived from tables
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type BillItem = typeof billItems.$inferSelect;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertProduct = typeof products.$inferInsert;
export type InsertCustomer = typeof customers.$inferInsert;
export type InsertBill = typeof bills.$inferInsert;
export type InsertBillItem = typeof billItems.$inferInsert;
export type InsertInventoryTransaction = typeof inventoryTransactions.$inferInsert;