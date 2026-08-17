export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  favorite_genres: string;
  favorite_authors: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  category: string | null;
  price: number | null;
  original_price: number | null;
  rating: number | null;
  image: string | null;
  description: string | null;
  publisher: string | null;
  language: string | null;
  pages: number | null;
  isbn: string | null;
  stock: number | null;
  created_at: string | null;
}

export interface CartItem {
  id: string;
  book_id: string;
  quantity: number;
  book: Book;
}

export interface OrderItem {
  id: string;
  book_id: string;
  quantity: number;
  price: number;
  title: string;
  author: string;
  image: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}
