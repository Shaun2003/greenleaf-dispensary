import type { Request, Response } from 'express';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { DbState, Product, Order, User, Review, Article } from '../src/types.js';

// Create Express app
const app = express();
app.use(express.json());

// Database path - use tmp directory for Vercel
const DB_FILE = '/tmp/db.json';

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'vercel-greenleaf',
        },
      },
    });
  }
  return aiInstance;
}

// Load/save database
function loadDb(): DbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading db.json:', e);
  }

  return {
    products: [],
    orders: [],
    users: [],
    reviews: [],
    articles: [],
    banner: '🌟 INTRODUCING BLUE DREAM HYBRID • POTENCY TESTED 18.5% THC • 10% OFF WITH COUPON "WELCOME10"',
  };
}

function saveDb(db: DbState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error saving db.json:', e);
  }
}

// Initialize with default data if needed
let db = loadDb();

// Default seed data
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Blue Dream Sativa Hybrid',
    brand: 'WestCoast Organics',
    strainType: 'Hybrid',
    category: 'Flower',
    price: 45,
    thcPercent: 18.5,
    cbdPercent: 0.1,
    stock: 24,
    rating: 4.8,
    reviewsCount: 3,
    image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop',
    effects: ['Uplifting', 'Creative', 'Relaxing'],
    description: 'A legendary West Coast strain, Blue Dream is a sativa-dominant hybrid featuring sweet berry aromas and a gentle, uplifting cerebral high coupled with smooth physical relaxation.',
    labResultsDoc: 'THC: 18.5% | CBD: 0.1% | Passed all tests',
  },
  {
    id: 'prod-2',
    name: 'Sour Diesel Premium',
    brand: 'Apex Farms',
    strainType: 'Sativa',
    category: 'Flower',
    price: 50,
    thcPercent: 22.1,
    cbdPercent: 0.2,
    stock: 15,
    rating: 4.7,
    reviewsCount: 2,
    image: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?q=80&w=600&auto=format&fit=crop',
    effects: ['Energizing', 'Focus', 'Happy'],
    description: 'Fast-acting and energizing, Sour Diesel features a pungent, diesel-like aroma profile.',
    labResultsDoc: 'THC: 22.1% | CBD: 0.2% | Passed all tests',
  },
];

// Ensure default products exist
if (!db.products || db.products.length === 0) {
  db.products = DEFAULT_PRODUCTS;
  saveDb(db);
}

// API Routes
app.get('/api/products', (req: Request, res: Response) => {
  res.json(db.products);
});

app.get('/api/articles', (req: Request, res: Response) => {
  res.json(db.articles || []);
});

app.get('/api/banner', (req: Request, res: Response) => {
  res.json({ banner: db.banner || '' });
});

app.put('/api/banner', (req: Request, res: Response) => {
  const { banner } = req.body;
  if (!banner) {
    return res.status(400).json({ error: 'Banner text is required' });
  }
  db.banner = banner;
  saveDb(db);
  res.json({ banner: db.banner });
});

app.get('/api/users', (req: Request, res: Response) => {
  res.json(db.users || []);
});

app.get('/api/orders', (req: Request, res: Response) => {
  res.json(db.orders || []);
});

app.post('/api/orders', (req: Request, res: Response) => {
  const order = req.body;
  if (!order.id) {
    order.id = `order-${Date.now()}`;
  }
  if (!db.orders) db.orders = [];
  db.orders.push(order);
  saveDb(db);
  res.json(order);
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, adminCode } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Find or create user
  let user = db.users?.find((u) => u.email === email);

  if (!user) {
    // Create new customer user
    user = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      password,
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    if (!db.users) db.users = [];
    db.users.push(user);
    saveDb(db);
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token: `token-${user.id}` });
  }

  // Verify password
  if (password !== user.password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Admin verification
  if (user.role === 'admin') {
    if (!adminCode || adminCode.trim() !== 'LEAF_ADMIN_2026') {
      return res.status(401).json({ error: 'Admin code required' });
    }
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token: `token-${user.id}` });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, adminCode } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (db.users?.find((u) => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const isAdmin = adminCode === 'LEAF_ADMIN_2026';

  const user: User = {
    id: `user-${Date.now()}`,
    email,
    name: email.split('@')[0],
    password,
    role: isAdmin ? 'admin' : 'customer',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  if (!db.users) db.users = [];
  db.users.push(user);
  saveDb(db);

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token: `token-${user.id}` });
});

// Export for Vercel
export default app;

