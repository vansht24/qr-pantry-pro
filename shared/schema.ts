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

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
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

// Zod Validation Schemas
export const userSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]).default("user"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().nullable().optional(),
  mrp: z.string(),
  buyingCost: z.string(),
  manufacturingDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  quantityInStock: z.number().int().min(0).default(0),
  minStockLevel: z.number().int().min(0).default(5),
  unit: z.string().default("piece"),
  description: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  qrCode: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertProductSchema = productSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const customerSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertCustomerSchema = customerSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const billSchema = z.object({
  id: z.number().optional(),
  billNumber: z.string().min(1),
  customerId: z.number().nullable().optional(),
  totalAmount: z.string(),
  discountAmount: z.string().default("0"),
  taxAmount: z.string().default("0"),
  finalAmount: z.string(),
  paymentMethod: z.enum(["cash", "card", "upi"]).nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertBillSchema = billSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const billItemSchema = z.object({
  id: z.number().optional(),
  billId: z.number(),
  productId: z.number(),
  quantity: z.number().int().min(1),
  unitPrice: z.string(),
  totalPrice: z.string(),
  createdAt: z.date().optional(),
});

export const insertBillItemSchema = billItemSchema.omit({ id: true, createdAt: true });

export const inventoryTransactionSchema = z.object({
  id: z.number().optional(),
  productId: z.number(),
  transactionType: z.enum(["purchase", "sale", "adjustment", "return"]),
  quantityChange: z.number().int(),
  referenceId: z.string().nullable().optional(),
  referenceType: z.enum(["bill", "purchase_order", "manual"]).nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.date().optional(),
});

export const insertInventoryTransactionSchema = inventoryTransactionSchema.omit({ id: true, createdAt: true });

// TypeScript Types
export type User = z.infer<typeof userSchema>;
export type Product = z.infer<typeof productSchema>;
export type Customer = z.infer<typeof customerSchema>;
export type Bill = z.infer<typeof billSchema>;
export type BillItem = z.infer<typeof billItemSchema>;
export type InventoryTransaction = z.infer<typeof inventoryTransactionSchema>;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertBillItem = z.infer<typeof insertBillItemSchema>;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;