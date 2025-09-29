import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "user"]).default("user"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const insertUserSchema = userSchema.omit({ id: true, created_at: true, updated_at: true });

// Product schema
export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  brand: z.string().nullable().optional(),
  mrp: z.string(),
  buying_cost: z.string(),
  manufacturing_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  quantity_in_stock: z.number().int().min(0).default(0),
  min_stock_level: z.number().int().min(0).default(5),
  unit: z.string().default("piece"),
  description: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  qr_code: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const insertProductSchema = productSchema.omit({ id: true, created_at: true, updated_at: true });

// Customer schema
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const insertCustomerSchema = customerSchema.omit({ id: true, created_at: true, updated_at: true });

// Bill schema
export const billSchema = z.object({
  id: z.string().optional(),
  bill_number: z.string().min(1),
  customer_id: z.string().nullable().optional(),
  total_amount: z.string(),
  discount_amount: z.string().default("0"),
  tax_amount: z.string().default("0"),
  final_amount: z.string(),
  payment_method: z.enum(["cash", "card", "upi"]).nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const insertBillSchema = billSchema.omit({ id: true, created_at: true, updated_at: true });

// Bill Item schema
export const billItemSchema = z.object({
  id: z.string().optional(),
  bill_id: z.string(),
  product_id: z.string(),
  quantity: z.number().int().min(1),
  unit_price: z.string(),
  total_price: z.string(),
  created_at: z.string().optional(),
});

export const insertBillItemSchema = billItemSchema.omit({ id: true, created_at: true });

// Inventory Transaction schema
export const inventoryTransactionSchema = z.object({
  id: z.string().optional(),
  product_id: z.string(),
  transaction_type: z.enum(["purchase", "sale", "adjustment", "return"]),
  quantity_change: z.number().int(),
  reference_id: z.string().nullable().optional(),
  reference_type: z.enum(["bill", "purchase_order", "manual"]).nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export const insertInventoryTransactionSchema = inventoryTransactionSchema.omit({ id: true, created_at: true });

// Type exports for JavaScript (these are just for documentation purposes)
export const UserType = "User";
export const ProductType = "Product";
export const CustomerType = "Customer";
export const BillType = "Bill";
export const BillItemType = "BillItem";
export const InventoryTransactionType = "InventoryTransaction";

export const InsertUserType = "InsertUser";
export const InsertProductType = "InsertProduct";
export const InsertCustomerType = "InsertCustomer";
export const InsertBillType = "InsertBill";
export const InsertBillItemType = "InsertBillItem";
export const InsertInventoryTransactionType = "InsertInventoryTransaction";