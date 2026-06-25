import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { DbState, Product, Order, User, Review, Article } from '../src/types.js';

// Configuration
const PORT = 3000;
const DB_FILE = '/tmp/db.json';

// Initialize Express
const app = express();
app.use(express.json());

// Serve public folder (for favicon and static assets)
app.use(express.static(path.join(process.cwd(), 'public')));

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set - AI recommendations will use fallback system');
      return null;
    }
    try {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize Gemini client:', err);
      return null;
    }
  }
  return aiInstance;
}

// Default Seed Data
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
    labResultsDoc: 'THC: 18.5% | CBD: 0.1% | Terpenes: Myrcene, Pinene | Pesticides: None Detected | Heavy Metals: Passed',
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
    description: 'Fast-acting and energizing, Sour Diesel features a pungent, diesel-like aroma profile. Ideal for daytime relief, productivity, and fighting fatigue.',
    labResultsDoc: 'THC: 22.1% | CBD: 0.2% | Terpenes: Limonene, Caryophyllene | Pesticides: Passed | Heavy Metals: Passed',
  },
  {
    id: 'prod-3',
    name: 'Granddaddy Purple',
    brand: 'Sol Indicas',
    strainType: 'Indica',
    category: 'Flower',
    price: 48,
    thcPercent: 20.2,
    cbdPercent: 0.5,
    stock: 8,
    rating: 4.9,
    reviewsCount: 4,
    image: 'https://images.unsplash.com/photo-1556922443-41f6ca5f04cb?q=80&w=600&auto=format&fit=crop',
    effects: ['Relaxing', 'Sleepy', 'Pain Relief'],
    description: 'A famous pure Indica strain cross of Mendo Purps and Skunk. Delivers a potent fusion of cerebral euphoria and deep physical relaxation, perfect for combatting insomnia and chronic pain.',
    labResultsDoc: 'THC: 20.2% | CBD: 0.5% | Terpenes: Linalool, Myrcene | Pesticides: None Detected | Heavy Metals: Passed',
  },
  {
    id: 'prod-4',
    name: 'Wedding Cake Indica Hybrid',
    brand: 'Apex Farms',
    strainType: 'Hybrid',
    category: 'Flower',
    price: 52,
    thcPercent: 24.3,
    cbdPercent: 0.1,
    stock: 3,
    rating: 4.6,
    reviewsCount: 1,
    image: 'https://images.unsplash.com/photo-1568444438385-ecef1a33b54f?q=80&w=600&auto=format&fit=crop',
    effects: ['Relaxing', 'Happy', 'Euphoric'],
    description: 'Also known as Pink Cookies, Wedding Cake is a potent indica-dominant hybrid providing rich tangy flavors with earthy pepper undertones and a powerful full-body state.',
    labResultsDoc: 'THC: 24.3% | CBD: 0.1% | Terpenes: Limonene, Caryophyllene | Pesticides: Passed | Heavy Metals: Passed',
  },
  {
    id: 'prod-5',
    name: 'Sour Strawberry Gummies (100mg)',
    brand: 'Infusion Co',
    strainType: 'Hybrid',
    category: 'Edibles',
    price: 22,
    thcPercent: 10.0, // 10mg per piece, 100mg total
    cbdPercent: 1.0,
    stock: 50,
    rating: 4.5,
    reviewsCount: 2,
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=600&auto=format&fit=crop',
    effects: ['Relaxing', 'Happy', 'Laughing'],
    description: 'Infused with premium cannabis distillate, these delicious, chewable gummies are precise-dosed for a controlled, joyful experience.',
    labResultsDoc: '10mg THC per Gummy | 100mg package total | Solvent Residue: Passed | Microbiological: Passed',
  },
  {
    id: 'prod-6',
    name: 'Broad Spectrum Sleep Gelcaps',
    brand: 'PureCure CBD',
    strainType: 'CBD',
    category: 'CBD Wellness',
    price: 35,
    thcPercent: 0.3,
    cbdPercent: 25.0, // 25mg CBD per softgel
    stock: 12,
    rating: 4.8,
    reviewsCount: 1,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    effects: ['Sleepy', 'Relaxing', 'Pain Relief'],
    description: 'Broad-spectrum CBD infused with melatonin, chamomile, and L-theanine to promote deep, restorative sleep without any psychoactive high.',
    labResultsDoc: 'CBD: 25mg/softgel | THC: <0.3% | Pesticides: Passed | Heavy Metals: Passed | Microbes: Passed',
  },
  {
    id: 'prod-7',
    name: 'Pineapple Express Premium Cartridge',
    brand: 'ZenVapes',
    strainType: 'Sativa',
    category: 'Vapes',
    price: 40,
    thcPercent: 82.0,
    cbdPercent: 1.5,
    stock: 18,
    rating: 4.6,
    reviewsCount: 2,
    image: 'https://images.unsplash.com/photo-1556922443-c0d1645e5d3c?q=80&w=600&auto=format&fit=crop',
    effects: ['Uplifting', 'Focus', 'Creative'],
    description: 'A premium 1-gram 510-thread vape cartridge filled with pure Pineapple Express distillate. Rich in tropical terpenes for an uplifting daytime buzz.',
    labResultsDoc: 'THC: 82.0% | CBD: 1.5% | Heavy Metals: Passed | Vitamin E Acetate: None Detected | Pesticides: Passed',
  },
  {
    id: 'prod-8',
    name: 'Golden Lemon Live Resin Badder',
    brand: 'Apex Extracts',
    strainType: 'Indica',
    category: 'Concentrates',
    price: 60,
    thcPercent: 78.4,
    cbdPercent: 0.8,
    stock: 5,
    rating: 4.9,
    reviewsCount: 1,
    image: 'https://images.unsplash.com/photo-1541256996761-85df2ef31644?q=80&w=600&auto=format&fit=crop',
    effects: ['Euphoric', 'Relaxing', 'Sleepy'],
    description: 'Ultra-potent concentrate extracted from fresh-frozen Golden Lemon flower. Heavy limonene terpenes produce a sweet citrusy flavor with intense physical relaxation.',
    labResultsDoc: 'THC: 78.4% | CBD: 0.8% | Solvents: Passed | Terpenes: 6.2% total | Pesticides: Passed',
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@greenleaf.com',
    name: 'Grace Leaf (Admin)',
    role: 'admin',
    status: 'active',
    addresses: ['420 High St, San Francisco, CA'],
    createdAt: '2026-01-01T12:00:00Z',
  },
  {
    id: 'user-customer',
    email: 'user@greenleaf.com',
    name: 'Sean Miller',
    role: 'customer',
    status: 'active',
    addresses: ['710 Green Ave, Los Angeles, CA'],
    createdAt: '2026-02-15T14:30:00Z',
  },
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userName: 'Sean Miller',
    rating: 5,
    comment: 'Absolutely spectacular flower. Smells amazing and gives me the perfect daytime focus for creative projects without any paranoia.',
    date: '2026-05-10T08:30:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userName: 'Jessica K.',
    rating: 4,
    comment: 'Super solid sativa-dominant hybrid. Clean burn and sweet taste. Stock ran a bit low but the product itself is top notch.',
    date: '2026-06-01T10:15:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-3',
    userName: 'David T.',
    rating: 5,
    comment: 'The absolute king of sleepy indicas. Knocks me out within 30 minutes, and the pain relief is unbelievable. Beautiful purple buds.',
    date: '2026-05-20T22:00:00Z',
  },
  {
    id: 'rev-4',
    productId: 'prod-5',
    userName: 'Alice M.',
    rating: 4,
    comment: 'Tasty strawberry flavor with no weird aftertaste. Took about an hour to kick in, which was perfect. Highly recommend!',
    date: '2026-06-12T19:40:00Z',
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    userId: 'user-customer',
    customerName: 'Sean Miller',
    customerEmail: 'user@greenleaf.com',
    items: [
      { product: DEFAULT_PRODUCTS[0], quantity: 2 }, // 2x Blue Dream ($90)
      { product: DEFAULT_PRODUCTS[4], quantity: 1 }, // 1x Gummies ($22)
    ],
    total: 112,
    status: 'Delivered',
    date: '2026-06-18T15:20:00Z',
    address: '710 Green Ave, Los Angeles, CA',
    deliveryOption: 'delivery',
    promoApplied: 'WELCOME10',
  },
  {
    id: 'ord-1002',
    userId: 'user-customer',
    customerName: 'Sean Miller',
    customerEmail: 'user@greenleaf.com',
    items: [
      { product: DEFAULT_PRODUCTS[2], quantity: 1 }, // 1x Granddaddy Purple ($48)
      { product: DEFAULT_PRODUCTS[5], quantity: 1 }, // 1x Sleep Gelcaps ($35)
    ],
    total: 83,
    status: 'Processing',
    date: '2026-06-22T09:10:00Z',
    address: '710 Green Ave, Los Angeles, CA',
    deliveryOption: 'pickup',
  },
  {
    id: 'ord-1003',
    userId: 'user-customer',
    customerName: 'Sean Miller',
    customerEmail: 'user@greenleaf.com',
    items: [
      { product: DEFAULT_PRODUCTS[1], quantity: 1 }, // 1x Sour Diesel ($50)
    ],
    total: 50,
    status: 'Pending',
    date: '2026-06-23T20:45:00Z',
    address: '710 Green Ave, Los Angeles, CA',
    deliveryOption: 'delivery',
  },
];

