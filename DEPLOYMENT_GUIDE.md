# FrozenShield Deployment Guide 🛡️

Complete guide to deploy FrozenShield to production with Vercel and Railway.

---

## 🚀 Recommended Deployment Strategy

Since FrozenShield is a **fullstack application** with:
- Complex backend (Express.js, database, PDF generation, email)
- Frontend (React + Vite)
- Database requirements (PostgreSQL in production)

**Best Approach:**
1. **Frontend → Vercel** (Free, fast CDN, auto-deploy from GitHub)
2. **Backend → Railway** (Free tier available, supports PostgreSQL, Node.js)

---

## 📋 Pre-Deployment Checklist

### ✅ Before You Start

- [ ] GitHub repository set up and pushed
- [ ] Create Vercel account (https://vercel.com)
- [ ] Create Railway account (https://railway.app)
- [ ] Get Mapbox token (https://account.mapbox.com/)
- [ ] SMTP credentials ready (Gmail, SendGrid, etc.)

---

## 🎯 Part 1: Deploy Backend to Railway

Railway is perfect for fullstack Node.js apps with databases.

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `charlesfaubert44-wq/YKBay`
4. Railway will detect it's a Node.js app

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway creates a PostgreSQL instance automatically
4. Connection string will be auto-generated

### Step 4: Configure Environment Variables

In Railway project settings, add these variables:

```bash
# Database (Railway auto-provides DATABASE_URL)
# No need to add manually - Railway sets this automatically

# Server Configuration
PORT=3002
NODE_ENV=production
HOST=0.0.0.0

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# SMTP Configuration (for email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 5: Set Root Directory

Railway needs to know where your backend is:

1. Go to **Settings** → **Root Directory**
2. Set to: `/` (keep as root)
3. Railway will use the root package.json

### Step 6: Deploy

1. Click **"Deploy"**
2. Railway builds and deploys automatically
3. You'll get a URL like: `https://your-app.up.railway.app`
4. Click **"Generate Domain"** to get a public URL

### Step 7: Initialize Database

After deployment, run database setup:

1. Go to Railway project → **Your service**
2. Click **"Settings"** → **"Variables"**
3. Copy the `DATABASE_URL`
4. Use Railway CLI or run setup manually:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run database setup
railway run node server/scripts/setupDatabase.js
```

**✅ Backend Deployed!** Note your Railway URL (e.g., `https://frozenshield-api.up.railway.app`)

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import: `charlesfaubert44-wq/YKBay`
3. Vercel detects it's a monorepo

### Step 3: Configure Build Settings

**Root Directory:**
```
client
```

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

### Step 4: Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

```bash
# Backend API URL (from Railway deployment)
VITE_API_URL=https://frozenshield-api.up.railway.app

# Mapbox Token (get from https://account.mapbox.com/)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxx

# Environment
VITE_APP_ENV=production
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys automatically
3. You'll get a URL like: `https://your-app.vercel.app`

### Step 6: Update Backend CORS

Go back to **Railway** and update the `FRONTEND_URL` environment variable:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy backend for CORS to work correctly.

**✅ Frontend Deployed!**

---

## 🔗 Part 3: Connect Frontend & Backend

### Update Backend Environment

In Railway, update:
```bash
FRONTEND_URL=https://frozenshield.vercel.app
```

### Update Frontend Environment

In Vercel, update:
```bash
VITE_API_URL=https://frozenshield-api.up.railway.app
```

### Test the Connection

1. Visit your Vercel URL
2. Try to register/login
3. Create a trip
4. Test PDF export
5. Check email sharing (if SMTP configured)

---

## 🎨 Part 4: Custom Domain (Optional)

### For Frontend (Vercel)

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain: `frozenshield.ca`
3. Update DNS records as instructed
4. Vercel auto-provisions SSL certificate

### For Backend (Railway)

1. Go to Railway project → **Settings** → **Networking**
2. Add custom domain: `api.frozenshield.ca`
3. Update DNS with CNAME to Railway
4. SSL auto-configured

---

## 📊 Deployment Status Check

### Backend Health Check

Visit: `https://your-railway-url.up.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "service": "FrozenShield API"
}
```

### Frontend Health Check

Visit: `https://your-vercel-url.vercel.app`

Should display FrozenShield homepage with logo and branding.

---

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution:** Ensure `FRONTEND_URL` in Railway matches your Vercel URL exactly

### Issue: API Calls Fail

**Solution:** Check `VITE_API_URL` in Vercel environment variables

### Issue: Database Connection Fails

**Solution:** Railway auto-provides `DATABASE_URL`. Don't override it.

### Issue: Build Fails on Vercel

**Solution:**
- Verify Root Directory is set to `client`
- Ensure all dependencies are in `client/package.json`
- Check build logs for specific errors

### Issue: Email Not Sending

**Solution:**
- Verify SMTP credentials in Railway
- For Gmail, use App Passwords (not regular password)
- Enable "Less secure app access" or use OAuth2

---

## 💰 Cost Breakdown

### Free Tier Limits

**Vercel (Frontend):**
- ✅ Free forever for personal projects
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ Automatic HTTPS

**Railway (Backend + Database):**
- ✅ $5 free credit/month
- ✅ ~500 hours runtime (always-on possible)
- ✅ PostgreSQL included
- ✅ 1GB storage
- ⚠️ After free credit: ~$5-10/month

**Total:** Free to start, ~$5-10/month after free credits

---

## 🔄 Auto-Deploy Setup

Both Vercel and Railway auto-deploy when you push to GitHub:

### Vercel Auto-Deploy

1. Push to `main` branch
2. Vercel detects changes
3. Builds and deploys automatically
4. Live in ~2 minutes

### Railway Auto-Deploy

1. Push to `main` branch
2. Railway detects changes
3. Builds and deploys automatically
4. Live in ~3-5 minutes

---

## 📱 Post-Deployment Testing Checklist

- [ ] Visit frontend URL - loads correctly
- [ ] Register new account - works
- [ ] Login - works
- [ ] View map - displays (with Mapbox token)
- [ ] Create trip - saves to database
- [ ] Export trip to PDF - downloads
- [ ] Email trip plan - sends (with SMTP)
- [ ] Test on mobile - responsive
- [ ] Test all 16 activity types - work
- [ ] Emergency contacts - save correctly
- [ ] Equipment checklist - generates

---

## 🚨 Quick Deploy Commands

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from root
cd "c:\Users\Charles\Desktop\Oct29\YK Bay"

# Deploy (Vercel will prompt for settings)
vercel

# Deploy to production
vercel --prod
```

### Option 2: Using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

---

## 🎯 Alternative: All-in-One Deployment (Render.com)

If you prefer one platform for everything:

### Render.com Setup

1. Go to https://render.com
2. Create **Web Service** for backend
3. Create **Static Site** for frontend
4. Add **PostgreSQL** database
5. Connect GitHub repo
6. Configure environment variables
7. Deploy both services

**Cost:** Free tier available, then ~$7/month per service

---

## 📞 Support & Resources

### Documentation
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

### Get Help
- Vercel Discord: https://vercel.com/discord
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repo

---

## ✅ Deployment Complete!

Once deployed, your application will be accessible at:

**Frontend:** `https://frozenshield.vercel.app`
**Backend:** `https://frozenshield-api.up.railway.app`

Share your URLs with testers and start collecting feedback!

---

**🛡️ FrozenShield is now live and ready for production use!**
