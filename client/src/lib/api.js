// API client to replace Supabase calls
const API_BASE = '/api';

class ApiClient {
  async get(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }

  async post(endpoint, data) {
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

  async put(endpoint, data) {
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
  async getProducts() {
    return this.get('/products');
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(product) {
    return this.post('/products', product);
  }

  async updateProduct(id, product) {
    return this.put(`/products/${id}`, product);
  }

  // Customers
  async getCustomers() {
    return this.get('/customers');
  }

  async createCustomer(customer) {
    return this.post('/customers', customer);
  }

  // Bills
  async getBills() {
    return this.get('/bills');
  }

  async getTodayBills() {
    return this.get('/bills/today');
  }

  async createBill(bill) {
    return this.post('/bills', bill);
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }
}

export const api = new ApiClient();