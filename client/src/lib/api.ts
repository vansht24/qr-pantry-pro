// API client to replace Supabase calls
const API_BASE = '/api';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  mrp: string;
  buying_cost: string;
  quantity_in_stock: number | null;
  min_stock_level: number | null;
  unit: string | null;
  expiry_date: string | null;
  qr_code: string | null;
  created_at: string;
  description?: string | null;
  manufacturing_date?: string | null;
  updated_at?: string;
  barcode?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Bill {
  id: string;
  bill_number: string;
  customer_id: string | null;
  total_amount: string;
  discount_amount: string | null;
  tax_amount: string | null;
  final_amount: string;
  payment_method: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  todaySales: number;
  totalRevenue: number;
  expiringProducts: number;
  totalCustomers: number;
  lowStockProducts: Product[];
  expiringProductsList: Product[];
}

class ApiClient {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.get<Product[]>('/products');
  }

  async getProduct(id: string): Promise<Product> {
    return this.get<Product>(`/products/${id}`);
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.post<Product>('/products', product);
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    return this.put<Product>(`/products/${id}`, product);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.get<Customer[]>('/customers');
  }

  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    return this.post<Customer>('/customers', customer);
  }

  // Bills
  async getBills(): Promise<Bill[]> {
    return this.get<Bill[]>('/bills');
  }

  async getTodayBills(): Promise<Bill[]> {
    return this.get<Bill[]>('/bills/today');
  }

  async createBill(bill: Partial<Bill>): Promise<Bill> {
    return this.post<Bill>('/bills', bill);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/dashboard/stats');
  }
}

export const api = new ApiClient();