export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  stock: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id?: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at?: string;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}
