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
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set - AI recommendations will use fallback');
      return null;
    }
    try {
      aiInstance = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'vercel-greenleaf',
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

app.post('/api/products', (req: Request, res: Response) => {
  const product = req.body;
  
  if (!product.name || !product.brand || !product.price || !product.category) {
    return res.status(400).json({ error: 'Missing required product information' });
  }

  const newId = `prod-${Date.now()}`;
  const newProduct = {
    id: newId,
    name: product.name,
    brand: product.brand,
    strainType: product.strainType || 'Hybrid',
    category: product.category,
    price: Number(product.price) || 0,
    thcPercent: Number(product.thcPercent) || 0,
    cbdPercent: Number(product.cbdPercent) || 0,
    stock: Number(product.stock) || 0,
    rating: 5.0,
    reviewsCount: 0,
    image: product.image || 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop',
    effects: product.effects || [],
    description: product.description || '',
    labResultsDoc: product.labResultsDoc || 'Passed laboratory tests',
  };

  db.products.push(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;

  const index = db.products.findIndex((prod) => prod.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = {
    ...db.products[index],
    ...updatedData,
    id, // protect id
  };

  db.products[index] = updatedProduct;
  saveDb(db);
  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.products.findIndex((prod) => prod.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deletedProduct = db.products[index];
  db.products.splice(index, 1);
  saveDb(db);
  res.json({ message: 'Product deleted successfully', id, product: deletedProduct });
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

app.put('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.orders[index].status = status;
  saveDb(db);
  res.json(db.orders[index]);
});

app.put('/api/users/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = db.users?.findIndex((u) => u.id === id) || -1;
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (db.users) {
    db.users[index].status = status;
    saveDb(db);
    res.json(db.users[index]);
  }
});

app.post('/api/articles', (req: Request, res: Response) => {
  const article = req.body;
  if (!article.id) {
    article.id = `article-${Date.now()}`;
  }
  if (!db.articles) db.articles = [];
  db.articles.push(article);
  saveDb(db);
  res.status(201).json(article);
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

// User Profile Update
app.put('/api/users/:id/profile', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, addresses } = req.body;

  const index = db.users?.findIndex((u) => u.id === id) || -1;
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (db.users) {
    if (name) db.users[index].name = name;
    if (addresses) db.users[index].addresses = addresses;
    saveDb(db);
    const { password: _, ...userWithoutPassword } = db.users[index];
    res.json(userWithoutPassword);
  }
});

// Product Reviews API
app.get('/api/reviews/:productId', (req: Request, res: Response) => {
  const { productId } = req.params;
  const productReviews = db.reviews.filter((r) => r.productId === productId);
  res.json(productReviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { productId, userName, rating, comment } = req.body;
  if (!productId || !userName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing review information' });
  }

  const newId = `rev-${Date.now()}`;
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

// AI Strain Sommelier Endpoint with Gemini API
app.post('/api/recommendations', async (req: Request, res: Response) => {
  const { mood, details, filterCategory } = req.body;

  if (!mood) {
    return res.status(400).json({ error: 'Mood selection is required.' });
  }

  let productsList: Product[] = db.products;

  // Try to use Gemini AI first
  const ai = getGeminiClient();
  
  if (ai) {
    try {
      // Construct catalog string
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
    "explanation": "A professional, warm, descriptive paragraph explaining why this specific strain matches their desired mood."
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

// Export for Vercel
export default app;

