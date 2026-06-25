import React, { useState, useEffect } from 'react';
import {
  Flame,
  Search,
  SlidersHorizontal,
  Plus,
  ShoppingBag,
  Star,
  Sparkles,
  BookOpen,
  User as UserIcon,
  ShoppingBag as CartIcon,
  Trash2,
  Heart,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  X,
  Sun,
  Moon,
  FileDown,
  Lock
} from 'lucide-react';

import { Product, Order, User, Article, CartItem } from './types';
import AgeGate from './components/AgeGate';
import Navbar from './components/Navbar';
import AISommelier from './components/AISommelier';
import Educate from './components/Educate';
import ProductDetailModal from './components/ProductDetailModal';
import AdminOverview from './components/AdminOverview';
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';
import AdminUsers from './components/AdminUsers';
import AdminSignup from './components/AdminSignup';

export const getAuthHeaders = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('greenleaf_user');
    if (saved) {
      const u = JSON.parse(saved);
      return {
        'x-user-id': u.id || 'guest',
        'x-user-role': u.role || 'guest',
      };
    }
  } catch (e) {
    console.error('Error fetching auth headers:', e);
  }
  return {
    'x-user-id': 'guest',
    'x-user-role': 'guest',
  };
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('greenleaf_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('greenleaf_theme', theme);
  }, [theme]);

  const [ageVerified, setAgeVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  // Cart & Wishlist with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    const userSaved = localStorage.getItem('greenleaf_user');
    const userObj = userSaved ? JSON.parse(userSaved) : null;
    const key = userObj ? `greenleaf_cart_${userObj.id}` : 'greenleaf_cart_guest';
    const saved = localStorage.getItem(key) || localStorage.getItem('greenleaf_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const userSaved = localStorage.getItem('greenleaf_user');
    const userObj = userSaved ? JSON.parse(userSaved) : null;
    const key = userObj ? `greenleaf_wishlist_${userObj.id}` : 'greenleaf_wishlist_guest';
    const saved = localStorage.getItem(key) || localStorage.getItem('greenleaf_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Active Session State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('greenleaf_user');
    return saved ? JSON.parse(saved) : null;
  });

  // UI Drawer/Modal Controllers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Home Banner state
  const [homepageBanner, setHomepageBanner] = useState('🌟 INTRODUCING BLUE DREAM HYBRID • POTENCY TESTED 18.5% THC • 10% OFF WITH COUPON "WELCOME10"');
  
  // Promo list state
  const [promoCodes, setPromoCodes] = useState([
    { code: 'WELCOME10', discount: 10 },
    { code: 'GREEN420', discount: 20 },
    { code: 'WELLNESS15', discount: 15 },
  ]);

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('user@greenleaf.com');
  const [loginPassword, setLoginPassword] = useState('user123');
  const [loginAdminCode, setLoginAdminCode] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regAdminCode, setRegAdminCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authRole, setAuthRole] = useState<'customer' | 'admin'>('customer');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Sync cart and wishlist changes to correct localStorage key
  useEffect(() => {
    const key = currentUser ? `greenleaf_cart_${currentUser.id}` : 'greenleaf_cart_guest';
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, currentUser]);

  useEffect(() => {
    const key = currentUser ? `greenleaf_wishlist_${currentUser.id}` : 'greenleaf_wishlist_guest';
    localStorage.setItem(key, JSON.stringify(wishlist));
  }, [wishlist, currentUser]);

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [profileUpdateError, setProfileUpdateError] = useState('');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState('');

  // Shop Filter UI Inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStrain, setFilterStrain] = useState('All');
  const [filterThc, setFilterThc] = useState(30); // Max THC filter
  const [sortOption, setSortOption] = useState('Default');

  // Checkout inputs
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('delivery');
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  // Admin sub-tab controller
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem('greenleaf_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('greenleaf_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('greenleaf_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('greenleaf_user');
    }
  }, [currentUser]);

  // Initial Fetch on startup
  useEffect(() => {
    fetchProducts();
    fetchArticles();
    fetchBanner();
  }, []);

  // Real-time database synchronization (polls every 5 seconds)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      fetchProducts();
      fetchArticles();
      fetchBanner();
      if (currentUser) {
        fetchOrders();
        if (currentUser.role === 'admin') {
          fetchUsers();
        }
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [currentUser]);

  // Refresh role-specific datasets when currentUser session changes
  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, [currentUser]);

  // Restrict Admin tab access so only authorized admins can access and stay on it
  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role !== 'admin') {
      setActiveTab('shop');
    }
  }, [activeTab, currentUser]);

  const fetchProducts = async () => {
    try {
      const r = await fetch('/api/products');
      if (r.ok) setProducts(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const r = await fetch('/api/orders', {
        headers: { ...getAuthHeaders() },
      });
      if (r.ok) setOrders(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const r = await fetch('/api/users', {
        headers: { ...getAuthHeaders() },
      });
      if (r.ok) setUsers(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchArticles = async () => {
    try {
      const r = await fetch('/api/articles');
      if (r.ok) setArticles(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBanner = async () => {
    try {
      const r = await fetch('/api/banner');
      if (r.ok) {
        const data = await r.json();
        setHomepageBanner(data.banner);
      }
    } catch (e) {
      console.error('Error fetching banner:', e);
    }
  };

  const updateBannerServer = async (bannerText: string) => {
    try {
      const r = await fetch('/api/banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banner: bannerText }),
      });
      if (r.ok) {
        const data = await r.json();
        setHomepageBanner(data.banner);
        return true;
      }
    } catch (e) {
      console.error('Error updating banner:', e);
    }
    return false;
  };

  // Switch sandbox user sessions easily for grading/auditing
  const handleSwitchUser = async (role: 'guest' | 'customer' | 'admin') => {
    if (role === 'guest') {
      setCurrentUser(null);
      setActiveTab('shop');
      return;
    }

    if (role === 'admin') {
      setCurrentUser(null);
      setActiveTab('admin_signup');
      return;
    }

    try {
      const email = 'user@greenleaf.com';
      const password = 'user123';
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setActiveTab('shop');
      }
    } catch (e) {
      console.error('Error switching sandbox profiles:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('shop');
  };

  // Auth Submit Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword, adminCode: loginAdminCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }

      setCurrentUser(data.user);
      setAuthSuccess('Login successful!');
      setTimeout(() => {
        setAuthSuccess('');
        setLoginAdminCode('');
        setActiveTab('shop');
      }, 800);
    } catch (err) {
      setAuthError('Backend offline. Please try switching accounts on the Sandbox switcher inside the User menu.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!regEmail || !regName || !regPassword) {
      setAuthError('Please fill in Name, Email, and Password.');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          name: regName,
          password: regPassword,
          address: regAddress,
          adminCode: regAdminCode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Registration failed.');
        return;
      }

      setCurrentUser(data.user);
      setAuthSuccess('Account registered and logged in successfully!');
      setTimeout(() => {
        setAuthSuccess('');
        setActiveTab('shop');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegAddress('');
        setRegAdminCode('');
      }, 1000);
    } catch (err) {
      setAuthError('Server communication failed.');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateError('');
    setProfileUpdateSuccess('');
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: editName,
          addresses: [editAddress]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedUser = data;
      localStorage.setItem('greenleaf_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setProfileUpdateSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileUpdateError(err.message || 'An error occurred.');
    }
  };

  const handleDownloadSlip = (order: Order) => {
    const lines = [];
    lines.push(`==================================================`);
    lines.push(`               GREEN LEAF DISPENSARY              `);
    lines.push(`              HIGH-CRAFT CANNABIS CO.             `);
    lines.push(`==================================================`);
    lines.push(`Receipt ID : ${order.id}`);
    lines.push(`Date       : ${new Date(order.date).toLocaleString()}`);
    lines.push(`Fulfillment: ${order.deliveryOption === 'delivery' ? 'Courier Delivery' : 'In-Store Pickup'}`);
    lines.push(`Customer   : ${order.customerName}`);
    lines.push(`Email      : ${order.customerEmail}`);
    if (order.deliveryOption === 'delivery') {
      lines.push(`Address    : ${order.address}`);
    }
    lines.push(`--------------------------------------------------`);
    lines.push(`ITEMS ORDERED:`);
    order.items.forEach((item, index) => {
      const p = item.product;
      const itemSubtotal = p.price * item.quantity;
      lines.push(`${index + 1}. ${p.name}`);
      lines.push(`   Category: ${p.category} | Type: ${p.strainType}`);
      lines.push(`   ${item.quantity}x @ R${p.price}              Subtotal: R${itemSubtotal}`);
    });
    lines.push(`--------------------------------------------------`);
    if (order.promoApplied) {
      lines.push(`Promo Code Applied: ${order.promoApplied}`);
    }
    lines.push(`GRAND TOTAL: R${order.total}`);
    lines.push(`==================================================`);
    lines.push(`            Thank you for shopping at             `);
    lines.push(`               Green Leaf Dispensary              `);
    lines.push(`             Please consume responsibly.          `);
    lines.push(`==================================================`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GreenLeaf_Receipt_${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Shopping Cart CRUD operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stock === 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const finalQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: finalQty } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    const finalQty = Math.min(qty, product.stock);
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: finalQty } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Coupon promo checker
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    const found = promoCodes.find((p) => p.code === couponCode.toUpperCase().trim());
    if (found) {
      setAppliedPromo(found);
    } else {
      setCheckoutError('Invalid coupon code. Try "WELCOME10" or "GREEN420".');
    }
  };

  // Placing Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!checkoutName.trim() || !checkoutEmail.trim()) {
      setCheckoutError('Please provide your name and email address.');
      return;
    }

    if (deliveryOption === 'delivery' && !shippingAddress.trim()) {
      setCheckoutError('Shipping address is required for home delivery.');
      return;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = appliedPromo ? (subtotal * appliedPromo.discount) / 100 : 0;
    const finalTotal = Number((subtotal - discount).toFixed(2));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          userId: currentUser?.id || 'guest',
          customerName: checkoutName.trim(),
          customerEmail: checkoutEmail.trim(),
          items: cart,
          total: finalTotal,
          address: deliveryOption === 'delivery' ? shippingAddress.trim() : 'Store Pickup (GreenLeaf HQ)',
          deliveryOption,
          promoApplied: appliedPromo?.code || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setCheckoutError(data.error || 'Failed to file your order.');
        return;
      }

      setConfirmedOrder(data);
      setCart([]);
      setAppliedPromo(null);
      setCouponCode('');
      setCheckoutName('');
      setCheckoutEmail('');
      setShippingAddress('');
      
      // Refresh inventory stock
      fetchProducts();
      fetchOrders();
      setActiveTab('order_confirmation');
    } catch (err) {
      setCheckoutError('Payment gateway simulator failed. Please try again.');
    }
  };

  // --- ADMIN PANEL API TRIGGERS ---

  const handleCreateProduct = async (payload: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProduct = async (id: string, payload: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestockProduct = async (productId: string, amount: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const nextStock = product.stock + amount;
    handleUpdateProduct(productId, { stock: nextStock });
  };

  const handleUpdateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchOrders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserStatus = async (id: string, status: 'active' | 'blocked') => {
    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPromo = (code: string, discount: number) => {
    setPromoCodes((prev) => [...prev, { code, discount }]);
  };

  const handleRemovePromo = (code: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.code !== code));
  };

  // --- FILTERED CUSTOMER DISPENSARY STOCK ---

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesStrain = filterStrain === 'All' || p.strainType === filterStrain;
    const matchesThc = p.thcPercent <= filterThc;

    return matchesSearch && matchesCategory && matchesStrain && matchesThc;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'Price: Low-to-High') return a.price - b.price;
    if (sortOption === 'Price: High-to-Low') return b.price - a.price;
    if (sortOption === 'Potency') return b.thcPercent - a.thcPercent;
    if (sortOption === 'Rating') return b.rating - a.rating;
    return 0; // Default
  });

  // Billing Math
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartDiscount = appliedPromo ? (cartSubtotal * appliedPromo.discount) / 100 : 0;
  const cartGrandTotal = Number((cartSubtotal - cartDiscount).toFixed(2));

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-dark font-sans selection:bg-brand-green selection:text-white overflow-hidden">
      {/* Dynamic Ambient Blur Glow Blobs */}
      <div className="absolute top-[5%] left-[-15%] w-[45rem] h-[45rem] rounded-full bg-brand-green/10 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-15%] w-[50rem] h-[50rem] rounded-full bg-brand-gold/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[30%] w-[35rem] h-[35rem] rounded-full bg-brand-muted-green/8 blur-[120px] pointer-events-none -z-10" />

      {/* 1. Age Verification Gate modal */}
      {!ageVerified && <AgeGate onVerified={() => setAgeVerified(true)} />}

      {/* 2. Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        onOpenCart={() => setIsCartOpen(true)}
        adminSubTab={adminSubTab}
        setAdminSubTab={setAdminSubTab}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      />

      {/* 3. Main Route/Tab Switches */}
      <main className="pb-16">
        
        {/* --- ROUTE 1: SHOP FRONTEND --- */}
        {activeTab === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* CMS Marketing Banner */}
            <div className="bg-[#E8E8DF] border border-brand-border rounded-xl p-4 text-center text-xs sm:text-sm tracking-wide font-medium text-brand-green flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 fill-brand-green/20 text-brand-green animate-pulse" />
              {homepageBanner}
            </div>

            {/* Premium Dispensary Hero */}
            <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#4B6344] to-[#2F3E30] p-8 sm:p-12 shadow-md">
              <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-xl space-y-4">
                <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#F5F5F0] tracking-tight leading-tight">
                  Premium Organics,<br />Sourced with Integrity.
                </h1>
                <p className="text-[#C7D1C3] text-xs sm:text-sm uppercase tracking-[0.2em] font-medium font-mono">
                  Featured: Blue Dream Hybrid • 18% THC
                </p>
                <button
                  onClick={() => setActiveTab('sommelier')}
                  className="px-6 py-2.5 rounded-full bg-[#F5F5F0] hover:bg-white text-brand-green font-bold text-xs tracking-widest uppercase shadow-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> ASK THE AI SOMMELIER
                </button>
              </div>
            </div>

            {/* Search, Filter & Grid Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
              
              {/* Filter sidebar - responsive */}
              <div className="lg:col-span-1 glass-light rounded-[24px] p-4 sm:p-5 lg:p-6 space-y-5 lg:space-y-6 shadow-sm text-brand-dark max-h-fit sticky top-20 lg:top-20">
                
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <h3 className="font-sans font-bold text-brand-dark text-xs sm:text-sm flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-brand-green" /> Filter Menu
                  </h3>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('All');
                      setFilterStrain('All');
                      setFilterThc(30);
                    }}
                    className="text-[10px] text-brand-muted-green hover:text-brand-dark font-mono uppercase cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search Bar */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                    Search Strains
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-muted-green" />
                    <input
                      type="text"
                      placeholder="e.g. Kush, Sour, sleep..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none text-brand-dark rounded-lg placeholder:text-brand-muted-green/70"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                    Product Forms
                  </label>
                  <div className="flex flex-col gap-1">
                    {['All', 'Flower', 'Edibles', 'Concentrates', 'Vapes', 'CBD Wellness'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`text-left text-xs py-1.5 px-2.5 rounded-lg transition-all cursor-pointer ${
                          filterCategory === cat
                            ? 'bg-[#E8E8DF] border border-brand-border text-brand-green font-semibold'
                            : 'text-brand-dark opacity-75 hover:bg-brand-bg hover:opacity-100'
                        }`}
                      >
                        {cat === 'All' ? 'All Products' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strain Genetics classification */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                    Genetics Profile
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Indica', 'Sativa', 'Hybrid', 'CBD'].map((str) => (
                      <button
                        key={str}
                        onClick={() => setFilterStrain(str)}
                        className={`px-3 py-1 text-xs rounded-lg border font-mono transition-all cursor-pointer ${
                          filterStrain === str
                            ? 'bg-brand-green text-white border-brand-green font-bold'
                            : 'bg-brand-bg border-brand-border text-brand-dark opacity-80 hover:bg-brand-border'
                        }`}
                      >
                        {str}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Potency Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">
                    <span>Max THC Potency</span>
                    <span className="text-brand-green font-bold">{filterThc}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={filterThc}
                    onChange={(e) => setFilterThc(Number(e.target.value))}
                    className="w-full accent-brand-green"
                  />
                  <div className="flex items-center justify-between text-[8px] text-brand-muted-green font-mono">
                    <span>0% (CBD ONLY)</span>
                    <span>30% (HIGH POTENCY)</span>
                  </div>
                </div>

              </div>

              {/* Product Grid section */}
              <div className="lg:col-span-3 space-y-6">
                        {/* Header listing total and sorting */}
                <div className="flex items-center justify-between bg-white rounded-lg border border-brand-border px-4 py-3 text-xs">
                  <p className="text-brand-muted-green font-mono">
                    Showing <span className="text-brand-dark font-bold">{sortedProducts.length}</span> verified results
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-brand-muted-green font-mono text-[10px] uppercase">Sort</span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="bg-transparent text-brand-dark focus:outline-none cursor-pointer font-sans font-medium"
                    >
                      <option value="Default">Default potencies</option>
                      <option value="Price: Low-to-High">Price: Low-to-High</option>
                      <option value="Price: High-to-Low">Price: High-to-Low</option>
                      <option value="Potency">THC: High-to-Low</option>
                      <option value="Rating">Rating: High-to-Low</option>
                    </select>
                  </div>
                </div>

                {/* Cards Grid */}
                {sortedProducts.length === 0 ? (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white border border-brand-border rounded-xl space-y-2">
                    <AlertCircle className="w-8 h-8 text-brand-muted-green" />
                    <h3 className="font-serif text-brand-dark font-bold text-sm">No Products Found</h3>
                    <p className="text-xs text-brand-muted-green max-w-xs leading-relaxed font-sans">
                      No cannabis products match your requested filters. Try widening your search queries or resetting filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {sortedProducts.map((p) => {
                      const isWishlisted = wishlist.some((item) => item.id === p.id);
                      return (
                        <div
                          key={p.id}
                          className="glass-light rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                        >
                          <div>
                            <div className="w-full aspect-square bg-brand-bg rounded-[20px] mb-4 flex items-center justify-center relative overflow-hidden">
                              <img
                                src={p.image}
                                alt={p.name}
                                onClick={() => setSelectedProduct(p)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                              />
                              {/* Genetics badge overlay */}
                              <span className="absolute top-3 left-3 bg-brand-green text-[#F5F5F0] text-[9px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                                {p.strainType}
                              </span>
                              {/* Stock warning */}
                              {p.stock === 0 ? (
                                <span className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center text-xs font-mono font-bold text-red-600 uppercase tracking-widest">
                                  Out of Stock
                                </span>
                              ) : p.stock <= 5 ? (
                                <span className="absolute top-3 right-3 bg-red-50 border border-red-200 text-red-600 font-mono text-[8px] font-bold px-2 py-0.5 rounded animate-pulse">
                                  Limited Stock ({p.stock})
                                </span>
                              ) : null}
                            </div>

                            <div className="space-y-1">
                              <p className="text-[10px] text-brand-muted-green font-mono uppercase tracking-widest">
                                {p.brand} • {p.category}
                              </p>
                              <h3
                                onClick={() => setSelectedProduct(p)}
                                className="font-serif text-lg text-brand-dark group-hover:text-brand-green cursor-pointer transition-colors font-bold truncate"
                                title={p.name}
                              >
                                {p.name}
                              </h3>
                              
                              {/* Rating & reviews summary */}
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="flex text-brand-gold">
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </div>
                                <span className="text-brand-dark font-mono font-semibold">{p.rating}</span>
                                <span className="text-brand-muted-green">({p.reviewsCount})</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-brand-bg flex items-center justify-between">
                            <div>
                              <p className="text-[9px] text-brand-muted-green font-mono uppercase leading-none">Price</p>
                              <p className="text-xl font-bold text-brand-dark mt-1">R{p.price}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleWishlist(p)}
                                className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                                  isWishlisted
                                    ? 'bg-rose-50 border-rose-200 text-rose-500 animate-pulse'
                                    : 'bg-white border-brand-border text-brand-muted-green hover:text-brand-dark hover:bg-brand-bg'
                                }`}
                                title="Add to wishlist"
                              >
                                <Heart className="w-4 h-4 fill-current" />
                              </button>
                              <button
                                onClick={() => handleAddToCart(p)}
                                disabled={p.stock === 0}
                                className="w-10 h-10 bg-brand-green hover:bg-brand-green-dark text-white rounded-full flex items-center justify-center text-xl transition-colors cursor-pointer disabled:bg-brand-tag disabled:text-brand-muted-green"
                                title="Add to Cart"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* --- ROUTE 2: AI SOMMELIER --- */}
        {activeTab === 'sommelier' && (
          <AISommelier
            products={products}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* --- ROUTE 3: LEARN & EDUCATE --- */}
        {activeTab === 'educate' && (
          <Educate articles={articles} />
        )}

        {/* --- ROUTE 4: WISHLIST --- */}
        {activeTab === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-brand-dark">MY WISHLIST</h1>
              <p className="text-xs text-brand-muted-green font-mono">Your saved items and favorite strains</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white border border-brand-border rounded-[24px] space-y-2">
                <Heart className="w-8 h-8 text-brand-muted-green" />
                <p className="text-xs text-brand-muted-green leading-relaxed font-sans">
                  Your wishlist is empty. Explore our catalog and save favorite strains!
                </p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-6 py-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-full font-sans cursor-pointer transition-colors"
                >
                  GO BACK TO SHOP
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                {wishlist.map((p) => (
                  <div key={p.id} className="glass-light rounded-[24px] p-5 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="aspect-square rounded-[16px] overflow-hidden bg-brand-bg border border-brand-border">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[9px] text-brand-muted-green font-mono uppercase tracking-widest">{p.category}</p>
                        <h4 className="font-serif font-bold text-brand-dark text-sm truncate mt-0.5">{p.name}</h4>
                        <p className="text-brand-dark font-mono text-xs mt-1 font-bold">R{p.price}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-brand-bg">
                      <button
                        onClick={() => handleToggleWishlist(p)}
                        className="p-2.5 rounded-full border border-brand-border text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="flex-1 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-full font-sans cursor-pointer transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- ROUTE 5: CHECKOUT FLOW --- */}
        {activeTab === 'checkout' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {!currentUser ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 glass-light border border-brand-border rounded-[24px] space-y-4 max-w-md mx-auto my-12">
                <div className="w-16 h-16 bg-brand-bg border border-brand-border rounded-full flex items-center justify-center text-rose-500 shadow-xs">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-dark">REGISTRATION REQUIRED</h3>
                <p className="text-xs text-brand-muted-green leading-relaxed font-sans">
                  In compliance with state regulations, guest checkout is restricted. Please sign in or register to place your order.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthRole('customer');
                    setAuthMode('login');
                    setAuthError('Please sign in or register to continue to checkout.');
                    setActiveTab('login_screen');
                  }}
                  className="w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-full font-sans cursor-pointer transition-all"
                >
                  SIGN IN OR REGISTER
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-brand-dark">SECURE CHECKOUT</h1>
                  <p className="text-xs text-brand-muted-green font-mono">Simulated bank compliant payment portal</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Form panel */}
              <form onSubmit={handlePlaceOrder} className="md:col-span-2 glass-light rounded-[24px] p-6 space-y-6 shadow-sm text-brand-dark">
                <h3 className="font-serif text-base font-bold text-brand-dark border-b border-brand-bg pb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-brand-green" /> Compliance & Shipping details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Your Full Name</label>
                    <input
                      type="text"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="e.g. Sean Miller"
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Your Email (Order confirmation)</label>
                    <input
                      type="email"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="e.g. user@greenleaf.com"
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Select Fulfillment Option</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('delivery')}
                      className={`p-3.5 rounded-xl border text-center font-mono cursor-pointer transition-all ${
                        deliveryOption === 'delivery'
                          ? 'bg-[#E8E8DF] border-brand-border text-brand-dark font-bold'
                          : 'bg-brand-bg border border-brand-border text-brand-dark opacity-80 hover:opacity-100'
                      }`}
                    >
                      <p className="text-xs font-bold">Courier Delivery</p>
                      <p className="text-[9px] text-brand-muted-green mt-0.5">Discreet state-registered delivery</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('pickup')}
                      className={`p-3.5 rounded-xl border text-center font-mono cursor-pointer transition-all ${
                        deliveryOption === 'pickup'
                          ? 'bg-[#E8E8DF] border-brand-border text-brand-dark font-bold'
                          : 'bg-brand-bg border border-brand-border text-brand-dark opacity-80 hover:opacity-100'
                      }`}
                    >
                      <p className="text-xs font-bold">In-Store Pickup</p>
                      <p className="text-[9px] text-brand-muted-green mt-0.5">Pick up at GreenLeaf HQ in 15m</p>
                    </button>
                  </div>
                </div>

                {deliveryOption === 'delivery' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Shipping Street Address</label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="e.g. 710 Green Ave, Los Angeles, CA"
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:border-brand-green focus:outline-none rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>
                )}

                {/* Simulated Payment */}
                <div className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-brand-green font-mono uppercase">
                    <span>Payment Simulator</span>
                    <span className="text-brand-green font-bold">✓ Cash on Delivery / In-Store Card</span>
                  </div>
                  <p className="text-xs text-brand-dark/80 leading-relaxed">
                    Due to federal banking regulations regarding adult-use cannabis products, payments are securely processed as **Cash / Debit upon Delivery** or physical swipe in-store. No charge is made to your browser.
                  </p>
                </div>

                {checkoutError && <p className="text-xs text-red-500 font-mono">{checkoutError}</p>}

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-full font-sans tracking-wider text-xs uppercase cursor-pointer transition-all shadow-md"
                >
                  PLACE SECURE ORDER (R{cartGrandTotal})
                </button>
              </form>

              {/* Bill breakdown */}
              <div className="md:col-span-1 glass-light rounded-[24px] p-5 space-y-4 shadow-sm text-brand-dark">
                <h4 className="font-serif font-bold text-brand-dark text-xs uppercase tracking-widest font-mono border-b border-brand-bg pb-2">
                  Order Summary
                </h4>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-start justify-between gap-2 text-xs">
                      <div>
                        <p className="font-semibold text-brand-dark max-w-[150px] truncate">{item.product.name}</p>
                        <p className="text-[10px] text-brand-muted-green font-mono">{item.quantity}x @ R{item.product.price}</p>
                      </div>
                      <span className="font-mono text-brand-dark">R{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Apply form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5 border-t border-brand-bg pt-3">
                  <input
                    type="text"
                    placeholder="COUPON"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green text-xs text-brand-dark font-mono uppercase rounded-lg"
                  />
                  <button type="submit" className="px-4 bg-brand-green text-white font-bold text-xs rounded-full cursor-pointer hover:bg-brand-green-dark transition-colors">
                    Apply
                  </button>
                </form>

                <div className="border-t border-brand-bg pt-3 space-y-2 text-xs font-mono text-brand-muted-green">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-brand-dark">R{cartSubtotal}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-brand-green font-semibold">
                      <span>Promo Discount ({appliedPromo.code}):</span>
                      <span>-R{cartDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Fulfillment:</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between font-bold text-brand-dark text-sm border-t border-brand-bg pt-2 font-serif">
                    <span>Grand Total:</span>
                    <span className="text-brand-green">R{cartGrandTotal}</span>
                  </div>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* --- ROUTE 6: ORDER CONFIRMATION --- */}
        {activeTab === 'order_confirmation' && confirmedOrder && (
          <div className="max-w-md mx-auto px-6 py-12 text-center space-y-6 glass-light rounded-[32px] shadow-sm my-8">
            <div className="w-16 h-16 bg-[#E8E8DF] border border-brand-border text-brand-green rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold text-brand-dark">ORDER PLACED SUCCESSFULLY</h1>
              <p className="text-xs text-brand-muted-green font-mono">Verification Code: {confirmedOrder.id}</p>
            </div>

            <div className="bg-brand-bg border border-brand-border rounded-2xl p-5 text-left text-xs space-y-4 text-brand-dark">
              <div className="border-b border-brand-border pb-2">
                <p className="text-[10px] text-brand-muted-green font-mono uppercase">Delivery Target</p>
                <p className="font-bold text-brand-dark mt-0.5">{confirmedOrder.customerName}</p>
                <p className="text-brand-muted-green font-mono">{confirmedOrder.customerEmail}</p>
              </div>

              <div className="border-b border-brand-border pb-2">
                <p className="text-[10px] text-brand-muted-green font-mono uppercase">Shipping Street Address</p>
                <p className="text-brand-dark/85 mt-0.5 leading-relaxed">{confirmedOrder.address}</p>
              </div>

              <div>
                <p className="text-[10px] text-brand-muted-green font-mono uppercase">Discreet Billing Total</p>
                <p className="font-serif font-extrabold text-base text-brand-green mt-0.5">R{confirmedOrder.total}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadSlip(confirmedOrder)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#E8E8DF] hover:bg-brand-border border border-brand-border text-brand-dark font-mono font-bold text-[10px] tracking-wider rounded-xl cursor-pointer shadow-xs transition-all"
            >
              <FileDown className="w-4 h-4 text-brand-green animate-bounce" />
              <span>DOWNLOAD DISPATCH SLIP (RECEIPT)</span>
            </button>

            <p className="text-xs text-brand-muted-green leading-relaxed font-sans max-w-xs mx-auto">
              Your registered dispatcher is preparing your order. You will receive an automated text or phone call as we approach your delivery address.
            </p>

            <button
              onClick={() => setActiveTab('shop')}
              className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-full font-sans tracking-wider cursor-pointer shadow-md transition-colors"
            >
              RETURN TO DISPENSARY
            </button>
          </div>
        )}

        {/* --- ROUTE 7: LOGIN / REGISTER --- */}
        {activeTab === 'login_screen' && (
          <div className="max-w-md mx-auto px-4 py-8 space-y-6">
            <div className="text-center">
              <h2 className="font-serif text-lg font-bold text-brand-dark">Green Leaf Access Portal</h2>
              <p className="text-[10px] text-brand-muted-green font-mono mt-0.5">Secure, state-regulated dispensary sign-in</p>
            </div>

            {/* Form Container */}
            <div className="glass-light rounded-[28px] p-6 space-y-5 shadow-sm text-brand-dark border border-brand-border/40">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-base font-bold text-brand-dark">
                  {authMode === 'login' ? 'Sign In to Account' : 'Register New Account'}
                </h3>
                <p className="text-[10px] text-brand-muted-green font-mono">
                  {authMode === 'login' 
                    ? 'Access discrete delivery and saved strains' 
                    : 'Create account to unlock legal dispatcher routes'}
                </p>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Account Password</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>

                  {authError && <p className="text-xs text-red-500 font-mono text-center">{authError}</p>}
                  {authSuccess && <p className="text-xs text-brand-green font-mono text-center">{authSuccess}</p>}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs font-sans tracking-wider rounded-full cursor-pointer shadow-md transition-colors"
                  >
                    LOG IN
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-[10px] text-brand-green hover:underline font-medium font-sans cursor-pointer uppercase tracking-wider"
                    >
                      New to Green Leaf? Register here
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sean Miller"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. user@greenleaf.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Password</label>
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Street Address (Delivery mapping)</label>
                    <input
                      type="text"
                      placeholder="e.g. 710 Green Ave, Los Angeles, CA"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                      required
                    />
                  </div>

                  {authError && <p className="text-xs text-red-500 font-mono text-center">{authError}</p>}
                  {authSuccess && <p className="text-xs text-brand-green font-mono text-center">{authSuccess}</p>}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs font-sans tracking-wider rounded-full cursor-pointer shadow-md transition-colors"
                  >
                    CREATE ACCOUNT
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-[10px] text-brand-green hover:underline font-medium font-sans cursor-pointer uppercase tracking-wider"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* --- ROUTE 8: USER PROFILE DASHBOARD --- */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-brand-dark">MY PROFILE</h1>
              <p className="text-xs text-brand-muted-green font-mono">Manage account info and review prior dispatch logs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              
              {/* Account Card */}
              <div className="md:col-span-1 glass-light rounded-[24px] p-5 space-y-4 shadow-sm text-brand-dark">
                <div className="text-center space-y-3 pb-3 border-b border-brand-bg">
                  <div className="w-16 h-16 bg-[#E8E8DF] border border-brand-border rounded-full flex items-center justify-center text-brand-green font-serif font-extrabold text-xl mx-auto shadow-sm">
                    {currentUser?.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-brand-dark text-base">{currentUser?.name}</h3>
                    <p className="text-[10px] text-brand-muted-green font-mono">{currentUser?.email}</p>
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Full Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-semibold text-brand-muted-green uppercase tracking-wider font-mono">Delivery Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-brand-bg border border-brand-border focus:outline-none focus:border-brand-green rounded-lg text-xs text-brand-dark"
                        required
                      />
                    </div>

                    {profileUpdateError && <p className="text-[10px] text-red-500 font-mono">{profileUpdateError}</p>}
                    {profileUpdateSuccess && <p className="text-[10px] text-brand-green font-mono">{profileUpdateSuccess}</p>}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-[10px] tracking-wider rounded-lg cursor-pointer"
                      >
                        SAVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-1.5 bg-brand-border hover:bg-brand-tag text-brand-dark font-medium text-[10px] tracking-wider rounded-lg cursor-pointer"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="space-y-2 text-xs">
                      <p className="text-[10px] text-brand-muted-green font-mono uppercase">Delivery Addresses</p>
                      <p className="text-brand-dark bg-brand-bg p-3.5 border border-brand-border rounded-xl font-sans leading-relaxed">
                        {currentUser?.addresses && currentUser.addresses.length > 0 ? currentUser.addresses[0] : 'None registered'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditName(currentUser?.name || '');
                        setEditAddress(currentUser?.addresses?.[0] || '');
                        setProfileUpdateError('');
                        setProfileUpdateSuccess('');
                        setIsEditingProfile(true);
                      }}
                      className="w-full py-2 bg-brand-border hover:bg-brand-tag text-brand-dark font-bold text-[10px] tracking-wider rounded-xl cursor-pointer shadow-xs transition-colors"
                    >
                      EDIT PROFILE DETAILS
                    </button>
                  </>
                )}

                {/* Theme Selector Section */}
                <div className="space-y-2 pt-3 border-t border-brand-bg">
                  <p className="text-[10px] text-brand-muted-green font-mono uppercase">Appearance Theme</p>
                  <div className="flex items-center justify-between bg-brand-bg/85 border border-brand-border p-2.5 rounded-xl">
                    <span className="text-xs font-medium text-brand-dark">
                      {theme === 'dark' ? 'Midnight Green' : 'Forest White'}
                    </span>
                    <button
                      onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                      className="p-1.5 rounded-lg bg-brand-card hover:bg-brand-tag border border-brand-border text-brand-dark transition-all duration-300 shadow-xs cursor-pointer flex items-center gap-1.5"
                      title="Toggle Theme"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-brand-gold animate-spin-slow" />
                          <span className="text-[10px] font-mono font-bold tracking-wider text-brand-dark uppercase">Light</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-brand-green" />
                          <span className="text-[10px] font-mono font-bold tracking-wider text-brand-dark uppercase">Dark</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order history */}
              <div className="md:col-span-2 glass-light rounded-[24px] p-6 space-y-4 shadow-sm text-brand-dark">
                <h3 className="font-serif font-bold text-brand-dark text-lg">Prior Dispatch Transactions</h3>
                
                <div className="space-y-3">
                  {orders.filter((o) => o.userId === currentUser?.id).length === 0 ? (
                    <p className="text-xs text-brand-muted-green font-mono italic">No transaction records filed under this profile yet.</p>
                  ) : (
                    orders
                      .filter((o) => o.userId === currentUser?.id)
                      .map((o) => {
                        const isExpanded = expandedOrderId === o.id;
                        return (
                          <div key={o.id} className="bg-brand-bg rounded-xl border border-brand-border overflow-hidden transition-all duration-300">
                            {/* Header row click toggles expanded */}
                            <div
                              onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                              className="p-3.5 flex items-center justify-between text-xs text-brand-dark cursor-pointer hover:bg-brand-tag/30 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] text-brand-muted-green font-mono transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                                <div>
                                  <p className="font-bold font-mono text-brand-dark flex items-center gap-1.5">
                                    <span>#{o.id.substring(0, 8)}...</span>
                                    <span className="text-[9px] font-mono font-normal text-brand-muted-green">({o.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                  </p>
                                  <p className="text-[10px] text-brand-muted-green font-mono mt-0.5">{new Date(o.date).toLocaleDateString()} at {new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                              </div>
                              
                              <div className="text-right font-sans">
                                <span className="font-bold text-brand-dark font-mono block">R{o.total}</span>
                                <span className={`text-[9px] font-mono font-bold uppercase ${
                                  o.status === 'Pending' ? 'text-amber-600' : 'text-brand-green'
                                }`}>{o.status}</span>
                              </div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-brand-border/40 space-y-3 bg-white/40">
                                <div className="space-y-2">
                                  <p className="text-[9px] font-bold text-brand-muted-green font-mono uppercase tracking-widest border-b border-brand-bg pb-1">Items Dispatch Log</p>
                                  <div className="space-y-1.5">
                                    {o.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-mono text-brand-muted-green">{item.quantity}x</span>
                                          <span className="text-brand-dark font-medium">{item.product.name}</span>
                                          <span className="text-[9px] font-mono text-brand-muted-green capitalize">({item.product.strainType})</span>
                                        </div>
                                        <span className="font-mono text-brand-dark font-semibold">R{item.product.price * item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="text-[11px] font-sans text-brand-dark space-y-1 pt-1.5 border-t border-brand-bg">
                                  <p className="flex justify-between">
                                    <span className="text-brand-muted-green font-mono uppercase text-[9px]">Fulfillment:</span>
                                    <span className="font-medium">{o.deliveryOption === 'delivery' ? 'Courier Delivery' : 'In-Store Pickup'}</span>
                                  </p>
                                  {o.deliveryOption === 'delivery' && (
                                    <p className="flex justify-between">
                                      <span className="text-brand-muted-green font-mono uppercase text-[9px]">Address:</span>
                                      <span className="font-medium text-right max-w-[200px] truncate" title={o.address}>{o.address}</span>
                                    </p>
                                  )}
                                  {o.promoApplied && (
                                    <p className="flex justify-between">
                                      <span className="text-brand-green font-mono uppercase text-[9px] font-semibold">Promo Applied:</span>
                                      <span className="text-brand-green font-bold text-xs">{o.promoApplied}</span>
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadSlip(o)}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-bg hover:bg-[#E8E8DF] border border-brand-border text-brand-dark font-mono font-bold text-[9px] tracking-wider rounded-lg cursor-pointer transition-colors mt-2"
                                >
                                  <FileDown className="w-3.5 h-3.5 text-brand-green" />
                                  <span>DOWNLOAD RECEIPT SLIP</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- ROUTE 8.5: ADMIN COMPLIANCE ONBOARDING SIGNUP --- */}
        {activeTab === 'admin_signup' && (
          <AdminSignup
            onSuccess={(adminUser) => {
              setCurrentUser(adminUser);
              setActiveTab('admin');
              setAdminSubTab('overview');
            }}
            onCancel={() => {
              setActiveTab('shop');
            }}
          />
        )}

        {/* --- ROUTE 9: ADMIN CONTROL HUB --- */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            {/* Admin view routing */}
            {adminSubTab === 'overview' && (
              <AdminOverview
                products={products}
                orders={orders}
                onRestockProduct={handleRestockProduct}
                promoCodes={promoCodes}
                onAddPromo={handleAddPromo}
                onRemovePromo={handleRemovePromo}
                homepageBanner={homepageBanner}
                onUpdateBanner={updateBannerServer}
              />
            )}

            {adminSubTab === 'products' && (
              <AdminProducts
                products={products}
                onCreateProduct={handleCreateProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {adminSubTab === 'orders' && (
              <AdminOrders orders={orders} onUpdateOrderStatus={handleUpdateOrderStatus} />
            )}

            {adminSubTab === 'users' && (
              <AdminUsers users={users} onToggleUserStatus={handleToggleUserStatus} />
            )}

          </div>
        )}

      </main>

      {/* 4. Active Drawer: SHOPPING CART SLIDE OVER (MAXIMIZED VIEW) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-0 sm:p-4 md:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-brand-dark/50 backdrop-blur-md transition-opacity animate-fade-in" onClick={() => setIsCartOpen(false)} />
          
          {/* Maximized Cart Panel */}
          <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] max-w-5xl glass-light sm:rounded-[32px] flex flex-col justify-between shadow-2xl overflow-hidden z-10 transition-all">
            
            {/* Header */}
            <div className="p-6 bg-brand-bg border-b border-brand-border flex items-center justify-between text-brand-dark shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center">
                  <CartIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base sm:text-lg text-brand-dark leading-none">Your Premium Order Cart</h3>
                  <p className="text-[10px] text-brand-muted-green font-mono uppercase tracking-wider mt-1">Review items before licensed state dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-brand-muted-green hover:text-brand-dark cursor-pointer p-2 rounded-full hover:bg-brand-border/40 transition-all border border-brand-border/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Grid Content for Maximized Space */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {cart.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[350px] space-y-4">
                  <div className="w-16 h-16 bg-brand-bg border border-brand-border/80 rounded-full flex items-center justify-center text-brand-muted-green shadow-xs">
                    <ShoppingBag className="w-8 h-8 text-brand-muted-green" />
                  </div>
                  <div>
                    <h4 className="text-brand-dark font-serif font-bold text-base">Your Cart is Empty</h4>
                    <p className="text-brand-muted-green text-xs mt-1 max-w-sm">
                      Explore our gourmet dispensary flower and select state-certified strains to add to your order.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-full text-xs font-sans tracking-wide cursor-pointer transition-all shadow-sm"
                  >
                    RETURN TO MENU
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 min-h-0 overflow-hidden">
                  {/* Left: Scrollable cart items */}
                  <div className="flex-1 lg:col-span-7 p-4 sm:p-6 space-y-4 lg:border-r border-brand-border overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                      <span className="text-xs font-mono font-bold text-brand-muted-green uppercase">Selected Strains & Infusions</span>
                      <span className="text-xs font-mono font-bold text-brand-dark bg-brand-tag px-2.5 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)} Units</span>
                    </div>
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3 sm:p-4 bg-brand-bg border border-brand-border rounded-2xl flex gap-3 sm:gap-4 relative text-brand-dark shadow-sm hover:border-brand-green/30 transition-all"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-brand-border bg-white shadow-xs">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] text-brand-muted-green font-mono uppercase tracking-widest font-bold">{item.product.brand}</p>
                            <h4 className="font-serif font-bold text-brand-dark text-xs sm:text-sm truncate mt-0.5">{item.product.name}</h4>
                            <p className="text-brand-dark text-xs font-mono font-bold mt-1">
                              R{item.product.price} <span className="text-[10px] text-brand-muted-green font-normal">/ unit</span>
                            </p>
                          </div>
                          
                          {/* Quantity updates */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-white hover:bg-[#E8E8DF] text-brand-dark rounded-full flex items-center justify-center text-xs font-bold border border-brand-border cursor-pointer transition-colors shadow-xs"
                            >
                              -
                            </button>
                            <span className="text-xs text-brand-dark font-mono font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 sm:w-6 sm:h-6 bg-white hover:bg-[#E8E8DF] text-brand-dark rounded-full flex items-center justify-center text-xs font-bold border border-brand-border cursor-pointer transition-colors shadow-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-brand-muted-green hover:text-rose-500 hover:bg-rose-50 rounded-full cursor-pointer transition-all border border-transparent hover:border-rose-100"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Right: Order pricing breakdown (minimized on mobile, rich on desktop) */}
                  <div className="lg:col-span-5 p-4 sm:p-6 bg-brand-bg/50 flex flex-col justify-between shrink-0 border-t lg:border-t-0 border-brand-border">
                    {/* Desktop-Only breakdown to maximize products space on mobile */}
                    <div className="hidden lg:block space-y-4">
                      <span className="text-xs font-mono font-bold text-brand-muted-green uppercase block pb-3 border-b border-brand-border/60">Cart Summary & Mathematics</span>
                      
                      <div className="space-y-3 text-xs font-mono text-brand-muted-green">
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-brand-border/40">
                          <span>Strain Subtotal:</span>
                          <span className="text-brand-dark font-bold text-sm">R{cartSubtotal}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-brand-border/40">
                          <span>Excise & State Tax:</span>
                          <span className="text-brand-green font-bold text-[10px] uppercase tracking-wider bg-brand-green/10 px-2 py-0.5 rounded">COMPLIMENTARY</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-brand-border/40">
                          <span>Secure Courier Dispatch:</span>
                          <span className="text-brand-green font-bold text-[10px] uppercase tracking-wider bg-brand-green/10 px-2 py-0.5 rounded">FREE SHIPPING</span>
                        </div>
                      </div>

                      {/* State Regulatory Compliance Notice */}
                      <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[10px] text-amber-700 leading-relaxed font-sans flex gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <span>All orders require valid government ID and state signature upon physical delivery. Daily weight limits apply.</span>
                      </div>
                    </div>

                    {/* Minimized bottom summary footer for Mobile, standard at bottom for Desktop */}
                    <div className="space-y-3 lg:space-y-4 lg:pt-4 lg:border-t lg:border-brand-border/60">
                      {/* Compact inline summary row for mobile screens */}
                      <div className="flex lg:hidden items-center justify-between text-[11px] font-mono text-brand-muted-green px-1">
                        <span>Strain Subtotal: R{cartSubtotal}</span>
                        <span className="text-brand-green font-bold uppercase tracking-wider bg-brand-green/10 px-2 py-0.5 rounded">FREE DISPATCH</span>
                      </div>

                      {/* Flex layout for mobile total + checkout button side-by-side */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col shrink-0">
                          <span className="text-[9px] uppercase tracking-widest text-brand-muted-green font-mono font-bold">Grand Total</span>
                          <span className="text-brand-green text-xl sm:text-2xl font-mono font-black leading-none mt-0.5">R{cartSubtotal}</span>
                        </div>

                        <button
                          onClick={() => {
                            if (!currentUser) {
                              setIsCartOpen(false);
                              setAuthRole('customer');
                              setAuthMode('login');
                              setAuthError('Please sign in or register a customer account to proceed with checkout.');
                              setActiveTab('login_screen');
                              return;
                            }
                            setIsCartOpen(false);
                            // Pre-populate checkout details if customer is logged in
                            setCheckoutName(currentUser.name);
                            setCheckoutEmail(currentUser.email);
                            if (currentUser.addresses && currentUser.addresses.length > 0) {
                              setShippingAddress(currentUser.addresses[0]);
                            }
                            setActiveTab('checkout');
                          }}
                          className="flex-1 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-center font-sans tracking-widest uppercase text-xs cursor-pointer shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                        >
                          <span>CHECKOUT</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* 5. Product Detail Modal Overlay */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