const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Understanding Terpenes: The Secret to Cannabinoid Aroma & Effects',
    category: 'Strain Science',
    readTime: '5 min read',
    content: 'Terpenes are organic, aromatic compounds found in the oils of all flowers, including cannabis. They give strains their unique aroma—like the citrusy burst of Limonene or the pine scent of Pinene—and play a critical role in the "entourage effect," working synergistically with THC and CBD to shape your mental and physical experience.',
    date: '2026-05-15T12:00:00Z',
    author: 'Dr. Jane Terp',
    image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'art-2',
    title: 'Responsible Dosing: Edibles Safety & Timing for Beginners',
    category: 'Responsible Use',
    readTime: '4 min read',
    content: 'Edibles are highly convenient, but they behave very differently from inhalables. When ingested, THC is metabolized by your liver into 11-hydroxy-THC, which is significantly more psychoactive. It can take anywhere from 45 minutes to 2 hours to feel the full effects. The gold rule is: "Start Low and Go Slow." Begin with 2.5mg or 5mg, and wait at least 2 full hours before consuming more.',
    date: '2026-06-10T14:20:00Z',
    author: 'Leaf Advisor',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'art-3',
    title: 'Indica, Sativa, or Hybrid: Breaking Down the Classic Cannabis Classifications',
    category: 'Education',
    readTime: '6 min read',
    content: 'The division of cannabis into Indica, Sativa, and Hybrid has been the primary way consumers shop for decades. Traditionally, Sativas are known as cerebral, energizing daytime strains, while Indicas are associated with soothing, deeply relaxing nighttime effects. Hybrids offer a crossbreed of both worlds. However, modern research shows the strain\'s full terpene and cannabinoid profile actually dictates the experience far more than simple botany classifications.',
    date: '2026-06-20T09:30:00Z',
    author: 'Strain Sommelier',
    image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop',
  },
];

