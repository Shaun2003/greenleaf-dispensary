<div align="center">
<img width="1200" height="300" alt="GreenLeaf Dispensary Banner" src="https://images.unsplash.com/photo-1612528443702-f6741f3a6f1f?w=1200&h=300&fit=crop" />
</div>

# 🌿 GreenLeaf Dispensary

A premium, state-licensed cannabis eCommerce platform featuring age verification, AI-powered strain recommendations, comprehensive inventory management, and secure customer checkout. Built with React 19, TypeScript, Vite, Express.js, and Google Gemini AI.

**Live Features:**
- 🛍️ **Premium Cannabis Marketplace** — Browse flower, edibles, concentrates, vapes, and CBD wellness products
- 🤖 **AI Strain Sommelier** — Powered by Google Gemini, provides personalized strain recommendations based on desired effects
- 📦 **Shopping Cart & Checkout** — Secure checkout with customer authentication and address management
- 🎯 **Advanced Filtering** — Search by strain type (Indica/Sativa/Hybrid), product category, THC/CBD potency, and effects
- ⚖️ **Regulatory Compliance** — Age verification (21+), state licensing info, and compliance documentation
- 🔐 **Secure Admin Panel** — Product inventory management, order tracking, user accounts, and promotional campaigns
- 💾 **Data Persistence** — Backend API with database storage for products, orders, users, and content

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create `.env.local` in the project root with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

Get your free Gemini API key from [ai.google.dev](https://ai.google.dev)

### 3. Run Development Server
```bash
npm run dev
```

The app will run on **http://localhost:3000**

### 4. Access Admin Panel
- Navigate to "Sign In" → "Admin"
- **Email:** `admin@greenleaf.com`
- **Password:** `admin123`
- **Admin Code:** `LEAF_ADMIN_2026`

---

## 📱 Key Features

### Customer Experience
| Feature | Description |
|---------|-------------|
| **Age Gate** | Mandatory 21+ age verification on entry |
| **Product Browsing** | Filter by category, strain type, potency, and effects |
| **AI Sommelier** | Chat with Gemini AI to find strains matching your mood/needs |
| **Product Details** | THC/CBD testing, brand info, terpene profiles, customer reviews |
| **Wishlist** | Save favorite products for later |
| **Shopping Cart** | Review order before checkout with secure payment flow |
| **Account Dashboard** | Track orders, manage addresses, view order history |

### Admin Control Hub
| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of sales, popular products, and pending orders |
| **Inventory Management** | Add/edit/delete products with THC/CBD testing data |
| **Orders Log** | View all customer orders with fulfillment status |
| **User Accounts** | Manage customer profiles and admin access |
| **Banner CMS** | Update promotional banners in real-time across all views |
| **Promo Codes** | Create and track discount campaigns |

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Build Tool:** Vite 6.2.3 with HMR
- **Backend:** Express.js with Node.js
- **Database:** JSON (db.json) with optional Supabase integration
- **AI:** Google Gemini API for strain recommendations
- **Icons:** Lucide React
- **State:** React hooks (useState, useEffect)
- **Styling:** Custom Tailwind design system with brand colors

### Brand Colors
```css
brand-green: #2ecc71 (Primary)
brand-dark: #1a5f3f (Dark Green)
brand-bg: #f5f1e8 (Off-white)
brand-border: #ddd5c8 (Border)
brand-muted-green: #6b9e7f (Muted)
```

---

## 📁 Project Structure

```
greenleaf-dispensary/
├── src/
│   ├── App.tsx                 # Main component (routing, state management)
│   ├── main.tsx               # React DOM entry point
│   ├── types.ts               # TypeScript interfaces
│   ├── index.css              # Global styles
│   └── components/
│       ├── Navbar.tsx          # Header navigation
│       ├── AgeGate.tsx         # 21+ verification
│       ├── AdminSignup.tsx     # Admin login/register
│       ├── AdminOverview.tsx   # Dashboard stats & banner CMS
│       ├── AdminProducts.tsx   # Inventory manager
│       ├── AdminOrders.tsx     # Order tracking
│       ├── AdminUsers.tsx      # User management
│       ├── AISommelier.tsx     # Gemini AI chat interface
│       ├── Educate.tsx         # Educational content
│       ├── ProductDetailModal.tsx # Product modal view
│       └── ...
├── server.ts                  # Express backend (API endpoints)
├── db.json                    # Local database (products, orders, users, banner)
├── index.html                 # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS config
├── package.json              # Dependencies
└── public/
    └── favicon.svg           # App icon
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` — Customer/Admin login
- `POST /api/auth/register` — New customer registration
- `POST /api/auth/admin-register` — Admin registration (requires admin code)

### Products
- `GET /api/products` — Fetch all products
- `POST /api/products` — Create product (admin only)
- `PUT /api/products/:id` — Update product (admin only)
- `DELETE /api/products/:id` — Delete product (admin only)

### Orders
- `GET /api/orders` — Fetch all orders
- `POST /api/orders` — Create new order
- `PUT /api/orders/:id` — Update order status (admin only)

### AI Recommendations
- `POST /api/ai-recommendations` — Get Gemini AI strain recommendations

### Banner CMS
- `GET /api/banner` — Fetch current promotional banner
- `PUT /api/banner` — Update banner (admin only)

### Users
- `GET /api/users` — Fetch all users (admin only)
- `PUT /api/users/:id` — Update user profile

---

## 🔐 Security & Compliance

✅ **Age Verification** — Mandatory 21+ gate enforces legal requirements  
✅ **Admin Authentication** — Two-factor validation (email/password + admin code)  
✅ **Regulatory Compliance** — Displays state licensing, testing results, and warning labels  
✅ **Data Persistence** — Order history and customer data stored securely  
✅ **HTTPS Ready** — Compatible with production SSL/TLS deployment  

---

## 🚀 Development Commands

```bash
# Start development server (HMR enabled)
npm run dev

# Type check (TypeScript)
npm run lint

# Build for production
npm run build

# Start production server
npm start

# Clean build artifacts and database
npm run clean
```

---

## 🎨 Responsive Design

The app is fully responsive with mobile-first breakpoints:
- **Mobile:** 320px - 640px
- **Tablet:** 641px - 1024px
- **Desktop:** 1025px+

All components use Tailwind's `sm:` and `lg:` breakpoints for optimal viewing on any device.

---

## 📝 License

This project is proprietary software for GreenLeaf Dispensary. All rights reserved.

---

## 📞 Support

For issues, questions, or feature requests, please contact the development team.

**GreenLeaf Dispensary** — Premium Cannabis, Licensed & Tested ✓
