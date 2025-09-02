-- Create products table for inventory management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  barcode TEXT UNIQUE,
  qr_code TEXT UNIQUE,
  mrp DECIMAL(10,2) NOT NULL,
  buying_cost DECIMAL(10,2) NOT NULL,
  manufacturing_date DATE,
  expiry_date DATE,
  quantity_in_stock INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  unit TEXT DEFAULT 'piece',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table for billing transactions
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill_items table for individual items in a bill
CREATE TABLE public.bill_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_transactions table for stock movement tracking
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reference_type TEXT, -- 'purchase', 'sale', 'adjustment', 'expired'
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all operations for now, can be restricted later with user auth)
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bill_items" ON public.bill_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory_transactions" ON public.inventory_transactions FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate bill numbers
CREATE OR REPLACE FUNCTION public.generate_bill_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  bill_number TEXT;
BEGIN
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(bill_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.bills
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format: YYYYMMDD001, YYYYMMDD002, etc.
  bill_number := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(next_number::TEXT, 3, '0');
  
  RETURN bill_number;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Insert demo Indian grocery products
INSERT INTO public.products (name, category, brand, mrp, buying_cost, manufacturing_date, expiry_date, quantity_in_stock, unit, description) VALUES
-- Rice & Grains
('Basmati Rice', 'Rice & Grains', 'India Gate', 120.00, 100.00, '2024-01-15', '2025-01-15', 50, 'kg', 'Premium Basmati Rice 1kg'),
('Toor Dal', 'Pulses', 'Arhar', 150.00, 120.00, '2024-02-01', '2025-02-01', 30, 'kg', 'Organic Toor Dal 1kg'),
('Chana Dal', 'Pulses', 'Organic India', 140.00, 110.00, '2024-02-01', '2025-02-01', 25, 'kg', 'Premium Chana Dal'),

-- Oil & Ghee
('Sunflower Oil', 'Oil & Ghee', 'Fortune', 180.00, 150.00, '2024-01-20', '2025-01-20', 20, 'litre', 'Refined Sunflower Oil 1L'),
('Pure Ghee', 'Oil & Ghee', 'Amul', 550.00, 480.00, '2024-02-10', '2024-08-10', 15, 'kg', 'Pure Cow Ghee 1kg'),

-- Spices
('Turmeric Powder', 'Spices', 'Everest', 45.00, 35.00, '2024-01-01', '2025-01-01', 40, 'piece', 'Turmeric Powder 100g'),
('Red Chilli Powder', 'Spices', 'MDH', 50.00, 40.00, '2024-01-01', '2025-01-01', 35, 'piece', 'Red Chilli Powder 100g'),
('Garam Masala', 'Spices', 'Everest', 55.00, 45.00, '2024-01-15', '2025-01-15', 30, 'piece', 'Garam Masala Powder 100g'),

-- Dairy Products
('Milk', 'Dairy', 'Amul', 25.00, 22.00, '2024-01-30', '2024-02-02', 50, 'litre', 'Full Cream Milk 1L'),
('Paneer', 'Dairy', 'Mother Dairy', 80.00, 70.00, '2024-01-29', '2024-02-05', 20, 'piece', 'Fresh Paneer 200g'),
('Curd', 'Dairy', 'Amul', 30.00, 25.00, '2024-01-30', '2024-02-03', 25, 'piece', 'Fresh Curd 500g'),

-- Vegetables
('Onion', 'Vegetables', '', 40.00, 30.00, '2024-01-28', '2024-02-15', 100, 'kg', 'Fresh Red Onions'),
('Potato', 'Vegetables', '', 35.00, 25.00, '2024-01-25', '2024-03-01', 80, 'kg', 'Fresh Potatoes'),
('Tomato', 'Vegetables', '', 60.00, 45.00, '2024-01-30', '2024-02-10', 60, 'kg', 'Fresh Tomatoes'),

-- Snacks & Beverages
('Parle-G Biscuit', 'Snacks', 'Parle', 20.00, 15.00, '2024-01-01', '2024-07-01', 100, 'piece', 'Parle-G Glucose Biscuit'),
('Maggi Noodles', 'Instant Food', 'Nestle', 14.00, 12.00, '2024-01-10', '2024-07-10', 80, 'piece', 'Maggi 2-minute Noodles'),
('Tata Tea', 'Beverages', 'Tata', 180.00, 150.00, '2024-01-15', '2025-01-15', 40, 'piece', 'Tata Tea Premium 1kg'),

-- Personal Care
('Colgate Toothpaste', 'Personal Care', 'Colgate', 85.00, 70.00, '2024-01-01', '2025-01-01', 50, 'piece', 'Colgate Strong Teeth 200g'),
('Lifebuoy Soap', 'Personal Care', 'Lifebuoy', 35.00, 28.00, '2024-01-01', '2026-01-01', 60, 'piece', 'Lifebuoy Total Protection 125g');

-- Generate QR codes for products (simple format for now)
UPDATE public.products SET qr_code = 'QR-' || id::text;