export type StrainType = 'Indica' | 'Sativa' | 'Hybrid' | 'CBD';

export type CategoryType = 'Flower' | 'Edibles' | 'Concentrates' | 'Vapes' | 'CBD Wellness';

export interface Product {
  id: string;
  name: string;
  brand: string;
  strainType: StrainType;
  category: CategoryType;
  price: number;
  thcPercent: number;
  cbdPercent: number;
  stock: number;
  rating: number;
  reviewsCount: number;
  image: string;
  effects: string[];
  description: string;
  labResultsDoc?: string; // Simulated lab document summary
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  status: 'active' | 'blocked';
  addresses?: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  date: string;
  address: string;
  deliveryOption: 'pickup' | 'delivery';
  promoApplied?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Article {
  id: string;
  title: string;
  category: 'Education' | 'Responsible Use' | 'Strain Science';
  readTime: string;
  content: string;
  date: string;
  author: string;
  image: string;
}

export interface SalesStat {
  date: string;
  amount: number;
}

export interface DbState {
  products: Product[];
  orders: Order[];
  users: User[];
  reviews: Review[];
  articles: Article[];
  banner: string;
}
