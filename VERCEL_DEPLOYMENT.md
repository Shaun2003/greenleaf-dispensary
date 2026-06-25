# Vercel Deployment Guide - GreenLeaf Dispensary

## Overview

The app was failing on Vercel because API endpoints were returning 404 errors. This happened because Vercel wasn't configured to run the Express backend server.

## What Was Fixed

### 1. **Created Serverless API Handler** (`api/index.ts`)
   - Extracted Express API logic into a Vercel-compatible serverless function
   - Handles all API endpoints: `/api/products`, `/api/auth/login`, `/api/banner`, etc.
   - Uses `/tmp/db.json` for persistent database (Vercel's ephemeral filesystem)
   - Exports Express app as the default handler

### 2. **Updated `vercel.json` Configuration**
   - Tells Vercel to build with Vite
   - Configures `api/index.ts` as a serverless function
   - Sets up rewrites to route API calls to the function
   - Routes non-API requests to `index.html` for SPA routing

### 3. **Updated TypeScript Types** (`src/types.ts`)
   - Added optional `password` field to `User` interface
   - Allows authentication to work with password verification

### 4. **Added `.vercelignore`**
   - Excludes unnecessary files from deployment
   - Reduces build size and deployment time

## Files Modified/Created

```
✅ api/index.ts (NEW) - Serverless function handler
✅ vercel.json (UPDATED) - Deployment configuration
✅ .vercelignore (NEW) - Deployment ignore rules
✅ src/types.ts (UPDATED) - Added password field to User
✅ package.json (UPDATED) - Added @vercel/node as dev dependency
```

## Redeployment Steps

### 1. **Install Dependencies Locally** (if not already done)
```bash
npm install
```

### 2. **Test Locally First**
```bash
# Run development server
npm run dev

# In another terminal, test an API endpoint
curl http://localhost:3000/api/products
```

### 3. **Push to GitHub**
```bash
git add .
git commit -m "fix: configure Vercel deployment with serverless API"
git push origin main
```

### 4. **Redeploy on Vercel**
- Go to [vercel.com](https://vercel.com)
- Select your GreenLeaf Dispensary project
- Click "Deployments"
- Click the three dots (•••) on the most recent failed deployment
- Select "Redeploy"

**OR** simply push to GitHub and Vercel will auto-deploy.

### 5. **Verify Deployment**
Once deployed, test the endpoints:
```bash
# Replace YOUR_VERCEL_URL with your actual Vercel URL
curl https://YOUR_VERCEL_URL/api/products
curl https://YOUR_VERCEL_URL/api/banner
```

## Environment Variables

Make sure these are set in your Vercel project settings:

- `GEMINI_API_KEY` — Your Google Gemini API key (required for AI recommendations)
- `SUPABASE_URL` — (Optional) Supabase database URL
- `SUPABASE_KEY` — (Optional) Supabase API key

### To Set in Vercel:
1. Go to your project → Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your value
3. Redeploy

## Database Persistence

**Important:** The database uses `/tmp/db.json` which is **ephemeral on Vercel**. This means:
- Data persists during a deployment
- Data is lost when the function instance is recycled (typically daily or after inactivity)

### For Production Use:
To persist data long-term, integrate Supabase or another database service:

```bash
# Database options:
1. Supabase (recommended) - PostgreSQL with free tier
2. Firebase Realtime Database
3. MongoDB Atlas
4. AWS DynamoDB
```

Currently, the code has optional Supabase integration. To enable it, set the `SUPABASE_URL` and `SUPABASE_KEY` environment variables.

## Common Issues & Fixes

### Issue: "404 Not Found" on API endpoints
**Fix:** This deployment now resolves that issue. If it persists:
1. Clear Vercel cache: Project Settings → Git → Redeploy
2. Check that `api/index.ts` exists
3. Verify environment variables are set

### Issue: "Function Execution Timeout"
**Fix:** Increase timeout in `vercel.json`:
```json
"functions": {
  "api/index.ts": {
    "maxDuration": 120  // Increase to 120 seconds
  }
}
```

### Issue: "Database not saving data"
**Fix:** Use persistent database integration (Supabase, Firebase, etc.)

## Testing Endpoints

### Get All Products
```bash
GET /api/products
```

### Get Banner
```bash
GET /api/banner
```

### Login
```bash
POST /api/auth/login
Body: {
  "email": "admin@greenleaf.com",
  "password": "admin123",
  "adminCode": "LEAF_ADMIN_2026"
}
```

### Register
```bash
POST /api/auth/register
Body: {
  "email": "customer@example.com",
  "password": "password123"
}
```

### Update Banner (Admin)
```bash
PUT /api/banner
Body: {
  "banner": "🎉 New promotional message"
}
```

## Production Recommendations

1. **Use a Real Database** — Replace the JSON file with PostgreSQL (Supabase) or MongoDB
2. **Enable HTTPS** — Vercel handles this automatically
3. **Add Rate Limiting** — Prevent API abuse
4. **Environment-Specific Configs** — Use different configs for dev/staging/production
5. **Monitor Performance** — Check Vercel Analytics
6. **Security Hardening** — Implement proper password hashing (bcrypt), JWT tokens

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP Request
       ↓
┌──────────────────────┐
│  Vercel CDN/Routing  │
└──────┬───────────────┘
       │
       ├─→ /api/* → Serverless Function (api/index.ts)
       │
       └─→ /* → Static Files (index.html for SPA routing)
```

## Support

For questions or issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Express.js Guide](https://expressjs.com)
3. Check [Vite Documentation](https://vitejs.dev)

---

**Deployment Version:** 2.0 (Vercel Serverless Functions)  
**Last Updated:** 2026-06-25
