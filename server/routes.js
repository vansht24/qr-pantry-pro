import { createServer } from "http";
import { storage } from "./storage.js";

export async function registerRoutes(app) {
  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      // Convert empty date strings to null to avoid database errors
      const productData = {
        ...req.body,
        manufacturing_date: req.body.manufacturing_date || null,
        expiry_date: req.body.expiry_date || null,
      };
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      // Convert empty date strings to null to avoid database errors
      const productData = {
        ...req.body,
        manufacturing_date: req.body.manufacturing_date || null,
        expiry_date: req.body.expiry_date || null,
      };
      
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Customers API
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customer = await storage.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // Bills API
  app.get("/api/bills", async (req, res) => {
    try {
      const bills = await storage.getBills();
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ error: "Failed to fetch bills" });
    }
  });

  app.get("/api/bills/today", async (req, res) => {
    try {
      const bills = await storage.getBillsForToday();
      res.json(bills);
    } catch (error) {
      console.error("Error fetching today's bills:", error);
      res.status(500).json({ error: "Failed to fetch today's bills" });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      const bill = await storage.createBill(req.body);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating bill:", error);
      res.status(500).json({ error: "Failed to create bill" });
    }
  });

  // Bill items API
  app.get("/api/bills/:billId/items", async (req, res) => {
    try {
      const items = await storage.getBillItems(req.params.billId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching bill items:", error);
      res.status(500).json({ error: "Failed to fetch bill items" });
    }
  });

  app.post("/api/bills/:billId/items", async (req, res) => {
    try {
      const item = await storage.createBillItem({
        ...req.body,
        bill_id: req.params.billId
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating bill item:", error);
      res.status(500).json({ error: "Failed to create bill item" });
    }
  });

  // Inventory transactions API
  app.get("/api/inventory/transactions", async (req, res) => {
    try {
      const productId = req.query.product_id;
      const transactions = await storage.getInventoryTransactions(productId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ error: "Failed to fetch inventory transactions" });
    }
  });

  app.post("/api/inventory/transactions", async (req, res) => {
    try {
      const transaction = await storage.createInventoryTransaction(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      res.status(500).json({ error: "Failed to create inventory transaction" });
    }
  });

  // Dashboard stats API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}