// Load Database State
function loadDb(): DbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading DB, restoring defaults', err);
  }
  // Write default state
  const defaultState: DbState = {
    products: DEFAULT_PRODUCTS,
    orders: DEFAULT_ORDERS,
    users: DEFAULT_USERS,
    reviews: DEFAULT_REVIEWS,
    articles: DEFAULT_ARTICLES,
    banner: '🌟 INTRODUCING BLUE DREAM HYBRID • POTENCY TESTED 18.5% THC • 10% OFF WITH COUPON "WELCOME10"',
  };
  saveDb(defaultState);
  return defaultState;
}

function saveDb(state: DbState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB to disk', err);
  }
}

// Ensure database file is initialized on load
let db = loadDb();

// Supabase configuration and client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'LEAF_ADMIN_2026';

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('✅ Supabase initialized successfully. Active database: Supabase.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err);
  }
} else {
  console.log('⚠️ Supabase environment variables not found. Active database: local JSON backup (db.json).');
}

// Database type mapping helpers
function mapDbUserToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as 'admin' | 'customer',
    status: row.status as 'active' | 'blocked',
    addresses: row.addresses || [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

function mapDbProductToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    strainType: row.strain_type || row.strainType,
    category: row.category,
    price: Number(row.price),
    thcPercent: Number(row.thc_percent ?? row.thcPercent ?? 0),
    cbdPercent: Number(row.cbd_percent ?? row.cbdPercent ?? 0),
    stock: Number(row.stock),
    rating: Number(row.rating ?? 5),
    reviewsCount: Number(row.reviews_count ?? row.reviewsCount ?? 0),
    image: row.image,
    effects: row.effects || [],
    description: row.description,
    labResultsDoc: row.lab_results_doc || row.labResultsDoc || '',
  };
}

function mapDbOrderToOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id || row.userId,
    customerName: row.customer_name || row.customerName,
    customerEmail: row.customer_email || row.customerEmail,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
    total: Number(row.total),
    status: row.status as 'Pending' | 'Processing' | 'Shipped' | 'Delivered',
    date: row.date,
    address: row.address,
    deliveryOption: (row.delivery_option || row.deliveryOption) as 'pickup' | 'delivery',
    promoApplied: row.promo_applied || row.promoApplied || '',
  };
}

function mapDbReviewToReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id || row.productId,
    userName: row.user_name || row.userName,
    rating: Number(row.rating),
    comment: row.comment,
    date: row.date,
  };
}

function mapDbArticleToArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    category: row.category as 'Education' | 'Responsible Use' | 'Strain Science',
    readTime: row.read_time || row.readTime,
    content: row.content,
    date: row.date,
    author: row.author,
    image: row.image,
  };
}

// Helper to extract role and user identity safely from request headers
const getRequestUser = (req: express.Request) => {
  const userId = (req.headers['x-user-id'] || 'guest') as string;
  const userRole = (req.headers['x-user-role'] || 'guest') as string;
  return { userId, userRole };
};

// --- REST API ENDPOINTS ---

// Auth Endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password, adminCode } = req.body;

  // Email and password are ALWAYS required
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (supabase) {
    try {
      const { data: user, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
      }

      // ALWAYS verify password first (no exceptions)
      if (password !== user.password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // THEN check admin code if user is admin
      if (user.role === 'admin') {
        if (!adminCode || adminCode.trim() !== ADMIN_ACCESS_CODE) {
          return res.status(401).json({ error: 'Admin authentication requires a valid Admin Access Code.' });
        }
      }

      return res.json({
        message: 'Login successful',
        user: mapDbUserToUser(user),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  // Find matching user in local memory
  const user = db.users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
  }

  // ALWAYS verify password
  const expectedPassword = (user as any).password;
  if (!expectedPassword || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // THEN verify admin code if user is admin
  if (user.role === 'admin') {
    if (!adminCode || adminCode.trim() !== ADMIN_ACCESS_CODE) {
      return res.status(401).json({ error: 'Admin authentication requires a valid Admin Access Code.' });
    }
  }

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      addresses: user.addresses || [],
    },
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, name, password, address, adminCode } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const emailLower = email.toLowerCase();
  const isTryingToBeAdmin = emailLower.includes('admin') || emailLower.endsWith('@greenleaf.com');

  // STRICT: If trying to be admin, REQUIRE correct admin code and verified credentials
  if (isTryingToBeAdmin || (adminCode && adminCode.trim() === ADMIN_ACCESS_CODE)) {
    if (!adminCode || adminCode.trim() !== ADMIN_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid Administrator Code. Contact Green Leaf Operations for a valid authorization token.' });
    }
    // Additional security: Admin email must contain 'admin' or be @greenleaf.com
    if (!isTryingToBeAdmin) {
      return res.status(403).json({ error: 'Admin registration is restricted to authorized administrative emails.' });
    }
  }

  const assignedRole = isTryingToBeAdmin ? 'admin' : 'customer';

  if (supabase) {
    try {
      // Check if email already exists
      const { data: existingUser, error: findErr } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const newId = `user-${Date.now()}`;
      const row = {
        id: newId,
        email,
        name,
        role: assignedRole,
        status: 'active',
        addresses: address ? [address] : [],
        password, // store as entered
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('users').insert([row]).select().single();
      if (error) return res.status(500).json({ error: error.message });

      return res.status(201).json({
        message: 'User registered successfully',
        user: mapDbUserToUser(data),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Local fallback
  const existing = db.users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    role: assignedRole,
    status: 'active',
    addresses: address ? [address] : [],
    createdAt: new Date().toISOString(),
  };

  const newUserWithPassword = {
    ...newUser,
    password,
  };

  db.users.push(newUserWithPassword as any);
  saveDb(db);

  res.status(201).json({
    message: 'User registered successfully',
    user: newUser,
  });
});

// Products API
app.get('/api/products', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data.map(mapDbProductToProduct));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(db.products);
});

app.post('/api/products', async (req, res) => {
  const { userRole } = getRequestUser(req);
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Only administrators can create products.' });
  }

  const product: Omit<Product, 'id' | 'rating' | 'reviewsCount'> = req.body;
  
  if (!product.name || !product.brand || !product.price || !product.category) {
    return res.status(400).json({ error: 'Missing required product information' });
  }

  const newId = `prod-${Date.now()}`;
  const row = {
    id: newId,
    name: product.name,
    brand: product.brand,
    strain_type: product.strainType || 'Hybrid',
    category: product.category,
    price: Number(product.price) || 0,
    thc_percent: Number(product.thcPercent) || 0,
    cbd_percent: Number(product.cbdPercent) || 0,
    stock: Number(product.stock) || 0,
    rating: 5.0,
    reviews_count: 0,
    image: product.image || 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop',
    effects: product.effects || [],
    description: product.description || '',
    lab_results_doc: product.labResultsDoc || 'Passed laboratory tests',
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').insert([row]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(mapDbProductToProduct(data));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newProduct: Product = {
    ...product,
    id: newId,
    rating: 5.0,
    reviewsCount: 0,
    stock: Number(product.stock) || 0,
    price: Number(product.price) || 0,
    thcPercent: Number(product.thcPercent) || 0,
    cbdPercent: Number(product.cbdPercent) || 0,
    effects: product.effects || [],
    labResultsDoc: product.labResultsDoc || 'Passed laboratory tests',
  };

  db.products.push(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', async (req, res) => {
  const { userRole } = getRequestUser(req);
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Only administrators can update products.' });
  }

  const { id } = req.params;
  const p = req.body;

  if (supabase) {
    try {
      const row: any = {};
      if (p.name !== undefined) row.name = p.name;
      if (p.brand !== undefined) row.brand = p.brand;
      if (p.strainType !== undefined) row.strain_type = p.strainType;
      if (p.category !== undefined) row.category = p.category;
      if (p.price !== undefined) row.price = Number(p.price);
      if (p.thcPercent !== undefined) row.thc_percent = Number(p.thcPercent);
      if (p.cbdPercent !== undefined) row.cbd_percent = Number(p.cbdPercent);
      if (p.stock !== undefined) row.stock = Number(p.stock);
      if (p.rating !== undefined) row.rating = Number(p.rating);
      if (p.reviewsCount !== undefined) row.reviews_count = Number(p.reviewsCount);
      if (p.image !== undefined) row.image = p.image;
      if (p.effects !== undefined) row.effects = p.effects;
      if (p.description !== undefined) row.description = p.description;
      if (p.labResultsDoc !== undefined) row.lab_results_doc = p.labResultsDoc;

      const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(mapDbProductToProduct(data));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const index = db.products.findIndex((prod) => prod.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct: Product = {
    ...db.products[index],
    ...p,
    id, // protect id
  };

  db.products[index] = updatedProduct;
  saveDb(db);
  res.json(updatedProduct);
});

app.delete('/api/products/:id', async (req, res) => {
  const { userRole } = getRequestUser(req);
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Only administrators can delete products.' });
  }

  const { id } = req.params;

  if (supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ message: 'Product deleted successfully', id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.products.splice(index, 1);
  saveDb(db);
  res.json({ message: 'Product deleted successfully', id });
});

// Orders API
app.get('/api/orders', async (req, res) => {
  const { userId, userRole } = getRequestUser(req);

  if (userRole === 'admin') {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data.map(mapDbOrderToOrder));
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }
    return res.json(db.orders);
  } else if (userRole === 'customer') {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data.map(mapDbOrderToOrder));
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }
    const filteredOrders = db.orders.filter((o) => o.userId === userId);
    return res.json(filteredOrders);
  } else {
    return res.json([]);
  }
});

app.post('/api/orders', async (req, res) => {
  const { userId, customerName, customerEmail, items, total, address, deliveryOption, promoApplied } = req.body;
  
  if (!customerName || !items || items.length === 0 || !total) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  if (supabase) {
    try {
      // Stock check and decrement
      for (const item of items) {
        const { data: pData, error: pErr } = await supabase.from('products').select('stock, name').eq('id', item.product.id).single();
        if (pErr || !pData) {
          return res.status(400).json({ error: `Product not found: ${item.product.name}` });
        }
        if (pData.stock < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${pData.name}. Only ${pData.stock} units remaining.` });
        }
        await supabase.from('products').update({ stock: pData.stock - item.quantity }).eq('id', item.product.id);
      }

      const orderId = `ord-${Date.now()}`;
      const row = {
        id: orderId,
        user_id: userId || 'guest',
        customer_name: customerName,
        customer_email: customerEmail,
        items: items, // jsonb handles structured arrays natively
        total: Number(total),
        status: 'Pending',
        date: new Date().toISOString(),
        address: address || 'Store Pickup',
        delivery_option: deliveryOption || 'delivery',
        promo_applied: promoApplied || null,
      };

      const { data, error } = await supabase.from('orders').insert([row]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(mapDbOrderToOrder(data));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Fallback stock decrement
  for (const item of items) {
    const productIndex = db.products.findIndex((p) => p.id === item.product.id);
    if (productIndex !== -1) {
      const p = db.products[productIndex];
      if (p.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${p.name}. Only ${p.stock} units remaining.` });
      }
      p.stock -= item.quantity;
    }
  }

  const newOrder: Order = {
    id: `ord-${1000 + db.orders.length + 1}`,
    userId: userId || 'guest',
    customerName,
    customerEmail,
    items,
    total,
    status: 'Pending',
    date: new Date().toISOString(),
    address: address || 'Store Pickup',
    deliveryOption,
    promoApplied,
  };

  db.orders.push(newOrder);
  saveDb(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', async (req, res) => {
  const { userRole } = getRequestUser(req);
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Only administrators can update order status.' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (supabase) {
    try {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(mapDbOrderToOrder(data));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.orders[index].status = status;
  saveDb(db);
  res.json(db.orders[index]);
});

// Users management for Admin
app.get('/api/users', async (req, res) => {
  const { userRole } = getRequestUser(req);
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Administrator privileges required.' });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data.map(mapDbUserToUser));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(db.users);
});

app.put('/api/users/:id/status', async (req, res) => {
  const { userRole } = getRequestUser(req);
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Administrator privileges required.' });
  }

  const { id } = req.params;
  const { status } = req.body; // 'active' | 'blocked'

  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').update({ status }).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(mapDbUserToUser(data));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.users[index].status = status;
  saveDb(db);
  res.json(db.users[index]);
});

app.put('/api/users/:id/profile', async (req, res) => {
  const { userId, userRole } = getRequestUser(req);
  const { id } = req.params;
  const { name, addresses } = req.body;

  if (userRole !== 'admin' && userId !== id) {
    return res.status(403).json({ error: 'Access Denied: You cannot edit another user\'s profile.' });
  }

  if (supabase) {
    try {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (addresses) updateData.addresses = addresses;

      const { data, error } = await supabase.from('users').update(updateData).eq('id', id).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(mapDbUserToUser(data));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) db.users[index].name = name;
  if (addresses) db.users[index].addresses = addresses;
  saveDb(db);
  res.json(db.users[index]);
});

// Product Reviews API
app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;

  if (supabase) {
    try {
      const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('date', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data.map(mapDbReviewToReview));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const productReviews = db.reviews.filter((r) => r.productId === productId);
  res.json(productReviews);
});

app.post('/api/reviews', async (req, res) => {
  const { productId, userName, rating, comment } = req.body;
  if (!productId || !userName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing review information' });
  }

  const newId = `rev-${Date.now()}`;
  const row = {
    id: newId,
    product_id: productId,
    user_name: userName,
    rating: Number(rating),
    comment,
    date: new Date().toISOString(),
  };

  if (supabase) {
    try {
      // Insert review
      const { data: revData, error: revErr } = await supabase.from('reviews').insert([row]).select().single();
      if (revErr) return res.status(500).json({ error: revErr.message });

      // Fetch all reviews for product to recalculate rating
      const { data: allRevs } = await supabase.from('reviews').select('rating').eq('product_id', productId);
      if (allRevs && allRevs.length > 0) {
        const sum = allRevs.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = Number((sum / allRevs.length).toFixed(1));
        
        await supabase.from('products').update({
          rating: avgRating,
          reviews_count: allRevs.length
        }).eq('id', productId);
      }

      return res.status(201).json(mapDbReviewToReview(revData));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newReview: Review = {
    id: newId,
    productId,
    userName,
    rating: Number(rating),
    comment,
    date: new Date().toISOString(),
  };

  db.reviews.push(newReview);

  // Recalculate product rating
  const pIndex = db.products.findIndex((p) => p.id === productId);
  if (pIndex !== -1) {
    const productReviews = db.reviews.filter((r) => r.productId === productId);
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    db.products[pIndex].rating = Number((sum / productReviews.length).toFixed(1));
    db.products[pIndex].reviewsCount = productReviews.length;
  }

  saveDb(db);
  res.status(201).json(newReview);
});

// Blog / Articles API
app.get('/api/articles', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('articles').select('*').order('date', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data.map(mapDbArticleToArticle));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(db.articles);
});

app.post('/api/articles', async (req, res) => {
  const article: Omit<Article, 'id' | 'date'> = req.body;
  if (!article.title || !article.content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newId = `art-${Date.now()}`;
  const row = {
    id: newId,
    title: article.title,
    category: article.category || 'Education',
    read_time: article.readTime || '3 min read',
    content: article.content,
    date: new Date().toISOString(),
    author: article.author || 'Staff Writer',
    image: article.image || 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
  };

  if (supabase) {
    try {
      const { data, error } = await supabase.from('articles').insert([row]).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(mapDbArticleToArticle(data));
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newArticle: Article = {
    ...article,
    id: newId,
    date: new Date().toISOString(),
    category: article.category || 'Education',
    readTime: article.readTime || '3 min read',
    author: article.author || 'Staff Writer',
    image: article.image || 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop',
  };

  db.articles.push(newArticle);
  saveDb(db);
  res.status(201).json(newArticle);
});

// AI Strain Sommelier Endpoint with Gemini API
app.post('/api/recommendations', async (req, res) => {
  const { mood, details, filterCategory } = req.body;

  if (!mood) {
    return res.status(400).json({ error: 'Mood selection is required.' });
  }

  let productsList: Product[] = db.products;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        productsList = data.map(mapDbProductToProduct);
      }
    } catch (err) {
      console.error('Error fetching products for AI sommelier context:', err);
    }
  }

  // Try to use Gemini AI first
  const ai = getGeminiClient();
  
  if (ai) {
    try {
      // Construct a beautiful rich system instruction describing GreenLeaf catalog and our requested mood/details
      const catalogString = productsList
        .map(
          (p) =>
            `ID: "${p.id}", Name: "${p.name}", Category: "${p.category}", Strain Type: "${p.strainType}", Price: $${p.price}, THC: ${p.thcPercent}%, CBD: ${p.cbdPercent}%, Effects: [${p.effects.join(', ')}], Description: "${p.description}"`
        )
        .join('\n');

      const systemPrompt = `You are an expert Cannabis Strain Sommelier at "GreenLeaf Dispensary", a premium, fully legal medical and adult-use dispensary.
Your goal is to suggest the absolute best cannabis products from our active dispensary catalog to match the user's specific state of mind, mood, or medical need.

Active catalog:
${catalogString}

The customer is seeking assistance:
- Desired State/Mood: "${mood}"
- Additional request details: "${details || 'None provided'}"
${filterCategory ? `- Category constraint: "${filterCategory}"` : ''}

Provide your suggestions in a strict, valid JSON format.
You must recommend EXACTLY 1 to 3 products from our active catalog that BEST match. Do not invent products.
Your response MUST be a valid JSON array of recommendation objects with this exact structure:
[
  {
    "productId": "id-of-matching-product",
    "score": 95,
    "headline": "A catchy, short sommelier title for this pairing",
    "explanation": "A professional, warm, descriptive paragraph explaining exactly why this specific strain matches their desired mood."
  }
]

CRITICAL: Return ONLY the JSON array. Do not wrap in markdown blocks. Must be directly JSON parsable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      let cleanText = response.text || '[]';
      // Clean potential codeblocks if returned despite instructions
      if (cleanText.includes('```json')) {
        cleanText = cleanText.split('```json')[1].split('```')[0].trim();
      } else if (cleanText.includes('```')) {
        cleanText = cleanText.split('```')[1].split('```')[0].trim();
      }

      const recommendations = JSON.parse(cleanText);
      return res.json(recommendations);
    } catch (error: any) {
      console.error('Gemini Recommendation Error:', error);
      // Fall through to local recommendations below
    }
  } else {
    console.log('Gemini AI not available - using local recommendation system');
  }

  // Fallback: Local recommendations without Gemini
  const localRecommendations = [];
  const normalizedMood = mood.toLowerCase();

  let matchedProducts = [...productsList];
  if (filterCategory) {
    matchedProducts = matchedProducts.filter(p => p.category === filterCategory);
  }

  // Smart mood-based filtering
  const sleepKeywords = ['sleep', 'insomnia', 'rest', 'tired', 'fatigue', 'relax', 'calm', 'stress', 'anxiety'];
  const energyKeywords = ['energy', 'focus', 'productive', 'work', 'creative', 'social', 'active', 'alert', 'awake'];
  const painKeywords = ['pain', 'ache', 'relief', 'muscle', 'inflammation', 'medical'];

  const isSleepMood = sleepKeywords.some(kw => normalizedMood.includes(kw));
  const isEnergyMood = energyKeywords.some(kw => normalizedMood.includes(kw));
  const isPainMood = painKeywords.some(kw => normalizedMood.includes(kw));

  let recommendedProducts = [];

  if (isSleepMood) {
    // Prefer Indica and high CBD
    recommendedProducts = matchedProducts.filter(p => 
      p.strainType === 'Indica' || 
      (p.strainType === 'Hybrid' && p.cbdPercent > 0.5) ||
      (p.strainType === 'CBD')
    ).slice(0, 3);
  } else if (isEnergyMood) {
    // Prefer Sativa and higher THC
    recommendedProducts = matchedProducts.filter(p => 
      p.strainType === 'Sativa' || 
      (p.strainType === 'Hybrid' && p.thcPercent > 18)
    ).slice(0, 3);
  } else if (isPainMood) {
    // Prefer balanced strains or high CBD
    recommendedProducts = matchedProducts.filter(p => 
      p.strainType === 'Indica' || 
      p.strainType === 'Hybrid' ||
      p.cbdPercent > 0.5
    ).slice(0, 3);
  } else {
    // Default: balanced recommendation
    recommendedProducts = matchedProducts.slice(0, 3);
  }

  // Build recommendation objects
  recommendedProducts.forEach((p, index) => {
    const score = 85 - (index * 5); // Decrease score for each recommendation
    let headline = 'Recommended Strain';
    let explanation = `${p.name} is available at GreenLeaf Dispensary. `;

    if (isSleepMood) {
      headline = index === 0 ? 'Your Evening Sanctuary' : 'A Peaceful Alternative';
      explanation += `With its ${p.strainType} profile and ${p.cbdPercent}% CBD, this strain is ideal for relaxation and quality rest.`;
    } else if (isEnergyMood) {
      headline = index === 0 ? 'Your Energy Boost' : 'A Productive Choice';
      explanation += `With its ${p.strainType} profile and ${p.thcPercent}% THC, this strain offers uplifting effects perfect for focus and creativity.`;
    } else if (isPainMood) {
      headline = index === 0 ? 'Your Relief Companion' : 'A Soothing Option';
      explanation += `With its ${p.strainType} profile and balanced cannabinoids, this strain is excellent for managing discomfort and inflammation.`;
    } else {
      explanation += `This ${p.strainType} strain brings ${p.effects.slice(0, 2).join(' and ')} effects that may suit your mood.`;
    }

    localRecommendations.push({
      productId: p.id,
      score,
      headline,
      explanation: explanation + ` Brand: ${p.brand} | Price: $${p.price}`,
    });
  });

  // If no products matched, return a generic recommendation
  if (localRecommendations.length === 0 && matchedProducts.length === 0 && productsList.length > 0) {
    const fallback = productsList[0];
    localRecommendations.push({
      productId: fallback.id,
      score: 75,
      headline: 'Featured Selection',
      explanation: `${fallback.name} from ${fallback.brand} is a great starting point for your wellness journey at GreenLeaf Dispensary.`,
    });
  }

  res.json(localRecommendations.slice(0, 3));
});

// CMS Banner endpoints (must be before Vite middleware)
app.get('/api/banner', async (req, res) => {
  try {
    let banner = db.banner || '🌟 INTRODUCING BLUE DREAM HYBRID • POTENCY TESTED 18.5% THC • 10% OFF WITH COUPON "WELCOME10"';

    if (supabase) {
      try {
        const { data, error } = await supabase.from('cms_settings').select('banner').single();
        if (!error && data) {
          banner = data.banner || banner;
        }
      } catch (err) {
        console.error('Error fetching banner from Supabase:', err);
      }
    }

    res.json({ banner });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/banner', async (req, res) => {
  const { banner } = req.body;
  if (typeof banner !== 'string') {
    return res.status(400).json({ error: 'Banner text is required and must be a string' });
  }

  try {
    db.banner = banner;
    saveDb(db);

    if (supabase) {
      try {
        const { error } = await supabase.from('cms_settings').upsert({ banner }).eq('id', 'banner');
        if (error) console.error('Error saving banner to Supabase:', error);
      } catch (err) {
        console.error('Error upserting banner to Supabase:', err);
      }
    }

    res.json({ banner: db.banner });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export for Vercel
export default app;
